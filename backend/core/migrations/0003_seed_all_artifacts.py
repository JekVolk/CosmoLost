# Generated data migration to populate all 118 historical and active artifacts
import json
from pathlib import Path
import re
from datetime import datetime
from django.db import migrations

MOON_WMTS_URL = "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303P_100m/1.0.0/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"
MARS_WMTS_URL = "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"

def parse_date(date_str):
    if not date_str or not isinstance(date_str, str):
        return None
    date_str = date_str.strip()
    for fmt in ('%Y-%m-%d', '%Y/%m/%d', '%d-%m-%Y', '%B %d, %Y', '%b %d, %Y'):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            pass
    m = re.match(r'(\d{4})', date_str)
    if m:
        try:
            return datetime.strptime(f"{m.group(1)}-01-01", '%Y-%m-%d').date()
        except ValueError:
            pass
    return None

def map_type(t):
    t = (t or '').lower()
    if 'rover' in t:
        return 'ROVER'
    if 'helicopter' in t:
        return 'HELICOPTER'
    if 'descent' in t:
        return 'DESCENT_STAGE'
    if 'impact' in t:
        return 'IMPACT_STAGE'
    if 'reflector' in t:
        return 'RETRO_REFLECTOR'
    if 'sample' in t:
        return 'SAMPLE_TUBE'
    if 'debris' in t:
        return 'ENTRY_DEBRIS'
    if 'instrument' in t:
        return 'INSTRUMENT'
    if 'probe' in t:
        return 'DEEP_SPACE_PROBE'
    return 'LANDER'

def map_status(s):
    s = (s or '').lower()
    if s in ('operational', 'active'):
        return 'ACTIVE_TRANSMITTING'
    if s in ('historic', 'passive'):
        return 'PASSIVE_ACTIVE'
    if s in ('crashed', 'destroyed'):
        return 'DESTROYED_ON_IMPACT'
    return 'DORMANT'

def slugify(s):
    return re.sub(r'[^a-zA-Z0-9_\-]+', '-', s.strip().lower()).strip('-')

def seed_artifacts_from_json(apps, schema_editor):
    import sys
    import os
    # Skip during unit tests to avoid collision with test setups
    if 'test' in sys.argv or 'pytest' in sys.modules or os.getenv('PYTEST_CURRENT_TEST'):
        return

    CelestialBody = apps.get_model('core', 'CelestialBody')
    Mission = apps.get_model('core', 'Mission')
    Artifact = apps.get_model('core', 'Artifact')
    ArtifactMedia = apps.get_model('core', 'ArtifactMedia')
    ScientificDiscovery = apps.get_model('core', 'ScientificDiscovery')

    CelestialBody.objects.update_or_create(
        id='moon',
        defaults={
            'name': 'Moon',
            'radius_km': 1737.4,
            'gravity_ms2': 1.62,
            'coordinate_system_type': 'SELENOGRAPHIC',
            'wmts_tile_url': MOON_WMTS_URL,
        }
    )
    CelestialBody.objects.update_or_create(
        id='mars',
        defaults={
            'name': 'Mars',
            'radius_km': 3389.5,
            'gravity_ms2': 3.72,
            'coordinate_system_type': 'PLANETOCENTRIC_360',
            'wmts_tile_url': MARS_WMTS_URL,
        }
    )

    base_dir = Path(__file__).resolve().parent.parent.parent
    json_path = base_dir / 'all_artifacts.json'
    if not json_path.exists():
        print(f"Warning: {json_path} not found during migration.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for body_id, artifacts in data.items():
        try:
            body = CelestialBody.objects.get(id=body_id)
        except CelestialBody.DoesNotExist:
            continue

        for art in artifacts:
            art_id = art.get('id') or slugify(art.get('name'))
            mission_name = art.get('mission') or art.get('name') or 'Unknown Mission'
            mission_id = slugify(mission_name)

            mission, _ = Mission.objects.update_or_create(
                id=mission_id,
                defaults={
                    'name': mission_name,
                    'agency': art.get('agency') or art.get('country') or 'International',
                    'launch_date': parse_date(art.get('launchDate')),
                    'landing_date': parse_date(art.get('landingDate')),
                    'summary': art.get('description') or '',
                }
            )

            lat = float(art.get('lat') or 0.0)
            lon = float(art.get('lon') or 0.0)
            lat = max(-90.0, min(90.0, lat))
            if lon > 180.0:
                lon = lon - 360.0

            is_featured = (
                art.get('status') == 'historic'
                or 'apollo' in art_id
                or 'curiosity' in art_id
                or 'opportunity' in art_id
                or 'perseverance' in art_id
            )

            is_nasa = (
                art.get('agency') == 'NASA'
                or art.get('country') == 'USA'
                or 'NASA' in (art.get('agency') or '')
            )

            artifact_obj, _ = Artifact.objects.update_or_create(
                id=art_id,
                defaults={
                    'mission': mission,
                    'celestial_body': body,
                    'name': art.get('name'),
                    'artifact_type': map_type(art.get('type')),
                    'operational_status': map_status(art.get('status')),
                    'latitude': lat,
                    'longitude': lon,
                    'elevation_m': 0.0,
                    'location_name': art.get('locationName') or '',
                    'mass_kg': float(art.get('massKg')) if art.get('massKg') else None,
                    'cause_of_deactivation': art.get('whyAbandoned') or 'Mission duration completed.',
                    'first_person_monologue': art.get('firstPersonMonologue') or art.get('description') or '',
                    'is_featured': is_featured,
                    'is_nasa_hardware': is_nasa,
                }
            )

            img_url = art.get('imageUrl')
            if img_url:
                ArtifactMedia.objects.update_or_create(
                    artifact=artifact_obj,
                    media_url=img_url,
                    defaults={
                        'media_category': 'SURFACE_PHOTO',
                        'caption': f"{art.get('name')} surface photography",
                        'credit': art.get('agency') or 'NASA',
                    }
                )

            instruments = art.get('keyInstruments') or []
            for inst in instruments:
                ScientificDiscovery.objects.update_or_create(
                    artifact=artifact_obj,
                    title=inst.get('purpose') or inst.get('acronym') or 'Instrument Payload',
                    defaults={
                        'instrument_acronym': inst.get('acronym') or 'SCI',
                        'instrument_full_name': inst.get('fullName') or inst.get('purpose') or '',
                        'scientific_fact': inst.get('discovery') or '',
                        'kid_friendly_story': inst.get('discovery') or '',
                    }
                )

def backwards_noop(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_fix_artifact_3d_urls'),
    ]

    operations = [
        migrations.RunPython(seed_artifacts_from_json, backwards_noop),
    ]
