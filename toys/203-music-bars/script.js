let canvas, ctx;
let numBars = 32;
let bpm = 120;
let style = 'bars';
let colorScheme = 'rainbow';
let mode = 'demo';
let bars = [];
let time = 0;
let audioContext, analyser, micStream, source;
let dataArray;

function init() {
    canvas = document.getElementById('barsCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    initBars();
    animate();
}

function resizeCanvas() {
    const width = Math.min(800, window.innerWidth - 40);
    canvas.width = width;
    canvas.height = width * 0.6;
}

function setupControls() {
    document.getElementById('demoBtn').addEventListener('click', () => setMode('demo'));
    document.getElementById('micBtn').addEventListener('click', () => setMode('mic'));

    document.getElementById('bpmSlider').addEventListener('input', (e) => {
        bpm = parseInt(e.target.value);
        document.getElementById('bpmValue').textContent = bpm + ' BPM';
    });

    document.getElementById('barsSlider').addEventListener('input', (e) => {
        numBars = parseInt(e.target.value);
        document.getElementById('barsValue').textContent = numBars;
        initBars();
    });

    document.getElementById('styleSelect').addEventListener('change', (e) => {
        style = e.target.value;
    });

    document.getElementById('colorSelect').addEventListener('change', (e) => {
        colorScheme = e.target.value;
    });
}

function setMode(newMode) {
    mode = newMode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));

    if (newMode === 'demo') {
        document.getElementById('demoBtn').classList.add('active');
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
            micStream = null;
        }
    } else if (newMode === 'mic') {
        document.getElementById('micBtn').classList.add('active');
        startMicrophone();
    }
}

async function startMicrophone() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 64;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        }

        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        source = audioContext.createMediaStreamSource(micStream);
        source.connect(analyser);
    } catch (err) {
        alert('無法存取麥克風');
        setMode('demo');
    }
}

function initBars() {
    bars = [];
    for (let i = 0; i < numBars; i++) {
        bars.push({
            height: 0,
            targetHeight: 0,
            phase: Math.random() * Math.PI * 2
        });
    }
}

function updateDemo() {
    const beatFreq = bpm / 60;
    const beatPhase = time * beatFreq * Math.PI * 2;

    bars.forEach((bar, i) => {
        // Create rhythmic patterns
        const bassFreq = Math.sin(beatPhase) * 0.5 + 0.5;
        const midFreq = Math.sin(beatPhase * 2 + bar.phase) * 0.5 + 0.5;
        const highFreq = Math.sin(beatPhase * 4 + bar.phase * 2) * 0.5 + 0.5;

        const position = i / numBars;

        if (position < 0.3) {
            bar.targetHeight = bassFreq * (1 - position * 2);
        } else if (position < 0.7) {
            bar.targetHeight = midFreq * 0.8;
        } else {
            bar.targetHeight = highFreq * (position - 0.5) * 1.5;
        }

        // Add some randomness
        bar.targetHeight *= 0.8 + Math.random() * 0.4;
        bar.targetHeight = Math.max(0.05, Math.min(1, bar.targetHeight));
    });
}

function updateMic() {
    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);

    const step = Math.floor(dataArray.length / numBars);
    bars.forEach((bar, i) => {
        const idx = Math.min(i * step, dataArray.length - 1);
        bar.targetHeight = dataArray[idx] / 255;
    });
}

function update() {
    if (mode === 'demo') {
        updateDemo();
    } else {
        updateMic();
    }

    // Smooth transition
    bars.forEach(bar => {
        bar.height += (bar.targetHeight - bar.height) * 0.2;
    });

    time += 0.016;
}

function getColor(index, height) {
    const t = index / numBars;
    const h = height;

    switch (colorScheme) {
        case 'rainbow':
            return `hsl(${t * 360}, 80%, ${40 + h * 30}%)`;
        case 'fire':
            const fireHue = 60 - h * 60;
            return `hsl(${fireHue}, 100%, ${50 + h * 30}%)`;
        case 'ocean':
            const oceanHue = 180 + t * 60;
            return `hsl(${oceanHue}, 80%, ${30 + h * 40}%)`;
        case 'neon':
            const neonHue = (t * 120 + 300) % 360;
            return `hsl(${neonHue}, 100%, ${50 + h * 20}%)`;
        default:
            return `hsl(${t * 360}, 80%, 50%)`;
    }
}

function drawBars() {
    const barWidth = (canvas.width - 20) / numBars - 2;
    const maxHeight = canvas.height * 0.85;

    bars.forEach((bar, i) => {
        const x = 10 + i * (barWidth + 2);
        const height = bar.height * maxHeight;
        const y = canvas.height - height - 10;

        // Bar gradient
        const gradient = ctx.createLinearGradient(x, y + height, x, y);
        gradient.addColorStop(0, getColor(i, bar.height));
        gradient.addColorStop(1, getColor(i, bar.height * 0.5));

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, height);

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = getColor(i, bar.height);
        ctx.fillRect(x, y, barWidth, height);
        ctx.shadowBlur = 0;
    });
}

function drawMirror() {
    const barWidth = (canvas.width - 20) / numBars - 2;
    const maxHeight = (canvas.height - 20) / 2 * 0.9;
    const centerY = canvas.height / 2;

    bars.forEach((bar, i) => {
        const x = 10 + i * (barWidth + 2);
        const height = bar.height * maxHeight;

        const gradient = ctx.createLinearGradient(x, centerY, x, centerY - height);
        gradient.addColorStop(0, getColor(i, bar.height));
        gradient.addColorStop(1, getColor(i, bar.height * 0.3));

        // Top bars
        ctx.fillStyle = gradient;
        ctx.fillRect(x, centerY - height, barWidth, height);

        // Bottom bars (mirrored)
        const gradient2 = ctx.createLinearGradient(x, centerY, x, centerY + height);
        gradient2.addColorStop(0, getColor(i, bar.height));
        gradient2.addColorStop(1, getColor(i, bar.height * 0.3));
        ctx.fillStyle = gradient2;
        ctx.fillRect(x, centerY, barWidth, height);
    });

    // Center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();
}

function drawCircular() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = Math.min(canvas.width, canvas.height) * 0.25;
    const maxBarLength = Math.min(canvas.width, canvas.height) * 0.2;

    bars.forEach((bar, i) => {
        const angle = (i / numBars) * Math.PI * 2 - Math.PI / 2;
        const barLength = bar.height * maxBarLength;

        const x1 = centerX + Math.cos(angle) * baseRadius;
        const y1 = centerY + Math.sin(angle) * baseRadius;
        const x2 = centerX + Math.cos(angle) * (baseRadius + barLength);
        const y2 = centerY + Math.sin(angle) * (baseRadius + barLength);

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, getColor(i, bar.height * 0.5));
        gradient.addColorStop(1, getColor(i, bar.height));

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = (Math.PI * 2 * baseRadius) / numBars * 0.7;
        ctx.lineCap = 'round';
        ctx.stroke();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 0.5, 0, Math.PI * 2);
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 0.5);
    centerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    ctx.fillStyle = centerGradient;
    ctx.fill();
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (style) {
        case 'bars':
            drawBars();
            break;
        case 'mirror':
            drawMirror();
            break;
        case 'circular':
            drawCircular();
            break;
    }
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
