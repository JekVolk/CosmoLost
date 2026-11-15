from game.models import UserGameProfile


def get_match_config(profile: UserGameProfile) -> dict:
    """
    Returns dynamic matchmaking / round configuration based on player experience
    and loss streaks.
    """
    config = {'time_limit_sec': 15, 'elo_protection': False, 'tutorial_mode': False}
    if profile.matches_played < 5:
        config['elo_protection'] = True
    if profile.consecutive_losses >= 3:
        config.update({'tutorial_mode': True, 'time_limit_sec': 25, 'elo_protection': True})
    return config
