"""
Management command to populate database with verified NASA catalog data
for CosmoLost FastMCP gateway and Copilot tools.
"""

from django.core.management.base import BaseCommand
from core.models import (
    CelestialBody,
    CoordinateSystemType,
    Mission,
    Artifact,
    ArtifactType,
    OperationalStatus,
    TraverseWaypoint,
    ScientificDiscovery,
    ArtifactMedia,
    MediaCategory,
)
from loader.constants import NASA_3D_MODEL_CDN_MAP


class Command(BaseCommand):
    help = 'Seed database with verified NASA Lunar and Martian artifacts for FastMCP'

    def handle(self, *args, **options):
        self.stdout.write('Seeding verified NASA data for FastMCP...')

        # 1. Celestial Bodies
        moon, _ = CelestialBody.objects.update_or_create(
            id='moon',
            defaults={
                'name': 'Moon',
                'radius_km': 1737.4,
                'gravity_ms2': 1.62,
                'coordinate_system_type': CoordinateSystemType.SELENOGRAPHIC,
                'wmts_tile_url': 'https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303P_100m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
            }
        )

        mars, _ = CelestialBody.objects.update_or_create(
            id='mars',
            defaults={
                'name': 'Mars',
                'radius_km': 3389.5,
                'gravity_ms2': 3.72,
                'coordinate_system_type': CoordinateSystemType.PLANETOCENTRIC_360,
                'wmts_tile_url': 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_DEM_mosaic_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
            }
        )

        # 2. Missions
        apollo11, _ = Mission.objects.update_or_create(
            id='apollo-11',
            defaults={
                'nssdca_id': '1969-059A',
                'name': 'Apollo 11',
                'agency': 'NASA',
                'launch_date': '1969-07-16',
                'landing_date': '1969-07-20',
                'end_date': '1969-07-24',
                'summary': 'First human mission to land on the Moon, commanded by Neil Armstrong and Buzz Aldrin.',
            }
        )

        mars2020, _ = Mission.objects.update_or_create(
            id='mars-2020',
            defaults={
                'nssdca_id': '2020-052A',
                'name': 'Mars 2020',
                'agency': 'NASA/JPL',
                'launch_date': '2020-07-30',
                'landing_date': '2021-02-18',
                'summary': 'Astrobiology mission seeking signs of past microscopic life on Mars and caching rock cores for return.',
            }
        )

        mer_b, _ = Mission.objects.update_or_create(
            id='mer-b-opportunity',
            defaults={
                'nssdca_id': '2003-032A',
                'name': 'Mars Exploration Rover B (Opportunity)',
                'agency': 'NASA/JPL',
                'launch_date': '2003-07-08',
                'landing_date': '2004-01-25',
                'end_date': '2018-06-10',
                'summary': 'Longest-operating Mars rover, traveled 45.16 km across Meridiani Planum over nearly 15 years.',
            }
        )

        # 3. Artifacts
        art_lrrr, _ = Artifact.objects.update_or_create(
            id='apollo-11-lrrr',
            defaults={
                'mission': apollo11,
                'celestial_body': moon,
                'name': 'Apollo 11 Laser Ranging Retroreflector (LRRR)',
                'artifact_type': ArtifactType.RETRO_REFLECTOR,
                'operational_status': OperationalStatus.PASSIVE_ACTIVE,
                'latitude': 0.6734,
                'longitude': 23.4731,
                'elevation_m': 0.0,
                'location_name': 'Mare Tranquillitatis',
                'mass_kg': 30.0,
                'is_featured': True,
                'is_nasa_hardware': True,
                'cause_of_deactivation': 'Passive retroreflector array still operational after 55+ years with no power supply.',
                'first_person_monologue': 'I am the only Apollo 11 instrument still working today. When Earth lasers strike my quartz prisms, I bounce the photon beam back.',
                'model_3d_url': '',
            }
        )

        art_eagle_descent, _ = Artifact.objects.update_or_create(
            id='apollo-11-descent-stage',
            defaults={
                'mission': apollo11,
                'celestial_body': moon,
                'name': 'Apollo 11 Lunar Module Descent Stage (Eagle)',
                'artifact_type': ArtifactType.DESCENT_STAGE,
                'operational_status': OperationalStatus.DEACTIVATED,
                'latitude': 0.6741,
                'longitude': 23.4730,
                'elevation_m': 0.0,
                'location_name': 'Statio Tranquillitatis',
                'mass_kg': 2034.0,
                'is_featured': True,
                'is_nasa_hardware': True,
                'cause_of_deactivation': 'Descent rocket engine fuel depleted upon touchdown; served as launch pad for ascent module.',
                'first_person_monologue': 'Houston, Tranquility Base here. The Eagle has landed.',
                'model_3d_url': NASA_3D_MODEL_CDN_MAP['apollo-11-descent-stage'],
            }
        )

        art_percy, _ = Artifact.objects.update_or_create(
            id='perseverance-rover',
            defaults={
                'mission': mars2020,
                'celestial_body': mars,
                'name': 'Perseverance Rover',
                'artifact_type': ArtifactType.ROVER,
                'operational_status': OperationalStatus.ACTIVE,
                'latitude': 18.4447,
                'longitude': 77.4508,
                'elevation_m': -2570.0,
                'location_name': 'Jezero Crater',
                'mass_kg': 1025.0,
                'last_contact_sol': 1300,
                'is_featured': True,
                'is_nasa_hardware': True,
                'cause_of_deactivation': '',
                'first_person_monologue': 'I am exploring an ancient lake and delta system on Mars, caching sample tubes for future return to Earth.',
                'model_3d_url': NASA_3D_MODEL_CDN_MAP['perseverance-rover'],
            }
        )

        art_oppy, _ = Artifact.objects.update_or_create(
            id='opportunity-rover',
            defaults={
                'mission': mer_b,
                'celestial_body': mars,
                'name': 'Opportunity Rover (MER-B)',
                'artifact_type': ArtifactType.ROVER,
                'operational_status': OperationalStatus.DORMANT,
                'latitude': -2.3378,
                'longitude': 354.4608,
                'elevation_m': -1400.0,
                'location_name': 'Perseverance Valley, Endeavour Crater',
                'mass_kg': 185.0,
                'last_contact_sol': 5111,
                'is_featured': True,
                'is_nasa_hardware': True,
                'cause_of_deactivation': 'Global 2018 Martian dust storm cut solar panel illumination below operational threshold.',
                'first_person_monologue': 'My battery is low and it is getting dark. I completed a 90-day mission that lasted over 14 years.',
                'model_3d_url': NASA_3D_MODEL_CDN_MAP['opportunity-rover'],
            }
        )

        # 4. Waypoints
        TraverseWaypoint.objects.update_or_create(
            id='wp-percy-last',
            defaults={
                'artifact': art_percy,
                'sol_or_step': 1300,
                'latitude': 18.4851,
                'longitude': 77.4120,
                'elevation_m': -2540.0,
                'odometry_m': 31200.0,
                'telemetry_snapshot': {
                    'power_wh': 820,
                    'dust_tau': 0.42,
                    'tilt_deg': 1.8,
                    'ambient_temp_c': -65.2,
                },
                'story_snippet': 'Ascending the Jezero Crater rim; sample tube #25 safely sealed.',
            }
        )

        TraverseWaypoint.objects.update_or_create(
            id='wp-oppy-last',
            defaults={
                'artifact': art_oppy,
                'sol_or_step': 5111,
                'latitude': -2.3378,
                'longitude': 354.4608,
                'elevation_m': -1400.0,
                'odometry_m': 45160.0,
                'telemetry_snapshot': {
                    'power_wh': 22,
                    'dust_tau': 10.8,
                    'tilt_deg': 8.4,
                    'ambient_temp_c': -72.0,
                },
                'story_snippet': 'Final transmission received by Deep Space Network prior to global dust storm cutoff.',
            }
        )

        # 5. Scientific Discoveries
        ScientificDiscovery.objects.update_or_create(
            id='disc-percy-sherloc',
            defaults={
                'artifact': art_percy,
                'instrument_acronym': 'SHERLOC',
                'instrument_full_name': 'Scanning Habitable Environments with Raman & Luminescence for Organics & Chemicals',
                'title': 'Aromatic Organic Molecules in Delta Siltstone',
                'kid_friendly_story': 'I used my ultraviolet laser to find carbon building blocks that could once have formed ancient life!',
                'scientific_fact': 'Raman spectroscopy confirmed localized aromatic carbon signatures in the Wildcat Ridge sedimentary member.',
            }
        )

        ScientificDiscovery.objects.update_or_create(
            id='disc-oppy-blueberries',
            defaults={
                'artifact': art_oppy,
                'instrument_acronym': 'APXS',
                'instrument_full_name': 'Alpha Particle X-Ray Spectrometer',
                'title': 'Hematite Spherules (Martian Blueberries)',
                'kid_friendly_story': 'I discovered tiny stone marbles across the plains that only grow inside pools of liquid water!',
                'scientific_fact': 'Mössbauer and APXS spectrometry proved grey hematite mineral concretions formed in neutral pH groundwater.',
            }
        )

        # 6. Artifact Media
        ArtifactMedia.objects.update_or_create(
            id='media-percy-selfie',
            defaults={
                'artifact': art_percy,
                'media_category': MediaCategory.SURFACE_PHOTO,
                'media_url': 'https://photojournal.jpl.nasa.gov/jpeg/PIA24424.jpg',
                'nasa_id_or_pia': 'PIA24424',
                'caption': 'Perseverance rover selfie at Rochette drill site with Mastcam-Z and SuperCam visible.',
                'credit': 'NASA/JPL-Caltech/MSSS',
            }
        )

        ArtifactMedia.objects.update_or_create(
            id='media-oppy-panorama',
            defaults={
                'artifact': art_oppy,
                'media_category': MediaCategory.PANORAMA,
                'media_url': 'https://photojournal.jpl.nasa.gov/jpeg/PIA18604.jpg',
                'nasa_id_or_pia': 'PIA18604',
                'caption': 'Opportunity 360-degree color panorama from Wdowiak Ridge overlooking Endeavour Crater.',
                'credit': 'NASA/JPL-Caltech/Cornell/ASU',
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded verified NASA MCP catalog data!'))
