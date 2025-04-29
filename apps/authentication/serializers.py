from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims if needed
        # token['email'] = user.email 
        # token['user_type'] = user.user_type # Example from your class diagram

        return token

    def validate(self, attrs):
        # The default validator uses username, we change it to use email
        # It leverages the custom EmailBackend we configured in settings.py
        data = super().validate(attrs) 
        
        # Add extra data to the response payload if needed
        # data['user_id'] = self.user.id
        # data['email'] = self.user.email
        
        return data 