"""
CosmoLost Server FastMCP Gateway.
Model Context Protocol for external LLM agents (Claude / Copilot / Gemini).
Direct Relational & Full-Text Search strictly over 8 core PostgreSQL tables.
Hardened against injection, ReDoS, memory exhaustion, NaN/Inf JSON crashes, and stale connections.
"""

import os
import sys
import re
import math
from datetime import timedelta
import django

# Initialize Django environment for ORM access
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from fastmcp import FastMCP
from django.db import close_old_connections
from django.db.models import Q, Count
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


# =============================================================================
# Security & Sanitization Helpers
# =============================================================================
def sanitize_string(val: str, max_length: int = 150) -> str:
    """Strip null bytes, non-printable control characters, and enforce max length."""
    if not isinstance(val, str):
        return ""
    # Strip null bytes and non-printable control characters (except space, tab)
    clean = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', val)
    return clean.strip()[:max_length]


def sanitize_slug(val: str, max_length: int = 100) -> str:
    """Enforce strict slug format (alphanumeric, underscores, hyphens) to prevent traversal."""
    if not isinstance(val, str):
        return ""
    clean = re.sub(r'[\x00-\x1F\x7F]', '', val).strip()
    clean = re.sub(r'[^a-zA-Z0-9_\-]', '', clean)
    return clean[:max_length]


def sanitize_pagination(limit, offset, max_limit: int = 100) -> tuple[int, int]:
    """Protect against integer overflow and negative pagination bounds."""
    try:
        safe_lim = max(1, min(int(limit), max_limit))
    except (ValueError, TypeError, OverflowError):
        safe_lim = 20

    try:
        safe_off = max(0, min(int(offset), 100_000))
    except (ValueError, TypeError, OverflowError):
        safe_off = 0

    return safe_lim, safe_off


def safe_float(val: float | None, default: float | None = None) -> float | None:
    """Ensure float is finite (prevents NaN/Infinity JSON RFC 8259 parser crashes)."""
    if val is None:
        return default
    try:
        f = float(val)
        return f if math.isfinite(f) else default
    except (ValueError, TypeError):
        return default


def sol_to_earth_date(landing_date, sol: int | None) -> str | None:
    """Calculate approximate Earth calendar date for a Mars Sol with strict bounds."""
    if landing_date and sol is not None:
        try:
            sol_int = int(sol)
            if 0 <= sol_int <= 50_000:
                return str(landing_date + timedelta(days=int(sol_int * 1.02749125)))
        except (ValueError, TypeError, OverflowError):
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
    """Search and filter lunar and Martian surface hardware in the verified NASA catalog.

    Use this tool when the user asks to find, list, or search for equipment, rovers,
    landers, reflectors, or instruments on planetary surfaces.

    Args:
        query: Keyword matching hardware name (e.g. 'Perseverance', 'Eagle'), location (e.g. 'Jezero', 'Tranquillitatis'), or failure cause.
        celestial_body: Target planetary body slug, either 'moon' or 'mars'.
        artifact_type: Hardware category ('ROVER', 'HELICOPTER', 'LANDER', 'DESCENT_STAGE', 'IMPACT_STAGE', 'INSTRUMENT', 'RETRO_REFLECTOR', 'SAMPLE_TUBE', 'ENTRY_DEBRIS').
        operational_status: Status filter ('ACTIVE', 'PASSIVE_ACTIVE', 'DORMANT', 'SLEEPING', 'DEACTIVATED', 'DESTROYED').
        is_featured: If True, restricts results to high-significance curated highlights.
        limit: Maximum items to return (1-100, default 20).
        offset: Starting index for pagination (default 0).

    Returns:
        List of matching artifacts with normalized coordinates, type, mission name, and operational status.
    """
    close_old_connections()
    qs = Artifact.objects.select_related('mission', 'celestial_body')

    # Sanitize and apply filters
    c_body = sanitize_slug(celestial_body, 50).lower()
    if c_body:
        qs = qs.filter(celestial_body_id=c_body)

    a_type = sanitize_slug(artifact_type, 50).upper().replace('-', '_')
    if a_type:
        qs = qs.filter(artifact_type=a_type)

    op_status = sanitize_slug(operational_status, 50).upper().replace('-', '_')
    if op_status:
        qs = qs.filter(operational_status=op_status)

    if is_featured:
        qs = qs.filter(is_featured=True)

    q_clean = sanitize_string(query, max_length=150)
    if q_clean:
        qs = qs.filter(
            Q(name__icontains=q_clean) |
            Q(location_name__icontains=q_clean) |
            Q(cause_of_deactivation__icontains=q_clean)
        )

    safe_limit, safe_offset = sanitize_pagination(limit, offset, max_limit=100)

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
            'latitude': safe_float(art.latitude, 0.0),
            'longitude': safe_float(art.longitude, 0.0),
            'longitude_normalized': safe_float(norm_lon, 0.0),
            'location_name': art.location_name,
            'is_featured': art.is_featured,
        })
    return results


# =============================================================================
# TOOL 2: Detailed Artifact Passport
# =============================================================================
@mcp.tool()
def get_artifact_details(artifact_id: str) -> dict:
    """Retrieve comprehensive verified engineering passport, coordinates, and monologue for a specific artifact.

    Use this tool when you have an artifact ID and need its exact landing coordinates, mass,
    lifetime dates, primary failure cause, 3D model asset URL, or first-person storytelling script.

    Args:
        artifact_id: Unique artifact identifier slug (e.g. 'perseverance-rover', 'apollo-11-lrrr', 'opportunity-rover').

    Returns:
        Dictionary containing verified technical specifications, coordinates, elevation, mass, Sol dates, and monologue.
    """
    close_old_connections()
    art_id = sanitize_slug(artifact_id, 100)
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
        'latitude': safe_float(art.latitude, 0.0),
        'longitude': safe_float(art.longitude, 0.0),
        'longitude_normalized': safe_float(norm_lon, 0.0),
        'elevation_m': safe_float(art.elevation_m),
        'location_name': art.location_name,
        'mass_kg': safe_float(art.mass_kg),
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
    """Fetch the complete equipment and debris manifest deposited on planetary surfaces by a specific space mission.

    Use this tool when investigating a specific mission (e.g. Apollo 11, Mars 2020) to discover
    all stages, landers, rovers, tools, and hardware left behind.

    Args:
        mission_id: Unique mission identifier slug (e.g. 'apollo-11', 'mars-2020', 'mer-b-opportunity').

    Returns:
        Dictionary with mission details, launch/landing dates, summary, total count, and hardware list.
    """
    close_old_connections()
    m_id = sanitize_slug(mission_id, 100)
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
    """Retrieve final recorded telemetry packet and last status transmission before mission conclusion.

    Use this tool when asking about the end of a mission, final Sol coordinates, cumulative
    odometry distance, solar power levels (Wh), atmospheric dust opacity (tau), tilt, or final log.

    Args:
        artifact_id: Unique artifact slug with recorded traverse waypoints (e.g. 'opportunity-rover', 'perseverance-rover').

    Returns:
        Dictionary with final sol number, estimated Earth calendar date, coordinates, odometry, telemetry snapshot, and story snippet.
    """
    close_old_connections()
    art_id = sanitize_slug(artifact_id, 100)
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

    # Context window bomb protection: limit snapshot payload size
    telemetry = last_wp.telemetry_snapshot
    if isinstance(telemetry, dict) and len(str(telemetry)) > 15_000:
        telemetry = {k: telemetry[k] for k in list(telemetry.keys())[:25]}
        telemetry['_truncated'] = True

    return {
        'artifact_id': art.id,
        'name': art.name,
        'final_sol_or_step': last_wp.sol_or_step,
        'earth_date_estimated': earth_date,
        'latitude': safe_float(last_wp.latitude, 0.0),
        'longitude': safe_float(last_wp.longitude, 0.0),
        'longitude_normalized': safe_float(norm_lon, 0.0),
        'cumulative_odometry_m': safe_float(last_wp.odometry_m),
        'telemetry_snapshot': telemetry,
        'last_story_snippet': last_wp.story_snippet,
        'total_waypoints_recorded': waypoints.count(),
    }


# =============================================================================
# TOOL 5: Scientific Discoveries and Onboard Instruments
# =============================================================================
@mcp.tool()
def get_science_discoveries(artifact_id: str) -> list[dict]:
    """Retrieve peer-reviewed scientific breakthroughs and onboard scientific instruments for an artifact.

    Use this tool when asking what scientific discoveries an artifact made (e.g., Martian blueberries,
    ancient water evidence, organic molecules) or what instruments it carried (SHERLOC, APXS, Mastcam).

    Args:
        artifact_id: Unique artifact slug (e.g. 'perseverance-rover', 'opportunity-rover').

    Returns:
        List of scientific discoveries with instrument acronym, full name, discovery title, kid-friendly explanation, and PDS fact.
    """
    close_old_connections()
    art_id = sanitize_slug(artifact_id, 100)
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
    """Retrieve official NASA/ESA catalog designators, PDS citation statements, and mandatory copyright lines.

    Use this tool when needing official citations, NSSDCA ID, canonical archive URLs, or
    attribution lines to verify facts, avoid hallucinations, or cite data in research.

    Args:
        artifact_id: Unique artifact slug (e.g. 'apollo-11-lrrr', 'perseverance-rover').

    Returns:
        Dictionary containing NSSDCA catalog ID, space agency, mandatory credit string, canonical URL, and PDS node.
    """
    close_old_connections()
    art_id = sanitize_slug(artifact_id, 100)
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
    """Retrieve open CDN URLs for interactive 3D .glb models and NASA archival high-resolution photography.

    Use this tool when needing visual media, 3D model URLs for interactive rendering, or
    official NASA Photojournal codes (PIA IDs) and captions.

    Args:
        artifact_id: Unique artifact slug (e.g. 'perseverance-rover', 'opportunity-rover').

    Returns:
        Dictionary with 3D model URL (.glb), photos count, and list of media files with categories, PIA IDs, and credits.
    """
    close_old_connections()
    art_id = sanitize_slug(artifact_id, 100)
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
    """Discover surface hardware still operating or scientifically useful today without battery power.

    Use this tool when asking what items left on the Moon or Mars are still functional today
    (e.g. retroreflectors reflecting observatory laser beams, sealed sample container tubes).

    Args:
        celestial_body: Optional planetary body slug filter ('moon' or 'mars').

    Returns:
        List of passive active equipment with artifact ID, name, body, type, location, and dynamic scientific role.
    """
    close_old_connections()
    qs = Artifact.objects.filter(operational_status='PASSIVE_ACTIVE')
    c_body = sanitize_slug(celestial_body, 50).lower()
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
    """List all supported planetary bodies with physical characteristics and cartographic coordinate systems.

    Use this tool for initial catalog exploration, finding supported planets/moons,
    or checking surface gravity, radius, and total landed artifact counts.

    Returns:
        List of celestial bodies (Moon, Mars) with physical radius (km), gravity (m/s^2), and coordinate system type.
    """
    close_old_connections()
    bodies = CelestialBody.objects.annotate(art_count=Count('artifacts')).order_by('name')
    return [
        {
            'id': b.id,
            'name': b.name,
            'radius_km': safe_float(b.radius_km, 0.0),
            'gravity_ms2': safe_float(b.gravity_ms2, 0.0),
            'coordinate_system_type': b.coordinate_system_type,
            'artifacts_count': b.art_count,
        }
        for b in bodies
    ]


# =============================================================================
# TOOL 10: Primary Navigation - List Space Exploration Missions
# =============================================================================
@mcp.tool()
def list_missions(agency: str = "", celestial_body: str = "") -> list[dict]:
    """List space exploration missions represented in the catalog with hardware counts and landing dates.

    Use this tool when asking what missions exist in the database, finding missions by agency
    (NASA, ESA, CNSA), or checking historical launch/landing timelines.

    Args:
        agency: Optional space agency name filter (e.g. 'NASA', 'ESA').
        celestial_body: Optional planetary body slug filter ('moon' or 'mars').

    Returns:
        List of space missions with NSSDCA ID, name, agency, dates, summary, and hardware count.
    """
    close_old_connections()
    qs = Mission.objects.annotate(hw_count=Count('artifacts')).order_by('name')

    clean_agency = sanitize_string(agency, 50)
    if clean_agency:
        qs = qs.filter(agency__icontains=clean_agency)

    clean_body = sanitize_slug(celestial_body, 50).lower()
    if clean_body:
        qs = qs.filter(artifacts__celestial_body_id=clean_body).distinct()

    return [
        {
            'mission_id': m.id,
            'nssdca_id': m.nssdca_id,
            'name': m.name,
            'agency': m.agency,
            'launch_date': str(m.launch_date) if m.launch_date else None,
            'landing_date': str(m.landing_date) if m.landing_date else None,
            'summary': m.summary,
            'hardware_count': m.hw_count,
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

    # Validate port bounds
    if not (1024 <= args.port <= 65535):
        print(f"Error: Invalid port {args.port}. Port must be between 1024 and 65535.", file=sys.stderr)
        sys.exit(1)

    active_transport = 'sse' if args.sse else args.transport
    if active_transport == 'sse':
        print(f"Starting CosmoLost FastMCP Gateway on SSE transport at http://{args.host}:{args.port}", file=sys.stderr)
        mcp.run(transport='sse', host=args.host, port=args.port)
    else:
        mcp.run(transport='stdio')
