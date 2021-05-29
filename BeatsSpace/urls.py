"""BeatsSpace URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from os import name
from django.contrib import admin
from django.urls import re_path, path, include
from login import views as login_view
from index import views as index_view
from user import views as user_view
urlpatterns = [

    path("user/test_cluster", user_view.testcluster, name="cluster"),
    path("test_v2", user_view.test_v2, name="v2"),
    path("downloadAudio/<path:path>", index_view.downloadAudio, name="downloadAudio"),
    path("user/test_coll", user_view.testcoll, name="testcoll"),
    path('user/test_boot', user_view.testboot, name="testboot"),
    path('user/test_otherPage/<path:path>', user_view.test_otherPage, name="testOtherPage"),
    path('user/add_review', user_view.add_review, name="add_review"),
    path('user/change_music_info/', user_view.change_music_info, name="change_music_info"),
    path('user/delete_audio/', user_view.delete_audio, name="delete_audio"),
    path('user/test_settings', user_view.test_settings, name="testsettings"),
    path('user/test_subs', user_view.test_subs, name="testsubs"),
    path('newaudio/', index_view.newaudio, name="newaudio"),
    path('admin/', admin.site.urls),
    path('', include("index.urls", namespace="index")),
    path('audio/', index_view.audio, name="audio"),
    path('virtual/', index_view.virtual, name="virtual"),
    path('login/', login_view.login_new, name="login_new"),
    path('reset_password/', login_view.reset_password, name="reset_password"),
    path('register/', login_view.register, name="register"),
    path('logout/', login_view.logout, name="logout"),
    path('index/', index_view.home),
    path('email/', login_view.send_my_email),
    re_path(r'^user/([a-z0-9_]{1,15}$)', login_view.userPage),
    #re_path(r'^user/([a-z0-9_]{1,15}$/upload/)', user_view.aaaa),
    # path('user/upload/', user_view.uploadImg),
    # path('virtual/upload/', user_view.upload),
    path('captcha',include('captcha.urls')),#此行为添加captcha的固定写法
    path('login_new/', login_view.login_new),
]
# import user
'''
    views的导入格式使用from app import views as app_view
    通过app_view调用
'''
