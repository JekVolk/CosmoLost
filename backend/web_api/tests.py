import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from core.models import (
    Artifact,
    ArtifactMedia,
    ArtifactType,
    CelestialBody,
    CommunityPublication,
    CoordinateSystemType,
    MediaCategory,
    Mission,
    OperationalStatus,
    PlatformType,
    ScientificDiscovery,
    TraverseWaypoint,
)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def sample_data(db):
    mars = CelestialBody.objects.create(
        id='mars',
        name='Mars',
        radius_km=3396.2,
        gravity_ms2=3.72,
        coordinate_system_type=CoordinateSystemType.PLANETOCENTRIC_360,
        wmts_tile_url='https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg',
    )
    moon = CelestialBody.objects.create(
        id='moon',
        name='Moon',
        radius_km=1737.4,
        gravity_ms2=1.62,
        coordinate_system_type=CoordinateSystemType.SELENOGRAPHIC,
        wmts_tile_url='https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303P_100m/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg',
    )
    mission_mer = Mission.objects.create(
        id='mer-b',
        nssdca_id='2003-032A',
        name='Mars Exploration Rover - Opportunity',
        agency='NASA',
        launch_date='2003-07-07',
        landing_date='2004-01-25',
        end_date='2018-06-10',
        summary='Twin exploration rover mission confirming past persistent liquid water on Mars.',
    )
    mission_apollo = Mission.objects.create(
        id='apollo-11',
        nssdca_id='1969-059C',
        name='Apollo 11',
        agency='NASA',
        launch_date='1969-07-16',
        landing_date='1969-07-20',
        end_date='1969-07-24',
        summary='First crewed lunar landing mission.',
    )
    opportunity = Artifact.objects.create(
        id='opportunity-rover',
        mission=mission_mer,
        celestial_body=mars,
        name='Opportunity Rover (MER-B)',
        artifact_type=ArtifactType.ROVER,
        operational_status=OperationalStatus.DORMANT,
        latitude=-1.9462,
        longitude=354.4734,
        elevation_m=-1420.0,
        location_name='Perseverance Valley',
        mass_kg=185.0,
        last_contact_sol=5111,
        cause_of_deactivation='Global Martian planet-encircling dust storm blocking solar panels',
        is_featured=True,
        is_nasa_hardware=True,
        first_person_monologue='My clock stopped on Sol 5111. The dust was thick enough to turn afternoon into midnight...',
        model_3d_url='https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Opportunity%20Rover/opportunity.glb',
    )
    # Opportunity nearby hardware to test clustering (approx 100 meters away)
    opportunity_heat_shield = Artifact.objects.create(
        id='opportunity-heat-shield',
        mission=mission_mer,
        celestial_body=mars,
        name='Opportunity Heat Shield Impact Debris',
        artifact_type=ArtifactType.IMPACT_STAGE,
        operational_status=OperationalStatus.DESTROYED,
        latitude=-1.9463,
        longitude=354.4735,
        elevation_m=-1420.0,
        location_name='Heat Shield Rock',
        mass_kg=80.0,
        is_featured=False,
        is_nasa_hardware=True,
    )
    # Spirit rover on Mars, located far away in Gusev Crater
    spirit = Artifact.objects.create(
        id='spirit-rover',
        mission=mission_mer,
        celestial_body=mars,
        name='Spirit Rover (MER-A)',
        artifact_type=ArtifactType.ROVER,
        operational_status=OperationalStatus.DORMANT,
        latitude=-14.5684,
        longitude=175.4726,
        elevation_m=-1900.0,
        location_name='Gusev Crater',
        mass_kg=185.0,
        is_featured=False,
        is_nasa_hardware=True,
    )
    # Apollo 11 descent stage on the Moon
    apollo_descent = Artifact.objects.create(
        id='apollo-11-descent-stage',
        mission=mission_apollo,
        celestial_body=moon,
        name='Apollo 11 Lunar Module Descent Stage (Eagle)',
        artifact_type=ArtifactType.DESCENT_STAGE,
        operational_status=OperationalStatus.PASSIVE_ACTIVE,
        latitude=0.67408,
        longitude=23.47297,
        elevation_m=-2500.0,
        location_name='Mare Tranquillitatis (Tranquility Base)',
        mass_kg=2034.0,
        is_featured=True,
        is_nasa_hardware=True,
    )

    media_surface = ArtifactMedia.objects.create(
        id='media-oppy-surface',
        artifact=opportunity,
        media_category=MediaCategory.SURFACE_PHOTO,
        media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA22521.jpg',
        nasa_id_or_pia='PIA22521',
        caption='Final panorama looking eastward from Perseverance Valley rim.',
        credit='NASA/JPL-Caltech',
    )
    media_last = ArtifactMedia.objects.create(
        id='media-oppy-last',
        artifact=opportunity,
        media_category=MediaCategory.LAST_KNOWN_PHOTO,
        media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA22522.jpg',
        nasa_id_or_pia='PIA22522',
        caption='Last full frame captured by Opportunity.',
        credit='NASA/JPL-Caltech/Cornell',
    )

    discovery = ScientificDiscovery.objects.create(
        id='disc-oppy-blueberries',
        artifact=opportunity,
        instrument_acronym='Pancam',
        instrument_full_name='Panoramic Camera',
        title='Hematite Concretions (Martian Blueberries)',
        kid_friendly_story='Tiny ball-shaped stones that could only grow in warm pools of mineral water!',
        scientific_fact='Discovered spherules composed of crystalline hematite indicative of standing liquid water.',
    )

    waypoint1 = TraverseWaypoint.objects.create(
        id='wp-oppy-1',
        artifact=opportunity,
        sol_or_step=1,
        latitude=-1.9460,
        longitude=354.4730,
        elevation_m=-1410.0,
        odometry_m=0.0,
        telemetry_snapshot={'power_wh': 900.0, 'dust_tau': 0.6},
        story_snippet='Opportunity landed safely inside Eagle Crater.',
    )
    waypoint5111 = TraverseWaypoint.objects.create(
        id='wp-oppy-5111',
        artifact=opportunity,
        sol_or_step=5111,
        latitude=-1.9462,
        longitude=354.4734,
        elevation_m=-1420.0,
        odometry_m=45160.0,
        telemetry_snapshot={'power_wh': 22.0, 'dust_tau': 10.8},
        story_snippet='Final telemetry packet received before carrier signal loss.',
    )

    pub_approved = CommunityPublication.objects.create(
        mission=mission_mer,
        artifact=opportunity,
        title='Last Sol of Opportunity: The Storm that Never Ended',
        video_url='https://youtube.com/shorts/sample_approved',
        platform_type=PlatformType.YOUTUBE,
        source_references='NASA Photojournal PIA22521, MER PDS raw catalog',
        author_name='SpaceGeek99',
        is_approved=True,
    )
    pub_unapproved = CommunityPublication.objects.create(
        mission=mission_mer,
        artifact=opportunity,
        title='Pending Review Video',
        video_url='https://youtube.com/shorts/sample_pending',
        platform_type=PlatformType.YOUTUBE,
        source_references='NASA Photojournal',
        author_name='NewCreator',
        is_approved=False,
    )

    return {
        'mars': mars,
        'moon': moon,
        'mission_mer': mission_mer,
        'mission_apollo': mission_apollo,
        'opportunity': opportunity,
        'opportunity_heat_shield': opportunity_heat_shield,
        'spirit': spirit,
        'apollo_descent': apollo_descent,
        'media_surface': media_surface,
        'media_last': media_last,
        'discovery': discovery,
        'waypoint1': waypoint1,
        'waypoint5111': waypoint5111,
        'pub_approved': pub_approved,
        'pub_unapproved': pub_unapproved,
    }


# =============================================================================
# CELESTIAL BODIES TESTS
# =============================================================================

@pytest.mark.django_db
def test_celestial_bodies_list(api_client, sample_data):
    url = reverse('web_api:celestial-bodies-list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2
    ids = [item['id'] for item in response.data]
    assert 'mars' in ids
    assert 'moon' in ids
    first = response.data[0]
    assert 'radius_km' in first
    assert 'gravity_ms2' in first
    assert 'coordinate_system_type' in first
    assert 'wmts_tile_url' in first


@pytest.mark.django_db
def test_celestial_body_detail(api_client, sample_data):
    url = reverse('web_api:celestial-body-detail', kwargs={'pk': 'mars'})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['id'] == 'mars'
    assert response.data['name'] == 'Mars'
    assert response.data['radius_km'] == 3396.2
    assert response.data['gravity_ms2'] == 3.72
    assert response.data['coordinate_system_type'] == 'PLANETOCENTRIC_360'


@pytest.mark.django_db
def test_celestial_body_not_found(api_client, sample_data):
    url = reverse('web_api:celestial-body-detail', kwargs={'pk': 'jupiter'})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND


# =============================================================================
# ARTIFACTS LIST & FILTERS TESTS
# =============================================================================

@pytest.mark.django_db
def test_artifacts_list_all(api_client, sample_data):
    url = reverse('web_api:artifacts-list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['total'] == 4
    assert len(response.data['results']) == 4

    item = next(a for a in response.data['results'] if a['id'] == 'opportunity-rover')
    assert item['name'] == 'Opportunity Rover (MER-B)'
    assert item['mission_name'] == 'Mars Exploration Rover - Opportunity'
    assert item['celestial_body'] == 'mars'
    assert item['artifact_type'] == 'ROVER'
    assert item['operational_status'] == 'DORMANT'
    assert item['is_featured'] is True
    assert item['is_nasa_hardware'] is True
    assert item['preview_image_url'] == 'https://photojournal.jpl.nasa.gov/jpeg/PIA22521.jpg'
    assert item['cosmolost_url'] == 'https://cosmolost.lihtar.org/artifacts/opportunity-rover'

    coords = item['coordinates']
    assert coords['latitude'] == -1.9462
    assert coords['longitude'] == 354.4734
    assert coords['elevation_m'] == -1420.0
    assert coords['coordinate_system'] == 'PLANETOCENTRIC_360'
    assert coords['location_name'] == 'Perseverance Valley'


@pytest.mark.django_db
def test_artifacts_list_filters(api_client, sample_data):
    url = reverse('web_api:artifacts-list')

    # Filter by body
    res_mars = api_client.get(url, {'body': 'mars'})
    assert res_mars.status_code == status.HTTP_200_OK
    assert res_mars.data['total'] == 3

    res_moon = api_client.get(url, {'body': 'moon'})
    assert res_moon.data['total'] == 1
    assert res_moon.data['results'][0]['id'] == 'apollo-11-descent-stage'

    # Filter by type
    res_rover = api_client.get(url, {'type': 'ROVER'})
    assert res_rover.data['total'] == 2

    # Filter by operational status
    res_dormant = api_client.get(url, {'status': 'DORMANT'})
    assert res_dormant.data['total'] == 2

    # Filter by is_featured
    res_featured = api_client.get(url, {'is_featured': 'true'})
    assert res_featured.data['total'] == 2

    # Filter by is_nasa_hardware
    res_nasa = api_client.get(url, {'is_nasa_hardware': 'true'})
    assert res_nasa.data['total'] == 4

    # Search filter by name
    res_search_name = api_client.get(url, {'search': 'Spirit'})
    assert res_search_name.data['total'] == 1
    assert res_search_name.data['results'][0]['id'] == 'spirit-rover'

    # Search filter by location
    res_search_loc = api_client.get(url, {'search': 'Perseverance'})
    assert res_search_loc.data['total'] == 1
    assert res_search_loc.data['results'][0]['id'] == 'opportunity-rover'

    # Pagination: limit & offset
    res_page = api_client.get(url, {'limit': 2, 'offset': 1})
    assert res_page.data['total'] == 4
    assert res_page.data['limit'] == 2
    assert res_page.data['offset'] == 1
    assert len(res_page.data['results']) == 2


@pytest.mark.django_db
def test_artifacts_clustering(api_client, sample_data):
    url = reverse('web_api:artifacts-list')

    # Opportunity and Heat Shield are ~15 meters apart (<500m), Spirit is thousands of km away
    response = api_client.get(url, {'body': 'mars', 'cluster_distance_m': 500.0})
    assert response.status_code == status.HTTP_200_OK
    results = {r['id']: r for r in response.data['results']}

    oppy_cluster = results['opportunity-rover']['cluster_info']
    shield_cluster = results['opportunity-heat-shield']['cluster_info']
    spirit_cluster = results['spirit-rover']['cluster_info']

    # Both Opportunity and Heat Shield should be clustered together
    assert oppy_cluster['is_clustered'] is True
    assert oppy_cluster['cluster_count'] == 2
    assert shield_cluster['is_clustered'] is True
    assert shield_cluster['cluster_count'] == 2
    assert oppy_cluster['cluster_id'] == shield_cluster['cluster_id']

    # Spirit is isolated
    assert spirit_cluster['is_clustered'] is False
    assert spirit_cluster['cluster_id'] is None
    assert spirit_cluster['cluster_count'] == 1

    # With tiny cluster_distance_m (e.g. 1 meter), none should be clustered
    response_tiny = api_client.get(url, {'body': 'mars', 'cluster_distance_m': 1.0})
    results_tiny = {r['id']: r for r in response_tiny.data['results']}
    assert results_tiny['opportunity-rover']['cluster_info']['is_clustered'] is False


# =============================================================================
# ARTIFACT DETAIL & SUB-RESOURCES TESTS
# =============================================================================

@pytest.mark.django_db
def test_artifact_detail(api_client, sample_data):
    url = reverse('web_api:artifact-detail', kwargs={'pk': 'opportunity-rover'})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK

    data = response.data
    assert data['id'] == 'opportunity-rover'
    assert data['name'] == 'Opportunity Rover (MER-B)'
    assert data['celestial_body'] == 'mars'
    assert data['artifact_type'] == 'ROVER'
    assert data['operational_status'] == 'DORMANT'
    assert data['mass_kg'] == 185.0
    assert data['last_contact_sol'] == 5111
    assert data['cause_of_deactivation'] == 'Global Martian planet-encircling dust storm blocking solar panels'
    assert data['is_featured'] is True
    assert data['is_nasa_hardware'] is True
    assert 'first_person_monologue' in data
    assert 'model_3d_url' in data
    assert data['mission']['id'] == 'mer-b'
    assert data['mission']['name'] == 'Mars Exploration Rover - Opportunity'
    assert data['mission_name'] == 'Mars Exploration Rover - Opportunity'

    # Check nested media and discoveries
    assert len(data['media']) == 2
    assert len(data['discoveries']) == 1
    assert data['discoveries'][0]['instrument_acronym'] == 'Pancam'


@pytest.mark.django_db
def test_artifact_detail_not_found(api_client, sample_data):
    url = reverse('web_api:artifact-detail', kwargs={'pk': 'voyager-1'})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_artifact_waypoints(api_client, sample_data):
    url = reverse('web_api:artifact-waypoints', kwargs={'pk': 'opportunity-rover'})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2
    # Check ordering by sol_or_step
    assert response.data[0]['sol_or_step'] == 1
    assert response.data[1]['sol_or_step'] == 5111
    assert response.data[1]['telemetry_snapshot']['power_wh'] == 22.0

    # 404 for non-existent artifact
    url_404 = reverse('web_api:artifact-waypoints', kwargs={'pk': 'ghost-artifact'})
    assert api_client.get(url_404).status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_artifact_discoveries(api_client, sample_data):
    url = reverse('web_api:artifact-discoveries', kwargs={'pk': 'opportunity-rover'})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    disc = response.data[0]
    assert disc['instrument_acronym'] == 'Pancam'
    assert disc['title'] == 'Hematite Concretions (Martian Blueberries)'
    assert 'Tiny ball-shaped stones' in disc['kid_friendly_story']
    assert 'crystalline hematite' in disc['scientific_fact']

    url_404 = reverse('web_api:artifact-discoveries', kwargs={'pk': 'ghost-artifact'})
    assert api_client.get(url_404).status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_artifact_media(api_client, sample_data):
    url = reverse('web_api:artifact-media', kwargs={'pk': 'opportunity-rover'})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2
    categories = [m['media_category'] for m in response.data]
    assert 'SURFACE_PHOTO' in categories
    assert 'LAST_KNOWN_PHOTO' in categories

    url_404 = reverse('web_api:artifact-media', kwargs={'pk': 'ghost-artifact'})
    assert api_client.get(url_404).status_code == status.HTTP_404_NOT_FOUND


# =============================================================================
# MISSIONS TESTS
# =============================================================================

@pytest.mark.django_db
def test_missions_list(api_client, sample_data):
    url = reverse('web_api:missions-list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['total'] == 2
    assert len(response.data['results']) == 2

    # Check nested artifacts inside mission
    mer_mission = next(m for m in response.data['results'] if m['id'] == 'mer-b')
    assert len(mer_mission['artifacts']) == 3

    # Filter by agency
    res_agency = api_client.get(url, {'agency': 'NASA'})
    assert res_agency.data['total'] == 2
    res_other = api_client.get(url, {'agency': 'ESA'})
    assert res_other.data['total'] == 0


@pytest.mark.django_db
def test_mission_detail(api_client, sample_data):
    url = reverse('web_api:mission-detail', kwargs={'pk': 'mer-b'})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['id'] == 'mer-b'
    assert response.data['name'] == 'Mars Exploration Rover - Opportunity'
    assert response.data['agency'] == 'NASA'
    assert len(response.data['artifacts']) == 3

    url_404 = reverse('web_api:mission-detail', kwargs={'pk': 'artemis-99'})
    assert api_client.get(url_404).status_code == status.HTTP_404_NOT_FOUND


# =============================================================================
# COMMUNITY PUBLICATIONS TESTS
# =============================================================================

@pytest.mark.django_db
def test_community_publications_list(api_client, sample_data):
    url = reverse('web_api:community-publications')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    # Only approved publications are returned!
    assert response.data['total'] == 1
    assert len(response.data['results']) == 1
    pub = response.data['results'][0]
    assert pub['title'] == 'Last Sol of Opportunity: The Storm that Never Ended'
    assert pub['is_approved'] is True
    assert pub['mission_id'] == 'mer-b'
    assert pub['artifact_id'] == 'opportunity-rover'


@pytest.mark.django_db
def test_community_publications_filters(api_client, sample_data):
    url = reverse('web_api:community-publications')

    # Filter by mission_id
    res_mer = api_client.get(url, {'mission_id': 'mer-b'})
    assert res_mer.data['total'] == 1

    res_apollo = api_client.get(url, {'mission_id': 'apollo-11'})
    assert res_apollo.data['total'] == 0

    # Filter by platform_type
    res_yt = api_client.get(url, {'platform_type': 'YOUTUBE'})
    assert res_yt.data['total'] == 1

    res_tiktok = api_client.get(url, {'platform_type': 'TIKTOK'})
    assert res_tiktok.data['total'] == 0


@pytest.mark.django_db
def test_community_publication_submit_success(api_client, sample_data):
    url = reverse('web_api:community-publications')
    payload = {
        'mission_id': 'mer-b',
        'artifact_id': 'opportunity-rover',
        'title': 'How Opportunity Survived 14 Years on Mars',
        'video_url': 'https://youtube.com/shorts/survived14years',
        'platform_type': 'YOUTUBE',
        'source_references': 'NASA JPL archives, PIA22521',
        'author_name': 'AstroStudent',
    }
    response = api_client.post(url, payload, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['status'] == 'SUBMITTED_FOR_REVIEW'
    assert response.data['is_approved'] is False
    assert 'id' in response.data
    assert 'message' in response.data

    # Verify that the created publication exists in DB with is_approved=False
    pub_id = response.data['id']
    created_pub = CommunityPublication.objects.get(id=pub_id)
    assert created_pub.title == 'How Opportunity Survived 14 Years on Mars'
    assert created_pub.is_approved is False
    assert created_pub.mission_id == 'mer-b'
    assert created_pub.artifact_id == 'opportunity-rover'

    # Verify that it is NOT returned in public GET list (until approved)
    res_list = api_client.get(url)
    assert res_list.data['total'] == 1  # only the pre-existing approved one


@pytest.mark.django_db
def test_community_publication_submit_validation_errors(api_client, sample_data):
    url = reverse('web_api:community-publications')

    # Missing required title and author_name
    invalid_payload = {
        'mission_id': 'mer-b',
        'video_url': 'https://youtube.com/shorts/sample',
        'platform_type': 'YOUTUBE',
    }
    response = api_client.post(url, invalid_payload, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Non-existent mission_id
    invalid_mission_payload = {
        'mission_id': 'non-existent-mission',
        'title': 'Test title',
        'video_url': 'https://youtube.com/shorts/sample',
        'platform_type': 'YOUTUBE',
        'source_references': 'NASA',
        'author_name': 'Tester',
    }
    res_bad_mission = api_client.post(url, invalid_mission_payload, format='json')
    assert res_bad_mission.status_code == status.HTTP_400_BAD_REQUEST


# =============================================================================
# URL COMPATIBILITY TESTS (/api/v1/portal/ and /api/web/)
# =============================================================================

@pytest.mark.django_db
def test_url_compatibility_routes(api_client, sample_data):
    # Standard v1 route
    res_v1 = api_client.get('/api/v1/portal/celestial-bodies/')
    assert res_v1.status_code == status.HTTP_200_OK

    # Web compatibility route
    res_web = api_client.get('/api/web/celestial-bodies/')
    assert res_web.status_code == status.HTTP_200_OK

    assert res_v1.data == res_web.data


# =============================================================================
# STATS AND ROOT API TESTS
# =============================================================================

@pytest.mark.django_db
def test_portal_stats_endpoint(api_client, sample_data):
    """Verify /api/v1/portal/stats/ and /api/web/stats/ return catalog statistics."""
    res = api_client.get('/api/v1/portal/stats/')
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert 'celestial_bodies' in data
    assert 'missions' in data
    assert 'artifacts' in data
    assert 'waypoints' in data
    assert 'discoveries' in data
    assert 'media' in data
    assert data['celestial_bodies'] == 2
    assert data['missions'] == 2

    res_compat = api_client.get('/api/web/stats/')
    assert res_compat.status_code == status.HTTP_200_OK
    assert res_compat.json() == data


@pytest.mark.django_db
def test_api_root_endpoint(api_client):
    """Verify /api/ returns JSON index of available endpoints with status 200."""
    res = api_client.get('/api/')
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data['name'] == 'CosmoLost Backend API'
    assert data['status'] == 'healthy'
    assert 'portal' in data['endpoints']
    assert 'editor' in data['endpoints']
