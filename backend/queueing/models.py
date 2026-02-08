from datetime import timedelta
from typing import Optional

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


class UserManager(BaseUserManager):
    """Manager for custom User model"""
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Username is required')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Simplified User model - only username, email, password"""
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']
    
    def __str__(self):
        return self.username
    
    class Meta:
        db_table = 'queueing_user'


class Hospital(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Department(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        unique_together = ('hospital', 'name')

    def __str__(self):
        return f"{self.name} ({self.hospital.name})"


class Bed(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Available'
        OCCUPIED = 'occupied', 'Occupied'
        CLEANING = 'cleaning', 'Cleaning'
        MAINTENANCE = 'maintenance', 'Maintenance'

    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='beds')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='beds')
    label = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    patient_name = models.CharField(max_length=150, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('hospital', 'label')
        ordering = ['label']

    def __str__(self):
        return f"{self.label} - {self.hospital.name}"


class QueueEntry(models.Model):
    class Status(models.TextChoices):
        WAITING = 'waiting', 'Waiting'
        IN_PROGRESS = 'in_progress', 'In progress'
        DONE = 'done', 'Done'
        CANCELLED = 'cancelled', 'Cancelled'

    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='queue_entries')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='queue_entries')
    patient_name = models.CharField(max_length=150)
    symptoms = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.WAITING)
    arrival_time = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    expected_finish = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['arrival_time']

    def __str__(self):
        return f"{self.patient_name} - {self.status}"

    @property
    def effective_duration(self) -> Optional[timedelta]:
        if self.started_at and self.finished_at:
            return self.finished_at - self.started_at
        if self.arrival_time and self.finished_at:
            return self.finished_at - self.arrival_time
        return None

    def mark_started(self):
        if not self.started_at:
            self.started_at = timezone.now()
            self.status = self.Status.IN_PROGRESS
            self.save(update_fields=['started_at', 'status'])

    def mark_done(self):
        now = timezone.now()
        self.finished_at = now
        if not self.started_at:
            self.started_at = now
        self.status = self.Status.DONE
        self.save(update_fields=['started_at', 'finished_at', 'status'])


class AppointmentSlot(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='appointment_slots')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointment_slots')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_booked = models.BooleanField(default=False)
    patient_name = models.CharField(max_length=150, blank=True)

    class Meta:
        ordering = ['start_time']

    def __str__(self):
        return f"{self.department or 'General'} @ {self.start_time:%Y-%m-%d %H:%M}"
