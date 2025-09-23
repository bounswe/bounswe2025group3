from .models import Goal
from waste.models import SubCategory
from django.core.exceptions import ObjectDoesNotExist

class GoalService:

    @staticmethod
    def create(user, category_id, target, timeframe):
        category = SubCategory.objects.get(id=category_id)
        goal = Goal.objects.create(
            user=user,
            category=category,  # or set dynamically
            timeframe=timeframe,
            target=target,
        )
        return goal

    @staticmethod
    def createCustomGoal(user, parameters):
        return Goal.objects.create(user=user, **parameters)

    @staticmethod
    def update(goal_id, parameters):
        try:
            goal = Goal.objects.get(id=goal_id)
            for key, value in parameters.items():
                setattr(goal, key, value)
            goal.save()
            return True
        except Goal.DoesNotExist:
            return False

    @staticmethod
    def trackProgress(goal_id):
        try:
            goal = Goal.objects.get(id=goal_id)
            # Placeholder logic for tracking
            goal.progress = 50 
            goal.is_complete = goal.progress >= goal.target
            goal.save()
            return {
                "progress": goal.progress,
                "is_complete": goal.is_complete
            }
        except Goal.DoesNotExist:
            return None

    @staticmethod
    def getGoals(user_id, filters=None):
        queryset = Goal.objects.filter(user_id=user_id)
        if filters:
            queryset = queryset.filter(**filters)
        return list(queryset)
