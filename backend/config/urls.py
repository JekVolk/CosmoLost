"""
URL configuration for CosmoLost backend project.
"""
from django.contrib import admin
from django.urls import include, path
from loader import views as loader_views

urlpatterns = [
    path('admin/', admin.site.urls),

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
