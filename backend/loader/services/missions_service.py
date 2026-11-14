"""
Service responsible for importing and synchronizing Missions.
"""
import logging
from typing import List

from loader.constants import CURATED_MISSIONS
from loader.domain.dtos import MissionDTO, SyncStatsDTO
from loader.domain.mappers import NASAJsonMapper
from loader.infrastructure.state_store import SyncStateStore
from loader.repositories.base import INASAIngestRepository

logger = logging.getLogger('loader.services.missions')


class MissionsIngestService:
    """Service to ingest and synchronize space missions."""

    def __init__(self, repository: INASAIngestRepository, state_store: SyncStateStore):
        self.repository = repository
        self.state_store = state_store

    def sync(
        self,
        stats: SyncStatsDTO,
        force: bool = False,
        dry_run: bool = False,
    ) -> List[MissionDTO]:
        dtos: List[MissionDTO] = []
        for raw in CURATED_MISSIONS:
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
