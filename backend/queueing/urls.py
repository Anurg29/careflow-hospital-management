from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AppointmentSlotViewSet,
    BedViewSet,
    DepartmentViewSet,
    HospitalViewSet,
    LiveStatusView,
    QueueEntryViewSet,
    DashboardView,
    PatientQueueView,
)

router = DefaultRouter()
router.register(r'hospitals', HospitalViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'beds', BedViewSet)
router.register(r'queue', QueueEntryViewSet)
router.register(r'appointments', AppointmentSlotViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('status/<int:hospital_id>/', LiveStatusView.as_view(), name='live-status'),
    path('dashboard/<int:hospital_id>/', DashboardView.as_view(), name='dashboard'),
    path('patient/queue/<int:pk>/', PatientQueueView.as_view(), name='patient-queue'),
]
