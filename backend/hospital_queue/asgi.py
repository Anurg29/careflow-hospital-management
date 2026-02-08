import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

import queueing.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_queue.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        'http': django_asgi_app,
        'websocket': AuthMiddlewareStack(
            URLRouter(queueing.routing.websocket_urlpatterns)
        ),
    }
)
