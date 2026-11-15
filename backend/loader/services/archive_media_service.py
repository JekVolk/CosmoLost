"""
Service responsible for fetching and enriching artifacts with media from images-api.nasa.gov.
"""
import logging
from typing import Dict, List

from loader.domain.dtos import MediaDTO, SyncStatsDTO
from loader.domain.mappers import NASAJsonMapper
from loader.infrastructure.nasa_client import NASAClient
from loader.media_catalog import ALL_MEDIA_QUERIES, ALL_SEED_MEDIA
from loader.repositories.base import INASAIngestRepository

logger = logging.getLogger('loader.services.archive_media')

CURATED_MEDIA_QUERIES: Dict[str, List[tuple[str, str]]] = ALL_MEDIA_QUERIES
CURATED_SEED_MEDIA: Dict[str, List[MediaDTO]] = ALL_SEED_MEDIA


class ArchiveMediaIngestService:
    """Service to fetch historical and orbital imagery from NASA Image and Video Library."""

    def __init__(self, client: NASAClient, repository: INASAIngestRepository):
        self.client = client
        self.repository = repository

    def sync_artifact_media(
        self,
        artifact_id: str,
        stats: SyncStatsDTO,
        limit_per_query: int = 2,
        dry_run: bool = False,
    ) -> List[MediaDTO]:
        queries = CURATED_MEDIA_QUERIES.get(artifact_id, [])
        all_media: List[MediaDTO] = []

        if queries:
            for query_str, category in queries:
                try:
                    stats.api_calls_made += 1
                    items = self.client.search_archive_images(query=query_str, limit=limit_per_query)
                    for item in items:
                        dto = NASAJsonMapper.archive_item_to_media_dto(
                            item=item,
                            artifact_id=artifact_id,
                            media_category=category,
                        )
                        all_media.append(dto)
                except Exception as e:
                    logger.warning(f"Error querying archive media for {artifact_id} ('{query_str}'): {e}")
                    stats.errors_encountered.append(f"Archive media ({artifact_id}): {e}")

        # Fallback to curated seed media if NASA API query returned no items
        if not all_media:
            seeds = CURATED_SEED_MEDIA.get(artifact_id, [])
            if seeds:
                all_media.extend(seeds)

        if all_media and not dry_run:
            inserted = self.repository.upsert_media(artifact_id, all_media)
            stats.media_inserted += inserted

        return all_media
