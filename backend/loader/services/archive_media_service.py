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
        ('Apollo 11 panorama', 'PANORAMA'),
        ('Tranquility Base LROC orbital', 'ORBITAL'),
    ],
    'surveyor-3-lander': [
        ('Surveyor 3 Apollo 12', 'SURFACE_PHOTO'),
        ('Surveyor 3 LROC', 'ORBITAL'),
    ],
    'apollo-15-lrv': [
        ('Apollo 15 Lunar Roving Vehicle Hadley', 'SURFACE_PHOTO'),
    ],
    'apollo-17-descent': [
        ('Apollo 17 Lunar Module Challenger Taurus-Littrow', 'SURFACE_PHOTO'),
    ],
    'luna-2-impact': [
        ('Luna 2 impact Palus Putredinis', 'ORBITAL'),
    ],
    'luna-9-lander': [
        ('Luna 9 Oceanus Procellarum', 'SURFACE_PHOTO'),
    ],
    'lunokhod-1-rover': [
        ('Lunokhod 1 Mare Imbrium LROC', 'ORBITAL'),
    ],
    'lunokhod-2-rover': [
        ('Lunokhod 2 Le Monnier LROC', 'ORBITAL'),
    ],
    'change-4-lander-yutu2': [
        ('Chang e 4 Von Karman LROC', 'ORBITAL'),
    ],
    'chandrayaan-3-vikram': [
        ('Chandrayaan 3 Vikram LROC', 'ORBITAL'),
    ],
    'opportunity-rover': [
        ('Opportunity rover Perseverance Valley panorama', 'PANORAMA'),
        ('Opportunity rover HiRISE orbital', 'ORBITAL'),
    ],
    'spirit-rover': [
        ('Spirit rover Columbia Hills Gusev', 'SURFACE_PHOTO'),
        ('Spirit rover panorama', 'PANORAMA'),
    ],
    'curiosity-rover': [
        ('Curiosity rover Mount Sharp Gale Crater', 'SURFACE_PHOTO'),
        ('Curiosity rover HiRISE orbital', 'ORBITAL'),
    ],
    'perseverance-rover': [
        ('Perseverance rover Jezero Crater', 'SURFACE_PHOTO'),
        ('Perseverance rover HiRISE orbital', 'ORBITAL'),
    ],
    'insight-lander': [
        ('InSight lander Elysium Planitia SEIS', 'SURFACE_PHOTO'),
    ],
    'ingenuity-helicopter': [
        ('Ingenuity helicopter Jezero crater flight', 'SURFACE_PHOTO'),
    ],
    'viking-1-lander': [
        ('Viking 1 Lander Chryse Planitia surface', 'SURFACE_PHOTO'),
    ],
    'viking-2-lander': [
        ('Viking 2 Lander Utopia Planitia frost', 'SURFACE_PHOTO'),
    ],
    'zhurong-rover': [
        ('Tianwen 1 Zhurong rover HiRISE Utopia', 'ORBITAL'),
    ],
    'huygens-titan': [
        ('Huygens probe surface Titan Cassini', 'SURFACE_PHOTO'),
    ],
    'beagle-2-lander': [
        ('Beagle 2 HiRISE Isidis Planitia', 'ORBITAL'),
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
    'surveyor-3-lander': [
        MediaDTO(
            artifact_id='surveyor-3-lander',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/as12-48-7133/as12-48-7133~medium.jpg',
            nasa_id_or_pia='as12-48-7133',
            caption='Apollo 12 astronaut Pete Conrad examines the Surveyor 3 spacecraft on Oceanus Procellarum.',
            credit='NASA/Alan Bean',
        ),
    ],
    'apollo-15-lrv': [
        MediaDTO(
            artifact_id='apollo-15-lrv',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/as15-88-11901/as15-88-11901~medium.jpg',
            nasa_id_or_pia='as15-88-11901',
            caption='Lunar Roving Vehicle (LRV) parked on Hadley Rille plain during Apollo 15 mission.',
            credit='NASA/Jim Irwin',
        ),
    ],
    'apollo-17-descent': [
        MediaDTO(
            artifact_id='apollo-17-descent',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/as17-134-20416/as17-134-20416~medium.jpg',
            nasa_id_or_pia='as17-134-20416',
            caption='Apollo 17 Lunar Module Challenger at Taurus-Littrow valley.',
            credit='NASA/Gene Cernan',
        ),
    ],
    'luna-2-impact': [
        MediaDTO(
            artifact_id='luna-2-impact',
            media_category='ORBITAL',
            media_url='https://images-assets.nasa.gov/image/LROC_NAC_M119934444RE/LROC_NAC_M119934444RE~medium.jpg',
            nasa_id_or_pia='LROC_M119934444RE',
            caption='LROC Narrow Angle Camera high-resolution orbital view of Palus Putredinis near Luna 2 impact coordinates.',
            credit='NASA/GSFC/Arizona State University',
        ),
    ],
    'luna-9-lander': [
        MediaDTO(
            artifact_id='luna-9-lander',
            media_category='SURFACE_PHOTO',
            media_url='https://nssdc.gsfc.nasa.gov/planetary/image/luna_9_panorama.jpg',
            nasa_id_or_pia='NSSDCA-LUNA-9-PANO',
            caption='First panoramic facsimile transmitted from the lunar surface by Luna 9 lander.',
            credit='NASA NSSDCA/Roscosmos',
        ),
    ],
    'lunokhod-1-rover': [
        MediaDTO(
            artifact_id='lunokhod-1-rover',
            media_category='ORBITAL',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA13004.jpg',
            nasa_id_or_pia='PIA13004',
            caption='LROC orbital imaging confirming Lunokhod 1 rover position and wheel tracks in Mare Imbrium.',
            credit='NASA/GSFC/Arizona State University',
        ),
    ],
    'lunokhod-2-rover': [
        MediaDTO(
            artifact_id='lunokhod-2-rover',
            media_category='ORBITAL',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA15383.jpg',
            nasa_id_or_pia='PIA15383',
            caption='LROC Narrow Angle Camera view of Lunokhod 2 inside Le Monnier crater showing its 37 km track.',
            credit='NASA/GSFC/Arizona State University',
        ),
    ],
    'change-4-lander-yutu2': [
        MediaDTO(
            artifact_id='change-4-lander-yutu2',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA23091.jpg',
            nasa_id_or_pia='PIA23091',
            caption='LROC NAC orbital view of Chang e 4 lander and Yutu-2 rover in Von Karman crater on the far side of the Moon.',
            credit='NASA/GSFC/Arizona State University',
        ),
    ],
    'chandrayaan-3-vikram': [
        MediaDTO(
            artifact_id='chandrayaan-3-vikram',
            media_category='ORBITAL',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA26084.jpg',
            nasa_id_or_pia='PIA26084',
            caption='LROC orbital capture of Chandrayaan-3 Vikram lander and halo at Shiv Shakti Point near the lunar south pole.',
            credit='NASA/GSFC/Arizona State University',
        ),
    ],
    'curiosity-rover': [
        MediaDTO(
            artifact_id='curiosity-rover',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA19808.jpg',
            nasa_id_or_pia='PIA19808',
            caption='Curiosity rover self-portrait at Buckskin drilling site in Gale Crater with Mount Sharp in the background.',
            credit='NASA/JPL-Caltech/MSSS',
        ),
    ],
    'perseverance-rover': [
        MediaDTO(
            artifact_id='perseverance-rover',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA24658.jpg',
            nasa_id_or_pia='PIA24658',
            caption='Perseverance rover taking a selfie with the Ingenuity Mars Helicopter at Van Zyl Overlook in Jezero Crater.',
            credit='NASA/JPL-Caltech/MSSS',
        ),
    ],
    'viking-1-lander': [
        MediaDTO(
            artifact_id='viking-1-lander',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/PIA00563/PIA00563~medium.jpg',
            nasa_id_or_pia='PIA00563',
            caption='Historic first clear photograph taken on the surface of Mars by Viking 1 Lander on July 20, 1976.',
            credit='NASA/JPL',
        ),
    ],
    'viking-2-lander': [
        MediaDTO(
            artifact_id='viking-2-lander',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/PIA00571/PIA00571~medium.jpg',
            nasa_id_or_pia='PIA00571',
            caption='Viking 2 Lander resting among rocks and water-ice frost in Utopia Planitia.',
            credit='NASA/JPL',
        ),
    ],
    'mars-3-lander': [
        MediaDTO(
            artifact_id='mars-3-lander',
            media_category='SURFACE_PHOTO',
            media_url='https://nssdc.gsfc.nasa.gov/planetary/image/mars3_image.jpg',
            nasa_id_or_pia='NSSDCA-MARS3-IMG',
            caption='Vague image transmitted during 14.5 seconds of communication from Mars 3 lander before contact was lost.',
            credit='NASA NSSDCA/Roscosmos',
        ),
    ],
    'zhurong-rover': [
        MediaDTO(
            artifact_id='zhurong-rover',
            media_category='ORBITAL',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA24647.jpg',
            nasa_id_or_pia='PIA24647',
            caption='HiRISE orbital camera aboard Mars Reconnaissance Orbiter observing China Zhurong rover in southern Utopia Planitia.',
            credit='NASA/JPL-Caltech/University of Arizona',
        ),
    ],
    'huygens-titan': [
        MediaDTO(
            artifact_id='huygens-titan',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA07231.jpg',
            nasa_id_or_pia='PIA07231',
            caption='Huygens probe surface view of rounded hydrocarbon ice cobblestones on Saturn moon Titan.',
            credit='ESA/NASA/JPL/University of Arizona',
        ),
    ],
    'beagle-2-lander': [
        MediaDTO(
            artifact_id='beagle-2-lander',
            media_category='ORBITAL',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA19131.jpg',
            nasa_id_or_pia='PIA19131',
            caption='HiRISE high-resolution orbital confirmation of Beagle 2 lander and parachute in Isidis Planitia.',
            credit='NASA/JPL-Caltech/Univ. of Arizona/Leicester',
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
