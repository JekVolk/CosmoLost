import math
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from core.models import (
    Artifact,
    ArtifactMedia,
    CelestialBody,
    CommunityPublication,
    Mission,
    ScientificDiscovery,
    TraverseWaypoint,
)
from .serializers import (
    ArtifactDetailSerializer,
    ArtifactMediaSerializer,
    ArtifactSummarySerializer,
    CelestialBodySerializer,
    CommunityPublicationSerializer,
    MissionSerializer,
    ScientificDiscoverySerializer,
    TraverseWaypointSerializer,
)


def compute_artifact_clusters(artifacts, cluster_distance_m=500.0):
    """
    Cluster artifacts within cluster_distance_m on the same celestial body
    using haversine great-circle distance.
    """
    cluster_info_map = {}
    if not artifacts:
        return cluster_info_map

    by_body = {}
    for art in artifacts:
        by_body.setdefault(art.celestial_body_id, []).append(art)

    for _body_id, body_artifacts in by_body.items():
        n = len(body_artifacts)
        if n <= 1:
            if n == 1:
                cluster_info_map[body_artifacts[0].id] = {
                    'is_clustered': False,
                    'cluster_id': None,
                    'cluster_count': 1,
                }
            continue

        first_art = body_artifacts[0]
        radius_km = (
            first_art.celestial_body.radius_km
            if first_art.celestial_body and first_art.celestial_body.radius_km
            else 3396.2
        )
        radius_m = radius_km * 1000.0

        adj = {art.id: [] for art in body_artifacts}
        for i in range(n):
            art1 = body_artifacts[i]
            lat1 = math.radians(art1.latitude)
            lon1 = math.radians(art1.longitude)
            for j in range(i + 1, n):
                art2 = body_artifacts[j]
                lat2 = math.radians(art2.latitude)
                lon2 = math.radians(art2.longitude)

                dlat = lat2 - lat1
                dlon = lon2 - lon1
                a = math.sin(dlat / 2.0) ** 2 + math.cos(lat1) * math.cos(lat2) * (math.sin(dlon / 2.0) ** 2)
                a = min(1.0, max(0.0, a))
                c = 2.0 * math.asin(math.sqrt(a))
                dist = radius_m * c

                if dist <= cluster_distance_m:
                    adj[art1.id].append(art2.id)
                    adj[art2.id].append(art1.id)

        visited = set()
        for art in body_artifacts:
            if art.id in visited:
                continue
            component = []
            queue = [art.id]
            visited.add(art.id)
            while queue:
                curr = queue.pop(0)
                component.append(curr)
                for neighbor in adj[curr]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)

            if len(component) > 1:
                component.sort()
                cluster_id = f"cluster-{component[0]}"
                for cid in component:
                    cluster_info_map[cid] = {
                        'is_clustered': True,
                        'cluster_id': cluster_id,
                        'cluster_count': len(component),
                    }
            else:
                cluster_info_map[art.id] = {
                    'is_clustered': False,
                    'cluster_id': None,
                    'cluster_count': 1,
                }

    return cluster_info_map


@api_view(['GET'])
@permission_classes([AllowAny])
def celestial_bodies_list(request):
    """GET /api/v1/portal/celestial-bodies/"""
    bodies = CelestialBody.objects.all().order_by('name')
    serializer = CelestialBodySerializer(bodies, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def celestial_body_detail(request, pk):
    """GET /api/v1/portal/celestial-bodies/<pk>/"""
    body = get_object_or_404(CelestialBody, pk=pk)
    serializer = CelestialBodySerializer(body)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def artifacts_list(request):
    """
    GET /api/v1/portal/artifacts/
    Filters via Query Params:
    ?body=mars&type=ROVER&status=DORMANT&is_featured=true&is_nasa_hardware=true&search=opportunity&cluster_distance_m=500
    """
    qs = (
        Artifact.objects.select_related('mission', 'celestial_body')
        .prefetch_related('media')
        .all()
    )

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
            Q(name__icontains=search)
            | Q(location_name__icontains=search)
            | Q(cause_of_deactivation__icontains=search)
        )

    try:
        limit = int(request.query_params.get('limit', 250))
    except (TypeError, ValueError):
        limit = 250

    try:
        offset = int(request.query_params.get('offset', 0))
    except (TypeError, ValueError):
        offset = 0

    try:
        cluster_distance_m = float(request.query_params.get('cluster_distance_m', 500.0))
    except (TypeError, ValueError):
        cluster_distance_m = 500.0

    limit = max(1, limit)
    offset = max(0, offset)

    total = qs.count()
    results = list(qs[offset : offset + limit])

    cluster_map = compute_artifact_clusters(results, cluster_distance_m)

    serializer = ArtifactSummarySerializer(
        results,
        many=True,
        context={'request': request, 'cluster_map': cluster_map},
    )
    return Response({
        'total': total,
        'limit': limit,
        'offset': offset,
        'results': serializer.data,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def artifact_detail(request, pk):
    """GET /api/v1/portal/artifacts/<pk>/"""
    artifact = get_object_or_404(
        Artifact.objects.select_related('mission', 'celestial_body').prefetch_related(
            'media', 'discoveries'
        ),
        pk=pk,
    )
    serializer = ArtifactDetailSerializer(artifact, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def artifact_waypoints(request, pk):
    """GET /api/v1/portal/artifacts/<pk>/waypoints/"""
    get_object_or_404(Artifact, pk=pk)
    waypoints = TraverseWaypoint.objects.filter(artifact_id=pk).order_by('sol_or_step')
    serializer = TraverseWaypointSerializer(waypoints, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def artifact_discoveries(request, pk):
    """GET /api/v1/portal/artifacts/<pk>/discoveries/"""
    get_object_or_404(Artifact, pk=pk)
    discoveries = ScientificDiscovery.objects.filter(artifact_id=pk).order_by('id')
    serializer = ScientificDiscoverySerializer(discoveries, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def artifact_media(request, pk):
    """GET /api/v1/portal/artifacts/<pk>/media/"""
    get_object_or_404(Artifact, pk=pk)
    media = ArtifactMedia.objects.filter(artifact_id=pk).order_by('id')
    serializer = ArtifactMediaSerializer(media, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def missions_list(request):
    """GET /api/v1/portal/missions/"""
    qs = (
        Mission.objects.prefetch_related(
            'artifacts',
            'artifacts__celestial_body',
            'artifacts__media',
        )
        .all()
        .order_by('name')
    )

    agency = request.query_params.get('agency')
    if agency:
        qs = qs.filter(agency__iexact=agency)

    try:
        limit = int(request.query_params.get('limit', 250))
    except (TypeError, ValueError):
        limit = 250

    try:
        offset = int(request.query_params.get('offset', 0))
    except (TypeError, ValueError):
        offset = 0

    limit = max(1, limit)
    offset = max(0, offset)

    total = qs.count()
    results = qs[offset : offset + limit]

    serializer = MissionSerializer(results, many=True, context={'request': request})
    return Response({
        'total': total,
        'limit': limit,
        'offset': offset,
        'results': serializer.data,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def mission_detail(request, pk):
    """GET /api/v1/portal/missions/<pk>/"""
    mission = get_object_or_404(
        Mission.objects.prefetch_related(
            'artifacts',
            'artifacts__celestial_body',
            'artifacts__media',
        ),
        pk=pk,
    )
    serializer = MissionSerializer(mission, context={'request': request})
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def community_publications_view(request):
    """
    GET: List approved community video publications.
    POST: Submit a new community publication for moderation (is_approved=False).
    """
    if request.method == 'GET':
        qs = CommunityPublication.objects.filter(is_approved=True).select_related(
            'mission', 'artifact'
        )

        mission_id = request.query_params.get('mission_id')
        if mission_id:
            qs = qs.filter(mission_id=mission_id)

        artifact_id = request.query_params.get('artifact_id')
        if artifact_id:
            qs = qs.filter(artifact_id=artifact_id)

        platform_type = request.query_params.get('platform_type')
        if platform_type:
            qs = qs.filter(platform_type=platform_type)

        try:
            limit = int(request.query_params.get('limit', 20))
        except (TypeError, ValueError):
            limit = 20

        try:
            offset = int(request.query_params.get('offset', 0))
        except (TypeError, ValueError):
            offset = 0

        limit = max(1, limit)
        offset = max(0, offset)

        total = qs.count()
        results = qs[offset : offset + limit]

        serializer = CommunityPublicationSerializer(results, many=True)
        return Response({
            'total': total,
            'limit': limit,
            'offset': offset,
            'results': serializer.data,
        })

    elif request.method == 'POST':
        serializer = CommunityPublicationSerializer(data=request.data)
        if serializer.is_valid():
            publication = serializer.save(is_approved=False)
            return Response(
                {
                    'id': str(publication.id),
                    'status': 'SUBMITTED_FOR_REVIEW',
                    'is_approved': False,
                    'message': "Публікацію відправлено на модерацію. Вона з'явиться на порталі після схвалення.",
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
