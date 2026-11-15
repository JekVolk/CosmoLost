# TASK-BE: Ігровий модуль — Backend (Django ORM, REST API, WebSocket, Google OAuth)

> **Виконавець**: Senior / Middle Backend Developer  
> **Стек**: Python 3.12 · Django 5 · Django REST Framework · Django Channels · `social-auth-app-django` · Redis · PostgreSQL  
> **Вхідні дані**: [`FEAT-11_game_implementation_spec.md`](./FEAT-11_game_implementation_spec.md) · [`backend/core/models.py`](../../backend/core/models.py) · [`backend/config/settings.py`](../../backend/config/settings.py)  
> **Гілка**: `feature/game-backend` від `develop`

---

## Загальний принцип

**Всі розрахунки, таймери, RNG та валідація відповідей — виключно на бекенді.**  
Клієнт отримує лише медіа-URL та дескриптори раундів. Правильна відповідь передається клієнту тільки після його вибору.

---

## BE-01 · Встановлення залежностей та Google OAuth

**Що зробити:**

1. Додати в `requirements.txt`:
```
channels==4.*
channels-redis==4.*
social-auth-app-django==5.*
djangorestframework-simplejwt==5.*
redis==5.*
```

2. Розширити `backend/config/settings.py`:
```python
INSTALLED_APPS += [
    'channels',
    'social_django',
    'rest_framework_simplejwt',
    'game',          # новий модуль (створити далі)
]

# Channels
ASGI_APPLICATION = 'config.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {'hosts': [os.environ.get('REDIS_URL', 'redis://localhost:6379')]},
    }
}

# Google OAuth (social-auth-app-django)
AUTHENTICATION_BACKENDS = [
    'social_core.backends.google.GoogleOAuth2',
    'django.contrib.auth.backends.ModelBackend',
]
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY    = os.environ.get('GOOGLE_CLIENT_ID', '')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE  = ['email', 'profile']
SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.user.create_user',
    'game.pipeline.create_game_profile',   # наш крок — створює UserGameProfile
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
)
SOCIAL_AUTH_URL_NAMESPACE = 'social'

# JWT
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(hours=2),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS':  True,
}

# DRF — JWT як основна авторизація
REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = [
    'rest_framework_simplejwt.authentication.JWTAuthentication',
    'rest_framework.authentication.SessionAuthentication',
]
```

3. Оновити `backend/config/asgi.py`:
```python
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import game.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = ProtocolTypeRouter({
    'http':      get_asgi_application(),
    'websocket': AuthMiddlewareStack(URLRouter(game.routing.websocket_urlpatterns)),
})
```

4. Оновити `backend/config/urls.py` — додати маршрути:
```python
urlpatterns = [
    path('admin/',              admin.site.urls),
    path('api/web/',            include('web_api.urls')),
    path('api/desktop/',        include('desktop_api.urls')),
    path('api/game/',           include('game.urls')),
    path('auth/',               include('social_django.urls', namespace='social')),
    path('api/auth/token/',     TokenObtainPairView.as_view()),
    path('api/auth/token/refresh/', TokenRefreshView.as_view()),
    path('api/auth/google/callback/', include('game.auth_views')),
]
```

**Результат**: Django піднімається, `/auth/login/google-oauth2/` перенаправляє в Google, після callback створює `User` + `UserGameProfile`.

---

## BE-02 · Нові моделі `backend/game/models.py`

**Що зробити:**  
Скопіювати повний код моделей із [`FEAT-11_game_implementation_spec.md §1`](./FEAT-11_game_implementation_spec.md).

Структура файлів:
```
backend/game/
  __init__.py
  apps.py
  admin.py
  models.py          ← повні моделі з FEAT-11
  pipeline.py        ← OAuth pipeline крок
  routing.py         ← WS маршрути
  urls.py            ← REST маршрути
  consumers.py       ← WS Consumer
  serializers.py
  views.py
  services/
    __init__.py
    loot_service.py
    elo_service.py
    matchmaker.py
    difficulty_service.py
  migrations/
```

**`backend/game/pipeline.py`** — крок створення ігрового профілю після OAuth:
```python
from game.models import UserGameProfile

def create_game_profile(backend, user, response, *args, **kwargs):
    """Автоматично створює UserGameProfile при першому Google-логіні."""
    if not hasattr(user, 'game_profile'):
        # Генеруємо callsign з Google-нікнейму
        base = (response.get('given_name') or user.username or 'explorer')[:20]
        callsign = base.lower().replace(' ', '_')
        # Якщо callsign зайнятий — додаємо суфікс
        suffix = 1
        while UserGameProfile.objects.filter(callsign=callsign).exists():
            callsign = f'{base}_{suffix}'
            suffix += 1
        UserGameProfile.objects.create(
            user=user,
            callsign=callsign,
            avatar_frame='default',
        )
```

**Після написання моделей:**
```bash
python manage.py makemigrations game
python manage.py migrate
```

---

## BE-03 · Сервіси бізнес-логіки

**Файл `backend/game/services/loot_service.py`** — повний код із FEAT-11 §2.  
Ключові методи:
- `roll(profile, container_type, target_class=None) → ContainerCraft`
- `_build_weights(profile, container_type) → dict` — Pity System, WOW-ефект перших 5 контейнерів
- `_weighted_choice(weights) → str`
- `_pick_item(rarity, target_class) → EquipmentItem`
- `_update_pity(profile, rarity)` — лічильник Historic+; гарантія на 61-му відкритті після 60 невдач

**Файл `backend/game/services/elo_service.py`**:
```python
class EloService:
    K = 32
    def calculate(self, score_p1, score_p2, elo1, elo2) -> tuple[int, int]:
        e1  = 1 / (1 + 10 ** ((elo2 - elo1) / 400))
        s1  = 1.0 if score_p1 > score_p2 else (0.5 if score_p1 == score_p2 else 0.0)
        d1  = round(self.K * (s1 - e1))
        d2  = round(self.K * ((1 - s1) - (1 - e1)))
        return d1, d2
```

**Файл `backend/game/services/matchmaker.py`**:
```python
from datetime import timedelta
from django.utils import timezone
from core.models import Artifact
from game.models import GameMatch

def pick_target_artifact(user_id: int) -> Artifact:
    """
    Вибирає артефакт якого гравець не бачив за 72 год.
    Django ORM: exclude через subquery → ніяких raw SQL.
    """
    cutoff   = timezone.now() - timedelta(hours=72)
    used_ids = GameMatch.objects.filter(
        player1_id=user_id,
        created_at__gte=cutoff
    ).values_list('target_artifact_id', flat=True)

    fresh = Artifact.objects.exclude(id__in=used_ids).order_by('?')
    if fresh.exists():
        return fresh.first()
    # Fallback: повертаємо будь-який, але маска полів у раунді буде нова
    return Artifact.objects.order_by('?').first()

def build_bot_accuracy(player_elo: int) -> float:
    """Точність бота масштабується від 0.40 до 0.92."""
    if player_elo < 1000: return 0.40 + (player_elo / 1000) * 0.10
    if player_elo < 1500: return 0.50 + ((player_elo - 1000) / 500) * 0.20
    if player_elo < 2000: return 0.70 + ((player_elo - 1500) / 500) * 0.15
    return 0.92
```

**Файл `backend/game/services/difficulty_service.py`**:
```python
from game.models import UserGameProfile

def get_match_config(profile: UserGameProfile) -> dict:
    config = {'time_limit_sec': 15, 'elo_protection': False, 'tutorial_mode': False}
    if profile.matches_played < 5:
        config['elo_protection'] = True
    if profile.consecutive_losses >= 3:
        config.update({'tutorial_mode': True, 'time_limit_sec': 25, 'elo_protection': True})
    return config
```

---

## BE-04 · REST API Views + Serializers

**`backend/game/serializers.py`**:
```python
from rest_framework import serializers
from game.models import UserGameProfile, UserInventoryItem, EquipmentItem

class EquipmentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = EquipmentItem
        fields = ['id', 'name', 'description', 'equipment_class', 'rarity', 'image_url']

class UserInventorySerializer(serializers.ModelSerializer):
    equipment = EquipmentItemSerializer(read_only=True)
    class Meta:
        model  = UserInventoryItem
        fields = ['id', 'equipment', 'acquired_at', 'is_showcased', 'showcase_slot']

class PublicShowcaseItemSerializer(serializers.ModelSerializer):
    equipment = EquipmentItemSerializer(read_only=True)
    artifact_location = serializers.SerializerMethodField()

    def get_artifact_location(self, obj):
        artifact = obj.equipment.artifact
        if artifact.latitude is None or artifact.longitude is None:
            return None
        return {'latitude': artifact.latitude, 'longitude': artifact.longitude}

    class Meta:
        model = UserInventoryItem
        fields = ['equipment', 'artifact_location']

class PrivateGameProfileSerializer(serializers.ModelSerializer):
    inventory_count   = serializers.SerializerMethodField()
    win_rate          = serializers.SerializerMethodField()
    container_count   = serializers.SerializerMethodField()

    def get_inventory_count(self, obj):
        return obj.user.inventory.count()

    def get_win_rate(self, obj):
        if obj.matches_played == 0: return 0
        return round(obj.matches_won / obj.matches_played * 100, 1)

    def get_container_count(self, obj):
        return obj.user.container_slots.count()

    class Meta:
        model  = UserGameProfile
        fields = ['callsign', 'bio', 'avatar_frame', 'favorite_planet',
                  'elo_rating', 'rank', 'curator_index',
                  'container_count', 'research_points',
                  'matches_played', 'matches_won', 'current_win_streak',
                  'is_public', 'inventory_count', 'win_rate']

class PublicGameProfileSerializer(serializers.ModelSerializer):
    collection_count = serializers.SerializerMethodField()
    showcase = serializers.SerializerMethodField()

    def get_collection_count(self, obj):
        return obj.user.inventory.count()

    def get_showcase(self, obj):
        items = obj.user.inventory.filter(is_showcased=True).select_related('equipment')
        return PublicShowcaseItemSerializer(items, many=True).data

    class Meta:
        model = UserGameProfile
        fields = ['callsign', 'avatar_frame', 'rank', 'collection_count', 'showcase']
```

**`backend/game/views.py`** — ключові ендпоінти:
```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from game.models import UserGameProfile, UserInventoryItem, EquipmentItem, ContainerCraft, ContainerType
from game.serializers import PrivateGameProfileSerializer, PublicGameProfileSerializer, UserInventorySerializer
from game.services.loot_service import LootService
from game.services.matchmaker import pick_target_artifact, build_bot_accuracy
from game.services.difficulty_service import get_match_config
import uuid

User = get_user_model()


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.game_profile
        profile.try_accrue_container()   # перевіряємо таймер накопичення
        return Response(PrivateGameProfileSerializer(profile).data)


class DailyContainerClaimView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = request.user.game_profile
        claimed = profile.claim_daily_login()
        # Return claimed / pending_space / already_claimed with the UTC expiry.
        return Response(daily_claim_state(profile, claimed))


class PublicProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, callsign):
        profile = UserGameProfile.objects.select_related('user').get(callsign=callsign)
        if not profile.is_public:
            return Response({'detail': 'Профіль приховано'}, status=403)
        return Response(PublicGameProfileSerializer(profile).data)


class InventoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = request.user.inventory.select_related('equipment').order_by('-acquired_at')
        return Response(UserInventorySerializer(items, many=True).data)


class ShowcaseUpdateView(APIView):
    """Гравець оновлює свою Полицю Спадщини (5 слотів)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        slots = request.data.get('slots', [])  # [{inventory_item_id, slot}]
        # Скидаємо всі showcase
        request.user.inventory.update(is_showcased=False, showcase_slot=None)
        for entry in slots[:5]:
            request.user.inventory.filter(id=entry['id']).update(
                is_showcased=True, showcase_slot=entry['slot'])
        return Response({'ok': True})


class MatchCreateView(APIView):
    """Старт матчу: вибір артефакту, конфігурація, повернення match_id."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from game.models import GameMatch
        profile  = request.user.game_profile
        config   = get_match_config(profile)
        artifact = pick_target_artifact(request.user.id)
        accuracy = build_bot_accuracy(profile.elo_rating)

        match = GameMatch.objects.create(
            player1         = request.user,
            is_bot_match    = True,   # PvP підключається через WS після
            bot_accuracy    = accuracy,
            target_artifact = artifact,
        )
        match.mini_games = match.select_mini_games()
        match.save(update_fields=['mini_games'])

        return Response({
            'match_id':       str(match.id),
            'config':         config,
            'ws_url':         f'/ws/game/duel/{match.id}/',
        })


class ContainerCraftView(APIView):
    """Синтез контейнера за RP."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile      = request.user.game_profile
        ctype        = request.data.get('container_type', 'STANDARD')
        target_class = request.data.get('target_class', '')

        costs = {'STANDARD': 100, 'CALIBRATED': 350, 'PROFILE': 500}
        cost  = costs.get(ctype, 100)

        if profile.research_points < cost:
            return Response({'detail': 'Недостатньо RP'}, status=400)

        profile.research_points -= cost
        profile.save(update_fields=['research_points'])

        craft = LootService().roll(profile, ctype, target_class or None)
        return Response({
            'item':         {'name': craft.dropped_item.name,
                             'rarity': craft.dropped_item.rarity,
                             'eq_class': craft.dropped_item.equipment_class,
                             'image_url': craft.dropped_item.image_url},
            'was_duplicate': craft.was_duplicate,
            'rp_earned':    craft.rp_earned,
            'rp_balance':   profile.research_points,
        })


class LeaderboardEloView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        top = UserGameProfile.objects.filter(is_public=True)\
                .order_by('-elo_rating')[:100]\
                .values('callsign', 'elo_rating', 'rank', 'matches_won')
        return Response(list(top))


class GoogleAuthCallbackView(APIView):
    """
    Після social-auth redirect повертає JWT-пару клієнту.
    Frontend викликає цей ендпоінт після повернення з Google.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'OAuth failed'}, status=401)
        refresh = RefreshToken.for_user(request.user)
        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'callsign': request.user.game_profile.callsign,
        })
```

**`backend/game/urls.py`**:
```python
from django.urls import path
from game import views

urlpatterns = [
    path('profile/me/',             views.MyProfileView.as_view()),
    path('profile/<str:callsign>/', views.PublicProfileView.as_view()),
    path('inventory/',              views.InventoryView.as_view()),
    path('showcase/update/',        views.ShowcaseUpdateView.as_view()),
    path('match/create/',           views.MatchCreateView.as_view()),
    path('container/craft/',        views.ContainerCraftView.as_view()),
    path('leaderboard/elo/',        views.LeaderboardEloView.as_view()),
    path('auth/google/done/',       views.GoogleAuthCallbackView.as_view()),
]
```

---

## BE-05 · WebSocket Consumer

**`backend/game/routing.py`**:
```python
from django.urls import re_path
from game import consumers

websocket_urlpatterns = [
    re_path(r'ws/game/duel/(?P<match_id>[^/]+)/$', consumers.DuelConsumer.as_asgi()),
]
```

**`backend/game/consumers.py`** — повний код із [`FEAT-11_game_implementation_spec.md §3`](./FEAT-11_game_implementation_spec.md).

Ключові правила реалізації:
- `round_data` у `GameMatch` — Python dict, що зберігається в JSONField. Правильні відповіді (`target_lat`, `target_lon`, `true_mass_kg`) зберігаються тут. **Ніколи не відправляти їх у WS до отримання відповіді гравця.**
- `run_bot_turn()` запускається через `asyncio.create_task()` одразу після `round.start`.
- Таймер раунду — `asyncio.sleep(time_limit_sec + 2)` → якщо гравець не відповів, сервер зараховує 0 балів автоматично.

---

## BE-06 · Django Admin для `EquipmentItem`

**`backend/game/admin.py`**:
```python
from django.contrib import admin
from unfold.admin import ModelAdmin
from game.models import EquipmentItem, UserGameProfile, GameMatch, ContainerCraft

@admin.register(EquipmentItem)
class EquipmentItemAdmin(ModelAdmin):
    list_display  = ['name', 'artifact', 'equipment_class', 'rarity', 'is_active']
    list_filter   = ['rarity', 'equipment_class', 'is_active']
    search_fields = ['name', 'artifact__name']
    list_editable = ['rarity', 'is_active']

@admin.register(UserGameProfile)
class UserGameProfileAdmin(ModelAdmin):
    list_display  = ['callsign', 'elo_rating', 'rank', 'container_count',
                     'research_points', 'matches_played']
    search_fields = ['callsign', 'user__email']
    readonly_fields = ['pity_counter_historic',
                       'total_containers_opened']

@admin.register(GameMatch)
class GameMatchAdmin(ModelAdmin):
    list_display  = ['id', 'player1', 'is_bot_match', 'score_p1', 'score_p2',
                     'is_chest_unlocked_p1', 'is_chest_unlocked_p2', 'status', 'created_at']
    list_filter   = ['is_bot_match', 'status', 'is_chest_unlocked_p1', 'is_chest_unlocked_p2']

@admin.register(ContainerCraft)
class ContainerCraftAdmin(ModelAdmin):
    list_display  = ['user', 'container_type', 'dropped_item', 'was_duplicate',
                     'rp_earned', 'opened_at']
    list_filter   = ['container_type', 'was_duplicate']
```

---

## BE-07 · Тести

Файл `backend/game/tests.py`:

```python
from django.test import TestCase
from django.contrib.auth import get_user_model
from game.models import UserGameProfile, EquipmentItem, EquipmentRarity
from game.services.loot_service import LootService
from game.services.elo_service import EloService

User = get_user_model()

class LootServiceTest(TestCase):
    def setUp(self):
        u = User.objects.create_user(username='test', password='pass')
        self.profile = UserGameProfile.objects.create(user=u, callsign='tester')
        # Створюємо мінімальний каталог
        from core.models import CelestialBody, Mission, Artifact
        body = CelestialBody.objects.create(id='mars', name='Mars',
                                             radius_km=3389.5, gravity_ms2=3.72,
                                             coordinate_system_type='PLANETOCENTRIC_360',
                                             wmts_tile_url='')
        mission = Mission.objects.create(id='mars-2020', nssdca_id='2020-052A',
                                          name='Mars 2020', agency='NASA', summary='')
        artifact = Artifact.objects.create(id='perseverance', mission=mission,
                                            celestial_body=body, name='Perseverance',
                                            artifact_type='ROVER', operational_status='ACTIVE',
                                            latitude=18.4, longitude=77.4,
                                            location_name='Jezero Crater',
                                            first_person_monologue='...')
        for rarity in EquipmentRarity.values:
            EquipmentItem.objects.create(
                id=f'item_{rarity}', artifact=artifact, name=f'Item {rarity}',
                description='', equipment_class='OPTICS_SENSORS', rarity=rarity)

    def test_first_5_containers_wow_effect(self):
        """Перші 5 відкриттів мають підвищений шанс Specialized."""
        svc = LootService()
        weights = svc._build_weights(self.profile, 'STANDARD')
        self.assertEqual(weights['SCRAP'], 20.0)
        self.assertEqual(weights['SPECIALIZED'], 40.0)

    def test_pity_hard_historic(self):
        """Після 60 невдач 61-ше відкриття гарантує Historic+."""
        self.profile.total_containers_opened = 10  # минули WOW-5
        self.profile.pity_counter_historic = 60
        svc = LootService()
        weights = svc._build_weights(self.profile, 'STANDARD')
        self.assertEqual(weights, {'HISTORIC': 100.0})

    def test_calibrated_no_scrap(self):
        self.profile.total_containers_opened = 10
        weights = LootService()._build_weights(self.profile, 'CALIBRATED')
        self.assertEqual(weights.get('SCRAP', 0), 0.0)
        self.assertEqual(weights.get('STANDARD', 0), 0.0)

    def test_duplicate_gives_rp(self):
        from game.models import UserInventoryItem
        item = EquipmentItem.objects.get(id='item_STANDARD')
        # Вже є в інвентарі
        UserInventoryItem.objects.create(user=self.profile.user, equipment=item)
        self.profile.total_containers_opened = 10
        # Форсуємо вибір Standard
        import unittest.mock as mock
        with mock.patch.object(LootService, '_pick_item', return_value=item):
            with mock.patch.object(LootService, '_weighted_choice', return_value='STANDARD'):
                craft = LootService().roll(self.profile, 'STANDARD')
        self.assertTrue(craft.was_duplicate)
        self.assertEqual(craft.rp_earned, 15)

class EloServiceTest(TestCase):
    def test_winner_gains_loser_loses(self):
        d1, d2 = EloService().calculate(150, 80, 1000, 1000)
        self.assertGreater(d1, 0)
        self.assertLess(d2, 0)
        self.assertEqual(d1 + d2, 0)  # сума завжди 0 при рівному ELO
```

Запуск: `python manage.py test game`

---

## Чеклист здачі BE

- [ ] `python manage.py migrate` проходить без помилок
- [ ] `GET /api/game/profile/me/` → 200 після JWT-авторизації
- [ ] `GET /api/game/containers/` → власні слоти з прогресом пломби
- [ ] `POST /api/game/containers/daily/` → claimed/pending_space/already_claimed і UTC expiry
- [ ] Pending daily claim автоматично видається після звільнення слота в ту саму UTC-добу; прострочений claim не переноситься
- [ ] `GET /auth/login/google-oauth2/` → редирект на Google
- [ ] Після Google callback → `UserGameProfile` створено автоматично через pipeline
- [ ] `POST /api/game/match/create/` → повертає `match_id` + `ws_url`
- [ ] WS `ws/game/duel/{id}/` → accept + `round.start` без правильних координат
- [ ] `submit_guess` → сервер рахує Гаверсин; персональне підтвердження submit без розкриття опоненту, `round.result` із `true_lat/lon` лише після submit/timeout обох
- [ ] `match.finish` → `ContainerCraft` запис створено, ELO оновлено
- [ ] `python manage.py test game` → всі тести зелені
