# _*_ coding:'utf8' _*_
# Author: Euler
# Time: 2021/5/26 3:53 下午
from login.models import User
from user.models import User_self


def get_icon(request):
    username = request.session.get("user_name")
    if username is not None:
        user = User.objects.filter(username=username).first()
        user_self = User_self.objects.filter(user=user).first()
        icon = user_self.icon
        print(icon)
        return {
            "user_name": username,
            "icon": icon,
        }
    return {
        
    }