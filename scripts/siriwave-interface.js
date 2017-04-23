var siriWave;

function loadSiri() {
    
    console.log("setting up siri")
    
    var element = document.getElementById('body');
    var positionInfo = element.getBoundingClientRect();
    var width = positionInfo.width
    
    siriWave = new SiriWave({
        style: 'ios9',
        container: document.getElementById('siri-container'),
        width: Math.min(500, width),
        height: 100,
        autostart: true,
        speed: 0.008,
        amplitude: 0.3
    });
}