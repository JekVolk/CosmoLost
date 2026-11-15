"""
Abstract Repository Interface for Ingest Persistence.
"""
from abc import ABC, abstractmethod
from typing import List, Tuple

from loader.domain.dtos import (
    ArtifactDTO,
    CelestialBodyDTO,
    DiscoveryDTO,
    MediaDTO,
    MissionDTO,
    WaypointDTO,
)


class INASAIngestRepository(ABC):
    """Abstract interface defining all persistence operations for NASA ingestion."""

    @abstractmethod
    def upsert_celestial_body(self, dto: CelestialBodyDTO) -> Tuple[bool, bool]:
        """Upsert celestial body. Returns (is_created, is_updated)."""
        pass

    @abstractmethod
    def upsert_mission(self, dto: MissionDTO) -> Tuple[bool, bool]:
        """Upsert mission. Returns (is_created, is_updated)."""
        pass

    @abstractmethod
    def upsert_artifact(self, dto: ArtifactDTO) -> Tuple[bool, bool]:
        """Upsert artifact. Returns (is_created, is_updated)."""
        pass

    @abstractmethod
    def upsert_waypoints(self, artifact_id: str, waypoints: List[WaypointDTO]) -> int:
        """Upsert waypoints list. Returns count of inserted/updated waypoints."""
        pass

    @abstractmethod
    def upsert_discoveries(self, artifact_id: str, discoveries: List[DiscoveryDTO]) -> int:
        """Upsert discoveries list. Returns count of inserted discoveries."""
        pass

    @abstractmethod
    def upsert_media(self, artifact_id: str, media_list: List[MediaDTO]) -> int:
        """Upsert media items. Returns count of inserted media items."""
        pass
