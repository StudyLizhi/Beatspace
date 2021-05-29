from django.shortcuts import render,redirect
from django.http import HttpResponse
from . import models
from login.models import ResetForm, User,UserForm,RegisterForm
from user.models import User_self, User_Detail

# Create your views here.
'''
    登陆注册功能
'''
#主页
def index(request):
    return render(request,'index.html')

def login_new(request):
    print(request)
    if request.session.get('is_login',None):
        user_name = request.session.get('user_name',None)
        print(user_name)
        return redirect("/user/test_boot")
    if request.method == "POST":
        login_form = UserForm(request.POST)
        # username = request.POST.get('username', None)
        # password = request.POST.get('password', None)
        message = "验证码填写错误"

        if login_form.is_valid():  # 确保用户名和密码都不为空
            username = login_form.cleaned_data['username']
            password = login_form.cleaned_data['password']
            print(username, password)
            try:
                user = models.User.objects.get(username=username)
                print("ps_stored: "+user.password)
                print("ps_input: "+password)
                if user.password == hash_code(password):
                    request.session['is_login'] = True#在session中存储用户登录状态
                    request.session['user_name'] = user.username
                    return redirect('testboot')
                else:
                    message = "密码不正确！"
            except:
                message = "用户不存在"
        return render(request, 'login_new.html', locals())
    login_form = UserForm()
    return render(request, 'login_new.html', locals())
#登录
def login(request):

    if request.session.get('is_login',None):
        user_name = request.session.get('user_name',None)
        return redirect('/user/'+str(user_name))
    if request.method == "POST":
        login_form = UserForm(request.POST)
        # username = request.POST.get('username', None)
        # password = request.POST.get('password', None)
        message = "请检查填写的内容！"

        if login_form.is_valid():  # 确保用户名和密码都不为空
            username = login_form.cleaned_data['username']
            password = login_form.cleaned_data['password']
            try:
                user = models.User.objects.get(username=username)
                
                if user.password == hash_code(password):
                    
                    request.session['is_login'] = True#在session中存储用户登录状态
                    request.session['user_name'] = user.username
                    return redirect('/user/'+str(user.username))
                else:
                    message = "密码不正确！"
            except:
                message = "用户不存在"
        return render(request, 'login.html', locals())
    login_form = UserForm()
    return render(request, 'login.html',locals())

def reset_password(request):

    if request.session.get('is_login',None):
        user_name = request.session.get('user_name',None)
        print(user_name)
    else:
        return redirect('/login')
    if request.method == "POST":
        reset_form = ResetForm(request.POST)
        # username = request.POST.get('username', None)
        # password = request.POST.get('password', None)
        message = "请检查填写的内容！"

        if reset_form.is_valid():  # 确保用户名和密码都不为空
            password_old = reset_form.cleaned_data['password_old']
            password_new = reset_form.cleaned_data['password_new']
            password_new_re = reset_form.cleaned_data['password_new_re']
            if(password_new != password_new_re):
                message = "前后密码不一致"
                return redirect('/reset_password')
            try:
                user = models.User.objects.get(username=user_name)
                if user.password == hash_code(password_old):
                    #request.session['is_login'] = True#在session中存储用户登录状态
                    #request.session['user_name'] = user.username
                
                    user.password = hash_code(password_new)
                    print("password changed to "+password_new)
                    user.save()
                    message = "修改成功"
                    return redirect('/user/'+str(user.username))
                else:
                    message = "密码不正确！"
            except:
                message = "用户不存在"
        return render(request, 'reset_password.html', locals())
    reset_form = ResetForm()
    print(reset_form)
    return render(request, 'reset_password.html',locals())

#注册
def register(request):
    print(request.session)
    if request.session.get('is_login',None):
        print(request.session)
        return redirect('/index')

    if request.method == "POST":
        message = '验证码填写错误'
        register_form = RegisterForm(request.POST)
        
        if register_form.is_valid():
            username = register_form.cleaned_data['username']
            password = register_form.cleaned_data['password']
            password_re = register_form.cleaned_data['password_re']
            phone = register_form.cleaned_data['phone']
            email = register_form.cleaned_data['email']
            email_captcha = register_form.cleaned_data['email_captcha']
            print(email_captcha)
            fo = open("email_captcha_temp.txt", "r")
            email_captcha_sent = fo.read()
            print(email_captcha_sent)
            fo.close()

            if password_re != password:
                message = '两次密码不一致'
            else:
                if email_captcha != email_captcha_sent:
                    message = '邮箱验证码输入有误'
                else:
                    same_name_user = models.User.objects.filter(username=username)
                    same_email_user = models.User.objects.filter(email=email)
                    if same_name_user:#用户名有重复
                        message = '用户已存在'
                        return render(request, 'register.html',locals())
                    elif same_email_user:
                        message = '邮箱已注册，请使用其他邮箱'
                        return render(request, 'register.html', locals())

                    new_user = User()
                    new_user.username = username
                    new_user.password = hash_code(password)
                    new_user.email = email
                    new_user.phone = phone
                    new_user.save()
                    new_user_self = User_self(user=new_user)
                    new_user_self.save()
                    new_user_detail = User_Detail(user=new_user)
                    new_user_detail.save()
                    message = '注册成功'
                    # return redirect('/user/'+new_user.username)
                    print(request.session.items())
                    return redirect('/login')
    print("invalid input form")
    register_form = RegisterForm()
    return render(request, 'register.html', locals())

#登出
def logout(request):
    #登出
    if not request.session.get('is_login',None):
        return redirect('/login')
    request.session.flush()
    return redirect('/login')


'''
    以下函数为上述四个函数中的内置函数
    hash_code:加密
'''
import hashlib
#哈希加密
def hash_code(s, salt='mysite'):  # 加密
    h = hashlib.sha256()
    s += salt
    h.update(s.encode())  # update方法只接收bytes类型
    return h.hexdigest()

#发送邮件
from django.core.mail import send_mail, send_mass_mail
from BeatsSpace import settings

import random
def send_my_email(request):
    print(bytes.decode(request.body))
    if request.method == "POST":
        email = bytes.decode(request.body)
        title = "BeatsSpace注册"
        email_captcha_sent = str(random.random())[5:11]
        email_from = settings.DEFAULT_FROM_EMAIL
        reciever = [
            email
        ]
        send_mail(title, email_captcha_sent, email_from, reciever)
        fo = open("email_captcha_temp.txt", "w")
        fo.write(email_captcha_sent)
        fo.close()
    
    return HttpResponse("ok")

def userPage(request, user_name):
    user = User.objects.filter(username=user_name).first()
    user_self = User_self.objects.filter(user=user).first()
    icon = user_self.icon
    context = {
        "icon":icon,
        "username":user_name
    }
    return render(request,'bootExer.html', context)
