from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path('ws/hospitals/<int:hospital_id>/', consumers.HospitalStatusConsumer.as_asgi()),
]
