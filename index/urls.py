# _*_ coding:'utf8' _*_
# Author: Euler
# Time: 2021/3/28 1:39 下午
from django.urls import path

from index import views

from django.conf import settings

from django.conf.urls.static import static
app_name = "index"
urlpatterns = [
    path('', views.home, name="home"),
    path('virtual/', views.virtual),
    path('upload_audio/<str:filename>', views.upload_audio)
] + static(settings.STATIC_URL, document_root = settings.STATIC_ROOT)

