const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height, centerX, centerY;
let audioContext = null;
let analyser = null;
let dataArray = null;
let isRunning = false;
let isDemoMode = false;

let displayMode = 'bars';
let barCount = 64;
let smoothing = 0.8;
let colorMode = 'rainbow';

let smoothedData = [];
let demoTime = 0;
let peakValues = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
}

async function startMicrophone() {
    if (audioContext) return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = smoothing;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        dataArray = new Uint8Array(analyser.frequencyBinCount);
        smoothedData = new Array(barCount).fill(0);
        peakValues = new Array(barCount).fill(0);
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
    dataArray = new Uint8Array(256);
    smoothedData = new Array(barCount).fill(0);
    peakValues = new Array(barCount).fill(0);
    document.getElementById('demoBtn').textContent = '演示中';
}

function generateDemoData() {
    demoTime += 0.03;

    for (let i = 0; i < dataArray.length; i++) {
        // Create dynamic frequency spectrum
        const bassFreq = i < 20 ? Math.sin(demoTime * 4) * 100 + 100 : 0;
        const midFreq = (i > 20 && i < 80) ? Math.sin(demoTime * 2 + i * 0.05) * 60 + 60 : 0;
        const highFreq = i > 80 ? Math.sin(demoTime * 6 + i * 0.1) * 40 + 30 : 0;

        // Add some beat patterns
        const beat = Math.sin(demoTime * 8) > 0.8 ? 50 : 0;

        dataArray[i] = Math.max(0, Math.min(255, bassFreq + midFreq + highFreq + beat + Math.random() * 20));
    }
}

function processData() {
    if (isDemoMode) {
        generateDemoData();
    } else if (analyser) {
        analyser.getByteFrequencyData(dataArray);
    }

    if (!dataArray) return;

    // Map data to bar count with smoothing
    const step = Math.floor(dataArray.length / barCount);
    for (let i = 0; i < barCount; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
            sum += dataArray[i * step + j] || 0;
        }
        const value = sum / step;

        // Smooth transition
        smoothedData[i] = smoothedData[i] * smoothing + value * (1 - smoothing);

        // Update peak values (falling)
        if (smoothedData[i] > peakValues[i]) {
            peakValues[i] = smoothedData[i];
        } else {
            peakValues[i] *= 0.98;
        }
    }
}

function getColor(index, value) {
    const ratio = index / barCount;
    const intensity = value / 255;

    switch (colorMode) {
        case 'rainbow':
            return `hsl(${ratio * 360}, 80%, ${40 + intensity * 30}%)`;
        case 'fire':
            return `hsl(${ratio * 60}, 100%, ${30 + intensity * 40}%)`;
        case 'ocean':
            return `hsl(${180 + ratio * 60}, 80%, ${30 + intensity * 40}%)`;
        case 'neon':
            const hues = [300, 180, 60, 120];
            return `hsl(${hues[index % 4]}, 100%, ${40 + intensity * 40}%)`;
        default:
            return `hsl(270, 80%, ${40 + intensity * 30}%)`;
    }
}

function drawBars() {
    const barWidth = (width * 0.8) / barCount;
    const startX = width * 0.1;
    const maxHeight = height * 0.7;

    for (let i = 0; i < barCount; i++) {
        const value = smoothedData[i];
        const barHeight = (value / 255) * maxHeight;
        const x = startX + i * barWidth;
        const y = height - barHeight - 50;

        // Draw bar gradient
        const gradient = ctx.createLinearGradient(x, height - 50, x, y);
        gradient.addColorStop(0, getColor(i, value * 0.5));
        gradient.addColorStop(1, getColor(i, value));

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, barHeight);

        // Draw glow
        ctx.shadowColor = getColor(i, value);
        ctx.shadowBlur = 10;
        ctx.fillRect(x, y, barWidth - 2, 5);
        ctx.shadowBlur = 0;

        // Draw peak indicator
        const peakY = height - 50 - (peakValues[i] / 255) * maxHeight;
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, peakY - 3, barWidth - 2, 3);
    }

    // Draw reflection
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < barCount; i++) {
        const value = smoothedData[i];
        const barHeight = (value / 255) * maxHeight * 0.3;
        const x = startX + i * barWidth;

        ctx.fillStyle = getColor(i, value);
        ctx.fillRect(x, height - 45, barWidth - 2, barHeight);
    }
    ctx.globalAlpha = 1;
}

function drawMirror() {
    const barWidth = (width * 0.8) / barCount;
    const startX = width * 0.1;
    const maxHeight = height * 0.35;

    for (let i = 0; i < barCount; i++) {
        const value = smoothedData[i];
        const barHeight = (value / 255) * maxHeight;
        const x = startX + i * barWidth;

        // Upper half
        const gradient1 = ctx.createLinearGradient(x, centerY, x, centerY - barHeight);
        gradient1.addColorStop(0, getColor(i, value * 0.3));
        gradient1.addColorStop(1, getColor(i, value));

        ctx.fillStyle = gradient1;
        ctx.fillRect(x, centerY - barHeight, barWidth - 2, barHeight);

        // Lower half (mirrored)
        const gradient2 = ctx.createLinearGradient(x, centerY, x, centerY + barHeight);
        gradient2.addColorStop(0, getColor(i, value * 0.3));
        gradient2.addColorStop(1, getColor(i, value));

        ctx.fillStyle = gradient2;
        ctx.fillRect(x, centerY, barWidth - 2, barHeight);
    }

    // Center line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, centerY - 1, width, 2);
}

function drawCircular() {
    const radius = Math.min(width, height) * 0.25;
    const maxBarLength = radius * 0.8;

    for (let i = 0; i < barCount; i++) {
        const value = smoothedData[i];
        const barLength = (value / 255) * maxBarLength;
        const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;

        const innerRadius = radius * 0.3;
        const outerRadius = innerRadius + barLength;

        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, getColor(i, value * 0.5));
        gradient.addColorStop(1, getColor(i, value));

        ctx.strokeStyle = gradient;
        ctx.lineWidth = (Math.PI * 2 * innerRadius) / barCount * 0.8;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Center circle
    const avgValue = smoothedData.reduce((a, b) => a + b, 0) / barCount;
    const centerRadius = radius * 0.2 + (avgValue / 255) * 20;

    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + avgValue / 510})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    ctx.fill();
}

function draw3D() {
    const barWidth = (width * 0.6) / barCount;
    const startX = width * 0.2;
    const maxHeight = height * 0.5;
    const perspective = 0.4;

    for (let i = 0; i < barCount; i++) {
        const value = smoothedData[i];
        const barHeight = (value / 255) * maxHeight;

        // Calculate 3D position
        const depthRatio = i / barCount;
        const x = startX + i * barWidth;
        const yBase = height * 0.8 - depthRatio * height * perspective;
        const scaledWidth = barWidth * (1 - depthRatio * 0.3);
        const scaledHeight = barHeight * (1 - depthRatio * 0.3);

        // Draw bar with depth shading
        const brightness = 60 - depthRatio * 30;
        ctx.fillStyle = `hsl(${(i / barCount) * 360}, 80%, ${brightness}%)`;
        ctx.fillRect(x, yBase - scaledHeight, scaledWidth - 2, scaledHeight);

        // Draw top face
        ctx.fillStyle = `hsl(${(i / barCount) * 360}, 80%, ${brightness + 20}%)`;
        ctx.fillRect(x, yBase - scaledHeight - 3, scaledWidth - 2, 3);
    }
}

function updateStats() {
    if (!smoothedData.length) return;

    // Find peak frequency
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < smoothedData.length; i++) {
        if (smoothedData[i] > maxValue) {
            maxValue = smoothedData[i];
            maxIndex = i;
        }
    }

    // Calculate approximate frequency
    const freqRange = 22050; // Half of sample rate
    const peakFreq = Math.round((maxIndex / barCount) * freqRange);
    document.getElementById('peakFreq').textContent = peakFreq + ' Hz';

    // Calculate energy level
    const avgEnergy = smoothedData.reduce((a, b) => a + b, 0) / smoothedData.length;
    document.getElementById('energyLevel').textContent = Math.round((avgEnergy / 255) * 100) + '%';
}

function animate() {
    // Clear with fade
    ctx.fillStyle = 'rgba(10, 10, 10, 0.3)';
    ctx.fillRect(0, 0, width, height);

    if (isRunning) {
        processData();

        switch (displayMode) {
            case 'bars':
                drawBars();
                break;
            case 'mirror':
                drawMirror();
                break;
            case 'circular':
                drawCircular();
                break;
            case '3d':
                draw3D();
                break;
        }

        updateStats();
    }

    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startMicrophone);
document.getElementById('demoBtn').addEventListener('click', startDemo);

document.getElementById('displayMode').addEventListener('change', (e) => {
    displayMode = e.target.value;
});

document.getElementById('barCountSlider').addEventListener('input', (e) => {
    barCount = parseInt(e.target.value);
    document.getElementById('barCountValue').textContent = barCount;
    smoothedData = new Array(barCount).fill(0);
    peakValues = new Array(barCount).fill(0);
});

document.getElementById('smoothSlider').addEventListener('input', (e) => {
    smoothing = parseFloat(e.target.value);
    document.getElementById('smoothValue').textContent = smoothing.toFixed(2);
    if (analyser) {
        analyser.smoothingTimeConstant = smoothing;
    }
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    colorMode = e.target.value;
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
