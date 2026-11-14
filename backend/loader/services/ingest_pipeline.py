"""
Orchestration Pipeline for NASA Ingestion.
Coordinates Services -> DTOs -> StateStore -> Repository with optional concurrency.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import asdict
from datetime import datetime
import logging
from typing import List, Optional

from django.db import connection

from loader.domain.dtos import ArtifactDTO, SyncStatsDTO
from loader.infrastructure.nasa_client import NASAClient
from loader.infrastructure.state_store import SyncStateStore
from loader.repositories.base import INASAIngestRepository
from loader.services.archive_media_service import ArchiveMediaIngestService
from loader.services.artifacts_service import ArtifactsIngestService
from loader.services.celestial_bodies_service import CelestialBodiesIngestService
from loader.services.discoveries_service import DiscoveriesIngestService
from loader.services.missions_service import MissionsIngestService
from loader.services.rover_photos_service import RoverPhotosIngestService
from loader.services.traverse_waypoints_service import TraverseWaypointsIngestService

logger = logging.getLogger('loader.pipeline')


class NASAIngestPipeline:
    """
    Full-cycle ingestion pipeline orchestrating dedicated resource services.
    """

    def __init__(
        self,
        client: NASAClient,
        repository: INASAIngestRepository,
        state_store: SyncStateStore,
        max_workers: int = 4,
    ):
        self.client = client
        self.repository = repository
        self.state_store = state_store
        self.max_workers = max_workers

        # Instantiate modular sub-services
        self.celestial_bodies_service = CelestialBodiesIngestService(repository, state_store)
        self.missions_service = MissionsIngestService(repository, state_store)
        self.artifacts_service = ArtifactsIngestService(repository, state_store)
        self.rover_photos_service = RoverPhotosIngestService(client, repository)
        self.archive_media_service = ArchiveMediaIngestService(client, repository)
        self.waypoints_service = TraverseWaypointsIngestService(client, repository)
        self.discoveries_service = DiscoveriesIngestService(repository)

    def run_sync(
        self,
        target_body: Optional[str] = None,
        force: bool = False,
        dry_run: bool = False,
        parallel: bool = True,
    ) -> SyncStatsDTO:
        """
        Run the complete ingestion pipeline.
        """
        stats = SyncStatsDTO(start_time=datetime.now())
        logger.info(
            f"Starting NASA Ingest Cycle (target={target_body or 'all'}, force={force}, dry_run={dry_run}, parallel={parallel})..."
        )

        try:
            # 1. Sync Celestial Bodies
            self.celestial_bodies_service.sync(
                stats=stats,
                target_body=target_body,
                force=force,
                dry_run=dry_run,
            )

            # 2. Sync Missions
            self.missions_service.sync(
                stats=stats,
                force=force,
                dry_run=dry_run,
            )

            # 3. Sync Artifacts
            artifacts = self.artifacts_service.sync(
                stats=stats,
                target_body=target_body,
                force=force,
                dry_run=dry_run,
            )

            # 4. Enrich Artifacts (discoveries, waypoints, media, photos)
            self._enrich_artifacts(
                artifacts=artifacts,
                stats=stats,
                parallel=parallel,
                dry_run=dry_run,
            )

            stats.is_success = len(stats.errors_encountered) == 0
        except Exception as e:
            stats.is_success = False
            stats.errors_encountered.append(str(e))
            logger.error(f"Fatal error during ingest cycle: {e}", exc_info=True)
        finally:
            stats.end_time = datetime.now()
            stats.calculate_duration()
            stats.tokens_rotated = self.client.token_pool.rotation_count

            # Persist latest run stats in state store for admin and health check visibility
            try:
                self.state_store.save_last_run_stats(asdict(stats))
            except Exception as e:
                logger.warning(f"Could not persist run stats to state store: {e}")

        self._print_sync_report(stats)
        return stats

    def _enrich_artifacts(
        self,
        artifacts: List[ArtifactDTO],
        stats: SyncStatsDTO,
        parallel: bool,
        dry_run: bool,
    ) -> None:
        """Enrich artifacts with discoveries, media, and waypoints."""
        def enrich_single(artifact_id: str) -> None:
            # 1. Discoveries
            self.discoveries_service.sync_discoveries(artifact_id, stats, dry_run=dry_run)
            # 2. Waypoints
            self.waypoints_service.sync_waypoints(artifact_id, stats, dry_run=dry_run)
            # 3. Archive Media (NASA Image & Video Library)
            self.archive_media_service.sync_artifact_media(artifact_id, stats, dry_run=dry_run)
            # 4. Rover Photos API
            self.rover_photos_service.sync_rover_photos(artifact_id, stats, dry_run=dry_run)

        artifact_ids = [a.id for a in artifacts]
        is_sqlite = getattr(connection, 'vendor', '') == 'sqlite'
        effective_parallel = parallel and not is_sqlite

        if effective_parallel and len(artifact_ids) > 1:
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                futures = {executor.submit(enrich_single, art_id): art_id for art_id in artifact_ids}
                for future in as_completed(futures):
                    art_id = futures[future]
                    try:
                        future.result()
                    except Exception as e:
                        logger.error(f"Error enriching artifact {art_id}: {e}")
                        stats.errors_encountered.append(f"Artifact {art_id} enrichment: {e}")
        else:
            for art_id in artifact_ids:
                enrich_single(art_id)

    def _print_sync_report(self, stats: SyncStatsDTO) -> None:
        banner = f"""
======================================================================
🚀 [COSMOLOST NASA INGEST] SYNC REPORT [{stats.end_time.strftime('%Y-%m-%d %H:%M:%S') if stats.end_time else 'N/A'}]
======================================================================
Status:               {'SUCCESS ✅' if stats.is_success else 'COMPLETED WITH ERRORS ⚠️'}
Duration:             {stats.duration_seconds} sec
API Calls Made:       {stats.api_calls_made}
API Tokens Rotated:   {stats.tokens_rotated}
----------------------------------------------------------------------
Celestial Bodies:     Checked {stats.celestial_bodies_checked} | New: {stats.celestial_bodies_new}
Missions:             Checked {stats.missions_checked} | New: {stats.missions_new} | Updated: {stats.missions_updated}
Artifacts:            Checked {stats.artifacts_checked} | New: {stats.artifacts_new} | Updated: {stats.artifacts_updated}
Waypoints Inserted:   {stats.waypoints_inserted}
Discoveries Inserted: {stats.discoveries_inserted}
Media Items Inserted: {stats.media_inserted}
Errors Encountered:   {len(stats.errors_encountered)}
======================================================================
"""
        logger.info(banner)
        print(banner)
