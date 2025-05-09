from django.shortcuts import render

def dashboard_view(request):
    """Placeholder for dashboard view"""
    context = {
        'title': 'Dashboard',
        'message': 'The dashboard will show your waste statistics, goals progress, and recent activities.'
    }
    return render(request, 'placeholder.html', context)

def goals_view(request):
    """Placeholder for goals view"""
    context = {
        'title': 'Goals',
        'message': 'Set and track your waste reduction and sustainability goals here.'
    }
    return render(request, 'placeholder.html', context)

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
