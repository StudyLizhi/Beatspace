var already_like = []
var already_subscribe = []
window.onload = function () {
    $(".like").on("click", function (e) {
        var id = e.target.id
        var user_id = id.split("_")[1]
        var upper_id = "#outline" + user_id
        if (already_like.includes(id)){
            already_like.forEach(function(item, index, arr) {
                if(item === id) {
                    arr.splice(index, 1);
                }
            });
            $(upper_id).removeClass("btn-danger").addClass("btn-warning")
            var text = e.target.innerText
            var num = Number(text)
            num -= 1
            text = String(num)
            e.target.innerText = text
            // 尚未完全实现
            $.ajax({
                url: "test_cluster",
                type: 'POST',
                data: {
                    "like":Number(num),
                    "user_id":user_id
                },
                success: function (arg) {
                    // alert("Upload Success!");
                }
            })
        }
        else{
            already_like.push(id)
            var user_id = id.split("_")[1]
            var upper_id = "#outline" + user_id
            $(upper_id).removeClass("btn-warning").addClass("btn-danger")
            var text = e.target.innerText
            var num = Number(text)
            num += 1
            text = String(num)
            e.target.innerText = text
            // 尚未完全实现
            $.ajax({
                url: "test_cluster",
                type: 'POST',
                data: {
                    "like":Number(num),
                    "user_id":user_id
                },
                success: function (arg) {
                    // alert("Upload Success!");
                }
            })
        }

    })

}