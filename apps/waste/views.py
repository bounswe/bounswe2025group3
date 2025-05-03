from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from apps.waste.models import WasteLog
from rest_framework import serializers

class WasteLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteLog
        fields = ['id', 'user', 'waste_type', 'amount', 'date_logged']
        read_only_fields = ['user', 'date_logged']

class WasteLogList(generics.ListCreateAPIView):
    queryset = WasteLog.objects.all()
    serializer_class = WasteLogSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WasteLogDetail(generics.RetrieveAPIView):
    queryset = WasteLog.objects.all()
    serializer_class = WasteLogSerializer
    permission_classes = [IsAuthenticated]