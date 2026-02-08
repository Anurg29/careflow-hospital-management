from datetime import timedelta
from typing import Optional
from collections import defaultdict

from django.db.models import Q
from django.utils import timezone

from .models import Bed, QueueEntry


class PredictionService:
    """Predict wait time using moving average of last five completed visits."""

    def __init__(self, fallback_minutes: int = 15, min_minutes: int = 2):
        self.fallback_minutes = fallback_minutes
        self.min_minutes = min_minutes

    def predict_wait_time_minutes(self, hospital_id: int, department_id: Optional[int] = None) -> int:
        qs = QueueEntry.objects.filter(
            hospital_id=hospital_id,
            status=QueueEntry.Status.DONE,
            finished_at__isnull=False,
        ).order_by('-finished_at')
        if department_id:
            qs = qs.filter(department_id=department_id)

        durations = []
        for entry in qs[:5]:
            duration = entry.effective_duration
            if duration:
                durations.append(duration.total_seconds() / 60)

        if not durations:
            return self.fallback_minutes

        avg_minutes = sum(durations) / len(durations)
        return max(self.min_minutes, int(round(avg_minutes)))

    def update_expected_finish_times(self, hospital_id: int, department_id: Optional[int] = None) -> None:
        """Update expected_finish for waiting patients based on moving average."""
        predicted_minutes = self.predict_wait_time_minutes(hospital_id, department_id)
        now = timezone.now()
        waiting_qs = QueueEntry.objects.filter(
            hospital_id=hospital_id,
            status=QueueEntry.Status.WAITING,
        ).order_by('arrival_time')
        if department_id:
            waiting_qs = waiting_qs.filter(department_id=department_id)

        for idx, entry in enumerate(waiting_qs):
            entry.expected_finish = now + timedelta(minutes=predicted_minutes * (idx + 1))
            entry.save(update_fields=['expected_finish'])


def live_status_snapshot(hospital_id: int) -> dict:
    service = PredictionService()
    available_beds = Bed.objects.filter(hospital_id=hospital_id, status=Bed.Status.AVAILABLE).count()
    occupied_beds = Bed.objects.filter(hospital_id=hospital_id, status=Bed.Status.OCCUPIED).count()
    waiting_patients = QueueEntry.objects.filter(hospital_id=hospital_id, status=QueueEntry.Status.WAITING).count()
    in_progress = QueueEntry.objects.filter(hospital_id=hospital_id, status=QueueEntry.Status.IN_PROGRESS).count()
    predicted_wait = service.predict_wait_time_minutes(hospital_id)
    return {
        'hospital_id': hospital_id,
        'available_beds': available_beds,
        'occupied_beds': occupied_beds,
        'waiting_patients': waiting_patients,
        'in_progress': in_progress,
        'predicted_wait_minutes': predicted_wait,
        'last_updated': timezone.now(),
    }


def dashboard_metrics(hospital_id: int) -> dict:
    """Aggregate counts + recent throughput for admin visualizations."""
    now = timezone.now()
    window_start = now - timedelta(hours=12)

    # Bed status counts
    bed_counts = {status: 0 for status, _ in Bed.Status.choices}
    for row in Bed.objects.filter(hospital_id=hospital_id).values_list('status', flat=True):
        bed_counts[row] = bed_counts.get(row, 0) + 1

    # Queue status counts
    queue_counts = {status: 0 for status, _ in QueueEntry.Status.choices}
    for row in QueueEntry.objects.filter(hospital_id=hospital_id).values_list('status', flat=True):
        queue_counts[row] = queue_counts.get(row, 0) + 1

    # Throughput buckets per hour (last 12h)
    buckets = defaultdict(int)
    for entry in QueueEntry.objects.filter(
        hospital_id=hospital_id,
        status=QueueEntry.Status.DONE,
        finished_at__gte=window_start,
    ):
        ts = entry.finished_at or now
        ts = ts.replace(minute=0, second=0, microsecond=0)
        buckets[ts] += 1

    throughput = [
        {'hour': (now - timedelta(hours=i)).replace(minute=0, second=0, microsecond=0), 'completed': 0}
        for i in range(12, -1, -1)
    ]
    bucket_map = {item['hour']: item for item in throughput}
    for hour, count in buckets.items():
        if hour in bucket_map:
            bucket_map[hour]['completed'] = count
        else:
            bucket_map[hour] = {'hour': hour, 'completed': count}

    return {
        'hospital_id': hospital_id,
        'beds': bed_counts,
        'queue': queue_counts,
        'predicted_wait_minutes': PredictionService().predict_wait_time_minutes(hospital_id),
        'throughput': sorted(bucket_map.values(), key=lambda x: x['hour']),
        'generated_at': now,
    }
