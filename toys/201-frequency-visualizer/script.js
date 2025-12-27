let canvas, ctx;
let audioContext, analyser, source;
let oscillator = null;
let micStream = null;
let displayMode = 'bars';
let toneFrequency = 440;
let dataArray, bufferLength;
let isPlaying = false;
let isMicActive = false;

function init() {
    canvas = document.getElementById('visualizerCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    animate();
}

function resizeCanvas() {
    const width = Math.min(800, window.innerWidth - 40);
    canvas.width = width;
    canvas.height = width * 0.5;
}

function setupControls() {
    document.getElementById('micBtn').addEventListener('click', toggleMicrophone);
    document.getElementById('toneBtn').addEventListener('click', toggleTone);

    document.getElementById('freqSlider').addEventListener('input', (e) => {
        toneFrequency = parseInt(e.target.value);
        document.getElementById('freqValue').textContent = toneFrequency + ' Hz';
        if (oscillator) {
            oscillator.frequency.setValueAtTime(toneFrequency, audioContext.currentTime);
        }
    });

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayMode = btn.dataset.mode;
        });
    });
}

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    }
}

async function toggleMicrophone() {
    initAudio();
    const btn = document.getElementById('micBtn');

    if (isMicActive) {
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
            micStream = null;
        }
        if (source) {
            source.disconnect();
            source = null;
        }
        isMicActive = false;
        btn.classList.remove('active');
        btn.textContent = '使用麥克風';
    } else {
        // Stop tone if playing
        if (oscillator) {
            oscillator.stop();
            oscillator = null;
            isPlaying = false;
            document.getElementById('toneBtn').classList.remove('active');
            document.getElementById('toneBtn').textContent = '產生音調';
        }

        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            source = audioContext.createMediaStreamSource(micStream);
            source.connect(analyser);
            isMicActive = true;
            btn.classList.add('active');
            btn.textContent = '停止麥克風';
        } catch (err) {
            alert('無法存取麥克風: ' + err.message);
        }
    }
}

function toggleTone() {
    initAudio();
    const btn = document.getElementById('toneBtn');

    if (isPlaying) {
        oscillator.stop();
        oscillator = null;
        isPlaying = false;
        btn.classList.remove('active');
        btn.textContent = '產生音調';
    } else {
        // Stop mic if active
        if (isMicActive) {
            if (micStream) {
                micStream.getTracks().forEach(track => track.stop());
                micStream = null;
            }
            if (source) {
                source.disconnect();
                source = null;
            }
            isMicActive = false;
            document.getElementById('micBtn').classList.remove('active');
            document.getElementById('micBtn').textContent = '使用麥克風';
        }

        oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(toneFrequency, audioContext.currentTime);

        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(audioContext.destination);

        oscillator.start();
        isPlaying = true;
        btn.classList.add('active');
        btn.textContent = '停止音調';
    }
}

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!analyser) {
        drawNoAudio();
        return;
    }

    analyser.getByteFrequencyData(dataArray);

    switch (displayMode) {
        case 'bars':
            drawBars();
            break;
        case 'wave':
            drawWave();
            break;
        case 'circle':
            drawCircle();
            break;
    }
}

function drawNoAudio() {
    ctx.fillStyle = '#333';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('點擊按鈕開始', canvas.width / 2, canvas.height / 2);
}

function drawBars() {
    const barWidth = (canvas.width / bufferLength) * 2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;

        const hue = (i / bufferLength) * 300;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
    }
}

function drawWave() {
    analyser.getByteTimeDomainData(dataArray);

    ctx.beginPath();
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#ff00ff');
    gradient.addColorStop(0.5, '#00ffff');
    gradient.addColorStop(1, '#ff00ff');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawCircle() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = Math.min(canvas.width, canvas.height) * 0.3;

    // Draw circular spectrum
    for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * Math.PI * 2 - Math.PI / 2;
        const amplitude = (dataArray[i] / 255) * 100;
        const radius = baseRadius + amplitude;

        const x1 = centerX + Math.cos(angle) * baseRadius;
        const y1 = centerY + Math.sin(angle) * baseRadius;
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;

        const hue = (i / bufferLength) * 360;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 0.3, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 0.3);
    gradient.addColorStop(0, '#ff00ff');
    gradient.addColorStop(1, '#00ffff');
    ctx.fillStyle = gradient;
    ctx.fill();
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
