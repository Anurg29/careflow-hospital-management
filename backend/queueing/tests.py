from django.test import TestCase
from django.utils import timezone

from .models import Hospital, QueueEntry
from .services import PredictionService


class PredictionServiceTests(TestCase):
    def setUp(self):
        self.hospital = Hospital.objects.create(name='Test Hospital')

    def test_fallback_when_no_history(self):
        service = PredictionService(fallback_minutes=10)
        self.assertEqual(service.predict_wait_time_minutes(self.hospital.id), 10)

    def test_moving_average_last_five(self):
        # Create six entries with growing durations 5..10 minutes; last five average = 8
        durations = [5, 6, 7, 8, 9, 10]
        now = timezone.now()
        for minutes in durations:
            entry = QueueEntry.objects.create(
                hospital=self.hospital,
                patient_name=f"p{minutes}",
                status=QueueEntry.Status.DONE,
                started_at=now,
                finished_at=now + timezone.timedelta(minutes=minutes),
            )
            entry.save()

        service = PredictionService()
        self.assertEqual(service.predict_wait_time_minutes(self.hospital.id), 8)
