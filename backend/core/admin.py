from django.contrib import admin, messages
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
    actions = ['sync_selected_bodies']

    @admin.action(description=_('Sync hardware for selected celestial bodies from NASA'))
    def sync_selected_bodies(self, request, queryset):
        from loader.tasks import sync_nasa_catalog_task
        total_new = 0
        total_updated = 0
        for body in queryset:
            task_result = sync_nasa_catalog_task.enqueue(target_body=body.id)
            if task_result.return_value:
                total_new += task_result.return_value.get('artifacts_new', 0)
                total_updated += task_result.return_value.get('artifacts_updated', 0)

        self.message_user(
            request,
            _(f"NASA Ingest completed via django_tasks: {total_new} new, {total_updated} updated artifacts."),
            level=messages.SUCCESS,
        )


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
    actions = ['sync_selected_artifacts', 'force_full_sync']

    @admin.action(description=_('Sync selected artifacts with NASA APIs'))
    def sync_selected_artifacts(self, request, queryset):
        from loader.tasks import sync_nasa_catalog_task
        bodies = set(queryset.values_list('celestial_body_id', flat=True))
        total_arts_new = 0
        total_arts_updated = 0
        for body_id in bodies:
            task_result = sync_nasa_catalog_task.enqueue(target_body=body_id)
            if task_result.return_value:
                total_arts_new += task_result.return_value.get('artifacts_new', 0)
                total_arts_updated += task_result.return_value.get('artifacts_updated', 0)

        self.message_user(
            request,
            _(f"NASA Ingest via django_tasks completed: {total_arts_new} new, {total_arts_updated} updated artifacts."),
            level=messages.SUCCESS,
        )

    @admin.action(description=_('Force full NASA Ingest (All celestial bodies & missions)'))
    def force_full_sync(self, request, queryset):
        from loader.tasks import sync_nasa_catalog_task
        task_result = sync_nasa_catalog_task.enqueue(force=True)
        ret = task_result.return_value or {}
        self.message_user(
            request,
            _(
                f"Full NASA Ingest via django_tasks: {ret.get('artifacts_new', 0)} new, {ret.get('artifacts_updated', 0)} updated. "
                f"Waypoints: {ret.get('waypoints_inserted', 0)}, Media: {ret.get('media_inserted', 0)}."
            ),
            level=messages.SUCCESS,
        )


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
