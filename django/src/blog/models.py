from django.db import models
from users.models import User

ACCESS_NONE = "none"
ACCESS_READ = "read"
ACCESS_READ_WRITE = "read_write"
ACCESS_CHOICES = [
    (ACCESS_NONE, "None"),
    (ACCESS_READ, "Read Only"),
    (ACCESS_READ_WRITE, "Read & Write"),
]


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(max_length=300)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Independent read/write permissions for each audience level
    public_access = models.CharField(max_length=10, choices=ACCESS_CHOICES, default=ACCESS_READ)
    authenticated_access = models.CharField(max_length=10, choices=ACCESS_CHOICES, default=ACCESS_READ)
    team_access = models.CharField(max_length=10, choices=ACCESS_CHOICES, default=ACCESS_READ_WRITE)
    owner_access = models.CharField(max_length=10, choices=ACCESS_CHOICES, default=ACCESS_READ_WRITE)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def excerpt(self):
        return self.content[:200]

    def get_access_for_user(self, user):
        """Return the effective access level ('none', 'read', 'read_write') for a user."""
        # Admin role bypasses everything
        if user and user.is_authenticated and user.is_site_admin:
            return ACCESS_READ_WRITE

        levels = [ACCESS_NONE]

        # Public check
        if self.public_access != ACCESS_NONE:
            levels.append(self.public_access)

        if user and user.is_authenticated:
            # Authenticated check
            if self.authenticated_access != ACCESS_NONE:
                levels.append(self.authenticated_access)

            # Team check
            if self.author.team and user.team and self.author.team_id == user.team_id:
                if self.team_access != ACCESS_NONE:
                    levels.append(self.team_access)

            # Owner check
            if self.author_id == user.id:
                levels.append(self.owner_access)

        # Return the highest access level
        order = [ACCESS_NONE, ACCESS_READ, ACCESS_READ_WRITE]
        return max(levels, key=lambda x: order.index(x))

    def can_read(self, user):
        return self.get_access_for_user(user) in (ACCESS_READ, ACCESS_READ_WRITE)

    def can_write(self, user):
        return self.get_access_for_user(user) == ACCESS_READ_WRITE


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.user} likes {self.post}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.user} on {self.post}"
