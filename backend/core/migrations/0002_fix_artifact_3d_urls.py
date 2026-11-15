# Generated for fixing broken GitHub 3D model URLs to official NASA CDN
from django.db import migrations

NASA_3D_MODEL_CDN_MAP = {
    'opportunity-rover': 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-exploration-rover---opportunity-(mer-b)/Mars%20Exploration%20Rover%20-%20Opportunity%20(MER-B).glb',
    'spirit-rover': 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-exploration-rover---opportunity-(mer-b)/Mars%20Exploration%20Rover%20-%20Opportunity%20(MER-B).glb',
    'apollo-11-descent-stage': 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/apollo-lunar-module/Apollo%20Lunar%20Module.glb',
    'apollo-11-lm-eagle': 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/apollo-lunar-module/Apollo%20Lunar%20Module.glb',
    'ingenuity-helicopter': 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/ingenuity-mars-helicopter/Ingenuity%20Mars%20Helicopter.glb',
    'insight-lander': 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/insight-cruise-lander/InSight%20Cruise%20Lander%20(panels%20deployed).glb',
    'perseverance-rover': 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-2020-perseverance-rover/Mars%202020%20Perseverance%20Rover.glb',
    'curiosity-rover': 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-2020-perseverance-rover/Mars%202020%20Perseverance%20Rover.glb',
    'viking-lander': 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/viking-lander/Viking%20Lander.glb',
}


def forwards_fix_urls(apps, schema_editor):
    Artifact = apps.get_model('core', 'Artifact')
    updated_count = 0

    for artifact in Artifact.objects.all():
        old_url = (artifact.model_3d_url or '').strip()
        art_id = artifact.id.lower()
        new_url = old_url

        # Direct map by ID
        if art_id in NASA_3D_MODEL_CDN_MAP:
            new_url = NASA_3D_MODEL_CDN_MAP[art_id]
        elif 'github' in old_url.lower() or 'raw.githubusercontent.com' in old_url.lower() or 'wp-content/uploads' in old_url.lower():
            combined = f"{art_id} {old_url}".lower()
            if 'ingenuity' in combined:
                new_url = NASA_3D_MODEL_CDN_MAP['ingenuity-helicopter']
            elif 'opportunity' in combined or 'spirit' in combined or 'mer' in combined:
                new_url = NASA_3D_MODEL_CDN_MAP['opportunity-rover']
            elif 'apollo' in combined or 'lunar' in combined or 'lm' in combined:
                new_url = NASA_3D_MODEL_CDN_MAP['apollo-11-descent-stage']
            elif 'insight' in combined:
                new_url = NASA_3D_MODEL_CDN_MAP['insight-lander']
            elif 'perseverance' in combined or 'curiosity' in combined:
                new_url = NASA_3D_MODEL_CDN_MAP['perseverance-rover']
            elif 'viking' in combined:
                new_url = NASA_3D_MODEL_CDN_MAP['viking-lander']
            else:
                new_url = ''

        if new_url != old_url:
            artifact.model_3d_url = new_url
            artifact.save(update_fields=['model_3d_url'])
            updated_count += 1

    if updated_count:
        print(f"Migration 0002_fix_artifact_3d_urls: Successfully updated {updated_count} artifact 3D model URLs.")


def backwards_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(forwards_fix_urls, backwards_noop),
    ]
