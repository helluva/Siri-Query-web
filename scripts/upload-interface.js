var task_id = undefined

function pollServerForResponse() {
    if (task_id == undefined) return
    
    $.post('/pollForSiriResponse', {"task-id": task_id}, function(response) {
        console.log(response)
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
        
        $.post('/pollForSiriResponse', {"type": "upload", "audio-base64": base64}, function(response) {
            task_id = response["task-id"]
                pollServerForResponse()
        }, 'json')
    })
}

function updateStatusText(text) {
    $("#microphone-icon").css("display", "none")
    $("#check-icon").css("display", "none")
    $("#status-text").html(text)
}