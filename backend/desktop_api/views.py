from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from core.models import Artifact, MediaCategory
from .serializers import (
    ContentTemplateSerializer,
    EditorAssetBundleSerializer,
    RecommendNextTopicRequestSerializer,
    RecommendNextTopicResponseSerializer,
)

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
        ],
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
        ],
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
        ],
    },
]


@api_view(['GET'])
@permission_classes([AllowAny])
def templates_list(request):
    """GET /api/v1/editor/templates/"""
    serializer = ContentTemplateSerializer(EDITORIAL_TEMPLATES, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def template_detail(request, pk):
    """GET /api/v1/editor/templates/<pk>/"""
    template = next((t for t in EDITORIAL_TEMPLATES if t['id'] == pk), None)
    if not template:
        return Response(
            {'error': 'NOT_FOUND', 'message': f"Шаблон з ідентифікатором '{pk}' не знайдено."},
            status=status.HTTP_404_NOT_FOUND,
        )
    serializer = ContentTemplateSerializer(template)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def artifact_asset_bundle(request, pk):
    """
    GET /api/v1/editor/artifacts/<pk>/assets/
    Assembles production media & text asset bundle for desktop editor video rendering.
    """
    artifact = get_object_or_404(
        Artifact.objects.select_related('mission', 'celestial_body').prefetch_related('media'),
        pk=pk,
    )

    categories = [
        'SURFACE_FIRST_PERSON',
        MediaCategory.SURFACE_PHOTO,
        MediaCategory.PANORAMA,
        MediaCategory.LAST_KNOWN_PHOTO,
        MediaCategory.ORBITAL,
    ]
    photos = [
        m.media_url
        for m in artifact.media.all()
        if m.media_category in categories or str(m.media_category) in categories
    ]
    if not photos:
        photos = ['https://photojournal.jpl.nasa.gov/jpeg/PIA22521.jpg']

    monologue = (
        artifact.first_person_monologue
        or f"I am {artifact.name}, stationed on {artifact.location_name or 'the surface'}."
    )
    location = artifact.location_name or 'поверхні'
    mission_name = artifact.mission.name if artifact.mission else 'NASA'
    body_name = artifact.celestial_body.name if artifact.celestial_body else 'космосі'

    if artifact.cause_of_deactivation:
        pin_comment = f"Як ви вважаєте, чи можна було зберегти {artifact.name}, знаючи що причиною відключення стало: {artifact.cause_of_deactivation}?"
    else:
        pin_comment = f"Як ви вважаєте, чи варто в майбутньому забрати {artifact.name} на Землю в музей, чи залишити пам'ятником на {body_name}?"

    bundle = {
        'artifact_id': artifact.id,
        'name': artifact.name,
        'tts_script': {
            'en': monologue,
            'uk': f"Мій годинник зупинився на {location}. {monologue}",
        },
        'seo_caption': {
            'line1_hook': f"Чому вчені мовчали про те, що насправді сталося з {artifact.name}? 👇",
            'line2_seo': f"Повна історія місії {mission_name} на {body_name}. 3D-мапа: cosmolost.lihtar.org",
            'line3_tags': '#cosmolost #nasa #space #космос #наука',
        },
        'pin_comment': pin_comment,
        'high_res_photos': photos,
        'model_3d_glb_url': artifact.model_3d_url or None,
    }

    serializer = EditorAssetBundleSerializer(bundle)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def recommend_next_topic(request):
    """
    POST /api/v1/editor/recommend-next-topic/
    Selects the next related artifact to create serialized content across episodes.
    """
    req_serializer = RecommendNextTopicRequestSerializer(data=request.data)
    if not req_serializer.is_valid():
        return Response(req_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    current_id = req_serializer.validated_data['current_artifact_id']
    rubric_id = req_serializer.validated_data['rubric_id']

    current_art = get_object_or_404(
        Artifact.objects.select_related('mission', 'celestial_body'),
        id=current_id,
    )

    # 1. Look for sibling in same mission
    candidate = None
    if current_art.mission_id:
        candidate = (
            Artifact.objects.filter(mission_id=current_art.mission_id)
            .exclude(id=current_id)
            .first()
        )

    # 2. Look for sibling on same celestial body
    if not candidate and current_art.celestial_body_id:
        candidate = (
            Artifact.objects.filter(celestial_body_id=current_art.celestial_body_id)
            .exclude(id=current_id)
            .first()
        )

    # 3. Any other artifact
    if not candidate:
        candidate = Artifact.objects.exclude(id=current_id).first()

    # 4. Fallback if single artifact in database
    if not candidate:
        candidate = current_art

    if candidate.id != current_art.id:
        narrative_bridge = (
            f"Поки історія {current_art.name} вражає своєю долею, "
            f"його побратим {candidate.name} зіткнувся з зовсім іншим невідомим викликом..."
        )
        suggested_hook = f"А ви знали, що побратим {candidate.name} здійснив справжнє наукове диво?"
        pin_comment = f"Чия місія була важливішою для науки: {current_art.name} чи {candidate.name}?"
    else:
        narrative_bridge = (
            f"Повертаючись до загадок {current_art.name}, розберімо наукові деталі, які не увійшли до першого випуску."
        )
        suggested_hook = f"Які ще таємниці приховує {current_art.name} на поверхні?"
        pin_comment = f"Який факт про {current_art.name} здивував вас найбільше?"

    response_data = {
        'suggested_artifact_id': candidate.id,
        'suggested_artifact_name': candidate.name,
        'narrative_bridge': narrative_bridge,
        'suggested_hook': suggested_hook,
        'suggested_rubric_id': rubric_id,
        'recommended_pin_comment': pin_comment,
    }

    res_serializer = RecommendNextTopicResponseSerializer(response_data)
    return Response(res_serializer.data)
