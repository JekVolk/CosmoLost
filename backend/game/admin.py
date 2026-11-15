from django.contrib import admin
from unfold.admin import ModelAdmin
from game.models import (
    ContainerCraft,
    ContainerSlot,
    EquipmentItem,
    GameMatch,
    UserGameProfile,
    UserInventoryItem,
)


@admin.register(EquipmentItem)
class EquipmentItemAdmin(ModelAdmin):
    list_display = ['name', 'artifact', 'equipment_class', 'rarity', 'is_active']
    list_filter = ['rarity', 'equipment_class', 'is_active']
    search_fields = ['name', 'artifact__name']
    list_editable = ['rarity', 'is_active']


@admin.register(UserGameProfile)
class UserGameProfileAdmin(ModelAdmin):
    list_display = [
        'callsign',
        'elo_rating',
        'rank',
        'container_count',
        'research_points',
        'matches_played',
    ]
    search_fields = ['callsign', 'user__email']
    readonly_fields = ['pity_counter_historic', 'total_containers_opened']


@admin.register(GameMatch)
class GameMatchAdmin(ModelAdmin):
    list_display = [
        'id',
        'player1',
        'is_bot_match',
        'score_p1',
        'score_p2',
        'is_chest_unlocked_p1',
        'is_chest_unlocked_p2',
        'status',
        'created_at',
    ]
    list_filter = [
        'is_bot_match',
        'status',
        'is_chest_unlocked_p1',
        'is_chest_unlocked_p2',
    ]


@admin.register(ContainerCraft)
class ContainerCraftAdmin(ModelAdmin):
    list_display = [
        'user',
        'container_type',
        'dropped_item',
        'was_duplicate',
        'rp_earned',
        'opened_at',
    ]
    list_filter = ['container_type', 'was_duplicate']


@admin.register(ContainerSlot)
class ContainerSlotAdmin(ModelAdmin):
    list_display = ['user', 'slot_index', 'container_type', 'filled_at', 'is_reserved']
    list_filter = ['container_type', 'is_reserved']


@admin.register(UserInventoryItem)
class UserInventoryItemAdmin(ModelAdmin):
    list_display = ['user', 'equipment', 'acquired_at', 'is_showcased', 'showcase_slot']
    list_filter = ['is_showcased']
