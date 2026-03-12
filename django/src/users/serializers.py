from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import Team, User


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["id", "name"]


class UserSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source="team.name", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "team", "team_name"]


class RegisterSerializer(serializers.Serializer):
    username = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        if User.objects.filter(username=data["username"]).exists():
            raise serializers.ValidationError({"username": "A user with this email already exists."})
        return data

    def create(self, validated_data):
        default_team, _ = Team.objects.get_or_create(name="Default Team")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["username"],
            password=validated_data["password"],
            role=User.ROLE_BLOGGER,
            team=default_team,
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data["username"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        data["user"] = user
        return data
