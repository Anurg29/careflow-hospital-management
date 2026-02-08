from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from queueing.auth_views import (
    LoginView, LogoutView, ProfileView, RegisterView,
    ForgotPasswordView, ResetPasswordView
)
from queueing.patient_views import (
    PatientRegisterView, PatientLoginView, AvailableSlotsView,
    BookAppointmentView, MyAppointmentsView, CancelAppointmentView,
    QueueStatusView, HospitalsListView, DepartmentsListView
)
from queueing.payment_views import (
    InitiatePaymentView, VerifyPaymentView, PaymentStatusView,
    PaymentHistoryView
)
from queueing.admin_views import (
    AdminAppointmentsListView, AdminAppointmentDetailView,
    AdminUpdateAppointmentStatusView, AdminDashboardStatsView,
    AdminPatientsListView
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # ─── Auth endpoints (Original - for hospital admin) ───
    path('api/auth/register/', RegisterView.as_view(), name='auth-register'),
    path('api/auth/login/', LoginView.as_view(), name='auth-login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('api/auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('api/auth/profile/', ProfileView.as_view(), name='auth-profile'),
    path('api/auth/forgot-password/', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('api/auth/reset-password/', ResetPasswordView.as_view(), name='auth-reset-password'),

    # ─── Patient endpoints ───
    path('api/patient/register/', PatientRegisterView.as_view(), name='patient-register'),
    path('api/patient/login/', PatientLoginView.as_view(), name='patient-login'),
    path('api/patient/hospitals/', HospitalsListView.as_view(), name='patient-hospitals'),
    path('api/patient/departments/', DepartmentsListView.as_view(), name='patient-departments'),
    path('api/patient/available-slots/', AvailableSlotsView.as_view(), name='patient-available-slots'),
    path('api/patient/book-appointment/', BookAppointmentView.as_view(), name='patient-book-appointment'),
    path('api/patient/my-appointments/', MyAppointmentsView.as_view(), name='patient-my-appointments'),
    path('api/patient/appointments/<int:appointment_id>/cancel/', CancelAppointmentView.as_view(), name='patient-cancel-appointment'),
    path('api/patient/queue-status/<int:hospital_id>/', QueueStatusView.as_view(), name='patient-queue-status'),
    
    # ─── Payment endpoints ───
    path('api/patient/payment/initiate/', InitiatePaymentView.as_view(), name='payment-initiate'),
    path('api/patient/payment/verify/', VerifyPaymentView.as_view(), name='payment-verify'),
    path('api/patient/payment/status/<str:transaction_id>/', PaymentStatusView.as_view(), name='payment-status'),
    path('api/patient/payment/history/', PaymentHistoryView.as_view(), name='payment-history'),
    
    # ─── Admin endpoints ───
    path('api/admin/appointments/', AdminAppointmentsListView.as_view(), name='admin-appointments'),
    path('api/admin/appointments/<int:appointment_id>/', AdminAppointmentDetailView.as_view(), name='admin-appointment-detail'),
    path('api/admin/appointments/<int:appointment_id>/status/', AdminUpdateAppointmentStatusView.as_view(), name='admin-update-appointment'),
    path('api/admin/dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('api/admin/patients/', AdminPatientsListView.as_view(), name='admin-patients'),

    # ─── App API ───
    path('api/', include('queueing.urls')),
]

# Serve static files (for admin assets)
if not settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
