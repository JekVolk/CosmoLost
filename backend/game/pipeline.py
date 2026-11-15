from game.models import UserGameProfile


def create_game_profile(backend, user, response, *args, **kwargs):
    """Automatically create UserGameProfile during Google login / social auth."""
    if not hasattr(user, 'game_profile'):
        base = (response.get('given_name') or user.username or 'explorer')[:20]
        callsign = base.lower().replace(' ', '_')
        suffix = 1
        while UserGameProfile.objects.filter(callsign=callsign).exists():
            callsign = f'{base}_{suffix}'
            suffix += 1
        UserGameProfile.objects.create(
            user=user,
            callsign=callsign,
            avatar_frame='default',
        )
