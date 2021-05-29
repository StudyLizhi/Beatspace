# _*_ coding:'utf8' _*_
# Author: Euler
# Time: 2021/3/28 2:35 下午
from django.urls import path

from user import views

urlpatterns = [
    # path("", views.testLogin, name="login"),
    # path("upload/", views.testUpload, name="upload"),
    path("boot_test/", views.testboot, name="boot")
]