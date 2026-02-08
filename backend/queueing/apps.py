from django.apps import AppConfig


class QueueingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'queueing'

    def ready(self):
        # Import signal handlers for websocket broadcasts
        from . import signals  # noqa: F401
        # Import MongoDB sync signal handlers
        from . import mongo_sync  # noqa: F401
