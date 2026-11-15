from django.urls import path
from game import views

app_name = 'game'

urlpatterns = [
    path('profile/me/', views.MyProfileView.as_view(), name='profile-me'),
    path('profile/<str:callsign>/', views.PublicProfileView.as_view(), name='profile-detail'),
    path('containers/', views.ContainerSlotsView.as_view(), name='containers-list'),
    path('containers/daily/', views.DailyContainerClaimView.as_view(), name='containers-daily'),
    path('match/create/', views.MatchCreateView.as_view(), name='match-create'),
    path('match/<uuid:match_id>/', views.MatchStatusView.as_view(), name='match-status'),
    path('container/craft/', views.ContainerCraftView.as_view(), name='container-craft'),
    path('showcase/update/', views.ShowcaseUpdateView.as_view(), name='showcase-update'),
    path('leaderboard/elo/', views.LeaderboardEloView.as_view(), name='leaderboard-elo'),
    path('leaderboard/curator/', views.LeaderboardCuratorView.as_view(), name='leaderboard-curator'),
    path('inventory/', views.InventoryView.as_view(), name='inventory-list'),
    path('auth/google/done/', views.GoogleAuthCallbackView.as_view(), name='auth-google-done'),
]
