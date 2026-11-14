"""
Data Transfer Objects (DTO) for NASA Ingestion Pipeline.
Pure Python dataclasses: zero dependencies on Django ORM models.
"""
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class CelestialBodyDTO:
    id: str  # e.g. 'moon', 'mars'
    name: str
    radius_km: float
    gravity_ms2: float
    coordinate_system_type: str  # 'SELENOGRAPHIC' | 'PLANETOCENTRIC_360'
    wmts_tile_url: str


@dataclass(frozen=True)
class MissionDTO:
    id: str  # e.g. 'apollo-11', 'mars-2020'
    name: str
    agency: str
    nssdca_id: Optional[str] = None
    launch_date: Optional[date] = None
    landing_date: Optional[date] = None
    end_date: Optional[date] = None
    summary: str = ""


@dataclass(frozen=True)
class ArtifactDTO:
    id: str  # e.g. 'opportunity-rover'
    mission_id: Optional[str]
    celestial_body_id: str
    name: str
    artifact_type: str  # ROVER, LANDER, INSTRUMENT, RETRO_REFLECTOR, etc.
    operational_status: str  # ACTIVE, DORMANT, DESTROYED, PASSIVE_ACTIVE, etc.
    latitude: float
    longitude: float
    elevation_m: Optional[float] = None
    location_name: str = ""
    mass_kg: Optional[float] = None
    last_contact_sol: Optional[int] = None
    cause_of_deactivation: str = ""
    is_featured: bool = False
    is_nasa_hardware: bool = True
    first_person_monologue: str = ""
    model_3d_url: str = ""


@dataclass(frozen=True)
class WaypointDTO:
    artifact_id: str
    sol_or_step: int
    latitude: float
    longitude: float
    elevation_m: Optional[float] = None
    odometry_m: Optional[float] = None
    telemetry_snapshot: Dict[str, Any] = field(default_factory=dict)
    story_snippet: str = ""
    id: Optional[str] = None


@dataclass(frozen=True)
class DiscoveryDTO:
    artifact_id: str
    title: str
    instrument_acronym: str = ""
    instrument_full_name: str = ""
    kid_friendly_story: str = ""
    scientific_fact: str = ""
    id: Optional[str] = None


@dataclass(frozen=True)
class MediaDTO:
    artifact_id: str
    media_category: str  # SURFACE_PHOTO, LAST_KNOWN_PHOTO, PANORAMA, DESCENT, etc.
    media_url: str
    nasa_id_or_pia: str = ""
    caption: str = ""
    credit: str = "NASA/JPL-Caltech"
    id: Optional[str] = None


@dataclass
class SyncStatsDTO:
    """Summary statistics of a single ingest run."""
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: float = 0.0
    celestial_bodies_checked: int = 0
    celestial_bodies_new: int = 0
    missions_checked: int = 0
    missions_new: int = 0
    missions_updated: int = 0
    artifacts_checked: int = 0
    artifacts_new: int = 0
    artifacts_updated: int = 0
    waypoints_inserted: int = 0
    discoveries_inserted: int = 0
    media_inserted: int = 0
    api_calls_made: int = 0
    tokens_rotated: int = 0
    errors_encountered: List[str] = field(default_factory=list)
    is_success: bool = True

    def calculate_duration(self) -> None:
        if self.end_time and self.start_time:
            self.duration_seconds = round((self.end_time - self.start_time).total_seconds(), 2)
