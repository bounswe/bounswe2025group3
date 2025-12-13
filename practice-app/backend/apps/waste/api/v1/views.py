from apps.waste.services.scoring import calculate_score, update_user_aggregates
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, inline_serializer
from drf_spectacular.types import OpenApiTypes
from rest_framework import serializers
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from apps.waste.models import (
    WasteCategory, SubCategory, WasteLog, CustomCategoryRequest, WasteSuggestion, SustainableAction
)
from .serializers import (
    WasteCategorySerializer, SubCategorySerializer, WasteLogSerializer,
    CustomCategoryRequestSerializer, WasteSuggestionSerializer, SustainableActionSerializer,
    AdminActionResponseSerializer, UserScoreSerializer,
    UserRankingSerializer, WasteStatsItemSerializer
)
from django.contrib.auth import get_user_model

# WasteCategory Views
class WasteCategoryListView(generics.ListAPIView):
    queryset = WasteCategory.objects.filter(is_active=True)
    serializer_class = WasteCategorySerializer
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        tags=['Waste Categories'],
        summary='List waste categories',
        description='Returns a list of all active waste categories available in the system'
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

@extend_schema(
    tags=['Waste Categories'],
    summary='Get waste category details',
    description='Returns detailed information about a specific waste category',
    responses={404: None}
)
class WasteCategoryDetailView(generics.RetrieveAPIView):
    queryset = WasteCategory.objects.all()
    serializer_class = WasteCategorySerializer
    permission_classes = [permissions.AllowAny]

# SubCategory Views
@extend_schema(
    tags=['Waste Sub-Categories'],
    summary='List waste sub-categories',
    description='Returns a list of all active waste sub-categories available in the system'
)
class SubCategoryListView(generics.ListAPIView):
    queryset = SubCategory.objects.filter(is_active=True)
    serializer_class = SubCategorySerializer
    permission_classes = [permissions.AllowAny]

@extend_schema(
    tags=['Waste Sub-Categories'],
    summary='Get sub-category details',
    description='Returns detailed information about a specific waste sub-category',
    responses={404: None}
)
class SubCategoryDetailView(generics.RetrieveAPIView):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [permissions.AllowAny]

# WasteLog Views
class WasteLogListCreateView(generics.ListCreateAPIView):
    serializer_class = WasteLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        tags=['Waste Logs'],
        summary='List waste logs',
        description='Returns a list of all waste logs created by the current user',
        parameters=[
            OpenApiParameter(
                name='from_date',
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description='Filter items after this date (format: YYYY-MM-DD)',
                required=False
            ),
            OpenApiParameter(
                name='to_date',
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description='Filter items before this date (format: YYYY-MM-DD)',
                required=False
            )
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        tags=['Waste Logs'],
        summary='Create waste log',
        description='Create a new waste log entry and calculate environmental impact score',
        responses={201: None},
        examples=[
            OpenApiExample(
                'Waste Log Creation',
                value={
                    'sub_category': 1,
                    'quantity': 2.5,
                    'disposal_method': 'recycled',
                    'notes': 'Plastic bottles from lunch'
                },
                request_only=True,
            )
        ]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def get_queryset(self):
        # Only show logs of the current authenticated user
        queryset = WasteLog.objects.filter(user=self.request.user).order_by('-date_logged')
        
        # Apply date range filters if provided
        from_date = self.request.query_params.get('from_date')
        to_date = self.request.query_params.get('to_date')
        
        if from_date:
            queryset = queryset.filter(disposal_date__gte=from_date)
        if to_date:
            queryset = queryset.filter(disposal_date__lte=to_date)
            
        return queryset

    def perform_create(self, serializer):
        log = serializer.save(user=self.request.user)
        if log.sub_category:
            self.request.user.total_score += log.get_score()
            self.request.user.save()

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return response

@extend_schema(
    tags=['Waste Logs'],
    summary='Retrieve, update or delete waste log',
    description='Get details, update or delete a specific waste log entry',
    responses={
        200: WasteLogSerializer,
        404: None
    }
)
class WasteLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WasteLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WasteLog.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        old_log = self.get_object()
        old_score = old_log.get_score() if old_log.sub_category else 0
        log = serializer.save()
        new_score = log.get_score() if log.sub_category else 0
        self.request.user.total_score += (new_score - old_score)
        self.request.user.save()

    def perform_destroy(self, instance):
        if instance.sub_category:
            self.request.user.total_score -= instance.get_score()
            self.request.user.save()
        instance.delete()

# CustomCategoryRequest Views
@extend_schema(
    tags=['Custom Category Requests'],
    summary='Request new waste category',
    description='Submit a request for a new waste category to be added to the system',
    responses={
        201: CustomCategoryRequestSerializer
    }
)
class CustomCategoryRequestCreateView(generics.CreateAPIView):
    serializer_class = CustomCategoryRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

@extend_schema(
    tags=['Admin - Custom Category Requests'],
    summary='List custom category requests',
    description='Admin endpoint to view all custom category requests',
    responses={
        200: CustomCategoryRequestSerializer(many=True)
    }
)
class AdminCustomCategoryRequestListView(generics.ListAPIView):
    queryset = CustomCategoryRequest.objects.all()
    serializer_class = CustomCategoryRequestSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminCustomCategoryRequestApproveView(APIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminActionResponseSerializer
    
    @extend_schema(
        tags=['Admin - Custom Category Requests'],
        summary='Approve custom category request',
        description='Admin endpoint to approve a pending custom category request',
        responses={
            200: AdminActionResponseSerializer,
            400: AdminActionResponseSerializer,
            404: {'type': 'object', 'properties': {'detail': {'type': 'string'}}},
        }
    )
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
    serializer_class = AdminActionResponseSerializer
    
    @extend_schema(
        tags=['Admin - Custom Category Requests'],
        summary='Reject custom category request',
        description='Admin endpoint to reject a pending custom category request',
        responses={
            200: AdminActionResponseSerializer,
            400: AdminActionResponseSerializer,
            404: {'type': 'object', 'properties': {'detail': {'type': 'string'}}},
        }
    )
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
@extend_schema(
    tags=['Waste Suggestions'],
    summary='List waste suggestions',
    description='Returns a list of waste reduction and recycling suggestions',
    responses={
        200: WasteSuggestionSerializer(many=True)
    }
)
class WasteSuggestionListView(generics.ListAPIView):
    queryset = WasteSuggestion.objects.all()
    serializer_class = WasteSuggestionSerializer
    permission_classes = [permissions.AllowAny]

# SustainableAction Views
@extend_schema(
    tags=['Sustainable Actions'],
    summary='List and create sustainable actions',
    description='List user sustainable actions or record a new sustainable action',
    responses={
        200: SustainableActionSerializer(many=True),
        201: SustainableActionSerializer
    }
)
class SustainableActionListCreateView(generics.ListCreateAPIView):
    serializer_class = SustainableActionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SustainableAction.objects.filter(user=self.request.user)

# User Waste Score View
class UserWasteScoreView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserScoreSerializer
    
    @extend_schema(
        tags=['User Stats'],
        summary='Get user waste score',
        description='Returns the total environmental impact score for the authenticated user',
        responses={
            200: UserScoreSerializer
        }
    )
    def get(self, request):
        total_score = request.user.total_score
        return Response({'user_id': request.user.id, 'total_score': total_score})


class UserRankingView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserRankingSerializer

    @extend_schema(
        tags=['User Stats'],
        summary='Get user leaderboard ranking by Eco-Points',
        description='Returns a list of all users sorted by their total_score (eco-points).',
        responses={200: UserRankingSerializer(many=True)}
    )
    def get(self, request):
        user = get_user_model()
        queryset = user.objects.all().order_by('-total_score')
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    



class UserWasteStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WasteStatsItemSerializer

    @extend_schema(
        tags=["User Stats"],
        summary="Get User Waste Statistics",
        description="Retrieves aggregated waste stats (score and log count) for the authenticated user. "
                    "Stats can be grouped 'daily' (last 7 days), 'weekly' (last 4 weeks), "
                    "'monthly' (last 12 months), or 'yearly' (last 3 years).",

        parameters=[
            OpenApiParameter(
                name='period',
                type=str,
                location=OpenApiParameter.QUERY,
                description='Time period for aggregation. Defaults to "weekly".',
                enum=['daily', 'weekly', 'monthly', 'yearly'],
                default='weekly',
                required=False
            ),
            OpenApiParameter(
                name='subcategory',
                type=int,
                location=OpenApiParameter.QUERY,
                description='Filter results by SubCategory ID.',
                required=False
            )
        ],

        responses={
            200: inline_serializer(
                name='UserWasteStatsResponse',
                fields={
                    'period': OpenApiTypes.STR,
                    'data': WasteStatsItemSerializer(many=True)
                }
            ),
            400: inline_serializer(
                name='ErrorResponse400',
                fields={'detail': OpenApiTypes.STR}
            ),
        }
    )

    def get(self, request):
        # ----------- period parameter -----------
        period = request.query_params.get("period", "weekly")
        if period not in ["daily", "weekly", "monthly", "yearly"]:
            return Response(
                {"detail": "Invalid or missing period. Use daily, weekly, monthly or yearly."},
                status=400,
            )

        # ----------- subcategory filter parameter -----------
        subcat_id = request.query_params.get("subcategory")
        if subcat_id:
            try:
                subcat_id = int(subcat_id)
            except ValueError:
                return Response({"detail": "subcategory must be an integer ID."}, status=400)

            if not SubCategory.objects.filter(id=subcat_id).exists():
                return Response({"detail": "Subcategory not found."}, status=400)

        # ----------- base filtering -----------
        user = request.user
        today = timezone.now().date()

        if period == "daily":
            start_date = today - timedelta(days=6)
            delta = timedelta(days=1)

        elif period == "weekly":
            start_date = today - timedelta(weeks=4)
            delta = timedelta(weeks=1)

        elif period == "monthly":
            start_date = today.replace(day=1) - relativedelta(months=11)
            delta = relativedelta(months=1)

        else:  # yearly
            start_date = today.replace(month=1, day=1) - relativedelta(years=2)
            delta = relativedelta(years=1)

        logs = WasteLog.objects.filter(
            user=user,
            date_logged__date__gte=start_date
        )

        if subcat_id:
            logs = logs.filter(sub_category_id=subcat_id)

        logs = logs.order_by("date_logged")

        # ----------- aggregation logic -----------
        stats = []
        current_start = start_date

        while current_start <= today:
            if period == "daily":
                current_end = current_start

            elif period == "weekly":
                current_end = current_start + timedelta(days=6)

            elif period == "monthly":
                current_end = (current_start + relativedelta(months=1)) - timedelta(days=1)

            else:  # yearly
                current_end = current_start.replace(month=12, day=31)

            period_logs = [
                log for log in logs
                if current_start <= log.date_logged.date() <= current_end
            ]

            total_score = sum(log.get_score() for log in period_logs)
            total_log = len(period_logs)

            stats_item = {
                "start_date": current_start,
                "end_date": current_end,
                "total_score": float(total_score),
                "total_log": total_log,
            }

            # ----------- per-subcategory aggregation (only if no filter) -----------
            if not subcat_id:
                subcat_stats = {}

                for log in period_logs:
                    sid = log.sub_category_id
                    if sid not in subcat_stats:
                        subcat_stats[sid] = {"score": 0.0, "log": 0}

                    subcat_stats[sid]["score"] += float(log.get_score())
                    subcat_stats[sid]["log"] += 1

                for sid, values in subcat_stats.items():
                    stats_item[f"subcategory_{sid}_score"] = values["score"]
                    stats_item[f"subcategory_{sid}_log"] = values["log"]

            stats.append(stats_item)
            current_start += delta

        serializer = self.serializer_class(stats, many=True)
        return Response({"period": period, "data": serializer.data})

