"""
Django Management Command: ingest_nasa_catalog
Alias for run_ingest conforming to specification FEAT-06 (REQ-ING-01) and OP-ING-01.

Usage:
  python manage.py ingest_nasa_catalog
  python manage.py ingest_nasa_catalog --target mars
  python manage.py ingest_nasa_catalog --force
  python manage.py ingest_nasa_catalog --dry-run
  python manage.py ingest_nasa_catalog --daemon --interval 3600
"""
from loader.management.commands.run_ingest import Command as RunIngestCommand


class Command(RunIngestCommand):
    help = 'Alias for run_ingest: Synchronizes NASA space artifacts, missions, and telemetry data into CosmoLost core tables.'
