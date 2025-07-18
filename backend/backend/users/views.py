from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from .models import User, Review
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
import logging
import re
from django.core.cache import cache

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
