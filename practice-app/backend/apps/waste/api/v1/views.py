from apps.waste.services.scoring import calculate_score, update_user_aggregates
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound, PermissionDenied
from apps.waste.models import (
    WasteCategory, SubCategory, WasteLog, CustomCategoryRequest, WasteSuggestion, SustainableAction
)
from .serializers import (
    WasteCategorySerializer, SubCategorySerializer, WasteLogSerializer,
    CustomCategoryRequestSerializer, WasteSuggestionSerializer, SustainableActionSerializer
)

# WasteCategory Views
class WasteCategoryListView(generics.ListAPIView):
    queryset = WasteCategory.objects.filter(is_active=True)
    serializer_class = WasteCategorySerializer
    permission_classes = [permissions.AllowAny]

class WasteCategoryDetailView(generics.RetrieveAPIView):
    queryset = WasteCategory.objects.all()
    serializer_class = WasteCategorySerializer
    permission_classes = [permissions.AllowAny]

# SubCategory Views
class SubCategoryListView(generics.ListAPIView):
    queryset = SubCategory.objects.filter(is_active=True)
    serializer_class = SubCategorySerializer
    permission_classes = [permissions.AllowAny]

class SubCategoryDetailView(generics.RetrieveAPIView):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [permissions.AllowAny]

# WasteLog Views
class WasteLogListCreateView(generics.ListCreateAPIView):
    serializer_class = WasteLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only show logs of the current authenticated user
        return WasteLog.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        log = serializer.save(user=self.request.user)
        self.request.user.total_score += log.get_score()
        self.request.user.save()

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        # After saving the log, return updated aggregates too
        #aggregates = update_user_aggregates(request.user)

        #response.data['aggregates'] = aggregates
        
        return response

class WasteLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WasteLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WasteLog.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        old_log = self.get_object()
        old_score = old_log.get_score()
        log = serializer.save()
        new_score = log.get_score()
        self.request.user.total_score += (new_score - old_score)
        self.request.user.save()

    def perform_destroy(self, instance):
        self.request.user.total_score -= instance.get_score()
        self.request.user.save()
        instance.delete()

# CustomCategoryRequest Views
class CustomCategoryRequestCreateView(generics.CreateAPIView):
    serializer_class = CustomCategoryRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

class AdminCustomCategoryRequestListView(generics.ListAPIView):
    queryset = CustomCategoryRequest.objects.all()
    serializer_class = CustomCategoryRequestSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminCustomCategoryRequestApproveView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            req = CustomCategoryRequest.objects.get(pk=pk)
        except CustomCategoryRequest.DoesNotExist:
            raise NotFound("Custom category request not found.")
        if req.status != 'pending':
            return Response({'detail': 'Request already processed.'}, status=status.HTTP_400_BAD_REQUEST)
        req.status = 'approved'
        req.save()
        return Response({'detail': 'Request approved.'})

class AdminCustomCategoryRequestRejectView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            req = CustomCategoryRequest.objects.get(pk=pk)
        except CustomCategoryRequest.DoesNotExist:
            raise NotFound("Custom category request not found.")
        if req.status != 'pending':
            return Response({'detail': 'Request already processed.'}, status=status.HTTP_400_BAD_REQUEST)
        req.status = 'rejected'
        req.save()
        return Response({'detail': 'Request rejected.'})

# WasteSuggestion Views
class WasteSuggestionListView(generics.ListAPIView):
    queryset = WasteSuggestion.objects.all()
    serializer_class = WasteSuggestionSerializer
    permission_classes = [permissions.AllowAny]

# SustainableAction Views
class SustainableActionListCreateView(generics.ListCreateAPIView):
    serializer_class = SustainableActionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SustainableAction.objects.filter(user=self.request.user)

# User Waste Score View
class UserWasteScoreView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_score = request.user.total_score
        return Response({'user_id': request.user.id, 'total_score': total_score})