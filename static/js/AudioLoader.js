var app = app || {};
var source;
var analyser;
var v;

window.onload = function() {
    var classNames = ['iconfont iconzanting',"iconfont iconbofang"]
    console.log('audio loader connected');

    window.addEventListener('drop', onDrop, false);
    window.addEventListener('dragover', onDrag, false);

    function onDrag(e) {
        // info.velocity('fadeOut', { duration: 150 });
        e.stopPropagation();
        e.preventDefault();
        return false;
    }

    function onDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        var droppedFiles = e.dataTransfer.files;

        if(droppedFiles.length!=0) {
            initiateAudio(droppedFiles[0]);
        }
    }

    $('#load-demo').on('click',function (){
        var data = '../static/audio/demo.mp3'
        initiateAudio(data)
    })


    function initiateAudio(data) {
        if (app.audio) {
            app.audio.remove();
            NTZ = true;
            window.cancelAnimationFrame(app.animationFrame);
            var ig = document.getElementById('play')
            if(ig) ig.children[0].className = classNames[1];
        }
        // console.log(data);
        app.audio = document.createElement('audio'); // creates an html audio element
        if(data.name) app.audio.src = URL.createObjectURL(data); // sets the audio source to the dropped file
        else app.audio.src = data;
        app.audio.crossOrigin = "anonymous";
        document.body.appendChild(app.audio);
        audioCtx = new(window.AudioContext || window.webkitAudioContext)(); // creates audioNode
        source = audioCtx.createMediaElementSource(app.audio); // creates audio source
        analyser = audioCtx.createAnalyser(); // creates analyserNode
        source.connect(audioCtx.destination); // connects the audioNode to the audioDestinationNode (computer speakers)
        source.connect(analyser); // connects the analyser node to the audioNode and the audioDestinationNode
        app.audio.play();
        var ig = document.getElementById('play')
        if(ig)ig.children[0].className = classNames[0]
    }
    console.log("ASd")
};
