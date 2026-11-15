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
    'surveyor-3-lander': [
        DiscoveryDTO(
            artifact_id='surveyor-3-lander',
            title='Long-term Space Weathering Analysis on Manmade Materials',
            instrument_acronym='TV Camera',
            instrument_full_name='Surveyor Vidicon Television Camera',
            kid_friendly_story='When Apollo 12 astronauts brought Surveyor 3 camera back to Earth, scientists analyzed how 32 months of solar wind and micro-meteoroids sandblasted its metal!',
            scientific_fact='First and only ground truth analysis of long-duration space radiation and micro-impact effects on equipment retrieved by human astronauts.',
        ),
    ],
    'apollo-15-lrv': [
        DiscoveryDTO(
            artifact_id='apollo-15-lrv',
            title='Discovery of the 4-Billion-Year-Old Genesis Rock',
            instrument_acronym='LRV Rake & Tongs',
            instrument_full_name='Lunar Roving Vehicle Geological Tools',
            kid_friendly_story='Driving the lunar rover to Spur Crater, astronauts spotted a gleaming white crystal rock that turned out to be anorthosite from the Moon primordial crust!',
            scientific_fact='Sample 15415 (Genesis Rock) dated to 4.1 billion years ago, confirming the lunar magma ocean hypothesis.',
        ),
    ],
    'luna-2-impact': [
        DiscoveryDTO(
            artifact_id='luna-2-impact',
            title='First Direct Measurement Proving Lack of Lunar Magnetic Field',
            instrument_acronym='Fluxgate Magnetometer',
            instrument_full_name='Three-component Fluxgate Magnetometer',
            kid_friendly_story='Luna 2 sped straight toward the Moon, transmitting data until the final millisecond to show the Moon does not have a global magnetic field like Earth!',
            scientific_fact='Confirmed lunar magnetic field was below 100 nT prior to kinetic impact at 29.1N, 0.0E.',
        ),
    ],
    'luna-9-lander': [
        DiscoveryDTO(
            artifact_id='luna-9-lander',
            title='Proof of Solid Bearing Capacity of Lunar Regolith',
            instrument_acronym='Cycloramic TV',
            instrument_full_name='Cycloramic Facsimile Phototelevision System',
            kid_friendly_story='Luna 9 proved that spacecraft do not sink into quicksand dust, beaming back the first close-up pictures of lunar rocks and pebbles.',
            scientific_fact='Resolved millimeter-scale soil cohesion and bearing strength of Oceanus Procellarum basalt plains.',
        ),
    ],
    'lunokhod-1-rover': [
        DiscoveryDTO(
            artifact_id='lunokhod-1-rover',
            title='First Robotic Planetary Traverse and Millimeter Laser Ranging',
            instrument_acronym='RIFMA & French Reflector',
            instrument_full_name='X-ray Fluorescence Spectrometer and Corner-Cube Retroreflector',
            kid_friendly_story='Lunokhod 1 rolled over ten kilometers on eight wheels, and its French quartz reflector is still pinged by Earth lasers today!',
            scientific_fact='Traversed 10.5 km analyzing lunar soil composition and enabled sub-centimeter Earth-Moon distance measurements.',
        ),
    ],
    'change-4-lander-yutu2': [
        DiscoveryDTO(
            artifact_id='change-4-lander-yutu2',
            title='First Mineralogical Survey of the Lunar Farside Mantle',
            instrument_acronym='VNIS & LPR',
            instrument_full_name='Visible and Near-Infrared Spectrometer & Lunar Penetrating Radar',
            kid_friendly_story='Operating on the farside where Earth is invisible, Yutu-2 radar peered 40 meters beneath the dust to reveal ancient layers of volcanic lava!',
            scientific_fact='Identified olivine and low-calcium pyroxene derived from the lunar upper mantle within South Pole-Aitken basin.',
        ),
    ],
    'chandrayaan-3-vikram': [
        DiscoveryDTO(
            artifact_id='chandrayaan-3-vikram',
            title='Discovery of Elemental Sulfur in Lunar South Polar Regolith',
            instrument_acronym='LIBS & ChaSTE',
            instrument_full_name='Laser-Induced Breakdown Spectroscope & Chandra Surface Thermophysical Experiment',
            kid_friendly_story='Pragyan rover blasted lunar dirt with tiny laser pulses, discovering pure sulfur crystals near the Moon South Pole!',
            scientific_fact='Unambiguously confirmed sulfur presence and recorded steep thermal gradient (from +50C surface down to -10C at 8 cm depth).',
        ),
    ],
    'curiosity-rover': [
        DiscoveryDTO(
            artifact_id='curiosity-rover',
            title='Evidence of Long-Lived Habitable Ancient Lakes and Organic Carbon',
            instrument_acronym='SAM & CheMin',
            instrument_full_name='Sample Analysis at Mars & Chemistry and Mineralogy X-ray Diffraction',
            kid_friendly_story='Curiosity drilled into mudstone rocks at Yellowknife Bay, discovering that Mars once possessed drinkable fresh water lakes with all building blocks for life!',
            scientific_fact='Detected sulfur, nitrogen, oxygen, phosphorus, and complex organic thiophenic and aromatic macromolecules in ancient lacustrine mudstone.',
        ),
    ],
    'viking-1-lander': [
        DiscoveryDTO(
            artifact_id='viking-1-lander',
            title='First In-Situ Chemical and Meteorological Analysis of Martian Surface',
            instrument_acronym='XRFS & GCMS',
            instrument_full_name='X-ray Fluorescence Spectrometer & Gas Chromatograph-Mass Spectrometer',
            kid_friendly_story='Viking 1 scooped up red Martian sand with a robotic arm, analyzing soil iron oxides and recording weather for six continuous Earth years!',
            scientific_fact='Measured silicon, iron, magnesium, and sulfur concentrations, proving the Martian surface is dominated by iron-rich smectite clays.',
        ),
    ],
    'zhurong-rover': [
        DiscoveryDTO(
            artifact_id='zhurong-rover',
            title='Subsurface Radar Mapping of Utopia Planitia Floods',
            instrument_acronym='RoPEN',
            instrument_full_name='Rover Penetrating Radar',
            kid_friendly_story='Zhurong used ground-penetrating radar to see underground craters buried under meters of Martian sediment from giant prehistoric floods!',
            scientific_fact='Revealed 16 buried wedges across 1.2 km traverse formed by freeze-thaw cycles during late Hesperian or early Amazonian epochs.',
        ),
    ],
    'apollo-15-lrv': [
        DiscoveryDTO(
            artifact_id='apollo-15-lrv',
            title='First Lunar Roving Vehicle and Genesis Rock Collection',
            instrument_acronym='LRV & Scoop',
            instrument_full_name='Lunar Roving Vehicle & Geology Tools',
            kid_friendly_story='Dave Scott drove the Moon Buggy right to the edge of Hadley Rille gorge and discovered the glittering white Genesis Rock - a chunk of the original lunar crust!',
            scientific_fact='Returned the 4.1-billion-year-old anorthosite Genesis Rock, proving the lunar magma ocean hypothesis.',
        ),
    ],
    'apollo-17-descent': [
        DiscoveryDTO(
            artifact_id='apollo-17-descent',
            title='Discovery of Orange Volcanic Glass Soil at Shorty Crater',
            instrument_acronym='Gnomon & Trench Tool',
            instrument_full_name='Lunar Surface Geology Sampling Tools',
            kid_friendly_story='Geologist-astronaut Harrison Schmitt spotted vivid orange soil at Shorty Crater, which turned out to be tiny beads of fiery volcanic glass from ancient Moon fountains!',
            scientific_fact='Analysis of orange pyroclastic beads revealed volatiles and indigenous water within the lunar interior.',
        ),
    ],
    'lunokhod-2-rover': [
        DiscoveryDTO(
            artifact_id='lunokhod-2-rover',
            title='Longest Uncrewed Traverse and X-ray Fluorescence of Lunar Basalt',
            instrument_acronym='RIFMA & Astrophotometer',
            instrument_full_name='X-ray Fluorescence Spectrometer & Visible/UV Photometer',
            kid_friendly_story='Lunokhod 2 rolled across 39 kilometers of rugged hills and craters, measuring rock chemistry under moonlight and starry skies!',
            scientific_fact='Traversed 39 km across the mare-highland boundary in Le Monnier crater, performing hundreds of soil mechanical and chemical tests.',
        ),
    ],
    'viking-2-lander': [
        DiscoveryDTO(
            artifact_id='viking-2-lander',
            title='Observation of Seasonal Water Frost and Martian Seismology',
            instrument_acronym='Viking Seismometer & Camera',
            instrument_full_name='Surface Seismometer & Lander Imaging System',
            kid_friendly_story='Viking 2 watched bright white water frost coat the red desert rocks of Utopia Planitia during chilly Martian winters!',
            scientific_fact='Confirmed water ice frost deposition on surface rocks and gathered continuous meteorological data over 1,316 sols.',
        ),
    ],
    'huygens-titan': [
        DiscoveryDTO(
            artifact_id='huygens-titan',
            title='Descent through Nitrogen Atmosphere and Landing in Methane Riverbed',
            instrument_acronym='DISR & SSP',
            instrument_full_name='Descent Imager/Spectral Radiometer & Surface Science Package',
            kid_friendly_story='Huygens parachuted through orange smog on Titan, landing gently on a muddy plain of solid ice pebbles carved by liquid methane rivers!',
            scientific_fact='Proved the presence of liquid methane cycle, complex tholin organics, and an icy regolith saturated with liquid hydrocarbons at 93 Kelvin.',
        ),
    ],
    'beagle-2-lander': [
        DiscoveryDTO(
            artifact_id='beagle-2-lander',
            title='High-Resolution Orbital Discovery of Deployment in Isidis Planitia',
            instrument_acronym='HiRISE MRO',
            instrument_full_name='High Resolution Imaging Science Experiment (Orbital Recovery)',
            kid_friendly_story='Lost in 2003, Beagle 2 was finally spotted 11 years later by a NASA orbiter camera, showing its solar flower petals partially unfurled!',
            scientific_fact='HiRISE orbital imagery confirmed successful landing and partial solar panel deployment at 11.53° N, 90.43° E in Isidis Planitia.',
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
