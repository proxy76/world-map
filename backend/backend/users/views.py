from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.db.models import Q
from .models import User, Review, Post, Comment, PostPassport, Itinerary, ItineraryDay, ItineraryActivity
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
import logging
import re
import time
from django.core.cache import cache
from datetime import datetime

@csrf_exempt
@login_required
def edit_post_privacy(request, post_id):
    if request.method == 'POST':
        try:
            post = Post.objects.get(id=post_id, author=request.user)
            data = json.loads(request.body)
            is_private = data.get('isPrivate')
            if is_private is None:
                return JsonResponse({"error": "Missing isPrivate field"}, status=400)
            post.is_private = bool(is_private)
            post.save()

            # Invalidate relevant caches for immediate update
            cache.delete_many([
                f"post_details:{post_id}:{request.user.id}",
                f"post_details:{post_id}:anonymous"
            ])
            for user_type in ['anonymous', str(request.user.id)]:
                for country in ['all']:
                    for post_type in ['all']:
                        for travel_type in ['all']:
                            for theme in ['all']:
                                cache_key = f"posts:{user_type}:{country}:{post_type}:{travel_type}:{theme}"
                                cache.delete(cache_key)

            return JsonResponse({
                "message": "Post privacy updated",
                "is_private": post.is_private
            }, status=200)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found or you don't have permission"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            username = data.get("username")
            email = data.get("email")
            password = data.get("password")

            email_regex = r"[^@]+@[^@]+\.[^@]+"
            if not all([username, email, password]):
                return JsonResponse({"message": "Missing fields", "status": "failed"}, status=400)
            if not re.match(email_regex, email):
                return JsonResponse({"message": "Invalid email format", "status": "failed"}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({"message": "Username already taken", "status": "failed"}, status=403)

            user = User.objects.create_user(username=username, email=email, password=password)
            login(request, user)

            return JsonResponse({"message": "User registered and logged in", "status": "success"}, status=200)

        except Exception as e:
            return JsonResponse({"message": f"Error: {str(e)}", "status": "failed"}, status=500)

    return JsonResponse({"message": "Invalid request method", "status": "failed"}, status=405)


@csrf_exempt
def login_view(request):
    if request.user.is_authenticated:
        return JsonResponse({"message": "Already authenticated", "status": "failed"}, status=403)

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON", "status": "failed"}, status=400)

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({"message": "Username logged in", "status": "success"}, status=200)
        else:
            return JsonResponse({"message": "Username or password incorrect", "status": "failed"}, status=403)

    return JsonResponse({"message": "Method not allowed", "status": "failed"}, status=405)


@login_required
@csrf_exempt
def logout_view(request):
    logout(request)
    return JsonResponse({"message": "Username logged out", "status": "success"}, status=200)


@csrf_exempt
def user_info(request):
    if request.method == "GET":
        user = request.user
        if not user.is_authenticated:
            return JsonResponse({"error": "Unauthorized"}, status=403)

        cache_key = f"user_info:{user.id}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return JsonResponse(cached_data, status=200)

        user_data = {
            "username": user.username,
            "email": user.email,
            "countriesVisited": user.countriesVisited,
            "countriesWishlist": user.countriesWishlist,
            "profile_picture": user.profile_picture.url if user.profile_picture else None
        }

        cache.set(cache_key, user_data, timeout=60 * 5)  # 5 min cache
        return JsonResponse(user_data, status=200)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def check_login_view(request):
    if request.method == "GET":
        # short-term caching based on session key
        cache_key = f"login_status:{request.session.session_key}"
        cached_status = cache.get(cache_key)

        if cached_status is not None:
            return JsonResponse({"isLogged": cached_status}, status=200)

        is_logged = request.user.is_authenticated
        cache.set(cache_key, is_logged, timeout=30)  # short TTL
        return JsonResponse({"isLogged": is_logged}, status=200)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def add_bucketlist(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            data = json.loads(request.body)
            country = data.get('country')
            user = request.user

            if country not in user.countriesWishlist:
                user.countriesWishlist.append(country)
                user.save()

                # Invalidate user_info cache
                cache.delete(f"user_info:{user.id}")

            return JsonResponse({"isAdded": True}, status=200)
        else:
            return JsonResponse({"isAdded": False}, status=403)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def remove_bucketlist(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            try:
                data = json.loads(request.body)
                country = data.get('country')
                user = request.user

                if not country:
                    return JsonResponse({"error": "No country provided"}, status=400)

                if not user.countriesWishlist:
                    user.countriesWishlist = []

                if country in user.countriesWishlist:
                    user.countriesWishlist.remove(country)
                    user.save()

                    cache.delete(f"user_info:{user.id}")
                    return JsonResponse({"isRemoved": True}, status=200)
                else:
                    return JsonResponse({"isRemoved": False, "reason": "Country not in wishlist"}, status=404)

            except Exception as e:
                return JsonResponse({"error": str(e)}, status=500)
        else:
            return JsonResponse({"isRemoved": False, "reason": "Not authenticated"}, status=403)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def add_journal(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            data = json.loads(request.body)
            country = data.get('country')
            user = request.user

            if country not in user.countriesVisited:
                user.countriesVisited.append(country)
                user.save()
                cache.delete(f"user_info:{user.id}")

            return JsonResponse({"isAdded": True}, status=200)
        else:
            return JsonResponse({"isAdded": False}, status=403)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def remove_journal(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            data = json.loads(request.body)
            country = data.get('country')
            user = request.user

            if country in user.countriesVisited:
                user.countriesVisited.remove(country)
                user.save()
                cache.delete(f"user_info:{user.id}")

            return JsonResponse({"isRemoved": True}, status=200)
        else:
            return JsonResponse({"isRemoved": False}, status=403)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@login_required
@csrf_exempt
def add_review(request):
    if request.method == "POST":
        data = json.loads(request.body)
        country_name = data.get('country_name')
        review_text = data.get('review_text')
        user = request.user

        review = Review(
            user_id=user,
            country_name=country_name,
            review_text=review_text
        )
        review.save()

        # Invalidate cache for this country
        cache.delete(f"reviews:{country_name}")
        cache.delete(f"user_reviews:{user.id}:{country_name}")

        return JsonResponse({"isAdded": True, "review": review.serializer()}, status=200)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def view_reviews(request):
    if request.method == "POST":
        data = json.loads(request.body)
        country_name = data.get('country_name')
        cache_key = f"reviews:{country_name}"

        cached = cache.get(cache_key)
        if cached:
            return JsonResponse({"reviews": cached, "cached": True}, status=200)

        reviews = Review.objects.filter(country_name=country_name)
        serialized = [r.serializer() for r in reviews]
        cache.set(cache_key, serialized, timeout=60 * 10)
        return JsonResponse({"reviews": serialized, "cached": False}, status=200)
    return JsonResponse({"error": "Invalid method"}, status=405)


@csrf_exempt
@login_required
def view_self_reviews(request):
    if request.method == "POST":
        data = json.loads(request.body)
        country_name = data.get('country_name')
        user_id = request.user.id
        cache_key = f"user_reviews:{user_id}:{country_name}"

        cached = cache.get(cache_key)
        if cached:
            return JsonResponse({"reviews": cached, "cached": True}, status=200)

        reviews = Review.objects.filter(user_id=user_id, country_name=country_name)
        serialized = [r.serializer() for r in reviews]
        cache.set(cache_key, serialized, timeout=60 * 10)
        return JsonResponse({"reviews": serialized, "cached": False}, status=200)
    return JsonResponse({"error": "Invalid method"}, status=405)


@csrf_exempt
def update_profile_picture(request):
    if request.method == 'POST':
        if request.user.is_authenticated:
            try:
                if 'profile_picture' not in request.FILES:
                    return JsonResponse({"error": "No image uploaded"}, status=400)

                file = request.FILES['profile_picture']
                user = request.user

                if user.profile_picture and user.profile_picture.name != 'user_images/anonymous.png':
                    user.profile_picture.delete(save=False)

                user.profile_picture.save(file.name, file)
                user.save()

                cache.delete(f"user_info:{user.id}")

                return JsonResponse({
                    "message": "Profile picture updated",
                    "profile_picture": user.profile_picture.url
                }, status=200)

            except Exception as e:
                return JsonResponse({"error": str(e)}, status=500)
        else:
            return JsonResponse({"error": "Not authenticated"}, status=403)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
@login_required
def create_post(request):
    if request.method == 'OPTIONS':
        return JsonResponse({}, status=200)
    
    if request.method == 'POST':
        try:
            if request.content_type and 'multipart/form-data' in request.content_type:
                title = request.POST.get('title', '').strip()
                content = request.POST.get('content', '').strip()
                countries_visited = json.loads(request.POST.get('countries', '[]'))
                post_type = request.POST.get('postType', '')
                travel_type = request.POST.get('travelType', '')
                theme = request.POST.get('theme', '')
                is_private = request.POST.get('isPrivate', 'false').lower() == 'true'
                
                uploaded_images = []
                
                for key in request.FILES:
                    if key.startswith('images'):
                        file = request.FILES[key]
                        
                        import os
                        from django.conf import settings
                        
                        timestamp = int(time.time())
                        file_extension = os.path.splitext(file.name)[1]
                        safe_filename = f"post_{request.user.id}_{timestamp}_{len(uploaded_images)}{file_extension}"
                        
                        relative_path = f"post_images/{safe_filename}"
                        
                        post_images_dir = os.path.join(settings.MEDIA_ROOT, 'post_images')
                        os.makedirs(post_images_dir, exist_ok=True)
                        
                        full_path = os.path.join(settings.MEDIA_ROOT, relative_path)
                        
                        with open(full_path, 'wb+') as destination:
                            for chunk in file.chunks():
                                destination.write(chunk)
                        
                        uploaded_images.append(f"/media/{relative_path}")
                        
            else:
                data = json.loads(request.body)
                title = data.get('title', '').strip()
                content = data.get('content', '').strip()
                countries_visited = data.get('countries', [])
                post_type = data.get('postType', '')
                travel_type = data.get('travelType', '')
                theme = data.get('theme', '')
                is_private = data.get('isPrivate', False)
                uploaded_images = []
            
            if not title:
                return JsonResponse({"error": "Title is required"}, status=400)
            if not content:
                return JsonResponse({"error": "Content is required"}, status=400)
            if not post_type:
                return JsonResponse({"error": "Post type is required"}, status=400)
            if not travel_type:
                return JsonResponse({"error": "Travel type is required"}, status=400)
            if not theme:
                return JsonResponse({"error": "Theme is required"}, status=400)
            
            valid_post_types = [choice[0] for choice in Post.POST_TYPE_CHOICES]
            valid_travel_types = [choice[0] for choice in Post.TRAVEL_TYPE_CHOICES]
            valid_themes = [choice[0] for choice in Post.THEME_CHOICES]
            
            if post_type not in valid_post_types:
                return JsonResponse({"error": f"Invalid post_type. Valid options: {valid_post_types}"}, status=400)
            if travel_type not in valid_travel_types:
                return JsonResponse({"error": f"Invalid travel_type. Valid options: {valid_travel_types}"}, status=400)
            if theme not in valid_themes:
                return JsonResponse({"error": f"Invalid theme. Valid options: {valid_themes}"}, status=400)
            
            post = Post.objects.create(
                author=request.user,
                title=title,
                content=content,
                countries_visited=countries_visited,
                post_type=post_type,
                travel_type=travel_type,
                theme=theme,
                travel_duration=request.POST.get('travel_duration', '') if 'multipart/form-data' in str(request.content_type) else data.get('travel_duration', ''),
                images=uploaded_images,
                is_in_journal=True,
                is_private=is_private
            )
            
            # PERFORMANCE: Clear posts cache when new post is created
            # This ensures social feed shows new posts immediately
            for user_type in ['anonymous', str(request.user.id)]:
                for country in ['all']:
                    for post_type_cache in ['all']:
                        for travel_type_cache in ['all']:
                            for theme_cache in ['all']:
                                cache_key = f"posts:{user_type}:{country}:{post_type_cache}:{travel_type_cache}:{theme_cache}"
                                cache.delete(cache_key)
            
            return JsonResponse({
                "message": "Post created successfully",
                "post": post.serializer(request.user)
            }, status=201)
            
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def get_posts(request):
    if request.method == 'GET':
        try:
            # Create cache key based on filters for ultra performance
            country = request.GET.get('country')
            post_type = request.GET.get('postType')
            travel_type = request.GET.get('travelType')
            theme = request.GET.get('theme')
            user_id = request.user.id if request.user.is_authenticated else 'anonymous'
            
            cache_key = f"posts:{user_id}:{country or 'all'}:{post_type or 'all'}:{travel_type or 'all'}:{theme or 'all'}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return JsonResponse(cached_data, status=200)
            
            posts = Post.objects.all()
            
            # Filter out private posts unless they belong to the current user
            if request.user.is_authenticated:
                posts = posts.filter(
                    Q(is_private=False) | Q(author=request.user)
                )
            else:
                posts = posts.filter(is_private=False)
            
            country = request.GET.get('country')
            post_type = request.GET.get('postType')
            travel_type = request.GET.get('travelType')
            theme = request.GET.get('theme')
            
            if country:
                matching_posts = []
                for post in posts:
                    if post.countries_visited and isinstance(post.countries_visited, list):
                        for visited_country in post.countries_visited:
                            if visited_country and country.lower() == visited_country.lower():
                                matching_posts.append(post.id)
                                break
                
                if matching_posts:
                    posts = Post.objects.filter(id__in=matching_posts)
                else:
                    posts = Post.objects.none()
                        
            if post_type:
                posts = posts.filter(post_type=post_type)
            if travel_type:
                posts = posts.filter(travel_type=travel_type)
            if theme:
                posts = posts.filter(theme=theme)
                
            posts = posts.order_by('-created_at')
            
            serialized_posts = [post.serializer(request.user) for post in posts]
            
            response_data = {
                "posts": serialized_posts,
                "count": len(serialized_posts)
            }
            
            # Cache for 3 minutes for social feed performance
            cache.set(cache_key, response_data, timeout=60 * 3)
            
            return JsonResponse(response_data, status=200)
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@login_required
def get_private_posts(request):
    """Get user's private posts"""
    if request.method == 'GET':
        try:
            # Get only the current user's private posts
            posts = Post.objects.filter(
                author=request.user,
                is_private=True
            ).order_by('-created_at')
            
            serialized_posts = [post.serializer(request.user) for post in posts]
            
            response_data = {
                "posts": serialized_posts,
                "count": len(serialized_posts)
            }
            
            return JsonResponse(response_data, status=200)
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def get_post_details(request, post_id):
    if request.method == 'GET':
        try:
            # Check cache first for massive performance boost
            cache_key = f"post_details:{post_id}:{request.user.id if request.user.is_authenticated else 'anonymous'}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return JsonResponse(cached_data, status=200)
            
            post = Post.objects.get(id=post_id)
            
            user_has_stamped = False
            if request.user.is_authenticated:
                user_has_stamped = PostPassport.objects.filter(
                    user=request.user, 
                    post=post
                ).exists()
            
            post_data = post.serializer(request.user)
            post_data['userHasStamped'] = user_has_stamped
            post_data['passportStamps'] = post.passport_count
            
            # Cache for 5 minutes for ultra-fast loading
            cache.set(cache_key, post_data, timeout=60 * 5)
            
            return JsonResponse(post_data, status=200)
            
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@login_required  
def stamp_post(request, post_id):
    if request.method == 'OPTIONS':
        return JsonResponse({}, status=200)
        
    if request.method == 'POST':
        try:
            post = Post.objects.get(id=post_id)
            
            passport, created = PostPassport.objects.get_or_create(
                user=request.user,
                post=post
            )
            
            if not created:
                passport.delete()
                stamped = False
            else:
                stamped = True
            
            passport_count = PostPassport.objects.filter(post=post).count()
            
            post.passport_count = passport_count
            post.save()
            
            # CRITICAL: Invalidate all caches related to this post for immediate updates
            # Clear post details cache for all users
            cache.delete_many([
                f"post_details:{post_id}:{request.user.id}",
                f"post_details:{post_id}:anonymous"
            ])
            
            # Clear posts listing cache (this will force refresh of social feed)
            cache_pattern = f"posts:*"
            # Note: In production, you might want to use a more sophisticated cache invalidation
            # For now, we'll clear the most common cache keys
            for user_type in ['anonymous', str(request.user.id)]:
                for country in ['all']:
                    for post_type in ['all']:
                        for travel_type in ['all']:
                            for theme in ['all']:
                                cache_key = f"posts:{user_type}:{country}:{post_type}:{travel_type}:{theme}"
                                cache.delete(cache_key)
            
            return JsonResponse({
                "stamped": stamped,
                "count": passport_count
            }, status=200)
            
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def get_post_comments(request, post_id):
    if request.method == 'GET':
        try:
            post = Post.objects.get(id=post_id)
            
            parent_comments = Comment.objects.filter(
                post=post, 
                parent_comment=None
            ).order_by('created_at')
            
            def get_comment_with_replies(comment):
                comment_data = comment.serializer()
                replies = Comment.objects.filter(parent_comment=comment).order_by('created_at')
                comment_data['replies'] = [get_comment_with_replies(reply) for reply in replies]
                return comment_data
            
            comments_data = [get_comment_with_replies(comment) for comment in parent_comments]
            
            return JsonResponse({
                "comments": comments_data,
                "count": len(comments_data)
            }, status=200)
            
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@login_required
def create_comment(request, post_id):
    if request.method == 'OPTIONS':
        return JsonResponse({}, status=200)
        
    if request.method == 'POST':
        try:
            post = Post.objects.get(id=post_id)
            data = json.loads(request.body)
            
            content = data.get('content', '').strip()
            if not content:
                return JsonResponse({"error": "Content is required"}, status=400)
            
            comment = Comment.objects.create(
                post=post,
                author=request.user,
                content=content
            )
            
            return JsonResponse({
                "message": "Comment created successfully",
                "comment": comment.serializer()
            }, status=201)
            
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found"}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@login_required
def create_reply(request, comment_id):
    if request.method == 'OPTIONS':
        return JsonResponse({}, status=200)
        
    if request.method == 'POST':
        try:
            parent_comment = Comment.objects.get(id=comment_id)
            data = json.loads(request.body)
            
            content = data.get('content', '').strip()
            if not content:
                return JsonResponse({"error": "Content is required"}, status=400)
            
            reply = Comment.objects.create(
                post=parent_comment.post,
                author=request.user,
                parent_comment=parent_comment,
                content=content
            )
            
            return JsonResponse({
                "message": "Reply created successfully",
                "reply": reply.serializer()
            }, status=201)
            
        except Comment.DoesNotExist:
            return JsonResponse({"error": "Comment not found"}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@login_required
def get_user_posts(request):
    """Get all posts by the current user"""
    if request.method == 'GET':
        try:
            posts = Post.objects.filter(author=request.user).order_by('-created_at')
            serialized_posts = [post.serializer(request.user) for post in posts]
            
            return JsonResponse({
                "posts": serialized_posts,
                "count": len(serialized_posts)
            }, status=200)
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@login_required
def toggle_post_in_journal(request, post_id):
    """Toggle whether a post is included in the user's journal"""
    if request.method == 'POST':
        try:
            post = Post.objects.get(id=post_id, author=request.user)
            post.is_in_journal = not post.is_in_journal
            post.save()
            
            return JsonResponse({
                "message": "Post journal status updated",
                "is_in_journal": post.is_in_journal
            }, status=200)
            
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found or you don't have permission"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@login_required
def get_journal_posts(request):
    """Get all posts that are included in the user's journal, grouped by country"""
    if request.method == 'GET':
        try:
            posts = Post.objects.filter(
                author=request.user, 
                is_in_journal=True
            ).order_by('-created_at')
            
            # Group posts by country
            journal_data = {}
            for post in posts:
                if post.countries_visited:
                    for country in post.countries_visited:
                        if country not in journal_data:
                            journal_data[country] = []
                        journal_data[country].append(post.serializer(request.user))
            
            return JsonResponse({
                "journal": journal_data,
                "total_posts": len(posts)
            }, status=200)
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@login_required
def get_removed_journal_posts(request):
    """Get all posts that have been removed from the user's journal"""
    if request.method == 'GET':
        try:
            posts = Post.objects.filter(
                author=request.user, 
                is_in_journal=False
            ).order_by('-created_at')
            
            serialized_posts = [post.serializer(request.user) for post in posts]
            
            return JsonResponse({
                "posts": serialized_posts,
                "count": len(serialized_posts)
            }, status=200)
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@login_required
def delete_account(request):
    """Permanently delete the user's account and all associated data"""
    if request.method == 'DELETE':
        try:
            user = request.user
            
            # Log out the user first
            logout(request)
            
            # Delete the user account (this will cascade delete all related data)
            user.delete()
            
            return JsonResponse({
                "message": "Account successfully deleted"
            }, status=200)
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@login_required
def create_itinerary(request):
    """Create a new itinerary"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Create the itinerary
            itinerary = Itinerary.objects.create(
                author=request.user,
                title=data.get('title'),
                description=data.get('description', ''),
                country=data.get('country'),
                share_to_social=data.get('shareToSocial', False)
            )
            
            # Create days and activities
            for day_data in data.get('days', []):
                day = ItineraryDay.objects.create(
                    itinerary=itinerary,
                    date=day_data.get('date'),
                    title=day_data.get('title', '')
                )
                
                for i, activity_data in enumerate(day_data.get('activities', [])):
                    # Parse time if provided (can be null)
                    time_obj = None
                    if activity_data.get('time'):
                        try:
                            time_obj = datetime.strptime(activity_data['time'], '%H:%M').time()
                        except ValueError:
                            pass
                    
                    ItineraryActivity.objects.create(
                        day=day,
                        name=activity_data.get('name', ''),
                        time=time_obj,
                        location=activity_data.get('location', ''),
                        notes=activity_data.get('notes', ''),
                        website=activity_data.get('website', ''),
                        estimated_cost=activity_data.get('estimatedCost', ''),
                        category=activity_data.get('category', 'attraction'),
                        order=i
                    )
            
            # If sharing to social, create a post with detailed itinerary
            if data.get('shareToSocial', False):
                # Create detailed content with itinerary information
                detailed_content = f"🗺️ <b>{itinerary.title}</b>\n\n "
                if itinerary.description:
                    detailed_content += f"{itinerary.description}\n\n"
                
                detailed_content += f"📍 <b>Destination:</b> {itinerary.country}\n"
                detailed_content += f"📅 <b>Duration:</b> {len(data.get('days', []))} day{'s' if len(data.get('days', [])) != 1 else ''}\n\n"
                
                # Add day-by-day breakdown
                for day_data in data.get('days', []):
                    date_str = day_data.get('date', '')
                    if date_str:
                        try:
                            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                            formatted_date = date_obj.strftime('%B %d')
                        except ValueError:
                            formatted_date = date_str
                    else:
                        formatted_date = "TBD"
                    
                    day_title = day_data.get('title', '')
                    if day_title:
                        detailed_content += f"<b>{formatted_date}:</b> {day_title}"
                    else:
                        detailed_content += f"<b>{formatted_date}:</b>"
                    
                    activities = day_data.get('activities', [])
                    if activities:
                        for activity in activities[:3]:  # Show first 3 activities
                            time_str = f" at {activity.get('time', '')}" if activity.get('time') else ""
                            detailed_content += f"• {activity.get('name', 'Activity')}{time_str}\n"
                        if len(activities) > 3:
                            detailed_content += f"• ...and {len(activities) - 3} more activities\n"
                    detailed_content += "\n"
                
                detailed_content += "🎯 Ready to explore? Check out my detailed itinerary!"
                
                # Store the full itinerary data
                itinerary_data = {
                    "itinerary_id": itinerary.id,
                    "title": itinerary.title,
                    "description": itinerary.description,
                    "country": itinerary.country,
                    "days": data.get('days', []),
                    "total_days": len(data.get('days', [])),
                    "total_activities": sum(len(day.get('activities', [])) for day in data.get('days', []))
                }
                
                Post.objects.create(
                    author=request.user,
                    title=f"🗺️ {itinerary.title}",
                    content=detailed_content,
                    countries_visited=[itinerary.country],
                    post_type='itinerariu',
                    travel_type='solo',  # Default value
                    theme='cultura',  # Default value
                    is_in_journal=True,
                    is_private=not data.get('shareToSocial', False),  # Private if not sharing to social
                    itinerary_data=itinerary_data
                )
            
            return JsonResponse({
                "message": "Itinerary created successfully",
                "itinerary": itinerary.serializer()
            }, status=201)
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@login_required
def get_user_itineraries(request):
    """Get all itineraries for the current user"""
    if request.method == 'GET':
        try:
            itineraries = Itinerary.objects.filter(author=request.user).order_by('-created_at')
            serialized_itineraries = [itinerary.serializer() for itinerary in itineraries]
            
            return JsonResponse({
                "itineraries": serialized_itineraries
            }, status=200)
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@login_required
def get_itinerary_details(request, itinerary_id):
    """Get details of a specific itinerary"""
    if request.method == 'GET':
        try:
            itinerary = Itinerary.objects.get(id=itinerary_id)
            
            # Check if user has permission to view this itinerary
            if itinerary.author != request.user and not itinerary.share_to_social:
                return JsonResponse({"error": "Permission denied"}, status=403)
            
            return JsonResponse({
                "itinerary": itinerary.serializer()
            }, status=200)
            
        except Itinerary.DoesNotExist:
            return JsonResponse({"error": "Itinerary not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@login_required
def delete_itinerary(request, itinerary_id):
    """Delete an itinerary"""
    if request.method == 'DELETE':
        try:
            itinerary = Itinerary.objects.get(id=itinerary_id, author=request.user)
            itinerary.delete()
            
            return JsonResponse({
                "message": "Itinerary deleted successfully"
            }, status=200)
            
        except Itinerary.DoesNotExist:
            return JsonResponse({"error": "Itinerary not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)