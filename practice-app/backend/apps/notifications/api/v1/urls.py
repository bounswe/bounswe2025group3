from django.urls import path
from .views import NotificationListView, MarkNotificationAsReadView

urlpatterns = [
    # GET: List all notifications (with optional filter for is_read)
    path('', NotificationListView.as_view(), name='notification-list'),

    # POST: Mark a specific notification as read
    path('<int:pk>/read/', MarkNotificationAsReadView.as_view(), name='notification-mark-read'),

    # POST: Mark ALL unread notifications as read
    path('mark-all-read/', MarkNotificationAsReadView.as_view(), name='notification-mark-all-read'),
]