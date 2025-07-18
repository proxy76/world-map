from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    user_address = models.CharField(max_length=255, null=True)
    countriesVisited = models.JSONField(default=list)
    countriesWishlist = models.JSONField(default=list)
    profile_picture = models.ImageField(
        upload_to='user_images/',
        default='user_images/anonymous.png'
    )   
    
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True
    )

    def serializer(self):
        return {
            "username": self.username,
            "email": self.email,
            "address": self.user_address,  # Fixed spelling typo
            "profile_picture": self.profile_picture.url if self.profile_picture else None,
            "countriesVisited": self.countriesVisited,
            "countriesWishlist": self.countriesWishlist
        }

class Review(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    country_name = models.CharField(max_length=255)
    review_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def serializer(self):
        return {
            "user_id": self.user_id.id,
            "username": self.user_id.username,
            "country_name": self.country_name,
            "review_text": self.review_text,  
            "created_at": self.created_at,
        }