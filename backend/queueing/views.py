from rest_framework import viewsets, status as http_status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AppointmentSlot, Bed, Department, Hospital, QueueEntry
from .serializers import (
    AppointmentSlotSerializer,
    BedSerializer,
    DepartmentSerializer,
    HospitalSerializer,
    LiveStatusSerializer,
    QueueEntrySerializer,
    DashboardSerializer,
)
from .services import PredictionService, live_status_snapshot, dashboard_metrics


class ReadOnlyOrAuthenticatedMixin:
    """Allow anonymous GET/HEAD/OPTIONS, require auth for writes."""

    def get_permissions(self):
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return [AllowAny()]
        return [IsAuthenticated()]


class HospitalViewSet(ReadOnlyOrAuthenticatedMixin, viewsets.ModelViewSet):
    queryset = Hospital.objects.all().order_by('name')
    serializer_class = HospitalSerializer


class DepartmentViewSet(ReadOnlyOrAuthenticatedMixin, viewsets.ModelViewSet):
    queryset = Department.objects.select_related('hospital').all()
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        hospital_id = self.request.query_params.get('hospital')
        if hospital_id:
            qs = qs.filter(hospital_id=hospital_id)
        return qs


class BedViewSet(ReadOnlyOrAuthenticatedMixin, viewsets.ModelViewSet):
    queryset = Bed.objects.select_related('hospital', 'department').all()
    serializer_class = BedSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        hospital_id = self.request.query_params.get('hospital')
        if hospital_id:
            qs = qs.filter(hospital_id=hospital_id)
        return qs


class QueueEntryViewSet(ReadOnlyOrAuthenticatedMixin, viewsets.ModelViewSet):
    queryset = QueueEntry.objects.select_related('hospital', 'department').all()
    serializer_class = QueueEntrySerializer

    def get_queryset(self):
        qs = super().get_queryset()
        hospital_id = self.request.query_params.get('hospital')
        department_id = self.request.query_params.get('department')
        status_filter = self.request.query_params.get('status')
        if hospital_id:
            qs = qs.filter(hospital_id=hospital_id)
        if department_id:
            qs = qs.filter(department_id=department_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        entry = serializer.save()
        PredictionService().update_expected_finish_times(entry.hospital_id, entry.department_id)
        return entry

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        entry = self.get_object()
        entry.mark_started()
        PredictionService().update_expected_finish_times(entry.hospital_id, entry.department_id)
        return Response(self.get_serializer(entry).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        entry = self.get_object()
        entry.mark_done()
        PredictionService().update_expected_finish_times(entry.hospital_id, entry.department_id)
        return Response(self.get_serializer(entry).data)


class AppointmentSlotViewSet(ReadOnlyOrAuthenticatedMixin, viewsets.ModelViewSet):
    queryset = AppointmentSlot.objects.select_related('hospital', 'department').all()
    serializer_class = AppointmentSlotSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        hospital_id = self.request.query_params.get('hospital')
        department_id = self.request.query_params.get('department')
        is_booked = self.request.query_params.get('is_booked')
        if hospital_id:
            qs = qs.filter(hospital_id=hospital_id)
        if department_id:
            qs = qs.filter(department_id=department_id)
        if is_booked is not None:
            if is_booked.lower() in ('true', '1', 'yes'):
                qs = qs.filter(is_booked=True)
            else:
                qs = qs.filter(is_booked=False)
        return qs


class LiveStatusView(APIView):
    """Public read-only endpoint — no auth required."""
    permission_classes = [AllowAny]

    def get(self, request, hospital_id: int):
        data = live_status_snapshot(hospital_id)
        return Response(LiveStatusSerializer(data).data)


class DashboardView(APIView):
    """Admin-friendly metrics for charts/visualizations."""
    permission_classes = [AllowAny]

    def get(self, request, hospital_id: int):
        metrics = dashboard_metrics(hospital_id)
        return Response(DashboardSerializer(metrics).data)


class PatientQueueView(APIView):
    """Let a patient check their queue status and ETA by queue id."""
    permission_classes = [AllowAny]

    def get(self, request, pk: int):
        try:
            entry = QueueEntry.objects.get(pk=pk)
        except QueueEntry.DoesNotExist:
            return Response({'detail': 'Not found'}, status=http_status.HTTP_404_NOT_FOUND)
        return Response(QueueEntrySerializer(entry).data)
