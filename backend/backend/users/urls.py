from django.urls import path
from . import views 

urlpatterns = [
    path("register", views.register, name="register"),
    path("logout", views.logout_view, name="logout"),
    path("login", views.login_view, name="login"),
    path("user_info", views.user_info, name="user_info"),
    path("check_login", views.check_login_view, name="check_login")
]