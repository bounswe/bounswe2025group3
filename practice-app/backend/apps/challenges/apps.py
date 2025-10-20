from django.apps import AppConfig


class ChallangesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.challenges'

    def ready(self):
        import apps.challenges.signals
