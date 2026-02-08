import json

from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .services import live_status_snapshot


class HospitalStatusConsumer(AsyncJsonWebsocketConsumer):
    """Broadcast live bed/queue status for a hospital."""

    async def connect(self):
        self.hospital_id = self.scope['url_route']['kwargs']['hospital_id']
        self.group_name = f"hospital_{self.hospital_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_status()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        # Client can request a refresh explicitly
        if content.get('type') == 'refresh':
            await self.send_status()

    async def send_status(self):
        snapshot = live_status_snapshot(self.hospital_id)
        await self.send_json({'type': 'status', **snapshot})

    async def broadcast_status(self, event):
        await self.send_json({'type': 'status', **event['payload']})
