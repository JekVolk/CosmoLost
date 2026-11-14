"""
Mappers transforming raw NASA API JSON structures into domain DTOs.
"""
from datetime import date, datetime
import math
from typing import Any, Dict, Optional
from urllib.parse import urlparse

from loader.domain.dtos import (
    ArtifactDTO,
    CelestialBodyDTO,
    MediaDTO,
    MissionDTO,
    WaypointDTO,
)
from loader.domain.exceptions import IngestValidationError


class NASAJsonMapper:
    """Utility class for normalizing NASA API responses into typed DTOs."""

    @staticmethod
    def sanitize_url(url: Optional[str]) -> str:
        """Ensures URL strictly uses http/https to prevent SSRF and protocol injection."""
        if not url:
            return ""
        stripped = url.strip()
        parsed = urlparse(stripped)
        if parsed.scheme in ('http', 'https'):
            return stripped
        return ""

    @staticmethod
    def normalize_longitude(lon: float) -> float:
        """
        Normalizes longitude into standard -180.0 .. 180.0 range.
        NASA Mars Treks frequently uses 0..360 planetocentric coordinates.
        """
        if math.isnan(lon) or math.isinf(lon):
            raise IngestValidationError(f"Invalid longitude value: {lon}")
        # Reduce modulo 360 if out of range
        lon = (lon + 180.0) % 360.0 - 180.0
        return round(lon, 6)

    @staticmethod
    def validate_latitude(lat: float) -> float:
        """Ensures latitude is a valid finite float between -90.0 and 90.0."""
        if math.isnan(lat) or math.isinf(lat) or not (-90.0 <= lat <= 90.0):
            raise IngestValidationError(f"Latitude {lat} out of valid bounds [-90.0, 90.0]")
        return round(lat, 6)

    @staticmethod
    def parse_date(date_str: Optional[str]) -> Optional[date]:
        """Safely parses ISO date string 'YYYY-MM-DD'."""
        if not date_str:
            return None
        try:
            return datetime.strptime(date_str, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            return None

    @classmethod
    def raw_to_celestial_body_dto(cls, raw: Dict[str, Any]) -> CelestialBodyDTO:
        required = ['id', 'name', 'radius_km', 'gravity_ms2', 'coordinate_system_type', 'wmts_tile_url']
        for field_name in required:
            if field_name not in raw:
                raise IngestValidationError(f"Missing required field '{field_name}' for CelestialBody")

        return CelestialBodyDTO(
            id=str(raw['id']).strip().lower()[:50],
            name=str(raw['name']).strip()[:100],
            radius_km=float(raw['radius_km']),
            gravity_ms2=float(raw['gravity_ms2']),
            coordinate_system_type=str(raw['coordinate_system_type']).strip()[:50],
            wmts_tile_url=cls.sanitize_url(raw.get('wmts_tile_url'))[:500],
        )

    @classmethod
    def raw_to_mission_dto(cls, raw: Dict[str, Any]) -> MissionDTO:
        if 'id' not in raw or 'name' not in raw:
            raise IngestValidationError("Mission requires 'id' and 'name'.")

        nssdca = raw.get('nssdca_id')
        return MissionDTO(
            id=str(raw['id']).strip().lower()[:100],
            name=str(raw['name']).strip()[:200],
            agency=str(raw.get('agency', 'NASA')).strip()[:100],
            nssdca_id=str(nssdca).strip()[:50] if nssdca else None,
            launch_date=cls.parse_date(raw.get('launch_date')),
            landing_date=cls.parse_date(raw.get('landing_date')),
            end_date=cls.parse_date(raw.get('end_date')),
            summary=str(raw.get('summary', '')).strip(),
        )

    @classmethod
    def raw_to_artifact_dto(cls, raw: Dict[str, Any]) -> ArtifactDTO:
        if 'id' not in raw or 'celestial_body_id' not in raw or 'name' not in raw:
            raise IngestValidationError("Artifact requires 'id', 'celestial_body_id', and 'name'.")

        if 'latitude' not in raw or 'longitude' not in raw:
            raise IngestValidationError(f"Artifact {raw.get('id')} requires 'latitude' and 'longitude'.")

        lat = cls.validate_latitude(float(raw['latitude']))
        lon = cls.normalize_longitude(float(raw['longitude']))

        mass = float(raw['mass_kg']) if raw.get('mass_kg') is not None else None
        if mass is not None and (mass < 0 or math.isnan(mass) or math.isinf(mass)):
            mass = None

        return ArtifactDTO(
            id=str(raw['id']).strip().lower()[:100],
            mission_id=str(raw['mission_id']).strip()[:100] if raw.get('mission_id') else None,
            celestial_body_id=str(raw['celestial_body_id']).strip().lower()[:50],
            name=str(raw['name']).strip()[:200],
            artifact_type=str(raw.get('artifact_type', 'ROVER')).strip().upper()[:50],
            operational_status=str(raw.get('operational_status', 'DORMANT')).strip().upper()[:50],
            latitude=lat,
            longitude=lon,
            elevation_m=float(raw['elevation_m']) if raw.get('elevation_m') is not None else None,
            location_name=str(raw.get('location_name', '')).strip()[:200],
            mass_kg=mass,
            last_contact_sol=int(raw['last_contact_sol']) if raw.get('last_contact_sol') is not None else None,
            cause_of_deactivation=str(raw.get('cause_of_deactivation', '')).strip(),
            is_featured=bool(raw.get('is_featured', False)),
            is_nasa_hardware=bool(raw.get('is_nasa_hardware', True)),
            first_person_monologue=str(raw.get('first_person_monologue', '')).strip(),
            model_3d_url=cls.sanitize_url(raw.get('model_3d_url'))[:500],
        )

    @classmethod
    def rover_photo_to_media_dto(cls, photo: Dict[str, Any], artifact_id: str) -> MediaDTO:
        """
        Maps a NASA Mars Rover API photo JSON object into MediaDTO.
        """
        camera = photo.get('camera', {}).get('name', 'PANCAM')
        sol = photo.get('sol', 0)
        img_src = cls.sanitize_url(photo.get('img_src', '').replace('http://', 'https://'))
        photo_id = str(photo.get('id', ''))

        return MediaDTO(
            artifact_id=artifact_id[:100],
            media_category="SURFACE_PHOTO",
            media_url=img_src[:500],
            nasa_id_or_pia=f"MARS-PHOTO-{photo_id}"[:100] if photo_id else "",
            caption=f"Captured by {camera} on Sol {sol}."[:500],
            credit="NASA/JPL-Caltech"[:255],
        )

    @classmethod
    def archive_item_to_media_dto(
        cls,
        item: Dict[str, Any],
        artifact_id: str,
        media_category: str = "SURFACE_PHOTO",
    ) -> MediaDTO:
        """
        Maps a NASA Image and Video Library result into MediaDTO with truncation safety.
        """
        nasa_id = str(item.get('nasa_id', '')).strip()[:100]
        title = str(item.get('title', '')).strip()[:500]
        href = cls.sanitize_url(item.get('href', ''))[:500]
        credit = str(item.get('photographer') or 'NASA/JPL').strip()[:255]

        return MediaDTO(
            artifact_id=artifact_id[:100],
            media_category=media_category[:50],
            media_url=href,
            nasa_id_or_pia=nasa_id,
            caption=title,
            credit=credit,
        )

    @classmethod
    def mmgis_feature_to_waypoint_dto(
        cls,
        feature: Dict[str, Any],
        artifact_id: str,
        sol_or_step: int,
    ) -> WaypointDTO:
        """
        Maps a GeoJSON Feature from MMGIS layers into WaypointDTO safely.
        """
        geom = feature.get('geometry') or {}
        props = feature.get('properties') or {}
        coords = geom.get('coordinates', [0.0, 0.0])

        if not isinstance(coords, (list, tuple)) or len(coords) < 2:
            coords = [0.0, 0.0]

        try:
            raw_lon = float(coords[0])
            raw_lat = float(coords[1])
            lon = cls.normalize_longitude(raw_lon)
            lat = cls.validate_latitude(raw_lat)
        except (ValueError, TypeError, IngestValidationError):
            lon, lat = 0.0, 0.0

        elevation = None
        if len(coords) > 2:
            try:
                elevation = float(coords[2])
            except (ValueError, TypeError):
                pass
        elif props.get('elev') is not None:
            try:
                elevation = float(props['elev'])
            except (ValueError, TypeError):
                pass

        try:
            sol = int(props.get('sol', sol_or_step))
        except (ValueError, TypeError):
            sol = sol_or_step

        odometry = None
        if 'dist_m' in props:
            try:
                odometry = float(props['dist_m'])
            except (ValueError, TypeError):
                pass

        story = str(props.get('story') or props.get('desc') or '').strip()

        telemetry: Dict[str, Any] = {}
        for key in ('power_wh', 'dust_tau', 'temp_c', 'pitch_deg', 'roll_deg'):
            if key in props:
                telemetry[key] = props[key]

        return WaypointDTO(
            artifact_id=artifact_id[:100],
            sol_or_step=sol,
            latitude=lat,
            longitude=lon,
            elevation_m=elevation,
            odometry_m=odometry,
            telemetry_snapshot=telemetry,
            story_snippet=story,
        )
