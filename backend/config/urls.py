"""
URL configuration for CosmoLost backend project.
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/web/', include('web_api.urls')),
    path('api/desktop/', include('desktop_api.urls')),
]
