import asyncio
import math
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from game.models import GameMatch, MatchStatus
from game.services.elo_service import EloService


class DuelConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.match_id = str(self.scope['url_route']['kwargs']['match_id'])
        self.group_name = f"match_{self.match_id}"
        self.user = self.scope.get('user')

        # Authentication check
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        # Verification of match existence and user participation
        match_data = await self.get_match_participant_data(self.match_id, self.user.id)
        if not match_data:
            await self.close(code=4004)
            return

        self.is_p1 = match_data['player1_id'] == self.user.id

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        self._in_group = True
        await self.accept()

        # Send initial matched event
        await self.send_json({
            'event': 'game.matched',
            'match_id': self.match_id,
            'is_bot': match_data['is_bot_match'],
            'round_index': 1,
        })

        # Start round 1 if match is in progress or waiting
        await self.send_round_start()

    async def disconnect(self, close_code):
        if getattr(self, '_in_group', False) and hasattr(self, 'group_name') and self.channel_layer:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content):
        if not isinstance(content, dict):
            await self.send_json({'event': 'round.error', 'message': 'Invalid payload format'})
            return

        action = content.get('action')
        if not action or not isinstance(action, str):
            await self.send_json({'event': 'round.error', 'message': 'Missing or invalid action'})
            return

        if action == 'submit_guess':
            lat = content.get('latitude')
            lon = content.get('longitude')
            if lat is None or lon is None or not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
                await self.send_json({'event': 'round.error', 'message': 'Missing or invalid coordinates'})
                return

            score = await self.calculate_guess_score(lat, lon)

            # Confirm privately to sender
            await self.send_json({
                'event': 'round.answer_accepted',
                'player_id': self.user.id,
            })

            # Broadcast opponent acted
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'broadcast_opponent_acted',
                    'sender_id': self.user.id,
                },
            )

            # Finalize round
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'broadcast_round_result',
                    'player_id': self.user.id,
                    'score': score,
                },
            )

        elif action in ('buzzer_click', 'drag_drop'):
            await self.send_json({
                'event': 'round.answer_accepted',
                'player_id': self.user.id,
            })
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'broadcast_opponent_acted',
                    'sender_id': self.user.id,
                },
            )

        elif action == 'stat_guesser_check':
            object_ids = content.get('object_ids', [])
            feedback = await self.check_stat_guesser(object_ids)
            await self.send_json({
                'event': 'stat_guesser_feedback',
                'result': feedback,
            })

        elif action in ('stat_guesser_continue', 'stat_guesser_stop'):
            await self.send_json({
                'event': 'round.answer_accepted',
                'action': action,
            })

        else:
            await self.send_json({
                'event': 'round.error',
                'message': f"Unknown action '{action}'",
            })

    async def send_round_start(self):
        # Zero-Knowledge: Send only public descriptors, never secret target coordinates
        round_info = await self.get_public_round_info(self.match_id)
        await self.send_json({
            'event': 'round.start',
            'round_index': 1,
            'round_type': 'LANDING_COORDINATES',
            'time_limit_sec': 15,
            'payload': round_info,
        })

    async def broadcast_opponent_acted(self, event):
        if event['sender_id'] != self.user.id:
            await self.send_json({'event': 'round.opponent_acted'})

    async def broadcast_round_result(self, event):
        await self.send_json({
            'event': 'round.result',
            'round_index': 1,
            'player_id': event['player_id'],
            'score': event['score'],
        })

    @database_sync_to_async
    def get_match_participant_data(self, match_id, user_id):
        match = GameMatch.objects.filter(id=match_id).first()
        if not match:
            return None
        if match.player1_id != user_id and match.player2_id != user_id:
            return None
        return {
            'player1_id': match.player1_id,
            'player2_id': match.player2_id,
            'is_bot_match': match.is_bot_match,
            'status': match.status,
        }

    @database_sync_to_async
    def get_public_round_info(self, match_id):
        match = GameMatch.objects.select_related('target_artifact').filter(id=match_id).first()
        if not match or not match.target_artifact:
            return {'artifact_name': 'Unknown Rover'}
        return {
            'artifact_id': match.target_artifact.id,
            'artifact_name': match.target_artifact.name,
            'celestial_body': match.target_artifact.celestial_body_id,
        }

    @database_sync_to_async
    def calculate_guess_score(self, lat, lon):
        match = GameMatch.objects.filter(id=self.match_id).first()
        if not match or not match.round_data:
            return 50

        t_lat = match.round_data.get('target_lat', 0.0)
        t_lon = match.round_data.get('target_lon', 0.0)

        # Great-circle angular distance
        dlat = math.radians(lat - t_lat)
        dlon = math.radians(lon - t_lon)
        a = (math.sin(dlat / 2.0) ** 2) + math.cos(math.radians(lat)) * math.cos(math.radians(t_lat)) * (math.sin(dlon / 2.0) ** 2)
        c = 2.0 * math.asin(math.sqrt(min(1.0, max(0.0, a))))
        dist_km = 3396.2 * c

        # Exponential decay scoring (max 100 points within 50 km)
        score = max(0, min(100, int(100 * math.exp(-dist_km / 500.0))))
        return score

    @database_sync_to_async
    def check_stat_guesser(self, object_ids):
        match = GameMatch.objects.filter(id=self.match_id).first()
        true_mass = match.round_data.get('true_mass_kg', 185.0) if match else 185.0
        # In a real game, sum weights of object_ids
        estimated_mass = len(object_ids) * 50.0
        diff = abs(estimated_mass - true_mass)
        if diff / max(true_mass, 1.0) <= 0.01:
            return 'balanced'
        elif estimated_mass > true_mass:
            return 'objects_heavier'
        else:
            return 'spacecraft_heavier'
