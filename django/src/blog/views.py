from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Comment, Like, Post
from .serializers import CommentSerializer, LikeSerializer, PostSerializer


class PostPagination(PageNumberPagination):
    page_size = 10

    def get_paginated_response(self, data):
        return Response({
            "count": self.page.paginator.count,
            "total_pages": self.page.paginator.num_pages,
            "current_page": self.page.number,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        })


class LikePagination(PageNumberPagination):
    page_size = 20

    def get_paginated_response(self, data):
        return Response({
            "count": self.page.paginator.count,
            "total_pages": self.page.paginator.num_pages,
            "current_page": self.page.number,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        })


class CommentPagination(PageNumberPagination):
    page_size = 10

    def get_paginated_response(self, data):
        return Response({
            "count": self.page.paginator.count,
            "total_pages": self.page.paginator.num_pages,
            "current_page": self.page.number,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        })


class PostListCreateView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        posts = [p for p in Post.objects.select_related("author", "author__team") if p.can_read(request.user)]
        paginator = PostPagination()
        page = paginator.paginate_queryset(posts, request)
        serializer = PostSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = PostSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PostDetailView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def _get_post(self, pk, user, require_write=False):
        try:
            post = Post.objects.select_related("author", "author__team").get(pk=pk)
        except Post.DoesNotExist:
            raise NotFound()
        if require_write:
            if not post.can_write(user):
                raise PermissionDenied()
        else:
            if not post.can_read(user):
                raise NotFound()
        return post

    def get(self, request, pk):
        post = self._get_post(pk, request.user)
        return Response(PostSerializer(post, context={"request": request}).data)

    def patch(self, request, pk):
        post = self._get_post(pk, request.user, require_write=True)
        serializer = PostSerializer(post, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        post = self._get_post(pk, request.user, require_write=True)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LikeListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        qs = Like.objects.select_related("user", "user__team", "post")
        post_id = request.query_params.get("post")
        user_id = request.query_params.get("user")
        if post_id:
            qs = qs.filter(post_id=post_id)
        if user_id:
            qs = qs.filter(user_id=user_id)
        # Filter to only likes on posts the user can read
        qs = [like for like in qs if like.post.can_read(request.user)]
        paginator = LikePagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(LikeSerializer(page, many=True).data)


class LikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_pk):
        try:
            post = Post.objects.get(pk=post_pk)
        except Post.DoesNotExist:
            raise NotFound()
        if not post.can_read(request.user):
            raise NotFound()
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if not created:
            like.delete()
            return Response({"liked": False})
        return Response({"liked": True}, status=status.HTTP_201_CREATED)


class CommentListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        qs = Comment.objects.select_related("user", "user__team", "post")
        post_id = request.query_params.get("post")
        user_id = request.query_params.get("user")
        if post_id:
            qs = qs.filter(post_id=post_id)
        if user_id:
            qs = qs.filter(user_id=user_id)
        qs = [c for c in qs if c.post.can_read(request.user)]
        paginator = CommentPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(CommentSerializer(page, many=True).data)


class CommentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_pk):
        try:
            post = Post.objects.get(pk=post_pk)
        except Post.DoesNotExist:
            raise NotFound()
        if not post.can_read(request.user):
            raise NotFound()
        serializer = CommentSerializer(data={"post": post.id, "text": request.data.get("text", "")})
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CommentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            comment = Comment.objects.select_related("post").get(pk=pk)
        except Comment.DoesNotExist:
            raise NotFound()
        if not comment.post.can_read(request.user):
            raise NotFound()
        if comment.user_id != request.user.id:
            raise PermissionDenied()
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
