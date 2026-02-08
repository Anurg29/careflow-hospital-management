"""
Admin views for managing patient appointments
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Appointment, User
from .serializers import AppointmentSerializer, AppointmentDetailSerializer


class IsAdminUser(IsAuthenticated):
    """Permission class to check if user is admin"""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'admin'


class AdminAppointmentsListView(APIView):
    """Get all appointments for admin"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Filter options
        status_filter = request.query_params.get('status')
        hospital_id = request.query_params.get('hospital_id')
        date_str = request.query_params.get('date')
        
        appointments = Appointment.objects.select_related(
            'patient', 'hospital', 'department', 'appointment_slot'
        ).all()
        
        if status_filter:
            appointments = appointments.filter(status=status_filter)
        
        if hospital_id:
            appointments = appointments.filter(hospital_id=hospital_id)
        
        if date_str:
            from datetime import datetime
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                appointments = appointments.filter(created_at__date=target_date)
            except ValueError:
                pass
        
        appointments = appointments.order_by('-created_at')
        
        serializer = AppointmentDetailSerializer(appointments, many=True)
        return Response(serializer.data)


class AdminAppointmentDetailView(APIView):
    """Get appointment details with full patient info"""
    permission_classes = [IsAdminUser]
    
    def get(self, request, appointment_id):
        try:
            appointment = Appointment.objects.select_related(
                'patient', 'hospital', 'department', 'appointment_slot'
            ).get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({
                'error': 'Appointment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AppointmentDetailSerializer(appointment)
        return Response(serializer.data)


class AdminUpdateAppointmentStatusView(APIView):
    """Update appointment status (in_progress, completed)"""
    permission_classes = [IsAdminUser]
    
    def patch(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({
                'error': 'Appointment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        new_status = request.data.get('status')
        
        if not new_status:
            return Response({
                'error': 'status is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate status transition
        if new_status == 'in_progress':
            if appointment.status != 'confirmed':
                return Response({
                    'error': 'Can only mark confirmed appointments as in progress'
                }, status=status.HTTP_400_BAD_REQUEST)
            appointment.mark_in_progress()
            
        elif new_status == 'completed':
            if appointment.status not in ['confirmed', 'in_progress']:
                return Response({
                    'error': 'Can only mark confirmed or in-progress appointments as completed'
                }, status=status.HTTP_400_BAD_REQUEST)
            appointment.mark_completed()
            
        elif new_status == 'cancelled':
            if appointment.status in ['completed', 'cancelled']:
                return Response({
                    'error': f'Cannot cancel {appointment.status} appointment'
                }, status=status.HTTP_400_BAD_REQUEST)
            refund = request.data.get('refund', False)
            appointment.cancel(refund=refund)
            
        else:
            return Response({
                'error': f'Invalid status: {new_status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = AppointmentDetailSerializer(appointment)
        return Response({
            'message': f'Appointment status updated to {new_status}',
            'appointment': serializer.data
        })


class AdminDashboardStatsView(APIView):
    """Get dashboard statistics for admin"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models import Count, Sum, Q
        from datetime import datetime, timedelta
        
        today = timezone.now().date()
        
        # Today's appointments
        today_appointments = Appointment.objects.filter(
            created_at__date=today
        )
        
        # This week's appointments
        week_start = today - timedelta(days=today.weekday())
        week_appointments = Appointment.objects.filter(
            created_at__date__gte=week_start
        )
        
        # Revenue statistics
        total_revenue = Appointment.objects.filter(
            payment_status='paid'
        ).aggregate(total=Sum('payment_amount'))['total'] or 0
        
        today_revenue = today_appointments.filter(
            payment_status='paid'
        ).aggregate(total=Sum('payment_amount'))['total'] or 0
        
        return Response({
            'today': {
                'total_appointments': today_appointments.count(),
                'confirmed': today_appointments.filter(status='confirmed').count(),
                'in_progress': today_appointments.filter(status='in_progress').count(),
                'completed': today_appointments.filter(status='completed').count(),
                'pending_payment': today_appointments.filter(status='pending_payment').count(),
                'revenue': float(today_revenue),
            },
            'this_week': {
                'total_appointments': week_appointments.count(),
                'confirmed': week_appointments.filter(status='confirmed').count(),
                'completed': week_appointments.filter(status='completed').count(),
            },
            'overall': {
                'total_revenue': float(total_revenue),
                'total_appointments': Appointment.objects.count(),
                'total_patients': User.objects.filter(role='patient').count(),
            },
            'status_breakdown': {
                'pending_payment': Appointment.objects.filter(status='pending_payment').count(),
                'confirmed': Appointment.objects.filter(status='confirmed').count(),
                'in_progress': Appointment.objects.filter(status='in_progress').count(),
                'completed': Appointment.objects.filter(status='completed').count(),
                'cancelled': Appointment.objects.filter(status='cancelled').count(),
            }
        })


class AdminPatientsListView(APIView):
    """Get list of all patients"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        patients = User.objects.filter(role='patient').order_by('-date_joined')
        
        return Response([
            {
                'id': p.id,
                'username': p.username,
                'email': p.email,
                'full_name': p.full_name,
                'phone': p.phone,
                'blood_group': p.blood_group,
                'date_joined': p.date_joined,
                'total_appointments': p.appointments.count(),
                'completed_appointments': p.appointments.filter(status='completed').count(),
            }
            for p in patients
        ])
