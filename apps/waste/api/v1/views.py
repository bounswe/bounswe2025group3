from .services.scoring import calculate_score, update_user_aggregates
from rest_framework.response import Response
from rest_framework import generics, permissions
from .models import WasteLog
from .serializers import WasteLogSerializer

class WasteLogListCreateView(generics.ListCreateAPIView):
    serializer_class = WasteLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only show logs of the current authenticated user
        return WasteLog.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        category = serializer.validated_data['category']
        quantity = serializer.validated_data['quantity']

        computed_score = calculate_score(quantity, category)

        serializer.save(user=self.request.user, computed_score=computed_score)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        # After saving the log, return updated aggregates too
        aggregates = update_user_aggregates(request.user)

        response.data['aggregates'] = aggregates
        return response