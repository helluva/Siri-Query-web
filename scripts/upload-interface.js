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
        
        console.log("done with base64")
        
        $.ajax({
            type: 'POST',
            url: 'uploadBlob',
            data: JSON.stringify({"type": "upload", "audio-base64": base64}),
            contentType: "application/json; charset=utf-8",
            dataType   : "json",
            success: function(response) {
                updateStatusText("Waiting for Siri to respond...")
            }
        })
    })
}

function updateStatusText(text) {
    $("#microphone-icon").css("display", "none")
    $("#check-icon").css("display", "none")
    $("#status-text").html(text)
}