window.onload = function (){

    $("#fileupload").on("change",function(){
        var form_data = new FormData();
        var file_info = this.files[0];
        form_data.append('file',file_info);
        //if(file_info==undefined)暂且不许要判断是否有附件
        //alert('你没有选择任何文件');
        //return false
        //}

        // 提交ajax的请求
        $.ajax({
            url:"./test_settings",
            type:'POST',
            data: form_data,
            processData: false,  // tell jquery not to process the data
            contentType: false, // tell jquery not to set contentType
            success: function(callback) {
                // console.log(order_id)
                location.reload(true)
            }
        }); // end ajax
    })
}