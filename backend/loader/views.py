import time
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from loader.tasks import run_nasa_sync, sync_nasa_catalog_task


@api_view(['POST'])
@permission_classes([AllowAny])
def sync_nasa_catalog(request):
    """
    POST /loader/sync-nasa-catalog/ or /api/v1/loader/sync-nasa-catalog/
    Triggers NASA ingestion sync according to openapi_editor.json spec.
    """
    # Security check: in production (DEBUG=False), require staff auth or valid ingest key
    if not settings.DEBUG:
        ingest_key = request.headers.get('X-Ingestion-Key') or request.query_params.get('key')
        expected_key = getattr(settings, 'NASA_INGEST_SECRET', None)
        is_authorized = (
            request.user.is_authenticated and request.user.is_staff
        ) or (expected_key and ingest_key == expected_key)
        if not is_authorized:
            return Response(
                {'detail': 'Authentication credentials were not provided or insufficient permissions.'},
                status=status.HTTP_403_FORBIDDEN,
            )

    start_time = time.time()
    force = bool(request.data.get('force', False)) if hasattr(request, 'data') and request.data else False
    dry_run = bool(request.data.get('dry_run', False)) if hasattr(request, 'data') and request.data else False
    target_body = request.data.get('target_body') if hasattr(request, 'data') and request.data else None
    async_mode = bool(request.data.get('async', False)) if hasattr(request, 'data') and request.data else False

    if async_mode:
        task = sync_nasa_catalog_task.enqueue(target_body=target_body, force=force, dry_run=dry_run)
        return Response(
            {
                'status': 'ENQUEUED',
                'task_id': str(task.id),
            },
            status=status.HTTP_202_ACCEPTED,
        )

    result = run_nasa_sync(target_body=target_body, force=force, dry_run=dry_run)
    duration_sec = round(time.time() - start_time, 2)
    synced_records = result.get('total_saved', 0) if isinstance(result, dict) else 0

    return Response(
        {
            'status': 'COMPLETED',
            'synced_records': synced_records,
            'duration_sec': duration_sec,
        },
        status=status.HTTP_200_OK,
    )
