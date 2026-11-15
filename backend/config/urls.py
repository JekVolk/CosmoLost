"""
URL configuration for CosmoLost backend project.
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from loader import views as loader_views


def api_root(request):
    """Root API index listing available public endpoints."""
    return JsonResponse({
        'name': 'CosmoLost Backend API',
        'version': '1.0.0',
        'status': 'healthy',
        'endpoints': {
            'portal': '/api/v1/portal/',
            'portal_stats': '/api/v1/portal/stats/',
            'editor': '/api/v1/editor/',
            'admin': '/admin/',
        },
    })


urlpatterns = [
    path('admin/', admin.site.urls),

    # API Root index
    path('api/', api_root, name='api-root'),

    # Routes for Web Portal (Three.js 3D map)
    path('api/v1/portal/', include('web_api.urls')),
    path('api/web/', include('web_api.urls')),  # compatibility

    # Routes for Desktop Editor (Content Factory)
    path('api/v1/editor/', include('desktop_api.urls')),
    path('api/desktop/', include('desktop_api.urls')),  # compatibility

    # Routes for NASA Loader / Catalog Sync
    path('loader/sync-nasa-catalog/', loader_views.sync_nasa_catalog, name='sync-nasa-catalog'),
    path('api/v1/loader/sync-nasa-catalog/', loader_views.sync_nasa_catalog, name='api-sync-nasa-catalog'),
]
