let btn = $("#email-btn");
$(document).ready(function(){
    btn.click(function(){
        
        btn.removeClass("btn-primary");
        btn.addClass("btn-default");
        let email=$("#id_email").val();
        console.log(email);

        if(email==null || email==""){
            console.log("email address can not be empty");
        }else{
            $.ajax({
                "url"		:"/email/",//键  值异步请求的URL路径
                "type"		:"POST",			//请求的方式
                "data"		:email,         //要发送的数据
                "dataType"	:"text",		//指定 返回的数据类型 text xml/json
                "success"	:callBack		//请求成功后，要执行的回调函数
            });
            //回调函数
            function callBack(data){
                if(data=="true"){
                    console.log("email sent");
                }else{
                    console.log("email didn't send");
                }
            }
        }

        });
})