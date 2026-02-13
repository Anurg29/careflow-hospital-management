"""
Payment processing views for appointment bookings
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.conf import settings
import uuid
import hashlib

from .models import Appointment, Payment


class InitiatePaymentView(APIView):
    """Initiate payment for an appointment"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        appointment_id = request.data.get('appointment_id')
        payment_gateway = request.data.get('gateway', 'test')  # Default to test mode
        
        if not appointment_id:
            return Response({
                'error': 'appointment_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get appointment
        try:
            appointment = Appointment.objects.get(id=appointment_id, patient=user)
        except Appointment.DoesNotExist:
            return Response({
                'error': 'Appointment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already paid
        if appointment.payment_status == 'paid':
            return Response({
                'error': 'Appointment is already paid'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique transaction ID
        transaction_id = f"TXN{uuid.uuid4().hex[:12].upper()}"
        
        # Create payment record
        payment = Payment.objects.create(
            appointment=appointment,
            patient=user,
            amount=appointment.payment_amount,
            currency='INR',
            payment_gateway=payment_gateway,
            transaction_id=transaction_id,
            status='pending'
        )
        
        response_data = {
            'transaction_id': payment.transaction_id,
            'amount': float(payment.amount),
            'currency': payment.currency,
            'appointment_id': appointment.id,
        }
        
        # If test mode, provide mock payment details
        if payment_gateway == 'test':
            response_data['test_mode'] = True
            response_data['message'] = 'Test mode - use any payment details to complete'
            response_data['test_payment_url'] = f'/api/patient/payment/verify/'
        elif payment_gateway == 'razorpay':
            try:
                import razorpay
            except ImportError:
                return Response({
                    'error': 'Razorpay SDK is not installed'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            key_id = getattr(settings, 'RAZORPAY_KEY_ID', None)
            key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None)
            if not key_id or not key_secret:
                return Response({
                    'error': 'Razorpay keys are not configured'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            client = razorpay.Client(auth=(key_id, key_secret))
            # Set app details for Razorpay tracking - must match PAN card or website name
            client.set_app_details({"title": "CareFlow", "version": "1.0.0"})
            try:
                order = client.order.create({
                    'amount': int(payment.amount * 100),  # Convert to paise
                    'currency': payment.currency,
                    'receipt': payment.transaction_id,
                })
            except Exception as exc:  # pragma: no cover - network/SDK errors
                return Response({
                    'error': f'Failed to create Razorpay order: {exc}'
                }, status=status.HTTP_502_BAD_GATEWAY)
            
            payment.gateway_order_id = order.get('id', '')
            payment.save(update_fields=['gateway_order_id', 'updated_at'])
            response_data['razorpay_order_id'] = order.get('id')
            response_data['razorpay_key_id'] = key_id
        
        return Response(response_data, status=status.HTTP_201_CREATED)


class VerifyPaymentView(APIView):
    """Verify and complete payment"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        transaction_id = request.data.get('transaction_id')
        payment_method = request.data.get('payment_method', 'test')
        
        # For test mode
        test_mode = request.data.get('test_mode', False)
        
        # For Razorpay
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        if not transaction_id:
            return Response({
                'error': 'transaction_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get payment
        try:
            payment = Payment.objects.get(transaction_id=transaction_id, patient=user)
        except Payment.DoesNotExist:
            return Response({
                'error': 'Payment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already processed
        if payment.status == 'success':
            return Response({
                'error': 'Payment already completed',
                'appointment_id': payment.appointment.id
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify payment based on gateway
        if payment.payment_gateway == 'test' or test_mode:
            # Test mode - always succeed
            payment.mark_success(
                gateway_payment_id=f"TEST_{uuid.uuid4().hex[:8].upper()}",
                payment_method=payment_method
            )
            
        elif payment.payment_gateway == 'razorpay':
            # Verify Razorpay signature
            if not razorpay_payment_id or not razorpay_order_id or not razorpay_signature:
                return Response({
                    'error': 'Razorpay payment details are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                import razorpay
            except ImportError:
                return Response({
                    'error': 'Razorpay SDK is not installed'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            key_id = getattr(settings, 'RAZORPAY_KEY_ID', None)
            key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None)
            
            if not key_id or not key_secret:
                return Response({
                    'error': 'Razorpay keys are not configured'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            client = razorpay.Client(auth=(key_id, key_secret))
            # Set app details for Razorpay tracking - must match PAN card or website name
            client.set_app_details({"title": "CareFlow", "version": "1.0.0"})
            
            try:
                params_dict = {
                    'razorpay_order_id': razorpay_order_id,
                    'razorpay_payment_id': razorpay_payment_id,
                    'razorpay_signature': razorpay_signature
                }
                client.utility.verify_payment_signature(params_dict)
                
                # Signature verified - mark payment as success
                payment.gateway_order_id = razorpay_order_id
                payment.gateway_signature = razorpay_signature
                payment.mark_success(
                    gateway_payment_id=razorpay_payment_id,
                    payment_method='razorpay'
                )
            except razorpay.errors.SignatureVerificationError:
                payment.mark_failed('Invalid payment signature')
                return Response({
                    'error': 'Payment verification failed'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            return Response({
                'error': f'Payment gateway {payment.payment_gateway} not yet implemented'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': 'Payment successful! Your appointment is confirmed.',
            'payment': {
                'transaction_id': payment.transaction_id,
                'amount': float(payment.amount),
                'status': payment.status,
                'paid_at': payment.paid_at,
            },
            'appointment': {
                'id': payment.appointment.id,
                'status': payment.appointment.status,
                'payment_status': payment.appointment.payment_status,
                'hospital': payment.appointment.hospital.name,
                'confirmed_at': payment.appointment.confirmed_at,
            }
        }, status=status.HTTP_200_OK)


class PaymentStatusView(APIView):
    """Check payment status"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, transaction_id):
        user = request.user
        
        try:
            payment = Payment.objects.get(transaction_id=transaction_id, patient=user)
        except Payment.DoesNotExist:
            return Response({
                'error': 'Payment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'transaction_id': payment.transaction_id,
            'amount': float(payment.amount),
            'status': payment.status,
            'payment_gateway': payment.payment_gateway,
            'paid_at': payment.paid_at,
            'appointment': {
                'id': payment.appointment.id,
                'status': payment.appointment.status,
                'payment_status': payment.appointment.payment_status,
            }
        })


class PaymentHistoryView(APIView):
    """Get payment history for patient"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.role != 'patient':
            return Response({
                'error': 'Only patients can view payment history'
            }, status=status.HTTP_403_FORBIDDEN)
        
        payments = Payment.objects.filter(patient=user).order_by('-created_at')
        
        return Response([
            {
                'transaction_id': p.transaction_id,
                'amount': float(p.amount),
                'status': p.status,
                'payment_gateway': p.payment_gateway,
                'payment_method': p.payment_method,
                'created_at': p.created_at,
                'paid_at': p.paid_at,
                'appointment': {
                    'id': p.appointment.id,
                    'hospital': p.appointment.hospital.name,
                    'department': p.appointment.department.name if p.appointment.department else None,
                }
            }
            for p in payments
        ])
