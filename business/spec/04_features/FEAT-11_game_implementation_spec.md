# [FEAT-11] Специфікація реалізації: Ігровий модуль CosmoLost

> **Статус**: `READY FOR DEVELOPMENT`  
> **Версія**: `v1.0.0`  
> **Аудиторія**: Backend-розробник, Frontend-розробник, QA  
> **Контекст бази**: 118 артефактів (82 Місяць + 36 Марс), повний каталог NASA/PDS  
> **Залежні специфікації**: [`FEAT-10`](./FEAT-10_deductive_game_and_containers.md) · [`FEAT-10 Risk Audit`](./FEAT-10_RISK_AUDIT_AND_DETAIL.md)

---

## 1. Нові Django-моделі (`backend/game/models.py`)

> [!IMPORTANT]
> Весь ігровий стан зберігається та валідується **виключно на бекенді**. Фронтенд отримує лише медіа-URL та дескриптори раундів — правильні відповіді ніколи не передаються клієнту до завершення ходу.

```python
# backend/game/models.py
import uuid
import random
from django.db import models
from django.conf import settings
from django.utils import timezone
from core.models import Artifact, ScientificDiscovery, ArtifactType


# ──────────────────────────────────────────────
# ENUMS
# ──────────────────────────────────────────────

class EquipmentRarity(models.TextChoices):
    SCRAP      = 'SCRAP',      'Утиль (Scrap)'
    STANDARD   = 'STANDARD',   'Штатний (Standard)'
    SPECIALIZED= 'SPECIALIZED','Спеціалізований (Specialized)'
    PROTOTYPE  = 'PROTOTYPE',  'Експериментальний (Prototype)'
    AUTONOMOUS = 'AUTONOMOUS', 'Автономний (Autonomous)'
    HISTORIC   = 'HISTORIC',   'Історичний (Historic)'
    ANOMALY    = 'ANOMALY',    'Сингулярний (Anomaly)'

# Шанси випадіння (сума = 100.0)
RARITY_DROP_WEIGHTS = {
    'SCRAP':       42.0,
    'STANDARD':    28.0,
    'SPECIALIZED': 16.0,
    'PROTOTYPE':    8.0,
    'AUTONOMOUS':   4.0,
    'HISTORIC':     1.6,
    'ANOMALY':      0.4,
}

# RP за дублікат
RARITY_RP_VALUE = {
    'SCRAP':        5,
    'STANDARD':    15,
    'SPECIALIZED': 40,
    'PROTOTYPE':  100,
    'AUTONOMOUS': 250,
    'HISTORIC':   600,
    'ANOMALY':   1500,
}

class EquipmentClass(models.TextChoices):
    OPTICS_SENSORS    = 'OPTICS_SENSORS',    'Оптика та Сенсори'
    MOBILITY_CHASSIS  = 'MOBILITY_CHASSIS',  'Ходова та Шасі'
    POWER_PROPULSION  = 'POWER_PROPULSION',  'Енергосистеми та Двигуни'
    COMMS_AVIONICS    = 'COMMS_AVIONICS',    'Телеметрія та Зв\'язок'
    PAYLOAD_TOOLS     = 'PAYLOAD_TOOLS',     'Інструменти та Лабораторії'
    CREW_RELICS       = 'CREW_RELICS',       'Особисті речі та Меморіали'

class MiniGameType(models.TextChoices):
    ASTRO_GUESSR      = 'ASTRO_GUESSR',      'AstroGuessr 360° Панорама'
    TRAVERSE_TRACER   = 'TRAVERSE_TRACER',   'Traverse Tracer: Маршрут ровера'
    FORENSIC_SOL      = 'FORENSIC_SOL',      'Судмедекспертиза: Останній Сол'
    SHADOW_PROJECTOR  = 'SHADOW_PROJECTOR',  'Тіньовий Проектор'
    SCALE_MATCHER     = 'SCALE_MATCHER',     'Космічний Масштаб'
    MISSION_HANGAR    = 'MISSION_HANGAR',    'Монтажний Ангар: Збірка місії'
    COMPONENT_DISSECT = 'COMPONENT_DISSECT', '3D-Інженер: Знайди прилад'
    STAT_GUESSER      = 'STAT_GUESSER',      'Характеристики Навмання'
    MISSION_STACK     = 'MISSION_STACK',     'Складання Капсули-Ракети'

class ContainerType(models.TextChoices):
    STANDARD    = 'STANDARD',    'Базовий контейнер'
    CALIBRATED  = 'CALIBRATED',  'Калібрований (≥ Specialized)'
    PROFILE     = 'PROFILE',     'Профільний (вибір класу)'
    DAILY       = 'DAILY',       'Щоденний логін'
    BONUS       = 'BONUS',       'Бонусний (Pity/Tournament)'

class UserRank(models.TextChoices):
    CADET           = 'CADET',           'Кадет-спостерігач'
    TELEMETRY_TECH  = 'TELEMETRY_TECH',  'Технік телеметрії'
    NAV_OPERATOR    = 'NAV_OPERATOR',    'Оператор навігації'
    MISSION_SPEC    = 'MISSION_SPEC',    'Спеціаліст місії'
    FLIGHT_DIRECTOR = 'FLIGHT_DIRECTOR', 'Директор польотів'
    ASTRO_ARCHAEO   = 'ASTRO_ARCHAEO',   'Головний Астро-Археолог'


# ──────────────────────────────────────────────
# КАТАЛОГ ОБЛАДНАННЯ
# ──────────────────────────────────────────────

class EquipmentItem(models.Model):
    """
    Один предмет у лут-таблиці.
    Прив'язаний до реального Artifact (і опц. до ScientificDiscovery).
    """
    id              = models.CharField(max_length=100, primary_key=True)
    artifact        = models.ForeignKey(Artifact, on_delete=models.CASCADE,
                                        related_name='equipment_items')
    discovery       = models.ForeignKey(ScientificDiscovery, null=True, blank=True,
                                        on_delete=models.SET_NULL)
    name            = models.CharField(max_length=200)
    description     = models.TextField()
    equipment_class = models.CharField(max_length=50, choices=EquipmentClass.choices)
    rarity          = models.CharField(max_length=30, choices=EquipmentRarity.choices,
                                       default=EquipmentRarity.STANDARD)
    image_url       = models.CharField(max_length=500, blank=True)
    is_active       = models.BooleanField(default=True)

    class Meta:
        db_table = 'game_equipment_items'
        indexes = [models.Index(fields=['rarity']),
                   models.Index(fields=['equipment_class'])]

    def rp_value(self) -> int:
        return RARITY_RP_VALUE.get(self.rarity, 5)


# ──────────────────────────────────────────────
# ПРОФІЛЬ ГРАВЦЯ
# ──────────────────────────────────────────────

class UserGameProfile(models.Model):
    """Єдиний профіль гравця — ELO, контейнери, RP, ранг."""
    user                 = models.OneToOneField(settings.AUTH_USER_MODEL,
                                               on_delete=models.CASCADE,
                                               related_name='game_profile')
    callsign             = models.CharField(max_length=64, unique=True)
    bio                  = models.TextField(blank=True, max_length=500)
    avatar_frame         = models.CharField(max_length=64, default='default')
    favorite_planet      = models.CharField(max_length=16, default='mars')  # mars | moon

    # Рейтинг
    elo_rating           = models.IntegerField(default=1000, db_index=True)
    rank                 = models.CharField(max_length=30, choices=UserRank.choices,
                                            default=UserRank.CADET)
    curator_index        = models.BigIntegerField(default=0)

    # Контейнери та валюта
    container_slots      = models.IntegerField(default=3)   # поточна кількість [0..10]
    research_points      = models.IntegerField(default=0)
    last_chest_accrual   = models.DateTimeField(default=timezone.now)
    last_daily_login     = models.DateField(null=True, blank=True)

    # Статистика
    matches_played       = models.IntegerField(default=0)
    matches_won          = models.IntegerField(default=0)
    current_win_streak   = models.IntegerField(default=0)
    consecutive_losses   = models.IntegerField(default=0)   # для anti-frustration
    total_containers_opened = models.IntegerField(default=0)

    # Pity лічильники (анти-невдача)
    pity_counter_historic = models.IntegerField(default=0)  # скільки дропів без Historic+
    pity_counter_anomaly  = models.IntegerField(default=0)  # скільки дропів без Anomaly

    # Privacy
    is_public            = models.BooleanField(default=True)

    class Meta:
        db_table = 'game_user_profiles'

    MAX_CONTAINERS = 10
    ACCRUAL_HOURS  = 4   # 1 контейнер кожні 4 год

    def try_accrue_container(self) -> bool:
        """Нараховує контейнер якщо пройшло ≥ ACCRUAL_HOURS і слоти не повні."""
        if self.container_slots >= self.MAX_CONTAINERS:
            return False
        delta = timezone.now() - self.last_chest_accrual
        if delta.total_seconds() >= self.ACCRUAL_HOURS * 3600:
            self.container_slots = min(self.container_slots + 1, self.MAX_CONTAINERS)
            self.last_chest_accrual = timezone.now()
            self.save(update_fields=['container_slots', 'last_chest_accrual'])
            return True
        return False

    def claim_daily_login(self) -> bool:
        """Нараховує 1 контейнер за перший щоденний вхід."""
        today = timezone.now().date()
        if self.last_daily_login == today:
            return False
        if self.container_slots < self.MAX_CONTAINERS:
            self.container_slots += 1
        self.last_daily_login = today
        self.save(update_fields=['container_slots', 'last_daily_login'])
        return True

    def update_rank(self):
        """Перераховує ранг за ELO + перемоги."""
        rank_map = [
            (UserRank.ASTRO_ARCHAEO,   2000, 500),
            (UserRank.FLIGHT_DIRECTOR, 1800, 250),
            (UserRank.MISSION_SPEC,    1500, 100),
            (UserRank.NAV_OPERATOR,    1300,  50),
            (UserRank.TELEMETRY_TECH,  1100,  10),
        ]
        for rank, elo_req, wins_req in rank_map:
            if self.elo_rating >= elo_req and self.matches_won >= wins_req:
                self.rank = rank
                return
        self.rank = UserRank.CADET


# ──────────────────────────────────────────────
# ІНВЕНТАР
# ──────────────────────────────────────────────

class UserInventoryItem(models.Model):
    """Отриманий гравцем артефакт. unique_together гарантує унікальність."""
    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                    related_name='inventory')
    equipment   = models.ForeignKey(EquipmentItem, on_delete=models.CASCADE)
    acquired_at = models.DateTimeField(auto_now_add=True)
    is_showcased = models.BooleanField(default=False)   # на «Полиці Спадщини»
    showcase_slot = models.IntegerField(null=True, blank=True)  # 1-5

    class Meta:
        db_table = 'game_inventory'
        unique_together = ('user', 'equipment')
        constraints = [
            models.CheckConstraint(
                check=models.Q(showcase_slot__isnull=True) |
                      models.Q(showcase_slot__gte=1, showcase_slot__lte=5),
                name='valid_showcase_slot'
            )
        ]


# ──────────────────────────────────────────────
# МАТЧ
# ──────────────────────────────────────────────

class GameMatch(models.Model):
    """Одна ігрова сесія. Вся логіка валідації на бекенді."""
    id              = models.UUIDField(primary_key=True, default=uuid.uuid4)
    player1         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                        related_name='matches_p1')
    player2         = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                        on_delete=models.SET_NULL, related_name='matches_p2')
    is_bot_match    = models.BooleanField(default=False)
    bot_accuracy    = models.FloatField(default=0.5)   # 0.4-0.92 за ELO

    target_artifact = models.ForeignKey(Artifact, on_delete=models.PROTECT)
    mini_games      = models.JSONField(default=list)   # ['ASTRO_GUESSR','FORENSIC_SOL','SCALE_MATCHER']
    round_data      = models.JSONField(default=dict)   # server-side state (правильні відповіді НЕ в WS)

    score_p1        = models.IntegerField(default=0)
    score_p2        = models.IntegerField(default=0)
    winner          = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                        on_delete=models.SET_NULL, related_name='won_matches')
    is_chest_unlocked = models.BooleanField(default=False)
    elo_delta_p1    = models.IntegerField(default=0)
    elo_delta_p2    = models.IntegerField(default=0)

    # Захист від повтору контенту
    artifact_cooldown_until = models.DateTimeField(null=True, blank=True)

    status          = models.CharField(max_length=20, default='WAITING')
    # WAITING | IN_PROGRESS | FINISHED | ABANDONED

    created_at      = models.DateTimeField(auto_now_add=True)
    finished_at     = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'game_matches'
        indexes = [models.Index(fields=['status', 'created_at'])]

    @property
    def threshold_score(self) -> int:
        """Поріг балів для відкриття контейнера."""
        return 100

    def select_mini_games(self) -> list:
        """Вибирає 3 різні міні-гри з пулу для цього матчу."""
        pool = list(MiniGameType.values)
        # Фільтруємо ігри що потребують даних які є для цього артефакту
        available = []
        a = self.target_artifact
        if hasattr(a, 'media') and a.media.filter(media_category='PANORAMA').exists():
            available.append(MiniGameType.ASTRO_GUESSR)
        if a.waypoints.count() >= 4:
            available.append(MiniGameType.TRAVERSE_TRACER)
        if a.last_contact_sol:
            available.append(MiniGameType.FORENSIC_SOL)
        if a.model_3d_url:
            available.extend([MiniGameType.SHADOW_PROJECTOR,
                               MiniGameType.SCALE_MATCHER,
                               MiniGameType.COMPONENT_DISSECT])
        if a.mass_kg:
            available.append(MiniGameType.STAT_GUESSER)
        available.append(MiniGameType.MISSION_HANGAR)
        available.append(MiniGameType.MISSION_STACK)
        # Гарантуємо мінімум 3
        if len(available) < 3:
            available = pool
        return random.sample(available, min(3, len(available)))


# ──────────────────────────────────────────────
# КОНТЕЙНЕРИ (RP-СИНТЕЗ)
# ──────────────────────────────────────────────

class ContainerCraft(models.Model):
    """Запис про відкритий або синтезований контейнер."""
    id              = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user            = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                        related_name='containers')
    container_type  = models.CharField(max_length=20, choices=ContainerType.choices,
                                       default=ContainerType.DAILY)
    target_class    = models.CharField(max_length=50, choices=EquipmentClass.choices,
                                       blank=True)  # тільки для PROFILE-типу
    rp_spent        = models.IntegerField(default=0)
    dropped_item    = models.ForeignKey(EquipmentItem, null=True, blank=True,
                                        on_delete=models.SET_NULL)
    was_duplicate   = models.BooleanField(default=False)
    rp_earned       = models.IntegerField(default=0)   # якщо дублікат
    match           = models.ForeignKey(GameMatch, null=True, blank=True,
                                        on_delete=models.SET_NULL)
    opened_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'game_containers'
```

---

## 2. Сервіс генерації Лут-дропу (`backend/game/services/loot_service.py`)

```python
# backend/game/services/loot_service.py
import random
from typing import Optional
from game.models import (EquipmentItem, UserGameProfile, UserInventoryItem,
                          ContainerCraft, ContainerType, RARITY_DROP_WEIGHTS)

class LootService:
    """
    Вся логіка дропу на сервері.
    Клієнт отримує результат ПІСЛЯ того як RNG відпрацював.
    """

    # Pity пороги
    PITY_HARD_HISTORIC = 61   # після 61 дропу без Historic+ — гарантія
    PITY_HARD_ANOMALY  = 500  # після 500 дропів без Anomaly — гарантія

    def roll(self, profile: UserGameProfile,
             container_type: ContainerType,
             target_class: Optional[str] = None) -> ContainerCraft:
        """
        Головна точка входу.
        Повертає ContainerCraft із заповненим dropped_item або rp_earned.
        """
        weights = self._build_weights(profile, container_type)
        rarity  = self._weighted_choice(weights)
        item    = self._pick_item(rarity, target_class)

        # Оновлюємо pity лічильники
        self._update_pity(profile, rarity)

        # Перевіряємо дублікат
        is_dup = UserInventoryItem.objects.filter(
            user=profile.user, equipment=item).exists()

        rp_earned = 0
        if is_dup:
            rp_earned = item.rp_value()
            profile.research_points += rp_earned
        else:
            UserInventoryItem.objects.create(user=profile.user, equipment=item)

        profile.total_containers_opened += 1
        profile.save(update_fields=['research_points', 'total_containers_opened',
                                    'pity_counter_historic', 'pity_counter_anomaly'])

        return ContainerCraft.objects.create(
            user=profile.user,
            container_type=container_type,
            target_class=target_class or '',
            dropped_item=item,
            was_duplicate=is_dup,
            rp_earned=rp_earned,
        )

    def _build_weights(self, profile: UserGameProfile,
                       container_type: ContainerType) -> dict:
        weights = dict(RARITY_DROP_WEIGHTS)

        # Перші 5 контейнерів акаунту — WOW-ефект: Scrap↓ Specialized↑
        if profile.total_containers_opened < 5:
            weights['SCRAP']       = 20.0
            weights['STANDARD']    = 20.0
            weights['SPECIALIZED'] = 40.0

        # Калібрований: відсікаємо Scrap + Standard
        if container_type == ContainerType.CALIBRATED:
            weights['SCRAP']    = 0.0
            weights['STANDARD'] = 0.0

        # Hard Pity Historic
        if profile.pity_counter_historic >= self.PITY_HARD_HISTORIC:
            return {'HISTORIC': 100.0}

        # Hard Pity Anomaly
        if profile.pity_counter_anomaly >= self.PITY_HARD_ANOMALY:
            return {'ANOMALY': 100.0}

        # Soft Pity Historic (21-60): шанс зростає лінійно
        if profile.pity_counter_historic >= 21:
            bonus = (profile.pity_counter_historic - 20) * 0.08  # +8% за кожен крок
            weights['HISTORIC'] = min(weights['HISTORIC'] * (1 + bonus), 20.0)

        return weights

    def _weighted_choice(self, weights: dict) -> str:
        total = sum(weights.values())
        r = random.uniform(0, total)
        cumulative = 0
        for rarity, w in weights.items():
            cumulative += w
            if r <= cumulative:
                return rarity
        return 'SCRAP'

    def _pick_item(self, rarity: str, target_class: Optional[str]) -> EquipmentItem:
        qs = EquipmentItem.objects.filter(rarity=rarity, is_active=True)
        if target_class:
            qs = qs.filter(equipment_class=target_class)
        if not qs.exists():
            qs = EquipmentItem.objects.filter(rarity=rarity, is_active=True)
        return random.choice(list(qs))

    def _update_pity(self, profile: UserGameProfile, rarity: str):
        if rarity in ('HISTORIC', 'ANOMALY'):
            profile.pity_counter_historic = 0
        else:
            profile.pity_counter_historic += 1

        if rarity == 'ANOMALY':
            profile.pity_counter_anomaly = 0
        else:
            profile.pity_counter_anomaly += 1
```

---

## 3. WebSocket Consumer — Zero-Knowledge протокол (`backend/game/consumers.py`)

```python
# backend/game/consumers.py
import math, asyncio, random
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from game.models import GameMatch, UserGameProfile
from game.services.loot_service import LootService
from game.services.elo_service import EloService

class DuelConsumer(AsyncJsonWebsocketConsumer):
    """
    ПРАВИЛО: клієнту ніколи не надсилаються правильні відповіді
    до того як гравець зробив свій вибір.
    """

    async def connect(self):
        self.match_id = self.scope['url_route']['kwargs']['match_id']
        self.user     = self.scope['user']
        self.group    = f'match_{self.match_id}'
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()

    async def receive_json(self, content):
        action = content.get('action')
        handlers = {
            'submit_guess':    self.on_submit_guess,
            'buzzer_click':    self.on_buzzer_click,
            'drag_drop':       self.on_drag_drop,
            'scale_lock':      self.on_scale_lock,
        }
        handler = handlers.get(action)
        if handler:
            await handler(content)

    # ── AstroGuessr ──────────────────────────────
    async def on_submit_guess(self, data):
        """Гаверсин рахується тут. Клієнт надсилає лише [lat, lon]."""
        match = await self._get_match()
        round_state = match.round_data.get('current_round', {})
        target_lat  = round_state['target_lat']     # ← секрет на сервері
        target_lon  = round_state['target_lon']
        radius_km   = round_state['planet_radius_km']

        user_lat = data['lat']
        user_lon = data['lon']

        # Формула Гаверсину
        dlat = math.radians(target_lat - user_lat)
        dlon = math.radians(target_lon - user_lon)
        a = (math.sin(dlat/2)**2 +
             math.cos(math.radians(user_lat)) *
             math.cos(math.radians(target_lat)) *
             math.sin(dlon/2)**2)
        dist_km = radius_km * 2 * math.asin(math.sqrt(a))
        score   = max(0, round(100 * math.exp(-dist_km / 50.0)))

        # Зберігаємо результат гравця
        await self._save_round_score(match, self.user.id, score)

        # Відправляємо результат — тепер розкриваємо правду
        await self.channel_layer.group_send(self.group, {
            'type':       'broadcast.round_result',
            'user_id':    self.user.id,
            'score':      score,
            'dist_km':    round(dist_km, 2),
            'true_lat':   target_lat,   # ← правда тільки після вибору
            'true_lon':   target_lon,
        })

    async def on_scale_lock(self, data):
        """Scale Matcher — сервер порівнює scale_factor з реальним."""
        match        = await self._get_match()
        true_mass    = match.round_data['current_round']['true_mass_kg']
        ref_mass     = match.round_data['current_round']['ref_mass_kg']
        true_ratio   = true_mass / ref_mass
        user_ratio   = data['scale_factor']
        error_pct    = abs(user_ratio - true_ratio) / true_ratio * 100
        score = 50 if error_pct < 5 else (25 if error_pct < 20 else 0)
        await self._save_round_score(match, self.user.id, score)
        await self.channel_layer.group_send(self.group, {
            'type':        'broadcast.round_result',
            'user_id':     self.user.id,
            'score':       score,
            'error_pct':   round(error_pct, 1),
            'true_ratio':  round(true_ratio, 3),
        })

    async def finish_match(self, match):
        """Фінал: ELO + лут + повідомлення. Повністю на сервері."""
        profile1 = await self._get_profile(match.player1_id)
        is_win   = match.score_p1 > match.score_p2

        elo_svc  = EloService()
        d1, d2   = elo_svc.calculate(match.score_p1, match.score_p2,
                                      profile1.elo_rating,
                                      await self._get_p2_elo(match))
        profile1.elo_rating  += d1
        profile1.matches_played += 1

        loot_result = None
        if is_win and match.score_p1 >= match.threshold_score:
            match.is_chest_unlocked = True
            loot_svc    = LootService()
            craft       = loot_svc.roll(profile1, match.container_type)
            loot_result = {
                'item_id':      craft.dropped_item.id,
                'name':         craft.dropped_item.name,
                'rarity':       craft.dropped_item.rarity,
                'eq_class':     craft.dropped_item.equipment_class,
                'image_url':    craft.dropped_item.image_url,
                'was_duplicate': craft.was_duplicate,
                'rp_earned':    craft.rp_earned,
            }
            profile1.container_slots = max(0, profile1.container_slots - 1)

        profile1.consecutive_losses = 0 if is_win else profile1.consecutive_losses + 1
        profile1.update_rank()
        await self._save_profile(profile1)

        await self.channel_layer.group_send(self.group, {
            'type':              'broadcast.match_finish',
            'winner_id':         match.player1_id if is_win else match.player2_id,
            'score_p1':          match.score_p1,
            'score_p2':          match.score_p2,
            'is_chest_unlocked': match.is_chest_unlocked,
            'loot':              loot_result,
            'elo_delta':         d1,
            'new_elo':           profile1.elo_rating,
            'new_rank':          profile1.rank,
            'consecutive_losses': profile1.consecutive_losses,
        })

    # ── Симуляція бота ───────────────────────────
    async def run_bot_turn(self, match, round_type, round_state):
        """Бот має людську затримку + контрольовану точність."""
        accuracy = match.bot_accuracy   # 0.4-0.92
        delay    = self._bot_delay(accuracy)
        await asyncio.sleep(delay)

        score = 0
        if round_type == 'ASTRO_GUESSR':
            # Похибка від 5 до 150 км залежно від accuracy
            max_err  = 150 * (1 - accuracy)
            dist_km  = random.uniform(0, max_err)
            score    = max(0, round(100 * math.exp(-dist_km / 50.0)))
        elif round_type in ('FORENSIC_SOL', 'STAT_GUESSER', 'MISSION_STACK'):
            score = 35 if random.random() < accuracy else 0
        elif round_type == 'SCALE_MATCHER':
            score = 50 if random.random() < accuracy else (25 if random.random() < 0.5 else 0)

        await self._save_round_score(match, 'BOT', score)
        await self.channel_layer.group_send(self.group, {
            'type':    'broadcast.opponent_action',
            'hint':    'Опонент зробив вибір...',   # не розкриваємо деталі
            'score':   score,
        })

    def _bot_delay(self, accuracy: float) -> float:
        base   = 6.0 - accuracy * 4.0   # 1.6 .. 6.0 сек
        jitter = random.uniform(-0.5, 0.8)
        return max(1.0, base + jitter)
```

---

## 4. ELO-сервіс (`backend/game/services/elo_service.py`)

```python
# backend/game/services/elo_service.py

class EloService:
    K = 32   # коефіцієнт зміни

    def calculate(self, score_p1: int, score_p2: int,
                  elo1: int, elo2: int) -> tuple[int, int]:
        """Повертає (delta_p1, delta_p2)."""
        e1 = 1 / (1 + 10 ** ((elo2 - elo1) / 400))
        e2 = 1 - e1
        s1 = 1.0 if score_p1 > score_p2 else (0.5 if score_p1 == score_p2 else 0.0)
        s2 = 1.0 - s1
        d1 = round(self.K * (s1 - e1))
        d2 = round(self.K * (s2 - e2))
        return d1, d2
```

---

## 5. Anti-Frustration та Захисні Механіки

### 5.1. Cooldown артефактів (анти-повтор)
```python
# backend/game/services/matchmaker.py
from datetime import timedelta
from django.utils import timezone
from core.models import Artifact
from game.models import GameMatch

def pick_target_artifact(user_id: int) -> Artifact:
    """
    Вибирає артефакт якого гравець не бачив за останні 72 год.
    Якщо таких немає — повертає найстаріший з cooldown але з іншою маскою полів.
    """
    cutoff = timezone.now() - timedelta(hours=72)
    used_ids = GameMatch.objects.filter(
        player1_id=user_id,
        created_at__gte=cutoff
    ).values_list('target_artifact_id', flat=True)

    fresh = Artifact.objects.exclude(id__in=used_ids)
    if fresh.exists():
        return fresh.order_by('?').first()

    # Fallback — повертаємо з пулу, але маска полів буде інша
    return Artifact.objects.order_by('?').first()
```

### 5.2. Anti-Frustration: режим «Навчальна Експедиція»
```python
# backend/game/services/difficulty_service.py
from game.models import UserGameProfile

def get_match_config(profile: UserGameProfile) -> dict:
    """
    Повертає конфіг матчу з урахуванням захисних механік.
    """
    config = {
        'time_limit_sec':    15,
        'elo_protection':    False,
        'tutorial_mode':     False,
    }

    # Перші 5 матчів — ELO не списується за поразку
    if profile.matches_played < 5:
        config['elo_protection'] = True

    # 3+ поразки поспіль — Навчальна Експедиція
    if profile.consecutive_losses >= 3:
        config['tutorial_mode']   = True
        config['time_limit_sec']  = 25   # +10 сек
        config['elo_protection']  = True

    return config
```

---

## 6. REST API Ендпоінти (`backend/game/urls.py`)

| Метод | URL | Призначення | Auth |
|:--|:--|:--|:--|
| `GET` | `/api/game/profile/me/` | Мій ігровий профіль | ✅ |
| `GET` | `/api/game/profile/:callsign/` | Публічний профіль | Public |
| `POST` | `/api/game/match/create/` | Запуск пошуку матчу | ✅ |
| `GET` | `/api/game/match/:id/` | Статус матчу | ✅ |
| `POST` | `/api/game/container/craft/` | Синтез контейнера за RP | ✅ |
| `POST` | `/api/game/showcase/update/` | Оновити Полицю Спадщини | ✅ |
| `GET` | `/api/game/leaderboard/elo/` | Топ-100 за ELO | Public |
| `GET` | `/api/game/leaderboard/curator/` | Топ за Curator Index | Public |
| `GET` | `/api/game/inventory/` | Мій інвентар | ✅ |
| `WS` | `ws/game/duel/:match_id/` | Ігровий канал | ✅ |

---

## 7. WebSocket-протокол: повний словник подій

### Сервер → Клієнт
```jsonc
// Матч знайдено
{ "event": "game.matched",
  "opponent": { "callsign": "...", "elo": 1240, "rank": "...", "is_bot": false } }

// Старт раунду — БЕЗ ПРАВИЛЬНИХ ВІДПОВІДЕЙ
{ "event": "round.start",
  "round_index": 1,
  "round_type": "ASTRO_GUESSR",
  "time_limit_sec": 15,
  "payload": {
    "panorama_url":  "https://nasa.gov/.../panorama.jpg",   // тільки картинка
    "celestial_body": "mars",
    "radius_km":     3389.5,
    "wmts_tile_url": "https://trek.nasa.gov/..."
    // ← lat/lon цілі ВІДСУТНІ
  }
}

// Опонент відповів (без деталей)
{ "event": "round.opponent_acted", "hint": "Опонент зробив вибір..." }

// Результат раунду (правда розкривається ПІСЛЯ вибору обох)
{ "event": "round.result",
  "scores": { "p1": 85, "p2": 40 },
  "reveal": { "true_lat": -1.95, "true_lon": 354.47, "dist_km_p1": 8.3 },
  "fun_fact": "Opportunity проїхав 45.16 км — відстань Нью-Йорк–Бостон!" }

// Фінал матчу
{ "event": "match.finish",
  "winner_callsign": "DarkStar_UA",
  "scores": { "p1": 185, "p2": 120 },
  "is_chest_unlocked": true,
  "loot": {
    "name": "Лазерний спектрометр ChemCam",
    "rarity": "PROTOTYPE",
    "eq_class": "OPTICS_SENSORS",
    "image_url": "...",
    "was_duplicate": false,
    "rp_earned": 0
  },
  "elo_delta": 28,
  "new_elo": 1278,
  "new_rank": "MISSION_SPEC",
  "consecutive_losses": 0
}
```

### Клієнт → Сервер
```jsonc
// AstroGuessr
{ "action": "submit_guess",   "lat": -14.5, "lon": 175.4 }

// Scale Matcher
{ "action": "scale_lock",     "scale_factor": 1.45 }

// Buzzer (Тіньовий Проектор / Оптичний дешифратор)
{ "action": "buzzer_click",   "selected_id": "ingenuity" }

// Drag & Drop (Монтажний Ангар / Складання Капсули)
{ "action": "drag_drop",      "slot": "DESCENT_STAGE", "item_id": "sky-crane-mars2020" }
```

---

## 8. FSD-структура фронтенду (`web-client/src/`)

```
entities/
  game/
    model/  useMatchStore.ts       ← Zustand: стан WS, раунд, рахунок
    api/    game-repository.ts     ← REST: створення матчу, профіль
    ui/     ScoreHud.tsx           ← Верхній HUD з рахунком
  container/
    model/  useContainerStore.ts   ← Слоти [0..10], таймер накопичення
    ui/     ContainerSlot.tsx      ← Одна клітинка інвентарю
  inventory/
    model/  useInventoryStore.ts   ← Список предметів гравця
    ui/     ItemCard.tsx           ← Картка предмета з рідкістю/класом

features/
  matchmaking/
    ui/  MatchmakingModal.tsx      ← 5-8с пошук + прогрес-бар + кнопка «Відмінити»
  astro-guessr/
    ui/  AstroGuessr.tsx           ← Three.js PhotoSphere + wmts міні-карта + пін
  traverse-tracer/
    ui/  TraverseTracer.tsx        ← SVG-карта кратера + drag лінії між точками
  forensic-sol/
    ui/  ForensicSol.tsx           ← Графіки power_wh/dust_tau + вибір причини
  shadow-projector/
    ui/  ShadowProjector.tsx       ← Three.js сцена + повзунок Сонця + картки відповідей
  scale-matcher/
    ui/  ScaleMatcher.tsx          ← 3D-модель + слайдер + силует людини/авто
  mission-hangar/
    ui/  MissionHangar.tsx         ← 4 слоти + drag-and-drop іконок компонентів
  mission-stack/
    ui/  MissionStack.tsx          ← Вертикальний стек 5 рівнів + drag компонентів
  chest-opening/
    ui/  ChestOpenAnimation.tsx    ← Анімація відкриття + reveal картки + RP тост

widgets/
  battle-arena/
    ui/  BattleArena.tsx           ← Обгортка: HUD + активна міні-гра + таймер
  curator-showcase/
    ui/  CuratorShowcase.tsx       ← 5 showcase-слотів + мікро Three.js на hover
  planetary-terrarium/
    ui/  PlanetaryTerrarium.tsx    ← Жива Three.js куля + рухомі апарати
  leaderboard-table/
    ui/  LeaderboardTable.tsx      ← Топ-100 ELO | Curator | Weekly

pages/
  arena/        ← /arena
  profile/      ← /profile/:callsign
  leaderboards/ ← /leaderboard
```

---

## 9. Черговість реалізації (Sprint Plan)

| Sprint | Що робити | Результат |
|:--|:--|:--|
| **S-1** (3 дні) | `game/models.py` + міграції + Django Admin | БД готова, адмін вручну заповнює EquipmentItem |
| **S-2** (3 дні) | `LootService` + `EloService` + unit-тести | Loot-roll та ELO валідовані тестами |
| **S-3** (4 дні) | `DuelConsumer` WS + Zero-Knowledge раунди | WebSocket матч між двома вкладками |
| **S-4** (3 дні) | Bot simulation + Anti-frustration + Cooldown | PvE матч з адаптивним ботом |
| **S-5** (5 днів) | Фронтенд: matchmaking + 3 перші міні-ігри (AstroGuessr, ForensicSol, MissionHangar) | Перший повний матч |
| **S-6** (4 дні) | Фронтенд: ChestOpenAnimation + ContainerSlots + InventoryItemCard | Відкриття контейнера з анімацією |
| **S-7** (4 дні) | PlanetaryTerrarium + CuratorShowcase + PublicProfile | Публічна вітрина профілю |
| **S-8** (3 дні) | Решта міні-ігор (Shadow, Scale, Traverse, 3D-Engineer) | Повний пул з 9 ігор |
| **S-9** (2 дні) | Leaderboard + Pity + Guest-to-OAuth flow | Готово до бета-тесту |

> [!TIP]
> Для старту S-1 достатньо мати 20+ EquipmentItem записів у Django Admin.  
> Вся логіка гри не залежить від кількості предметів — додаємо контент поступово.

> [!CAUTION]
> **Не запускати публічний PvP до S-4** — без бота і anti-frustration новачки підуть після першого матчу.
