import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from core.models import (
    Artifact,
    ArtifactMedia,
    ArtifactType,
    CelestialBody,
    CoordinateSystemType,
    MediaCategory,
    Mission,
    OperationalStatus,
)
from loader.constants import NASA_3D_MODEL_CDN_MAP


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def editor_sample_data(db):
    mars = CelestialBody.objects.create(
        id='mars',
        name='Mars',
        radius_km=3396.2,
        gravity_ms2=3.72,
        coordinate_system_type=CoordinateSystemType.PLANETOCENTRIC_360,
        wmts_tile_url='https://trek.nasa.gov/tiles/Mars/{TileMatrix}/{TileRow}/{TileCol}.jpg',
    )
    moon = CelestialBody.objects.create(
        id='moon',
        name='Moon',
        radius_km=1737.4,
        gravity_ms2=1.62,
        coordinate_system_type=CoordinateSystemType.SELENOGRAPHIC,
        wmts_tile_url='https://trek.nasa.gov/tiles/Moon/{TileMatrix}/{TileRow}/{TileCol}.jpg',
    )
    mission_mer = Mission.objects.create(
        id='mer',
        nssdca_id='2003-027A',
        name='Mars Exploration Rover Project',
        agency='NASA',
        summary='Twin robotic rovers searching for past water on Mars.',
    )
    mission_apollo = Mission.objects.create(
        id='apollo-11',
        nssdca_id='1969-059C',
        name='Apollo 11',
        agency='NASA',
        summary='First human lunar landing.',
    )

    spirit = Artifact.objects.create(
        id='spirit-rover',
        mission=mission_mer,
        celestial_body=mars,
        name='Spirit Rover (MER-A)',
        artifact_type=ArtifactType.ROVER,
        operational_status=OperationalStatus.DORMANT,
        latitude=-14.5684,
        longitude=175.4726,
        location_name='Gusev Crater',
        cause_of_deactivation='Stuck in Troy soft sand patch and lost solar power during Martian winter',
        first_person_monologue='Spirit signing off from Gusev Crater. Sol 2210 was my final transmission.',
        model_3d_url=NASA_3D_MODEL_CDN_MAP['spirit-rover'],
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
        location_name='Perseverance Valley',
        cause_of_deactivation='Global dust storm covering solar panels',
        first_person_monologue='My battery is low and it is getting dark.',
        model_3d_url=NASA_3D_MODEL_CDN_MAP['opportunity-rover'],
    )

    apollo_descent = Artifact.objects.create(
        id='apollo-11-descent',
        mission=mission_apollo,
        celestial_body=moon,
        name='Apollo 11 Descent Stage',
        artifact_type=ArtifactType.DESCENT_STAGE,
        operational_status=OperationalStatus.PASSIVE_ACTIVE,
        latitude=0.67408,
        longitude=23.47297,
        location_name='Mare Tranquillitatis',
        first_person_monologue='',
        model_3d_url='',
    )

    photo_spirit = ArtifactMedia.objects.create(
        id='media-spirit-1',
        artifact=spirit,
        media_category=MediaCategory.SURFACE_PHOTO,
        media_url='https://photojournal.jpl.nasa.gov/jpeg/PIA05555.jpg',
        caption='Spirit view of Columbia Hills.',
    )

    return {
        'mars': mars,
        'moon': moon,
        'mission_mer': mission_mer,
        'mission_apollo': mission_apollo,
        'spirit': spirit,
        'opportunity': opportunity,
        'apollo_descent': apollo_descent,
        'photo_spirit': photo_spirit,
    }


# =============================================================================
# TEMPLATES TESTS
# =============================================================================

@pytest.mark.django_db
def test_templates_list_success(api_client):
    url = reverse('desktop_api:templates-list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 3

    ids = [t['id'] for t in response.data]
    assert 'last-sol-drama' in ids
    assert 'dictionary-explain' in ids
    assert 'lunar-secrets' in ids

    first = response.data[0]
    assert 'rubric_name' in first
    assert 'target_duration_sec' in first
    assert 'slide_structure' in first
    assert len(first['slide_structure']) == 4
    assert first['slide_structure'][0]['type'] == 'HOOK'


@pytest.mark.django_db
def test_template_detail_success(api_client):
    url = reverse('desktop_api:template-detail', kwargs={'pk': 'last-sol-drama'})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['id'] == 'last-sol-drama'
    assert response.data['target_duration_sec'] == 40
    assert response.data['safe_zone_preset'] == 'PILLOWBOX_9_16'


@pytest.mark.django_db
def test_template_detail_not_found(api_client):
    url = reverse('desktop_api:template-detail', kwargs={'pk': 'unknown-rubric'})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data['error'] == 'NOT_FOUND'


# =============================================================================
# ARTIFACT ASSET BUNDLE TESTS
# =============================================================================

@pytest.mark.django_db
def test_artifact_asset_bundle_success(api_client, editor_sample_data):
    url = reverse('desktop_api:artifact-asset-bundle', kwargs={'pk': 'spirit-rover'})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK

    data = response.data
    assert data['artifact_id'] == 'spirit-rover'
    assert data['name'] == 'Spirit Rover (MER-A)'

    # TTS script checks
    assert 'tts_script' in data
    assert 'Spirit signing off' in data['tts_script']['en']
    assert 'Gusev Crater' in data['tts_script']['uk']

    # SEO caption checks
    assert 'seo_caption' in data
    assert 'line1_hook' in data['seo_caption']
    assert 'line2_seo' in data['seo_caption']
    assert 'line3_tags' in data['seo_caption']
    assert '#cosmolost' in data['seo_caption']['line3_tags']

    # Pin comment check (includes cause of deactivation)
    assert 'Troy soft sand patch' in data['pin_comment']

    # High-res photos check (retrieved from ArtifactMedia)
    assert 'https://photojournal.jpl.nasa.gov/jpeg/PIA05555.jpg' in data['high_res_photos']
    assert data['model_3d_glb_url'] == NASA_3D_MODEL_CDN_MAP['spirit-rover']


@pytest.mark.django_db
def test_artifact_asset_bundle_fallback_media(api_client, editor_sample_data):
    # opportunity-rover has no media created in fixture
    url = reverse('desktop_api:artifact-asset-bundle', kwargs={'pk': 'opportunity-rover'})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['high_res_photos']) >= 1
    assert 'photojournal.jpl.nasa.gov' in response.data['high_res_photos'][0]


@pytest.mark.django_db
def test_artifact_asset_bundle_without_cause_deactivation(api_client, editor_sample_data):
    # apollo_descent has empty cause_of_deactivation and empty monologue
    url = reverse('desktop_api:artifact-asset-bundle', kwargs={'pk': 'apollo-11-descent'})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert 'музей' in response.data['pin_comment']
    assert response.data['model_3d_glb_url'] is None


@pytest.mark.django_db
def test_artifact_asset_bundle_not_found(api_client, editor_sample_data):
    url = reverse('desktop_api:artifact-asset-bundle', kwargs={'pk': 'curiosity-rover'})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND


# =============================================================================
# RECOMMEND NEXT TOPIC TESTS
# =============================================================================

@pytest.mark.django_db
def test_recommend_next_topic_success(api_client, editor_sample_data):
    url = reverse('desktop_api:recommend-next-topic')
    payload = {
        'current_artifact_id': 'spirit-rover',
        'rubric_id': 'last-sol-drama',
        'selection_reason': 'Застрягання у пісках Troy та замерзання взимку',
    }
    response = api_client.post(url, payload, format='json')
    assert response.status_code == status.HTTP_200_OK

    data = response.data
    # Spirit and Opportunity are from the same mission 'mer', so Opportunity should be prioritized!
    assert data['suggested_artifact_id'] == 'opportunity-rover'
    assert data['suggested_artifact_name'] == 'Opportunity Rover (MER-B)'
    assert 'narrative_bridge' in data
    assert 'suggested_hook' in data
    assert data['suggested_rubric_id'] == 'last-sol-drama'
    assert 'recommended_pin_comment' in data


@pytest.mark.django_db
def test_recommend_next_topic_prefers_same_body_when_no_mission_siblings(api_client, editor_sample_data):
    # Create another artifact on the Moon
    lunar_rover = Artifact.objects.create(
        id='apollo-15-lrv',
        celestial_body=editor_sample_data['moon'],
        name='Apollo 15 Lunar Roving Vehicle',
        artifact_type=ArtifactType.ROVER,
        operational_status=OperationalStatus.DORMANT,
        latitude=26.1322,
        longitude=3.6338,
        location_name='Hadley Rille',
    )

    url = reverse('desktop_api:recommend-next-topic')
    payload = {
        'current_artifact_id': 'apollo-11-descent',  # On the Moon, mission 'apollo-11' has no other artifacts
        'rubric_id': 'lunar-secrets',
        'selection_reason': 'Перша висадка людей на Місяць та залишене обладнання',
    }
    response = api_client.post(url, payload, format='json')
    assert response.status_code == status.HTTP_200_OK
    # Should choose lunar_rover because it is on the same celestial body (Moon)
    assert response.data['suggested_artifact_id'] == 'apollo-15-lrv'


@pytest.mark.django_db
def test_recommend_next_topic_single_artifact_fallback(api_client, db):
    # Only a single artifact exists in DB
    mars = CelestialBody.objects.create(
        id='mars',
        name='Mars',
        radius_km=3396.2,
        gravity_ms2=3.72,
        coordinate_system_type=CoordinateSystemType.PLANETOCENTRIC_360,
        wmts_tile_url='https://trek.nasa.gov',
    )
    solo_art = Artifact.objects.create(
        id='lonely-lander',
        celestial_body=mars,
        name='Lonely Lander',
        artifact_type=ArtifactType.LANDER,
        operational_status=OperationalStatus.DORMANT,
        latitude=0.0,
        longitude=0.0,
    )

    url = reverse('desktop_api:recommend-next-topic')
    payload = {
        'current_artifact_id': 'lonely-lander',
        'rubric_id': 'dictionary-explain',
        'selection_reason': 'Єдиний апарат у базі даних для перевірки граничного випадку',
    }
    response = api_client.post(url, payload, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['suggested_artifact_id'] == 'lonely-lander'
    assert 'загадок Lonely Lander' in response.data['narrative_bridge']


@pytest.mark.django_db
def test_recommend_next_topic_validation_missing_fields(api_client, editor_sample_data):
    url = reverse('desktop_api:recommend-next-topic')
    # Missing selection_reason and rubric_id
    payload = {'current_artifact_id': 'spirit-rover'}
    response = api_client.post(url, payload, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'selection_reason' in response.data
    assert 'rubric_id' in response.data


@pytest.mark.django_db
def test_recommend_next_topic_validation_short_reason(api_client, editor_sample_data):
    url = reverse('desktop_api:recommend-next-topic')
    payload = {
        'current_artifact_id': 'spirit-rover',
        'rubric_id': 'last-sol-drama',
        'selection_reason': 'коротко',  # < 10 characters
    }
    response = api_client.post(url, payload, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'selection_reason' in response.data


@pytest.mark.django_db
def test_recommend_next_topic_validation_nonexistent_artifact(api_client, editor_sample_data):
    url = reverse('desktop_api:recommend-next-topic')
    payload = {
        'current_artifact_id': 'non-existent-probe',
        'rubric_id': 'last-sol-drama',
        'selection_reason': 'Спроба відправити неіснуючий апарат для валідації',
    }
    response = api_client.post(url, payload, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'current_artifact_id' in response.data


# =============================================================================
# URL COMPATIBILITY TESTS (/api/v1/editor/ and /api/desktop/)
# =============================================================================

@pytest.mark.django_db
def test_editor_url_compatibility_routes(api_client):
    res_v1 = api_client.get('/api/v1/editor/templates/')
    assert res_v1.status_code == status.HTTP_200_OK

    res_desktop = api_client.get('/api/desktop/templates/')
    assert res_desktop.status_code == status.HTTP_200_OK

    assert res_v1.data == res_desktop.data
