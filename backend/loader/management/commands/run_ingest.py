"""
Django Management Command: run_ingest
Synchronizes NASA hardware catalog with the core models.

Usage:
  python manage.py run_ingest
  python manage.py run_ingest --target mars
  python manage.py run_ingest --force
  python manage.py run_ingest --dry-run
  python manage.py run_ingest --daemon --interval 3600
"""
import logging
import os
import signal
import sys
import time
from typing import Any
from django.core.management.base import BaseCommand

from loader.tasks import build_pipeline

logger = logging.getLogger('loader.command')


class Command(BaseCommand):
    help = 'Synchronizes NASA space artifacts, missions, and telemetry data into CosmoLost core tables.'

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.stop_requested = False

    def _signal_handler(self, signum: int, frame: Any) -> None:
        self.stdout.write(self.style.WARNING("\n>>> [LOADER] Shutdown signal received. Exiting gracefully..."))
        self.stop_requested = True

    def add_arguments(self, parser: Any) -> None:
        parser.add_argument(
            '--target',
            type=str,
            default=None,
            help="Limit sync to a specific celestial body ('moon' or 'mars').",
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Bypass checksum state comparison and force update all records.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Fetch, parse, and validate DTOs without writing to the database.',
        )
        parser.add_argument(
            '--daemon',
            action='store_true',
            help='Run continuously in background with a sleep interval (for ingest-worker).',
        )
        parser.add_argument(
            '--interval',
            type=int,
            default=int(os.getenv('NASA_SYNC_INTERVAL_SEC', '3600')),
            help='Interval in seconds between sync cycles in daemon mode (default: 3600s).',
        )
        parser.add_argument(
            '--no-parallel',
            action='store_true',
            help='Disable parallel background workers and run sequentially.',
        )

    def handle(self, *args: Any, **options: Any) -> None:
        if hasattr(signal, 'SIGINT'):
            signal.signal(signal.SIGINT, self._signal_handler)
        if hasattr(signal, 'SIGTERM'):
            signal.signal(signal.SIGTERM, self._signal_handler)

        target = options['target']
        force = options['force']
        dry_run = options['dry_run']
        is_daemon = options['daemon']
        interval = options['interval']
        parallel = not options['no_parallel']

        self.stdout.write(self.style.SUCCESS(">>> [LOADER] Initializing NASA Ingest Subsystem..."))
        pipeline = build_pipeline()

        if not is_daemon:
            self.stdout.write(f">>> Running single ingest cycle (force={force}, dry_run={dry_run}, parallel={parallel})...")
            stats = pipeline.run_sync(target_body=target, force=force, dry_run=dry_run, parallel=parallel)
            if not stats.is_success:
                sys.exit(1)
            return

        self.stdout.write(
            self.style.WARNING(f">>> Entering DAEMON mode. Periodic sync every {interval} seconds (Ctrl+C to stop)...")
        )

        while not self.stop_requested:
            try:
                pipeline.run_sync(target_body=target, force=force, dry_run=dry_run, parallel=parallel)
            except Exception as e:
                self.stderr.write(self.style.ERROR(f">>> [WARNING] Ingest cycle encountered error: {e}"))

            self.stdout.write(f">>> Sleeping for {interval}s until next sync...")
            sleep_chunks = interval
            while sleep_chunks > 0 and not self.stop_requested:
                time.sleep(min(1, sleep_chunks))
                sleep_chunks -= 1
