import pytest
from core.models import (
    Artifact,
    ArtifactMedia,
    ArtifactType,
    CelestialBody,
    CoordinateSystemType,
    MediaCategory,
    Mission,
    OperationalStatus,
    ScientificDiscovery,
    TraverseWaypoint,
)
from mcp.server import (
    get_3d_and_media_assets,
    get_artifact_details,
    get_last_sol_chronology,
    get_mission_manifest,
    get_science_discoveries,
    get_verified_citations,
    list_active_passive_artifacts,
    list_celestial_bodies,
    list_missions,
    search_artifacts,
    sol_to_earth_date,
)


@pytest.fixture
def mcp_test_data(db):
    moon = CelestialBody.objects.create(
        id='moon',
        name='Moon',
        radius_km=1737.4,
        gravity_ms2=1.62,
        coordinate_system_type=CoordinateSystemType.SELENOGRAPHIC,
        wmts_tile_url='https://example.com/tiles/moon',
    )
    mars = CelestialBody.objects.create(
        id='mars',
        name='Mars',
        radius_km=3389.5,
        gravity_ms2=3.72,
        coordinate_system_type=CoordinateSystemType.PLANETOCENTRIC_360,
        wmts_tile_url='https://example.com/tiles/mars',
    )
    apollo = Mission.objects.create(
        id='apollo-11',
        nssdca_id='1969-059A',
        name='Apollo 11',
        agency='NASA',
        launch_date='1969-07-16',
        landing_date='1969-07-20',
        summary='First human lunar landing.',
    )
    mars2020 = Mission.objects.create(
        id='mars-2020',
        nssdca_id='2020-052A',
        name='Mars 2020',
        agency='NASA/JPL',
        launch_date='2020-07-30',
        landing_date='2021-02-18',
        summary='Mars rover and helicopter mission searching for signs of past life.',
    )
    exomars = Mission.objects.create(
        id='exomars-tgo',
        nssdca_id='2016-017A',
        name='ExoMars Trace Gas Orbiter',
        agency='ESA',
        launch_date='2016-03-14',
        landing_date='2016-10-19',
        summary='European Space Agency Mars mission.',
    )

    art_retro = Artifact.objects.create(
        id='apollo-11-lrrr',
        mission=apollo,
        celestial_body=moon,
        name='Apollo 11 Laser Retroreflector (LRRR)',
        artifact_type=ArtifactType.RETRO_REFLECTOR,
        operational_status=OperationalStatus.PASSIVE_ACTIVE,
        latitude=0.6734,
        longitude=23.4731,
        elevation_m=0.0,
        location_name='Mare Tranquillitatis',
        mass_kg=30.0,
        cause_of_deactivation='Passive quartz corner-cube reflector array',
        is_featured=True,
        first_person_monologue='I reflect light back to Earth.',
        model_3d_url='https://example.com/models/lrrr.glb',
    )

    art_sample_tube = Artifact.objects.create(
        id='mars-sample-tube-01',
        mission=mars2020,
        celestial_body=mars,
        name='Perseverance Sample Tube #1',
        artifact_type=ArtifactType.SAMPLE_TUBE,
        operational_status=OperationalStatus.PASSIVE_ACTIVE,
        latitude=18.4501,
        longitude=354.4608,  # Tests planetocentric > 180 normalization
        elevation_m=-2570.0,
        location_name='Three Forks Depot',
        mass_kg=0.05,
        cause_of_deactivation='Hermetically sealed titanium sample container on surface',
        is_featured=False,
    )

    art_rover = Artifact.objects.create(
        id='perseverance-rover',
        mission=mars2020,
        celestial_body=mars,
        name='Perseverance Rover',
        artifact_type=ArtifactType.ROVER,
        operational_status=OperationalStatus.ACTIVE,
        latitude=18.4447,
        longitude=77.4508,
        elevation_m=-2570.0,
        location_name='Jezero Crater',
        mass_kg=1025.0,
        last_contact_sol=1200,
        is_featured=True,
        first_person_monologue='Exploring ancient river delta in Jezero.',
        model_3d_url='https://example.com/models/perseverance.glb',
    )

    art_esa = Artifact.objects.create(
        id='schiaparelli-lander',
        mission=exomars,
        celestial_body=mars,
        name='Schiaparelli EDM Lander',
        artifact_type=ArtifactType.LANDER,
        operational_status=OperationalStatus.DESTROYED,
        latitude=-2.05,
        longitude=353.96,
        location_name='Meridiani Planum',
        cause_of_deactivation='Inertial Measurement Unit premature engine shutdown',
    )

    # Telemetry waypoints for rover
    TraverseWaypoint.objects.create(
        artifact=art_rover,
        sol_or_step=1,
        latitude=18.4447,
        longitude=77.4508,
        elevation_m=-2570.0,
        odometry_m=0.0,
        telemetry_snapshot={'power_wh': 900, 'dust_tau': 0.3},
        story_snippet='Touchdown at Octavia E. Butler Landing.',
    )
    TraverseWaypoint.objects.create(
        artifact=art_rover,
        sol_or_step=500,
        latitude=18.4510,
        longitude=77.4420,
        elevation_m=-2565.0,
        odometry_m=12500.5,
        telemetry_snapshot={'power_wh': 850, 'dust_tau': 0.45, 'tilt_deg': 2.1},
        story_snippet='Delta front exploration underway.',
    )

    # Scientific discovery
    ScientificDiscovery.objects.create(
        artifact=art_rover,
        instrument_acronym='SHERLOC',
        instrument_full_name='Scanning Habitable Environments with Raman & Luminescence for Organics & Chemicals',
        title='Detection of organic molecules in Wildcat Ridge',
        kid_friendly_story='Found chemical ingredients that could be leftovers of ancient life!',
        scientific_fact='Raman spectroscopy confirmed presence of aromatic carbon compounds in mudstone.',
    )

    # Media assets
    ArtifactMedia.objects.create(
        artifact=art_rover,
        media_category=MediaCategory.SURFACE_PHOTO,
        media_url='https://example.com/photos/percy_mastcam.jpg',
        nasa_id_or_pia='PIA24424',
        caption='Perseverance Mastcam-Z self portrait',
        credit='NASA/JPL-Caltech/ASU',
    )

    return {
        'moon': moon,
        'mars': mars,
        'apollo': apollo,
        'mars2020': mars2020,
        'exomars': exomars,
        'art_retro': art_retro,
        'art_sample_tube': art_sample_tube,
        'art_rover': art_rover,
        'art_esa': art_esa,
    }


# =============================================================================
# Sol to Earth conversion test
# =============================================================================
def test_sol_to_earth_date():
    import datetime
    landing = datetime.date(2021, 2, 18)
    # Sol 100 on Mars ≈ 102.7 Earth days later (Feb 18 + 102 days = May 31)
    earth_date = sol_to_earth_date(landing, 100)
    assert earth_date == '2021-05-31'
    assert sol_to_earth_date(None, 100) is None
    assert sol_to_earth_date(landing, None) is None


# =============================================================================
# Tool 1: search_artifacts
# =============================================================================
@pytest.mark.django_db
def test_search_artifacts_query(mcp_test_data):
    res = search_artifacts(query='Retroreflector')
    assert len(res) == 1
    assert res[0]['artifact_id'] == 'apollo-11-lrrr'
    assert res[0]['celestial_body'] == 'moon'
    assert res[0]['mission_name'] == 'Apollo 11'
    assert 'longitude_normalized' in res[0]


@pytest.mark.django_db
def test_search_artifacts_filters_and_normalization(mcp_test_data):
    # Normalized longitude test (354.4608 -> -5.5392)
    sample_tube = search_artifacts(query='Sample Tube')
    assert len(sample_tube) == 1
    assert sample_tube[0]['longitude'] > 180.0
    assert sample_tube[0]['longitude_normalized'] < 0.0

    # Hyphenated operational status sanitization
    passive = search_artifacts(operational_status='passive-active')
    assert len(passive) == 2

    # String limit robustness
    limited = search_artifacts(limit='1', offset='0')
    assert len(limited) == 1


# =============================================================================
# Tool 2: get_artifact_details
# =============================================================================
@pytest.mark.django_db
def test_get_artifact_details_success(mcp_test_data):
    details = get_artifact_details('perseverance-rover')
    assert details['id'] == 'perseverance-rover'
    assert details['name'] == 'Perseverance Rover'
    assert details['agency'] == 'NASA/JPL'
    assert details['celestial_body'] == 'mars'
    assert details['last_contact_sol'] == 1200
    assert details['last_contact_earth_date_estimated'] is not None
    assert 'longitude_normalized' in details


@pytest.mark.django_db
def test_get_artifact_details_not_found(mcp_test_data):
    res = get_artifact_details('non-existent-id')
    assert 'error' in res
    assert 'not found' in res['error']

    empty = get_artifact_details('')
    assert 'error' in empty


# =============================================================================
# Tool 3: get_mission_manifest
# =============================================================================
@pytest.mark.django_db
def test_get_mission_manifest_success(mcp_test_data):
    manifest = get_mission_manifest('apollo-11')
    assert manifest['mission_id'] == 'apollo-11'
    assert manifest['nssdca_id'] == '1969-059A'
    assert manifest['manifest_count'] == 1
    assert manifest['hardware_items'][0]['id'] == 'apollo-11-lrrr'


@pytest.mark.django_db
def test_get_mission_manifest_not_found(mcp_test_data):
    res = get_mission_manifest('apollo-99')
    assert 'error' in res
    assert 'not found' in res['error']


# =============================================================================
# Tool 4: get_last_sol_chronology
# =============================================================================
@pytest.mark.django_db
def test_get_last_sol_chronology_success(mcp_test_data):
    chrono = get_last_sol_chronology('perseverance-rover')
    assert chrono['artifact_id'] == 'perseverance-rover'
    assert chrono['final_sol_or_step'] == 500
    assert chrono['earth_date_estimated'] is not None
    assert chrono['cumulative_odometry_m'] == 12500.5
    assert chrono['telemetry_snapshot']['power_wh'] == 850
    assert chrono['total_waypoints_recorded'] == 2


@pytest.mark.django_db
def test_get_last_sol_chronology_empty_waypoints(mcp_test_data):
    chrono = get_last_sol_chronology('apollo-11-lrrr')
    assert chrono['artifact_id'] == 'apollo-11-lrrr'
    assert 'No telemetry waypoints' in chrono['message']
    assert chrono['waypoints_count'] == 0


@pytest.mark.django_db
def test_get_last_sol_chronology_not_found(mcp_test_data):
    res = get_last_sol_chronology('non-existent-artifact')
    assert 'error' in res
    assert 'not found' in res['error']


# =============================================================================
# Tool 5: get_science_discoveries
# =============================================================================
@pytest.mark.django_db
def test_get_science_discoveries(mcp_test_data):
    discoveries = get_science_discoveries('perseverance-rover')
    assert len(discoveries) == 1
    assert discoveries[0]['instrument_acronym'] == 'SHERLOC'
    assert 'Wildcat Ridge' in discoveries[0]['discovery_title']

    empty = get_science_discoveries('apollo-11-lrrr')
    assert len(empty) == 0

    not_found = get_science_discoveries('non-existent-artifact')
    assert len(not_found) == 1
    assert 'error' in not_found[0]


# =============================================================================
# Tool 6: get_verified_citations (Dynamic Agency Credit)
# =============================================================================
@pytest.mark.django_db
def test_get_verified_citations_success(mcp_test_data):
    # NASA mission citation
    nasa_cit = get_verified_citations('apollo-11-lrrr')
    assert nasa_cit['agency'] == 'NASA'
    assert 'NASA / NSSDCA' in nasa_cit['mandatory_credit']

    # ESA mission citation
    esa_cit = get_verified_citations('schiaparelli-lander')
    assert esa_cit['agency'] == 'ESA'
    assert 'ESA / NSSDCA' in esa_cit['mandatory_credit']
    assert 'PSA' in esa_cit['pds_data_node']


@pytest.mark.django_db
def test_get_verified_citations_not_found(mcp_test_data):
    res = get_verified_citations('unknown-artifact')
    assert 'error' in res


# =============================================================================
# Tool 7: get_3d_and_media_assets
# =============================================================================
@pytest.mark.django_db
def test_get_3d_and_media_assets_success(mcp_test_data):
    assets = get_3d_and_media_assets('perseverance-rover')
    assert assets['artifact_id'] == 'perseverance-rover'
    assert assets['model_3d_glb_url'] == 'https://example.com/models/perseverance.glb'
    assert assets['photos_count'] == 1
    assert assets['media_files'][0]['pia_id'] == 'PIA24424'
    assert assets['media_files'][0]['credit'] == 'NASA/JPL-Caltech/ASU'


@pytest.mark.django_db
def test_get_3d_and_media_assets_not_found(mcp_test_data):
    res = get_3d_and_media_assets('unknown-art')
    assert 'error' in res


# =============================================================================
# Tool 8: list_active_passive_artifacts (Dynamic Role)
# =============================================================================
@pytest.mark.django_db
def test_list_active_passive_artifacts(mcp_test_data):
    # Lunar retroreflector
    lunar = list_active_passive_artifacts(celestial_body='moon')
    assert len(lunar) == 1
    assert lunar[0]['artifact_id'] == 'apollo-11-lrrr'
    assert 'reflector' in lunar[0]['scientific_role'].lower()

    # Martian sample tube must NOT say lunar laser retroreflector!
    martian = list_active_passive_artifacts(celestial_body='mars')
    assert len(martian) == 1
    assert martian[0]['artifact_id'] == 'mars-sample-tube-01'
    assert 'sample' in martian[0]['scientific_role'].lower()
    assert 'laser pulses' not in martian[0]['scientific_role'].lower()


# =============================================================================
# Tool 9: list_celestial_bodies
# =============================================================================
@pytest.mark.django_db
def test_list_celestial_bodies(mcp_test_data):
    bodies = list_celestial_bodies()
    assert len(bodies) == 2
    body_ids = [b['id'] for b in bodies]
    assert 'moon' in body_ids
    assert 'mars' in body_ids


# =============================================================================
# Tool 10: list_missions
# =============================================================================
@pytest.mark.django_db
def test_list_missions(mcp_test_data):
    missions = list_missions()
    assert len(missions) == 3

    esa_missions = list_missions(agency='ESA')
    assert len(esa_missions) == 1
    assert esa_missions[0]['mission_id'] == 'exomars-tgo'

    mars_missions = list_missions(celestial_body='mars')
    assert len(mars_missions) == 2


# =============================================================================
# FastMCP Protocol Integration Test (Copilot / LLM Client Simulation)
# =============================================================================
@pytest.mark.django_db(transaction=True)
def test_fastmcp_client_protocol_integration(mcp_test_data):
    import asyncio
    from fastmcp import Client
    from mcp.server import mcp

    async def run_client_calls():
        async with Client(mcp) as client:
            tools = await client.list_tools()
            tool_names = [t.name for t in tools]
            assert len(tools) == 10
            assert 'search_artifacts' in tool_names
            assert 'get_artifact_details' in tool_names
            assert 'get_mission_manifest' in tool_names
            assert 'get_last_sol_chronology' in tool_names
            assert 'get_science_discoveries' in tool_names
            assert 'get_verified_citations' in tool_names
            assert 'get_3d_and_media_assets' in tool_names
            assert 'list_active_passive_artifacts' in tool_names
            assert 'list_celestial_bodies' in tool_names
            assert 'list_missions' in tool_names

            # 1. Primary navigation: list_celestial_bodies
            res_bodies = await client.call_tool('list_celestial_bodies', {})
            assert len(res_bodies.structured_content['result']) == 2

            # 2. Primary navigation: list_missions
            res_missions = await client.call_tool('list_missions', {'agency': 'NASA'})
            assert len(res_missions.structured_content['result']) >= 1

            # 3. search_artifacts via MCP client protocol
            res_search = await client.call_tool('search_artifacts', {'query': 'Retroreflector'})
            assert len(res_search.structured_content['result']) == 1
            assert res_search.structured_content['result'][0]['artifact_id'] == 'apollo-11-lrrr'
            assert res_search.structured_content['result'][0]['longitude_normalized'] == 23.4731

            # 4. get_artifact_details via MCP client protocol
            res_details = await client.call_tool('get_artifact_details', {'artifact_id': 'apollo-11-lrrr'})
            assert res_details.structured_content['name'] == 'Apollo 11 Laser Retroreflector (LRRR)'

            # 5. get_last_sol_chronology via MCP client protocol
            res_chrono = await client.call_tool('get_last_sol_chronology', {'artifact_id': 'perseverance-rover'})
            assert res_chrono.structured_content['final_sol_or_step'] == 500

    asyncio.run(run_client_calls())


# =============================================================================
# Hacker / Chaos Security Tests (Penetration & Resiliency Vectors)
# =============================================================================
@pytest.mark.django_db
def test_hacker_null_byte_injection(mcp_test_data):
    """Vector: Null byte (\x00) injection in string inputs to crash C/SQLite driver."""
    res_search = search_artifacts(query="Apollo\x00DROP TABLE", celestial_body="moon\x00malicious")
    assert isinstance(res_search, list)

    res_details = get_artifact_details("perseverance-rover\x00--")
    assert isinstance(res_details, dict)

    res_manifest = get_mission_manifest("apollo-11\x00")
    assert isinstance(res_manifest, dict)


@pytest.mark.django_db
def test_hacker_integer_overflow_pagination(mcp_test_data):
    """Vector: Massive integer (10**60) or negative bounds to cause Python/SQL overflow."""
    # Overflow integer
    res_overflow = search_artifacts(limit=10**50, offset=10**50)
    assert isinstance(res_overflow, list)
    assert len(res_overflow) == 0  # Offset beyond rows, safe empty list

    # Negative bounds
    res_negative = search_artifacts(limit=-999999, offset=-999999)
    assert isinstance(res_negative, list)

    # String type confusion
    res_string = search_artifacts(limit="DROP TABLE", offset="INVALID")
    assert isinstance(res_string, list)


@pytest.mark.django_db
def test_hacker_query_length_bomb_and_traversal(mcp_test_data):
    """Vector: 10,000+ character string bomb and directory traversal patterns in slugs."""
    huge_string = "A" * 15000
    res_bomb = search_artifacts(query=huge_string)
    assert isinstance(res_bomb, list)

    # Path traversal and script tags in artifact_id
    res_traversal = get_artifact_details("../../../etc/passwd<script>alert(1)</script>")
    assert "error" in res_traversal
    assert "not found" in res_traversal["error"]

    # SQL injection attempt
    res_sqli = get_artifact_details("' OR '1'='1' --")
    assert "error" in res_sqli


def test_hacker_sol_number_overflow():
    """Vector: Astronomical sol numbers or negative sol numbers to cause datetime overflow."""
    import datetime
    landing = datetime.date(2021, 2, 18)
    assert sol_to_earth_date(landing, 10**30) is None
    assert sol_to_earth_date(landing, -99999999) is None
    assert sol_to_earth_date(landing, "not_an_int") is None

