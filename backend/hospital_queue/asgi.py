import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_queue.settings')

# Initialize Django BEFORE importing anything that uses models
django_asgi_app = get_asgi_application()

# NOW it's safe to import routing (which imports models)
import queueing.routing

application = ProtocolTypeRouter(
    {
        'http': django_asgi_app,
        'websocket': AuthMiddlewareStack(
            URLRouter(queueing.routing.websocket_urlpatterns)
        ),
    }
)
