"""
Django ORM implementation of INASAIngestRepository.
Interacts strictly with the models from core/models.py: ZERO extra tables!
"""
import logging
import threading
from typing import List, Tuple
from django.db import transaction

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
    WaypointDTO,
)
from loader.domain.exceptions import IngestRepositoryError
from loader.repositories.base import INASAIngestRepository

logger = logging.getLogger('loader.repository')


class DjangoNASAIngestRepository(INASAIngestRepository):
    """
    Persists DTOs into Django database with transactional integrity and idempotency.
    Thread-safe write lock ensures SQLite compatibility under concurrent ThreadPool workers.
    """

    def __init__(self) -> None:
        self._db_lock = threading.Lock()

    def upsert_celestial_body(self, dto: CelestialBodyDTO) -> Tuple[bool, bool]:
        with self._db_lock:
            try:
                obj, created = CelestialBody.objects.update_or_create(
                    id=dto.id,
                    defaults={
                        'name': dto.name,
                        'radius_km': dto.radius_km,
                        'gravity_ms2': dto.gravity_ms2,
                        'coordinate_system_type': dto.coordinate_system_type,
                        'wmts_tile_url': dto.wmts_tile_url,
                    },
                )
                return created, not created
            except Exception as e:
                logger.error(f"Error upserting CelestialBody {dto.id}: {e}")
                raise IngestRepositoryError(f"CelestialBody {dto.id} failed: {e}") from e

    def upsert_mission(self, dto: MissionDTO) -> Tuple[bool, bool]:
        with self._db_lock:
            try:
                defaults = {
                    'name': dto.name,
                    'agency': dto.agency,
                    'summary': dto.summary,
                }
                if dto.nssdca_id:
                    defaults['nssdca_id'] = dto.nssdca_id
                if dto.launch_date:
                    defaults['launch_date'] = dto.launch_date
                if dto.landing_date:
                    defaults['landing_date'] = dto.landing_date
                if dto.end_date:
                    defaults['end_date'] = dto.end_date

                obj, created = Mission.objects.update_or_create(
                    id=dto.id,
                    defaults=defaults,
                )
                return created, not created
            except Exception as e:
                logger.error(f"Error upserting Mission {dto.id}: {e}")
                raise IngestRepositoryError(f"Mission {dto.id} failed: {e}") from e

    def upsert_artifact(self, dto: ArtifactDTO) -> Tuple[bool, bool]:
        with self._db_lock:
            try:
                lon = dto.longitude
                if lon > 180.0:
                    lon = lon - 360.0

                defaults = {
                    'name': dto.name,
                    'mission_id': dto.mission_id,
                    'celestial_body_id': dto.celestial_body_id,
                    'artifact_type': dto.artifact_type,
                    'operational_status': dto.operational_status,
                    'latitude': dto.latitude,
                    'longitude': lon,
                    'elevation_m': dto.elevation_m,
                    'location_name': dto.location_name,
                    'mass_kg': dto.mass_kg,
                    'last_contact_sol': dto.last_contact_sol,
                    'cause_of_deactivation': dto.cause_of_deactivation,
                    'is_featured': dto.is_featured,
                    'is_nasa_hardware': dto.is_nasa_hardware,
                    'first_person_monologue': dto.first_person_monologue,
                    'model_3d_url': dto.model_3d_url,
                }

                obj, created = Artifact.objects.update_or_create(
                    id=dto.id,
                    defaults=defaults,
                )
                return created, not created
            except Exception as e:
                logger.error(f"Error upserting Artifact {dto.id}: {e}")
                raise IngestRepositoryError(f"Artifact {dto.id} failed: {e}") from e

    def upsert_waypoints(self, artifact_id: str, waypoints: List[WaypointDTO]) -> int:
        if not waypoints:
            return 0
        with self._db_lock:
            try:
                with transaction.atomic():
                    saved_count = 0
                    for wp in waypoints:
                        lon = wp.longitude - 360.0 if wp.longitude > 180.0 else wp.longitude
                        TraverseWaypoint.objects.update_or_create(
                            artifact_id=artifact_id,
                            sol_or_step=wp.sol_or_step,
                            defaults={
                                'latitude': wp.latitude,
                                'longitude': lon,
                                'elevation_m': wp.elevation_m,
                                'odometry_m': wp.odometry_m,
                                'telemetry_snapshot': wp.telemetry_snapshot,
                                'story_snippet': wp.story_snippet,
                            },
                        )
                        saved_count += 1
                    return saved_count
            except Exception as e:
                logger.error(f"Error saving waypoints for {artifact_id}: {e}")
                raise IngestRepositoryError(f"Waypoints for {artifact_id} failed: {e}") from e

    def upsert_discoveries(self, artifact_id: str, discoveries: List[DiscoveryDTO]) -> int:
        if not discoveries:
            return 0
        with self._db_lock:
            try:
                with transaction.atomic():
                    saved = 0
                    for d in discoveries:
                        ScientificDiscovery.objects.update_or_create(
                            artifact_id=artifact_id,
                            title=d.title,
                            defaults={
                                'instrument_acronym': d.instrument_acronym,
                                'instrument_full_name': d.instrument_full_name,
                                'kid_friendly_story': d.kid_friendly_story,
                                'scientific_fact': d.scientific_fact,
                            },
                        )
                        saved += 1
                    return saved
            except Exception as e:
                logger.error(f"Error saving discoveries for {artifact_id}: {e}")
                raise IngestRepositoryError(f"Discoveries for {artifact_id} failed: {e}") from e

    def upsert_media(self, artifact_id: str, media_list: List[MediaDTO]) -> int:
        if not media_list:
            return 0
        with self._db_lock:
            try:
                with transaction.atomic():
                    saved = 0
                    for m in media_list:
                        lookup = {'artifact_id': artifact_id}
                        if m.nasa_id_or_pia:
                            lookup['nasa_id_or_pia'] = m.nasa_id_or_pia
                        else:
                            lookup['media_url'] = m.media_url

                        ArtifactMedia.objects.update_or_create(
                            **lookup,
                            defaults={
                                'media_category': m.media_category,
                                'media_url': m.media_url,
                                'caption': m.caption,
                                'credit': m.credit,
                            },
                        )
                        saved += 1
                    return saved
            except Exception as e:
                logger.error(f"Error saving media for {artifact_id}: {e}")
                raise IngestRepositoryError(f"Media for {artifact_id} failed: {e}") from e
