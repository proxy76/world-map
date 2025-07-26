from django.urls import path
from . import views 
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("register", views.register, name="register"),
    path("logout", views.logout_view, name="logout"),
    path("login", views.login_view, name="login"),
    path("user_info", views.user_info, name="user_info"),
    path("check_login", views.check_login_view, name="check_login"),
    path("add_wishlist", views.add_bucketlist, name="add_wishlist"),
    path("add_journal", views.add_journal, name="add_journal"),
    path("remove_bucketlist", views.remove_bucketlist, name="remove_bucketlist"),
    path("remove_journal", views.remove_journal, name="remove_journal"),
    path("add_review", views.add_review, name="add_review"),
    path("view_reviews", views.view_reviews, name="view_reviews"),
    path("view_self_reviews", views.view_self_reviews, name="view_self_reviews"),
    path("update_pfp", views.update_profile_picture, name="update_pfp"),
    path("create_post", views.create_post, name="create_post"),
    path("posts/", views.get_posts, name="get_posts"),
    path("posts/private/", views.get_private_posts, name="get_private_posts"),
    path("posts/<int:post_id>/", views.get_post_details, name="get_post_details"),
    path("posts/<int:post_id>/stamp/", views.stamp_post, name="stamp_post"),
    path("posts/<int:post_id>/comments/", views.get_post_comments, name="get_post_comments"),
    path("posts/<int:post_id>/comments/create/", views.create_comment, name="create_comment"),
    path("comments/<int:comment_id>/reply/", views.create_reply, name="create_reply"),
    path("user_posts/", views.get_user_posts, name="get_user_posts"),
    path("posts/<int:post_id>/toggle_journal/", views.toggle_post_in_journal, name="toggle_post_in_journal"),
    path("posts/<int:post_id>/edit_privacy/", views.edit_post_privacy, name="edit_post_privacy"),
    path("journal_posts/", views.get_journal_posts, name="journal_posts"),
    path("removed_journal_posts/", views.get_removed_journal_posts, name="get_removed_journal_posts"),
    path("delete_account", views.delete_account, name="delete_account"),
    path("create_itinerary", views.create_itinerary, name="create_itinerary"),
    path("itineraries/", views.get_user_itineraries, name="get_user_itineraries"),
    path("itineraries/<int:itinerary_id>/", views.get_itinerary_details, name="get_itinerary_details"),
    path("itineraries/<int:itinerary_id>/delete/", views.delete_itinerary, name="delete_itinerary"),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)