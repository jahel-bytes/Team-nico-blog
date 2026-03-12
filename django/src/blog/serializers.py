from rest_framework import serializers
from .models import Comment, Like, Post
from users.serializers import UserSerializer


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    excerpt = serializers.CharField(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id", "author", "title", "content", "excerpt", "created_at", "updated_at",
            "public_access", "authenticated_access", "team_access", "owner_access",
            "likes_count", "comments_count", "can_edit",
        ]
        read_only_fields = ["author", "created_at", "updated_at"]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_can_edit(self, obj):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            return obj.can_write(request.user)
        return False


class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ["id", "user", "post", "created_at"]
        read_only_fields = ["user", "created_at"]


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "user", "post", "text", "created_at"]
        read_only_fields = ["user", "created_at"]
