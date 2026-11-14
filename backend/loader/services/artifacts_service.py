"""
Service responsible for importing and synchronizing Artifacts.
"""
import logging
from typing import List, Optional

from loader.constants import CURATED_ARTIFACTS
from loader.domain.dtos import ArtifactDTO, SyncStatsDTO
from loader.domain.mappers import NASAJsonMapper
from loader.infrastructure.state_store import SyncStateStore
from loader.repositories.base import INASAIngestRepository

logger = logging.getLogger('loader.services.artifacts')


class ArtifactsIngestService:
    """Service to ingest and synchronize space hardware artifacts."""

    def __init__(self, repository: INASAIngestRepository, state_store: SyncStateStore):
        self.repository = repository
        self.state_store = state_store

    def sync(
        self,
        stats: SyncStatsDTO,
        target_body: Optional[str] = None,
        force: bool = False,
        dry_run: bool = False,
    ) -> List[ArtifactDTO]:
        dtos: List[ArtifactDTO] = []
        for raw in CURATED_ARTIFACTS:
            dto = NASAJsonMapper.raw_to_artifact_dto(raw)
            if target_body and dto.celestial_body_id != target_body.lower():
                continue

            dtos.append(dto)
            stats.artifacts_checked += 1

            payload = {
                'id': dto.id,
                'status': dto.operational_status,
                'lat': dto.latitude,
                'lon': dto.longitude,
                'elevation': dto.elevation_m,
                'mass': dto.mass_kg,
                'last_contact_sol': dto.last_contact_sol,
                'monologue': dto.first_person_monologue,
                'model_3d_url': dto.model_3d_url,
            }
            current_hash = self.state_store.compute_hash(payload)

            if force or self.state_store.is_changed('artifact', dto.id, current_hash):
                if not dry_run:
                    created, updated = self.repository.upsert_artifact(dto)
                    self.state_store.update_hash('artifact', dto.id, current_hash)
                    if created:
                        stats.artifacts_new += 1
                    elif updated:
                        stats.artifacts_updated += 1
                else:
                    stats.artifacts_new += 1

        logger.info(f"Artifacts sync complete. Checked: {len(dtos)}")
        return dtos
