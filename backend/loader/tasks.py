"""
Background tasks for NASA data synchronization using django_tasks and Celery.
"""
import logging
import os
from typing import Any, Dict, Optional

from django_tasks import task

from loader.infrastructure.nasa_client import NASAClient
from loader.infrastructure.state_store import SyncStateStore
from loader.infrastructure.token_pool import NASATokenPool
from loader.repositories.django_repository import DjangoNASAIngestRepository
from loader.services.ingest_pipeline import NASAIngestPipeline

logger = logging.getLogger('loader.tasks')


def build_pipeline() -> NASAIngestPipeline:
    """Helper to build fully configured NASAIngestPipeline from environment."""
    raw_keys = os.getenv('NASA_API_KEYS', 'DEMO_KEY')
    base_url = os.getenv('NASA_API_BASE_URL', 'https://api.nasa.gov')
    images_url = os.getenv('NASA_IMAGES_API_URL', 'https://images-api.nasa.gov')
    redis_url = os.getenv('REDIS_URL')
    timeout = int(os.getenv('NASA_REQUEST_TIMEOUT', '15'))
    delay = float(os.getenv('NASA_RATE_LIMIT_DELAY', '0.25'))
    mock_fallback = os.getenv('NASA_ENABLE_MOCK_FALLBACK', 'True').lower() == 'true'

    token_pool = NASATokenPool(raw_keys=raw_keys)
    client = NASAClient(
        token_pool=token_pool,
        base_url=base_url,
        images_api_url=images_url,
        timeout=timeout,
        rate_limit_delay=delay,
        enable_mock_fallback=mock_fallback,
    )
    state_store = SyncStateStore(redis_url=redis_url)
    repo = DjangoNASAIngestRepository()
    return NASAIngestPipeline(client=client, repository=repo, state_store=state_store)


def run_nasa_sync(
    target_body: Optional[str] = None,
    force: bool = False,
    dry_run: bool = False,
    parallel: bool = True,
) -> Dict[str, Any]:
    """Execute synchronous ingest cycle and return summary dictionary."""
    pipeline = build_pipeline()
    stats = pipeline.run_sync(target_body=target_body, force=force, dry_run=dry_run, parallel=parallel)
    return {
        'is_success': stats.is_success,
        'duration_seconds': stats.duration_seconds,
        'celestial_bodies_new': stats.celestial_bodies_new,
        'missions_new': stats.missions_new,
        'missions_updated': stats.missions_updated,
        'artifacts_new': stats.artifacts_new,
        'artifacts_updated': stats.artifacts_updated,
        'waypoints_inserted': stats.waypoints_inserted,
        'discoveries_inserted': stats.discoveries_inserted,
        'media_inserted': stats.media_inserted,
        'errors_encountered': stats.errors_encountered,
    }


# Django Tasks (PEP/DEP 0014 Background Task)
@task
def sync_nasa_catalog_task(
    target_body: Optional[str] = None,
    force: bool = False,
    dry_run: bool = False,
) -> Dict[str, Any]:
    """Background task executed via django_tasks."""
    logger.info("Executing sync_nasa_catalog_task via django_tasks...")
    return run_nasa_sync(target_body=target_body, force=force, dry_run=dry_run)


# Celery Compatibility (if celery is configured in environment)
try:
    from celery import shared_task

    @shared_task(name='tasks.sync_nasa_hourly_catalog', bind=True, max_retries=2)
    def sync_nasa_hourly_catalog(self, force: bool = False):
        """Hourly periodic Celery task."""
        logger.info("Starting hourly NASA catalog ingestion via Celery...")
        try:
            return run_nasa_sync(force=force)
        except Exception as exc:
            logger.error(f"Celery Ingest Task Failed: {exc}")
            raise self.retry(exc=exc, countdown=300)

except ImportError:
    pass
