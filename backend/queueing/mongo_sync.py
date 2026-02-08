"""
Automatically mirror Django model saves/deletes into MongoDB.
Each model is stored in a collection named after its lowercase class name + 's'.
"""
import logging
from datetime import datetime

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import User, Hospital, Department, Bed, QueueEntry, AppointmentSlot

logger = logging.getLogger(__name__)


def _get_db():
    """Lazy import to avoid circular import at module load."""
    from .mongo import get_mongo_db
    return get_mongo_db()


def _model_to_doc(instance):
    """Convert a Django model instance to a MongoDB document dict."""
    doc = {'_django_id': instance.pk}
    # Skip many-to-many and reverse relations
    skip_fields = ['groups', 'user_permissions', 'logentry_set', 'outstandingtoken_set', 'blacklistedtoken_set']
    
    for field in instance._meta.get_fields():
        if not hasattr(field, 'attname'):
            continue
        if field.attname in skip_fields:
            continue
        val = getattr(instance, field.attname, None)
        # Convert datetime to ISO string for clean storage
        if isinstance(val, datetime):
            val = val.isoformat()
        if hasattr(val, 'isoformat'):
            val = val.isoformat()
        doc[field.attname] = val
    return doc


def _sync_save(collection_name, instance):
    try:
        db = _get_db()
        if db is None:
            logger.debug('MongoDB not available, skipping sync for %s #%s', collection_name, instance.pk)
            return
        doc = _model_to_doc(instance)
        db[collection_name].update_one(
            {'_django_id': instance.pk},
            {'$set': doc},
            upsert=True,
        )
        logger.debug('MongoDB ↑ %s #%s', collection_name, instance.pk)
    except Exception as exc:
        logger.warning('MongoDB sync save failed for %s #%s: %s', collection_name, instance.pk, exc)


def _sync_delete(collection_name, instance):
    try:
        db = _get_db()
        db[collection_name].delete_one({'_django_id': instance.pk})
        logger.debug('MongoDB ✕ %s #%s', collection_name, instance.pk)
    except Exception as exc:
        logger.warning('MongoDB sync delete failed for %s #%s: %s', collection_name, instance.pk, exc)


# ─── Signal Handlers ───

@receiver(post_save, sender=Hospital)
def hospital_saved(sender, instance, **kwargs):
    _sync_save('hospitals', instance)


@receiver(post_delete, sender=Hospital)
def hospital_deleted(sender, instance, **kwargs):
    _sync_delete('hospitals', instance)


@receiver(post_save, sender=Department)
def department_saved(sender, instance, **kwargs):
    _sync_save('departments', instance)


@receiver(post_delete, sender=Department)
def department_deleted(sender, instance, **kwargs):
    _sync_delete('departments', instance)


@receiver(post_save, sender=Bed)
def bed_saved(sender, instance, **kwargs):
    _sync_save('beds', instance)


@receiver(post_delete, sender=Bed)
def bed_deleted(sender, instance, **kwargs):
    _sync_delete('beds', instance)


@receiver(post_save, sender=QueueEntry)
def queue_entry_saved(sender, instance, **kwargs):
    _sync_save('queue_entries', instance)


@receiver(post_delete, sender=QueueEntry)
def queue_entry_deleted(sender, instance, **kwargs):
    _sync_delete('queue_entries', instance)


@receiver(post_save, sender=AppointmentSlot)
def appointment_saved(sender, instance, **kwargs):
    _sync_save('appointment_slots', instance)


@receiver(post_delete, sender=AppointmentSlot)
def appointment_deleted(sender, instance, **kwargs):
    _sync_delete('appointment_slots', instance)


@receiver(post_save, sender=User)
def user_saved(sender, instance, **kwargs):
    _sync_save('users', instance)


@receiver(post_delete, sender=User)
def user_deleted(sender, instance, **kwargs):
    _sync_delete('users', instance)
