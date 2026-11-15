"""
Service responsible for importing and synchronizing Missions dynamically from NASA APIs.
"""
import logging
from typing import List, Optional

from loader.constants import CURATED_MISSIONS
from loader.domain.dtos import MissionDTO, SyncStatsDTO
from loader.domain.mappers import NASAJsonMapper
from loader.infrastructure.nasa_client import NASAClient
from loader.infrastructure.state_store import SyncStateStore
from loader.repositories.base import INASAIngestRepository

logger = logging.getLogger('loader.services.missions')


class MissionsIngestService:
    """Service to ingest and synchronize space missions dynamically from NASA APIs."""

    def __init__(
        self,
        repository: INASAIngestRepository,
        state_store: SyncStateStore,
        client: Optional[NASAClient] = None,
    ):
        self.repository = repository
        self.state_store = state_store
        self.client = client

    def sync(
        self,
        stats: SyncStatsDTO,
        force: bool = False,
        dry_run: bool = False,
    ) -> List[MissionDTO]:
        # 1. Base curated catalog as offline fallback / baseline
        mission_dict = {raw['id']: dict(raw) for raw in CURATED_MISSIONS}

        # 2. Dynamic live API enrichment from NASA APIs
        if self.client:
            try:
                stats.api_calls_made += 1
                live_manifests = self.client.fetch_live_rover_manifests()
                mission_id_map = {
                    'curiosity': 'msl',
                    'perseverance': 'mars-2020',
                    'opportunity': 'mer-b',
                    'spirit': 'mer-a',
                }
                for m in live_manifests:
                    rover_name = m.get('name', '').lower()
                    target_id = mission_id_map.get(rover_name)
                    if target_id and target_id in mission_dict:
                        rec = mission_dict[target_id]
                        if m.get('launch_date'):
                            rec['launch_date'] = m['launch_date']
                        if m.get('landing_date'):
                            rec['landing_date'] = m['landing_date']
                        if m.get('max_date') and m.get('status') == 'complete':
                            rec['end_date'] = m['max_date']
                        logger.info(f">>> [MISSIONS] Dynamically updated {target_id} from live NASA API manifest.")
            except Exception as e:
                logger.warning(f"Live NASA mission manifest enrichment error: {e}")
                stats.errors_encountered.append(f"Mission manifest API: {e}")

        # 3. Map to DTOs, compute state hash, and upsert
        dtos: List[MissionDTO] = []
        for raw in mission_dict.values():
            dto = NASAJsonMapper.raw_to_mission_dto(raw)
            dtos.append(dto)
            stats.missions_checked += 1

            payload = {
                'id': dto.id,
                'name': dto.name,
                'agency': dto.agency,
                'nssdca_id': dto.nssdca_id,
                'launch_date': dto.launch_date,
                'landing_date': dto.landing_date,
                'end_date': dto.end_date,
                'summary': dto.summary,
            }
            current_hash = self.state_store.compute_hash(payload)

            if force or self.state_store.is_changed('mission', dto.id, current_hash):
                if not dry_run:
                    created, updated = self.repository.upsert_mission(dto)
                    self.state_store.update_hash('mission', dto.id, current_hash)
                    if created:
                        stats.missions_new += 1
                    elif updated:
                        stats.missions_updated += 1
                else:
                    stats.missions_updated += 1

        logger.info(f"Missions sync complete. Checked: {len(dtos)}")
        return dtos
