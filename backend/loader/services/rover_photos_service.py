"""
Service responsible for fetching and syncing NASA Mars Rover Photos API assets.
"""
import logging
from typing import Dict, List, Optional

from loader.domain.dtos import MediaDTO, SyncStatsDTO
from loader.domain.mappers import NASAJsonMapper
from loader.infrastructure.nasa_client import NASAClient
from loader.repositories.base import INASAIngestRepository

logger = logging.getLogger('loader.services.rover_photos')

# Artifact ID -> (NASA Rover Name, Key Sol)
KEY_ROVER_SOLS: Dict[str, tuple[str, int]] = {
    'opportunity-rover': ('opportunity', 5111),
    'spirit-rover': ('spirit', 2210),
}


class RoverPhotosIngestService:
    """Service to fetch and sync Mars rover photos from api.nasa.gov."""

    def __init__(self, client: NASAClient, repository: INASAIngestRepository):
        self.client = client
        self.repository = repository

    def sync_rover_photos(
        self,
        artifact_id: str,
        stats: SyncStatsDTO,
        sol: Optional[int] = None,
        limit: int = 5,
        dry_run: bool = False,
    ) -> List[MediaDTO]:
        rover_info = KEY_ROVER_SOLS.get(artifact_id)
        if not rover_info and not sol:
            return []

        rover_name = rover_info[0] if rover_info else artifact_id.split('-')[0]
        target_sol = sol if sol is not None else rover_info[1]

        logger.info(f"Fetching Mars Rover photos for {rover_name} on sol {target_sol}...")
        try:
            stats.api_calls_made += 1
            raw_photos = self.client.fetch_rover_photos(rover_name=rover_name, sol=target_sol)
            if not raw_photos:
                # If no photos on exact sol, fallback or try manifest check
                return []

            media_dtos: List[MediaDTO] = []
            for photo in raw_photos[:limit]:
                dto = NASAJsonMapper.rover_photo_to_media_dto(photo, artifact_id=artifact_id)
                media_dtos.append(dto)

            if media_dtos and not dry_run:
                inserted = self.repository.upsert_media(artifact_id, media_dtos)
                stats.media_inserted += inserted

            return media_dtos
        except Exception as e:
            logger.warning(f"Failed to sync rover photos for {artifact_id}: {e}")
            stats.errors_encountered.append(f"Rover photos ({artifact_id}): {e}")
            return []
