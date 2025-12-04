const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let audioContext = null;
let analyser = null;
let dataArray = null;
let isRunning = false;
let isDemoMode = false;

let colorScheme = 'hot';
let fftSize = 1024;
let scrollSpeed = 1;
let gain = 1.0;

let spectrogramData = [];
let demoTime = 0;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    spectrogramData = [];
}

async function startMicrophone() {
    if (audioContext) return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = 0.3;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        dataArray = new Uint8Array(analyser.frequencyBinCount);
        isRunning = true;
        isDemoMode = false;
        document.getElementById('startBtn').textContent = '運行中';
    } catch (err) {
        console.error('Microphone error:', err);
        alert('無法存取麥克風，請使用演示模式');
    }
}

function startDemo() {
    isDemoMode = true;
    isRunning = true;
    dataArray = new Uint8Array(fftSize / 2);
    spectrogramData = [];
    document.getElementById('demoBtn').textContent = '演示中';
}

function generateDemoData() {
    demoTime += 0.05;

    for (let i = 0; i < dataArray.length; i++) {
        const freq = i / dataArray.length;

        // Simulate various sounds
        let value = 0;

        // Low frequency hum
        if (freq < 0.1) {
            value += Math.sin(demoTime * 3) * 80 + 80;
        }

        // Sweeping tone
        const sweepFreq = (Math.sin(demoTime * 0.5) + 1) / 2;
        if (Math.abs(freq - sweepFreq) < 0.05) {
            value += 150 * (1 - Math.abs(freq - sweepFreq) / 0.05);
        }

        // Harmonics
        const fundamental = 0.1 + Math.sin(demoTime * 0.2) * 0.05;
        for (let h = 1; h <= 5; h++) {
            const harmFreq = fundamental * h;
            if (Math.abs(freq - harmFreq) < 0.02) {
                value += (100 / h) * (1 - Math.abs(freq - harmFreq) / 0.02);
            }
        }

        // Noise floor
        value += Math.random() * 20;

        dataArray[i] = Math.max(0, Math.min(255, value));
    }
}

function getColor(value, scheme) {
    const v = Math.min(1, value * gain / 255);

    switch (scheme) {
        case 'hot':
            // Black -> Red -> Yellow -> White
            if (v < 0.33) {
                return `rgb(${Math.floor(v * 3 * 255)}, 0, 0)`;
            } else if (v < 0.66) {
                return `rgb(255, ${Math.floor((v - 0.33) * 3 * 255)}, 0)`;
            } else {
                const white = Math.floor((v - 0.66) * 3 * 255);
                return `rgb(255, 255, ${white})`;
            }

        case 'viridis':
            // Purple -> Blue -> Teal -> Green -> Yellow
            const h = 280 - v * 220;
            const s = 60 + v * 30;
            const l = 20 + v * 50;
            return `hsl(${h}, ${s}%, ${l}%)`;

        case 'plasma':
            // Purple -> Pink -> Orange -> Yellow
            const hp = 300 - v * 240;
            const sp = 80 + v * 20;
            const lp = 20 + v * 60;
            return `hsl(${hp}, ${sp}%, ${lp}%)`;

        case 'grayscale':
            const gray = Math.floor(v * 255);
            return `rgb(${gray}, ${gray}, ${gray})`;

        default:
            return `rgb(${Math.floor(v * 255)}, 0, 0)`;
    }
}

function updateSpectrogram() {
    if (isDemoMode) {
        generateDemoData();
    } else if (analyser) {
        analyser.getByteFrequencyData(dataArray);
    }

    if (!dataArray) return;

    // Add current frame to spectrogram data
    spectrogramData.push(new Uint8Array(dataArray));

    // Limit data based on canvas width and speed
    const maxFrames = Math.ceil(width / scrollSpeed);
    while (spectrogramData.length > maxFrames) {
        spectrogramData.shift();
    }
}

function drawSpectrogram() {
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    if (spectrogramData.length === 0) return;

    const freqBins = spectrogramData[0].length;
    const pixelsPerFrame = scrollSpeed;
    const pixelsPerBin = (height - 100) / freqBins;

    // Draw spectrogram
    for (let x = 0; x < spectrogramData.length; x++) {
        const frame = spectrogramData[x];
        const xPos = width - (spectrogramData.length - x) * pixelsPerFrame;

        for (let y = 0; y < freqBins; y++) {
            const value = frame[y];
            if (value > 10) {
                ctx.fillStyle = getColor(value, colorScheme);
                ctx.fillRect(
                    xPos,
                    height - 50 - (y + 1) * pixelsPerBin,
                    pixelsPerFrame + 1,
                    pixelsPerBin + 1
                );
            }
        }
    }

    // Draw frequency scale
    drawFrequencyScale();

    // Draw time scale
    drawTimeScale();
}

function drawFrequencyScale() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, 60, height - 50);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';

    const sampleRate = audioContext ? audioContext.sampleRate : 44100;
    const maxFreq = sampleRate / 2;
    const freqSteps = [100, 500, 1000, 2000, 5000, 10000, 20000];

    for (const freq of freqSteps) {
        if (freq > maxFreq) continue;

        const y = height - 50 - (freq / maxFreq) * (height - 100);

        ctx.beginPath();
        ctx.moveTo(55, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        const label = freq >= 1000 ? `${freq / 1000}k` : freq;
        ctx.fillText(label, 50, y + 4);
    }

    // Frequency label
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Frequency (Hz)', 0, 0);
    ctx.restore();
}

function drawTimeScale() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, height - 50, width, 50);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';

    // Estimate time range
    const framesPerSecond = 60 / scrollSpeed;
    const totalSeconds = spectrogramData.length / framesPerSecond;

    document.getElementById('timeRange').textContent = totalSeconds.toFixed(1) + ' 秒';

    // Draw time markers
    for (let t = 0; t <= 10; t += 2) {
        const x = width - t * framesPerSecond * scrollSpeed;
        if (x < 60) continue;

        ctx.beginPath();
        ctx.moveTo(x, height - 50);
        ctx.lineTo(x, height - 40);
        ctx.stroke();

        ctx.fillText(`-${t}s`, x, height - 25);
    }

    // Time label
    ctx.fillText('Time', width / 2, height - 10);
}

function drawColorScale() {
    const scaleWidth = 20;
    const scaleHeight = height - 150;
    const x = width - 40;
    const y = 50;

    // Draw scale
    for (let i = 0; i < scaleHeight; i++) {
        const value = ((scaleHeight - i) / scaleHeight) * 255;
        ctx.fillStyle = getColor(value, colorScheme);
        ctx.fillRect(x, y + i, scaleWidth, 1);
    }

    // Border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, scaleWidth, scaleHeight);

    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('High', x + 25, y + 10);
    ctx.fillText('Low', x + 25, y + scaleHeight);
}

function updateStats() {
    const sampleRate = audioContext ? audioContext.sampleRate : 44100;
    document.getElementById('maxFreq').textContent = (sampleRate / 2000).toFixed(2) + ' kHz';
}

function animate() {
    if (isRunning) {
        updateSpectrogram();
    }

    drawSpectrogram();
    drawColorScale();
    updateStats();

    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startMicrophone);
document.getElementById('demoBtn').addEventListener('click', startDemo);

document.getElementById('colorScheme').addEventListener('change', (e) => {
    colorScheme = e.target.value;
});

document.getElementById('fftSize').addEventListener('change', (e) => {
    fftSize = parseInt(e.target.value);
    document.getElementById('fftValue').textContent = fftSize;

    if (analyser) {
        analyser.fftSize = fftSize;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    } else if (isDemoMode) {
        dataArray = new Uint8Array(fftSize / 2);
    }
    spectrogramData = [];
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
    scrollSpeed = parseInt(e.target.value);
    document.getElementById('speedValue').textContent = scrollSpeed;
});

document.getElementById('gainSlider').addEventListener('input', (e) => {
    gain = parseFloat(e.target.value);
    document.getElementById('gainValue').textContent = gain.toFixed(1);
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
