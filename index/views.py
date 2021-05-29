from django.shortcuts import render
from django.http import HttpResponse, FileResponse
import os
import time

# Create your views here.
from user.models import User_self, Audio


def home(request):
    return render(request, 'index.html')


def audio(request):
    username = "Login"
    if request.session.get("user_name", None):
        username = request.session.get("user_name")
    context = {
        'username': username
    }
    return render(request, 'stylized.html', context)


def virtual(request):
    return render(request, 'vitualization.html')


def user(request):
    return HttpResponse("测试用户登录页面。")


def testUpload(request):
    return HttpResponse("测试文件上传页面。")


def upload_audio(request, filename):
    if request.method == "POST":
        context = {}
        if len(request.POST.keys()) > 0:
            userName = request.POST.get("username")
            dirs = './static/audio/%s' % userName
            if not os.path.exists(dirs):
                os.makedirs(dirs)
        else:
            userName = request.session.get("user_name")
            print("Saving Cloud...")
            dirs = './static/audio/%s' % userName
            html_path = '/audio/%s' % userName
            wavBlob = request.body
            path = filename.split(".")[0].replace(" ", "^") + "#" + time.strftime("%Y-%m-%d-%H-%M-%S",
                                                                                  time.localtime(time.time()))
            with open(os.path.join(dirs, path) + ".wav", "wb") as f:
                f.write(wavBlob)
            context = {"username": userName}
            current_user = User_self.objects.filter(user=userName).first()
            if current_user is not None:
                audio = Audio()
                audio.audio_name = filename.split(".")[0]
                audio.audio_create_time = time.strftime("%Y-%m-%d-%H-%M-%S", time.localtime(time.time()))
                audio.audio_creater = current_user
                path = os.path.join(html_path, filename.split(".")[0] + "#" + time.strftime("%Y-%m-%d-%H-%M-%S",
                                                                                       time.localtime(
                                                                                           time.time()))).replace(" ",
                                                                                                                  "^")
                audio.audio_link = path + ".wav"
                audio.save()
                current_user.cloud += "*" + os.path.join(dirs, path)
                current_user.save()
    return render(request, "stylized.html", context)


def newaudio(request):
    return render(request, "newStylized.html")


def downloadAudio(request, path):
    print(path)
    path = path + ".wav"
    response = FileResponse(open(path, 'rb'))
    response['Content-Type'] = "audio/wav"
    fileName = (path.split('/')[-1].split("#")[0]).replace("^", " ") + ".wav"
    response['Content-Disposition'] = 'attachment;filename="{0}"'.format(fileName)
    return response
