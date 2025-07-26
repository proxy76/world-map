from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import date

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
    POST_TYPE_CHOICES = [
        ('jurnal', 'Jurnal'),
        ('recenzie', 'Recenzie'),
        ('itinerariu', 'Itinerariu'),
        ('sfaturi', 'Sfaturi & Ghiduri'),
        ('intrebari', 'Întrebări pentru Comunitate'),
    ]
    
    TRAVEL_TYPE_CHOICES = [
        ('solo', 'Solo'),
        ('family', 'Familie'),
        ('friends', 'Grup de Prieteni'),
        ('honeymoon', 'Luna de Miere'),
        ('business', 'Muncă'),
        ('guided_tour', 'Tur Ghidat'),
        ('couple', 'Cuplu'),
        ('backpacking', 'Backpacking'),
    ]
    
    THEME_CHOICES = [
        ('natura', 'Natură'),
        ('mare', 'Mare'),
        ('cultura', 'Cultură'),
        ('gastronomie', 'Gastronomie'),
        ('festival', 'Festival'),
        ('relaxare', 'Relaxare'),
        ('sport', 'Sport'),
    ]
    
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=255)
    content = models.TextField()
    countries_visited = models.JSONField(default=list)  # Lista de țări vizitate
    post_type = models.CharField(max_length=50, choices=POST_TYPE_CHOICES)
    travel_type = models.CharField(max_length=50, choices=TRAVEL_TYPE_CHOICES)
    theme = models.CharField(max_length=50, choices=THEME_CHOICES)
    travel_duration = models.CharField(max_length=100, blank=True)  # "2 săptămâni", "3 zile", etc.
    images = models.JSONField(default=list, blank=True)  # URL-uri către imagini
    passport_count = models.IntegerField(default=0)  # Count pentru "passport likes"
    is_in_journal = models.BooleanField(default=True)  # Dacă e inclus în jurnalul autorului
    is_private = models.BooleanField(default=False)  # Dacă postarea este privată (doar autorul o vede)
    itinerary_data = models.JSONField(default=dict, blank=True)  # Store full itinerary details
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def serializer(self, user=None):
        # Always include is_own_post as True/False
        is_own_post = False
        if user and hasattr(user, 'id') and self.author.id == user.id:
            is_own_post = True
        return {
            "id": self.id,
            "author": self.author.id,
            "title": self.title,
            "content": self.content,
            "countries_visited": self.countries_visited,
            "post_type": self.post_type,
            "travel_type": self.travel_type,
            "theme": self.theme,
            "travel_duration": self.travel_duration,
            "images": self.images,
            "passport_count": self.passport_count,
            "is_in_journal": self.is_in_journal,
            "is_private": self.is_private,
            "itinerary_data": self.itinerary_data,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "is_own_post": is_own_post
        }
        # Calculăm numărul real de comentarii
        comments_count = self.comments.count()
        # Verificăm dacă user-ul curent a dat stamp (dacă user este furnizat)
        user_has_stamped = False
        is_own_post = False
        if user and user.is_authenticated:
            user_has_stamped = PostPassport.objects.filter(user=user, post=self).exists()
            is_own_post = (self.author == user)
        return {
            "id": self.id,
            "author": {
                "id": self.author.id,
                "username": self.author.username,
                "avatar": self.author.profile_picture.url if self.author.profile_picture else '/anonymous.png'
            },
            "title": self.title,
            "content": self.content,
            "countries_visited": self.countries_visited,
            "post_type": self.post_type,
            "travel_type": self.travel_type,
            "theme": self.theme,
            "travel_duration": self.travel_duration,
            "images": self.images,
            "passport_count": self.passport_count,
            "comments_count": comments_count,
            "user_has_stamped": user_has_stamped,
            "is_own_post": is_own_post,
            "is_in_journal": self.is_in_journal,
            "is_private": self.is_private,
            "itinerary_data": self.itinerary_data,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

class PostPassport(models.Model):
    """Model pentru 'passport likes' - când un user vrea să încerce o locație"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='passports')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'post')  # Un user poate da un singur passport per postare

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def serializer(self):
        return {
            "id": self.id,
            "post_id": self.post.id,
            "author": {
                "id": self.author.id,
                "username": self.author.username,
                "avatar": self.author.profile_picture.url if self.author.profile_picture else '/anonymous.png'
            },
            "parent_comment_id": self.parent_comment.id if self.parent_comment else None,
            "content": self.content,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat(),
            "replies_count": self.replies.count(),
        }


class Itinerary(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    country = models.CharField(max_length=255)
    share_to_social = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def serializer(self, user=None):
        days_data = []
        for day in self.days.all().order_by('date'):
            activities_data = []
            for activity in day.activities.all().order_by('order'):
                activities_data.append({
                    "id": activity.id,
                    "name": activity.name,
                    "time": activity.time.strftime('%H:%M') if activity.time else None,
                    "location": activity.location,
                    "notes": activity.notes,
                    "website": activity.website,
                    "estimated_cost": activity.estimated_cost,
                    "category": activity.category,
                    "order": activity.order
                })
            
            days_data.append({
                "id": day.id,
                "date": day.date.isoformat(),
                "title": day.title,
                "activities": activities_data
            })

        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "country": self.country,
            "share_to_social": self.share_to_social,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "author": {
                "id": self.author.id,
                "username": self.author.username,
                "avatar": self.author.profile_picture.url if self.author.profile_picture else '/anonymous.png'
            },
            "days": days_data
        }


class ItineraryDay(models.Model):
    itinerary = models.ForeignKey(Itinerary, related_name='days', on_delete=models.CASCADE)
    date = models.DateField(default=date.today)
    title = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['date']
        unique_together = ['itinerary', 'date']


class ItineraryActivity(models.Model):
    CATEGORY_CHOICES = [
        ('attraction', 'Attraction'),
        ('restaurant', 'Restaurant'),
        ('activity', 'Activity'),
        ('transport', 'Transport'),
        ('accommodation', 'Accommodation'),
        ('shopping', 'Shopping'),
        ('other', 'Other'),
    ]

    day = models.ForeignKey(ItineraryDay, related_name='activities', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    time = models.TimeField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    estimated_cost = models.CharField(max_length=100, blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='attraction')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']