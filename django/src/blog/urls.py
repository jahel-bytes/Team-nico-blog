from django.urls import path
from .views import (
    CommentCreateView, CommentDeleteView, CommentListView,
    LikeListView, LikeToggleView,
    PostDetailView, PostListCreateView,
)

urlpatterns = [
    path("posts/", PostListCreateView.as_view()),
    path("posts/<int:pk>/", PostDetailView.as_view()),
    path("posts/<int:post_pk>/likes/", LikeToggleView.as_view()),
    path("posts/<int:post_pk>/comments/", CommentCreateView.as_view()),
    path("likes/", LikeListView.as_view()),
    path("comments/", CommentListView.as_view()),
    path("comments/<int:pk>/", CommentDeleteView.as_view()),
]
