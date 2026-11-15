from django.urls import path
from game import consumers

websocket_urlpatterns = [
    path('ws/game/duel/<uuid:match_id>/', consumers.DuelConsumer.as_asgi()),
]
