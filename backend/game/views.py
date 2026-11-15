from datetime import timedelta
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from social_core.actions import do_auth
from social_django.utils import psa

from core.models import Artifact
from game.models import (
    ContainerSlot,
    ContainerType,
    GameMatch,
    MatchStatus,
    UserGameProfile,
)
from game.serializers import (
    ContainerSlotSerializer,
    MatchCreateRequestSerializer,
    PrivateGameProfileSerializer,
    PublicGameProfileSerializer,
    PublicShowcaseItemSerializer,
    ShowcaseUpdateRequestSerializer,
    UserInventorySerializer,
)
from game.services.difficulty_service import get_match_config
from game.services.loot_service import LootService
from game.services.matchmaker import pick_target_artifact


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserGameProfile.objects.get_or_create(
            user=request.user,
            defaults={'callsign': request.user.username or f"user_{request.user.id}"},
        )
        profile.try_accrue_container()
        return Response(PrivateGameProfileSerializer(profile).data)


class PublicProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, callsign):
        profile = get_object_or_404(
            UserGameProfile.objects.select_related('user'),
            callsign=callsign,
        )
        if not profile.is_public:
            return Response({'detail': 'Профіль приховано'}, status=status.HTTP_403_FORBIDDEN)
        return Response(PublicGameProfileSerializer(profile).data)


class ContainerSlotsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserGameProfile.objects.get_or_create(
            user=request.user,
            defaults={'callsign': request.user.username or f"user_{request.user.id}"},
        )
        profile.try_accrue_container()

        slots = request.user.container_slots.all().order_by('slot_index')
        last_accrual = profile.last_container_accrual or profile.created_at
        next_fill_at = last_accrual + timedelta(hours=4)

        return Response({
            'slots': ContainerSlotSerializer(slots, many=True).data,
            'next_fill_at': next_fill_at.isoformat(),
        })


class DailyContainerClaimView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        with transaction.atomic():
            profile, _ = UserGameProfile.objects.select_for_update().get_or_create(
                user=request.user,
                defaults={'callsign': request.user.username or f"user_{request.user.id}"},
            )
            result = profile.claim_daily_login()
        return Response(result)


class InventoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = (
            request.user.inventory.select_related('equipment', 'equipment__artifact')
            .order_by('-acquired_at')
        )
        return Response(UserInventorySerializer(items, many=True).data)


class ShowcaseUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ShowcaseUpdateRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        slots_data = serializer.validated_data['slots']
        item_ids = [s['inventory_item_id'] for s in slots_data]

        with transaction.atomic():
            owned_items = {
                item.id: item
                for item in request.user.inventory.select_for_update().filter(id__in=item_ids)
            }
            if len(owned_items) != len(item_ids):
                return Response(
                    {'detail': 'One or more items do not belong to you or do not exist.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            request.user.inventory.filter(is_showcased=True).update(
                is_showcased=False,
                showcase_slot=None,
            )
            for s in slots_data:
                item = owned_items[s['inventory_item_id']]
                item.is_showcased = True
                item.showcase_slot = s['slot']
                item.save(update_fields=['is_showcased', 'showcase_slot'])

        showcase_items = (
            request.user.inventory.filter(is_showcased=True)
            .select_related('equipment', 'equipment__artifact')
            .order_by('showcase_slot')
        )
        return Response(PublicShowcaseItemSerializer(showcase_items, many=True).data)


class MatchCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MatchCreateRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        slot_index = serializer.validated_data['slot_index']

        # Check content requirements: at least 3 valid MVP payloads with coordinates
        valid_payloads_count = Artifact.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False,
        ).count()
        if valid_payloads_count < 3:
            return Response({'detail': 'insufficient_round_content'}, status=status.HTTP_409_CONFLICT)

        with transaction.atomic():
            slot = (
                ContainerSlot.objects.select_for_update()
                .filter(user=request.user, slot_index=slot_index)
                .first()
            )

            if not slot:
                return Response({'detail': 'Слот не знайдено.'}, status=status.HTTP_404_NOT_FOUND)
            if slot.is_reserved:
                return Response({'detail': 'Слот уже зарезервовано.'}, status=status.HTTP_409_CONFLICT)

            slot.is_reserved = True
            slot.save(update_fields=['is_reserved'])

            target_artifact = pick_target_artifact(request.user.id)
            profile, _ = UserGameProfile.objects.select_for_update().get_or_create(
                user=request.user,
                defaults={'callsign': request.user.username or f"user_{request.user.id}"},
            )
            config = get_match_config(profile)

            match = GameMatch.objects.create(
                player1=request.user,
                target_artifact=target_artifact,
                reserved_slot_p1=slot_index,
                status=MatchStatus.WAITING,
                is_bot_match=False,
                round_data={
                    'target_lat': getattr(target_artifact, 'latitude', 0.0),
                    'target_lon': getattr(target_artifact, 'longitude', 0.0),
                    'true_mass_kg': getattr(target_artifact, 'mass_kg', 185.0) or 185.0,
                },
            )

        return Response(
            {
                'match_id': str(match.id),
                'ws_url': f"/ws/game/duel/{match.id}/",
                'config': config,
            },
            status=status.HTTP_201_CREATED,
        )


class MatchStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, match_id):
        match = GameMatch.objects.filter(id=match_id).first()
        if not match or (match.player1_id != request.user.id and match.player2_id != request.user.id):
            return Response({'detail': 'Матч не знайдено.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'match_id': str(match.id),
            'status': match.status,
            'is_bot_match': match.is_bot_match,
            'score_p1': match.score_p1,
            'score_p2': match.score_p2,
            'winner_id': match.winner_id,
            'created_at': match.created_at.isoformat(),
        })


class ContainerCraftView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ctype = request.data.get('container_type', ContainerType.STANDARD)
        target_class = request.data.get('target_class', None)

        costs = {
            ContainerType.STANDARD: 100,
            ContainerType.CALIBRATED: 350,
            ContainerType.PROFILE: 500,
        }
        cost = costs.get(ctype, 100)

        with transaction.atomic():
            profile, _ = UserGameProfile.objects.select_for_update().get_or_create(
                user=request.user,
                defaults={'callsign': request.user.username or f"user_{request.user.id}"},
            )

            if profile.research_points < cost:
                return Response({'detail': 'Недостатньо RP'}, status=status.HTTP_400_BAD_REQUEST)

            profile.research_points -= cost
            profile.save(update_fields=['research_points'])
            craft = LootService().roll(profile, ctype, target_class or None)

        return Response({
            'item': {
                'name': craft.dropped_item.name,
                'rarity': craft.dropped_item.rarity,
                'eq_class': craft.dropped_item.equipment_class,
                'image_url': craft.dropped_item.image_url,
            },
            'was_duplicate': craft.was_duplicate,
            'rp_earned': craft.rp_earned,
            'rp_balance': profile.research_points,
        })


class LeaderboardEloView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        top = (
            UserGameProfile.objects.filter(is_public=True)
            .order_by('-elo_rating')[:100]
            .values('callsign', 'elo_rating', 'rank', 'matches_won')
        )
        return Response(list(top))


class LeaderboardCuratorView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        top = (
            UserGameProfile.objects.filter(is_public=True)
            .order_by('-curator_index')[:100]
            .values('callsign', 'curator_index', 'rank', 'matches_won')
        )
        return Response(list(top))


class GoogleAuthCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'OAuth failed'}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(request.user)
        profile, _ = UserGameProfile.objects.get_or_create(
            user=request.user,
            defaults={'callsign': request.user.username or f"user_{request.user.id}"},
        )
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'callsign': profile.callsign,
        })

    def post(self, request):
        return self.get(request)


@never_cache
@csrf_exempt
@psa('social:complete')
def social_auth_begin(request, backend):
    """
    Support both POST and GET for social login initiation without CSRF blocks.
    Allows standard HTML <form method="POST" action="/auth/login/<backend>/"> from frontend.
    """
    return do_auth(request.backend, redirect_name=REDIRECT_FIELD_NAME, user=request.user)

