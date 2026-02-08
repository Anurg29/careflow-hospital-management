from rest_framework import serializers

from .models import AppointmentSlot, Bed, Department, Hospital, QueueEntry
from .services import PredictionService


class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = ['id', 'name', 'address', 'created_at']


class DepartmentSerializer(serializers.ModelSerializer):
    hospital = serializers.PrimaryKeyRelatedField(queryset=Hospital.objects.all())

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'hospital']


class BedSerializer(serializers.ModelSerializer):
    hospital = serializers.PrimaryKeyRelatedField(queryset=Hospital.objects.all())
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), allow_null=True)

    class Meta:
        model = Bed
        fields = ['id', 'label', 'status', 'patient_name', 'hospital', 'department', 'updated_at']


class QueueEntrySerializer(serializers.ModelSerializer):
    hospital = serializers.PrimaryKeyRelatedField(queryset=Hospital.objects.all())
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), allow_null=True)
    predicted_wait_minutes = serializers.SerializerMethodField()

    class Meta:
        model = QueueEntry
        fields = [
            'id',
            'hospital',
            'department',
            'patient_name',
            'symptoms',
            'status',
            'arrival_time',
            'started_at',
            'finished_at',
            'expected_finish',
            'predicted_wait_minutes',
        ]
        read_only_fields = ['arrival_time', 'started_at', 'finished_at', 'expected_finish', 'predicted_wait_minutes']

    def get_predicted_wait_minutes(self, obj):
        return PredictionService().predict_wait_time_minutes(obj.hospital_id, obj.department_id)


class AppointmentSlotSerializer(serializers.ModelSerializer):
    hospital = serializers.PrimaryKeyRelatedField(queryset=Hospital.objects.all())
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), allow_null=True)

    class Meta:
        model = AppointmentSlot
        fields = ['id', 'hospital', 'department', 'start_time', 'end_time', 'is_booked', 'patient_name']


class LiveStatusSerializer(serializers.Serializer):
    hospital_id = serializers.IntegerField()
    available_beds = serializers.IntegerField()
    occupied_beds = serializers.IntegerField()
    waiting_patients = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    predicted_wait_minutes = serializers.IntegerField()
    last_updated = serializers.DateTimeField()


class ThroughputPointSerializer(serializers.Serializer):
    hour = serializers.DateTimeField()
    completed = serializers.IntegerField()


class DashboardSerializer(serializers.Serializer):
    hospital_id = serializers.IntegerField()
    beds = serializers.DictField(child=serializers.IntegerField())
    queue = serializers.DictField(child=serializers.IntegerField())
    predicted_wait_minutes = serializers.IntegerField()
    throughput = ThroughputPointSerializer(many=True)
    generated_at = serializers.DateTimeField()
