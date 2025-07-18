from django.urls import path
from . import views 

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
    path("get_posts", views.get_posts, name="get_posts"),
    path("add_post", views.add_post, name="add_post"),
    path("add_post_image", views.add_post_image, name="add_post_image"),
    path("toggle_like", views.toggle_like, name="toggle_like"),
    path("add_comment", views.add_comment, name="add_comment"),
    path("get_comments", views.get_comments, name="get_comments"),
    path("remove_post", views.remove_post, name="remove_post"),
    path("remove_comment", views.remove_comment, name="remove_comment"),
    path("get_user_posts", views.get_user_posts, name="get_user_posts"),
]