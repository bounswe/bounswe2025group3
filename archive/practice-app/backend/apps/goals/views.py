from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from .models import Goal, GoalTemplate
from apps.waste.models import WasteCategory, WasteLog, SubCategory

@login_required
def goals_list(request):
    """View for displaying all user goals and goal templates"""
    # Get user's goals
    goals = Goal.objects.filter(user=request.user)
    
    # Add progress percentage to each goal
    for goal in goals:
        if goal.target is not None and goal.target > 0:
            goal.progress_percentage = min(100, (goal.progress / goal.target) * 100)
        else:
            goal.progress_percentage = 0 # Avoid division by zero or None target
    
    # Get goal templates
    goal_templates = GoalTemplate.objects.all()
    
    context = {
        'goals': goals,
        'goal_templates': goal_templates,
    }
    
    return render(request, 'goals/goals_list.html', context)

@login_required
def goal_detail(request, goal_id):
    """View for displaying details of a specific goal"""
    goal = get_object_or_404(Goal, id=goal_id, user=request.user)
    
    # Calculate progress percentage
    if goal.target is not None and goal.target > 0:
        goal.progress_percentage = min(100, (goal.progress / goal.target) * 100)
    else:
        goal.progress_percentage = 0 # Avoid division by zero or None target
    
    # Calculate remaining amount
    goal.remaining = max(0, goal.target - goal.progress)
    
    # Get related waste logs
    waste_logs = WasteLog.objects.filter(
        user=request.user,
        sub_category__category=goal.category
    ).order_by('-date_logged')[:5]  # Get 5 most recent, changed to date_logged
    
    # Get today's date for the log form
    today = timezone.now().date()
    
    # Get sub-categories for the modal dropdown
    sub_categories = SubCategory.objects.filter(category=goal.category, is_active=True)
    
    context = {
        'goal': goal,
        'waste_logs': waste_logs,
        'today': today,
        'sub_categories': sub_categories,
    }
    
    return render(request, 'goals/goal_detail.html', context)

@login_required
def goal_create(request):
    """View for creating a new goal"""
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
                return redirect('goal_detail', goal_id=goal.id)
            except (WasteCategory.DoesNotExist, ValueError):
                pass  # Handle in the template with error message
    
    # GET request or form validation failed
    waste_categories = WasteCategory.objects.all()
    
    context = {
        'waste_categories': waste_categories,
    }
    
    return render(request, 'goals/goal_create.html', context)

@login_required
def create_from_template(request, template_id):
    """View for creating a goal from a template"""
    template = get_object_or_404(GoalTemplate, id=template_id)
    
    # Create a new goal based on the template
    goal = Goal.objects.create(
        user=request.user,
        category=template.category,
        goal_type='reduction',  # Default, can be customized
        timeframe=template.timeframe,
        target=template.target,
    )
    
    return redirect('goal_detail', goal_id=goal.id) 