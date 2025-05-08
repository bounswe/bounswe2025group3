from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, permission_classes
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from django.http import JsonResponse
from apps.goals.models import Goal, GoalTemplate
from apps.waste.models import WasteCategory, WasteLog
from .serializers import GoalTemplateSerializer, GoalSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, extend_schema_view
from drf_spectacular.types import OpenApiTypes

@extend_schema(
    tags=['Goal Templates'],
    summary='List all goal templates',
    description='Returns a list of all available goal templates that users can choose from',
    responses={200: GoalTemplateSerializer(many=True)}
)
class GoalTemplateListView(generics.ListAPIView):
    queryset = GoalTemplate.objects.all()
    serializer_class = GoalTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @extend_schema(
        tags=['Goals'],
        summary='List user goals',
        description='Returns a list of all goals created by the current user',
        responses={200: GoalSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Goals'],
        summary='Get goal details',
        description='Returns details of a specific goal',
        responses={200: GoalSerializer, 404: None}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['Goals'],
        summary='Create a goal',
        description='Create a new sustainability goal',
        request=GoalSerializer,
        responses={201: GoalSerializer, 400: None}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=['Goals'],
        summary='Update a goal',
        description='Update an existing goal (can only update goals that have not started)',
        request=GoalSerializer,
        responses={200: GoalSerializer, 400: None, 404: None}
    )
    def update(self, request, *args, **kwargs):
        goal = self.get_object()
        if goal.start_date <= timezone.now().date():
            return Response(
                {"detail": "Cannot update a goal that has already started."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().update(request, *args, **kwargs)
        
    @extend_schema(exclude=True)
    @action(detail=False, methods=['get'], url_path='list-view')
    def goals_list_view(self, request):
        """Template view for displaying all user goals and goal templates"""
        # Check if user is authenticated
        if not request.user.is_authenticated:
            # Redirect to login page if not authenticated
            return redirect('/login/?next=/api/v1/goals/goals/list-view/')
            
        # Get user's goals
        goals = Goal.objects.filter(user=request.user)
        
        # Add progress percentage to each goal
        for goal in goals:
            if goal.target > 0:
                goal.progress_percentage = min(100, (goal.progress / goal.target) * 100)
            else:
                goal.progress_percentage = 0
        
        # Get goal templates
        goal_templates = GoalTemplate.objects.all()
        
        context = {
            'goals': goals,
            'goal_templates': goal_templates,
        }
        
        return render(request, 'goals/goals_list.html', context)
        
    @extend_schema(exclude=True)
    @action(detail=True, methods=['get'], url_path='detail-view')
    def goal_detail_view(self, request, pk=None):
        """Template view for displaying details of a specific goal"""
        # Check if user is authenticated
        if not request.user.is_authenticated:
            # Redirect to login page if not authenticated
            return redirect('/login/?next=/api/v1/goals/goals/{}/detail-view/'.format(pk))
            
        goal = self.get_object()
        
        # Calculate progress percentage
        if goal.target > 0:
            goal.progress_percentage = min(100, (goal.progress / goal.target) * 100)
        else:
            goal.progress_percentage = 0
        
        # Calculate remaining amount
        goal.remaining = max(0, goal.target - goal.progress)
        
        # Get related waste logs
        waste_logs = WasteLog.objects.filter(
            user=request.user,
            category=goal.category
        ).order_by('-date')[:5]  # Get 5 most recent
        
        # Get today's date for the log form
        today = timezone.now().date()
        
        context = {
            'goal': goal,
            'waste_logs': waste_logs,
            'today': today,
        }
        
        return render(request, 'goals/goal_detail.html', context)
        
    @extend_schema(exclude=True)
    @action(detail=False, methods=['get', 'post'], url_path='create-view')
    def goal_create_view(self, request):
        """Template view for creating a new goal"""
        # Check if user is authenticated
        if not request.user.is_authenticated:
            # Redirect to login page if not authenticated
            return redirect('/login/?next=/api/v1/goals/goals/create-view/')
            
        if request.method == 'POST':
            category_id = request.POST.get('category')
            goal_type = request.POST.get('goal_type')
            timeframe = request.POST.get('timeframe')
            target = request.POST.get('target')
            
            # Validate form data
            if category_id and goal_type and timeframe and target:
                try:
                    category = WasteCategory.objects.get(id=category_id)
                    goal = Goal.objects.create(
                        user=request.user,
                        category=category,
                        goal_type=goal_type,
                        timeframe=timeframe,
                        target=float(target),
                    )
                    return redirect('/api/v1/goals/goals/{}/detail-view/'.format(goal.id))
                except (WasteCategory.DoesNotExist, ValueError):
                    pass  # Handle in the template with error message
        
        # GET request or form validation failed
        waste_categories = WasteCategory.objects.all()
        
        context = {
            'waste_categories': waste_categories,
        }
        
        return render(request, 'goals/goal_create.html', context)
    
    @extend_schema(
        tags=['Goals'],
        summary='Create goal from template',
        description='Create a new goal based on the selected template',
        parameters=[
            OpenApiParameter(
                name='template_id',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description='ID of the template to use',
                required=True
            )
        ],
        responses={201: GoalSerializer, 404: None}
    )
    @action(detail=False, methods=['post'], url_path='api-template/(?P<template_id>\d+)')
    def create_from_template_api(self, request, template_id=None):
        """API endpoint for creating a goal from a template"""
        template = get_object_or_404(GoalTemplate, id=template_id)
        
        # Create a new goal based on the template
        goal = Goal.objects.create(
            user=request.user,
            category=template.category,
            goal_type='reduction',  # Default, can be customized
            timeframe=template.timeframe,
            target=template.target,
        )
        
        serializer = self.get_serializer(goal)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    @extend_schema(exclude=True)
    @action(detail=False, methods=['get'], url_path='template/(?P<template_id>\d+)')
    def create_from_template_view(self, request, template_id=None):
        """Template view for creating a goal from a template"""
        # Check if user is authenticated
        if not request.user.is_authenticated:
            # Redirect to login page if not authenticated
            return redirect('/login/?next=/api/v1/goals/goals/template/{}/'.format(template_id))
            
        template = get_object_or_404(GoalTemplate, id=template_id)
        
        # Create a new goal based on the template
        goal = Goal.objects.create(
            user=request.user,
            category=template.category,
            goal_type='reduction',  # Default, can be customized
            timeframe=template.timeframe,
            target=template.target,
        )
        
        return redirect('/api/v1/goals/goals/{}/detail-view/'.format(goal.id))