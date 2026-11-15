from django.apps import AppConfig


class LoaderConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'loader'
    verbose_name = 'NASA Ingestion & Catalog Loader'

    def ready(self):
        from django.db.models.signals import post_migrate
        from loader.signals import auto_seed_catalog_on_migrate

        post_migrate.connect(auto_seed_catalog_on_migrate, sender=self)
