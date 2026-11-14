"""
Service responsible for fetching and enriching artifacts with media from images-api.nasa.gov.
"""
import logging
from typing import Dict, List

from loader.domain.dtos import MediaDTO, SyncStatsDTO
from loader.domain.mappers import NASAJsonMapper
from loader.infrastructure.nasa_client import NASAClient
from loader.repositories.base import INASAIngestRepository

logger = logging.getLogger('loader.services.archive_media')

# Curated queries for iconic hardware
CURATED_MEDIA_QUERIES: Dict[str, List[tuple[str, str]]] = {
    'apollo-11-descent-stage': [
        ('Apollo 11 Lunar Module Eagle surface', 'SURFACE_PHOTO'),
        ('Tranquility Base LROC orbital', 'ORBITAL'),
    ],
    'opportunity-rover': [
        ('Opportunity rover Perseverance Valley panorama', 'PANORAMA'),
        ('Opportunity rover HiRISE orbital', 'ORBITAL'),
    ],
    'spirit-rover': [
        ('Spirit rover Columbia Hills Gusev', 'SURFACE_PHOTO'),
    ],
    'insight-lander': [
        ('InSight lander Elysium Planitia SEIS', 'SURFACE_PHOTO'),
    ],
    'ingenuity-helicopter': [
        ('Ingenuity helicopter Jezero crater flight', 'SURFACE_PHOTO'),
    ],
}


# Curated seed media guarantees 100% offline hackathon availability
CURATED_SEED_MEDIA: Dict[str, List[MediaDTO]] = {
    'opportunity-rover': [
        MediaDTO(
            artifact_id='opportunity-rover',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA05556.jpg',
            nasa_id_or_pia='PIA05556',
            caption='Microscopic view of Martian blueberries at Eagle Crater.',
            credit='NASA/JPL/Cornell/USGS',
        ),
        MediaDTO(
            artifact_id='opportunity-rover',
            media_category='LAST_KNOWN_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA23000.jpg',
            nasa_id_or_pia='PIA23000',
            caption='Opportunity 360-degree panorama of Perseverance Valley.',
            credit='NASA/JPL-Caltech',
        ),
    ],
    'apollo-11-descent-stage': [
        MediaDTO(
            artifact_id='apollo-11-descent-stage',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/AS11-40-5927/AS11-40-5927~orig.jpg',
            nasa_id_or_pia='AS11-40-5927',
            caption='Apollo 11 Lunar Module Eagle standing on Mare Tranquillitatis.',
            credit='NASA/Neil Armstrong',
        ),
    ],
    'spirit-rover': [
        MediaDTO(
            artifact_id='spirit-rover',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA05200.jpg',
            nasa_id_or_pia='PIA05200',
            caption='Spirit rover looking back toward Columbia Memorial Station in Gusev Crater.',
            credit='NASA/JPL-Caltech',
        ),
    ],
    'insight-lander': [
        MediaDTO(
            artifact_id='insight-lander',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA22521.jpg',
            nasa_id_or_pia='PIA22521',
            caption='InSight first selfie on Elysium Planitia, Mars.',
            credit='NASA/JPL-Caltech',
        ),
    ],
    'ingenuity-helicopter': [
        MediaDTO(
            artifact_id='ingenuity-helicopter',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA24836.jpg',
            nasa_id_or_pia='PIA24836',
            caption='Ingenuity Mars Helicopter captured in flight by Perseverance rover.',
            credit='NASA/JPL-Caltech',
        ),
    ],
}


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
