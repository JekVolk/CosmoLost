"""
Signals for automatic catalog seeding and synchronization on deployment.
"""
import logging
import os
import sys

logger = logging.getLogger('loader.signals')


def auto_seed_catalog_on_migrate(sender, **kwargs):
    """
    Automatically populates or updates the NASA catalog in the database after migrations.
    Guarantees that on production deployment (or fresh DB boot), all curated missions,
    artifacts, waypoints, discoveries, and media are automatically backfilled.
    """
    # Skip during unit tests to preserve test suite isolation
    if 'test' in sys.argv or 'pytest' in sys.modules or os.getenv('PYTEST_CURRENT_TEST'):
        return

    # Check if disabled explicitly via environment variable
    if os.getenv('AUTO_INGEST_ON_MIGRATE', 'True').lower() not in ('true', '1', 'yes'):
        return

    try:
        from core.models import Artifact
        from loader.constants import CURATED_ARTIFACTS
        from loader.tasks import run_nasa_sync

        current_count = Artifact.objects.count()
        expected_min = len(CURATED_ARTIFACTS)

        # If database is fresh (0 artifacts) or has fewer artifacts than our curated code catalog
        if current_count < expected_min:
            logger.info(
                f">>> [AUTO-INGEST] Detected {current_count} artifacts in DB (expected at least {expected_min}). "
                "Running automated catalog backfill on deployment..."
            )
            print(
                f"\n>>> [AUTO-INGEST] Backfilling {expected_min} NASA missions and artifacts into production DB...",
                flush=True,
            )
            # Run sync (non-force to insert missing/changed entities)
            res = run_nasa_sync(force=False, parallel=False)
            logger.info(f">>> [AUTO-INGEST] Completed: {res.get('artifacts_new', 0)} new artifacts added.")
            print(
                f">>> [AUTO-INGEST] Success! Database now populated with {Artifact.objects.count()} artifacts. ✅\n",
                flush=True,
            )
    except Exception as e:
        # Don't fail the migrate command if tables aren't ready yet
        logger.warning(f">>> [AUTO-INGEST] Could not auto-seed on migrate: {e}")
