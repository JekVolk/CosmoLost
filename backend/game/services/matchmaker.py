from datetime import timedelta
from django.utils import timezone
from core.models import Artifact
from game.models import GameMatch


def pick_target_artifact(user_id: int) -> Artifact | None:
    """
    Selects an artifact that the player has not seen within the last 72 hours.
    Uses ORM exclusion subquery without raw SQL.
    """
    cutoff = timezone.now() - timedelta(hours=72)
    used_ids = GameMatch.objects.filter(
        player1_id=user_id,
        created_at__gte=cutoff,
    ).values_list('target_artifact_id', flat=True)

    fresh = Artifact.objects.exclude(id__in=used_ids).order_by('?')
    if fresh.exists():
        return fresh.first()
    return Artifact.objects.order_by('?').first()


def build_bot_accuracy(player_elo: int) -> float:
    """Bot accuracy scales from 0.40 up to 0.92 based on player ELO."""
    if player_elo < 1000:
        return 0.40 + (player_elo / 1000) * 0.10
    if player_elo < 1500:
        return 0.50 + ((player_elo - 1000) / 500) * 0.20
    if player_elo < 2000:
        return 0.70 + ((player_elo - 1500) / 500) * 0.15
    return 0.92
