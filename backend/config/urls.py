"""
URL configuration for CosmoLost backend project.
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),

    # Routes for Web Portal (Three.js 3D map)
    path('api/v1/portal/', include('web_api.urls')),
    path('api/web/', include('web_api.urls')),  # compatibility

    # Routes for Desktop Editor (Content Factory)
    path('api/v1/editor/', include('desktop_api.urls')),
    path('api/desktop/', include('desktop_api.urls')),  # compatibility
]
