from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin, StackedInline, TabularInline

from .models import (
    Artifact,
    ArtifactMedia,
    CelestialBody,
    CommunityPublication,
    Mission,
    ScientificDiscovery,
    TraverseWaypoint,
)


class TraverseWaypointInline(TabularInline):
    model = TraverseWaypoint
    extra = 0
    fields = ('sol_or_step', 'latitude', 'longitude', 'elevation_m', 'odometry_m')


class ScientificDiscoveryInline(StackedInline):
    model = ScientificDiscovery
    extra = 0
    fields = ('title', 'instrument_acronym', 'kid_friendly_story', 'scientific_fact')


class ArtifactMediaInline(TabularInline):
    model = ArtifactMedia
    extra = 0
    fields = ('media_category', 'media_url', 'nasa_id_or_pia', 'caption')


@admin.register(CelestialBody)
class CelestialBodyAdmin(ModelAdmin):
    list_display = ('id', 'name', 'radius_km', 'gravity_ms2', 'coordinate_system_type', 'created_at')
    search_fields = ('id', 'name')
    list_filter = ('coordinate_system_type',)
    warn_unsaved_form = True


@admin.register(Mission)
class MissionAdmin(ModelAdmin):
    list_display = ('id', 'name', 'agency', 'nssdca_id', 'launch_date', 'landing_date', 'end_date')
    search_fields = ('id', 'name', 'agency', 'nssdca_id')
    list_filter = ('agency',)
    warn_unsaved_form = True


@admin.register(Artifact)
class ArtifactAdmin(ModelAdmin):
    list_display = (
        'id',
        'name',
        'celestial_body',
        'mission',
        'artifact_type',
        'operational_status',
        'is_featured',
        'is_nasa_hardware',
        'latitude',
        'longitude',
    )
    list_filter = (
        'celestial_body',
        'artifact_type',
        'operational_status',
        'is_featured',
        'is_nasa_hardware',
    )
    search_fields = ('id', 'name', 'location_name')
    list_filter_submit = True
    warn_unsaved_form = True
    inlines = [ArtifactMediaInline, TraverseWaypointInline, ScientificDiscoveryInline]


@admin.register(TraverseWaypoint)
class TraverseWaypointAdmin(ModelAdmin):
    list_display = ('id', 'artifact', 'sol_or_step', 'latitude', 'longitude', 'elevation_m', 'odometry_m')
    list_filter = ('artifact',)
    search_fields = ('artifact__name', 'story_snippet')
    warn_unsaved_form = True


@admin.register(ScientificDiscovery)
class ScientificDiscoveryAdmin(ModelAdmin):
    list_display = ('title', 'artifact', 'instrument_acronym', 'instrument_full_name')
    list_filter = ('artifact', 'instrument_acronym')
    search_fields = ('title', 'scientific_fact', 'kid_friendly_story')
    warn_unsaved_form = True


@admin.register(ArtifactMedia)
class ArtifactMediaAdmin(ModelAdmin):
    list_display = ('id', 'artifact', 'media_category', 'nasa_id_or_pia', 'caption')
    list_filter = ('media_category', 'artifact')
    search_fields = ('nasa_id_or_pia', 'caption', 'credit')
    warn_unsaved_form = True


@admin.register(CommunityPublication)
class CommunityPublicationAdmin(ModelAdmin):
    list_display = ('title', 'platform_type', 'author_name', 'is_approved', 'artifact', 'mission', 'created_at')
    list_filter = ('is_approved', 'platform_type')
    search_fields = ('title', 'author_name', 'source_references')
    warn_unsaved_form = True
    actions = ['approve_publications']

    @admin.action(description=_('Approve selected community publications'))
    def approve_publications(self, request, queryset):
        queryset.update(is_approved=True)
