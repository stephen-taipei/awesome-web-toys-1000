const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let audioContext = null;
let oscillator = null;
let gainNode = null;
let analyser = null;
let dataArray = null;

let waveType = 'sine';
let frequency = 440;
let amplitude = 0.5;
let scanSpeed = 1.0;
let isPlaying = false;

let time = 0;
let waveHistory = [];
const maxHistory = 500;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function initAudio() {
    if (audioContext) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    dataArray = new Float32Array(analyser.frequencyBinCount);

    gainNode = audioContext.createGain();
    gainNode.gain.value = amplitude * 0.3; // Lower volume

    gainNode.connect(analyser);
    analyser.connect(audioContext.destination);
}

function startOscillator() {
    if (!audioContext) initAudio();
    if (oscillator) stopOscillator();

    oscillator = audioContext.createOscillator();
    oscillator.type = waveType === 'noise' ? 'sine' : waveType;
    oscillator.frequency.value = frequency;

    if (waveType === 'noise') {
        // Create noise using buffer
        const bufferSize = 2 * audioContext.sampleRate;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const noise = audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        noise.connect(gainNode);
        noise.start();
        oscillator = noise;
    } else {
        oscillator.connect(gainNode);
        oscillator.start();
    }

    isPlaying = true;
    document.getElementById('playBtn').textContent = '播放中';
}

function stopOscillator() {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
    }
    isPlaying = false;
    document.getElementById('playBtn').textContent = '播放音頻';
}

function generateWaveValue(t, type) {
    const phase = (t * frequency * 2 * Math.PI) % (2 * Math.PI);

    switch (type) {
        case 'sine':
            return Math.sin(phase);
        case 'square':
            return Math.sin(phase) > 0 ? 1 : -1;
        case 'sawtooth':
            return ((phase / Math.PI) % 2) - 1;
        case 'triangle':
            const saw = ((phase / Math.PI) % 2) - 1;
            return Math.abs(saw) * 2 - 1;
        case 'noise':
            return Math.random() * 2 - 1;
        default:
            return 0;
    }
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.1)';
    ctx.lineWidth = 1;

    // Vertical lines
    const gridSpacing = 50;
    for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Center line (stronger)
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw scale markers
    ctx.fillStyle = 'rgba(34, 197, 94, 0.5)';
    ctx.font = '12px monospace';
    ctx.fillText('+1.0', 10, height / 4 + 5);
    ctx.fillText(' 0.0', 10, height / 2 + 5);
    ctx.fillText('-1.0', 10, height * 3 / 4 + 5);
}

function drawWaveform() {
    const centerY = height / 2;
    const waveHeight = height * 0.35 * amplitude;

    // Get data from analyser if playing
    if (isPlaying && analyser) {
        analyser.getFloatTimeDomainData(dataArray);
    }

    // Draw history trails
    for (let h = 0; h < waveHistory.length; h++) {
        const alpha = 0.1 * (h / waveHistory.length);
        ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();

        const historyData = waveHistory[h];
        for (let i = 0; i < historyData.length; i++) {
            const x = (i / historyData.length) * width;
            const y = centerY - historyData[i] * waveHeight;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // Generate current waveform data
    const currentWave = [];
    const samplesPerScreen = Math.floor(width / scanSpeed);

    for (let i = 0; i < samplesPerScreen; i++) {
        const t = time + (i / samplesPerScreen) * (4 / frequency);
        const value = generateWaveValue(t, waveType);
        currentWave.push(value);
    }

    // Store in history
    waveHistory.push([...currentWave]);
    if (waveHistory.length > 10) {
        waveHistory.shift();
    }

    // Draw main waveform with glow
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < currentWave.length; i++) {
        const x = (i / currentWave.length) * width;
        const y = centerY - currentWave[i] * waveHeight;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw dots at peaks
    ctx.fillStyle = '#86efac';
    for (let i = 1; i < currentWave.length - 1; i++) {
        if ((currentWave[i] > currentWave[i - 1] && currentWave[i] > currentWave[i + 1]) ||
            (currentWave[i] < currentWave[i - 1] && currentWave[i] < currentWave[i + 1])) {
            const x = (i / currentWave.length) * width;
            const y = centerY - currentWave[i] * waveHeight;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    document.getElementById('sampleCount').textContent = currentWave.length;
}

function drawOscilloscope() {
    if (!isPlaying || !dataArray) return;

    const centerY = height / 2;
    const waveHeight = height * 0.3;

    // Draw real audio data from analyser
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    for (let i = 0; i < dataArray.length; i++) {
        const x = i * sliceWidth;
        const y = centerY - dataArray[i] * waveHeight;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function drawInfo() {
    // Draw frequency info
    const period = 1000 / frequency;
    document.getElementById('periodValue').textContent = period.toFixed(2) + ' ms';

    // Draw on canvas
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`Frequency: ${frequency} Hz`, width - 200, 30);
    ctx.fillText(`Period: ${period.toFixed(2)} ms`, width - 200, 50);
    ctx.fillText(`Type: ${waveType}`, width - 200, 70);
}

function updateParams() {
    if (oscillator && waveType !== 'noise') {
        oscillator.frequency.value = frequency;
    }
    if (gainNode) {
        gainNode.gain.value = amplitude * 0.3;
    }
}

function animate() {
    // Clear with dark background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    drawGrid();
    drawWaveform();
    drawOscilloscope();
    drawInfo();

    time += 0.016 * scanSpeed;

    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('playBtn').addEventListener('click', () => {
    if (isPlaying) {
        stopOscillator();
    } else {
        startOscillator();
    }
});

document.getElementById('stopBtn').addEventListener('click', stopOscillator);

document.getElementById('waveType').addEventListener('change', (e) => {
    waveType = e.target.value;
    if (isPlaying) {
        stopOscillator();
        startOscillator();
    }
});

document.getElementById('freqSlider').addEventListener('input', (e) => {
    frequency = parseInt(e.target.value);
    document.getElementById('freqValue').textContent = frequency;
    updateParams();
});

document.getElementById('ampSlider').addEventListener('input', (e) => {
    amplitude = parseFloat(e.target.value);
    document.getElementById('ampValue').textContent = amplitude.toFixed(2);
    updateParams();
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
    scanSpeed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = scanSpeed.toFixed(1);
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
