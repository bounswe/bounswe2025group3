from django.urls import path
from . import views

urlpatterns = [
    path('', views.waste_index, name='waste_index'),
    path('add/', views.waste_add, name='waste_add'),
    path('<int:waste_id>/', views.waste_detail, name='waste_detail'),
    path('<int:waste_id>/edit/', views.waste_edit, name='waste_edit'),
    path('<int:waste_id>/delete/', views.waste_delete, name='waste_delete'),
    path('request-category/', views.custom_category_request, name='custom_category_request'),
]
