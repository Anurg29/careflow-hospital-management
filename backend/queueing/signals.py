from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Bed, QueueEntry
from .services import live_status_snapshot

channel_layer = get_channel_layer()


def _broadcast(hospital_id: int):
    if not channel_layer:
        return
    payload = live_status_snapshot(hospital_id)
    async_to_sync(channel_layer.group_send)(
        f"hospital_{hospital_id}", {'type': 'broadcast_status', 'payload': payload}
    )


@receiver([post_save, post_delete], sender=Bed)
def bed_updated(sender, instance, **kwargs):
    _broadcast(instance.hospital_id)


@receiver([post_save, post_delete], sender=QueueEntry)
def queue_updated(sender, instance, **kwargs):
    _broadcast(instance.hospital_id)
