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
    """Simplified User model with admin/patient roles"""
    ROLE_CHOICES = [
        ('admin', 'Hospital Admin'),
        ('patient', 'Patient'),
    ]
    
    # Core fields
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    
    # System fields
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']
    
    class Meta:
        db_table = 'queueing_user'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_admin(self):
        """Check if user is hospital admin"""
        return self.role == 'admin'
    
    @property
    def is_patient(self):
        """Check if user is patient"""
        return self.role == 'patient'


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


class Appointment(models.Model):
    """Patient appointment bookings with payment"""
    STATUS_CHOICES = [
        ('pending_payment', 'Pending Payment'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    # Relationships
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments', limit_choices_to={'role': 'patient'})
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='appointments')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')
    appointment_slot = models.ForeignKey(AppointmentSlot, on_delete=models.SET_NULL, null=True, blank=True, related_name='booked_appointments')
    
    # Appointment details
    symptoms = models.TextField(blank=True)
    notes = models.TextField(blank=True, help_text="Additional notes from patient")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_payment')
    
    # Payment details
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_id = models.CharField(max_length=255, blank=True, help_text="Payment gateway transaction ID")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'status']),
            models.Index(fields=['hospital', 'status']),
            models.Index(fields=['payment_status']),
        ]
    
    def __str__(self):
        return f"{self.patient.full_name} - {self.hospital.name} ({self.get_status_display()})"
    
    def confirm_payment(self, payment_id):
        """Mark appointment as confirmed after successful payment"""
        self.payment_status = 'paid'
        self.payment_id = payment_id
        self.status = 'confirmed'
        self.confirmed_at = timezone.now()
        
        # Mark the appointment slot as booked
        if self.appointment_slot:
            self.appointment_slot.is_booked = True
            self.appointment_slot.patient_name = self.patient.full_name
            self.appointment_slot.save()
        
        self.save()
    
    def cancel(self, refund=False):
        """Cancel the appointment"""
        self.status = 'cancelled'
        if refund and self.payment_status == 'paid':
            self.payment_status = 'refunded'
        
        # Free up the appointment slot
        if self.appointment_slot:
            self.appointment_slot.is_booked = False
            self.appointment_slot.patient_name = ''
            self.appointment_slot.save()
        
        self.save()
    
    def mark_in_progress(self):
        """Mark appointment as in progress"""
        if self.status == 'confirmed':
            self.status = 'in_progress'
            self.save()
    
    def mark_completed(self):
        """Mark appointment as completed"""
        if self.status in ['confirmed', 'in_progress']:
            self.status = 'completed'
            self.completed_at = timezone.now()
            self.save()


class Payment(models.Model):
    """Payment transactions for appointments"""
    GATEWAY_CHOICES = [
        ('razorpay', 'Razorpay'),
        ('stripe', 'Stripe'),
        ('test', 'Test Mode'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    # Relationships
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='payment_transactions')
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    payment_gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES, default='test')
    transaction_id = models.CharField(max_length=255, unique=True)
    gateway_order_id = models.CharField(max_length=255, blank=True)
    gateway_payment_id = models.CharField(max_length=255, blank=True)
    gateway_signature = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Additional info
    payment_method = models.CharField(max_length=50, blank=True, help_text="Card/UPI/Wallet etc")
    failure_reason = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'status']),
            models.Index(fields=['transaction_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Payment {self.transaction_id} - {self.get_status_display()} - ₹{self.amount}"
    
    def mark_success(self, gateway_payment_id, payment_method=''):
        """Mark payment as successful"""
        self.status = 'success'
        self.gateway_payment_id = gateway_payment_id
        self.payment_method = payment_method
        self.paid_at = timezone.now()
        self.save()
        
        # Update appointment
        self.appointment.confirm_payment(gateway_payment_id)
    
    def mark_failed(self, reason=''):
        """Mark payment as failed"""
        self.status = 'failed'
        self.failure_reason = reason
        self.save()
    
    def mark_refunded(self):
        """Mark payment as refunded"""
        self.status = 'refunded'
        self.save()
        
        # Update appointment
        self.appointment.payment_status = 'refunded'
        self.appointment.save()

