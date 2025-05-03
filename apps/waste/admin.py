from django.contrib import admin
from .models import WasteLog

@admin.register(WasteLog)
class WasteLogAdmin(admin.ModelAdmin):
    list_display = ['waste_type', 'amount', 'user', 'date_logged']
    search_fields = ['waste_type', 'user__email']