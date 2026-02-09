"""
Serializers for patient dashboard and appointment management
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

from .models import User, Appointment, Payment, AppointmentSlot, Hospital, Department


class PatientRegisterSerializer(serializers.Serializer):
    """Serializer for patient registration"""
    username = serializers.CharField(max_length=150, min_length=3)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    
    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        validate_password(data['password'])
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        # Create patient user
        user = User.objects.create(
            role='patient',  # Always create as patient
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user


class HospitalSerializer(serializers.ModelSerializer):
    """Serializer for Hospital"""
    class Meta:
        model = Hospital
        fields = ['id', 'name', 'address', 'created_at']


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department"""
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'hospital', 'hospital_name']


class AppointmentSlotSerializer(serializers.ModelSerializer):
    """Serializer for Appointment Slot"""
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = AppointmentSlot
        fields = [
            'id', 'hospital', 'hospital_name', 'department', 'department_name',
            'start_time', 'end_time', 'is_booked', 'patient_name'
        ]


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for Appointment"""
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    patient_name = serializers.CharField(source='patient.username', read_only=True)
    slot_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'hospital', 'hospital_name',
            'department', 'department_name', 'appointment_slot', 'slot_time',
            'symptoms', 'notes', 'status', 'payment_status', 'payment_amount',
            'payment_id', 'created_at', 'updated_at', 'confirmed_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'patient', 'payment_id', 'created_at', 'updated_at',
            'confirmed_at', 'completed_at'
        ]
    
    def get_slot_time(self, obj):
        if obj.appointment_slot:
            return {
                'start_time': obj.appointment_slot.start_time,
                'end_time': obj.appointment_slot.end_time,
            }
        return None


class AppointmentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Appointment with full patient info"""
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    slot_details = AppointmentSlotSerializer(source='appointment_slot', read_only=True)
    
    # Patient details
    patient_details = serializers.SerializerMethodField()
    
    # Payment details
    payment_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_details', 'hospital', 'hospital_name',
            'department', 'department_name', 'appointment_slot', 'slot_details',
            'symptoms', 'notes', 'status', 'payment_status', 'payment_amount',
            'payment_id', 'payment_details', 'created_at', 'updated_at',
            'confirmed_at', 'completed_at'
        ]
    
    def get_patient_details(self, obj):
        patient = obj.patient
        return {
            'id': patient.id,
            'username': patient.username,
            'email': patient.email,
            'role': patient.role,
        }
    
    def get_payment_details(self, obj):
        # Get latest payment transaction
        payment = obj.payment_transactions.first()
        if payment:
            return {
                'transaction_id': payment.transaction_id,
                'amount': float(payment.amount),
                'status': payment.status,
                'payment_gateway': payment.payment_gateway,
                'payment_method': payment.payment_method,
                'paid_at': payment.paid_at,
            }
        return None


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment"""
    patient_name = serializers.CharField(source='patient.username', read_only=True)
    appointment_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'appointment', 'appointment_info', 'patient', 'patient_name',
            'amount', 'currency', 'payment_gateway', 'transaction_id',
            'gateway_order_id', 'gateway_payment_id', 'status', 'payment_method',
            'failure_reason', 'created_at', 'updated_at', 'paid_at'
        ]
        read_only_fields = [
            'id', 'patient', 'created_at', 'updated_at', 'paid_at'
        ]
    
    def get_appointment_info(self, obj):
        return {
            'id': obj.appointment.id,
            'hospital': obj.appointment.hospital.name,
            'department': obj.appointment.department.name if obj.appointment.department else None,
            'status': obj.appointment.status,
        }

# ─── Additional Serializers for existing views ───

from .models import Bed, QueueEntry


class BedSerializer(serializers.ModelSerializer):
    """Serializer for Bed"""
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Bed
        fields = '__all__'


class QueueEntrySerializer(serializers.ModelSerializer):
    """Serializer for Queue Entry"""
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = QueueEntry
        fields = '__all__'


class LiveStatusSerializer(serializers.Serializer):
    """Serializer for live status data"""
    hospital_id = serializers.IntegerField()
    hospital_name = serializers.CharField()
    total_beds = serializers.IntegerField()
    available_beds = serializers.IntegerField()
    occupied_beds = serializers.IntegerField()
    queue_waiting = serializers.IntegerField()
    queue_in_progress = serializers.IntegerField()
    departments = serializers.ListField()


class DashboardSerializer(serializers.Serializer):
    """Serializer for dashboard metrics"""
    hospital_id = serializers.IntegerField()
    total_patients_today = serializers.IntegerField()
    average_wait_time = serializers.FloatField()
    bed_occupancy_rate = serializers.FloatField()
    departments_stats = serializers.DictField()
