from rest_framework import serializers
from game.models import (
    ContainerSlot,
    EquipmentItem,
    UserGameProfile,
    UserInventoryItem,
)


class EquipmentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentItem
        fields = ['id', 'name', 'description', 'equipment_class', 'rarity', 'image_url']


class UserInventorySerializer(serializers.ModelSerializer):
    equipment = EquipmentItemSerializer(read_only=True)

    class Meta:
        model = UserInventoryItem
        fields = ['id', 'equipment', 'acquired_at', 'is_showcased', 'showcase_slot']


class PublicShowcaseItemSerializer(serializers.ModelSerializer):
    equipment = EquipmentItemSerializer(read_only=True)
    artifact_location = serializers.SerializerMethodField()

    def get_artifact_location(self, obj):
        artifact = getattr(obj.equipment, 'artifact', None)
        if not artifact or artifact.latitude is None or artifact.longitude is None:
            return None
        return {'latitude': artifact.latitude, 'longitude': artifact.longitude}

    class Meta:
        model = UserInventoryItem
        fields = ['equipment', 'artifact_location']


class PrivateGameProfileSerializer(serializers.ModelSerializer):
    inventory_count = serializers.SerializerMethodField()
    win_rate = serializers.SerializerMethodField()
    container_count = serializers.SerializerMethodField()

    def get_inventory_count(self, obj):
        return obj.user.inventory.count()

    def get_win_rate(self, obj):
        if obj.matches_played == 0:
            return 0
        return round(obj.matches_won / obj.matches_played * 100, 1)

    def get_container_count(self, obj):
        return obj.user.container_slots.count()

    class Meta:
        model = UserGameProfile
        fields = [
            'callsign',
            'bio',
            'avatar_frame',
            'favorite_planet',
            'elo_rating',
            'rank',
            'curator_index',
            'container_count',
            'research_points',
            'matches_played',
            'matches_won',
            'current_win_streak',
            'is_public',
            'inventory_count',
            'win_rate',
        ]


class PublicGameProfileSerializer(serializers.ModelSerializer):
    collection_count = serializers.SerializerMethodField()
    showcase = serializers.SerializerMethodField()

    def get_collection_count(self, obj):
        return obj.user.inventory.count()

    def get_showcase(self, obj):
        items = (
            obj.user.inventory.filter(is_showcased=True)
            .select_related('equipment', 'equipment__artifact')
            .order_by('showcase_slot')[:5]
        )
        return PublicShowcaseItemSerializer(items, many=True).data

    class Meta:
        model = UserGameProfile
        fields = ['callsign', 'avatar_frame', 'rank', 'collection_count', 'showcase']


class ContainerSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContainerSlot
        fields = ['slot_index', 'container_type', 'filled_at', 'seal_progress', 'is_reserved']


class ShowcaseSlotInputSerializer(serializers.Serializer):
    inventory_item_id = serializers.IntegerField(required=True)
    slot = serializers.IntegerField(required=True, min_value=1, max_value=5)


class ShowcaseUpdateRequestSerializer(serializers.Serializer):
    slots = serializers.ListField(
        child=ShowcaseSlotInputSerializer(),
        required=True,
        max_length=5,
    )

    def validate_slots(self, value):
        slots_seen = set()
        items_seen = set()
        for item in value:
            slot_num = item['slot']
            item_id = item['inventory_item_id']
            if slot_num in slots_seen:
                raise serializers.ValidationError(f"Duplicate showcase slot '{slot_num}' in request.")
            if item_id in items_seen:
                raise serializers.ValidationError(f"Duplicate inventory item '{item_id}' in request.")
            slots_seen.add(slot_num)
            items_seen.add(item_id)
        return value


class MatchCreateRequestSerializer(serializers.Serializer):
    slot_index = serializers.IntegerField(required=True, min_value=0, max_value=9)
