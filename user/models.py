import random

from django.db import models
from django import forms


# Create your models here.
from login.models import User


class User_self(models.Model):
    # username = models.CharField(max_length=128, unique=True, primary_key=True, null=False, default='')
    user = models.OneToOneField(to="login.User", to_field="username", on_delete=models.CASCADE, primary_key=True)
    icon = models.TextField(null=True, default="img/wp-1.jpg")
    collects = models.TextField(null=True, default="")


class User_subcriber(models.Model):
    sub_user = models.ForeignKey(User, on_delete=models.SET_DEFAULT, related_name="subscriber", default=None)
    fol_user = models.ForeignKey(User, on_delete=models.SET_DEFAULT, related_name="follower", default=None)
    time = models.TextField(max_length=64)


class User_Detail(models.Model):
    # 外键关联用户表
    user = models.OneToOneField(to="login.User", to_field="username", on_delete=models.CASCADE, primary_key=True)

    # like数
    user_like = models.IntegerField(default=0)
    # 用户评论


class Audio(models.Model):
    audio_name = models.CharField(max_length=64)
    audio_creater = models.ForeignKey(User_self, on_delete=models.CASCADE)
    audio_create_time = models.TextField(max_length=64)
    audio_like_num = models.IntegerField(default=0)
    audio_link = models.TextField(max_length=128, default="")

class User_Review(models.Model):
    user_sender = models.ForeignKey(User, on_delete=models.SET_DEFAULT, related_name="sender", default=None)
    user_receiver = models.ForeignKey(User, on_delete=models.SET_DEFAULT, related_name="receiver", default=None)
    content = models.TextField(default="")
    time = models.TextField(max_length=64, default="")

