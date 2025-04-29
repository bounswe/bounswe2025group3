from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.authentication.models import UserAuthToken

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8, required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, attrs):
        password2 = attrs.get('password2')
        if password2 and attrs['password'] != password2:
            raise serializers.ValidationError({"password": "Passwords didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2', None)  # Remove password2 if it exists
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAuthToken
        fields = ('token', 'user', 'expiry')
