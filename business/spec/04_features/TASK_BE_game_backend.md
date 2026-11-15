# TASK-BE: Ігровий модуль — Backend (Django ORM, REST API, WebSocket, Google OAuth)

> **Виконавець**: Junior Backend Developer · **обов'язковий review**: Middle/Senior Backend Developer
> **Стек**: Python/Django/DRF версій, закріплених у `backend` · Django Channels · `social-auth-app-django` · Redis · БД згідно з наявною конфігурацією (SQLite local / PostgreSQL production)
> **Вхідні дані**: [`FEAT-11_game_implementation_spec.md`](./FEAT-11_game_implementation_spec.md) · [`backend/core/models.py`](../../backend/core/models.py) · [`backend/config/settings.py`](../../backend/config/settings.py)  
> **Гілка**: `feature/game-backend` від `develop`

---

## Загальний принцип

**Всі розрахунки, таймери, RNG та валідація відповідей — виключно на бекенді.**  
Клієнт отримує лише медіа-URL та дескриптори раундів. Правильна відповідь передається клієнту тільки після його вибору.

## План виконання для Junior

Роби кроки послідовно. Після кожного кроку запускай його перевірки й показуй результат reviewer-у до переходу далі. Не копіюй цілі блоки налаштувань із цієї задачі поверх поточного проєкту: інтегруй лише потрібні зміни, зберігаючи наявні `AUTH_USER_MODEL`, middleware, API та команди запуску.

| Крок | Залежить від | Що зробити | Готово, коли |
|---|---|---|---|
| **J0 · Перевірити базу** | — | Прочитати FEAT-11 §§6–7, перевірити `backend/requirements*`, `settings.py`, `urls.py`, `asgi.py`, чинні auth та команди запуску. Зафіксувати невідповідності до змін. | Django запускається до змін; відомі чинні версії залежностей і схема авторизації. |
| **J1 · Під'єднати Channels** | J0 | Створити мінімальний `game` app skeleton; додати сумісні Channels/Redis залежності, ASGI router, game URL include, Redis channel layer і health/startup перевірки. Не прибирати HTTP/WSGI підтримку. | HTTP продовжує працювати; ASGI піднімається; тестовий WS route приймає запит; Redis недоступність дає явну помилку. |
| **J2 · Дані та міграції** | J0, J1 | Додати game-моделі, constraints, міграції та Django Admin. | Міграції застосовуються з чистої БД і на копії наявної схеми; admin відкривається. |
| **J3 · Серверні сервіси** | J2 | Реалізувати loot, ELO, контейнерні правила, вибір перевірених раундів і matchmaking як окремі функції/сервіси. | Unit-тести перевіряють правила, граничні випадки й транзакції без WebSocket. |
| **J4 · REST API** | J2, J3 | Реалізувати контракти таблиці «REST API» нижче: serializers, permissions, views, routes і API-тести. | Кожен endpoint має позитивний тест, тест авторизації/власності та тест помилкового вводу; OpenAPI/приклади відповідають маршрутам. |
| **J5 · WebSocket** | J1, J3, J4 + auth sign-off | Після auth-рішення нижче під'єднати маршрут, перевірити користувача й учасника матчу, реалізувати події та переходи станів. | Інтеграційний тест проходить повний матч двох клієнтів; перевірені бот-fallback, timeout, reconnect та відсутність витоку секретів. |
| **J6 · Передача** | J0–J5 | Запустити повний набір перевірок із фінального checklist, додати команди запуску/міграцій і короткий опис локального тесту двома клієнтами. | Reviewer може повторити перевірки з чистого середовища; усі чекбокси виконані або мають явно погоджений blocker. |

### Блокуюче рішення до реалізації WS-авторизації

REST використовує JWT Bearer, але `AuthMiddlewareStack` сам по собі не читає цей JWT; попередній frontend-приклад передавав JWT у query string. **Не надсилати access/refresh JWT у URL.** Перед J5 reviewer має затвердити один транспорт для WebSocket-авторизації та записати його однаково у FEAT-11, цій задачі й frontend-задачі. До цього можна зробити ASGI/route та тести неавторизованого з'єднання, але не вважати авторизований WS готовим.

Окремо узгодити OAuth callback: backend-приклад повертає JWT JSON-відповіддю, тоді як старий frontend-приклад передавав їх у redirect URL. Реалізувати лише погоджений secure exchange/session flow; не видавати JWT через query string.

Також frontend-опис має кнопку скасування пошуку, але FEAT-11 не визначає cancel endpoint і правила звільнення зарезервованого слота. Reviewer має або затвердити endpoint/state transition і додати його до FEAT-11, або прибрати кнопку з MVP; Junior не вигадує URL чи економічну поведінку самостійно.

## Межі контракту: REST і WebSocket

- Канонічні маршрути та ігрові події наведені у [`FEAT-11_game_implementation_spec.md` §§6–7](./FEAT-11_game_implementation_spec.md). Якщо приклад коду в цій задачі відрізняється від таблиці, узгодити його з reviewer-ом і виправити до merge.
- API prefix — `/api/game/`; WS path — `/ws/game/duel/{match_id}/`. Клієнт використовує `ws_url`, отриманий від API, а не конструює іншу адресу.
- Вхідне WS-повідомлення має `action`, вихідне — `event` на верхньому рівні JSON. Не додавати паралельний envelope `{type, payload}` без узгодженої зміни FEAT-11 і frontend.
- Публічний REST/WS payload не містить прихованої правильної відповіді, координат, точних мас, внутрішньої різниці мас або приватної історії іншого гравця.

---

## BE-01 · Встановлення залежностей та Google OAuth

**Що зробити:**

Спершу звір `requirements.txt`/lockfile з J0. Додавай лише відсутні пакети сумісних версій; не змінюй версію Django та не дублюй уже встановлені залежності.

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
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import game.routing

application = ProtocolTypeRouter({
    'http':      django_asgi_app,
    # AuthMiddlewareStack authenticates Django sessions, not REST JWTs.
    # Replace/extend only after the WebSocket auth transport is approved.
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

### Порядок реалізації endpoint-ів

1. Додай serializers і тести до кожного serializer.
2. Реалізуй read-only профілі та інвентар; перевір, що приватні поля не потрапляють у public serializer.
3. Реалізуй слоти контейнерів і daily claim у транзакціях: повторний запит не створює другу нагороду, повне сховище повертає pending claim із UTC expiry.
4. Реалізуй match create/status: приймай лише `slot_index`, який належить поточному користувачу; слот резервується атомарно і не може бути використаний у двох матчах.
5. Реалізуй showcase/craft/leaderboards; перевір ownership, ліміти й баланс RP на сервері.
6. Зареєструй усі маршрути в `backend/game/urls.py`, підключи їх через існуючий `config/urls.py`; не створюй дубль API prefix.
7. Для кожного рядка таблиці нижче додай окремі API-тести на успіх, авторизацію/власність і невалідний запит.

### Контракт REST API

Base path: `/api/game/`. Приватні endpoints вимагають `Authorization: Bearer <access_token>`. Public endpoints не повинні використовувати приватний serializer.

| Метод і шлях | Запит | Успішна відповідь / перевірка |
|---|---|---|
| `GET /profile/me/` | Без body | `200`; власні callsign, статистика, ELO/rank, RP і кількість контейнерів. Інший користувач не може отримати ці дані через цей endpoint. |
| `GET /profile/{callsign}/` | Без body | `200`; лише public поля й до 5 предметів вітрини. Для `is_public=false` — `403`; без email, точного RP, інвентарю, pity та історії матчів. |
| `GET /containers/` | Без body | `200`; `{slots:[...] , next_fill_at}`. Слот містить власні `slot_index`, `container_type`, `filled_at`, `seal_progress`, `is_reserved`; не більше 10 слотів. `is_reserved` обчислюється сервером з активного матчу. |
| `POST /containers/daily/` | Порожній JSON `{}` | `200`; `status` — `claimed`, `pending_space` або `already_claimed`, `expires_at` — UTC timestamp/null. Повтор у ту саму UTC-добу не видає контейнер удруге. |
| `POST /match/create/` | `{"slot_index": 0}` | `201`; `match_id`, `ws_url`, серверна конфігурація. Невалідний/чужий/зарезервований слот не запускає матч. Потрібні 3 валідні MVP payloads; інакше `409` без створення матчу й без резерву слота. Пошук суперника триває до 8 с, потім допускається bot fallback; не створювати бота одразу. |
| `GET /match/{id}/` | Без body | `200`; статус тільки матчу, в якому поточний користувач є учасником. Відповіді, координати та приховані маси не повертаються. |
| `POST /container/craft/` | `{"container_type":"STANDARD","target_class":null}` | `200`; результат відкриття, duplicate/RP та новий баланс. Витрата RP і видача предмета атомарні; недостатній баланс не змінюється. |
| `POST /showcase/update/` | `{"slots":[{"inventory_item_id":12,"slot":1}]}` | `200`; оновлена вітрина. Приймаються лише власні inventory IDs, максимум 5 унікальних слотів; валідувати весь запит до будь-якого запису. |
| `GET /inventory/` | Без body | `200`; тільки власний інвентар. |
| `GET /leaderboard/elo/` | Без body | `200`; до 100 public профілів, відсортованих за ELO; без приватних полів. |
| `GET /leaderboard/curator/` | Без body | `200`; public профілі, відсортовані за Curator Index. |

У всіх endpoints перевірити: неавторизований запит не проходить, чужі записи не читаються/змінюються, вхідні поля валідовані serializer-ом, а помилка не створює часткових змін. Для match/container/RP операцій використовувати транзакції та блокування там, де паралельні запити можуть витратити один слот або баланс двічі. Статуси помилок і формат DRF-відповідей зафіксувати у тестах та API-документації.

Приклади успішних відповідей, які треба закріпити тестами:

```json
// GET /api/game/containers/
{
  "slots": [
    {
      "slot_index": 0,
      "container_type": "DAILY",
      "filled_at": "2026-11-15T12:00:00Z",
      "seal_progress": 0,
      "is_reserved": false
    }
  ],
  "next_fill_at": "2026-11-15T16:00:00Z"
}
```

```json
// POST /api/game/containers/daily/
{ "status": "pending_space", "expires_at": "2026-11-16T00:00:00Z" }

// POST /api/game/match/create/
{
  "match_id": "UUID",
  "ws_url": "/ws/game/duel/UUID/",
  "config": { "time_limit_sec": 15, "elo_protection": false }
}
```

Помилки зафіксувати послідовно: `400` для невалідного body, `401` для відсутнього/невалідного credential, `403` для забороненої операції, `404` для відсутнього або недоступного чужого ресурсу, `409` для конфлікту стану/зарезервованого слота чи `insufficient_round_content`. Не включати в `detail` приховані дані або підтвердження існування чужого матчу.

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
        # 1. Validate the entire {slots: [{inventory_item_id, slot}]} body.
        # 2. Verify every ID belongs to request.user and slots are unique/in-range.
        # 3. In one transaction, clear this user's old showcase and apply new slots.
        # Never truncate invalid input or update a foreign user's inventory.
        ...


class MatchCreateView(APIView):
    """Резервує слот і створює матч у стані WAITING."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 1. Validate slot_index in request.data.
        # 2. In a transaction, lock and reserve a slot owned by request.user.
        # 3. Create GameMatch(status='WAITING', is_bot_match=False) and queue it.
        # 4. Return 201 with match_id, ws_url, and public match config.
        # 5. The queue tries PvP for up to 8 seconds; only then assign a bot.
        # Never set is_bot_match=True at creation or trust a client-supplied user,
        # opponent, artifact, score, ELO, answer, or bot accuracy.
        ...


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
    path('containers/',             views.ContainerSlotsView.as_view()),
    path('containers/daily/',       views.DailyContainerClaimView.as_view()),
    path('match/create/',           views.MatchCreateView.as_view()),
    path('match/<uuid:match_id>/',  views.MatchStatusView.as_view()),
    path('container/craft/',        views.ContainerCraftView.as_view()),
    path('showcase/update/',        views.ShowcaseUpdateView.as_view()),
    path('leaderboard/elo/',        views.LeaderboardEloView.as_view()),
    path('leaderboard/curator/',   views.LeaderboardCuratorView.as_view()),
    path('inventory/',              views.InventoryView.as_view()),
    path('auth/google/done/',       views.GoogleAuthCallbackView.as_view()),
]
```

---

## BE-05 · WebSocket Consumer

**`backend/game/routing.py`**:
```python
from django.urls import path
from game import consumers

websocket_urlpatterns = [
    path('ws/game/duel/<uuid:match_id>/', consumers.DuelConsumer.as_asgi()),
]
```

**`backend/game/consumers.py`** — повний код із [`FEAT-11_game_implementation_spec.md §3`](./FEAT-11_game_implementation_spec.md).

### Порядок реалізації з'єднання

1. У `backend/config/asgi.py` спочатку ініціалізувати Django ASGI app, потім під'єднати `ProtocolTypeRouter`: HTTP лишається на Django, WebSocket іде в `URLRouter(game.routing.websocket_urlpatterns)`.
2. Додати Redis channel layer через `REDIS_URL`; локальне значення для розробки не має ставати production fallback. Задокументувати запуск Redis і перевірити, що два процеси бачать один match group.
3. До `accept()` перевірити затверджений спосіб WS-авторизації, чинність match UUID, `status`, і що `scope["user"]` є одним з учасників. Чужому користувачу не повертати, чи існує матч; не додавати його до channel group.
4. Після успішної перевірки додати канал у групу `match_{match_id}`, прийняти socket і надіслати потрібний стан матчу. Повторне з'єднання того самого учасника відновлює серверний стан, а не створює новий матч/раунд.
5. Розбирати тільки JSON object з валідним `action`. Невідома подія, неправильний тип даних, неправильний порядок дій або надмірний payload мають повертати контрольований `round.error`; не ігнорувати та не піднімати raw exception клієнту.
6. Використовувати один wire format: клієнт → сервер `{"action":"...", ...fields}`, сервер → клієнт `{"event":"...", ...fields}`. Перевіряти розмір/типи полів до бізнес-логіки; DB-запити з async consumer виконувати через Channels async ORM API або `database_sync_to_async`.
7. Передавати `round.start` із публічним payload, приймати дію, зберігати score серверно, приватно підтвердити дію, і надсилати `round.result` лише коли обидва гравці lock-нули відповідь або сплив серверний таймер. Потім стартувати наступний раунд або завершити матч.
8. На disconnect очистити лише connection-local heartbeat/tasks; authoritative match timer продовжує працювати на сервері. Дозволити до 3 reconnect-спроб за 5 секунд (FEAT-12); успішне повторне з'єднання відновлює серверний стан, а не створює новий матч/раунд. Повторний submit не нараховує score, RP, ELO чи chest двічі.

### Wire contract і готові сценарії перевірки

| Напрямок | Мінімальні події | Очікувана поведінка |
|---|---|---|
| Server → client | `game.matched` | Містить callsign/ELO/rank і `is_bot`; бот призначається після черги до 8 с, не відразу при `match/create`. |
| Server → client | `round.start` | Має `round_index`, `round_type`, `time_limit_sec`, перевірений `payload`; не має правильних відповідей. |
| Client → server | `submit_guess` | Приймає лише координати гравця; сервер рахує відстань/score. |
| Client → server | `buzzer_click`, `drag_drop` | Перевіряє дозволені ID/слоти та стан поточного раунду; score клієнту не довіряє. |
| Server → client | `round.answer_accepted`, `round.opponent_acted` | Підтверджує submit лише автору; опонент бачить лише загальний факт дії. |
| Server → client | `round.result` | Спільний результат лише після двох відповідей або timeout; для StatGuesser не включає стани/спроби/масу. |
| Server → client | `match.finish` | Рахунок/переможець/ELO; нічия має `winner_id: null`. |
| Server → конкретний гравець | `match.private_reward` | Лише власнику слота; містить тільки його loot/RP. |
| Client → server | `stat_guesser_check`, `stat_guesser_continue`, `stat_guesser_stop` | Лише post-MVP: спроби рахуються сервером; continue потрібен перед повтором; feedback приватний. |

Точні приклади полів — у FEAT-11 §7. Під час інтеграції не перейменовувати `event` на `type`, не обгортати payload і не використовувати `match.found`/`match.end`: канонічні назви — `game.matched`/`match.finish`.

### Зв'язок REST → WebSocket

1. Клієнт надсилає `POST /api/game/match/create/` із Bearer JWT та `{"slot_index": n}`.
2. API відповідає `match_id` та `ws_url`; slot уже зарезервований сервером.
3. Клієнт підключається саме до повернутого `ws_url` через `ws:` локально або `wss:` у production. Production не має downgrade на незашифрований socket.
4. Сервер перевіряє учасника/авторизацію й тільки тоді приймає з'єднання. Після `game.matched` надсилає `round.start`.
5. Після `match.finish` клієнт оновлює профіль/контейнери через REST або використовує відповідь приватної нагороди; не вважає повідомлення клієнта джерелом істини.

### Мінімальні WS-тести

- Неавторизований, прострочений credential, неіснуючий матч і користувач, який не є учасником, не можуть отримати матчеві події.
- Два учасники приєднуються до одного матчу; сторонній socket не отримує жодного group event.
- `round.start` не містить target-полів; після першої відповіді опонент не отримує score/відстань/правильну відповідь.
- Після другої відповіді та окремо після timeout обидва отримують рівно один `round.result`.
- Повторне/паралельне повідомлення не дублює submit, нагороду або фіналізацію.
- Перевірити reconnect у межах погодженого вікна, закриття socket, очищення group і таймерів.
- Перевірити tie, bot fallback, `match.finish`, приватність `match.private_reward`, та StatGuesser переходи/приватний feedback (post-MVP).

Ключові правила Zero-Knowledge:
- `round_data` у `GameMatch` — Python dict, що зберігається в JSONField. Правильні відповіді (`target_lat`, `target_lon`, `true_mass_kg`) зберігаються тут. **Ніколи не відправляти їх у WS до блокування відповідей обох гравців або тайм-ауту.**
- `run_bot_turn()` запускається через `asyncio.create_task()` після `round.start`; для StatGuesser бот проходить той самий цикл порівнянь/спроб, але супернику надсилається лише загальний індикатор дії.
- Таймер раунду — `asyncio.sleep(time_limit_sec + 2)` → якщо гравець не відповів, сервер зараховує 0 балів автоматично.
- **StatGuesser — АстроТерези (post-MVP):** публічний payload містить назву апарата, `objects: [{id, label, mass_kg}]` і допуск балансу; прихована `true_mass_kg` лишається тільки в серверному `round_data`. Приймати `stat_guesser_check` лише з `object_ids`, перевіряти їх та рахувати суму за серверними значеннями.
- Після кожної спроби приватно повертати тільки `spacecraft_heavier` (`<`), `objects_heavier` (`>`) або `balanced` (`=`) — без маси апарата й різниці. Атомарно переходити між станами `ready → checking → continue_pending` або `complete`; продовження/stop приймати лише з `continue_pending`, а наступний check — лише після явного `stat_guesser_continue`. Спільний `round.result` не містить стану терезів чи спроб; вони залишаються приватними. Спроби рахувати на сервері, таймер раунду залишається серверним.
- `balanced` — різниця до 1% маси апарата (початковий поріг для плейтесту). Баланс дає 100 балів і RP за формулою `max(0, RP_BASE - (attempts - 1) * RP_STEP)`; timeout/stop без балансу дає 0 балів і 0 RP. `RP_BASE`/`RP_STEP` налаштовуються після перевірки економіки. Не розкривати точну масу навіть у фінальному результаті.

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

**Додаткові backend-тести для StatGuesser (post-MVP):**
- Відхиляти невідомі/повторені `object_ids` і порожній набір; не використовувати підставлені клієнтом маси.
- Перевірити три стани, межу допуску балансу, лічильник спроб, вимогу continue перед повтором, 100 балів/RP при балансі та 0 при stop/timeout без балансу.
- Перевірити, що feedback приватний, не містить маси/різниці та не надсилається опоненту; RP гарантовано зменшується зі зростанням спроб.

Запуск: `python manage.py test game`

---

## Чеклист здачі BE

### Підготовка та конфігурація

- [ ] Зафіксовано версії залежностей із наявного backend; немає непогодженого downgrade Django/DRF.
- [ ] `python manage.py check` проходить до й після змін.
- [ ] HTTP-роутинг працює як раніше; ASGI завантажується через `config.asgi:application`.
- [ ] Channels під'єднується до Redis із `REDIS_URL`; локальний Redis старт і production env задокументовані.
- [ ] WS-auth транспорт письмово затверджений; raw JWT не передається в URL.
- [ ] OAuth token delivery погоджений; скасування matchmaking або специфіковане в FEAT-11, або виключене з MVP UI.

### Дані та бізнес-логіка

- [ ] `python manage.py makemigrations --check --dry-run` не знаходить незакомічених змін моделі.
- [ ] `python manage.py migrate` проходить на чистій БД; constraints слотів та унікальності працюють.
- [ ] Django Admin відкривається для EquipmentItem, профілю, матчу й ContainerCraft.
- [ ] Unit-тести покривають pity/duplicates/RP, ELO, daily claims, вибір перевірених раундів і threshold score.
- [ ] Match/slot/RP фіналізація транзакційна та ідемпотентна: повторний запит не списує/не видає нагороду двічі.

### REST API

- [ ] Усі маршрути з FEAT-11 §6 зареєстровані під `/api/game/`; тестами перевірені метод, auth і код відповіді.
- [ ] `/profile/me/` повертає лише власний приватний профіль; `/profile/{callsign}/` — окремий public serializer і максимум 5 showcase предметів.
- [ ] `/containers/` повертає лише власні слоти; daily endpoint повертає `claimed`/`pending_space`/`already_claimed` та UTC expiry.
- [ ] Daily claim при повному сховищі видається після звільнення місця до кінця тієї ж UTC-доби; прострочений claim не переноситься.
- [ ] `/match/create/` приймає власний вільний `slot_index`, атомарно резервує його і повертає `match_id` + `ws_url`; queue чекає до 8 с перед bot fallback.
- [ ] Якщо немає трьох валідних MVP payloads, `/match/create/` повертає `409` і не створює матч/резерв слота.
- [ ] `/match/{id}/` відмовляє користувачу, який не є учасником; не повертає target/відповіді/приватні дані.
- [ ] `/inventory/`, `/showcase/update/`, `/container/craft/` перевіряють ownership, ліміти, валідність і баланс до запису; невалідний запит не змінює дані.
- [ ] ELO/Curator leaderboards містять лише public профілі й не повертають приватні поля.
- [ ] Google OAuth → game profile → JWT перевірено наскрізним тестом; секрети не зберігаються в коді або URL.

### WebSocket і матч

- [ ] `ws_url` веде на `/ws/game/duel/{match_id}/`; HTTP deployment використовує `ws:`, production — тільки `wss:`.
- [ ] До `accept()` перевіряються auth, UUID/status матчу й участь гравця; чужий socket не додається до group.
- [ ] Фронтенд і бекенд використовують однаковий wire format (`action` → `event`) і назви `game.matched`, `round.start`, `round.result`, `match.finish`.
- [ ] `game.matched` приходить після PvP match або bot fallback; bot не призначається одразу при створенні матчу.
- [ ] Два тестові клієнти проходять усі три MVP-раунди; серверний таймер завершує пропущену відповідь.
- [ ] Після першої відповіді опонент бачить лише загальний `round.opponent_acted`; `round.result` надходить обом лише після двох відповідей або timeout.
- [ ] Перевірені disconnect/reconnect, cleanup груп/таймерів, невідомі дії, невалідний payload, duplicate і паралельний submit.
- [ ] `match.finish` оновлює обох людських гравців симетрично; нічия має `winner_id: null`; loot/RP надходить лише власнику нагороди.
- [ ] StatGuesser (post-MVP) має окремі тести на стани, явний continue, приховану масу, приватний feedback і RP за кількість спроб.

### Команди перевірки й передача

Запускати з каталогу `backend/`:

```bash
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py migrate
python manage.py test game
```

- [ ] Усі команди завершуються успішно; інтеграційні WS-тести запускаються з Redis test layer або погодженим in-memory layer.
- [ ] У задачі/PR є перелік змінених маршрутів, приклади REST/WS запитів, команди запуску Redis/ASGI та відомі обмеження.
- [ ] Для кожного невиконаного пункту вказаний blocker і погоджений reviewer; не позначати задачу готовою лише за фактом успішного запуску сервера.
