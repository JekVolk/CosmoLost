"""
Service responsible for populating scientific discoveries and storytelling cards.
"""
import logging
from typing import Dict, List

from loader.domain.dtos import DiscoveryDTO, SyncStatsDTO
from loader.repositories.base import INASAIngestRepository

logger = logging.getLogger('loader.services.discoveries')

# Curated scientific discoveries catalog
CURATED_DISCOVERIES: Dict[str, List[DiscoveryDTO]] = {
    'opportunity-rover': [
        DiscoveryDTO(
            artifact_id='opportunity-rover',
            title='Hematite "Blueberries" Confirming Past Water',
            instrument_acronym='MIMOS II & APXS',
            instrument_full_name='Mössbauer Spectrometer & Alpha Particle X-Ray Spectrometer',
            kid_friendly_story='Oppy found tiny gray mineral marbles scattered across the dust that could only grow inside pools of liquid water billions of years ago!',
            scientific_fact='Discovery of spherical hematite concretions in Eagle Crater proved persistent acidic liquid water on ancient Mars.',
        ),
        DiscoveryDTO(
            artifact_id='opportunity-rover',
            title='Ancient Gypsum Vein in Endeavour Crater',
            instrument_acronym='Microscopic Imager',
            instrument_full_name='Microscopic Imager & Pancam',
            kid_friendly_story='Oppy discovered a bright white stripe of gypsum rock, like toothpaste squeezed into a rock crack by an underground warm spring!',
            scientific_fact='Homestake gypsum vein at Cape York proved water flowed through Martian rock fractures under mild, life-friendly conditions.',
        ),
    ],
    'spirit-rover': [
        DiscoveryDTO(
            artifact_id='spirit-rover',
            title='Pure Silica Beds from Ancient Hydrothermal Springs',
            instrument_acronym='Mini-TES & APXS',
            instrument_full_name='Miniature Thermal Emission Spectrometer',
            kid_friendly_story='With a broken front wheel dragging in the soil, Spirit accidentally carved open bright white sand that turned out to be pure silica from hot springs!',
            scientific_fact='Exposure of 90% pure opaline silica at Home Plate proved ancient volcanic fumaroles or hot spring geysers.',
        ),
    ],
    'apollo-11-descent-stage': [
        DiscoveryDTO(
            artifact_id='apollo-11-descent-stage',
            title='First Direct Lunar Regolith and Rock Sampling',
            instrument_acronym='Contingency Sampler',
            instrument_full_name='Apollo Contingency Regolith Sampler',
            kid_friendly_story='Neil Armstrong scooped lunar dust into a Teflon bag within minutes of stepping onto the surface so humanity would have pieces of the Moon even if they had to leave early!',
            scientific_fact='Returned 21.55 kg of basaltic rocks and regolith from Mare Tranquillitatis dating back 3.7 billion years.',
        ),
    ],
    'apollo-11-lrr': [
        DiscoveryDTO(
            artifact_id='apollo-11-lrr',
            title='Laser Ranging Proof of Lunar Orbit Expansion',
            instrument_acronym='LRRR',
            instrument_full_name='Lunar Laser Ranging Retroreflector',
            kid_friendly_story='This passive mirror panel has no batteries and no wires, yet still bounces laser beams back to Earth to measure the Moon drifting 3.8 cm away every year!',
            scientific_fact='Continuous photon time-of-flight measurements since 1969 validated Einstein general relativity and lunar orbital recession rate.',
        ),
    ],
    'insight-lander': [
        DiscoveryDTO(
            artifact_id='insight-lander',
            title='Deep Interior Mapping and 1,300+ Marsquakes',
            instrument_acronym='SEIS',
            instrument_full_name='Seismic Experiment for Interior Structure',
            kid_friendly_story='InSight listened to the heartbeat of Mars, detecting giant rumblings inside the planet and meteoroids crashing into the desert!',
            scientific_fact='Detected over 1,300 seismic events, proving a molten liquid iron-nickel core and calculating Martian crustal thickness at 24-72 km.',
        ),
    ],
    'ingenuity-helicopter': [
        DiscoveryDTO(
            artifact_id='ingenuity-helicopter',
            title='First Powered Aerodynamic Flight on Another Planet',
            instrument_acronym='RTE & NavCam',
            instrument_full_name='Return-to-Earth Color Camera & Navigation Sensor',
            kid_friendly_story='Ingenuity proved that a tiny helicopter could fly in Mars air that is 100 times thinner than Earth air, completing 72 historic flights!',
            scientific_fact='Demonstrated controlled rotorcraft flight in 0.020 kg/m3 atmospheric density at 2,500 RPM rotor speed.',
        ),
    ],
}


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
