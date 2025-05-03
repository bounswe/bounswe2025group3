from django.urls import path
from . import views

urlpatterns = [
    path('waste-logs/', views.WasteLogList.as_view(), name='waste-log-list'),
    path('waste-logs/<int:pk>/', views.WasteLogDetail.as_view(), name='waste-log-detail'),
]