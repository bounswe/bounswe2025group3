from rest_framework import serializers
from django.contrib.auth import get_user_model
from dj_rest_auth.registration.serializers import RegisterSerializer as DjRestAuthRegisterSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer as SimpleJWTTokenObtainPairSerializer
from apps.authentication.models import UserAuthToken
from apps.user.models import CustomUser

User = get_user_model()

class CustomRegisterSerializer(DjRestAuthRegisterSerializer):
    # Disable default username field
    username = None
    # Custom username field (maps to CustomUser.username)
    username = serializers.CharField(required=True, max_length=150)
    name = serializers.CharField(required=False, max_length=255, allow_blank=True)
    surname = serializers.CharField(required=False, max_length=255, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True, max_length=100)
    country = serializers.CharField(required=False, allow_blank=True, max_length=100)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2', 'name', 'surname', 'bio', 'city', 'country', 'profile_picture']

    def validate_username(self, username):
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return username

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data.update({
            'username': self.validated_data.get('username', ''),
            'name': self.validated_data.get('name', ''),
            'surname': self.validated_data.get('surname', ''),
            'bio': self.validated_data.get('bio', ''),
            'city': self.validated_data.get('city', ''),
            'country': self.validated_data.get('country', ''),
            'profile_picture': self.validated_data.get('profile_picture', None),
        })
        return data

    def save(self, request):
        user = super().save(request)
        user.username = self.validated_data.get('username', '')
        user.name = self.validated_data.get('name', '')
        user.surname = self.validated_data.get('surname', '')
        user.bio = self.validated_data.get('bio', '')
        user.city = self.validated_data.get('city', '')
        user.country = self.validated_data.get('country', '')
        user.profile_picture = self.validated_data.get('profile_picture', None)
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        user.save()
        return user

class CustomTokenObtainPairSerializer(SimpleJWTTokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['username'] = user.username  # Include username in token
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['user_id'] = self.user.id
        return data

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAuthToken
        fields = ('token', 'user', 'expiry')

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'name', 'surname', 'bio', 'city', 'country', 'profile_picture']
        read_only_fields = ['username', 'email']  # Prevent updating username/email

    def update(self, instance, validated_data):
        # Handle profile picture separately to avoid clearing if not provided
        profile_picture = validated_data.pop('profile_picture', None)
        if profile_picture is not None:
            instance.profile_picture = profile_picture
        return super().update(instance, validated_data)