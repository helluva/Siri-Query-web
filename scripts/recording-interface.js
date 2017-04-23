window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();
var audioRecorder = null


//initialize audio recorder -- borrowed from souce code of https://webaudiodemos.appspot.com/AudioRecorder/index.html

function gotStream(stream) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );

    audioRecorder = new Recorder( inputPoint );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
}

function initAudio() {
    
    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    
    if (navigator.getUserMedia == undefined) {
        updateStatusText("Your browser doesn't support SiriQuery.</br>Try Google Chrome or Firefox.")
        return
    }
    
    if (!navigator.cancelAnimationFrame)
        navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
        navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;
    
    navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
    });

}

window.addEventListener('load', initAudio);


//use audio recorder

function startRecording() {
    if (!audioRecorder) return;
    
    audioRecorder.clear();
    audioRecorder.record();
    
    //update views
    siriWave.setSpeed(0.08)
    siriWave.setAmplitude(0.65)
    
    $("#main-button-link").attr("onclick", "stopRecording()")
    $("#microphone-icon").css("display", "none")
    $("#input-text-icon").css("display", "none")
    $("#check-icon").css("display", "")
    $("#status-text").html("")
    $('#response-image').css('display', "none")
    $('#siri-container').css('display', "")
    
    playAudioFromServer("assets/siriPrompt.mp3")
}

function stopRecording() {
    
    audioRecorder.getBuffers(function(buffers) {
        audioRecorder.exportWAV(function(blob) {
            Recorder.setupDownload(blob, "myRecording.wav");
        })
    });
    
    audioRecorder.stop();
    
    //update views
    siriWave.setSpeed(0.008)
    siriWave.setAmplitude(0.3)
    
    $("#main-button-link").attr("onclick", "startRecording()")
    updateStatusText("Uploading query...")
    playAudioFromServer("assets/siriDone.mp3")
}