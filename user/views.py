import os
import time

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from login.models import User
from user.models import User_self, Audio, User_Detail, User_Review, User_subcriber

# Create your views here.
'''  
    文件上传
'''


# def upload(request):  # 上传任意类型文件，文件存储在user/file_data中
#     if request.method == "POST":
#         File = request.FILES.get("userIcon", None)
#         if not File:
#             return HttpResponse("请选择上传的文件")
#         else:
#             username = request.session.get('user_name', default='')
#             userimg = User()
#             userimg.username = username
#             userimg.img_url = "./user/file_data/" + File.name
#             print(userimg.img_url)
#             userimg.save()
#             with open("./user/file_data/%s" % File.name, 'wb+') as f:  # 创建文件的流媒体
#                 for chunk in File.chunks():
#                     f.write(chunk)  # 存储
#                 return render(request, "userPage.html", locals())
#     else:
#         return render(request, "userPage.html", locals())


# def uploadImg(request):  # 用户上传头像
#     if request.method == "POST":
#         File = request.FILES.get("userIcon", None)
#         if not File:
#             return render(request, "userPage.html", locals())
#         else:
#             username = request.session.get('user_name', default='')
#             userimg = user_img()
#             userimg.username = username
#             userimg.img_url = "./user/userIcon/" + File.name
#             print(userimg.img_url)
#             userimg.save()
#             fileType = File.name.split('.')[1]
#             typeList = ["jpg", "jpeg", "png"]
#             if fileType in typeList:
#                 with open("./user/userIcon/%s" % File.name, 'wb+') as f:  # 创建文件的流媒体
#                     for chunk in File.chunks():
#                         f.write(chunk)  # 存储
#                     return render(request, "userPage.html", locals())
#             else:
#                 return render(request, "userPage.html", locals())
#     else:
#         return render(request, "userPage.html", locals())


def testboot(request):
    username = request.session.get("user_name")
    user = User_self.objects.filter(user=username).first()
    user_icon = user.icon
    context = {
        'username': username,
        'user_icon':user_icon
    }
    if user:
        all_audios = getAudios(username)
        context = {
            "audios": all_audios,
            "username": username,
            'user_icon':user_icon
        }
    return render(request, "bootExer.html", context)


def getAudios(username):
    audios = Audio.objects.filter(audio_creater=username)
    all_audios = []
    for i,audio in enumerate(audios):
        audio_item = {}
        audio_item['audio_name'] = audio.audio_name.replace("^", " ")
        audio_item['audio_time'] = audio.audio_create_time
        audio_item['audio_link'] = audio.audio_link
        audio_item['audio_id'] = audio.id
        all_audios.append(audio_item)
    return all_audios

def testcoll(request):
    username = request.session.get("user_name")
    user = User_self.objects.filter(user=username).first()
    context = {
        'username': username
    }
    if user:
        all_audios = getAudios(username)
        context = {
            "audios": all_audios,
            "username": username
        }
    return render(request, "AudioCollection.html", context)


def test_settings(request):
    username = request.session.get("user_name")
    user = User_self.objects.filter(user=username).first()
    if request.method == "GET":
        context = {
            "user_icon":user.icon,
            "username":username
        }
        return render(request, "user_settings.html", context=context)
    elif request.method == "POST":
        dirs = './static/audio/%s' % username
        if not os.path.exists(dirs):
            os.makedirs(dirs)
        img_dirs = os.path.join(dirs, "./user_img")
        if not os.path.exists(img_dirs):
            os.makedirs(img_dirs)
        img = request.FILES.get("file")
        path = os.path.join(img_dirs, img.name)
        with open(path, "wb+") as f:
            f.write(img.read())
        user = User_self.objects.filter(user=username).first()
        user.icon = "audio/%s/user_img/%s" % (user.user_id,img.name)
        user.save()
        context = {
            "user_icon":user.icon,
            "username":username
        }
        return render(request, "user_settings.html", context=context)


def test_subs(request):
    username = request.session.get("user_name")
    subscribers = User_subcriber.objects.filter(fol_user=username)
    followers =  User_subcriber.objects.filter(sub_user=username)
    sub_list = []
    fol_list = []
    for subscriber in subscribers:
        sub_list.append(subscriber.sub_user.username)
    for follower in followers:
        fol_list.append(follower.fol_user.username)
    context = {
        "sub_list": sub_list,
        "fol_list": fol_list,
        "username": username
    }
    return render(request, "Familiar.html", context)


def testcluster(request):
    username = request.session.get("user_name")
    if request.method == "POST":
        if len(request.POST) < 2:
            user_id = request.POST.get("user_id")
            print("user_id", user_id)
            sub_user = User.objects.filter(username=user_id).first()
            curr_user = User.objects.filter(username=username).first()
            if User_subcriber.objects.filter(sub_user=sub_user, fol_user=curr_user):
                pass
            else:
                sub = User_subcriber()
                sub.sub_user = sub_user
                sub.fol_user = curr_user
                sub.save()
                print(sub)
        else:
            user_id = request.POST.get("user_id")
            detail = User_Detail.objects.filter(user=user_id).first()
            detail.user_like = request.POST.get("like")
            detail.save()
    users = User.objects.all()
    user_details = []
    for user in users:
        if user.username == username:
            continue
        user_detail = User_Detail.objects.filter(user=user.username).first()
        user_reviews = []
        reviews_in_total = User_Review.objects.filter(user_receiver=user.username)
        for review in reviews_in_total:
            review_info = {}
            review_info['From'] = review.user_sender.username
            review_info['Content'] = review.content
            review_info['Time'] = review.time
            user_reviews.append(review_info)
        user_like = user_detail.user_like
        user_id = user_detail.user_id
        user_user_detail = {
            "user_id": user_id,
            "user_reviews": user_reviews,
            "user_like": user_like
        }
        user_details.append(user_user_detail)
    user_details = sorted(user_details, reverse=True, key=lambda x: x.get("user_like"))
    context = {
        'user_details': user_details,
        "username": username
    }
    return render(request, "Clustering.html", context)


def user_home(request):
    return render(request, "userHome.html")


def change_music_info(request):
    if request.method == "POST":
        name = request.POST.get("name")
        new_name = request.POST.get("new_name")
        id = request.POST.get('id')
        audio = Audio.objects.filter(id=id).first()
        audio.audio_name = new_name
        audio.save()

    username = request.session.get("user_name")
    user = User_self.objects.filter(user=username).first()
    context = {
        'username': username
    }
    if user:
        all_audios = getAudios(username)
        context = {
            "audios": all_audios,
            "username": username
        }
    return render(request, "bootExer.html", context=context)


def test_otherPage(request,path):
    print(path)
    return render(request, "userHome.html")


def add_review(request):
    if request.method == "POST":
        print("POST")
        reFrom = request.session.get("user_name")
        reTo = request.POST.get("to")
        review = request.POST.get("content")
        user_review = User_Review()
        user_review.content = review
        user_review.time = time.strftime("%Y-%m-%d-%H-%M-%S", time.localtime(time.time()))
        user_sender = User.objects.filter(username=reFrom).first()
        user_receiver = User.objects.filter(username=reTo).first()
        user_review.user_sender = user_sender
        user_review.user_receiver = user_receiver
        user_review.save()
        return HttpResponseRedirect(reverse('testOtherPage', args=[reTo]))
    return HttpResponse("Bad")


def test_v2(request):
    return render(request, "tempStyv2.html")


def delete_audio(request):
    if request.method == "POST":
        id = request.POST.get('audio_id')
        audio = Audio.objects.filter(id=id).first()
        audio.delete()

    username = request.session.get("user_name")
    user = User_self.objects.filter(user=username).first()
    context = {
        'username': username
    }
    if user:
        all_audios = getAudios(username)
        context = {
            "audios": all_audios,
            "username": username
        }
    return render(request, "bootExer.html", context=context)
