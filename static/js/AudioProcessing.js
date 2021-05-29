var app = app || {};
var gainNode_delay,gainNode_iir,gainNode, gainNode_distortion, gainNode_biquadFilter;
var off_gainNode_delay,off_gainNode_iir,off_gainNode, off_gainNode_distortion, off_gainNode_biquadFilter;
var delayNode;
var off_delayNode;

var canvas,canvasCtx;
var audioCtx,source,source_delay, source_distortion ,analyser, source_biquadFilter,source_convolve;
var offlineCXT,off_source,off_source_delay, off_source_distortion ,off_source_biquadFilter,off_source_convolve;
var convolver;
var off_convolver;

var distortion;
var off_distortion;

var biquadFilter;
var off_biquadFilter;

var classNames = ['iconfont iconzanting','iconfont iconbofang'];
var compressor;
var off_compressor;

var NTZ=true,RAF,canplay=1,iscov=false,idx=-1, isStart=-1;
var fileOutput;
var mediaRecorder;
var audio_chunks = [];
var id = 1;
var reader = new FileReader();
var myArrayBuffer;
var audio_data;
var file_name;
var wavBlob;
window.onload = function() {

    init();

    function init(){
        $('#irrnode').css('display','none');
        $('#pingpongnode').css('display','none');
        $('#distortionnode').css('display','none');
        $('#delaynode').css('display','inline-block');
        canvas = document.getElementById("wrap");
        canvas.width = $('#total-controller').width()*0.8;
        // console.log(window.screen.availWidth*0.43);
        canvas.height = $('#total-controller').height()*0.5;
        canvasCtx = canvas.getContext("2d");
    }
    console.log('audio loader connected');

    //设置监听函数
    $("#open_local_file").on('change', on_load_file);
    //用来判断卡片是否需要翻转
    $("#convolve-forest,#convolve-drain,#convolve-church,#convolve-launch").click(function(event){
        $(this).toggleClass("flipped");
    })

    //滤波器选择相应函数
    //设置选项框长度与原组件相同
    $("#filter-selector").css({
        'width': $("#filter-choice").css('width'),
    })
    //为选项框设置样式
    $('#filter-choice').on('click',function (){
        if($("#filter-selector").css('display') == 'none') {
            $("#filter-selector").show();
            $('li').css({
                'background-color':'black',
                'cursor': 'pointer',
                'color':'white'})
        } else {
            $("#filter-selector").hide();
        }
    })
    //点击选择时为输入框赋值，并关闭选项窗
    $("li").click(function() {
        $("#filter-choice").val($(this).text())
        $("#filter-selector").hide();
    })


// 设置屏幕监听函数
    //判断是否将文件拖入
    window.addEventListener('drop', onDrop, false);
    window.addEventListener('dragover', onDrag, false);
    //不同效果器进行转换
    window.addEventListener('click', hide_label)
    //更新音频播放时间
    window.addEventListener('timeupdate', adjust_currTime);
    //添加不同混响效果
    window.addEventListener('click', add_convolve);
    //添加不同滤波器效果
    window.addEventListener('click',filtertype)
    //自适应屏幕，当屏幕分辨率变化，更新画布大小
    window.addEventListener('resize',function (){
        if(app.audio){
            cancelAnimationFrame(RAF);
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = $('#total-controller').width()*0.8
            canvas.height = $('#total-controller').height()*0.5
            draw();
        }
    })

    //监听选择的滤波器类型
    function filtertype(e){
        if(e.path.length == 11){
            var type = e.path[0].id
            switch (type){
                case 'lowpass':
                    biquadFilter.type = type
                    break;
                case 'highpass':
                    biquadFilter.type = type
                    break;
                case 'lowshelf':
                    biquadFilter.type = type
                    break;
                case 'highshelf':
                    biquadFilter.type = 'highshelf'
                    break;
                default:
                    break;
            }
        }
    }


    //添加不同混响效果器
    function add_convolve(e){
        var mode = e.path[1].id;
        var path = ['../static/impulse/pysical_forest.wav', '../static/impulse/pysical_church.wav', '../static/impulse/pysical_drain.wav','../static/impulse/pysical_wc.wav']
        var color = ["url('../static/img/bg_forest.jpg')", "url('../static/img/bg_church.jpg')", "url('../static/img/bg_drain.jpg')", "url('../static/img/bg_launch.jpg')"]
        var names = ['convolve-forest','convolve-church',"convolve-drain","convolve-launch"]
        switch (mode){
            case "convolve-forest":
                idx = 0;
                break;
            case "convolve-church":
                idx = 1;
                break;
            case "convolve-drain":
                idx = 2;
                break;
            case "convolve-launch":
                idx = 3;
                break;
            //监听混响开启与否开关，若关闭更新音频节点图
            case "convolve-status":
                if(iscov && app.audio){
                    convolver.disconnect(compressor)
                    off_convolver.disconnect(off_compressor)
                    gainNode.disconnect(convolver)
                    off_gainNode.disconnect(off_convolver)
                    gainNode.connect(compressor)
                    off_gainNode.connect(off_compressor)
                    iscov = false
                    $("#pointer-convolve").html("Convolve Status: Off");
                    mode = null
                }
                else if(app.audio){
                    if(idx == -1) idx = 1;
                    $("#pointer-convolve").html("Convolve Status: On");
                }
                break;
            default:
                mode = null;
        }
        if(app.audio && mode){
            async function createReverb(path) {
                // 加载脉冲音频文件
                if(path!=0){
                    let response     = await fetch(path);
                    let arraybuffer  = await response.arrayBuffer();
                    convolver.buffer = await audioCtx.decodeAudioData(arraybuffer);
                    off_convolver.buffer = convolver.buffer;

                }
            }
            createReverb(path[idx]).then(function (){
                if(iscov && app.audio){
                    convolver.disconnect(compressor)
                    off_convolver.disconnect(off_compressor)
                    gainNode.disconnect(convolver)
                    off_gainNode.disconnect(off_convolver)
                    gainNode.connect(compressor)
                    off_gainNode.connect(off_compressor)
                    iscov = true
                    $("#pointer-convolve").html("Convolve Status: On");
                }
                gainNode.disconnect(compressor)
                off_gainNode.disconnect(off_compressor)
                gainNode.connect(convolver).connect(compressor)
                off_gainNode.connect(off_convolver).connect(off_compressor)
                mode = names[idx]
                iscov = true;
                // 设置背景样式
                $('#'+mode).css('opacity', 1)
                $('#'+mode).css('transform-style','')
                toOpacity(mode)
                $('#isConvolve').css('opacity',0.2)
                $('.convolver').css('background-image',color[idx])
            })
        }
    }

    //设置监听函数，控制音频的播放与暂停
    $('#play').on('click',function (){
        var ig = document.getElementById('play')
        if (app.audio) {
            if(app.play == false) {
                draw();
                ig.className = classNames[canplay]
                app.audio.play()
                app.play = true
                canplay = 1
                console.log("Playing Animating!")
            }
            else{
                cancelAnimationFrame(RAF);
                ig.className = classNames[canplay]
                app.audio.pause()
                app.play = false
                canplay = 0
                console.log("Stoping end-Animating!")
            }
        }
    })

    $('#volume').on('mousedown',function(){
        var change = function($input) {
            gainNode.gain.exponentialRampToValueAtTime(Number($input.value)/100, audioCtx.currentTime + 2)
            off_gainNode.gain.exponentialRampToValueAtTime(Number($input.value)/100, audioCtx.currentTime + 2)
        }
        $("input[name='controll-volume']").RangeSlider({ min: 0,   max: 100,  step: 0.1,  callback: change});
    })

    $('#delay-time').on('mousedown',function(){
        var change = function($input) {
            // console.log(($input.value)/100)
            delayNode.delayTime.setValueAtTime(Number($input.value)/100, audioCtx.currentTime)
            off_delayNode.delayTime.setValueAtTime(Number($input.value)/100, audioCtx.currentTime)

            // console.log(delayNode)
        }
        $("input[name='delay-time']").RangeSlider({ min: 0,   max: 100,  step: 0.1,  callback: change});
    })

    $('#delay-volume').on('mousedown',function(){
        var change = function($input) {
            // console.log(($input.value)/100)
            gainNode_delay.gain.exponentialRampToValueAtTime(Number($input.value)/100, audioCtx.currentTime+2)
            off_gainNode_delay.gain.exponentialRampToValueAtTime(Number($input.value)/100, audioCtx.currentTime+2)

            // console.log(delayNode)
        }
        $("input[name='delay-volume']").RangeSlider({ min: 0,   max: 100,  step: 0.1,  callback: change});
    })

    $('#delay-feedback').on('mousedown',function(){
        var change = function($input) {
            // console.log(source)
            var rato = Number($input.value/100)
            gainNode_delay.gain.linearRampToValueAtTime(0, audioCtx.currentTime+rato*(app.audio.duration-audioCtx.currentTime))
            off_gainNode_delay.gain.linearRampToValueAtTime(0, audioCtx.currentTime+rato*(app.audio.duration-audioCtx.currentTime))

            // console.log(delayNode)
        }
        $("input[name='delay-feedback']").RangeSlider({ min: 0,   max: 100,  step: 0.1,  callback: change});
    })

    $('#distortion-amount').on('mousedown', function (){
        var change = function($input) {
            distortion.curve = makeDistortionCurve(Number($input.value))
            off_distortion.curve = makeDistortionCurve(Number($input.value))
        }
        $("input[name='distortion-amount']").RangeSlider({ min: 0,   max: 1000,  step: 50,  callback: change});
    })

    $('#distortion-volume').on('mousedown',function(){
        var change = function($input) {
            // console.log(($input.value))
            gainNode_distortion.gain.exponentialRampToValueAtTime(Number($input.value), audioCtx.currentTime+2)
            off_gainNode_distortion.gain.exponentialRampToValueAtTime(Number($input.value), audioCtx.currentTime+2)

            // console.log(delayNode)
        }
        $("input[name='distortion-volume']").RangeSlider({ min: 0,   max: 1,  step: 0.1,  callback: change});
    })

    //distortion效果器过采样参数控制
    $('#distortion-oversample').on('mousedown',function(){
        var change = function($input) {
            if($input.value == 0) distortion.oversample = 'none'
            else distortion.oversample = String(Number($input.value))+'x'
        }
        $("input[name='distortion-oversample']").RangeSlider({ min: 0,   max: 4,  step: 2,  callback: change});
    })

    //distortion效果器音量参数控制
    $('#filter-volume').on('mousedown',function(){
        var change = function($input) {
            gainNode_biquadFilter.gain.exponentialRampToValueAtTime(Number($input.value), audioCtx.currentTime+2)
            off_gainNode_biquadFilter.gain.exponentialRampToValueAtTime(Number($input.value), audioCtx.currentTime+2)

        }
        $("input[name='filter-volume']").RangeSlider({ min: 0,   max: 1,  step: 0.1,  callback: change});
    })

    //distortion效果器频率参数控制
    $('#filter-frequency').on('mousedown',function(){
        var change = function($input) {
            biquadFilter.frequency.setValueAtTime(Number($input.value), audioCtx.currentTime+2)
            off_biquadFilter.frequency.setValueAtTime(Number($input.value), audioCtx.currentTime+2)
        }
        $("input[name='filter-frequency']").RangeSlider({ min: 20,   max: 25000,  step: 1000,  callback: change});
    })

    //distortion效果器增益参数控制
    $('#filter-gain').on('mousedown',function(){
        var change = function($input) {
            biquadFilter.gain.setValueAtTime(Number($input.value), audioCtx.currentTime+2)
            off_biquadFilter.gain.setValueAtTime(Number($input.value), audioCtx.currentTime+2)
        }
        $("input[name='filter-gain']").RangeSlider({ min: 1,   max: 50,  step: 1,  callback: change});
    })

    // $('#usr_login').on('click', function (){
    //     console.log("here!")
    //     $("#log").css('display','block');
    //     $("#login_bg").css('display',"block")
    //     // $("#login_bg").css('transitionstart', 'opacity .25s ease-in-out;')
    //     // $("#login_bg").css('opacity',"60%")
    //     $("#login_bg").css({"opacity":"0.7"});
    // })
    // $('#close').on('click', function (){
    //     console.log("im here")
    //     $("#log").css('display','none');
    //     $("#login_bg").css('display',"none")
    //     // $("#login_bg").css({"opacity":"0.7"});
    //     $('#login_bg').hide('fast')
    // })


    $('#record').on('mousedown', function (){
        $("#record").css("color","black");
        $("#record").css("background-color","white");
        $("#stop_record").css("color","white");
        $("#stop_record").css("background-color","black");
        mediaRecorder.start();
    })

    $('#stop_record').on('mousedown', function (){
        $("#stop_record").css("color","black");
        $("#stop_record").css("background-color","white");
        $("#record").css("color","white");
        $("#record").css("background-color","black");
        mediaRecorder.stop();
    })

    function getWavBytes(buffer, options) {
        const type = options.isFloat ? Float32Array : Uint16Array
        const numFrames = buffer.length / type.BYTES_PER_ELEMENT
        const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }))
        const wavBytes = new Uint8Array(headerBytes.length + buffer.length);
        wavBytes.set(headerBytes, 0)
        wavBytes.set(new Uint8Array(buffer), headerBytes.length)
        return wavBytes
    }

    function getWavHeader(options) {
        const numFrames =      options.numFrames
        const numChannels =    options.numChannels || 2
        const sampleRate =     options.sampleRate || 44100
        const bytesPerSample = options.isFloat? 4 : 2
        const format =         options.isFloat? 3 : 1
        const blockAlign = numChannels * bytesPerSample
        const byteRate = sampleRate * blockAlign
        const dataSize = numFrames * blockAlign
        const buffer = new ArrayBuffer(44)
        const dv = new DataView(buffer)
        let p = 0
        function writeString(s) {
            for (let i = 0; i < s.length; i++) {
                dv.setUint8(p + i, s.charCodeAt(i))
            }
            p += s.length
        }
        function writeUint32(d) {
            dv.setUint32(p, d, true)
            p += 4
        }
        function writeUint16(d) {
            dv.setUint16(p, d, true)
            p += 2
        }
        writeString('RIFF')              // ChunkID
        writeUint32(dataSize + 36)       // ChunkSize
        writeString('WAVE')              // Format
        writeString('fmt ')              // Subchunk1ID
        writeUint32(16)                  // Subchunk1Size
        writeUint16(format)              // AudioFormat
        writeUint16(numChannels)         // NumChannels
        writeUint32(sampleRate)          // SampleRate
        writeUint32(byteRate)            // ByteRate
        writeUint16(blockAlign)          // BlockAlign
        writeUint16(bytesPerSample * 8)  // BitsPerSample
        writeString('data')              // Subchunk2ID
        writeUint32(dataSize)            // Subchunk2Size

        return new Uint8Array(buffer)
    }

    //隐藏不同效果器标签
    function hide_label(e) {
        var mode_id = e.path[0].id;
        switch (mode_id) {
            case 'label-delay':
                $('#delaynode').css('display','inline-block')
                $('#irrnode').css('display','none')
                $('#distortionnode').css('display','none')
                $('#add-delay').fadeIn('fast')
                $('#add-dtsn').hide('fast')
                $('#add-filter').hide('fast')
                $('#scroll-delay').fadeIn('slow');
                $('#scroll-dtsn').hide('fast');
                $('#scroll-filter').hide('fast');
                break;
            case 'label-dtsn':
                $('#distortionnode').css('display','inline-block')
                $('#irrnode').css('display','none')
                $('#delaynode').css('display','none')
                $('#add-delay').hide('fast')
                $('#add-dtsn').fadeIn('fast')
                $('#add-filter').hide('fast')
                $('#scroll-dtsn').fadeIn('slow');
                $('#scroll-filter').hide('fast');
                $('#scroll-delay').hide('fast');
                break;
            case 'label-filter':
                $('#irrnode').css('display','inline-block')
                $('#delaynode').css('display','none')
                $('#distortionnode').css('display','none')
                $('#add-delay').hide('fast')
                $('#add-dtsn').hide('fast')
                $('#add-filter').fadeIn('fast')
                $('#scroll-filter').fadeIn('slow');
                $('#scroll-dtsn').hide('fast');
                $('#scroll-delay').hide('fast');
                break;
        }
    }

    function onDrag(e) {
        e.stopPropagation();
        e.preventDefault();
        return false;
    }

    async function onDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        var droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length != 0) {
            audio_data = droppedFiles[0]
            myArrayBuffer = await new Promise(resolve => {
                reader = new FileReader();
                reader.onload = res => {
                    resolve(res.target.result);
                };
                reader.readAsArrayBuffer(audio_data);
            })
            console.log(myArrayBuffer)
            initiateAudio();
        }
    }

    $('#load-demo').on('click',function (){
        console.log("here!")
        audio_data = '../static/audio/demo.mp3';
        initiateAudio();
    })

    function audioBufferToWav(aBuffer){
        let numOfChan = aBuffer.numberOfChannels,
            btwLength = aBuffer.length * numOfChan * 2 + 44,
            btwArrBuff = new ArrayBuffer(btwLength),
            btwView = new DataView(btwArrBuff),
            btwChnls = [],
            btwIndex,
            btwSample,
            btwOffset = 0,
            btwPos = 0;
        setUint32(0x46464952); // "RIFF"
        setUint32(btwLength - 8); // file length - 8
        setUint32(0x45564157); // "WAVE"
        setUint32(0x20746d66); // "fmt " chunk
        setUint32(16); // length = 16
        setUint16(1); // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(aBuffer.sampleRate);
        setUint32(aBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2); // block-align
        setUint16(16); // 16-bit
        setUint32(0x61746164); // "data" - chunk
        setUint32(btwLength - btwPos - 4); // chunk length

        for (btwIndex = 0; btwIndex < aBuffer.numberOfChannels; btwIndex++)
            btwChnls.push(aBuffer.getChannelData(btwIndex));

        while (btwPos < btwLength) {
            for (btwIndex = 0; btwIndex < numOfChan; btwIndex++) {
                // interleave btwChnls
                btwSample = Math.max(-1, Math.min(1, btwChnls[btwIndex][btwOffset])); // clamp
                btwSample = (0.5 + btwSample < 0 ? btwSample * 32768 : btwSample * 32767) | 0; // scale to 16-bit signed int
                btwView.setInt16(btwPos, btwSample, true); // write 16-bit sample
                btwPos += 2;
            }
            btwOffset++; // next source sample
        }

        let wavHdr = lamejs.WavHeader.readHeader(new DataView(btwArrBuff));

        //Stereo
        let data = new Int16Array(btwArrBuff, wavHdr.dataOffset, wavHdr.dataLen / 2);
        let leftData = [];
        let rightData = [];
        for (let i = 0; i < data.length; i += 2) {
            leftData.push(data[i]);
            rightData.push(data[i + 1]);
        }
        // var left = new Int16Array(leftData);
        // var right = new Int16Array(rightData);
        //
        //
        // if (AudioFormat === 'MP3')
        // {
        //     //STEREO
        //     if (wavHdr.channels===2)
        //         return this.wavToMp3Stereo(wavHdr.channels, wavHdr.sampleRate,  left,right);
        //     //MONO
        //     else if (wavHdr.channels===1)
        //         return this.wavToMp3Mono(wavHdr.channels, wavHdr.sampleRate,  data);
        // }
        // else
        return new Blob([btwArrBuff], {type: "audio/wav"});

        function setUint16(data) {
            btwView.setUint16(btwPos, data, true);
            btwPos += 2;
        }

        function setUint32(data) {
            btwView.setUint32(btwPos, data, true);
            btwPos += 4;
        }
    }

    function wavToMp3(channels, sampleRate, left, right = null) {
        var buffer = [];
        var mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 128);
        var remaining = left.length;
        var samplesPerFrame = 1152;


        for (var i = 0; remaining >= samplesPerFrame; i += samplesPerFrame) {

            if (!right)
            {
                var mono = left.subarray(i, i + samplesPerFrame);
                var mp3buf = mp3enc.encodeBuffer(mono);
            }
            else {
                var leftChunk = left.subarray(i, i + samplesPerFrame);
                var rightChunk = right.subarray(i, i + samplesPerFrame);
                var mp3buf = mp3enc.encodeBuffer(leftChunk,rightChunk);
            }
            if (mp3buf.length > 0) {
                buffer.push(mp3buf);//new Int8Array(mp3buf));
            }
            remaining -= samplesPerFrame;
        }
        var d = mp3enc.flush();
        if(d.length > 0){
            buffer.push(new Int8Array(d));
        }

        var mp3Blob = new Blob(buffer, {type: 'audio/mp3'});
        var bUrl = window.URL.createObjectURL(mp3Blob);

        // send the download link to the console
        console.log('mp3 download:', bUrl);
        return mp3Blob;

    }

    $('#get_full_audio').on('click', function (){

        if( audioCtx ) {
            audioCtx.decodeAudioData(myArrayBuffer, newAudioBuffer => {

                off_source.buffer = newAudioBuffer;

                off_source_delay.buffer = newAudioBuffer
                off_source_distortion.buffer = newAudioBuffer
                off_source_biquadFilter.buffer = newAudioBuffer
                off_source_convolve.buffer= newAudioBuffer
                // off_source.connect(offlineCXT.destination);
                off_source.start()
                offlineCXT.startRendering()
                    .then(renderedBuffer => {
                        var MP3Blob = audioBufferToWav(renderedBuffer);
                        var url = URL.createObjectURL(MP3Blob);
                        var li = document.createElement('li');
                        var hf = document.createElement('a');
                        // var au = document.createElement('audio');
                        hf.href = url;
                        hf.download = 'Audio_Piece' + id.toString() + '.wav';
                        id += 1;
                        hf.innerHTML = hf.download;
                        li.style.textAlign = 'center';
                        li.style.listStyle = 'none';
                        li.style.margin = '0 auto';
                        if (id == 1) {
                            li.style.borderTop = "1px solid white";
                        }
                        li.style.paddingBottom = '0.5vh';
                        li.style.paddingTop = '0.5vh';
                        li.appendChild(hf);
                        recordingslist.appendChild(li);
                        wavBlob = MP3Blob;
                    });
            });
        }
    })

    function sendData(data)
    {
        // let csrftoken = getCookie('csrftoken');
        let response=fetch("/upload_audio/" + file_name, {
            method: "post",
            // body: JSON.stringify(wavBlob),
            body: wavBlob,
        })
    }

    $("#upload_audio").on("click",function (){
        var url = "/upload_audio/"+file_name
        console.log(url)
        name = document.getElementById("username").innerHTML
        if(name == "login" ){
            alert("上传前请先登录！")
        }
        else if(typeof(wavBlob) == "undefined"){
            alert("先加载音频！")
        }
        else{
            $.ajax({
                url: url,
                type: 'POST',
                data: {
                    "username":name,
                },
                success: function (arg) {
                    sendData(wavBlob);
                    alert("Upload Success!");
                }
            })
        }
    })

    async function on_load_file(e) {
        audio_data = e.target.files[0]
        // reader.readAsArrayBuffer(audio_data);
        myArrayBuffer = await new Promise(resolve => {
            reader = new FileReader();
            reader.onload = res => {
                resolve(res.target.result);
            };
            reader.readAsArrayBuffer(e.target.files[0]);
        })
        console.log(myArrayBuffer)
        initiateAudio();
    }
    // 初始化音频上下文以及相关信息
    function initiateAudio() {
        if (app.audio) {
            app.audio.remove();
            canplay = 1;
            NTZ = true;
            window.cancelAnimationFrame(RAF);
            var ig = document.getElementById('play')
            if(ig) ig.className = classNames[canplay];
        }

        // console.log(data)
        app.audio = document.createElement('audio'); // creates an html audio element
        if(audio_data.name) {
            app.audio.src = URL.createObjectURL(audio_data);
            file_name = audio_data.name;
        } // sets the audio source to the dropped file
        else app.audio.src = audio_data
        app.audio.crossOrigin = "anonymous";
        document.body.appendChild(app.audio);
        audioCtx = new(window.AudioContext || window.webkitAudioContext)(); // creates audioNode

        source = audioCtx.createMediaElementSource(app.audio); // creates audio source
        source_delay = source
        source_distortion = source
        source_biquadFilter = source

        source_convolve = source

        // 指数型增加音量，更符合任何人耳听觉习惯
        gainNode = audioCtx.createGain();
        gainNode.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime + 2);
        gainNode_delay = audioCtx.createGain();
        gainNode_delay.gain.setValueAtTime(0.5,audioCtx.currentTime)
        gainNode_distortion = audioCtx.createGain();
        gainNode_distortion.gain.setValueAtTime(0,audioCtx.currentTime)
        gainNode_biquadFilter = audioCtx.createGain()
        gainNode_biquadFilter.gain.setValueAtTime(0,audioCtx.currentTime)

        //添加延时节点
        delayNode = audioCtx.createDelay()

        // 混响节点
        convolver = audioCtx.createConvolver()

        //扭曲节点
        distortion = audioCtx.createWaveShaper()

        //低频滤波器
        biquadFilter = audioCtx.createBiquadFilter()

        // //添加动态压缩器，防止爆音现象
        compressor = audioCtx.createDynamicsCompressor();

        fileOutput = audioCtx.createMediaStreamDestination();
        // recorder = new Recorder(fileOutput);
        mediaRecorder = new MediaRecorder(fileOutput.stream);
        // mediaRecorder.start();
        mediaRecorder.ondataavailable = function(evt) {
            audio_chunks = []
            audio_chunks.push(evt.data);
            console.log(typeof(audio_chunks))
        };
        this.mediaRecorder.onstop = e => {
            var MP3Blob;
            AudioFormat = "WAV";
            if (AudioFormat === 'MP3' || AudioFormat === 'WAV')
            {
                var data = audio_chunks[0];
                var blob = new Blob(audio_chunks, { type : 'audio/webm' });
                const audioContext = new AudioContext();
                const fileReader = new FileReader();
                // Set up file reader on loaded end event
                fileReader.onloadend = () => {
                    const arrayBuffer = fileReader.result;// as ArrayBuffer;

                    // Convert array buffer into audio buffer
                    audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {

                        // Do something with audioBuffer
                        console.log(audioBuffer)
                        var MP3Blob = audioBufferToWav(audioBuffer);
                        // this.chunks = [];
                        var url = URL.createObjectURL(MP3Blob);
                        var li = document.createElement('li');
                        var hf = document.createElement('a');
                        // var au = document.createElement('audio');
                        hf.href = url;
                        hf.download = 'Audio_Piece' + id.toString() + '.wav';
                        id += 1;
                        hf.innerHTML = hf.download;
                        li.style.textAlign =  'center';
                        li.style.listStyle =  'none';
                        li.style.margin = '0 auto';
                        if(id == 1){
                            li.style.borderTop = "1px solid white";
                        }
                        li.style.paddingBottom = '0.5vh';
                        li.style.paddingTop = '0.5vh';

                        // au.controls = true;
                        // au.src = url;
                        li.appendChild(hf);
                        // hf.style
                        // li.appendChild(au);
                        recordingslist.appendChild(li);
                        // onStop(MP3Blob,audioBuffer);
                        wavBlob = MP3Blob;
                    })
                }
                //Load blob
                fileReader.readAsArrayBuffer(blob)
            }
            else {
                var data = this.chunks[0];
                var blob = new Blob(audio_chunks, { type : 'audio/mpeg' });
                // onStop(blob,data)
            }

            // };
        };
        //



        app.audio.addEventListener('canplay',function (){
            offlineCXT = new OfflineAudioContext(2, app.audio.duration * audioCtx.sampleRate, audioCtx.sampleRate);
            off_source = offlineCXT.createBufferSource();
            off_source_delay = offlineCXT.createBufferSource()
            off_source_distortion = offlineCXT.createBufferSource()
            off_source_biquadFilter = offlineCXT.createBufferSource()
            off_source_convolve = offlineCXT.createBufferSource()
            off_gainNode = offlineCXT.createGain();
            off_gainNode.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime + 2);
            off_gainNode_delay = offlineCXT.createGain();
            off_gainNode_delay.gain.setValueAtTime(0.5,audioCtx.currentTime)
            off_gainNode_distortion = offlineCXT.createGain();
            off_gainNode_distortion.gain.setValueAtTime(0,audioCtx.currentTime)
            off_gainNode_biquadFilter = offlineCXT.createGain()
            off_gainNode_biquadFilter.gain.setValueAtTime(0,audioCtx.currentTime)
            off_delayNode = offlineCXT.createDelay()

            // 混响节点
            off_convolver = offlineCXT.createConvolver()

            //扭曲节点
            off_distortion = offlineCXT.createWaveShaper()

            //低频滤波器
            off_biquadFilter = offlineCXT.createBiquadFilter()

            // //添加动态压缩器，防止爆音现象
            off_compressor = offlineCXT.createDynamicsCompressor();

            off_source.connect(off_gainNode).connect(off_compressor).connect(offlineCXT.destination);

            source.connect(gainNode).connect(compressor).connect(audioCtx.destination);
            compressor.connect(fileOutput);
            analyser = audioCtx.createAnalyser(); // creates analyserNode
            source.connect(analyser); // connects the analyser node to the audioNode and the audioDestinationNode
            var ig = document.getElementById('play');
            canplay = 0;
            if(ig)  ig.className = classNames[canplay];
            draw();
            app.audio.play();
        })
    }

    //自定义distortion失真函数
    function makeDistortionCurve(amount) {
        var k = typeof amount === 'number' ? amount : 50,
            n_samples = audioCtx.sampleRate,
            curve = new Float32Array(n_samples),
            deg = Math.PI / 180,
            i = 0,
            x;
        for ( ; i < n_samples; ++i ) {
            x = i * 2 / n_samples - 1;
            curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
        }
        return curve;
    };

    function draw() {
        RAF = requestAnimationFrame(draw);
        var r = 0;
        var g = 0;
        var b = 0;
        analyser.fftSize = 2048;
        var bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);

        analyser.getByteFrequencyData(dataArray);

        // 判断是否需要更新音频时长相关数据
        if (NTZ) {
            NTZ = false;
            var timer = parseFloat(app.audio.duration)
            var minute = parseInt(timer / 60)
            var second = timer - minute * 60
            if (second < 10) $('#showtime').html("00:00 / " + "0" + String(minute) + ":" + "0" + String(parseInt(second)));
            else $('#showtime').html("00:00 / " + "0" + String(minute) + ":" + String(parseInt(second)))
        }
        setTime($('#showtime'), app.audio.currentTime);
        var currWidth = $('#scroll-audio').width()
        $('#scroll-audio').animate({ left: 10+currWidth * audioCtx.currentTime / app.audio.duration }, 0.1)

        canvasCtx.fillStyle = 'rgb(0,0,0)'
        canvasCtx.fillRect(0, -40, canvas.width, canvas.height);

        canvasCtx.lineWidth = 4;
        canvasCtx.beginPath();

        var sliceWidth = canvas.width * 2 / bufferLength;
        var offset = 0

        var buflen = 2048;
        var buf = new Float32Array( buflen );
        analyser.getFloatTimeDomainData( buf );
        //定义自相关函数，进行音高追踪，尚未实现
        // var ac = autoCorrelate( buf, audioCtx.sampleRate );

        for (var i = 0; i < bufferLength; i++) {
            r +=  i/2048 * 256
            g += 256 - i/2048*256
            b = Math.floor(Math.random()*(256 - 0) + 0);
            var v = dataArray[i] / 128.0;
            var left = i*sliceWidth + offset
            offset += sliceWidth
            canvasCtx.fillStyle = 'rgb('+r.toString()+','+g.toString()+','+b.toString()+')';
            canvasCtx.fillRect(left,0.75*canvas.height*(1-v),sliceWidth, canvas.height*0.75*v)
        }
        canvasCtx.stroke();

    };

    // 监听延时节点是否开启
    $('#delaynode').on('click',function (){
        if($(this).is(':checked') && app.audio){
            delayNode.delayTime.setValueAtTime(0.5, audioCtx.currentTime);
            off_delayNode.delayTime.setValueAtTime(0.5, audioCtx.currentTime);
            gainNode_delay.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime+1);
            off_gainNode_delay.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime+1);
            source_delay.connect(delayNode).connect(gainNode_delay).connect(gainNode).connect(compressor).connect(audioCtx.destination)
            off_source_delay.connect(off_delayNode).connect(off_gainNode_delay).connect(off_gainNode).connect(off_compressor).connect(offlineCXT.destination)
        }
        else if(app.audio){
            gainNode_delay.disconnect(gainNode);
            off_gainNode_delay.disconnect(off_gainNode);

        }
    })

    //监听扭曲节点是否开启
    $('#distortionnode').on('click',function (){
        if($(this).is(':checked') && app.audio){
            distortion.curve = makeDistortionCurve(500);
            off_distortion.curve = makeDistortionCurve(500);
            distortion.oversample = '2x';
            off_distortion.oversample = '2x';
            gainNode_distortion.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime+2);
            off_gainNode_distortion.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime+2);
            source.connect(distortion).connect(gainNode_distortion).connect(gainNode).connect(compressor).connect(audioCtx.destination);
            off_source.connect(off_distortion).connect(off_gainNode_distortion).connect(off_gainNode).connect(off_compressor).connect(offlineCXT.destination);
        }
        else if(app.audio){
            gainNode_distortion.disconnect(gainNode);
            off_gainNode_distortion.disconnect(off_gainNode);
        }
    })

    //监听滤波器节点是否开启
    $('#irrnode').on('click', function (){
        if($(this).is(':checked') && app.audio) {
            biquadFilter.gain.setValueAtTime(25, audioCtx.currentTime+1);
            off_biquadFilter.gain.setValueAtTime(25, audioCtx.currentTime+1);
            biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime+1);
            off_biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime+1);
            gainNode_biquadFilter.gain.exponentialRampToValueAtTime(0.5,audioCtx.currentTime+2);
            off_gainNode_biquadFilter.gain.exponentialRampToValueAtTime(0.5,audioCtx.currentTime+2);
            source_biquadFilter.connect(biquadFilter).connect(gainNode_biquadFilter).connect(gainNode).connect(compressor).connect(audioCtx.destination);
            off_source_biquadFilter.connect(off_biquadFilter).connect(off_gainNode_biquadFilter).connect(off_gainNode).connect(off_compressor).connect(offlineCXT.destination);
        }
        else if(app.audio){
            gainNode_biquadFilter.disconnect(gainNode);
            off_gainNode_biquadFilter.disconnect(off_gainNode);
        }
    })

    function adjust_currTime(e){
        if(app.audio.currentTime > app.audio.duration){
            app.audio.currentTime = app.audio.duration;
        }
        setTime($('#showtime'), app.audio.currentTime);
        var currWidth = $('#scroll-audio').width();
        $('#scroll-audio').animate({ left: currWidth * audioCtx.currentTime / app.audio.duration }, 0.01)
    }

    //设置播放时间
    function setTime(label, time) {
        var desstr = label.html().split('/')
        var total = desstr[1]
        var timer = parseFloat(time);
        var minute = parseInt(timer / 60);
        var second = timer - minute * 60;
        var minflag = "";
        var secflag = "";
        if (second < 10) secflag = "0"
        if (minute < 10) minflag = "0"
        label.html(minflag + minute + ":" + secflag + parseInt(second) + "/" + total);
    }

    //设置混响效果背景图片透明度
    function toOpacity(input){
        var name = ['convolve-forest', 'convolve-launch', 'convolve-drain', 'convolve-church']
        for(var i=0; i<name.length; i++){
            // console.log(input)
            if(name[i] == input) continue;
            $("#"+name[i]).css('opacity',0.1)
        }
    }
}

//计算自相关函数，用于音高追踪，功能尚未完全实现
function autoCorrelate( buf, sampleRate ) {
    var SIZE = buf.length;
    var rms = 0;

    for (var i=0;i<SIZE;i++) {
        var val = buf[i];
        rms += val*val;
    }
    rms = Math.sqrt(rms/SIZE);
    if (rms<0.01) // not enough signal
        return -1;

    var r1=0, r2=SIZE-1, thres=0.2;
    for (var i=0; i<SIZE/2; i++)
        if (Math.abs(buf[i])<thres) { r1=i; break; }
    for (var i=1; i<SIZE/2; i++)
        if (Math.abs(buf[SIZE-i])<thres) { r2=SIZE-i; break; }

    buf = buf.slice(r1,r2);
    SIZE = buf.length;

    var c = new Array(SIZE).fill(0);
    for (var i=0; i<SIZE; i++)
        for (var j=0; j<SIZE-i; j++)
            c[i] = c[i] + buf[j]*buf[j+i];

    var d=0; while (c[d]>c[d+1]) d++;
    var maxval=-1, maxpos=-1;
    for (var i=d; i<SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }
    var T0 = maxpos;

    var x1=c[T0-1], x2=c[T0], x3=c[T0+1];
    a = (x1 + x3 - 2*x2)/2;
    b = (x3 - x1)/2;
    if (a) T0 = T0 - b/(2*a);

    return sampleRate/T0;
}

// 设置滚动条滑动样式
$.fn.RangeSlider = function(cfg){
    this.sliderCfg = {
        min: cfg && !isNaN(parseFloat(cfg.min)) ? Number(cfg.min) : null,
        max: cfg && !isNaN(parseFloat(cfg.max)) ? Number(cfg.max) : null,
        step: cfg && Number(cfg.step) ? cfg.step : 1,
        callback: cfg && cfg.callback ? cfg.callback : null
    };

    var $input = $(this);
    var min = this.sliderCfg.min;
    var max = this.sliderCfg.max;
    var step = this.sliderCfg.step;
    var callback = this.sliderCfg.callback;
    $input.attr('min', min)
        .attr('max', max)
        .attr('step', step);
    $input.bind("input", function(e){
        $input.attr('value', this.value);
        // console.log(this.value)
        $input.css( 'background', 'linear-gradient(to right, #059CFA, black,' + 100*2*(this.value-this.min)/(this.max-this.min) + '%, black)' );
        // console.log((this.value-this.min)/(this.max-this.min))
        if ($.isFunction(callback)) {
            callback(this);
        }
    });

};
