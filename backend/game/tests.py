import json
import unittest.mock as mock
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from asgiref.sync import async_to_sync
from channels.testing import WebsocketCommunicator

from core.models import Artifact, CelestialBody, Mission
from game.consumers import DuelConsumer
from game.models import (
    ContainerCraft,
    ContainerSlot,
    ContainerType,
    EquipmentClass,
    EquipmentItem,
    EquipmentRarity,
    GameMatch,
    MatchStatus,
    UserGameProfile,
    UserInventoryItem,
)
from game.pipeline import create_game_profile
from game.services.difficulty_service import get_match_config
from game.services.elo_service import EloService
from game.services.loot_service import LootService
from game.services.matchmaker import build_bot_accuracy, pick_target_artifact

User = get_user_model()


class LootServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester_loot', password='password123')
        self.profile = UserGameProfile.objects.create(user=self.user, callsign='tester_loot')

        self.body = CelestialBody.objects.create(
            id='mars',
            name='Mars',
            radius_km=3389.5,
            gravity_ms2=3.72,
            coordinate_system_type='PLANETOCENTRIC_360',
            wmts_tile_url='',
        )
        self.mission = Mission.objects.create(
            id='mars-2020',
            nssdca_id='2020-052A',
            name='Mars 2020',
            agency='NASA',
            summary='',
        )
        self.artifact = Artifact.objects.create(
            id='perseverance',
            mission=self.mission,
            celestial_body=self.body,
            name='Perseverance',
            artifact_type='ROVER',
            operational_status='ACTIVE',
            latitude=18.4,
            longitude=77.4,
            location_name='Jezero Crater',
            first_person_monologue='...',
            mass_kg=1025.0,
        )

        for rarity in EquipmentRarity.values:
            EquipmentItem.objects.create(
                id=f'item_{rarity}',
                artifact=self.artifact,
                name=f'Item {rarity}',
                description='',
                equipment_class=EquipmentClass.OPTICS_SENSORS,
                rarity=rarity,
            )

    def test_first_5_containers_wow_effect(self):
        """First 5 containers have boosted chance for Specialized."""
        svc = LootService()
        weights = svc._build_weights(self.profile, ContainerType.STANDARD)
        self.assertEqual(weights['SCRAP'], 20.0)
        self.assertEqual(weights['SPECIALIZED'], 40.0)

    def test_pity_hard_historic(self):
        """Hard pity guarantees Historic after 60 non-historic drops."""
        self.profile.total_containers_opened = 10
        self.profile.pity_counter_historic = 60
        svc = LootService()
        weights = svc._build_weights(self.profile, ContainerType.STANDARD)
        self.assertEqual(weights, {EquipmentRarity.HISTORIC: 100.0})

    def test_calibrated_no_scrap(self):
        """Calibrated containers contain 0 Scrap and 0 Standard."""
        self.profile.total_containers_opened = 10
        weights = LootService()._build_weights(self.profile, ContainerType.CALIBRATED)
        self.assertEqual(weights.get('SCRAP', 0), 0.0)
        self.assertEqual(weights.get('STANDARD', 0), 0.0)
        self.assertEqual(weights['SPECIALIZED'], 85.0)

    def test_profile_container_weights(self):
        """Profile container distribution."""
        self.profile.total_containers_opened = 10
        weights = LootService()._build_weights(self.profile, ContainerType.PROFILE)
        self.assertEqual(weights.get('SCRAP', 0), 0.0)
        self.assertEqual(weights['STANDARD'], 20.0)
        self.assertEqual(weights['SPECIALIZED'], 65.0)
        self.assertEqual(weights['HISTORIC'], 15.0)

    def test_duplicate_gives_rp(self):
        """Duplicates grant RP based on rarity and increment container counter."""
        item = EquipmentItem.objects.get(id='item_STANDARD')
        UserInventoryItem.objects.create(user=self.profile.user, equipment=item)
        self.profile.total_containers_opened = 10

        with mock.patch.object(LootService, '_pick_item', return_value=item):
            with mock.patch.object(LootService, '_weighted_choice', return_value=EquipmentRarity.STANDARD):
                craft = LootService().roll(self.profile, ContainerType.STANDARD)

        self.assertTrue(craft.was_duplicate)
        self.assertEqual(craft.rp_earned, 15)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.research_points, 15)
        self.assertEqual(self.profile.total_containers_opened, 11)

    def test_roll_new_item(self):
        """Rolling a new item adds it to user inventory without duplicate RP."""
        item = EquipmentItem.objects.get(id='item_SPECIALIZED')
        with mock.patch.object(LootService, '_pick_item', return_value=item):
            with mock.patch.object(LootService, '_weighted_choice', return_value=EquipmentRarity.SPECIALIZED):
                craft = LootService().roll(self.profile, ContainerType.STANDARD)

        self.assertFalse(craft.was_duplicate)
        self.assertEqual(craft.rp_earned, 0)
        self.assertTrue(UserInventoryItem.objects.filter(user=self.user, equipment=item).exists())


class EloServiceTest(TestCase):
    def test_winner_gains_loser_loses(self):
        d1, d2 = EloService().calculate(150, 80, 1000, 1000)
        self.assertGreater(d1, 0)
        self.assertLess(d2, 0)
        self.assertEqual(d1 + d2, 0)

    def test_draw_equal_elo(self):
        d1, d2 = EloService().calculate(100, 100, 1200, 1200)
        self.assertEqual(d1, 0)
        self.assertEqual(d2, 0)


class MatchmakerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester_mm', password='password123')
        self.body = CelestialBody.objects.create(
            id='moon', name='Moon', radius_km=1737.4, gravity_ms2=1.62,
            coordinate_system_type='PLANETOCENTRIC_360', wmts_tile_url='',
        )
        self.mission = Mission.objects.create(
            id='apollo-11', nssdca_id='1969-059A', name='Apollo 11', agency='NASA', summary='',
        )
        self.art1 = Artifact.objects.create(
            id='art_1', mission=self.mission, celestial_body=self.body,
            name='Artifact 1', artifact_type='LANDER', operational_status='COMPLETED',
            latitude=0.67, longitude=23.47, location_name='Tranquility',
        )
        self.art2 = Artifact.objects.create(
            id='art_2', mission=self.mission, celestial_body=self.body,
            name='Artifact 2', artifact_type='LANDER', operational_status='COMPLETED',
            latitude=1.0, longitude=20.0, location_name='Oceanus',
        )

    def test_pick_target_artifact_exclusion(self):
        """Artifact used in last 72h is excluded when fresh artifacts exist."""
        GameMatch.objects.create(
            player1=self.user,
            target_artifact=self.art1,
            created_at=timezone.now() - timedelta(hours=10),
        )
        chosen = pick_target_artifact(self.user.id)
        self.assertEqual(chosen.id, self.art2.id)

    def test_build_bot_accuracy_scaling(self):
        self.assertAlmostEqual(build_bot_accuracy(500), 0.45, places=2)
        self.assertAlmostEqual(build_bot_accuracy(1250), 0.60, places=2)
        self.assertAlmostEqual(build_bot_accuracy(1750), 0.775, places=2)
        self.assertEqual(build_bot_accuracy(2200), 0.92)


class DifficultyServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester_diff', password='password123')
        self.profile = UserGameProfile.objects.create(user=self.user, callsign='tester_diff')

    def test_new_player_elo_protection(self):
        self.profile.matches_played = 2
        config = get_match_config(self.profile)
        self.assertTrue(config['elo_protection'])
        self.assertFalse(config['tutorial_mode'])

    def test_losing_streak_tutorial(self):
        self.profile.matches_played = 10
        self.profile.consecutive_losses = 3
        config = get_match_config(self.profile)
        self.assertTrue(config['tutorial_mode'])
        self.assertEqual(config['time_limit_sec'], 25)
        self.assertTrue(config['elo_protection'])


class PipelineTest(TestCase):
    def test_create_game_profile_generation(self):
        u = User.objects.create_user(username='cosmonaut', email='cosmo@example.com')
        create_game_profile(None, u, {'given_name': 'Yuri Gagarin'})
        self.assertTrue(hasattr(u, 'game_profile'))
        self.assertEqual(u.game_profile.callsign, 'yuri_gagarin')


class GameApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='pilot', password='secretpassword')
        self.profile = UserGameProfile.objects.create(
            user=self.user,
            callsign='pilot_alpha',
            elo_rating=1100,
            rank='ENSIGN',
            research_points=250,
            is_public=True,
        )

        self.other_user = User.objects.create_user(username='stranger', password='secretpassword')
        self.other_profile = UserGameProfile.objects.create(
            user=self.other_user,
            callsign='shadow_pilot',
            elo_rating=1300,
            is_public=False,
        )

        self.body = CelestialBody.objects.create(
            id='earth', name='Earth', radius_km=6371.0, gravity_ms2=9.81,
            coordinate_system_type='PLANETOCENTRIC_360', wmts_tile_url='',
        )
        self.mission = Mission.objects.create(
            id='vostok', nssdca_id='1961-012A', name='Vostok 1', agency='OKB-1', summary='',
        )
        self.artifact = Artifact.objects.create(
            id='vostok_capsule', mission=self.mission, celestial_body=self.body,
            name='Vostok Capsule', artifact_type='LANDER', operational_status='COMPLETED',
            latitude=51.27, longitude=45.99, location_name='Saratov', mass_kg=2460.0,
        )
        self.artifact2 = Artifact.objects.create(
            id='voskhod_capsule', mission=self.mission, celestial_body=self.body,
            name='Voskhod Capsule', artifact_type='LANDER', operational_status='COMPLETED',
            latitude=50.0, longitude=40.0, location_name='Step', mass_kg=2500.0,
        )
        self.artifact3 = Artifact.objects.create(
            id='soyuz_capsule', mission=self.mission, celestial_body=self.body,
            name='Soyuz Capsule', artifact_type='LANDER', operational_status='COMPLETED',
            latitude=48.0, longitude=42.0, location_name='Baikonur', mass_kg=2800.0,
        )
        self.equipment = EquipmentItem.objects.create(
            id='vostok_radio', artifact=self.artifact, name='Vostok Radio',
            description='Radio module', equipment_class=EquipmentClass.COMMUNICATIONS,
            rarity=EquipmentRarity.STANDARD,
        )

    def test_my_profile_requires_auth(self):
        res = self.client.get('/api/game/profile/me/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_my_profile_authenticated(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get('/api/game/profile/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(data['callsign'], 'pilot_alpha')
        self.assertEqual(data['research_points'], 250)
        self.assertEqual(data['elo_rating'], 1100)

    def test_public_profile_accessible(self):
        res = self.client.get(f'/api/game/profile/{self.profile.callsign}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(data['callsign'], 'pilot_alpha')
        self.assertNotIn('research_points', data)
        self.assertNotIn('email', data)

    def test_public_profile_hidden_returns_403(self):
        res = self.client.get(f'/api/game/profile/{self.other_profile.callsign}/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_container_slots_endpoint(self):
        self.client.force_authenticate(user=self.user)
        ContainerSlot.objects.create(
            user=self.user,
            slot_index=0,
            container_type=ContainerType.STANDARD,
        )
        res = self.client.get('/api/game/containers/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(len(data['slots']), 1)
        self.assertEqual(data['slots'][0]['slot_index'], 0)
        self.assertIn('next_fill_at', data)

    def test_daily_container_claim_flow(self):
        self.client.force_authenticate(user=self.user)

        # 1. Claim when slots available
        res1 = self.client.post('/api/game/containers/daily/', {}, format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(res1.json()['status'], 'claimed')

        # 2. Already claimed on same day
        res2 = self.client.post('/api/game/containers/daily/', {}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.json()['status'], 'already_claimed')

        # 3. Pending space when full (10 slots)
        self.profile.last_daily_claim = timezone.now() - timedelta(days=2)
        self.profile.save()
        for i in range(10):
            ContainerSlot.objects.get_or_create(user=self.user, slot_index=i)

        res3 = self.client.post('/api/game/containers/daily/', {}, format='json')
        self.assertEqual(res3.status_code, status.HTTP_200_OK)
        self.assertEqual(res3.json()['status'], 'pending_space')

    def test_inventory_listing(self):
        self.client.force_authenticate(user=self.user)
        UserInventoryItem.objects.create(user=self.user, equipment=self.equipment)
        res = self.client.get('/api/game/inventory/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['equipment']['id'], 'vostok_radio')

    def test_showcase_update_valid_and_ownership(self):
        self.client.force_authenticate(user=self.user)
        inv_item = UserInventoryItem.objects.create(user=self.user, equipment=self.equipment)

        # Invalid slot (> 5)
        res_bad = self.client.post(
            '/api/game/showcase/update/',
            {'slots': [{'inventory_item_id': inv_item.id, 'slot': 6}]},
            format='json',
        )
        self.assertEqual(res_bad.status_code, status.HTTP_400_BAD_REQUEST)

        # Foreign item id
        foreign_inv = UserInventoryItem.objects.create(user=self.other_user, equipment=self.equipment)
        res_foreign = self.client.post(
            '/api/game/showcase/update/',
            {'slots': [{'inventory_item_id': foreign_inv.id, 'slot': 1}]},
            format='json',
        )
        self.assertEqual(res_foreign.status_code, status.HTTP_400_BAD_REQUEST)

        # Valid update
        res_valid = self.client.post(
            '/api/game/showcase/update/',
            {'slots': [{'inventory_item_id': inv_item.id, 'slot': 1}]},
            format='json',
        )
        self.assertEqual(res_valid.status_code, status.HTTP_200_OK)
        inv_item.refresh_from_db()
        self.assertTrue(inv_item.is_showcased)
        self.assertEqual(inv_item.showcase_slot, 1)

    def test_showcase_update_duplicate_inventory_item(self):
        self.client.force_authenticate(user=self.user)
        inv_item = UserInventoryItem.objects.create(user=self.user, equipment=self.equipment)
        res = self.client.post(
            '/api/game/showcase/update/',
            {'slots': [
                {'inventory_item_id': inv_item.id, 'slot': 1},
                {'inventory_item_id': inv_item.id, 'slot': 2},
            ]},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_match_create_insufficient_payloads_returns_409(self):
        self.client.force_authenticate(user=self.user)
        slot = ContainerSlot.objects.create(user=self.user, slot_index=5, container_type=ContainerType.STANDARD)
        Artifact.objects.filter(id__in=[self.artifact2.id, self.artifact3.id]).delete()

        res = self.client.post('/api/game/match/create/', {'slot_index': 5}, format='json')
        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(res.json()['detail'], 'insufficient_round_content')
        slot.refresh_from_db()
        self.assertFalse(slot.is_reserved)

    def test_match_create_validation_and_creation(self):
        self.client.force_authenticate(user=self.user)

        # Slot not found
        res_nf = self.client.post('/api/game/match/create/', {'slot_index': 0}, format='json')
        self.assertEqual(res_nf.status_code, status.HTTP_404_NOT_FOUND)

        # Create slot
        slot = ContainerSlot.objects.create(user=self.user, slot_index=0, container_type=ContainerType.STANDARD)

        # Successful creation
        res = self.client.post('/api/game/match/create/', {'slot_index': 0}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.json()
        self.assertIn('match_id', data)
        self.assertIn('ws_url', data)
        slot.refresh_from_db()
        self.assertTrue(slot.is_reserved)

        # Trying to reserve already reserved slot gives 409
        res_conflict = self.client.post('/api/game/match/create/', {'slot_index': 0}, format='json')
        self.assertEqual(res_conflict.status_code, status.HTTP_409_CONFLICT)

    def test_match_status_participant_vs_stranger(self):
        match = GameMatch.objects.create(player1=self.user, target_artifact=self.artifact)

        # Participant
        self.client.force_authenticate(user=self.user)
        res_p = self.client.get(f'/api/game/match/{match.id}/')
        self.assertEqual(res_p.status_code, status.HTTP_200_OK)
        data = res_p.json()
        self.assertEqual(data['match_id'], str(match.id))
        self.assertNotIn('round_data', data)
        self.assertNotIn('target_lat', data)

        # Stranger
        self.client.force_authenticate(user=self.other_user)
        res_s = self.client.get(f'/api/game/match/{match.id}/')
        self.assertEqual(res_s.status_code, status.HTTP_404_NOT_FOUND)

    def test_container_craft_endpoint(self):
        self.client.force_authenticate(user=self.user)

        # Insufficient RP
        self.profile.research_points = 50
        self.profile.save()
        res_fail = self.client.post('/api/game/container/craft/', {'container_type': 'STANDARD'}, format='json')
        self.assertEqual(res_fail.status_code, status.HTTP_400_BAD_REQUEST)

        # Sufficient RP
        self.profile.research_points = 200
        self.profile.save()
        res_ok = self.client.post('/api/game/container/craft/', {'container_type': 'STANDARD'}, format='json')
        self.assertEqual(res_ok.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.research_points, 100)

    def test_leaderboards(self):
        res_elo = self.client.get('/api/game/leaderboard/elo/')
        self.assertEqual(res_elo.status_code, status.HTTP_200_OK)
        data = res_elo.json()
        # only public profile appears
        callsigns = [d['callsign'] for d in data]
        self.assertIn('pilot_alpha', callsigns)
        self.assertNotIn('shadow_pilot', callsigns)

        res_curator = self.client.get('/api/game/leaderboard/curator/')
        self.assertEqual(res_curator.status_code, status.HTTP_200_OK)

    def test_google_auth_callback(self):
        # Unauthenticated
        res_unauth = self.client.get('/api/game/auth/google/done/')
        self.assertEqual(res_unauth.status_code, status.HTTP_401_UNAUTHORIZED)

        # Authenticated
        self.client.force_authenticate(user=self.user)
        res_auth = self.client.get('/api/game/auth/google/done/')
        self.assertEqual(res_auth.status_code, status.HTTP_200_OK)
        data = res_auth.json()
        self.assertIn('access', data)
        self.assertIn('refresh', data)
        self.assertEqual(data['callsign'], 'pilot_alpha')

    def test_google_oauth2_login_get_redirects(self):
        res = self.client.get('/auth/login/google-oauth2/')
        self.assertEqual(res.status_code, 302)
        self.assertIn('accounts.google.com', res['Location'])

    def test_google_oauth2_login_post_redirects(self):
        res = self.client.post('/auth/login/google-oauth2/')
        self.assertEqual(res.status_code, 302)
        self.assertIn('accounts.google.com', res['Location'])


class WebSocketDuelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='ws_player1', password='password123')
        self.user2 = User.objects.create_user(username='ws_player2', password='password123')
        self.stranger = User.objects.create_user(username='ws_stranger', password='password123')

        self.body = CelestialBody.objects.create(
            id='mars_ws', name='Mars', radius_km=3389.5, gravity_ms2=3.72,
            coordinate_system_type='PLANETOCENTRIC_360', wmts_tile_url='',
        )
        self.mission = Mission.objects.create(
            id='mission_ws', nssdca_id='2020-052B', name='Mars Mission', agency='NASA', summary='',
        )
        self.artifact = Artifact.objects.create(
            id='art_ws', mission=self.mission, celestial_body=self.body,
            name='Mars Lander', artifact_type='LANDER', operational_status='ACTIVE',
            latitude=20.0, longitude=50.0, location_name='Chryse', mass_kg=300.0,
        )

        self.match = GameMatch.objects.create(
            player1=self.user,
            player2=self.user2,
            target_artifact=self.artifact,
            round_data={'target_lat': 20.0, 'target_lon': 50.0, 'true_mass_kg': 300.0},
        )

    def test_ws_unauthenticated_rejected(self):
        async def _run():
            communicator = WebsocketCommunicator(
                DuelConsumer.as_asgi(),
                f"/ws/game/duel/{self.match.id}/",
            )
            communicator.scope['url_route'] = {'kwargs': {'match_id': self.match.id}}
            communicator.scope['user'] = None
            connected, subprotocol = await communicator.connect()
            self.assertFalse(connected)
            await communicator.disconnect()

        async_to_sync(_run)()

    def test_ws_non_participant_rejected(self):
        async def _run():
            communicator = WebsocketCommunicator(
                DuelConsumer.as_asgi(),
                f"/ws/game/duel/{self.match.id}/",
            )
            communicator.scope['url_route'] = {'kwargs': {'match_id': self.match.id}}
            communicator.scope['user'] = self.stranger
            connected, subprotocol = await communicator.connect()
            self.assertFalse(connected)
            await communicator.disconnect()

        async_to_sync(_run)()

    def test_ws_connected_and_zero_knowledge_round_start(self):
        async def _run():
            comm1 = WebsocketCommunicator(
                DuelConsumer.as_asgi(),
                f"/ws/game/duel/{self.match.id}/",
            )
            comm1.scope['url_route'] = {'kwargs': {'match_id': self.match.id}}
            comm1.scope['user'] = self.user
            connected1, _ = await comm1.connect()
            self.assertTrue(connected1)

            comm2 = WebsocketCommunicator(
                DuelConsumer.as_asgi(),
                f"/ws/game/duel/{self.match.id}/",
            )
            comm2.scope['url_route'] = {'kwargs': {'match_id': self.match.id}}
            comm2.scope['user'] = self.user2
            connected2, _ = await comm2.connect()
            self.assertTrue(connected2)

            # Receive game.matched & round.start on comm1
            res_matched1 = await comm1.receive_json_from()
            self.assertEqual(res_matched1['event'], 'game.matched')
            res_round1 = await comm1.receive_json_from()
            self.assertEqual(res_round1['event'], 'round.start')
            # Verify Zero-Knowledge: no target_lat, target_lon, or true_mass_kg
            self.assertNotIn('target_lat', res_round1['payload'])
            self.assertNotIn('target_lon', res_round1['payload'])
            self.assertNotIn('true_mass_kg', res_round1['payload'])

            # Drain welcome events on comm2
            await comm2.receive_json_from()
            await comm2.receive_json_from()

            # Player 1 submits guess
            await comm1.send_json_to({
                'action': 'submit_guess',
                'latitude': 20.0,
                'longitude': 50.0,
            })

            # Player 1 receives answer accepted
            res_accepted1 = await comm1.receive_json_from()
            self.assertEqual(res_accepted1['event'], 'round.answer_accepted')

            # Player 2 receives opponent acted notice without score leakage
            res_opp = await comm2.receive_json_from()
            self.assertEqual(res_opp['event'], 'round.opponent_acted')
            self.assertNotIn('score', res_opp)

            # Player 2 submits guess
            await comm2.send_json_to({
                'action': 'submit_guess',
                'latitude': 20.0,
                'longitude': 50.0,
            })

            res_accepted2 = await comm2.receive_json_from()
            self.assertEqual(res_accepted2['event'], 'round.answer_accepted')

            # Player 1 receives notice that opponent acted
            res_opp_p1 = await comm1.receive_json_from()
            self.assertEqual(res_opp_p1['event'], 'round.opponent_acted')

            # Now both receive round result once both answered
            res_result1 = await comm1.receive_json_from()
            self.assertEqual(res_result1['event'], 'round.result')
            self.assertGreaterEqual(res_result1['score'], 90)

            res_result2 = await comm2.receive_json_from()
            self.assertEqual(res_result2['event'], 'round.result')
            self.assertGreaterEqual(res_result2['score'], 90)

            await comm1.disconnect()
            await comm2.disconnect()

        async_to_sync(_run)()

    def test_ws_bot_match_immediate_result(self):
        self.match.is_bot_match = True
        self.match.save()

        async def _run():
            comm = WebsocketCommunicator(
                DuelConsumer.as_asgi(),
                f"/ws/game/duel/{self.match.id}/",
            )
            comm.scope['url_route'] = {'kwargs': {'match_id': self.match.id}}
            comm.scope['user'] = self.user
            connected, _ = await comm.connect()
            self.assertTrue(connected)

            await comm.receive_json_from()  # game.matched
            await comm.receive_json_from()  # round.start

            await comm.send_json_to({
                'action': 'submit_guess',
                'latitude': 20.0,
                'longitude': 50.0,
            })

            res_accepted = await comm.receive_json_from()
            self.assertEqual(res_accepted['event'], 'round.answer_accepted')

            res_result = await comm.receive_json_from()
            self.assertEqual(res_result['event'], 'round.result')
            self.assertGreaterEqual(res_result['score'], 90)

            await comm.disconnect()

        async_to_sync(_run)()

    def test_ws_stat_guesser_flow(self):
        async def _run():
            communicator = WebsocketCommunicator(
                DuelConsumer.as_asgi(),
                f"/ws/game/duel/{self.match.id}/",
            )
            communicator.scope['url_route'] = {'kwargs': {'match_id': self.match.id}}
            communicator.scope['user'] = self.user
            connected, _ = await communicator.connect()
            self.assertTrue(connected)

            # Drain welcome events
            await communicator.receive_json_from()  # game.matched
            await communicator.receive_json_from()  # round.start

            # Check stat guesser with 6 items * 50 = 300 (balanced with 300kg)
            await communicator.send_json_to({
                'action': 'stat_guesser_check',
                'object_ids': ['1', '2', '3', '4', '5', '6'],
            })
            res_fb = await communicator.receive_json_from()
            self.assertEqual(res_fb['event'], 'stat_guesser_feedback')
            self.assertEqual(res_fb['result'], 'balanced')

            await communicator.disconnect()

        async_to_sync(_run)()

    def test_ws_unknown_action(self):
        async def _run():
            communicator = WebsocketCommunicator(
                DuelConsumer.as_asgi(),
                f"/ws/game/duel/{self.match.id}/",
            )
            communicator.scope['url_route'] = {'kwargs': {'match_id': self.match.id}}
            communicator.scope['user'] = self.user
            connected, _ = await communicator.connect()
            self.assertTrue(connected)

            # Drain welcome events
            await communicator.receive_json_from()
            await communicator.receive_json_from()

            # Send invalid action
            await communicator.send_json_to({'action': 'fly_to_jupiter'})
            err = await communicator.receive_json_from()
            self.assertEqual(err['event'], 'round.error')

            await communicator.disconnect()

        async_to_sync(_run)()

    def test_ws_invalid_coordinates(self):
        async def _run():
            communicator = WebsocketCommunicator(
                DuelConsumer.as_asgi(),
                f"/ws/game/duel/{self.match.id}/",
            )
            communicator.scope['url_route'] = {'kwargs': {'match_id': self.match.id}}
            communicator.scope['user'] = self.user
            connected, _ = await communicator.connect()
            self.assertTrue(connected)

            await communicator.receive_json_from()
            await communicator.receive_json_from()

            await communicator.send_json_to({
                'action': 'submit_guess',
                'latitude': 'invalid_string',
                'longitude': 50.0,
            })
            err = await communicator.receive_json_from()
            self.assertEqual(err['event'], 'round.error')

            await communicator.disconnect()

        async_to_sync(_run)()
