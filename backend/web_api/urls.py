from django.urls import path
from . import views

app_name = 'web_api'

urlpatterns = [
    # Celestial bodies
    path('celestial-bodies/', views.celestial_bodies_list, name='celestial-bodies-list'),
    path('celestial-bodies/<str:pk>/', views.celestial_body_detail, name='celestial-body-detail'),

    # Artifacts
    path('artifacts/', views.artifacts_list, name='artifacts-list'),
    path('artifacts/<str:pk>/', views.artifact_detail, name='artifact-detail'),
    path('artifacts/<str:pk>/waypoints/', views.artifact_waypoints, name='artifact-waypoints'),
    path('artifacts/<str:pk>/discoveries/', views.artifact_discoveries, name='artifact-discoveries'),
    path('artifacts/<str:pk>/media/', views.artifact_media, name='artifact-media'),

    # Missions
    path('missions/', views.missions_list, name='missions-list'),
    path('missions/<str:pk>/', views.mission_detail, name='mission-detail'),

    # Community publications
    path('community-publications/', views.community_publications_view, name='community-publications'),
]
