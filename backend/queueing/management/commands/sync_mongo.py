"""
Management command to verify MongoDB connection and sync existing data.
Usage: python manage.py sync_mongo
"""
from django.core.management.base import BaseCommand

from queueing.mongo import get_mongo_db
from queueing.models import Hospital, Department, Bed, QueueEntry, AppointmentSlot
from queueing.mongo_sync import _model_to_doc


class Command(BaseCommand):
    help = 'Test MongoDB Atlas connection and sync all existing data'

    def handle(self, *args, **options):
        self.stdout.write('Connecting to MongoDB Atlas...')
        try:
            db = get_mongo_db()
            db.client.admin.command('ping')
            self.stdout.write(self.style.SUCCESS('✅ MongoDB connection successful!'))
        except Exception as exc:
            self.stdout.write(self.style.ERROR(f'❌ Connection failed: {exc}'))
            return

        # Show database info
        self.stdout.write(f'  Database: {db.name}')
        self.stdout.write(f'  Collections: {db.list_collection_names()}')

        # Sync existing data
        model_map = {
            'hospitals': Hospital,
            'departments': Department,
            'beds': Bed,
            'queue_entries': QueueEntry,
            'appointment_slots': AppointmentSlot,
        }

        total = 0
        for collection_name, model in model_map.items():
            qs = model.objects.all()
            count = qs.count()
            if count == 0:
                self.stdout.write(f'  {collection_name}: 0 records (skip)')
                continue

            for instance in qs:
                doc = _model_to_doc(instance)
                db[collection_name].update_one(
                    {'_django_id': instance.pk},
                    {'$set': doc},
                    upsert=True,
                )
            total += count
            self.stdout.write(f'  {collection_name}: synced {count} records')

        self.stdout.write(self.style.SUCCESS(f'\n🎉 Done! {total} records synced to MongoDB Atlas.'))
