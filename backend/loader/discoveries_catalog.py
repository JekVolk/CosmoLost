"""
Complete Curated Discoveries Dataset for Moon and Mars Artifacts.
"""
from loader.domain.dtos import DiscoveryDTO

ALL_DISCOVERIES = {
    'opportunity-rover': [
        DiscoveryDTO(
            artifact_id='opportunity-rover',
            title='Hematite "Blueberries" Confirming Past Water',
            instrument_acronym='MIMOS II & APXS',
            instrument_full_name='Mossbauer Spectrometer & Alpha Particle X-Ray Spectrometer',
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
            title='Lunar Recession and Precision Earth-Moon Distance Geodesy',
            instrument_acronym='LRRR',
            instrument_full_name='Lunar Laser Ranging Retroreflector',
            kid_friendly_story='By aiming giant laser pulses at Apollo 11 mirrors, scientists discovered that the Moon is slowly moving away from Earth at 3.8 cm per year!',
            scientific_fact='Laser time-of-flight measurements verified Einstein General Theory of Relativity to parts-per-trillion precision.',
        ),
    ],
    'apollo-12-descent': [
        DiscoveryDTO(
            artifact_id='apollo-12-descent',
            title='Pinpoint Surface Navigation and Spacecraft Component Return',
            instrument_acronym='PDI Guidance & Bolt Cutters',
            instrument_full_name='Primary Guidance Navigation Control System & Sampling Tools',
            kid_friendly_story='Astronauts landed within walking distance of Surveyor 3 and retrieved its camera, proving humans can find and repair machines on other worlds!',
            scientific_fact='Retrieved components from Surveyor 3 provided the first direct data on the long-term effects of lunar vacuum, radiation, and micrometeoroids.',
        ),
    ],
    'apollo-13-s4b-impact': [
        DiscoveryDTO(
            artifact_id='apollo-13-s4b-impact',
            title='Hypervelocity Calibration of the Lunar Seismic Crust',
            instrument_acronym='ALSEP PSE',
            instrument_full_name='Passive Seismic Experiment Network',
            kid_friendly_story='NASA crashed a giant 14-ton empty rocket stage into the Moon, making the whole Moon ring like a hollow bell for more than three hours!',
            scientific_fact='S-IVB kinetic energy created a 30-meter crater and generated seismic shear waves revealing a rigid, low-attenuation lunar crust.',
        ),
    ],
    'apollo-14-descent': [
        DiscoveryDTO(
            artifact_id='apollo-14-descent',
            title='Deep Imbrium Basin Impact Ejecta Verification',
            instrument_acronym='MET & Core Tubes',
            instrument_full_name='Modular Equipment Transporter & Soil Sampling Tools',
            kid_friendly_story='Alan Shepard and Ed Mitchell pulled a two-wheeled rickshaw cart up Cone Crater, collecting giant white rocks thrown across the Moon by an ancient asteroid!',
            scientific_fact='Confirmed the Fra Mauro formation consists of ejecta excavated from deep within the Moon during the giant Imbrium basin impact 3.9 billion years ago.',
        ),
    ],
    'apollo-15-lrv': [
        DiscoveryDTO(
            artifact_id='apollo-15-lrv',
            title='Discovery of the Primordial Genesis Rock',
            instrument_acronym='LRV & Scoop',
            instrument_full_name='Lunar Roving Vehicle & Geology Tools',
            kid_friendly_story='Dave Scott drove the Moon Buggy right to the edge of Hadley Rille gorge and discovered the glittering white Genesis Rock - a chunk of the original lunar crust!',
            scientific_fact='Returned the 4.1-billion-year-old anorthosite Genesis Rock, proving the lunar magma ocean hypothesis.',
        ),
    ],
    'apollo-16-descent': [
        DiscoveryDTO(
            artifact_id='apollo-16-descent',
            title='Disproof of Highland Volcanism and Cataclysmic Shock Metamorphism',
            instrument_acronym='LRV-2 & Core Drill',
            instrument_full_name='Lunar Roving Vehicle 2 & Deep Core Sampling Drill',
            kid_friendly_story='Before Apollo 16, every scientist thought the lunar mountains were ancient volcanoes. John Young proved they were built entirely by asteroid impact explosions!',
            scientific_fact='Petrological analysis of Descartes breccias proved the lunar highlands are non-volcanic anorthositic impact melt sheets.',
        ),
    ],
    'apollo-17-challenger': [
        DiscoveryDTO(
            artifact_id='apollo-17-challenger',
            title='Discovery of Orange Pyroclastic Volcanic Glass at Shorty Crater',
            instrument_acronym='Gnomon & Trench Tool',
            instrument_full_name='Lunar Surface Geology Sampling Tools',
            kid_friendly_story='Geologist-astronaut Harrison Schmitt spotted vivid orange soil at Shorty Crater, which turned out to be tiny beads of fiery volcanic glass from ancient Moon fountains!',
            scientific_fact='Analysis of orange pyroclastic beads revealed volatiles and indigenous water within the lunar interior.',
        ),
    ],
    'surveyor-1-lander': [
        DiscoveryDTO(
            artifact_id='surveyor-1-lander',
            title='Verification of Lunar Regolith Mechanical Bearing Strength',
            instrument_acronym='Strain Gauges & TV Camera',
            instrument_full_name='Crushable Aluminum Footpad Strain Sensors & Scanning TV',
            kid_friendly_story='Surveyor 1 sank only 5 centimeters into the lunar dust, disproving the fear that Apollo astronauts would sink into deep dust quicksand!',
            scientific_fact='Measured dynamic lunar soil resistance of ~0.4 kg/cm2, proving the lunar surface had ample load-bearing capacity for human landing modules.',
        ),
    ],
    'surveyor-5-lander': [
        DiscoveryDTO(
            artifact_id='surveyor-5-lander',
            title='First In-Situ Chemical Analysis of Extraterrestrial Soil',
            instrument_acronym='Alpha-Scattering',
            instrument_full_name='Curium-242 Alpha Scattering Spectrometer',
            kid_friendly_story='Surveyor 5 lowered a gold-plated sensor box right onto the gray dirt, bombarding atoms with alpha particles to read the recipe of Moon rock!',
            scientific_fact='Determined lunar mare regolith is predominantly basaltic rock composed of 58% oxygen, 19% silicon, and rich titanium iron oxides.',
        ),
    ],
    'surveyor-6-lander': [
        DiscoveryDTO(
            artifact_id='surveyor-6-lander',
            title='First Rocket Liftoff and Hopper Translation from Lunar Surface',
            instrument_acronym='Vernier Engines',
            instrument_full_name='Liquid Vernier Propulsion System',
            kid_friendly_story='Surveyor 6 fired its rocket engines for 2.5 seconds, hopped 2.5 meters to the side, and photographed its own original footprint in the dust!',
            scientific_fact='Provided the first stereoscopic surface baseline photography and demonstrated that rocket exhaust does not destabilize surrounding lunar soil.',
        ),
    ],
    'surveyor-7-lander': [
        DiscoveryDTO(
            artifact_id='surveyor-7-lander',
            title='Highland Chemical Distinction and Earth Laser Beam Detection',
            instrument_acronym='Alpha-Scattering & TV',
            instrument_full_name='Alpha Scattering Spectrometer & Telephoto TV Camera',
            kid_friendly_story='Surveyor 7 looked back at Earth and photographed green and blue laser pulses beamed up from observatory telescopes in California!',
            scientific_fact='Discovered that lunar highlands around Tycho have significantly lower iron and titanium than the dark mare, confirming continental crust differentiation.',
        ),
    ],
    'ranger-7-impact': [
        DiscoveryDTO(
            artifact_id='ranger-7-impact',
            title='Sub-Meter Lunar Topography and Micro-Crater Cratering Mechanics',
            instrument_acronym='Vidicon Cameras',
            instrument_full_name='Full-Scan and Partial-Scan Vidicon TV Cameras',
            kid_friendly_story='In its final seconds before crashing, Ranger 7 sent back pictures 1,000 times clearer than any telescope on Earth had ever seen!',
            scientific_fact='Revealed that the lunar surface is dominated by micro-cratering down to centimeter scales, proving smooth landing zones exist.',
        ),
    ],
    'lcross-centaur-impact': [
        DiscoveryDTO(
            artifact_id='lcross-centaur-impact',
            title='Direct Confirmation of Water Ice and Hydrocarbons in Polar Crater',
            instrument_acronym='Nadir Spectrometer',
            instrument_full_name='Near-Infrared and Ultraviolet/Visible Spectrometers',
            kid_friendly_story='By smashing a giant rocket into Cabeus crater, LCROSS detected clouds of pure water vapor, proving the Moon has water for future astronauts!',
            scientific_fact='Confirmed 5.5 weight percent water ice (H2O), hydroxyl (OH), carbon monoxide, sulfur dioxide, and methane in Cabeus permafrost.',
        ),
    ],
    'luna-2-impact': [
        DiscoveryDTO(
            artifact_id='luna-2-impact',
            title='Absence of a Strong Dipolar Lunar Magnetic Field and Van Allen Belt Boundary',
            instrument_acronym='Fluxgate Magnetometer',
            instrument_full_name='Triaxial Fluxgate Magnetometer & Scintillation Counters',
            kid_friendly_story='Luna 2 proved for the first time that the Moon has no giant magnetic field like Earth, and recorded the solar wind blowing through space!',
            scientific_fact='Established upper limit on lunar dipole magnetic field (< 100 nT) and mapped the outer boundaries of Earth Van Allen radiation belts.',
        ),
    ],
    'luna-9-lander': [
        DiscoveryDTO(
            artifact_id='luna-9-lander',
            title='First Close-Up Visual Structure of Lunar Regolith Micro-Relief',
            instrument_acronym='Panoramic TV',
            instrument_full_name='Cyclic Facsimile Television System',
            kid_friendly_story='Luna 9 opened like an egg and transmitted the first human view looking across the horizon of another world!',
            scientific_fact='Photographed rocks and micro-relief under varying solar angles, proving the lunar regolith has high cohesion and does not collapse under load.',
        ),
    ],
    'luna-13-lander': [
        DiscoveryDTO(
            artifact_id='luna-13-lander',
            title='In-Situ Soil Mechanical Penetration and Gamma-Ray Densimetry',
            instrument_acronym='Soil Penetrometer',
            instrument_full_name='Ground Penetrometer & Gamma-Ray Backscatter Densitometer',
            kid_friendly_story='Luna 13 jabbed a mechanical titanium spike into the Moon dirt with a tiny gunpowder explosion to test how tough the ground was!',
            scientific_fact='Directly measured regolith density at 0.8 to 1.5 g/cm3 with bearing capacity of 0.05 to 0.1 MPa in the upper centimeters.',
        ),
    ],
    'luna-16-descent': [
        DiscoveryDTO(
            artifact_id='luna-16-descent',
            title='First Automated Robotic Drilling and Lunar Sample Return',
            instrument_acronym='Robotic Core Drill',
            instrument_full_name='Percussive Core Drill & Sample Transfer Arm',
            kid_friendly_story='With no humans anywhere near, a robot drilled into the Moon, scooped the dirt into a capsule, and rocketed it back to Earth!',
            scientific_fact='Returned 101 grams of ilmenite-rich mare basalt from Mare Fecunditatis, establishing benchmark radiometric ages of 3.4 billion years.',
        ),
    ],
    'lunokhod-1-rover': [
        DiscoveryDTO(
            artifact_id='lunokhod-1-rover',
            title='First Mobile In-Situ Mechanical and Chemical Mapping',
            instrument_acronym='RIFMA & Wheel Odometry',
            instrument_full_name='Roentgen Isotopic Fluorescent Method of Analysis',
            kid_friendly_story='Lunokhod 1 drove over 10 kilometers through craters, measuring chemical recipes in the soil and reflecting laser pulses from Earth!',
            scientific_fact='Conducted 500 soil mechanical penetration tests and 25 chemical analyses across 10.5 km of Mare Imbrium.',
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
    'luna-20-descent': [
        DiscoveryDTO(
            artifact_id='luna-20-descent',
            title='Robotic Highland Regolith Sampling and Anorthosite Return',
            instrument_acronym='Rotary-Percussive Drill',
            instrument_full_name='Thin-Walled Rotary-Percussive Core Drill',
            kid_friendly_story='Luna 20 drilled into tough mountain rock near Apollonius crater and returned pure white anorthosite rock to Earth!',
            scientific_fact='Returned 55 grams of ancient anorthosite highland regolith containing 50-60% plagioclase feldspar.',
        ),
    ],
    'luna-24-descent': [
        DiscoveryDTO(
            artifact_id='luna-24-descent',
            title='Two-Meter Deep Core Stratigraphy and Early Detection of Lunar Water',
            instrument_acronym='Deep Rotary Drill',
            instrument_full_name='Deep Core Rotary Percussion Drill (2 Meter Flexible Tube)',
            kid_friendly_story='Luna 24 drilled two meters underground into Mare Crisium. Soviet geochemists detected 0.1% water in my returned soil tube in 1978!',
            scientific_fact='Returned 170.1 grams of intact stratigraphy down to 225 cm; spectrophotometry revealed 0.1 weight percent water content.',
        ),
    ],
    'change-3-lander-yutu': [
        DiscoveryDTO(
            artifact_id='change-3-lander-yutu',
            title='Deep Subsurface Radar Tomography and Lunar Ultraviolet Astronomy',
            instrument_acronym='LPR & LUT',
            instrument_full_name='Lunar Penetrating Radar & Lunar-based Ultraviolet Telescope',
            kid_friendly_story='Yutu used ground-penetrating radar to look 400 meters under the lunar soil, discovering over nine distinct ancient lava flow layers!',
            scientific_fact='Discovered a new type of highly titaniferous lunar basalt with high iron and intermediate titanium.',
        ),
    ],
    'change-4-lander-yutu2': [
        DiscoveryDTO(
            artifact_id='change-4-lander-yutu2',
            title='First Direct Chemical Exploration of the Lunar Farside Mantle Ejecta',
            instrument_acronym='VNIS',
            instrument_full_name='Visible and Near-Infrared Spectrometer',
            kid_friendly_story='Operating on the dark-sky far side of the Moon, Yutu-2 discovered minerals excavated from deep inside the Moon mantle!',
            scientific_fact='Spectroscopy in Von Karman crater revealed low-calcium pyroxene and olivine minerals excavated from the upper lunar mantle.',
        ),
    ],
    'change-5-descent': [
        DiscoveryDTO(
            artifact_id='change-5-descent',
            title='Discovery of Two-Billion-Year-Old Young Volcanism and Changesite-(Y)',
            instrument_acronym='Robotic Scoop & Drill',
            instrument_full_name='Dual Surface Robotic Scoop and Percussive Core Drill',
            kid_friendly_story='Chang e 5 scooped up basalt rock that is two billion years younger than anything Apollo found, proving the Moon stayed volcanically alive!',
            scientific_fact='Returned 1,731 grams of basalt dated to 2.03 billion years ago; identified new lunar phosphate mineral Changesite-(Y).',
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
    'pathfinder-station': [
        DiscoveryDTO(
            artifact_id='pathfinder-station',
            title='Evidence of Catastrophic Ancient Megafloods in Ares Vallis',
            instrument_acronym='IMP Camera & APXS',
            instrument_full_name='Imager for Mars Pathfinder & Alpha Proton X-Ray Spectrometer',
            kid_friendly_story='Pathfinder landed in a giant prehistoric outflow valley and found rounded river rocks stacked together like shingles by massive rushing floods!',
            scientific_fact='Identified semi-rounded imbricated boulders in Ares Vallis deposited by ancient catastrophic floods with discharge rates exceeding 10^7 m3/sec.',
        ),
    ],
    'sojourner-rover': [
        DiscoveryDTO(
            artifact_id='sojourner-rover',
            title='First In-Situ Chemical Analysis of Martian Rocks by Rover',
            instrument_acronym='APXS',
            instrument_full_name='Alpha Proton X-Ray Spectrometer',
            kid_friendly_story='Tiny Sojourner pressed its sensor against rocks named Barnacle Bill and Yogi, discovering volcanic andesite rocks similar to Earth crust!',
            scientific_fact='Determined Barnacle Bill rock is high-silica andesite (58% SiO2), indicating differentiated magma processes on early Mars.',
        ),
    ],
    'phoenix-lander': [
        DiscoveryDTO(
            artifact_id='phoenix-lander',
            title='Direct Touch and Sublimation of Arctic Pure Water Ice and Perchlorates',
            instrument_acronym='TEGA & MECA',
            instrument_full_name='Thermal and Evolved-Gas Analyzer & Microscopy/Electrochemistry Analyzer',
            kid_friendly_story='Phoenix scraped white ice out of a trench named Snow White and watched it disappear into vapor right in front of its camera!',
            scientific_fact='Discovered magnesium and calcium perchlorates (ClO4-) and pure subsurface water ice beneath 5 cm of arctic regolith.',
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
    'insight-lander': [
        DiscoveryDTO(
            artifact_id='insight-lander',
            title='Mapping the Crust, Mantle, and Liquid Core of Mars via Marsquakes',
            instrument_acronym='SEIS',
            instrument_full_name='Seismic Experiment for Interior Structure',
            kid_friendly_story='InSight listened to over 1,300 marsquakes and meteorite crashes, mapping the giant molten core deep inside Mars!',
            scientific_fact='Determined the Martian liquid iron-nickel core has a radius of ~1,830 km and measured crustal thickness between 24 and 72 km.',
        ),
    ],
    'perseverance-rover': [
        DiscoveryDTO(
            artifact_id='perseverance-rover',
            title='Discovery of Igneous Bedrock and Organic Molecules in Jezero Lake Delta',
            instrument_acronym='SHERLOC & PIXL',
            instrument_full_name='Scanning Habitable Environments with Raman & Luminescence for Organics and Chemicals',
            kid_friendly_story='Perseverance drilled core tubes into Jezero delta rocks, finding aromatic organic molecules trapped inside ancient salt crystals!',
            scientific_fact='Discovered aromatic ring organic macromolecules in the Seitah formation and successfully converted atmospheric CO2 to oxygen via MOXIE.',
        ),
    ],
    'ingenuity-helicopter': [
        DiscoveryDTO(
            artifact_id='ingenuity-helicopter',
            title='First Powered Controlled Aerodynamic Flight on Another World',
            instrument_acronym='Twin Coaxial Rotors',
            instrument_full_name='Autonomous Mars Rotorcraft Flight Control System',
            kid_friendly_story='Ingenuity spun its blades at 2,500 rpm in air as thin as Earth stratosphere, flying 72 missions and acting as an aerial scout for Perseverance!',
            scientific_fact='Logged 128.8 minutes of flight time across 17.0 km of terrain in atmospheric density only 1.2% of Earth sea level.',
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
    'beagle-2-lander': [
        DiscoveryDTO(
            artifact_id='beagle-2-lander',
            title='High-Resolution Orbital Discovery of Deployment in Isidis Planitia',
            instrument_acronym='HiRISE MRO',
            instrument_full_name='High Resolution Imaging Science Experiment (Orbital Recovery)',
            kid_friendly_story='Lost in 2003, Beagle 2 was finally spotted 11 years later by a NASA orbiter camera, showing its solar flower petals partially unfurled!',
            scientific_fact='HiRISE orbital imagery confirmed successful landing and partial solar panel deployment at 11.53 N, 90.43 E in Isidis Planitia.',
        ),
    ],
}
