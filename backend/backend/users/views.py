from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from .models import User, Review
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
import logging
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import Post, PostImages, PostComments, PostLike

@csrf_exempt
def register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print("Received registration data:", data)  # DEBUG LINE

            username = data.get("username")
            email = data.get("email")
            password = data.get("password")

            if not all([username, email, password]):
                return JsonResponse({"message": "Missing fields", "status": "failed"}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({"message": "Username already taken", "status": "failed"}, status=403)

            user = User.objects.create_user(username=username, email=email, password=password)
            print("User created:", user)  # DEBUG LINE

            login(request, user)
            print("User logged in")  # DEBUG LINE

            return JsonResponse({"message": "User registered and logged in", "status": "success"}, status=200)

        except Exception as e:
            print("Registration error:", str(e))  # This will print the exact error
            return JsonResponse({"message": f"Error: {str(e)}", "status": "failed"}, status=500)

    return JsonResponse({"message": "Invalid request method", "status": "failed"}, status=405)

@csrf_exempt
def login_view(request):
    if request.user.is_authenticated:
        logging.warning(f"User already authenticated: {request.user}")
        return JsonResponse({"message": "Already authenticated", "status": "failed"}, status=403)

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
        except json.JSONDecodeError:
            return JsonResponse({"message": "Invalid JSON", "status": "failed"}, status=400)

        logging.warning(f"Attempting to authenticate: {username}")
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            logging.warning(f"User logged in successfully: {request.user}")
            return JsonResponse({"message": "Username logged in", "status": "success"}, status=200)
        else:
            logging.warning(f"Authentication failed for: {username}")
            return JsonResponse({"message": "Username or password incorrect", "status": "failed"}, status=403)

    return JsonResponse({"message": "Method not allowed", "status": "failed"}, status=405)

@login_required
@csrf_exempt
def logout_view(request):
    if request.user.is_authenticated:
        logout(request)
        return JsonResponse({"message": "Username logged out", "status": "success"}, status=200)
    else:
        return JsonResponse({"message": "User not logged in", "status": "failed"}, status=403)

@csrf_exempt
def user_info(request):
    if request.method == "GET":
        user = request.user
        if not user.is_authenticated:
            return JsonResponse({"error": "Unauthorized"}, status=403)

        user_data = {
            "username": user.username,
            "email": user.email,
            "countriesVisited": user.countriesVisited,
            "countriesWishlist": user.countriesWishlist,
        }
        return JsonResponse(user_data, status=200)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def check_login_view(request):
    if request.method == "GET":
        if request.user.is_authenticated:
            return JsonResponse({"isLogged": True}, status=200)
        else:
            return JsonResponse({"isLogged": False}, status=200)
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

        return JsonResponse({"isAdded": True, "review": review.serializer()}, status=200)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def view_reviews(request):
    if request.method == "POST":
        data = json.loads(request.body)
        country_name = data.get('country_name')
        reviews = Review.objects.filter(country_name=country_name)
        return JsonResponse({"reviews": [r.serializer() for r in reviews]}, status=200)
    return JsonResponse({"error": "Invalid method"}, status=405)

@csrf_exempt
@login_required
def view_self_reviews(request):
    if request.method == "POST":
        data = json.loads(request.body)
        country_name = data.get('country_name')
        reviews = Review.objects.filter(user_id=request.user.id, country_name=country_name)
        return JsonResponse({"reviews": [r.serializer() for r in reviews]}, status=200)
    return JsonResponse({"error": "Invalid method"}, status=405)

@csrf_exempt
@login_required
def get_posts(request):
    if request.method == "GET":
        posts = Post.objects.all()
        posts_data = []
        
        for post in posts:
            post_data = post.serializer()
            # Check if current user liked this post
            user_like = PostLike.objects.filter(user_id=request.user, post=post, liked=True).first()
            post_data['user_liked'] = bool(user_like)
            posts_data.append(post_data)
        
        return JsonResponse({"posts": posts_data}, status=200)
    return JsonResponse({"error": "Invalid method"}, status=405)

@csrf_exempt
@login_required
def add_post(request):
    if request.method == "POST":
        data = json.loads(request.body)
        country_name = data.get('country_name')
        post_text = data.get('post_text')
        
        if not country_name or not post_text:
            return JsonResponse({"error": "Missing required fields"}, status=400)
        
        post = Post.objects.create(
            user_id=request.user,
            country_name=country_name,
            post_text=post_text
        )
        
        return JsonResponse({"message": "Post created successfully", "post_id": post.id}, status=201)
    return JsonResponse({"error": "Invalid method"}, status=405)

@csrf_exempt
@login_required
def add_post_image(request):
    if request.method == "POST":
        post_id = request.POST.get('post_id')
        image = request.FILES.get('image')
        
        if not post_id or not image:
            return JsonResponse({"error": "Missing post_id or image"}, status=400)
        
        try:
            post = Post.objects.get(id=post_id, user_id=request.user)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found"}, status=404)
        
        post_image = PostImages.objects.create(
            post=post,
            image=image
        )
        
        return JsonResponse({"message": "Image uploaded successfully", "image_id": post_image.id}, status=201)
    return JsonResponse({"error": "Invalid method"}, status=405)

@csrf_exempt
@login_required
def toggle_like(request):
    if request.method == "POST":
        data = json.loads(request.body)
        post_id = data.get('post_id')
        
        if not post_id:
            return JsonResponse({"error": "Missing post_id"}, status=400)
        
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found"}, status=404)
        
        post_like, created = PostLike.objects.get_or_create(
            user_id=request.user,
            post=post,
            defaults={'liked': True}
        )
        
        if not created:
            post_like.liked = not post_like.liked
            post_like.save()
        
        like_count = post.postlike_set.filter(liked=True).count()
        
        return JsonResponse({
            "message": "Like toggled successfully",
            "liked": post_like.liked,
            "like_count": like_count
        }, status=200)
    return JsonResponse({"error": "Invalid method"}, status=405)

@csrf_exempt
@login_required
def add_comment(request):
    if request.method == "POST":
        data = json.loads(request.body)
        post_id = data.get('post_id')
        comment_text = data.get('comment_text')
        
        if not post_id or not comment_text:
            return JsonResponse({"error": "Missing required fields"}, status=400)
        
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found"}, status=404)
        
        comment = PostComments.objects.create(
            post=post,
            user_id=request.user,
            comment_text=comment_text
        )
        
        return JsonResponse({
            "message": "Comment added successfully",
            "comment": comment.serializer()
        }, status=201)
    return JsonResponse({"error": "Invalid method"}, status=405)

@csrf_exempt
@login_required
def get_comments(request):
    if request.method == "POST":
        data = json.loads(request.body)
        post_id = data.get('post_id')
        
        if not post_id:
            return JsonResponse({"error": "Missing post_id"}, status=400)
        
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found"}, status=404)
        
        comments = PostComments.objects.filter(post=post)
        
        return JsonResponse({
            "comments": [comment.serializer() for comment in comments]
        }, status=200)
    return JsonResponse({"error": "Invalid method"}, status=405)

@csrf_exempt
@login_required
def remove_post(request):
    if request.method == "POST":
        data = json.loads(request.body)
        post_id = data.get('post_id')
        
        if not post_id:
            return JsonResponse({"error": "Missing post_id"}, status=400)
        
        try:
            post = Post.objects.get(id=post_id, user_id=request.user)
            post.delete()
            return JsonResponse({"message": "Post removed successfully"}, status=200)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found or not authorized"}, status=404)
    return JsonResponse({"error": "Invalid method"}, status=405)

@csrf_exempt
@login_required
def remove_comment(request):
    if request.method == "POST":
        data = json.loads(request.body)
        comment_id = data.get('comment_id')
        
        if not comment_id:
            return JsonResponse({"error": "Missing comment_id"}, status=400)
        
        try:
            comment = PostComments.objects.get(id=comment_id, user_id=request.user)
            comment.delete()
            return JsonResponse({"message": "Comment removed successfully"}, status=200)
        except PostComments.DoesNotExist:
            return JsonResponse({"error": "Comment not found or not authorized"}, status=404)
    return JsonResponse({"error": "Invalid method"}, status=405)

@csrf_exempt
@login_required
def get_user_posts(request):
    if request.method == "GET":
        posts = Post.objects.filter(user_id=request.user)
        posts_data = []
        
        for post in posts:
            post_data = post.serializer()
            post_data['user_liked'] = True  # User always likes their own posts conceptually
            posts_data.append(post_data)
        
        return JsonResponse({"posts": posts_data}, status=200)
    return JsonResponse({"error": "Invalid method"}, status=405)

