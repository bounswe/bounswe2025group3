from django.urls import path
from . import views

urlpatterns = [
    path('', views.goals_list, name='goals_list'),
    path('create/', views.goal_create, name='goal_create'),
    path('<int:goal_id>/', views.goal_detail, name='goal_detail'),
    path('template/<int:template_id>/', views.create_from_template, name='create_from_template'),
] 