"""
Service responsible for importing and synchronizing Celestial Bodies (Moon, Mars).
"""
import logging
from typing import List, Optional

from loader.constants import CURATED_CELESTIAL_BODIES
from loader.domain.dtos import CelestialBodyDTO, SyncStatsDTO
from loader.domain.mappers import NASAJsonMapper
from loader.infrastructure.state_store import SyncStateStore
from loader.repositories.base import INASAIngestRepository

logger = logging.getLogger('loader.services.celestial_bodies')


class CelestialBodiesIngestService:
    """Service to ingest and synchronize celestial bodies."""

    def __init__(self, repository: INASAIngestRepository, state_store: SyncStateStore):
        self.repository = repository
        self.state_store = state_store

    def sync(
        self,
        stats: SyncStatsDTO,
        target_body: Optional[str] = None,
        force: bool = False,
        dry_run: bool = False,
    ) -> List[CelestialBodyDTO]:
        dtos: List[CelestialBodyDTO] = []
        for raw in CURATED_CELESTIAL_BODIES:
            body_id = str(raw.get('id', '')).lower()
            if target_body and body_id != target_body.lower():
                continue

            dto = NASAJsonMapper.raw_to_celestial_body_dto(raw)
            dtos.append(dto)
            stats.celestial_bodies_checked += 1

            payload = {
                'id': dto.id,
                'name': dto.name,
                'radius': dto.radius_km,
                'gravity': dto.gravity_ms2,
                'wmts': dto.wmts_tile_url,
            }
            current_hash = self.state_store.compute_hash(payload)

            if force or self.state_store.is_changed('body', dto.id, current_hash):
                if not dry_run:
                    created, _ = self.repository.upsert_celestial_body(dto)
                    self.state_store.update_hash('body', dto.id, current_hash)
                    if created:
                        stats.celestial_bodies_new += 1
                else:
                    stats.celestial_bodies_new += 1

        logger.info(f"Celestial bodies sync complete. Checked: {len(dtos)}")
        return dtos
