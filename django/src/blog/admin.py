from django.contrib import admin
from .models import Comment, Like, Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "created_at", "public_access", "authenticated_access", "team_access", "owner_access"]
    list_filter = ["public_access", "authenticated_access"]
    search_fields = ["title", "author__username"]


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ["user", "post", "created_at"]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["user", "post", "created_at"]
    search_fields = ["text", "user__username"]
