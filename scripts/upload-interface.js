var task_id = undefined

function updateWithResponseForTaskId(task_id) {
    $('#response-image').attr('src', "siri-responses/" + task_id + ".png")
    $('#response-image').css('display', "")
    $('#siri-container').css('display', "none")
    $("#microphone-icon").css("display", "")
    $("#input-text-icon").css("display", "")
    $("#check-icon").css("display", "none")
    $("#status-text").html("")
    
    $("#response-image")
        .css('opacity', 0)
        .slideDown('slow')
        .animate(
            { opacity: 1, queue: false },
            "slow"
        )

    var audio = new Audio();
    audio.src = "siri-responses/" + task_id + ".mp4"
    audio.autoplay = true
    document.body.appendChild(audio);
}

function pollServerForResponse() {
    if (task_id == undefined) return
    
    $.post('/pollForSiriResponse', {"task-id": task_id}, function(response) {
        
        if (response["code"] == undefined || response["code"] == 'unknown-task') {
            return
        }
        
        if (response["code"] == "response-ready") {
            updateWithResponseForTaskId(task_id)
            return
        }
        
        pollServerForResponse()
    }, 'json')
}


//uploading an audio blob

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
        
        $.ajax({
            type: 'POST',
            url: 'uploadBlob',
            data: JSON.stringify({"type": "upload", "audio-base64": base64}),
            contentType: "application/json; charset=utf-8",
            dataType   : "json",
            success: function(response) {
                updateStatusText("Waiting for Siri to respond...")
                task_id = response["task-id"]
                pollServerForResponse()
            }
        })
    })
}


//upload raw text
function inputText() {
    var userInput = prompt("What do you want to ask Siri?")
    
    updateStatusText("Uploading query...")
    $('#response-image').css('display', "none")
    $('#siri-container').css('display', "")
    
    if (userInput != null) {
        $.ajax({
            type: 'POST',
            url: 'uploadBlob',
            data: JSON.stringify({"type": "upload", "raw-text": userInput}),
            contentType: "application/json; charset=utf-8",
            dataType   : "json",
            success: function(response) {
                
                updateStatusText("Waiting for Siri to respond...")
                
                task_id = response["task-id"]
                pollServerForResponse()
            }
        })
    }
}


function updateStatusText(text) {
    $("#microphone-icon").css("display", "none")
    $("#check-icon").css("display", "none")
    $("#input-text-icon").css("display", "none")
    $("#status-text").html(text)
}