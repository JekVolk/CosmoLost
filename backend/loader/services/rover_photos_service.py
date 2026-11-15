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
    'sojourner-rover': ('sojourner', 30),
    'curiosity-rover': ('curiosity', 1000),
    'perseverance-rover': ('perseverance', 500),
}

# Curated seed photos for offline fallback or when Mars Photos API is unavailable
CURATED_SEED_ROVER_PHOTOS: Dict[str, List[MediaDTO]] = {
    'opportunity-rover': [
        MediaDTO(
            artifact_id='opportunity-rover',
            media_category='LAST_KNOWN_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA23000.jpg',
            nasa_id_or_pia='PIA23000-oppy-last',
            caption='Opportunity final 360-degree panorama from Perseverance Valley before the 2018 global dust storm.',
            credit='NASA/JPL-Caltech/Cornell/ASU',
        ),
        MediaDTO(
            artifact_id='opportunity-rover',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA05556.jpg',
            nasa_id_or_pia='PIA05556-oppy-blueberries',
            caption='Microscopic Imager view of spherical hematite "blueberries" in Eagle Crater.',
            credit='NASA/JPL/Cornell/USGS',
        ),
    ],
    'spirit-rover': [
        MediaDTO(
            artifact_id='spirit-rover',
            media_category='LAST_KNOWN_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA05200.jpg',
            nasa_id_or_pia='PIA05200-spirit-home',
            caption='Spirit rover view looking back toward Columbia Memorial Station in Gusev Crater.',
            credit='NASA/JPL-Caltech',
        ),
        MediaDTO(
            artifact_id='spirit-rover',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA10214.jpg',
            nasa_id_or_pia='PIA10214-spirit-silica',
            caption='Bright soil churned up by Spirit rover wheels revealing 90% pure opaline silica at Home Plate.',
            credit='NASA/JPL-Caltech/Cornell',
        ),
    ],
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
        if not rover_info and not sol and not artifact_id.endswith('-rover'):
            return []

        rover_name = rover_info[0] if rover_info else artifact_id.replace('-rover', '')
        target_sol = sol if sol is not None else (rover_info[1] if rover_info else 0)

        logger.info(f"Fetching Mars Rover photos for {rover_name} on sol {target_sol}...")
        try:
            stats.api_calls_made += 1
            raw_photos = self.client.fetch_rover_photos(
                rover_name=rover_name,
                sol=target_sol,
                limit=limit,
            )
            media_dtos: List[MediaDTO] = []

            if raw_photos:
                for photo in raw_photos[:limit]:
                    dto = NASAJsonMapper.rover_photo_to_media_dto(photo, artifact_id=artifact_id)
                    media_dtos.append(dto)
            else:
                # Fallback to curated seed photos when live endpoint returns no data or 404
                seed_photos = CURATED_SEED_ROVER_PHOTOS.get(artifact_id, [])
                if seed_photos:
                    logger.info(f"Using {len(seed_photos)} curated seed rover photos for {artifact_id}.")
                    media_dtos.extend(seed_photos)

            if media_dtos and not dry_run:
                inserted = self.repository.upsert_media(artifact_id, media_dtos)
                stats.media_inserted += inserted

            return media_dtos
        except Exception as e:
            logger.warning(f"Failed to sync rover photos for {artifact_id}: {e}")
            stats.errors_encountered.append(f"Rover photos ({artifact_id}): {e}")
            return []
