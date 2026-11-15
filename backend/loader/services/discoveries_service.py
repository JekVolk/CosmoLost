"""
Service responsible for populating scientific discoveries and storytelling cards.
"""
import logging
from typing import Dict, List

from loader.domain.dtos import DiscoveryDTO, SyncStatsDTO
from loader.discoveries_catalog import ALL_DISCOVERIES
from loader.repositories.base import INASAIngestRepository

logger = logging.getLogger('loader.services.discoveries')

CURATED_DISCOVERIES: Dict[str, List[DiscoveryDTO]] = ALL_DISCOVERIES


class DiscoveriesIngestService:
    """Service to ingest scientific discoveries for artifacts."""

    def __init__(self, repository: INASAIngestRepository):
        self.repository = repository

    def sync_discoveries(
        self,
        artifact_id: str,
        stats: SyncStatsDTO,
        dry_run: bool = False,
    ) -> List[DiscoveryDTO]:
        discoveries = CURATED_DISCOVERIES.get(artifact_id, [])
        if not discoveries:
            return []

        if not dry_run:
            count = self.repository.upsert_discoveries(artifact_id, discoveries)
            stats.discoveries_inserted += count

        return discoveries
