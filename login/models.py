from django.db import models
from django import forms
from captcha.fields import CaptchaField
# Create your models here.
class User(models.Model):
    '''用户表'''
    #用户昵称，可重复
    nickname = models.CharField(max_length=128, null=True, default='')
    #用户名，不可重复
    username = models.CharField(max_length=128, unique=True, primary_key=True, null=False, default='')
    #密码
    password = models.CharField(max_length=256, null=False, default='')
    #邮箱
    email = models.EmailField(unique=True, null=False, default='')
    #手机
    phone = models.CharField(max_length=11, unique=True, null=False, default='0')
    #生成时间
    c_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
class UserForm(forms.Form):
    username = forms.CharField(label='用户名',max_length=128,widget=forms.TextInput(attrs={'class':'form-control'}))
    password = forms.CharField(label='密码',max_length=256,widget=forms.PasswordInput(attrs={'class':'form-control'}))
    captcha = CaptchaField(label = '验证码')
class RegisterForm(forms.Form):
    username = forms.CharField(label='用户名',max_length=128,widget=forms.TextInput(attrs={'class':'form-control'}))
    nickname = forms.CharField(label='昵称', max_length=128,widget=forms.TextInput(attrs={'class':'form-control'}))
    password = forms.CharField(label='密码',max_length=256,widget=forms.PasswordInput(attrs={'class':'form-control'}))
    password_re = forms.CharField(label='重复密码',max_length=256,widget=forms.PasswordInput(attrs={'class':'form-control'}))
    phone = forms.CharField(label='电话',max_length=11,widget=forms.TextInput(attrs={'class':'form-control'}))
    email = forms.EmailField(label='邮箱地址', widget=forms.EmailInput(attrs={'class': 'form-control'}))
    email_captcha = forms.CharField(label='邮箱验证码',max_length=6,widget=forms.TextInput(attrs={'class':'form-control'}))
    captcha = CaptchaField(label='验证码')
class ResetForm(forms.Form):
    password_old = forms.CharField(label='旧密码',max_length=256,widget=forms.PasswordInput(attrs={'class':'form-control'}))
    password_new = forms.CharField(label='新密码',max_length=256,widget=forms.PasswordInput(attrs={'class':'form-control'}))
    password_new_re = forms.CharField(label='重复的新密码',max_length=256,widget=forms.PasswordInput(attrs={'class':'form-control'}))
    captcha = CaptchaField(label = '验证码')
