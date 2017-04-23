var siriWave;

function loadSiri() {
    
    console.log("setting up siri")
    
    siriWave = new SiriWave({
        style: 'ios9',
        container: document.getElementById('siri-container'),
        width: 500,
        height: 100,
        autostart: true,
        speed: 0.008,
        amplitude: 0.3
    });
}