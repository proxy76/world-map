from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
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



class Post(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    country_name = models.CharField(max_length=255)
    post_text = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user_id.username} - {self.post_text[:50]}..."

    def serializer(self):
        return {
            'id': self.id,
            'user_id': self.user_id.id,
            'username': self.user_id.username,
            'country_name': self.country_name,
            'post_text': self.post_text,
            'created_at': self.created_at.isoformat(),
            'like_count': self.postlike_set.filter(liked=True).count(),
            'comment_count': self.postcomments_set.count(),
            'images': [img.serializer() for img in self.images.all()],
            'user_liked': False  # Will be set in views based on request.user
        }

class PostImages(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='user_images/')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Image for {self.post.id}"

    def serializer(self):
        return {
            'id': self.id,
            'image_url': self.image.url if self.image else None,
            'created_at': self.created_at.isoformat()
        }

class PostComments(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    comment_text = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user_id.username}: {self.comment_text[:30]}..."

    def serializer(self):
        return {
            'id': self.id,
            'user_id': self.user_id.id,
            'username': self.user_id.username,
            'comment_text': self.comment_text,
            'created_at': self.created_at.isoformat()
        }

class PostLike(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    liked = models.BooleanField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('user_id', 'post')

    def __str__(self):
        return f"{self.user_id.username} {'liked' if self.liked else 'unliked'} {self.post.id}"

    def serializer(self):
        return {
            'id': self.id,
            'user_id': self.user_id.id,
            'post_id': self.post.id,
            'liked': self.liked,
            'created_at': self.created_at.isoformat()
        }