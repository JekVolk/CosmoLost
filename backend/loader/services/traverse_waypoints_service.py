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

logger = logging.getLogger('loader.services.traverse_waypoints')

# Curated seed waypoints for iconic stationary or completed missions
CURATED_SEED_WAYPOINTS: Dict[str, List[WaypointDTO]] = {
    'apollo-11-descent-stage': [
        WaypointDTO(
            artifact_id='apollo-11-descent-stage',
            sol_or_step=1,
            latitude=0.67408,
            longitude=23.47297,
            elevation_m=-2573.0,
            odometry_m=0.0,
            telemetry_snapshot={'eva_hours': 2.5, 'touchdown_velocity_fps': 1.7},
            story_snippet="Touchdown at Tranquility Base: 'Houston, Tranquility Base here. The Eagle has landed.'",
        ),
        WaypointDTO(
            artifact_id='apollo-11-descent-stage',
            sol_or_step=2,
            latitude=0.67337,
            longitude=23.47309,
            elevation_m=-2573.0,
            odometry_m=60.0,
            telemetry_snapshot={'instrument': 'LRRR', 'mass_kg': 30.0},
            story_snippet="Deployment of the Lunar Laser Ranging Retroreflector and Passive Seismic Experiment.",
        ),
    ],
    'opportunity-rover': [
        WaypointDTO(
            artifact_id='opportunity-rover',
            sol_or_step=1,
            latitude=-1.9462,
            longitude=-5.5266,
            elevation_m=-1440.0,
            odometry_m=0.0,
            telemetry_snapshot={'power_wh': 900, 'dust_tau': 0.6},
            story_snippet="Hole-in-one landing inside Eagle Crater on Meridiani Planum.",
        ),
        WaypointDTO(
            artifact_id='opportunity-rover',
            sol_or_step=5111,
            latitude=-1.9462,
            longitude=-5.5266,
            elevation_m=-1440.0,
            odometry_m=45160.0,
            telemetry_snapshot={'power_wh': 22, 'dust_tau': 10.8},
            story_snippet="Final signal transmitted from Perseverance Valley before global dust storm.",
        ),
    ],
    'spirit-rover': [
        WaypointDTO(
            artifact_id='spirit-rover',
            sol_or_step=1,
            latitude=-14.5684,
            longitude=175.4726,
            elevation_m=-1940.0,
            odometry_m=0.0,
            telemetry_snapshot={'power_wh': 850, 'dust_tau': 0.5},
            story_snippet="Touchdown inside Gusev Crater.",
        ),
        WaypointDTO(
            artifact_id='spirit-rover',
            sol_or_step=2210,
            latitude=-14.5684,
            longitude=175.4726,
            elevation_m=-1940.0,
            odometry_m=7730.0,
            telemetry_snapshot={'power_wh': 89, 'status': 'STUCK_IN_SAND'},
            story_snippet="Final transmission from Troy, west of Home Plate.",
        ),
    ],
    'insight-lander': [
        WaypointDTO(
            artifact_id='insight-lander',
            sol_or_step=1,
            latitude=4.5024,
            longitude=135.6234,
            elevation_m=-2600.0,
            odometry_m=0.0,
            telemetry_snapshot={'power_wh': 4500, 'solar_clean': True},
            story_snippet="Touchdown in Elysium Planitia; SEIS seismometer deployment.",
        ),
        WaypointDTO(
            artifact_id='insight-lander',
            sol_or_step=1445,
            latitude=4.5024,
            longitude=135.6234,
            elevation_m=-2600.0,
            odometry_m=0.0,
            telemetry_snapshot={'power_wh': 285, 'dust_covered': True},
            story_snippet="Final weather report and marsquake recording transmitted to Earth.",
        ),
    ],
    'surveyor-3-lander': [
        WaypointDTO(
            artifact_id='surveyor-3-lander',
            sol_or_step=1,
            latitude=-3.016,
            longitude=-23.418,
            elevation_m=-2430.0,
            odometry_m=0.0,
            telemetry_snapshot={'site': 'Surveyor Crater', 'slope_deg': 12.0},
            story_snippet="Touchdown in Oceanus Procellarum after three gentle bounces on crater wall.",
        ),
        WaypointDTO(
            artifact_id='surveyor-3-lander',
            sol_or_step=2,
            latitude=-3.016,
            longitude=-23.418,
            elevation_m=-2430.0,
            odometry_m=180.0,
            telemetry_snapshot={'visitors': 'Apollo 12 Pete Conrad & Alan Bean', 'eva_step': 'Camera Retrieval'},
            story_snippet="Apollo 12 astronauts visit Surveyor 3, severing the TV camera for return to Earth.",
        ),
    ],
    'apollo-15-lrv': [
        WaypointDTO(
            artifact_id='apollo-15-lrv',
            sol_or_step=1,
            latitude=26.132,
            longitude=3.633,
            elevation_m=-2560.0,
            odometry_m=0.0,
            telemetry_snapshot={'speed_mph': 0.0, 'battery_ah': 121},
            story_snippet="Deployment from LM Falcon descent stage at Hadley plain.",
        ),
        WaypointDTO(
            artifact_id='apollo-15-lrv',
            sol_or_step=2,
            latitude=26.130,
            longitude=3.640,
            elevation_m=-2550.0,
            odometry_m=27900.0,
            telemetry_snapshot={'speed_mph': 7.5, 'station': 'VIP Site overlooking Hadley Rille'},
            story_snippet="Final parking spot 90 meters east of Falcon to televise lunar liftoff.",
        ),
    ],
    'lunokhod-1-rover': [
        WaypointDTO(
            artifact_id='lunokhod-1-rover',
            sol_or_step=1,
            latitude=38.315,
            longitude=-35.008,
            elevation_m=-2450.0,
            odometry_m=0.0,
            telemetry_snapshot={'status': 'Rolled off Luna 17 landing ramps', 'wheels_active': 8},
            story_snippet="First wheels roll onto Mare Imbrium dust.",
        ),
        WaypointDTO(
            artifact_id='lunokhod-1-rover',
            sol_or_step=322,
            latitude=38.315,
            longitude=-35.008,
            elevation_m=-2450.0,
            odometry_m=10540.0,
            telemetry_snapshot={'status': 'Final laser parking alignment', 'retroreflector_facing': 'Earth'},
            story_snippet="Parked in level terrain with French laser reflector oriented toward Earth.",
        ),
    ],
    'curiosity-rover': [
        WaypointDTO(
            artifact_id='curiosity-rover',
            sol_or_step=1,
            latitude=-4.589,
            longitude=137.44,
            elevation_m=-4400.0,
            odometry_m=0.0,
            telemetry_snapshot={'site': 'Bradbury Landing', 'power_source': 'MMRTG'},
            story_snippet="Sky Crane touchdown inside Gale Crater.",
        ),
        WaypointDTO(
            artifact_id='curiosity-rover',
            sol_or_step=4000,
            latitude=-4.589,
            longitude=137.44,
            elevation_m=-3900.0,
            odometry_m=31500.0,
            telemetry_snapshot={'elevation_gained_m': 500, 'region': 'Gediz Vallis Ridge'},
            story_snippet="Climbing high onto the sulfate-bearing ridges of Mount Sharp.",
        ),
    ],
    'zhurong-rover': [
        WaypointDTO(
            artifact_id='zhurong-rover',
            sol_or_step=1,
            latitude=25.066,
            longitude=109.925,
            elevation_m=-4099.0,
            odometry_m=0.0,
            telemetry_snapshot={'site': 'Southern Utopia Planitia', 'solar_status': 'Optimal'},
            story_snippet="Roll-off from Tianwen-1 landing platform.",
        ),
        WaypointDTO(
            artifact_id='zhurong-rover',
            sol_or_step=358,
            latitude=25.066,
            longitude=109.925,
            elevation_m=-4099.0,
            odometry_m=1921.0,
            telemetry_snapshot={'status': 'Entering winter dormancy', 'dust_coverage': 'High'},
            story_snippet="Completed 1,921 meters of traverse before winter hibernation.",
        ),
    ],
}


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
