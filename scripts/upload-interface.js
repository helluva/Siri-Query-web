var task_id = undefined

function pollServerForResponse() {
    if (task_id == undefined) return
    
    $.post('/pollForSiriResponse', {"task-id": task_id}, function(response) {
        
        console.log(task_id)
        
        if (response["code"] == undefined || response["code"] == 'unknown-task') {
            return
        }
        
        if (response["code"] == "response-ready") {
            var image = new Image();
            image.src = "siri-responses/" + task_id + ".png"
            document.body.appendChild(image);
            
            var audio = new Audio();
            audio.src = "siri-responses/" + task_id + ".mp4"
            audio.autoplay = true
            document.body.appendChild(audio);
            return
        }
        
        pollServerForResponse()
    }, 'json')
}

//uploading a blob

var blobToBase64 = function(blob, completion) {
    var reader = new FileReader();
    
    reader.onload = function() {
        var dataUrl = reader.result;
        var base64 = dataUrl.split(',')[1];
        completion(base64);
    };
    
    reader.readAsDataURL(blob);
};

function uploadBlob(blob) {
    
    console.log(blob)
    console.log("prepping base64")
    
    blobToBase64(blob, function(base64) {
        
        updateStatusText("Waiting for Siri to respond...")
        
        $.ajax({
            type: 'POST',
            url: 'uploadBlob',
            data: JSON.stringify({"type": "upload", "audio-base64": base64}),
            contentType: "application/json; charset=utf-8",
            dataType   : "json",
            success: function(response) {
                task_id = response["task-id"]
                pollServerForResponse()
            }
        })
    })
}

function updateStatusText(text) {
    $("#microphone-icon").css("display", "none")
    $("#check-icon").css("display", "none")
    $("#status-text").html(text)
}