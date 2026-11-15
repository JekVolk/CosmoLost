# Постановка Задачі та Покроковий Гід: Розробка Portal API та Editor API (Для Початківця)

> **Для кого цей документ**: Бекенд-розробник (покроково «розжовано як для школяра/новачка»).  
> **Ціль**: Створити робочі ендпоінти для вебпорталу (`/api/v1/portal/`) та десктопного редактора (`/api/v1/editor/`) на Django REST Framework та покрити їх тестами.  
> **Головне правило**: **ЖОДНИХ НОВИХ ТАБЛИЦЬ У БД!** Використовуємо строго 8 існуючих моделей із `backend/core/models.py`. Усі проекти та чернетки десктопу зберігаються локально на ПК користувача (Local-First).  

---

## 🗺️ Загальна Карта: Що ми робимо

Ми пишемо код у двох додатках Django:
1. `backend/web_api/` — тут живе **Portal API** (для Three.js карти, списку планет, карток артефактів та публікацій спільноти).
2. `backend/desktop_api/` — тут живе **Editor API** (для десктопної «Фабрики контенту»: шаблони SMM-рубрик, генерація пакету для озвучки й монтажу, та підбір наступної теми).
3. `backend/config/urls.py` — реєструємо красиві шляхи.

---

## КРОК 1. Підключення URL у `backend/config/urls.py`

Відкрий файл `backend/config/urls.py` та заміни його вміст на такий, щоб у нас підтримувалися і короткі шляхи, і стандартні версіоновані `/api/v1/portal/` та `/api/v1/editor/`:

```python
"""
URL configuration for CosmoLost backend project.
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),

    # Маршрути для Вебпорталу (Three.js 3D карта)
    path('api/v1/portal/', include('web_api.urls')),
    path('api/web/', include('web_api.urls')),  # сумісність

    # Маршрути для Десктопного Редактора (Фабрика контенту)
    path('api/v1/editor/', include('desktop_api.urls')),
    path('api/desktop/', include('desktop_api.urls')),  # сумісність
]
```

---

## КРОК 2. Розробка Portal API (`backend/web_api/`)

### 2.1. Створюємо серіалізатори `backend/web_api/serializers.py`

Створи новий файл `backend/web_api/serializers.py` і скопіюй туди готовий код:

```python
from rest_framework import serializers
from core.models import (
    CelestialBody,
    Mission,
    Artifact,
    TraverseWaypoint,
    ScientificDiscovery,
    ArtifactMedia,
    CommunityPublication,
)


class CelestialBodySerializer(serializers.ModelSerializer):
    class Meta:
        model = CelestialBody
        fields = [
            'id',
            'name',
            'radius_km',
            'gravity_ms2',
            'coordinate_system_type',
            'wmts_tile_url',
            'created_at',
        ]


class TraverseWaypointSerializer(serializers.ModelSerializer):
    class Meta:
        model = TraverseWaypoint
        fields = [
            'id',
            'sol_or_step',
            'latitude',
            'longitude',
            'elevation_m',
            'odometry_m',
            'telemetry_snapshot',
            'story_snippet',
        ]


class ScientificDiscoverySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScientificDiscovery
        fields = [
            'id',
            'instrument_acronym',
            'instrument_full_name',
            'title',
            'kid_friendly_story',
            'scientific_fact',
        ]


class ArtifactMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtifactMedia
        fields = [
            'id',
            'media_category',
            'media_url',
            'nasa_id_or_pia',
            'caption',
            'credit',
        ]


class ArtifactSummarySerializer(serializers.ModelSerializer):
    mission_name = serializers.CharField(source='mission.name', read_only=True)
    celestial_body = serializers.CharField(source='celestial_body_id', read_only=True)
    coordinates = serializers.SerializerMethodField()
    cluster_info = serializers.SerializerMethodField()
    preview_image_url = serializers.SerializerMethodField()
    cosmolost_url = serializers.SerializerMethodField()

    class Meta:
        model = Artifact
        fields = [
            'id',
            'name',
            'mission_name',
            'celestial_body',
            'is_nasa_hardware',
            'artifact_type',
            'operational_status',
            'coordinates',
            'cluster_info',
            'mass_kg',
            'is_featured',
            'preview_image_url',
            'cosmolost_url',
        ]

    def get_coordinates(self, obj):
        return {
            'latitude': obj.latitude,
            'longitude': obj.longitude,
            'elevation_m': obj.elevation_m,
            'coordinate_system': obj.celestial_body.coordinate_system_type,
            'location_name': obj.location_name,
        }

    def get_cluster_info(self, obj):
        # Кластеризація за замовчуванням: 1 об'єкт
        # При зближенні фронтенд може об'єднувати об'єкти <500м
        return {
            'is_clustered': False,
            'cluster_id': None,
            'cluster_count': 1,
        }

    def get_preview_image_url(self, obj):
        first_photo = obj.media.filter(
            media_category__in=['SURFACE_PHOTO', 'LAST_KNOWN_PHOTO']
        ).first()
        if first_photo:
            return first_photo.media_url
        return 'https://images-assets.nasa.gov/image/PIA22521/PIA22521~thumb.jpg'

    def get_cosmolost_url(self, obj):
        return f'https://cosmolost.lihtar.org/artifacts/{obj.id}'


class ArtifactDetailSerializer(serializers.ModelSerializer):
    mission_name = serializers.CharField(source='mission.name', read_only=True)
    celestial_body = serializers.CharField(source='celestial_body_id', read_only=True)
    coordinates = serializers.SerializerMethodField()
    media = ArtifactMediaSerializer(many=True, read_only=True)
    discoveries = ScientificDiscoverySerializer(many=True, read_only=True)

    class Meta:
        model = Artifact
        fields = [
            'id',
            'name',
            'mission_name',
            'celestial_body',
            'artifact_type',
            'operational_status',
            'coordinates',
            'mass_kg',
            'last_contact_sol',
            'cause_of_deactivation',
            'is_featured',
            'is_nasa_hardware',
            'first_person_monologue',
            'model_3d_url',
            'updated_at',
            'media',
            'discoveries',
        ]

    def get_coordinates(self, obj):
        return {
            'latitude': obj.latitude,
            'longitude': obj.longitude,
            'elevation_m': obj.elevation_m,
            'coordinate_system': obj.celestial_body.coordinate_system_type,
            'location_name': obj.location_name,
        }


class MissionSerializer(serializers.ModelSerializer):
    artifacts = ArtifactSummarySerializer(many=True, read_only=True)

    class Meta:
        model = Mission
        fields = [
            'id',
            'nssdca_id',
            'name',
            'agency',
            'launch_date',
            'landing_date',
            'end_date',
            'summary',
            'artifacts',
        ]


class CommunityPublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityPublication
        fields = [
            'id',
            'mission',
            'artifact',
            'title',
            'video_url',
            'platform_type',
            'source_references',
            'author_name',
            'is_approved',
            'created_at',
        ]
        read_only_fields = ['id', 'is_approved', 'created_at']
```

---

### 2.2. Пишемо контролери `backend/web_api/views.py`

Відкрий файл `backend/web_api/views.py` та заміни його на:

```python
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from core.models import (
    CelestialBody,
    Mission,
    Artifact,
    TraverseWaypoint,
    ScientificDiscovery,
    ArtifactMedia,
    CommunityPublication,
)
from .serializers import (
    CelestialBodySerializer,
    ArtifactSummarySerializer,
    ArtifactDetailSerializer,
    TraverseWaypointSerializer,
    ScientificDiscoverySerializer,
    ArtifactMediaSerializer,
    MissionSerializer,
    CommunityPublicationSerializer,
)


@api_view(['GET'])
def celestial_bodies_list(request):
    """GET /api/v1/portal/celestial-bodies/"""
    bodies = CelestialBody.objects.all()
    serializer = CelestialBodySerializer(bodies, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def celestial_body_detail(request, pk):
    """GET /api/v1/portal/celestial-bodies/<pk>/"""
    body = get_object_or_404(CelestialBody, pk=pk)
    serializer = CelestialBodySerializer(body)
    return Response(serializer.data)


@api_view(['GET'])
def artifacts_list(request):
    """
    GET /api/v1/portal/artifacts/
    Фільтри через Query Params:
    ?body=mars&type=ROVER&status=DORMANT&is_featured=true&search=opportunity
    """
    qs = Artifact.objects.select_related('mission', 'celestial_body').prefetch_related('media')

    body = request.query_params.get('body')
    if body:
        qs = qs.filter(celestial_body_id=body)

    artifact_type = request.query_params.get('type')
    if artifact_type:
        qs = qs.filter(artifact_type=artifact_type)

    op_status = request.query_params.get('status')
    if op_status:
        qs = qs.filter(operational_status=op_status)

    is_featured = request.query_params.get('is_featured')
    if is_featured is not None:
        qs = qs.filter(is_featured=is_featured.lower() in ['true', '1'])

    is_nasa = request.query_params.get('is_nasa_hardware')
    if is_nasa is not None:
        qs = qs.filter(is_nasa_hardware=is_nasa.lower() in ['true', '1'])

    search = request.query_params.get('search')
    if search:
        qs = qs.filter(
            Q(name__icontains=search) |
            Q(location_name__icontains=search) |
            Q(cause_of_deactivation__icontains=search)
        )

    # Пагінація limit / offset
    try:
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
    except ValueError:
        limit, offset = 50, 0

    total = qs.count()
    results = qs[offset:offset + limit]

    serializer = ArtifactSummarySerializer(results, many=True)
    return Response({
        'total': total,
        'limit': limit,
        'offset': offset,
        'results': serializer.data,
    })


@api_view(['GET'])
def artifact_detail(request, pk):
    """GET /api/v1/portal/artifacts/<pk>/"""
    artifact = get_object_or_404(
        Artifact.objects.select_related('mission', 'celestial_body').prefetch_related('media', 'discoveries'),
        pk=pk
    )
    serializer = ArtifactDetailSerializer(artifact)
    return Response(serializer.data)


@api_view(['GET'])
def artifact_waypoints(request, pk):
    """GET /api/v1/portal/artifacts/<pk>/waypoints/"""
    get_object_or_404(Artifact, pk=pk)
    waypoints = TraverseWaypoint.objects.filter(artifact_id=pk).order_by('sol_or_step')
    serializer = TraverseWaypointSerializer(waypoints, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def artifact_discoveries(request, pk):
    """GET /api/v1/portal/artifacts/<pk>/discoveries/"""
    get_object_or_404(Artifact, pk=pk)
    discoveries = ScientificDiscovery.objects.filter(artifact_id=pk)
    serializer = ScientificDiscoverySerializer(discoveries, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def artifact_media(request, pk):
    """GET /api/v1/portal/artifacts/<pk>/media/"""
    get_object_or_404(Artifact, pk=pk)
    media = ArtifactMedia.objects.filter(artifact_id=pk)
    serializer = ArtifactMediaSerializer(media, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def missions_list(request):
    """GET /api/v1/portal/missions/"""
    missions = Mission.objects.prefetch_related('artifacts').all()
    serializer = MissionSerializer(missions, many=True)
    return Response({'total': missions.count(), 'results': serializer.data})


@api_view(['GET'])
def mission_detail(request, pk):
    """GET /api/v1/portal/missions/<pk>/"""
    mission = get_object_or_404(Mission.objects.prefetch_related('artifacts'), pk=pk)
    serializer = MissionSerializer(mission)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
def community_publications_view(request):
    """
    GET: список схвалених відео спільноти
    POST: відправка нового ролика на премодерацію (is_approved=False)
    """
    if request.method == 'GET':
        qs = CommunityPublication.objects.filter(is_approved=True)
        mission_id = request.query_params.get('mission_id')
        if mission_id:
            qs = qs.filter(mission_id=mission_id)
        artifact_id = request.query_params.get('artifact_id')
        if artifact_id:
            qs = qs.filter(artifact_id=artifact_id)

        serializer = CommunityPublicationSerializer(qs, many=True)
        return Response({'total': qs.count(), 'results': serializer.data})

    elif request.method == 'POST':
        serializer = CommunityPublicationSerializer(data=request.data)
        if serializer.is_valid():
            publication = serializer.save(is_approved=False)
            return Response(
                {
                    'id': str(publication.id),
                    'status': 'SUBMITTED_FOR_REVIEW',
                    'is_approved': False,
                    'message': 'Публікацію відправлено на модерацію. Вона з\'явиться на порталі після схвалення.',
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

---

### 2.3. Підключаємо роутинг у `backend/web_api/urls.py`

Відкрий `backend/web_api/urls.py` і пропиши:

```python
from django.urls import path
from . import views

app_name = 'web_api'

urlpatterns = [
    # Небесні тіла
    path('celestial-bodies/', views.celestial_bodies_list, name='celestial-bodies-list'),
    path('celestial-bodies/<str:pk>/', views.celestial_body_detail, name='celestial-body-detail'),

    # Артефакти
    path('artifacts/', views.artifacts_list, name='artifacts-list'),
    path('artifacts/<str:pk>/', views.artifact_detail, name='artifact-detail'),
    path('artifacts/<str:pk>/waypoints/', views.artifact_waypoints, name='artifact-waypoints'),
    path('artifacts/<str:pk>/discoveries/', views.artifact_discoveries, name='artifact-discoveries'),
    path('artifacts/<str:pk>/media/', views.artifact_media, name='artifact-media'),

    # Місії
    path('missions/', views.missions_list, name='missions-list'),
    path('missions/<str:pk>/', views.mission_detail, name='mission-detail'),

    # Публікації спільноти
    path('community-publications/', views.community_publications_view, name='community-publications'),
]
```

---

## КРОК 3. Розробка Editor API (`backend/desktop_api/`)

Пам'ятай: **нових моделей у БД не створюємо!** Десктопний клієнт (Tauri) сам зберігає чернетки на диску користувача в `%APPDATA%/CosmoLost/`. Бекенд тільки надає шаблони рубрик, збирає монтажний пакет та підбирає наступну тему.

### 3.1. Пишемо контролери `backend/desktop_api/views.py`

Відкрий `backend/desktop_api/views.py` і скопіюй готовий код:

```python
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from core.models import Artifact, ArtifactMedia, Mission


# Статичний реєстр рубрик (без потреби у таблиці в БД!)
EDITORIAL_TEMPLATES = [
    {
        'id': 'last-sol-drama',
        'rubric_name': "Останній день на зв'язку (Драма та згасання)",
        'target_duration_sec': 40,
        'safe_zone_preset': 'PILLOWBOX_9_16',
        'slide_structure': [
            {'slide_index': 1, 'type': 'HOOK', 'duration_sec': 3.5, 'safe_zone_layout': 'FULLSCREEN_AVATAR'},
            {'slide_index': 2, 'type': 'B_ROLL_FACTS', 'duration_sec': 14.0, 'safe_zone_layout': 'CORNER_AVATAR_CENTER_3D'},
            {'slide_index': 3, 'type': 'DRAMA_PEAK', 'duration_sec': 16.5, 'safe_zone_layout': 'TELEMETRY_HUD_SPLIT'},
            {'slide_index': 4, 'type': 'SEAMLESS_LOOP_CTA', 'duration_sec': 6.0, 'safe_zone_layout': 'CTA_QR_PORTAL'},
        ]
    },
    {
        'id': 'dictionary-explain',
        'rubric_name': 'Як це працює? (Наука для школярів)',
        'target_duration_sec': 35,
        'safe_zone_preset': 'PILLOWBOX_9_16',
        'slide_structure': [
            {'slide_index': 1, 'type': 'HOOK', 'duration_sec': 3.0, 'safe_zone_layout': 'FULLSCREEN_AVATAR'},
            {'slide_index': 2, 'type': 'B_ROLL_FACTS', 'duration_sec': 15.0, 'safe_zone_layout': 'CENTER_DIAGRAM'},
            {'slide_index': 3, 'type': 'DRAMA_PEAK', 'duration_sec': 12.0, 'safe_zone_layout': 'EXPERT_CLOSEUP'},
            {'slide_index': 4, 'type': 'SEAMLESS_LOOP_CTA', 'duration_sec': 5.0, 'safe_zone_layout': 'CTA_QR_PORTAL'},
        ]
    },
    {
        'id': 'lunar-secrets',
        'rubric_name': 'Таємниці Місяця (Ретрорефлектори та сліди Apollo)',
        'target_duration_sec': 40,
        'safe_zone_preset': 'PILLOWBOX_9_16',
        'slide_structure': [
            {'slide_index': 1, 'type': 'HOOK', 'duration_sec': 3.5, 'safe_zone_layout': 'FULLSCREEN_AVATAR'},
            {'slide_index': 2, 'type': 'B_ROLL_FACTS', 'duration_sec': 16.5, 'safe_zone_layout': 'CORNER_AVATAR_CENTER_3D'},
            {'slide_index': 3, 'type': 'DRAMA_PEAK', 'duration_sec': 14.0, 'safe_zone_layout': 'TELEMETRY_HUD_SPLIT'},
            {'slide_index': 4, 'type': 'SEAMLESS_LOOP_CTA', 'duration_sec': 6.0, 'safe_zone_layout': 'CTA_QR_PORTAL'},
        ]
    }
]


@api_view(['GET'])
def templates_list(request):
    """GET /api/v1/editor/templates/"""
    return Response(EDITORIAL_TEMPLATES)


@api_view(['GET'])
def template_detail(request, pk):
    """GET /api/v1/editor/templates/<pk>/"""
    template = next((t for t in EDITORIAL_TEMPLATES if t['id'] == pk), None)
    if not template:
        return Response({'error': 'NOT_FOUND', 'message': 'Шаблон не знайдено'}, status=status.HTTP_404_NOT_FOUND)
    return Response(template)


@api_view(['GET'])
def artifact_asset_bundle(request, pk):
    """
    GET /api/v1/editor/artifacts/<pk>/assets/
    Збирає монтажний пакет для десктопного редактора
    """
    artifact = get_object_or_404(Artifact.objects.select_related('mission'), pk=pk)

    # Фотографії високої роздільності з бази
    photos = list(
        artifact.media.filter(
            media_category__in=['SURFACE_PHOTO', 'LAST_KNOWN_PHOTO', 'PANORAMA']
        ).values_list('media_url', flat=True)
    )

    # Якщо фотографій ще немає, додаємо дефолтний знімок
    if not photos:
        photos = ['https://photojournal.jpl.nasa.gov/jpeg/PIA22521.jpg']

    monologue = artifact.first_person_monologue or f"I am {artifact.name}, stationed on {artifact.location_name}."

    data = {
        'artifact_id': artifact.id,
        'name': artifact.name,
        'tts_script': {
            'en': monologue,
            'uk': f"Мій годинник зупинився на {artifact.location_name}. {monologue}",
        },
        'seo_caption': {
            'line1_hook': f"Чому вчені мовчали про те, що сталося з {artifact.name}? 👇",
            'line2_seo': f"Повна історія місії {artifact.mission.name if artifact.mission else 'NASA'} та 3D-мапа: cosmolost.lihtar.org",
            'line3_tags': '#космос #наука #марсохід #nasa #cosmolost',
        },
        'pin_comment': f"Як ви вважаєте, чи варто в майбутньому забрати {artifact.name} на Землю в музей, чи залишити пам'ятником на поверхні?",
        'high_res_photos': photos,
        'model_3d_glb_url': artifact.model_3d_url,
    }
    return Response(data)


@api_view(['POST'])
def recommend_next_topic(request):
    """
    POST /api/v1/editor/recommend-next-topic/
    Підбирає наступний зв'язаний артефакт у базі даних (Smart Next Topic Engine)
    """
    current_id = request.data.get('current_artifact_id')
    rubric_id = request.data.get('rubric_id', 'last-sol-drama')
    selection_reason = request.data.get('selection_reason', '')

    current_art = Artifact.objects.filter(id=current_id).first()

    # Шукаємо інший апарат на тому ж тілі або з іншої місії
    candidate = Artifact.objects.exclude(id=current_id).first()
    if not candidate:
        candidate = current_art

    candidate_name = candidate.name if candidate else 'Opportunity Rover'
    candidate_id = candidate.id if candidate else 'opportunity-rover'

    narrative_bridge = (
        f"Поки історія {current_art.name if current_art else 'попереднього апарата'} вражає своєю долею, "
        f"його побратим {candidate_name} зіткнувся з зовсім іншим невідомим викликом..."
    )

    return Response({
        'suggested_artifact_id': candidate_id,
        'suggested_artifact_name': candidate_name,
        'narrative_bridge': narrative_bridge,
        'suggested_hook': f"А ви знали, що побратим {candidate_name} здійснив справжнє наукове диво?",
        'suggested_rubric_id': rubric_id,
        'recommended_pin_comment': f"Чия місія була важливішою для людства: {current_art.name if current_art else 'Spirit'} чи {candidate_name}?",
    })
```

---

### 3.2. Підключаємо роутинг у `backend/desktop_api/urls.py`

Відкрий `backend/desktop_api/urls.py` і пропиши:

```python
from django.urls import path
from . import views

app_name = 'desktop_api'

urlpatterns = [
    path('templates/', views.templates_list, name='templates-list'),
    path('templates/<str:pk>/', views.template_detail, name='template-detail'),
    path('artifacts/<str:pk>/assets/', views.artifact_asset_bundle, name='artifact-asset-bundle'),
    path('recommend-next-topic/', views.recommend_next_topic, name='recommend-next-topic'),
]
```

---

## КРОК 4. Готові Тести Pytest для Новачка

Ми напишемо повноцінні тести з фікстурами тестової бази даних.

### 4.1. Тести для Portal API: `backend/web_api/tests.py`

Відкрий `backend/web_api/tests.py` і встав:

```python
import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from core.models import CelestialBody, Mission, Artifact, ArtifactType, OperationalStatus, CommunityPublication, PlatformType


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
        coordinate_system_type='PLANETOCENTRIC_360',
        wmts_tile_url='https://trek.nasa.gov/tiles/Mars/{TileMatrix}/{TileRow}/{TileCol}.jpg',
    )
    mission = Mission.objects.create(
        id='mer-b',
        nssdca_id='2003-032A',
        name='Mars Exploration Rover - Opportunity',
        agency='NASA',
        summary='Twin rover search for past liquid water on Mars.',
    )
    artifact = Artifact.objects.create(
        id='opportunity-rover',
        mission=mission,
        celestial_body=mars,
        name='Opportunity Rover',
        artifact_type=ArtifactType.ROVER,
        operational_status=OperationalStatus.DORMANT,
        latitude=-1.9462,
        longitude=354.4734,
        location_name='Perseverance Valley',
        is_featured=True,
        first_person_monologue='My battery is low and it is getting dark.',
    )
    return {'mars': mars, 'mission': mission, 'artifact': artifact}


@pytest.mark.django_db
def test_celestial_bodies_list(api_client, sample_data):
    url = reverse('web_api:celestial-bodies-list')
    response = api_client.get(url)
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['id'] == 'mars'


@pytest.mark.django_db
def test_artifacts_list_and_filters(api_client, sample_data):
    url = reverse('web_api:artifacts-list')
    response = api_client.get(url, {'body': 'mars', 'is_featured': 'true'})
    assert response.status_code == 200
    assert response.data['total'] == 1
    assert response.data['results'][0]['id'] == 'opportunity-rover'


@pytest.mark.django_db
def test_artifact_detail(api_client, sample_data):
    url = reverse('web_api:artifact-detail', kwargs={'pk': 'opportunity-rover'})
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.data['name'] == 'Opportunity Rover'
    assert 'first_person_monologue' in response.data


@pytest.mark.django_db
def test_submit_community_publication(api_client, sample_data):
    url = reverse('web_api:community-publications')
    payload = {
        'mission_id': 'mer-b',
        'artifact_id': 'opportunity-rover',
        'title': 'Last Sol of Opportunity',
        'video_url': 'https://youtube.com/shorts/sample123',
        'platform_type': PlatformType.YOUTUBE,
        'source_references': 'NASA Photojournal PIA22521',
        'author_name': 'SpaceJunior',
    }
    response = api_client.post(url, payload, format='json')
    assert response.status_code == 201
    assert response.data['status'] == 'SUBMITTED_FOR_REVIEW'
    assert response.data['is_approved'] is False
```

---

### 4.2. Тести для Editor API: `backend/desktop_api/tests.py`

Відкрий `backend/desktop_api/tests.py` і встав:

```python
import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from core.models import CelestialBody, Mission, Artifact, ArtifactType, OperationalStatus


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def sample_artifact(db):
    mars = CelestialBody.objects.create(
        id='mars',
        name='Mars',
        radius_km=3396.2,
        gravity_ms2=3.72,
        coordinate_system_type='PLANETOCENTRIC_360',
        wmts_tile_url='https://example.com',
    )
    mission = Mission.objects.create(
        id='mer-a',
        nssdca_id='2003-027A',
        name='Spirit Rover',
        agency='NASA',
        summary='Spirit mission.',
    )
    return Artifact.objects.create(
        id='spirit-rover',
        mission=mission,
        celestial_body=mars,
        name='Spirit Rover',
        artifact_type=ArtifactType.ROVER,
        operational_status=OperationalStatus.DORMANT,
        latitude=-14.5684,
        longitude=175.4726,
        location_name='Gusev Crater',
        first_person_monologue='Spirit signing off from Gusev.',
    )


@pytest.mark.django_db
def test_get_editorial_templates(api_client):
    url = reverse('desktop_api:templates-list')
    response = api_client.get(url)
    assert response.status_code == 200
    assert len(response.data) >= 3
    assert response.data[0]['target_duration_sec'] == 40


@pytest.mark.django_db
def test_artifact_asset_bundle(api_client, sample_artifact):
    url = reverse('desktop_api:artifact-asset-bundle', kwargs={'pk': 'spirit-rover'})
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.data['artifact_id'] == 'spirit-rover'
    assert 'tts_script' in response.data
    assert 'seo_caption' in response.data
    assert 'pin_comment' in response.data


@pytest.mark.django_db
def test_recommend_next_topic(api_client, sample_artifact):
    url = reverse('desktop_api:recommend-next-topic')
    payload = {
        'current_artifact_id': 'spirit-rover',
        'rubric_id': 'last-sol-drama',
        'selection_reason': 'Застрягання у пісках Troy',
    }
    response = api_client.post(url, payload, format='json')
    assert response.status_code == 200
    assert 'suggested_artifact_id' in response.data
    assert 'narrative_bridge' in response.data
```

---

## КРОК 5. Як запустити та перевірити роботу (Команди в консолі)

1. Перейди в папку бекенду:
   ```powershell
   cd backend
   ```
2. Запусти тести:
   ```powershell
   pytest
   ```
   Усі тести мають пройти зеленими (`PASSED`)!
3. Запусти локальний сервер:
   ```powershell
   python manage.py runserver
   ```
4. Відкрий у браузері або Postman:
   * `http://127.0.0.1:8000/api/v1/portal/celestial-bodies/`
   * `http://127.0.0.1:8000/api/v1/portal/artifacts/`
   * `http://127.0.0.1:8000/api/v1/editor/templates/`
