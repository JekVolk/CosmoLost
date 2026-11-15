import math
from rest_framework import serializers
from core.models import (
    CelestialBody,
    Mission,
    Artifact,
    TraverseWaypoint,
    ScientificDiscovery,
    ArtifactMedia,
    CommunityPublication,
    CoordinateSystemType,
    MediaCategory,
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


class MissionSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Mission
        fields = [
            'id',
            'nssdca_id',
            'name',
            'agency',
        ]


class ArtifactSummarySerializer(serializers.ModelSerializer):
    mission_name = serializers.CharField(source='mission.name', read_only=True, default='')
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
        coord_sys = (
            obj.celestial_body.coordinate_system_type
            if obj.celestial_body
            else CoordinateSystemType.PLANETOCENTRIC_360
        )
        return {
            'latitude': obj.latitude,
            'longitude': obj.longitude,
            'elevation_m': obj.elevation_m,
            'coordinate_system': coord_sys,
            'location_name': obj.location_name,
        }

    def get_cluster_info(self, obj):
        cluster_map = self.context.get('cluster_map')
        if cluster_map and obj.id in cluster_map:
            return cluster_map[obj.id]
        return {
            'is_clustered': False,
            'cluster_id': None,
            'cluster_count': 1,
        }

    def get_preview_image_url(self, obj):
        media_list = list(obj.media.all())
        # Category priority: Surface first person / surface photo > panorama > last known photo > any other
        for cat in [
            'SURFACE_FIRST_PERSON',
            MediaCategory.SURFACE_PHOTO,
            MediaCategory.PANORAMA,
            MediaCategory.LAST_KNOWN_PHOTO,
        ]:
            for m in media_list:
                if m.media_category == cat:
                    return m.media_url
        if media_list:
            return media_list[0].media_url
        return 'https://images-assets.nasa.gov/image/PIA22521/PIA22521~thumb.jpg'

    def get_cosmolost_url(self, obj):
        return f'https://cosmolost.lihtar.org/artifacts/{obj.id}'


class ArtifactDetailSerializer(serializers.ModelSerializer):
    mission = MissionSummarySerializer(read_only=True)
    mission_name = serializers.CharField(source='mission.name', read_only=True, default='')
    celestial_body = serializers.CharField(source='celestial_body_id', read_only=True)
    coordinates = serializers.SerializerMethodField()
    media = ArtifactMediaSerializer(many=True, read_only=True)
    discoveries = ScientificDiscoverySerializer(many=True, read_only=True)

    class Meta:
        model = Artifact
        fields = [
            'id',
            'name',
            'mission',
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
        coord_sys = (
            obj.celestial_body.coordinate_system_type
            if obj.celestial_body
            else CoordinateSystemType.PLANETOCENTRIC_360
        )
        return {
            'latitude': obj.latitude,
            'longitude': obj.longitude,
            'elevation_m': obj.elevation_m,
            'coordinate_system': coord_sys,
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
    mission_id = serializers.PrimaryKeyRelatedField(
        queryset=Mission.objects.all(),
        source='mission',
        required=True,
    )
    artifact_id = serializers.PrimaryKeyRelatedField(
        queryset=Artifact.objects.all(),
        source='artifact',
        required=False,
        allow_null=True,
        default=None,
    )
    mission = serializers.CharField(source='mission_id', read_only=True)
    artifact = serializers.CharField(source='artifact_id', read_only=True, allow_null=True)

    class Meta:
        model = CommunityPublication
        fields = [
            'id',
            'mission_id',
            'artifact_id',
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

    def to_internal_value(self, data):
        if hasattr(data, 'copy'):
            data = data.copy()
        elif isinstance(data, dict):
            data = dict(data)

        if 'mission' in data and 'mission_id' not in data:
            data['mission_id'] = data.get('mission')
        if 'artifact' in data and 'artifact_id' not in data:
            data['artifact_id'] = data.get('artifact')

        return super().to_internal_value(data)
