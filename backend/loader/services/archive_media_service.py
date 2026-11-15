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
    'apollo-11-lrr': [
        MediaDTO(
            artifact_id='apollo-11-lrr',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/6900957/6900957~medium.jpg',
            nasa_id_or_pia='6900957',
            caption='Apollo 11 Lunar Laser Ranging Retroreflector (LRRR) deployed at Tranquility Base.',
            credit='NASA/Buzz Aldrin',
        ),
    ],
    'opportunity-rover': [
        MediaDTO(
            artifact_id='opportunity-rover',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/PIA22074/PIA22074~medium.jpg',
            nasa_id_or_pia='PIA22074',
            caption='Opportunity rover mosaic in Perseverance Valley, Endeavour Crater.',
            credit='NASA/JPL-Caltech/Cornell/ASU',
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
            media_url='https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg',
            nasa_id_or_pia='as11-40-5927',
            caption='Apollo 11 Lunar Module Eagle standing on Mare Tranquillitatis.',
            credit='NASA/Neil Armstrong',
        ),
    ],
    'spirit-rover': [
        MediaDTO(
            artifact_id='spirit-rover',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/PIA05500/PIA05500~thumb.jpg',
            nasa_id_or_pia='PIA05500',
            caption='Spirit rover on the summit of Husband Hill overlooking Gusev Crater.',
            credit='NASA/JPL-Caltech/Cornell',
        ),
    ],
    'insight-lander': [
        MediaDTO(
            artifact_id='insight-lander',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/PIA23014/PIA23014~thumb.jpg',
            nasa_id_or_pia='PIA23014',
            caption='InSight lander selfie displaying SEIS dome and twin solar arrays at Elysium Planitia.',
            credit='NASA/JPL-Caltech',
        ),
    ],
    'ingenuity-helicopter': [
        MediaDTO(
            artifact_id='ingenuity-helicopter',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/PIA24836/PIA24836~medium.jpg',
            nasa_id_or_pia='PIA24836',
            caption='Ingenuity Mars Helicopter resting on Martian sand in Jezero Crater.',
            credit='NASA/JPL-Caltech/ASU/MSSS',
        ),
    ],
    'sojourner-rover': [
        MediaDTO(
            artifact_id='sojourner-rover',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/PIA01120/PIA01120~medium.jpg',
            nasa_id_or_pia='PIA01120',
            caption='Sojourner rover examining the Martian rock named Yogi near Mars Pathfinder station.',
            credit='NASA/JPL',
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
