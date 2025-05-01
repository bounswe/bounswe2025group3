from django.urls import path
from .views import WasteLogListCreateView

urlpatterns = [
    path('api/v1/waste-logs/', WasteLogListCreateView.as_view(), name='waste-log-list-create'),
]