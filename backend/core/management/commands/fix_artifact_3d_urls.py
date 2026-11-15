"""
Django Management Command: fix_artifact_3d_urls

Repairs legacy and broken 3D model URLs (e.g. GitHub raw links returning 404)
in the Artifact database table, replacing them with authentic, verified GLB assets
from the NASA Science Content Delivery Network (https://assets.science.nasa.gov).

Usage:
    python manage.py fix_artifact_3d_urls
    python manage.py fix_artifact_3d_urls --dry-run
    python manage.py fix_artifact_3d_urls --force
"""
from typing import Any
from django.core.management.base import BaseCommand
from core.models import Artifact
from loader.constants import NASA_3D_MODEL_CDN_MAP, resolve_3d_model_url


class Command(BaseCommand):
    help = 'Replace broken GitHub GLB URLs on Artifact entities with verified NASA CDN URLs.'

    def add_arguments(self, parser: Any) -> None:
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate URL resolution and display planned changes without modifying the database.',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force re-resolution of 3D model URLs for all known artifacts even if already set.',
        )

    def handle(self, *args: Any, **options: Any) -> None:
        dry_run = options.get('dry_run', False)
        force = options.get('force', False)

        artifacts = Artifact.objects.all().order_by('id')
        total_checked = 0
        total_updated = 0

        self.stdout.write(self.style.MIGRATE_HEADING(">>> Checking Artifact 3D model URLs..."))
        if dry_run:
            self.stdout.write(self.style.WARNING(">>> RUNNING IN DRY-RUN MODE (no database writes)"))

        for art in artifacts:
            total_checked += 1
            old_url = (art.model_3d_url or '').strip()
            
            is_github = 'github' in old_url.lower() or 'raw.githubusercontent.com' in old_url.lower()
            is_wp = 'wp-content/uploads' in old_url.lower()
            needs_fix = is_github or is_wp or (force and art.id in NASA_3D_MODEL_CDN_MAP) or (not old_url and art.id in NASA_3D_MODEL_CDN_MAP)

            if not needs_fix:
                continue

            new_url = resolve_3d_model_url(art.id, old_url)

            if new_url != old_url:
                total_updated += 1
                self.stdout.write(
                    self.style.SUCCESS(f"[FIX] Artifact '{art.id}' ({art.name}):")
                    + f"\n   Old: {old_url or '<empty>'}"
                    + f"\n   New: {new_url or '<cleared>'}"
                )
                if not dry_run:
                    art.model_3d_url = new_url
                    art.save(update_fields=['model_3d_url'])

        action_word = "Would update" if dry_run else "Successfully updated"
        self.stdout.write(
            self.style.SUCCESS(
                f"\n>>> Done! Total artifacts checked: {total_checked}. {action_word}: {total_updated}."
            )
        )
