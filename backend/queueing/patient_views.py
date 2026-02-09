"""
Patient-facing API views for appointments and authentication
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Q, Count, Avg
from datetime import datetime, timedelta

from .models import User, Hospital, Department, Appointment, AppointmentSlot, QueueEntry
from .serializers import (
    PatientRegisterSerializer, 
    AppointmentSerializer, 
    AppointmentSlotSerializer,
    HospitalSerializer,
    DepartmentSerializer
)


class PatientRegisterView(APIView):
    """Register a new patient account"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PatientRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create patient user
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
            },
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)


class PatientLoginView(APIView):
    """Login for patient users"""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = 'anon'
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'detail': 'Please provide both username and password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Look up user by username
            user = User.objects.get(username=username)
            
            # Check password
            if not user.check_password(password):
                return Response({
                    'detail': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if user is a patient
            if user.role != 'patient':
                return Response({
                    'detail': 'This login is for patients only. Please use admin login.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Update last login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response({
                'detail': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)


class AvailableSlotsView(APIView):
    """Get available appointment slots"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        hospital_id = request.query_params.get('hospital_id')
        department_id = request.query_params.get('department_id')
        date_str = request.query_params.get('date')  # YYYY-MM-DD format
        
        if not hospital_id:
            return Response({
                'error': 'hospital_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Build query
        slots = AppointmentSlot.objects.filter(
            hospital_id=hospital_id,
            is_booked=False,
            start_time__gte=timezone.now()  # Only future slots
        )
        
        if department_id:
            slots = slots.filter(department_id=department_id)
        
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                slots = slots.filter(
                    start_time__date=target_date
                )
            except ValueError:
                return Response({
                    'error': 'Invalid date format. Use YYYY-MM-DD'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        slots = slots.order_by('start_time')[:50]  # Limit to 50 slots
        
        serializer = AppointmentSlotSerializer(slots, many=True)
        return Response(serializer.data)


class BookAppointmentView(APIView):
    """Book a new appointment"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        # Ensure user is a patient
        if user.role != 'patient':
            return Response({
                'error': 'Only patients can book appointments'
            }, status=status.HTTP_403_FORBIDDEN)
        
        hospital_id = request.data.get('hospital_id')
        department_id = request.data.get('department_id')
        appointment_slot_id = request.data.get('appointment_slot_id')
        symptoms = request.data.get('symptoms', '')
        notes = request.data.get('notes', '')
        payment_amount = request.data.get('payment_amount', 500.00)  # Default Rs. 500
        
        # Validate required fields
        if not hospital_id:
            return Response({
                'error': 'hospital_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if appointment slot exists and is available
        if appointment_slot_id:
            try:
                slot = AppointmentSlot.objects.get(id=appointment_slot_id)
                if slot.is_booked:
                    return Response({
                        'error': 'This appointment slot is already booked'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except AppointmentSlot.DoesNotExist:
                return Response({
                    'error': 'Invalid appointment slot'
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            slot = None
        
        # Create appointment (pending payment)
        appointment = Appointment.objects.create(
            patient=user,
            hospital_id=hospital_id,
            department_id=department_id,
            appointment_slot=slot,
            symptoms=symptoms,
            notes=notes,
            payment_amount=payment_amount,
            status='pending_payment',
            payment_status='pending'
        )
        
        serializer = AppointmentSerializer(appointment)
        return Response({
            'appointment': serializer.data,
            'message': 'Appointment created. Please complete payment to confirm.'
        }, status=status.HTTP_201_CREATED)


class MyAppointmentsView(APIView):
    """Get patient's appointments"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.role != 'patient':
            return Response({
                'error': 'Only patients can view their appointments'
            }, status=status.HTTP_403_FORBIDDEN)
        
        appointments = Appointment.objects.filter(
            patient=user
        ).select_related(
            'hospital', 'department', 'appointment_slot'
        ).order_by('-created_at')
        
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


class CancelAppointmentView(APIView):
    """Cancel an appointment"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, appointment_id):
        user = request.user
        
        try:
            appointment = Appointment.objects.get(id=appointment_id, patient=user)
        except Appointment.DoesNotExist:
            return Response({
                'error': 'Appointment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if appointment can be cancelled
        if appointment.status in ['completed', 'cancelled']:
            return Response({
                'error': f'Cannot cancel {appointment.status} appointment'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cancel with refund if paid
        refund = appointment.payment_status == 'paid'
        appointment.cancel(refund=refund)
        
        return Response({
            'message': 'Appointment cancelled successfully',
            'refund_issued': refund
        }, status=status.HTTP_200_OK)


class QueueStatusView(APIView):
    """Get queue status for a hospital"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, hospital_id):
        try:
            hospital = Hospital.objects.get(id=hospital_id)
        except Hospital.DoesNotExist:
            return Response({
                'error': 'Hospital not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get waiting queue entries
        waiting_entries = QueueEntry.objects.filter(
            hospital=hospital,
            status__in=['waiting', 'in_progress']
        ).order_by('arrival_time')
        
        # Get today's confirmed appointments
        today_appointments = Appointment.objects.filter(
            hospital=hospital,
            status__in=['confirmed', 'in_progress'],
            created_at__date=timezone.now().date()
        ).count()
        
        # Calculate average wait time
        avg_wait = waiting_entries.filter(
            status='done',
            started_at__isnull=False
        ).annotate(
            wait_time=(timezone.now() - timezone.now())  # Placeholder
        ).aggregate(Avg('wait_time'))
        
        return Response({
            'hospital': {
                'id': hospital.id,
                'name': hospital.name,
            },
            'queue_status': {
                'total_waiting': waiting_entries.filter(status='waiting').count(),
                'in_progress': waiting_entries.filter(status='in_progress').count(),
                'today_appointments': today_appointments,
                'estimated_wait_minutes': 30,  # Can be calculated based on historical data
            },
            'current_queue': [
                {
                    'position': idx + 1,
                    'patient_name': entry.patient_name,
                    'status': entry.status,
                    'arrival_time': entry.arrival_time,
                }
                for idx, entry in enumerate(waiting_entries[:10])  # Show first 10
            ]
        })


class HospitalsListView(APIView):
    """Get list of hospitals"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        hospitals = Hospital.objects.all()
        serializer = HospitalSerializer(hospitals, many=True)
        return Response(serializer.data)


class DepartmentsListView(APIView):
    """Get departments for a hospital"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        hospital_id = request.query_params.get('hospital_id')
        
        if hospital_id:
            departments = Department.objects.filter(hospital_id=hospital_id)
        else:
            departments = Department.objects.all()
        
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)
