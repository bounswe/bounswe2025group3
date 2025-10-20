from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import models
from .models import WasteLog, WasteCategory, SubCategory, CustomCategoryRequest, WasteSuggestion
from django.db.models import Sum, Count, Q
from django.utils import timezone
from django.http import Http404

@login_required
def waste_index(request):
    """Display all waste logs for the current user"""
    waste_logs = WasteLog.objects.filter(user=request.user).order_by('-date_logged')
    
    # Calculate statistics
    total_score = waste_logs.aggregate(Sum('quantity'))
    total_logs = waste_logs.count()
    
    # Find most common category
    category_counts = {}
    for log in waste_logs:
        try:
            category_name = log.sub_category.category.name
            if category_name in category_counts:
                category_counts[category_name] += 1
            else:
                category_counts[category_name] = 1
        except AttributeError:
            # Handle case where sub_category might be None
            continue
    
    most_common_category = "None" if not category_counts else max(category_counts, key=category_counts.get)
    
    context = {
        'waste_logs': waste_logs,
        'total_score': total_score['quantity__sum'] if total_score['quantity__sum'] is not None else 0,
        'total_logs': total_logs,
        'most_common_category': most_common_category
    }
    
    return render(request, 'waste/index.html', context)

@login_required
def waste_add(request):
    """Add a new waste log"""
    categories = WasteCategory.objects.filter(is_active=True)
    subcategories = SubCategory.objects.filter(is_active=True)
    
    if request.method == 'POST':
        try:
            subcategory_id = request.POST.get('subcategory')
            subcategory = get_object_or_404(SubCategory, id=subcategory_id)
            
            waste_log = WasteLog(
                user=request.user,
                sub_category=subcategory,
                quantity=request.POST.get('quantity'),
                disposal_date=request.POST.get('disposal_date') or None,
                disposal_location=request.POST.get('disposal_location') or None,
            )
            
            if 'disposal_photo' in request.FILES:
                waste_log.disposal_photo = request.FILES['disposal_photo']
                
            waste_log.save()
            messages.success(request, 'Waste log added successfully!')
            return redirect('waste_detail', waste_id=waste_log.id)
        except Exception as e:
            messages.error(request, f"Error saving waste log: {str(e)}")
    
    context = {
        'categories': categories,
        'subcategories': subcategories,
    }
    
    return render(request, 'waste/add.html', context)

@login_required
def waste_detail(request, waste_id):
    """View details of a specific waste log"""
    try:
        waste_log = get_object_or_404(WasteLog, id=waste_id, user=request.user)
        
        # Get related waste suggestions
        suggestions = WasteSuggestion.objects.filter(
            Q(related_category=waste_log.sub_category.category) | 
            Q(related_subcategory=waste_log.sub_category)
        ).order_by('?')[:3]  # Random selection, limited to 3
    except (WasteLog.DoesNotExist, AttributeError):
        # If waste log not found or has None values in related fields
        messages.error(request, "The requested waste log was not found or is invalid.")
        return redirect('waste_index')
    
    context = {
        'waste_log': waste_log,
        'suggestions': suggestions if 'suggestions' in locals() else [],
    }
    
    return render(request, 'waste/detail.html', context)

@login_required
def waste_edit(request, waste_id):
    """Edit an existing waste log"""
    try:
        waste_log = get_object_or_404(WasteLog, id=waste_id, user=request.user)
        categories = WasteCategory.objects.filter(is_active=True)
        subcategories = SubCategory.objects.filter(is_active=True)
        
        if request.method == 'POST':
            try:
                subcategory_id = request.POST.get('subcategory')
                subcategory = get_object_or_404(SubCategory, id=subcategory_id)
                
                waste_log.sub_category = subcategory
                waste_log.quantity = request.POST.get('quantity')
                waste_log.disposal_date = request.POST.get('disposal_date') or None
                waste_log.disposal_location = request.POST.get('disposal_location') or None
                
                if 'disposal_photo' in request.FILES:
                    waste_log.disposal_photo = request.FILES['disposal_photo']
                    
                waste_log.save()
                messages.success(request, 'Waste log updated successfully!')
                return redirect('waste_detail', waste_id=waste_log.id)
            except Exception as e:
                messages.error(request, f"Error updating waste log: {str(e)}")
    except (WasteLog.DoesNotExist, Http404):
        messages.error(request, "The requested waste log was not found.")
        return redirect('waste_index')
    
    context = {
        'waste_log': waste_log,
        'categories': categories,
        'subcategories': subcategories,
    }
    
    return render(request, 'waste/edit.html', context)

@login_required
def waste_delete(request, waste_id):
    """Delete a waste log"""
    try:
        waste_log = get_object_or_404(WasteLog, id=waste_id, user=request.user)
        
        if request.method == 'POST':
            waste_log.delete()
            messages.success(request, 'Waste log deleted successfully!')
            return redirect('waste_index')
        
        return redirect('waste_detail', waste_id=waste_log.id)
    except (WasteLog.DoesNotExist, Http404):
        messages.error(request, "The requested waste log was not found.")
        return redirect('waste_index')

@login_required
def custom_category_request(request):
    """Request a new custom category"""
    categories = WasteCategory.objects.filter(is_active=True)
    user_requests = CustomCategoryRequest.objects.filter(user=request.user).order_by('-id')
    
    if request.method == 'POST':
        try:
            category_request = CustomCategoryRequest(
                user=request.user,
                name=request.POST.get('name'),
                description=request.POST.get('description'),
                unit=request.POST.get('unit'),
            )
            
            suggested_category_id = request.POST.get('suggested_category')
            if suggested_category_id:
                category_request.suggested_category = get_object_or_404(WasteCategory, id=suggested_category_id)
                
            category_request.save()
            messages.success(request, 'Your category request has been submitted and is pending review.')
            return redirect('waste_index')
        except Exception as e:
            messages.error(request, f"Error submitting category request: {str(e)}")
    
    context = {
        'categories': categories,
        'user_requests': user_requests,
    }
    
    return render(request, 'waste/custom_category_request.html', context)
