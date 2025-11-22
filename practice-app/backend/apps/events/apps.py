from django.apps import AppConfig


class EventsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.events'

    def ready(self):
        import apps.events.signals
        # Import the signals module when the app is ready