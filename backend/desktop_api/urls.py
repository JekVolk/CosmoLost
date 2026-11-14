from django.urls import path
from . import views

app_name = 'desktop_api'

urlpatterns = [
    # Templates
    path('templates/', views.templates_list, name='templates-list'),
    path('templates/<str:pk>/', views.template_detail, name='template-detail'),

    # Media assets bundle
    path('artifacts/<str:pk>/assets/', views.artifact_asset_bundle, name='artifact-asset-bundle'),

    # Recommendations
    path('recommend-next-topic/', views.recommend_next_topic, name='recommend-next-topic'),
]
