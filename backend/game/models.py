import uuid
from datetime import datetime, timedelta, timezone as dt_timezone
from django.conf import settings
from django.db import models, transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class EquipmentRarity(models.TextChoices):
    SCRAP = 'SCRAP', _('Scrap')
    STANDARD = 'STANDARD', _('Standard')
    SPECIALIZED = 'SPECIALIZED', _('Specialized')
    HISTORIC = 'HISTORIC', _('Historic')


class EquipmentClass(models.TextChoices):
    OPTICS_SENSORS = 'OPTICS_SENSORS', _('Optics & Sensors')
    POWER_PROPULSION = 'POWER_PROPULSION', _('Power & Propulsion')
    CHASSIS_STRUCTURE = 'CHASSIS_STRUCTURE', _('Chassis & Structure')
    COMMUNICATIONS = 'COMMUNICATIONS', _('Communications')
    SCIENCE_PAYLOAD = 'SCIENCE_PAYLOAD', _('Science Payload')


class ContainerType(models.TextChoices):
    DAILY = 'DAILY', _('Daily')
    STANDARD = 'STANDARD', _('Standard')
    CALIBRATED = 'CALIBRATED', _('Calibrated')
    PROFILE = 'PROFILE', _('Profile')


class MatchStatus(models.TextChoices):
    WAITING = 'WAITING', _('Waiting')
    IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
    FINISHED = 'FINISHED', _('Finished')
    CANCELLED = 'CANCELLED', _('Cancelled')


class UserGameProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='game_profile',
    )
    callsign = models.CharField(max_length=50, unique=True, db_index=True)
    bio = models.TextField(blank=True, default='')
    avatar_frame = models.CharField(max_length=50, default='default')
    favorite_planet = models.CharField(max_length=50, default='mars')
    elo_rating = models.IntegerField(default=1000, db_index=True)
    rank = models.CharField(max_length=50, default='CADET')
    curator_index = models.IntegerField(default=0, db_index=True)
    research_points = models.IntegerField(default=0)
    matches_played = models.IntegerField(default=0)
    matches_won = models.IntegerField(default=0)
    current_win_streak = models.IntegerField(default=0)
    consecutive_losses = models.IntegerField(default=0)
    is_public = models.BooleanField(default=True, db_index=True)

    pity_counter_historic = models.IntegerField(default=0)
    total_containers_opened = models.IntegerField(default=0)

    last_daily_claim = models.DateTimeField(null=True, blank=True)
    last_container_accrual = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_game_profiles'
        verbose_name = _('User Game Profile')
        verbose_name_plural = _('User Game Profiles')

    def __str__(self):
        return f"{self.callsign} (ELO: {self.elo_rating})"

    @property
    def container_count(self) -> int:
        return self.user.container_slots.count()

    def try_accrue_container(self):
        """Accrues 1 standard container slot every 4 hours if capacity < 10."""
        now = timezone.now()
        existing_slots = list(self.user.container_slots.values_list('slot_index', flat=True))
        if len(existing_slots) >= 10:
            return

        last_accrual = self.last_container_accrual or self.created_at
        if now - last_accrual >= timedelta(hours=4):
            # Find lowest free slot index
            free_slot = next(i for i in range(10) if i not in existing_slots)
            with transaction.atomic():
                ContainerSlot.objects.create(
                    user=self.user,
                    slot_index=free_slot,
                    container_type=ContainerType.STANDARD,
                )
                self.last_container_accrual = now
                self.save(update_fields=['last_container_accrual'])

    def claim_daily_login(self) -> dict:
        """
        Processes daily login reward:
        returns dict with status: 'claimed' | 'pending_space' | 'already_claimed'
        and UTC expires_at.
        """
        now = timezone.now()
        # Next UTC midnight
        tomorrow = now.date() + timedelta(days=1)
        next_utc_midnight = datetime(
            tomorrow.year, tomorrow.month, tomorrow.day, tzinfo=dt_timezone.utc
        )

        if self.last_daily_claim and self.last_daily_claim.date() == now.date():
            return {
                'status': 'already_claimed',
                'expires_at': next_utc_midnight.isoformat(),
            }

        existing_slots = list(self.user.container_slots.values_list('slot_index', flat=True))
        if len(existing_slots) >= 10:
            return {
                'status': 'pending_space',
                'expires_at': next_utc_midnight.isoformat(),
            }

        free_slot = next(i for i in range(10) if i not in existing_slots)
        with transaction.atomic():
            ContainerSlot.objects.create(
                user=self.user,
                slot_index=free_slot,
                container_type=ContainerType.DAILY,
            )
            self.last_daily_claim = now
            self.save(update_fields=['last_daily_claim'])

        return {
            'status': 'claimed',
            'expires_at': next_utc_midnight.isoformat(),
        }


class EquipmentItem(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    artifact = models.ForeignKey(
        'core.Artifact',
        on_delete=models.CASCADE,
        related_name='equipment_items',
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    equipment_class = models.CharField(max_length=50, choices=EquipmentClass.choices)
    rarity = models.CharField(max_length=50, choices=EquipmentRarity.choices)
    image_url = models.URLField(max_length=500, blank=True, default='')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'equipment_items'
        verbose_name = _('Equipment Item')
        verbose_name_plural = _('Equipment Items')
        ordering = ['rarity', 'name']

    def __str__(self):
        return f"{self.name} [{self.rarity}] ({self.artifact_id})"


class UserInventoryItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='inventory',
    )
    equipment = models.ForeignKey(
        EquipmentItem,
        on_delete=models.CASCADE,
        related_name='inventory_entries',
    )
    acquired_at = models.DateTimeField(auto_now_add=True)
    is_showcased = models.BooleanField(default=False)
    showcase_slot = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        db_table = 'user_inventory_items'
        verbose_name = _('User Inventory Item')
        verbose_name_plural = _('User Inventory Items')
        constraints = [
            models.UniqueConstraint(fields=['user', 'equipment'], name='unique_user_equipment'),
        ]

    def __str__(self):
        return f"{self.user_id} owns {self.equipment_id}"


class ContainerSlot(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='container_slots',
    )
    slot_index = models.PositiveSmallIntegerField()
    container_type = models.CharField(
        max_length=50,
        choices=ContainerType.choices,
        default=ContainerType.STANDARD,
    )
    filled_at = models.DateTimeField(auto_now_add=True)
    seal_progress = models.IntegerField(default=0)
    is_reserved = models.BooleanField(default=False)

    class Meta:
        db_table = 'container_slots'
        verbose_name = _('Container Slot')
        verbose_name_plural = _('Container Slots')
        constraints = [
            models.UniqueConstraint(fields=['user', 'slot_index'], name='unique_user_slot_index'),
        ]
        ordering = ['slot_index']

    def __str__(self):
        return f"{self.user_id} - Slot {self.slot_index} ({self.container_type})"


class ContainerCraft(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='container_crafts',
    )
    container_type = models.CharField(max_length=50, choices=ContainerType.choices)
    dropped_item = models.ForeignKey(
        EquipmentItem,
        on_delete=models.CASCADE,
        related_name='craft_drops',
    )
    was_duplicate = models.BooleanField(default=False)
    rp_earned = models.IntegerField(default=0)
    opened_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'container_crafts'
        verbose_name = _('Container Craft')
        verbose_name_plural = _('Container Crafts')
        ordering = ['-opened_at']

    def __str__(self):
        return f"{self.user_id} opened {self.dropped_item_id} ({'DUP' if self.was_duplicate else 'NEW'})"


class GameMatch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='matches_as_p1',
    )
    player2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='matches_as_p2',
    )
    target_artifact = models.ForeignKey(
        'core.Artifact',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='game_matches',
    )
    is_bot_match = models.BooleanField(default=False)
    status = models.CharField(
        max_length=50,
        choices=MatchStatus.choices,
        default=MatchStatus.WAITING,
        db_index=True,
    )
    score_p1 = models.IntegerField(default=0)
    score_p2 = models.IntegerField(default=0)
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='matches_won',
    )
    is_chest_unlocked_p1 = models.BooleanField(default=False)
    is_chest_unlocked_p2 = models.BooleanField(default=False)
    round_data = models.JSONField(default=dict, blank=True)
    reserved_slot_p1 = models.PositiveSmallIntegerField(null=True, blank=True)
    reserved_slot_p2 = models.PositiveSmallIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'game_matches'
        verbose_name = _('Game Match')
        verbose_name_plural = _('Game Matches')
        ordering = ['-created_at']

    def __str__(self):
        return f"Match {self.id} [{self.status}] ({self.player1_id} vs {self.player2_id or 'Bot'})"
