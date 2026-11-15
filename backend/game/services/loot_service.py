import random
from django.db import transaction
from game.models import (
    ContainerCraft,
    ContainerType,
    EquipmentItem,
    EquipmentRarity,
    UserGameProfile,
    UserInventoryItem,
)

DUPLICATE_RP_MAP = {
    EquipmentRarity.SCRAP: 5,
    EquipmentRarity.STANDARD: 15,
    EquipmentRarity.SPECIALIZED: 50,
    EquipmentRarity.HISTORIC: 150,
}


class LootService:
    def _build_weights(self, profile: UserGameProfile, container_type: str) -> dict[str, float]:
        """
        Calculates rarity drop weights based on container type, pity counter,
        and first-5-containers WOW effect.
        """
        # Hard pity: guaranteed Historic after 60 non-historic drops
        if profile.pity_counter_historic >= 60:
            return {EquipmentRarity.HISTORIC: 100.0}

        if container_type == ContainerType.CALIBRATED:
            return {
                EquipmentRarity.SCRAP: 0.0,
                EquipmentRarity.STANDARD: 0.0,
                EquipmentRarity.SPECIALIZED: 85.0,
                EquipmentRarity.HISTORIC: 15.0,
            }

        if container_type == ContainerType.PROFILE:
            return {
                EquipmentRarity.SCRAP: 0.0,
                EquipmentRarity.STANDARD: 20.0,
                EquipmentRarity.SPECIALIZED: 65.0,
                EquipmentRarity.HISTORIC: 15.0,
            }

        # Standard / Daily container:
        # First 5 containers: WOW-effect with elevated Specialized chance
        if profile.total_containers_opened < 5:
            return {
                EquipmentRarity.SCRAP: 20.0,
                EquipmentRarity.STANDARD: 38.0,
                EquipmentRarity.SPECIALIZED: 40.0,
                EquipmentRarity.HISTORIC: 2.0,
            }

        # Normal standard distribution
        return {
            EquipmentRarity.SCRAP: 45.0,
            EquipmentRarity.STANDARD: 40.0,
            EquipmentRarity.SPECIALIZED: 13.0,
            EquipmentRarity.HISTORIC: 2.0,
        }

    def _weighted_choice(self, weights: dict[str, float]) -> str:
        active_items = [(k, v) for k, v in weights.items() if v > 0]
        if not active_items:
            return EquipmentRarity.STANDARD
        keys, vals = zip(*active_items)
        return random.choices(keys, weights=vals, k=1)[0]

    def _pick_item(self, rarity: str, target_class: str | None = None) -> EquipmentItem:
        qs = EquipmentItem.objects.filter(rarity=rarity, is_active=True)
        if target_class:
            class_qs = qs.filter(equipment_class=target_class)
            if class_qs.exists():
                return class_qs.order_by('?').first()
        item = qs.order_by('?').first()
        if not item:
            # Fallback to any active equipment item if test catalog is sparse
            item = EquipmentItem.objects.filter(is_active=True).order_by('?').first()
        return item

    def _update_pity(self, profile: UserGameProfile, rarity: str):
        if rarity == EquipmentRarity.HISTORIC:
            profile.pity_counter_historic = 0
        else:
            profile.pity_counter_historic += 1

    def roll(
        self,
        profile: UserGameProfile,
        container_type: str,
        target_class: str | None = None,
    ) -> ContainerCraft:
        """
        Executes container roll, checks duplicate status, awards RP on duplicate,
        updates pity counters, and persists inventory and craft history.
        """
        with transaction.atomic():
            weights = self._build_weights(profile, container_type)
            chosen_rarity = self._weighted_choice(weights)
            item = self._pick_item(chosen_rarity, target_class)

            is_owned = UserInventoryItem.objects.filter(
                user=profile.user,
                equipment=item,
            ).exists()

            if is_owned:
                was_duplicate = True
                rp_earned = DUPLICATE_RP_MAP.get(item.rarity, 15)
                profile.research_points += rp_earned
            else:
                was_duplicate = False
                rp_earned = 0
                UserInventoryItem.objects.create(
                    user=profile.user,
                    equipment=item,
                )

            self._update_pity(profile, item.rarity)
            profile.total_containers_opened += 1
            profile.save(
                update_fields=[
                    'research_points',
                    'pity_counter_historic',
                    'total_containers_opened',
                ]
            )

            craft = ContainerCraft.objects.create(
                user=profile.user,
                container_type=container_type,
                dropped_item=item,
                was_duplicate=was_duplicate,
                rp_earned=rp_earned,
            )
            return craft
