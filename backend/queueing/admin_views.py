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
                'role': p.role,
                'date_joined': p.date_joined,
                'total_appointments': p.appointments.count() if hasattr(p, 'appointments') else 0,
                'completed_appointments': p.appointments.filter(status='completed').count() if hasattr(p, 'appointments') else 0,
            }
            for p in patients
        ])


class AdminRegisterPatientView(APIView):
    """Admin can register a patient who came to the hospital offline"""
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        from .serializers import PatientRegisterSerializer
        import uuid
        
        username = request.data.get('username')
        email = request.data.get('email', '')
        password = request.data.get('password')
        
        # Auto-generate password if not provided (for walk-in patients)
        if not password:
            password = f"temp_{uuid.uuid4().hex[:8]}"
        
        # Validate required fields
        if not username:
            return Response({
                'error': 'username is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if username already exists
        if User.objects.filter(username__iexact=username).exists():
            return Response({
                'error': 'Username already exists. Please use a different username.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email already exists (if provided)
        if email and User.objects.filter(email__iexact=email).exists():
            return Response({
                'error': 'Email already registered.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create patient user
        try:
            user = User.objects.create(
                username=username,
                email=email,
                role='patient'
            )
            user.set_password(password)
            user.save()
            
            # Optionally create an appointment if details are provided
            appointment = None
            hospital_id = request.data.get('hospital_id')
            department_id = request.data.get('department_id')
            symptoms = request.data.get('symptoms', '')
            notes = request.data.get('notes', '')
            
            if hospital_id:
                # Admin registers patient and books appointment directly (skip payment)
                appointment = Appointment.objects.create(
                    patient=user,
                    hospital_id=hospital_id,
                    department_id=department_id if department_id else None,
                    symptoms=symptoms,
                    notes=notes,
                    payment_amount=0.00,  # Walk-in patients may pay at hospital
                    status='confirmed',  # Directly confirmed by admin
                    payment_status='paid',  # Mark as paid (handled offline)
                    confirmed_at=timezone.now()
                )
                
                appointment_data = AppointmentSerializer(appointment).data
            else:
                appointment_data = None
            
            return Response({
                'message': 'Patient registered successfully',
                'patient': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'temporary_password': password if not request.data.get('password') else None,
                },
                'appointment': appointment_data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Failed to register patient: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminPatientDetailView(APIView):
    """Get detailed patient information for admin"""
    permission_classes = [IsAdminUser]
    
    def get(self, request, patient_id):
        try:
            patient = User.objects.get(id=patient_id, role='patient')
        except User.DoesNotExist:
            return Response({
                'error': 'Patient not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get all appointments for this patient
        appointments = Appointment.objects.filter(
            patient=patient
        ).select_related(
            'hospital', 'department', 'appointment_slot'
        ).order_by('-created_at')
        
        # Calculate statistics
        total_spent = sum(
            a.payment_amount for a in appointments.filter(payment_status='paid')
        )
        
        return Response({
            'patient': {
                'id': patient.id,
                'username': patient.username,
                'email': patient.email,
                'role': patient.role,
                'date_joined': patient.date_joined,
                'last_login': patient.last_login,
            },
            'statistics': {
                'total_appointments': appointments.count(),
                'confirmed': appointments.filter(status='confirmed').count(),
                'in_progress': appointments.filter(status='in_progress').count(),
                'completed': appointments.filter(status='completed').count(),
                'cancelled': appointments.filter(status='cancelled').count(),
                'pending_payment': appointments.filter(status='pending_payment').count(),
                'total_spent': float(total_spent),
            },
            'appointments': AppointmentDetailSerializer(appointments, many=True).data
        })

