"""
Curated queries and offline seed media for all NASA-cataloged artifacts.
"""
from typing import Dict, List
from loader.domain.dtos import MediaDTO

ALL_MEDIA_QUERIES: Dict[str, List[tuple[str, str]]] = {
    'apollo-11-descent-stage': [
        ('Apollo 11 Lunar Module Eagle surface', 'SURFACE_PHOTO'),
        ('Apollo 11 panorama', 'PANORAMA'),
        ('Tranquility Base LROC orbital', 'ORBITAL'),
    ],
    'apollo-11-lrr': [
        ('Apollo 11 Laser Ranging Retroreflector', 'SURFACE_PHOTO'),
    ],
    'apollo-12-descent': [
        ('Apollo 12 Lunar Module Intrepid', 'SURFACE_PHOTO'),
        ('Apollo 12 Surveyor 3', 'SURFACE_PHOTO'),
    ],
    'apollo-13-s4b-impact': [
        ('Apollo 13 S-IVB impact crater LROC', 'ORBITAL'),
    ],
    'apollo-14-descent': [
        ('Apollo 14 Lunar Module Antares', 'SURFACE_PHOTO'),
    ],
    'apollo-14-lrr': [
        ('Apollo 14 retroreflector', 'SURFACE_PHOTO'),
    ],
    'apollo-15-descent': [
        ('Apollo 15 Lunar Module Falcon Hadley', 'SURFACE_PHOTO'),
    ],
    'apollo-15-lrv': [
        ('Apollo 15 Lunar Roving Vehicle Hadley', 'SURFACE_PHOTO'),
    ],
    'apollo-15-lrr': [
        ('Apollo 15 retroreflector array', 'SURFACE_PHOTO'),
    ],
    'apollo-16-descent': [
        ('Apollo 16 Lunar Module Orion Descartes', 'SURFACE_PHOTO'),
    ],
    'apollo-16-lrv': [
        ('Apollo 16 Lunar Roving Vehicle John Young', 'SURFACE_PHOTO'),
    ],
    'apollo-17-challenger': [
        ('Apollo 17 Lunar Module Challenger Taurus-Littrow', 'SURFACE_PHOTO'),
    ],
    'apollo-17-lrv': [
        ('Apollo 17 Lunar Roving Vehicle Gene Cernan', 'SURFACE_PHOTO'),
    ],
    'surveyor-1-lander': [
        ('Surveyor 1 Moon surface Flamsteed', 'SURFACE_PHOTO'),
        ('Surveyor 1 LROC orbital', 'ORBITAL'),
    ],
    'surveyor-3-lander': [
        ('Surveyor 3 Apollo 12', 'SURFACE_PHOTO'),
        ('Surveyor 3 LROC', 'ORBITAL'),
    ],
    'surveyor-5-lander': [
        ('Surveyor 5 Tranquillitatis', 'SURFACE_PHOTO'),
    ],
    'surveyor-6-lander': [
        ('Surveyor 6 Sinus Medii', 'SURFACE_PHOTO'),
    ],
    'surveyor-7-lander': [
        ('Surveyor 7 Tycho crater rim', 'SURFACE_PHOTO'),
    ],
    'ranger-7-impact': [
        ('Ranger 7 Moon surface impact', 'SURFACE_PHOTO'),
    ],
    'ranger-9-impact': [
        ('Ranger 9 Alphonsus crater TV', 'SURFACE_PHOTO'),
    ],
    'lcross-centaur-impact': [
        ('LCROSS Cabeus crater water ice plume', 'ORBITAL'),
    ],
    'luna-2-impact': [
        ('Luna 2 impact Palus Putredinis', 'ORBITAL'),
    ],
    'luna-9-lander': [
        ('Luna 9 Oceanus Procellarum', 'SURFACE_PHOTO'),
    ],
    'luna-13-lander': [
        ('Luna 13 panorama lunar surface', 'SURFACE_PHOTO'),
    ],
    'luna-16-descent': [
        ('Luna 16 landing site LROC', 'ORBITAL'),
    ],
    'lunokhod-1-rover': [
        ('Lunokhod 1 Mare Imbrium LROC', 'ORBITAL'),
    ],
    'lunokhod-2-rover': [
        ('Lunokhod 2 Le Monnier LROC', 'ORBITAL'),
    ],
    'change-3-lander-yutu': [
        ('Change 3 Yutu rover Mare Imbrium LROC', 'ORBITAL'),
    ],
    'change-4-lander-yutu2': [
        ('Chang e 4 Von Karman LROC', 'ORBITAL'),
    ],
    'change-5-descent': [
        ('Change 5 Mons Rumker LROC', 'ORBITAL'),
    ],
    'beresheet-impact': [
        ('Beresheet impact site LROC', 'ORBITAL'),
    ],
    'chandrayaan-2-vikram-impact': [
        ('Chandrayaan 2 Vikram impact site LROC', 'ORBITAL'),
    ],
    'chandrayaan-3-vikram': [
        ('Chandrayaan 3 Vikram LROC', 'ORBITAL'),
    ],
    'hakuto-r-m1-impact': [
        ('Hakuto-R impact site Atlas crater LROC', 'ORBITAL'),
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
    'ingenuity-helicopter': [
        ('Ingenuity helicopter Jezero crater flight', 'SURFACE_PHOTO'),
    ],
    'perseverance-sample-depot': [
        ('Three Forks sample depot Perseverance', 'SURFACE_PHOTO'),
    ],
    'perseverance-entry-debris': [
        ('Ingenuity Flight 26 backshell parachute', 'SURFACE_PHOTO'),
    ],
    'insight-lander': [
        ('InSight lander Elysium Planitia SEIS', 'SURFACE_PHOTO'),
    ],
    'viking-1-lander': [
        ('Viking 1 Lander Chryse Planitia surface', 'SURFACE_PHOTO'),
    ],
    'viking-2-lander': [
        ('Viking 2 Lander Utopia Planitia frost', 'SURFACE_PHOTO'),
    ],
    'pathfinder-station': [
        ('Mars Pathfinder Carl Sagan Memorial Station', 'SURFACE_PHOTO'),
    ],
    'sojourner-rover': [
        ('Sojourner rover Yogi rock', 'SURFACE_PHOTO'),
    ],
    'phoenix-lander': [
        ('Phoenix Mars lander Snow White water ice', 'SURFACE_PHOTO'),
        ('Phoenix lander HiRISE parachute', 'ORBITAL'),
    ],
    'mars-polar-lander-impact': [
        ('Mars Polar Lander candidate site HiRISE', 'ORBITAL'),
    ],
    'schiaparelli-impact': [
        ('ExoMars Schiaparelli impact crater HiRISE', 'ORBITAL'),
    ],
    'zhurong-rover': [
        ('Tianwen 1 Zhurong rover HiRISE Utopia', 'ORBITAL'),
    ],
    'beagle-2-lander': [
        ('Beagle 2 HiRISE Isidis Planitia', 'ORBITAL'),
    ],
}

ALL_SEED_MEDIA: Dict[str, List[MediaDTO]] = {
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
    'apollo-12-descent': [
        MediaDTO(
            artifact_id='apollo-12-descent',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/as12-48-7134/as12-48-7134~medium.jpg',
            nasa_id_or_pia='as12-48-7134',
            caption='Apollo 12 astronaut Pete Conrad visits Surveyor 3 with Lunar Module Intrepid in background.',
            credit='NASA/Alan Bean',
        ),
    ],
    'apollo-13-s4b-impact': [
        MediaDTO(
            artifact_id='apollo-13-s4b-impact',
            media_category='ORBITAL',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA12999.jpg',
            nasa_id_or_pia='PIA12999',
            caption='LROC Narrow Angle Camera view of the Apollo 13 S-IVB kinetic impact crater.',
            credit='NASA/GSFC/Arizona State University',
        ),
    ],
    'apollo-14-descent': [
        MediaDTO(
            artifact_id='apollo-14-descent',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/as14-66-9306/as14-66-9306~medium.jpg',
            nasa_id_or_pia='as14-66-9306',
            caption='Apollo 14 Lunar Module Antares resting in Fra Mauro highlands.',
            credit='NASA/Ed Mitchell',
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
    'apollo-16-descent': [
        MediaDTO(
            artifact_id='apollo-16-descent',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/as16-113-18339/as16-113-18339~medium.jpg',
            nasa_id_or_pia='as16-113-18339',
            caption='Apollo 16 Lunar Module Orion in Descartes Highlands.',
            credit='NASA/Charlie Duke',
        ),
    ],
    'apollo-17-challenger': [
        MediaDTO(
            artifact_id='apollo-17-challenger',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/as17-134-20416/as17-134-20416~medium.jpg',
            nasa_id_or_pia='as17-134-20416',
            caption='Apollo 17 Lunar Module Challenger at Taurus-Littrow valley.',
            credit='NASA/Gene Cernan',
        ),
    ],
    'surveyor-1-lander': [
        MediaDTO(
            artifact_id='surveyor-1-lander',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/66-H-446/66-H-446~medium.jpg',
            nasa_id_or_pia='66-H-446',
            caption='Surveyor 1 footpad and shadow on lunar regolith in Oceanus Procellarum.',
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
    'surveyor-5-lander': [
        MediaDTO(
            artifact_id='surveyor-5-lander',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA04257.jpg',
            nasa_id_or_pia='PIA04257',
            caption='Surveyor 5 view of alpha-scattering instrument deployed on regolith in Mare Tranquillitatis.',
            credit='NASA/JPL',
        ),
    ],
    'surveyor-6-lander': [
        MediaDTO(
            artifact_id='surveyor-6-lander',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA04258.jpg',
            nasa_id_or_pia='PIA04258',
            caption='Surveyor 6 surface panorama of Sinus Medii after successful lunar hop.',
            credit='NASA/JPL',
        ),
    ],
    'surveyor-7-lander': [
        MediaDTO(
            artifact_id='surveyor-7-lander',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA04259.jpg',
            nasa_id_or_pia='PIA04259',
            caption='Surveyor 7 view of rocky ejecta blocks on north rim of Tycho crater.',
            credit='NASA/JPL',
        ),
    ],
    'ranger-7-impact': [
        MediaDTO(
            artifact_id='ranger-7-impact',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/64-H-1886/64-H-1886~medium.jpg',
            nasa_id_or_pia='64-H-1886',
            caption='Ranger 7 first close-up photograph of the lunar surface taken before kinetic impact.',
            credit='NASA/JPL',
        ),
    ],
    'lcross-centaur-impact': [
        MediaDTO(
            artifact_id='lcross-centaur-impact',
            media_category='ORBITAL',
            media_url='https://images-assets.nasa.gov/image/PIA13615/PIA13615~medium.jpg',
            nasa_id_or_pia='PIA13615',
            caption='LCROSS ejecta plume observation confirming water ice in Cabeus crater.',
            credit='NASA/Ames',
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
    'change-3-lander-yutu': [
        MediaDTO(
            artifact_id='change-3-lander-yutu',
            media_category='ORBITAL',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA17757.jpg',
            nasa_id_or_pia='PIA17757',
            caption='LROC orbital capture of Chang e 3 lander and Yutu rover tracks in Mare Imbrium.',
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
    'change-5-descent': [
        MediaDTO(
            artifact_id='change-5-descent',
            media_category='ORBITAL',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA24376.jpg',
            nasa_id_or_pia='PIA24376',
            caption='LROC orbital image of Chang e 5 landing site in Oceanus Procellarum.',
            credit='NASA/GSFC/Arizona State University',
        ),
    ],
    'beresheet-impact': [
        MediaDTO(
            artifact_id='beresheet-impact',
            media_category='ORBITAL',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA23164.jpg',
            nasa_id_or_pia='PIA23164',
            caption='LROC NAC image revealing the Beresheet impact site and dark ray halo in Mare Serenitatis.',
            credit='NASA/GSFC/Arizona State University',
        ),
    ],
    'chandrayaan-2-vikram-impact': [
        MediaDTO(
            artifact_id='chandrayaan-2-vikram-impact',
            media_category='ORBITAL',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA23588.jpg',
            nasa_id_or_pia='PIA23588',
            caption='LROC NAC mosaic showing the Chandrayaan-2 Vikram lander impact point and debris field.',
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
    'hakuto-r-m1-impact': [
        MediaDTO(
            artifact_id='hakuto-r-m1-impact',
            media_category='ORBITAL',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA25885.jpg',
            nasa_id_or_pia='PIA25885',
            caption='LROC image showing the Hakuto-R Mission 1 impact site and bright ejecta on the rim of Atlas crater.',
            credit='NASA/GSFC/Arizona State University',
        ),
    ],
    'opportunity-rover': [
        MediaDTO(
            artifact_id='opportunity-rover',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA22074.jpg',
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
    'perseverance-sample-depot': [
        MediaDTO(
            artifact_id='perseverance-sample-depot',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA25750.jpg',
            nasa_id_or_pia='PIA25750',
            caption='Perseverance WATSON camera view of the Three Forks sample depot cache tubes on the Martian surface.',
            credit='NASA/JPL-Caltech/MSSS',
        ),
    ],
    'perseverance-entry-debris': [
        MediaDTO(
            artifact_id='perseverance-entry-debris',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA25227.jpg',
            nasa_id_or_pia='PIA25227',
            caption='Ingenuity Mars Helicopter aerial view of Perseverance backshell and parachute on Flight 26.',
            credit='NASA/JPL-Caltech/ASU/MSSS',
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
    'pathfinder-station': [
        MediaDTO(
            artifact_id='pathfinder-station',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/PIA01120/PIA01120~medium.jpg',
            nasa_id_or_pia='PIA01120',
            caption='Carl Sagan Memorial Station and Sojourner rover exploring Ares Vallis.',
            credit='NASA/JPL',
        ),
    ],
    'sojourner-rover': [
        MediaDTO(
            artifact_id='sojourner-rover',
            media_category='SURFACE_PHOTO',
            media_url='https://images-assets.nasa.gov/image/PIA01120/PIA01120~medium.jpg',
            nasa_id_or_pia='PIA01120-rover',
            caption='Sojourner rover examining the Martian rock named Yogi near Mars Pathfinder station.',
            credit='NASA/JPL',
        ),
    ],
    'phoenix-lander': [
        MediaDTO(
            artifact_id='phoenix-lander',
            media_category='SURFACE_PHOTO',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA10738.jpg',
            nasa_id_or_pia='PIA10738',
            caption='Phoenix lander Surface Stereo Imager view of sublimation of water ice dice in Dodo-Goldilocks trench.',
            credit='NASA/JPL-Caltech/Univ. of Arizona/Max Planck',
        ),
    ],
    'schiaparelli-impact': [
        MediaDTO(
            artifact_id='schiaparelli-impact',
            media_category='ORBITAL',
            media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA21131.jpg',
            nasa_id_or_pia='PIA21131',
            caption='HiRISE high-resolution view of the ExoMars Schiaparelli impact site and parachute in Meridiani Planum.',
            credit='NASA/JPL-Caltech/University of Arizona',
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
