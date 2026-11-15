import os
import json
import re
from datetime import datetime
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import (
    CelestialBody,
    Mission,
    Artifact,
    ArtifactMedia,
    ScientificDiscovery,
    CoordinateSystemType,
    ArtifactType,
    OperationalStatus,
    MediaCategory,
)

MOON_WMTS_URL = "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303P_100m/1.0.0/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"
MARS_WMTS_URL = "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"

CelestialBody.objects.update_or_create(
    id='moon',
    defaults={
        'name': 'Moon',
        'radius_km': 1737.4,
        'gravity_ms2': 1.62,
        'coordinate_system_type': CoordinateSystemType.SELENOGRAPHIC,
        'wmts_tile_url': MOON_WMTS_URL,
    }
)
CelestialBody.objects.update_or_create(
    id='mars',
    defaults={
        'name': 'Mars',
        'radius_km': 3389.5,
        'gravity_ms2': 3.72,
        'coordinate_system_type': CoordinateSystemType.PLANETOCENTRIC_360,
        'wmts_tile_url': MARS_WMTS_URL,
    }
)

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
        return ArtifactType.ROVER
    if 'helicopter' in t:
        return ArtifactType.HELICOPTER
    if 'descent' in t:
        return ArtifactType.DESCENT_STAGE
    if 'impact' in t:
        return ArtifactType.IMPACT_STAGE
    if 'reflector' in t:
        return ArtifactType.RETRO_REFLECTOR
    if 'sample' in t:
        return ArtifactType.SAMPLE_TUBE
    if 'debris' in t:
        return ArtifactType.ENTRY_DEBRIS
    if 'instrument' in t:
        return ArtifactType.INSTRUMENT
    if 'probe' in t:
        return ArtifactType.DEEP_SPACE_PROBE
    return ArtifactType.LANDER

def map_status(s):
    s = (s or '').lower()
    if s in ('operational', 'active'):
        return OperationalStatus.ACTIVE
    if s in ('historic', 'passive'):
        return OperationalStatus.PASSIVE_ACTIVE
    if s in ('crashed', 'destroyed'):
        return OperationalStatus.DESTROYED
    return OperationalStatus.DORMANT

def slugify(s):
    return re.sub(r'[^a-zA-Z0-9_\-]+', '-', s.strip().lower()).strip('-')

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

with open(BASE_DIR / 'all_artifacts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for body_id, artifacts in data.items():
    body = CelestialBody.objects.get(id=body_id)
    print(f"Processing {len(artifacts)} artifacts for {body.name}...")
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

        artifact_obj, created = Artifact.objects.update_or_create(
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
                    'media_category': MediaCategory.SURFACE_PHOTO,
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

print("Finished! Total Artifacts in DB:", Artifact.objects.count())
