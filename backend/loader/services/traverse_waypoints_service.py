"""
Service responsible for fetching, downsampling, and persisting traverse waypoints from NASA MMGIS / GeoJSON.
"""
import logging
from typing import Dict, List, Optional

from loader.constants import (
    M20_WAYPOINTS_URL,
    MSL_WAYPOINTS_URL,
)
from loader.domain.dtos import SyncStatsDTO, WaypointDTO
from loader.domain.mappers import NASAJsonMapper
from loader.infrastructure.nasa_client import NASAClient
from loader.repositories.base import INASAIngestRepository
from loader.waypoints_catalog import ALL_SEED_WAYPOINTS

logger = logging.getLogger('loader.services.traverse_waypoints')

CURATED_SEED_WAYPOINTS: Dict[str, List[WaypointDTO]] = ALL_SEED_WAYPOINTS


class TraverseWaypointsIngestService:
    """Service to ingest and downsample traverse waypoints."""

    def __init__(self, client: NASAClient, repository: INASAIngestRepository):
        self.client = client
        self.repository = repository

    def sync_waypoints(
        self,
        artifact_id: str,
        stats: SyncStatsDTO,
        max_points: int = 50,
        dry_run: bool = False,
    ) -> List[WaypointDTO]:
        # 1. First check curated seed waypoints
        seeds = CURATED_SEED_WAYPOINTS.get(artifact_id)
        if seeds:
            if not dry_run:
                count = self.repository.upsert_waypoints(artifact_id, seeds)
                stats.waypoints_inserted += count
            return seeds

        # 2. Check MMGIS live GeoJSON endpoint for active rovers
        url: Optional[str] = None
        if 'perseverance' in artifact_id or 'm20' in artifact_id:
            url = M20_WAYPOINTS_URL
        elif 'curiosity' in artifact_id or 'msl' in artifact_id:
            url = MSL_WAYPOINTS_URL

        if not url:
            return []

        try:
            stats.api_calls_made += 1
            geojson = self.client.fetch_mmgis_layer(url)
            features = geojson.get('features', [])
            if not features:
                return []

            # Downsample features: step through evenly to get up to max_points
            step = max(1, len(features) // max_points)
            downsampled = features[::step][:max_points]

            waypoints: List[WaypointDTO] = []
            for idx, feat in enumerate(downsampled, start=1):
                wp = NASAJsonMapper.mmgis_feature_to_waypoint_dto(
                    feature=feat,
                    artifact_id=artifact_id,
                    sol_or_step=idx,
                )
                waypoints.append(wp)

            if waypoints and not dry_run:
                count = self.repository.upsert_waypoints(artifact_id, waypoints)
                stats.waypoints_inserted += count

            return waypoints
        except Exception as e:
            logger.warning(f"Error fetching MMGIS waypoints for {artifact_id}: {e}")
            stats.errors_encountered.append(f"MMGIS Waypoints ({artifact_id}): {e}")
            return []
