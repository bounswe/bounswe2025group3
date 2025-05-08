from django.urls import path, include
from .views import (
    WasteCategoryListView, WasteCategoryDetailView,
    SubCategoryListView, SubCategoryDetailView,
    WasteLogListCreateView, WasteLogDetailView,
    CustomCategoryRequestCreateView, AdminCustomCategoryRequestListView,
    AdminCustomCategoryRequestApproveView, AdminCustomCategoryRequestRejectView,
    WasteSuggestionListView, SustainableActionListCreateView, UserWasteScoreView
)

app_name = 'waste'

admin_urlpatterns = [
    path('categories/requests/', AdminCustomCategoryRequestListView.as_view(), name='admin-custom-category-request-list'),
    path('categories/requests/<int:pk>/approve/', AdminCustomCategoryRequestApproveView.as_view(), name='admin-custom-category-request-approve'),
    path('categories/requests/<int:pk>/reject/', AdminCustomCategoryRequestRejectView.as_view(), name='admin-custom-category-request-reject'),
]

urlpatterns = [
    # Waste categories and subcategories
    path('categories/', WasteCategoryListView.as_view(), name='waste-category-list'),
    path('categories/<int:pk>/', WasteCategoryDetailView.as_view(), name='waste-category-detail'),
    path('subcategories/', SubCategoryListView.as_view(), name='subcategory-list'),
    path('subcategories/<int:pk>/', SubCategoryDetailView.as_view(), name='subcategory-detail'),

    # Waste logs
    path('logs/', WasteLogListCreateView.as_view(), name='waste-log-list-create'),
    path('logs/<int:pk>/', WasteLogDetailView.as_view(), name='waste-log-detail'),

    # Custom category requests
    path('categories/request/', CustomCategoryRequestCreateView.as_view(), name='custom-category-request-create'),

    # Suggestions
    path('suggestions/', WasteSuggestionListView.as_view(), name='waste-suggestion-list'),

    # Sustainable actions
    path('sustainable-actions/', SustainableActionListCreateView.as_view(), name='sustainable-action-list-create'),

    # User score
    path('scores/me/', UserWasteScoreView.as_view(), name='user-waste-score'),

    # Admin endpoints
    path('admin/', include((admin_urlpatterns, 'waste_admin'), namespace='waste_admin')),
]