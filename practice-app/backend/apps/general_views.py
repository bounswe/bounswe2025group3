from django.shortcuts import render, redirect

def dashboard_view(request):
    """Placeholder for dashboard view"""
    context = {
        'title': 'Dashboard',
        'message': 'The dashboard will show your waste statistics, goals progress, and recent activities.'
    }
    return render(request, 'placeholder.html', context)

def goals_view(request):
    """Redirect to the goals list view"""
    return redirect('goals_list')

def challenges_view(request):
    """Placeholder for challenges view"""
    context = {
        'title': 'Challenges',
        'message': 'Participate in sustainability challenges and earn rewards.'
    }
    return render(request, 'placeholder.html', context)

def leaderboard_view(request):
    """Placeholder for leaderboard view"""
    context = {
        'title': 'Leaderboard',
        'message': 'See how you rank among other users in waste reduction efforts.'
    }
    return render(request, 'placeholder.html', context)

def not_found_view(request, exception=None):
    """Custom 404 page"""
    context = {
        'title': 'Page Not Found',
        'message': 'The page you are looking for does not exist. Please check the URL or navigate using the menu.',
        'back_url': '/'
    }
    return render(request, 'placeholder.html', context)
