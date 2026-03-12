from django.contrib.auth.models import AbstractUser
from django.db import models


class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    ROLE_ADMIN = "admin"
    ROLE_BLOGGER = "blogger"
    ROLE_CHOICES = [(ROLE_ADMIN, "Admin"), (ROLE_BLOGGER, "Blogger")]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_BLOGGER)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="members")

    def __str__(self):
        return self.username

    @property
    def is_site_admin(self):
        return self.role == self.ROLE_ADMIN

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.ROLE_ADMIN
        if self.role == self.ROLE_ADMIN and not self.team:
            self.team, _ = Team.objects.get_or_create(name="admin")
        super().save(*args, **kwargs)
