"""
Comprehensive Pytest Test Suite for NASA Ingestion Subsystem.
Run: uv run pytest loader/tests/test_loader.py -v
"""
from datetime import date
from unittest.mock import MagicMock, patch
import pytest

from core.models import (
    Artifact,
    ArtifactMedia,
    CelestialBody,
    Mission,
    ScientificDiscovery,
    TraverseWaypoint,
)
from loader.domain.dtos import (
    ArtifactDTO,
    CelestialBodyDTO,
    DiscoveryDTO,
    MediaDTO,
    MissionDTO,
    SyncStatsDTO,
    WaypointDTO,
)
from loader.domain.exceptions import IngestValidationError, RateLimitExceededError
from loader.domain.mappers import NASAJsonMapper
from loader.infrastructure.nasa_client import NASAClient
from loader.infrastructure.state_store import SyncStateStore
from loader.infrastructure.token_pool import NASATokenPool
from loader.repositories.django_repository import DjangoNASAIngestRepository
from loader.services.archive_media_service import ArchiveMediaIngestService
from loader.services.artifacts_service import ArtifactsIngestService
from loader.services.celestial_bodies_service import CelestialBodiesIngestService
from loader.services.discoveries_service import DiscoveriesIngestService
from loader.services.ingest_pipeline import NASAIngestPipeline
from loader.services.missions_service import MissionsIngestService
from loader.services.rover_photos_service import RoverPhotosIngestService
from loader.services.traverse_waypoints_service import TraverseWaypointsIngestService


# ==============================================================================
# 1. Token Pool Tests
# ==============================================================================

def test_token_pool_rotation_on_429():
    keys = "KEY_ALPHA,KEY_BETA,KEY_GAMMA"
    pool = NASATokenPool(raw_keys=keys)

    token1 = pool.get_token()
    assert token1 == "KEY_ALPHA"

    # Simulate HTTP 429 on first token
    pool.mark_rate_limited("KEY_ALPHA", cooldown_seconds=60)

    # Must automatically yield next active key
    token2 = pool.get_token()
    assert token2 == "KEY_BETA"

    pool.mark_rate_limited("KEY_BETA", cooldown_seconds=60)
    token3 = pool.get_token()
    assert token3 == "KEY_GAMMA"

    # All tokens blocked -> RateLimitExceededError
    pool.mark_rate_limited("KEY_GAMMA", cooldown_seconds=60)
    with pytest.raises(RateLimitExceededError):
        pool.get_token()


def test_token_pool_empty_initialization():
    pool = NASATokenPool(raw_keys="")
    assert len(pool.tokens) == 1
    assert pool.tokens[0].key == "DEMO_KEY"


# ==============================================================================
# 2. Mapper and Normalization Tests
# ==============================================================================

def test_longitude_normalization_mapper():
    # Mars IAU 2000 planetocentric: 354.4734 -> -5.5266
    lon_raw = 354.4734
    normalized = NASAJsonMapper.normalize_longitude(lon_raw)
    assert normalized == -5.5266

    # Normal coordinates within -180..180
    assert NASAJsonMapper.normalize_longitude(23.47297) == 23.47297
    assert NASAJsonMapper.normalize_longitude(-77.45) == -77.45


def test_date_parsing_mapper():
    assert NASAJsonMapper.parse_date("2021-02-18") == date(2021, 2, 18)
    assert NASAJsonMapper.parse_date(None) is None
    assert NASAJsonMapper.parse_date("invalid-date") is None


def test_mapper_raw_validation():
    with pytest.raises(IngestValidationError):
        NASAJsonMapper.raw_to_celestial_body_dto({'id': 'test'})

    with pytest.raises(IngestValidationError):
        NASAJsonMapper.raw_to_mission_dto({'id': 'test'})

    with pytest.raises(IngestValidationError):
        NASAJsonMapper.raw_to_artifact_dto({'id': 'test', 'celestial_body_id': 'mars'})


# ==============================================================================
# 3. State Store Tests
# ==============================================================================

def test_state_store_hash_detection(tmp_path):
    store_file = str(tmp_path / "test_state.json")
    store = SyncStateStore(fallback_file_path=store_file)
    payload1 = {'name': 'Opportunity', 'status': 'DORMANT'}
    payload2 = {'name': 'Opportunity', 'status': 'ACTIVE'}

    hash1 = store.compute_hash(payload1)
    hash2 = store.compute_hash(payload2)

    assert hash1 != hash2
    assert store.is_changed('artifact', 'oppy', hash1) is True

    store.update_hash('artifact', 'oppy', hash1)
    assert store.is_changed('artifact', 'oppy', hash1) is False
    assert store.is_changed('artifact', 'oppy', hash2) is True


# ==============================================================================
# 4. Repository Persistence & Idempotency Tests
# ==============================================================================

@pytest.mark.django_db
def test_repository_upsert_idempotency():
    repo = DjangoNASAIngestRepository()

    # 1. CelestialBody
    body_dto = CelestialBodyDTO(
        id='test-mars',
        name='Test Mars',
        radius_km=3389.5,
        gravity_ms2=3.72,
        coordinate_system_type='PLANETOCENTRIC_360',
        wmts_tile_url='https://example.com/tiles',
    )
    c1, u1 = repo.upsert_celestial_body(body_dto)
    assert c1 is True and u1 is False

    c2, u2 = repo.upsert_celestial_body(body_dto)
    assert c2 is False and u2 is True
    assert CelestialBody.objects.filter(id='test-mars').count() == 1

    # 2. Mission
    mission_dto = MissionDTO(
        id='test-mer',
        name='Test Mission',
        agency='NASA/JPL',
        summary='Testing mission persistence',
    )
    m_c1, m_u1 = repo.upsert_mission(mission_dto)
    assert m_c1 is True and m_u1 is False
    assert Mission.objects.filter(id='test-mer').count() == 1

    # 3. Artifact
    artifact_dto = ArtifactDTO(
        id='test-rover',
        mission_id='test-mer',
        celestial_body_id='test-mars',
        name='Test Rover',
        artifact_type='ROVER',
        operational_status='DORMANT',
        latitude=-1.94,
        longitude=354.47,  # Will normalize
        model_3d_url='https://example.com/model.glb',
    )
    a_c1, a_u1 = repo.upsert_artifact(artifact_dto)
    assert a_c1 is True and a_u1 is False

    saved_art = Artifact.objects.get(id='test-rover')
    assert round(saved_art.longitude, 2) == -5.53

    # 4. Waypoints
    wp_dtos = [
        WaypointDTO(
            artifact_id='test-rover',
            sol_or_step=1,
            latitude=-1.94,
            longitude=-5.53,
            story_snippet='Landed successfully',
        ),
        WaypointDTO(
            artifact_id='test-rover',
            sol_or_step=2,
            latitude=-1.95,
            longitude=-5.54,
            story_snippet='Drove 10m',
        ),
    ]
    wp_count = repo.upsert_waypoints('test-rover', wp_dtos)
    assert wp_count == 2
    assert TraverseWaypoint.objects.filter(artifact_id='test-rover').count() == 2

    # 5. Discoveries
    disc_dtos = [
        DiscoveryDTO(
            artifact_id='test-rover',
            title='Found Hematite',
            scientific_fact='Proof of ancient liquid water',
        )
    ]
    disc_count = repo.upsert_discoveries('test-rover', disc_dtos)
    assert disc_count == 1
    assert ScientificDiscovery.objects.filter(artifact_id='test-rover').count() == 1

    # 6. Media
    media_dtos = [
        MediaDTO(
            artifact_id='test-rover',
            media_category='SURFACE_PHOTO',
            media_url='https://example.com/photo.jpg',
            nasa_id_or_pia='TEST-PIA001',
        )
    ]
    media_count = repo.upsert_media('test-rover', media_dtos)
    assert media_count == 1
    assert ArtifactMedia.objects.filter(artifact_id='test-rover').count() == 1


# ==============================================================================
# 5. Mocked NASA Client & Services Tests
# ==============================================================================

@pytest.mark.django_db
def test_nasa_client_and_rover_photos_mocked(tmp_path):
    pool = NASATokenPool("MOCK_KEY_1,MOCK_KEY_2")
    client = NASAClient(token_pool=pool, enable_mock_fallback=True)
    repo = DjangoNASAIngestRepository()

    # Pre-populate artifact
    body_dto = CelestialBodyDTO('mars', 'Mars', 3389.5, 3.72, 'PLANETOCENTRIC_360', 'https://wmts')
    repo.upsert_celestial_body(body_dto)
    art_dto = ArtifactDTO(
        id='opportunity-rover',
        mission_id=None,
        celestial_body_id='mars',
        name='Opportunity',
        artifact_type='ROVER',
        operational_status='DORMANT',
        latitude=-1.94,
        longitude=-5.53,
    )
    repo.upsert_artifact(art_dto)

    mock_photos_response = {
        'photos': [
            {
                'id': 123456,
                'sol': 5111,
                'img_src': 'http://mars.jpl.nasa.gov/oppy/sol5111.jpg',
                'camera': {'name': 'PANCAM'},
            }
        ]
    }

    stats = SyncStatsDTO(start_time=MagicMock())
    with patch.object(client, 'get', return_value=mock_photos_response):
        service = RoverPhotosIngestService(client=client, repository=repo)
        results = service.sync_rover_photos('opportunity-rover', stats=stats)

        assert len(results) == 1
        assert results[0].media_url == 'https://mars.jpl.nasa.gov/oppy/sol5111.jpg'
        assert stats.media_inserted == 1
        assert ArtifactMedia.objects.filter(artifact_id='opportunity-rover').count() == 1


@pytest.mark.django_db
def test_archive_media_service_mocked():
    pool = NASATokenPool("MOCK_KEY")
    client = NASAClient(token_pool=pool)
    repo = DjangoNASAIngestRepository()

    # Seed body and artifact
    body_dto = CelestialBodyDTO('moon', 'Moon', 1737.4, 1.62, 'SELENOGRAPHIC', 'https://wmts')
    repo.upsert_celestial_body(body_dto)
    art_dto = ArtifactDTO(
        id='apollo-11-descent-stage',
        mission_id=None,
        celestial_body_id='moon',
        name='Apollo 11 Eagle',
        artifact_type='DESCENT_STAGE',
        operational_status='PASSIVE_ACTIVE',
        latitude=0.67,
        longitude=23.47,
    )
    repo.upsert_artifact(art_dto)

    mock_search_results = [
        {
            'nasa_id': 'AS11-40-5927',
            'title': 'Eagle on Tranquility Base',
            'href': 'https://images-assets.nasa.gov/image/AS11-40-5927.jpg',
            'photographer': 'NASA/Neil Armstrong',
        }
    ]

    stats = SyncStatsDTO(start_time=MagicMock())
    with patch.object(client, 'search_archive_images', return_value=mock_search_results):
        service = ArchiveMediaIngestService(client=client, repository=repo)
        media_list = service.sync_artifact_media('apollo-11-descent-stage', stats=stats)

        assert len(media_list) >= 1
        assert ArtifactMedia.objects.filter(nasa_id_or_pia='AS11-40-5927').exists()


# ==============================================================================
# 6. Full Pipeline Integration Test
# ==============================================================================

@pytest.mark.django_db
def test_full_pipeline_sync(tmp_path):
    store_path = str(tmp_path / "pipeline_state.json")
    state_store = SyncStateStore(fallback_file_path=store_path)
    pool = NASATokenPool("TEST_KEY")
    client = NASAClient(token_pool=pool, enable_mock_fallback=True)
    repo = DjangoNASAIngestRepository()

    pipeline = NASAIngestPipeline(
        client=client,
        repository=repo,
        state_store=state_store,
        max_workers=2,
    )

    # Mock external network methods in client to avoid live calls in test
    with patch.object(client, 'fetch_rover_photos', return_value=[]), \
         patch.object(client, 'search_archive_images', return_value=[]), \
         patch.object(client, 'fetch_mmgis_layer', return_value={'features': []}):

        # Run 1: Full ingestion
        stats1 = pipeline.run_sync(force=True, parallel=False)
        assert stats1.is_success is True
        assert stats1.celestial_bodies_new >= 2
        assert stats1.missions_new >= 8
        assert stats1.artifacts_new >= 6
        assert stats1.discoveries_inserted >= 5
        assert stats1.waypoints_inserted >= 6

        # Check DB records
        assert CelestialBody.objects.filter(id='mars').exists()
        assert CelestialBody.objects.filter(id='moon').exists()
        assert Artifact.objects.filter(id='opportunity-rover').exists()
        assert Artifact.objects.filter(id='apollo-11-descent-stage').exists()

        # Run 2: Delta sync without force -> no new records should be inserted!
        stats2 = pipeline.run_sync(force=False, parallel=False)
        assert stats2.is_success is True
        assert stats2.celestial_bodies_new == 0
        assert stats2.missions_new == 0
        assert stats2.artifacts_new == 0


@pytest.mark.django_db
def test_pipeline_dry_run(tmp_path):
    store_path = str(tmp_path / "dry_run_state.json")
    state_store = SyncStateStore(fallback_file_path=store_path)
    pool = NASATokenPool("TEST_KEY")
    client = NASAClient(token_pool=pool, enable_mock_fallback=True)
    repo = DjangoNASAIngestRepository()

    pipeline = NASAIngestPipeline(client=client, repository=repo, state_store=state_store)

    with patch.object(client, 'fetch_rover_photos', return_value=[]), \
         patch.object(client, 'search_archive_images', return_value=[]), \
         patch.object(client, 'fetch_mmgis_layer', return_value={'features': []}):

        stats = pipeline.run_sync(dry_run=True, parallel=False)
        assert stats.is_success is True

    # Zero database records should be created in dry-run mode
    assert CelestialBody.objects.count() == 0
    assert Artifact.objects.count() == 0


@pytest.mark.django_db
def test_django_tasks_enqueue_execution():
    from django_tasks import TaskResultStatus
    from loader.tasks import sync_nasa_catalog_task

    with patch('loader.tasks.NASAClient.fetch_rover_photos', return_value=[]), \
         patch('loader.tasks.NASAClient.search_archive_images', return_value=[]), \
         patch('loader.tasks.NASAClient.fetch_mmgis_layer', return_value={'features': []}):

        task_result = sync_nasa_catalog_task.enqueue(target_body='moon', force=True)

        assert task_result.status == TaskResultStatus.SUCCESSFUL
        ret = task_result.return_value
        assert ret is not None
        assert ret['is_success'] is True
        assert ret['celestial_bodies_new'] >= 1
        assert ret['artifacts_new'] >= 1

        assert CelestialBody.objects.filter(id='moon').exists()
        assert Artifact.objects.filter(celestial_body_id='moon').exists()


# ==============================================================================
# 7. Security, Boundary, and Hacker Resilience Tests
# ==============================================================================

def test_nan_and_inf_coordinate_injection():
    # NaN and Infinity must be rejected to prevent spatial index / database crashes
    with pytest.raises(IngestValidationError):
        NASAJsonMapper.normalize_longitude(float('nan'))

    with pytest.raises(IngestValidationError):
        NASAJsonMapper.normalize_longitude(float('inf'))

    with pytest.raises(IngestValidationError):
        NASAJsonMapper.validate_latitude(95.0)  # > 90.0

    with pytest.raises(IngestValidationError):
        NASAJsonMapper.validate_latitude(float('-inf'))


def test_url_scheme_injection_defense():
    # Malicious protocols (SSRF, XSS) must be sanitized to empty string
    assert NASAJsonMapper.sanitize_url("javascript:alert(1)") == ""
    assert NASAJsonMapper.sanitize_url("file:///etc/passwd") == ""
    assert NASAJsonMapper.sanitize_url("data:text/html;base64,PHNjcmlwdD4=") == ""
    assert NASAJsonMapper.sanitize_url(None) == ""

    # Legitimate HTTP/HTTPS URLs must be preserved
    assert NASAJsonMapper.sanitize_url("https://photojournal.jpl.nasa.gov/image.jpg") == "https://photojournal.jpl.nasa.gov/image.jpg"
    assert NASAJsonMapper.sanitize_url("http://mars.nasa.gov/model.glb") == "http://mars.nasa.gov/model.glb"


def test_long_string_truncation_defense():
    # Huge titles (e.g. 1000 characters) must truncate to column limits without throwing DataError
    giant_string = "X" * 1000
    item = {
        'nasa_id': giant_string,
        'title': giant_string,
        'href': 'https://example.com/huge.jpg',
        'photographer': giant_string,
    }
    media_dto = NASAJsonMapper.archive_item_to_media_dto(item, artifact_id='test-rover')
    assert len(media_dto.nasa_id_or_pia) <= 100
    assert len(media_dto.caption) <= 500
    assert len(media_dto.credit) <= 255


def test_state_store_atomic_file_write(tmp_path):
    store_file = str(tmp_path / "atomic_state.json")
    store = SyncStateStore(fallback_file_path=store_file)

    # Save state
    store.update_hash('artifact', 'rover1', 'hash_12345')
    assert store.is_changed('artifact', 'rover1', 'hash_12345') is False

    # Verify temp file was cleanly replaced and does not remain on disk
    assert not (tmp_path / "atomic_state.json.tmp").exists()
    assert (tmp_path / "atomic_state.json").exists()


# ==============================================================================
# 11. Management Command & Fallback Tests
# ==============================================================================

@pytest.mark.django_db
def test_ingest_nasa_catalog_management_command(capsys):
    """Verify ingest_nasa_catalog command runs cleanly and supports all CLI flags."""
    from django.core.management import call_command
    from io import StringIO

    out = StringIO()
    call_command('ingest_nasa_catalog', target='moon', dry_run=True, stdout=out)
    output = out.getvalue()
    assert '[LOADER] Initializing NASA Ingest Subsystem...' in output
    captured = capsys.readouterr()
    assert 'COSMOLOST NASA INGEST' in captured.out
    assert 'SUCCESS' in captured.out


def test_rover_photos_fallback_to_curated_seeds():
    """Verify RoverPhotosIngestService falls back to curated seeds when NASA API returns empty/404."""
    mock_client = MagicMock(spec=NASAClient)
    mock_client.fetch_rover_photos.return_value = []
    mock_repo = MagicMock(spec=DjangoNASAIngestRepository)
    service = RoverPhotosIngestService(mock_client, mock_repo)

    stats = SyncStatsDTO(start_time=date.today())
    photos = service.sync_rover_photos('opportunity-rover', stats, dry_run=True)
    assert len(photos) > 0
    assert any('PIA23000' in p.nasa_id_or_pia for p in photos)
