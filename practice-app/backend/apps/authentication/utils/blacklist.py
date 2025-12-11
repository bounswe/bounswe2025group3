from django.conf import settings
from rest_framework import serializers


def check_blacklist(text, field_name):
    if not text:
        return

    banned = getattr(settings, "BLACKLISTED_WORDS", [])
    lower_text = text.lower()

    for word in banned:
        w = word.lower()

        if w in lower_text:
            raise serializers.ValidationError({
                field_name: f"This field contains a banned word."
            })
