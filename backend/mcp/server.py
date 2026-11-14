"""
CosmoLost Server FastMCP Gateway.
Model Context Protocol for external LLM agents (Claude / Copilot / Gemini).
Direct Relational & Full-Text Search strictly over 8 core PostgreSQL tables.
"""

import os
import sys
from datetime import timedelta
import django

# Initialize Django environment for ORM access
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from fastmcp import FastMCP
from django.db.models import Q
from core.models import (
    Artifact,
    Mission,
    CelestialBody,
    TraverseWaypoint,
    ScientificDiscovery,
    ArtifactMedia,
    ArtifactType,
)

# FastMCP server instance
mcp = FastMCP("CosmoLost Space Knowledge Gateway")


def sol_to_earth_date(landing_date, sol: int | None) -> str | None:
    """Calculate approximate Earth calendar date for a Mars Sol (1 Sol ≈ 1.02749125 Earth days)."""
    if landing_date and sol is not None:
        try:
            return str(landing_date + timedelta(days=int(sol * 1.02749125)))
        except (ValueError, OverflowError):
            return None
    return None


# =============================================================================
# TOOL 1: Direct Relational Search for Artifacts
# =============================================================================
@mcp.tool()
def search_artifacts(
    query: str = "",
    celestial_body: str = "",
    artifact_type: str = "",
    operational_status: str = "",
    is_featured: bool = False,
    limit: int = 20,
    offset: int = 0,
) -> list[dict]:
    """
    Search space artifacts on Moon and Mars using official NASA catalogs.
    Returns list of matching equipment with normalized coordinates, type, and status.
    """
    qs = Artifact.objects.select_related('mission', 'celestial_body')

    # Sanitize and apply filters
    c_body = celestial_body.strip().lower() if celestial_body else ""
    if c_body:
        qs = qs.filter(celestial_body_id=c_body)

    a_type = artifact_type.strip().upper().replace('-', '_') if artifact_type else ""
    if a_type:
        qs = qs.filter(artifact_type=a_type)

    op_status = operational_status.strip().upper().replace('-', '_') if operational_status else ""
    if op_status:
        qs = qs.filter(operational_status=op_status)

    if is_featured:
        qs = qs.filter(is_featured=True)

    q_clean = query.strip() if query else ""
    if q_clean:
        qs = qs.filter(
            Q(name__icontains=q_clean) |
            Q(location_name__icontains=q_clean) |
            Q(cause_of_deactivation__icontains=q_clean)
        )

    # Safe pagination bounds check
    try:
        safe_limit = max(1, min(int(limit), 100))
    except (ValueError, TypeError):
        safe_limit = 20

    try:
        safe_offset = max(0, int(offset))
    except (ValueError, TypeError):
        safe_offset = 0

    results = []
    for art in qs[safe_offset : safe_offset + safe_limit]:
        _, norm_lon = art.normalize_coords()
        results.append({
            'artifact_id': art.id,
            'name': art.name,
            'celestial_body': art.celestial_body_id,
            'mission_name': art.mission.name if art.mission else 'N/A',
            'artifact_type': art.artifact_type,
            'operational_status': art.operational_status,
            'latitude': art.latitude,
            'longitude': art.longitude,
            'longitude_normalized': norm_lon,
            'location_name': art.location_name,
            'is_featured': art.is_featured,
        })
    return results


# =============================================================================
# TOOL 2: Detailed Artifact Passport
# =============================================================================
@mcp.tool()
def get_artifact_details(artifact_id: str) -> dict:
    """
    Retrieve comprehensive verified technical passport, coordinates, lifetime dates,
    cause of deactivation, and first-person storytelling script (en-US).
    """
    art_id = artifact_id.strip() if artifact_id else ""
    if not art_id:
        return {'error': 'artifact_id must be provided and cannot be empty'}

    try:
        art = Artifact.objects.select_related('mission', 'celestial_body').get(id=art_id)
    except Artifact.DoesNotExist:
        return {'error': f'Artifact with id "{art_id}" not found'}

    _, norm_lon = art.normalize_coords()
    earth_date = sol_to_earth_date(
        art.mission.landing_date if art.mission else None,
        art.last_contact_sol
    )
    agency = art.mission.agency if art.mission else 'N/A'

    return {
        'id': art.id,
        'name': art.name,
        'mission_name': art.mission.name if art.mission else 'N/A',
        'agency': agency,
        'celestial_body': art.celestial_body_id,
        'artifact_type': art.artifact_type,
        'operational_status': art.operational_status,
        'latitude': art.latitude,
        'longitude': art.longitude,
        'longitude_normalized': norm_lon,
        'elevation_m': art.elevation_m,
        'location_name': art.location_name,
        'mass_kg': art.mass_kg,
        'last_contact_sol': art.last_contact_sol,
        'last_contact_earth_date_estimated': earth_date,
        'cause_of_deactivation': art.cause_of_deactivation,
        'first_person_monologue': art.first_person_monologue,
        'model_3d_url': art.model_3d_url,
    }


# =============================================================================
# TOOL 3: NASA Mission Equipment Manifest
# =============================================================================
@mcp.tool()
def get_mission_manifest(mission_id: str) -> dict:
    """
    List all hardware items, stages, instruments, and debris left on the surface by a specific NASA mission.
    """
    m_id = mission_id.strip() if mission_id else ""
    if not m_id:
        return {'error': 'mission_id must be provided and cannot be empty'}

    try:
        mission = Mission.objects.prefetch_related('artifacts').get(id=m_id)
    except Mission.DoesNotExist:
        return {'error': f'Mission with id "{m_id}" not found'}

    artifacts = [
        {
            'id': art.id,
            'name': art.name,
            'type': art.artifact_type,
            'status': art.operational_status,
            'location': art.location_name,
        }
        for art in mission.artifacts.all()
    ]

    return {
        'mission_id': mission.id,
        'nssdca_id': mission.nssdca_id,
        'name': mission.name,
        'agency': mission.agency,
        'launch_date': str(mission.launch_date) if mission.launch_date else None,
        'landing_date': str(mission.landing_date) if mission.landing_date else None,
        'summary': mission.summary,
        'manifest_count': len(artifacts),
        'hardware_items': artifacts,
    }


# =============================================================================
# TOOL 4: Chronology and Final Telemetry (Last Sol)
# =============================================================================
@mcp.tool()
def get_last_sol_chronology(artifact_id: str) -> dict:
    """
    Fetch final telemetry packet (power Wh, dust tau, tilt, temperature) and last known status transmission.
    """
    art_id = artifact_id.strip() if artifact_id else ""
    if not art_id:
        return {'error': 'artifact_id must be provided and cannot be empty'}

    try:
        art = Artifact.objects.select_related('mission').get(id=art_id)
    except Artifact.DoesNotExist:
        return {'error': f'Artifact with id "{art_id}" not found'}

    waypoints = TraverseWaypoint.objects.filter(artifact=art).order_by('-sol_or_step')
    last_wp = waypoints.first()

    if not last_wp:
        return {
            'artifact_id': art.id,
            'name': art.name,
            'message': f'No telemetry waypoints recorded for hardware "{art.name}".',
            'waypoints_count': 0,
        }

    norm_lon = last_wp.longitude if last_wp.longitude <= 180.0 else last_wp.longitude - 360.0
    earth_date = sol_to_earth_date(
        art.mission.landing_date if art.mission else None,
        last_wp.sol_or_step
    )

    return {
        'artifact_id': art.id,
        'name': art.name,
        'final_sol_or_step': last_wp.sol_or_step,
        'earth_date_estimated': earth_date,
        'latitude': last_wp.latitude,
        'longitude': last_wp.longitude,
        'longitude_normalized': norm_lon,
        'cumulative_odometry_m': last_wp.odometry_m,
        'telemetry_snapshot': last_wp.telemetry_snapshot,
        'last_story_snippet': last_wp.story_snippet,
        'total_waypoints_recorded': waypoints.count(),
    }


# =============================================================================
# TOOL 5: Scientific Discoveries and Onboard Instruments
# =============================================================================
@mcp.tool()
def get_science_discoveries(artifact_id: str) -> list[dict]:
    """
    Get scientific instruments onboard and peer-reviewed discoveries with both rigorous facts and kid-friendly analogies.
    """
    art_id = artifact_id.strip() if artifact_id else ""
    if not art_id:
        return [{'error': 'artifact_id must be provided and cannot be empty'}]

    if not Artifact.objects.filter(id=art_id).exists():
        return [{'error': f'Artifact with id "{art_id}" not found'}]

    discoveries = ScientificDiscovery.objects.filter(artifact_id=art_id)
    return [
        {
            'instrument_acronym': disc.instrument_acronym,
            'instrument_full_name': disc.instrument_full_name,
            'discovery_title': disc.title,
            'kid_friendly_story': disc.kid_friendly_story,
            'scientific_fact_pds': disc.scientific_fact,
        }
        for disc in discoveries
    ]


# =============================================================================
# TOOL 6: Verified NASA Citations and References
# =============================================================================
@mcp.tool()
def get_verified_citations(artifact_id: str) -> dict:
    """
    Retrieve official NSSDCA catalog ID, NASA PDS citation statements, and mandatory copyright attribution.
    """
    art_id = artifact_id.strip() if artifact_id else ""
    if not art_id:
        return {'error': 'artifact_id must be provided and cannot be empty'}

    try:
        art = Artifact.objects.select_related('mission').get(id=art_id)
    except Artifact.DoesNotExist:
        return {'error': f'Artifact "{art_id}" not found'}

    agency = art.mission.agency if art.mission else 'NASA'
    nssdca = art.mission.nssdca_id if art.mission else 'N/A'
    mandatory_credit = f'Image and Data courtesy of {agency} / NSSDCA'

    pds_node = 'NASA Planetary Data System (PDS) Geosciences Node'
    if 'ESA' in agency:
        pds_node = 'ESA Planetary Science Archive (PSA) / NASA PDS'

    return {
        'artifact_id': art.id,
        'name': art.name,
        'agency': agency,
        'nssdca_catalog_id': nssdca,
        'mandatory_credit': mandatory_credit,
        'cosmolost_canonical_url': f'https://cosmolost.lihtar.org/artifacts/{art.id}',
        'pds_data_node': pds_node,
    }


# =============================================================================
# TOOL 7: 3D Models and Archival Photos
# =============================================================================
@mcp.tool()
def get_3d_and_media_assets(artifact_id: str) -> dict:
    """
    Fetch direct open URLs for interactive 3D .glb models and NASA archival high-resolution photos.
    """
    art_id = artifact_id.strip() if artifact_id else ""
    if not art_id:
        return {'error': 'artifact_id must be provided and cannot be empty'}

    try:
        art = Artifact.objects.prefetch_related('media', 'mission').get(id=art_id)
    except Artifact.DoesNotExist:
        return {'error': f'Artifact "{art_id}" not found'}

    default_credit = art.mission.agency if art.mission else 'NASA'
    media_items = [
        {
            'category': m.media_category,
            'url': m.media_url,
            'caption': m.caption,
            'pia_id': m.nasa_id_or_pia,
            'credit': m.credit or default_credit,
        }
        for m in art.media.all()
    ]

    return {
        'artifact_id': art.id,
        'model_3d_glb_url': art.model_3d_url,
        'photos_count': len(media_items),
        'media_files': media_items,
    }


# =============================================================================
# TOOL 8: Active and Passive Operating Artifacts
# =============================================================================
@mcp.tool()
def list_active_passive_artifacts(celestial_body: str = "") -> list[dict]:
    """
    Discover hardware items still operational or useful today without batteries (e.g. laser retroreflectors, sample depot tubes).
    """
    qs = Artifact.objects.filter(operational_status='PASSIVE_ACTIVE')
    c_body = celestial_body.strip().lower() if celestial_body else ""
    if c_body:
        qs = qs.filter(celestial_body_id=c_body)

    results = []
    for art in qs:
        # Determine actual role dynamically based on deactivation cause or hardware type
        if art.cause_of_deactivation:
            role = art.cause_of_deactivation
        elif art.artifact_type == ArtifactType.RETRO_REFLECTOR:
            role = 'Reflects laser pulses from Earth observatories for millimeter-precision lunar distance measurement.'
        elif art.artifact_type == ArtifactType.SAMPLE_TUBE:
            role = 'Caches sealed Martian rock and soil core samples on the surface for future retrieval.'
        else:
            role = f'Passive surface hardware ({art.get_artifact_type_display()}) preserved in situ.'

        results.append({
            'artifact_id': art.id,
            'name': art.name,
            'celestial_body': art.celestial_body_id,
            'type': art.artifact_type,
            'location': art.location_name,
            'scientific_role': role,
        })
    return results


# =============================================================================
# TOOL 9: Primary Navigation - List Celestial Bodies
# =============================================================================
@mcp.tool()
def list_celestial_bodies() -> list[dict]:
    """
    List all supported celestial bodies (e.g. Moon, Mars) with physical parameters
    and official cartographic coordinate systems.
    """
    bodies = CelestialBody.objects.all().order_by('name')
    return [
        {
            'id': b.id,
            'name': b.name,
            'radius_km': b.radius_km,
            'gravity_ms2': b.gravity_ms2,
            'coordinate_system_type': b.coordinate_system_type,
            'artifacts_count': b.artifacts.count(),
        }
        for b in bodies
    ]


# =============================================================================
# TOOL 10: Primary Navigation - List Space Exploration Missions
# =============================================================================
@mcp.tool()
def list_missions(agency: str = "", celestial_body: str = "") -> list[dict]:
    """
    List space exploration missions with hardware on Moon or Mars surfaces.
    Allows filtering by space agency (NASA, ESA, etc.) or celestial body.
    """
    qs = Mission.objects.prefetch_related('artifacts').all().order_by('name')
    if agency:
        qs = qs.filter(agency__icontains=agency.strip())
    if celestial_body:
        qs = qs.filter(artifacts__celestial_body_id=celestial_body.strip().lower()).distinct()

    return [
        {
            'mission_id': m.id,
            'nssdca_id': m.nssdca_id,
            'name': m.name,
            'agency': m.agency,
            'launch_date': str(m.launch_date) if m.launch_date else None,
            'landing_date': str(m.landing_date) if m.landing_date else None,
            'summary': m.summary,
            'hardware_count': m.artifacts.count(),
        }
        for m in qs[:50]
    ]


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description="CosmoLost FastMCP Gateway")
    parser.add_argument('--transport', choices=['stdio', 'sse'], default=os.getenv('MCP_TRANSPORT', 'stdio'))
    parser.add_argument('--host', default=os.getenv('MCP_HOST', '0.0.0.0'))
    parser.add_argument('--port', type=int, default=int(os.getenv('MCP_PORT', '8005')))
    parser.add_argument('--sse', action='store_true', help='Launch using Server-Sent Events (SSE) transport')
    args = parser.parse_args()

    active_transport = 'sse' if args.sse else args.transport
    if active_transport == 'sse':
        print(f"Starting CosmoLost FastMCP Gateway on SSE transport at http://{args.host}:{args.port}")
        mcp.run(transport='sse', host=args.host, port=args.port)
    else:
        mcp.run(transport='stdio')
