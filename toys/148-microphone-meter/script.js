const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height, centerX, centerY;
let audioContext = null;
let analyser = null;
let dataArray = null;
let isRunning = false;

let displayMode = 'vu';
let smoothing = 0.85;

let currentLevel = 0;
let smoothedLevel = 0;
let peakLevel = 0;
let peakHoldTime = 0;
let avgLevel = 0;
let levelHistory = [];
const maxHistory = 100;

let waveformData = [];

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
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.3;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        dataArray = new Float32Array(analyser.fftSize);
        isRunning = true;
        document.getElementById('startBtn').textContent = '運行中';
    } catch (err) {
        console.error('Microphone error:', err);
        alert('無法存取麥克風');
    }
}

function calculateLevel() {
    if (!analyser || !dataArray) return;

    analyser.getFloatTimeDomainData(dataArray);

    // Calculate RMS
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);

    // Convert to dB
    currentLevel = 20 * Math.log10(Math.max(rms, 0.0001));

    // Smooth level
    smoothedLevel = smoothedLevel * smoothing + currentLevel * (1 - smoothing);

    // Update peak
    if (smoothedLevel > peakLevel) {
        peakLevel = smoothedLevel;
        peakHoldTime = 60; // frames
    } else if (peakHoldTime > 0) {
        peakHoldTime--;
    } else {
        peakLevel = Math.max(peakLevel - 0.5, smoothedLevel);
    }

    // Update history and average
    levelHistory.push(smoothedLevel);
    if (levelHistory.length > maxHistory) {
        levelHistory.shift();
    }
    avgLevel = levelHistory.reduce((a, b) => a + b, 0) / levelHistory.length;

    // Store waveform data
    waveformData = Array.from(dataArray);
}

function dBToLinear(dB) {
    // Map dB (-60 to 0) to 0-1
    return Math.max(0, Math.min(1, (dB + 60) / 60));
}

function drawBackground() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
}

function drawVUMeter() {
    const meterWidth = Math.min(600, width * 0.7);
    const meterHeight = 60;
    const meterX = centerX - meterWidth / 2;
    const meterY = centerY - meterHeight / 2;

    // Background
    ctx.fillStyle = '#2a2a4e';
    ctx.fillRect(meterX, meterY, meterWidth, meterHeight);

    // Scale markings
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    const dBMarks = [-60, -48, -36, -24, -12, -6, -3, 0];
    for (const dB of dBMarks) {
        const x = meterX + dBToLinear(dB) * meterWidth;
        ctx.fillRect(x - 1, meterY - 10, 2, 10);
        ctx.fillText(dB + '', x, meterY - 15);
    }

    // Level bar gradient
    const gradient = ctx.createLinearGradient(meterX, 0, meterX + meterWidth, 0);
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(0.6, '#22c55e');
    gradient.addColorStop(0.8, '#fbbf24');
    gradient.addColorStop(0.9, '#ef4444');
    gradient.addColorStop(1, '#dc2626');

    // Current level
    const levelWidth = dBToLinear(smoothedLevel) * meterWidth;
    ctx.fillStyle = gradient;
    ctx.fillRect(meterX, meterY, levelWidth, meterHeight);

    // Peak indicator
    const peakX = meterX + dBToLinear(peakLevel) * meterWidth;
    ctx.fillStyle = '#fff';
    ctx.fillRect(peakX - 2, meterY, 4, meterHeight);

    // Border
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);

    // dB display
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(smoothedLevel > -60 ? smoothedLevel.toFixed(1) + ' dB' : '-∞ dB', centerX, meterY + meterHeight + 80);
}

function drawLEDMeter() {
    const numLEDs = 30;
    const ledWidth = 20;
    const ledHeight = Math.min(400, height * 0.6);
    const ledGap = 4;
    const ledSize = (ledHeight - ledGap * (numLEDs - 1)) / numLEDs;

    const meterX = centerX - ledWidth / 2;
    const meterY = centerY - ledHeight / 2;

    const level = dBToLinear(smoothedLevel);
    const activeLEDs = Math.floor(level * numLEDs);
    const peakLED = Math.floor(dBToLinear(peakLevel) * numLEDs);

    for (let i = 0; i < numLEDs; i++) {
        const y = meterY + ledHeight - (i + 1) * (ledSize + ledGap);
        const ratio = i / numLEDs;

        let color;
        if (ratio < 0.6) color = '#22c55e';
        else if (ratio < 0.8) color = '#fbbf24';
        else color = '#ef4444';

        const isActive = i < activeLEDs;
        const isPeak = i === peakLED - 1;

        ctx.fillStyle = isActive ? color : `rgba(${ratio < 0.6 ? '34,197,94' : ratio < 0.8 ? '251,191,36' : '239,68,68'}, 0.2)`;

        // LED shape with glow
        if (isActive) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
        }

        ctx.fillRect(meterX, y, ledWidth, ledSize);
        ctx.shadowBlur = 0;

        // Peak indicator
        if (isPeak) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(meterX, y, ledWidth, ledSize);
        }
    }

    // Scale
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    const dBMarks = [0, -6, -12, -24, -36, -48, -60];
    for (const dB of dBMarks) {
        const y = meterY + ledHeight - dBToLinear(dB) * ledHeight;
        ctx.fillText(dB + ' dB', meterX + ledWidth + 10, y + 4);
    }
}

function drawAnalogMeter() {
    const radius = Math.min(250, Math.min(width, height) * 0.35);

    // Background arc
    ctx.fillStyle = '#f5f5dc';
    ctx.beginPath();
    ctx.arc(centerX, centerY + 50, radius, Math.PI, 0);
    ctx.fill();

    // Scale arc
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY + 50, radius - 20, Math.PI * 1.15, -Math.PI * 0.15);
    ctx.stroke();

    // Scale markings
    const dBMarks = [-40, -30, -20, -10, -7, -5, -3, 0, 3];
    for (let i = 0; i < dBMarks.length; i++) {
        const dB = dBMarks[i];
        const angle = Math.PI + ((dB + 40) / 43) * Math.PI * 0.7 - Math.PI * 0.15;
        const innerR = radius - 35;
        const outerR = radius - 20;

        ctx.strokeStyle = dB >= 0 ? '#ef4444' : '#333';
        ctx.lineWidth = dB % 10 === 0 ? 3 : 1;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + 50 + Math.sin(angle) * innerR);
        ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + 50 + Math.sin(angle) * outerR);
        ctx.stroke();

        if (dB % 10 === 0 || dB >= -7) {
            ctx.fillStyle = dB >= 0 ? '#ef4444' : '#333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(dB + '', centerX + Math.cos(angle) * (innerR - 15), centerY + 50 + Math.sin(angle) * (innerR - 15) + 5);
        }
    }

    // VU label
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('VU', centerX, centerY);

    // Needle
    const needleDB = Math.max(-40, Math.min(3, smoothedLevel));
    const needleAngle = Math.PI + ((needleDB + 40) / 43) * Math.PI * 0.7 - Math.PI * 0.15;
    const needleLength = radius - 40;

    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 50);
    ctx.lineTo(
        centerX + Math.cos(needleAngle) * needleLength,
        centerY + 50 + Math.sin(needleAngle) * needleLength
    );
    ctx.stroke();

    // Needle pivot
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(centerX, centerY + 50, 10, 0, Math.PI * 2);
    ctx.fill();
}

function drawWaveform() {
    if (waveformData.length === 0) return;

    const waveHeight = height * 0.4;
    const startY = centerY;

    // Draw waveform
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const sliceWidth = width / waveformData.length;
    for (let i = 0; i < waveformData.length; i++) {
        const x = i * sliceWidth;
        const y = startY + waveformData[i] * waveHeight;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Glow effect
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center line
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // dB display
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(smoothedLevel > -60 ? smoothedLevel.toFixed(1) + ' dB' : '-∞ dB', centerX, height - 50);
}

function updateStats() {
    document.getElementById('currentLevel').textContent =
        smoothedLevel > -60 ? smoothedLevel.toFixed(1) + ' dB' : '-∞ dB';
    document.getElementById('peakLevel').textContent =
        peakLevel > -60 ? peakLevel.toFixed(1) + ' dB' : '-∞ dB';
    document.getElementById('avgLevel').textContent =
        avgLevel > -60 ? avgLevel.toFixed(1) + ' dB' : '-∞ dB';
}

function animate() {
    if (isRunning) {
        calculateLevel();
    }

    drawBackground();

    switch (displayMode) {
        case 'vu':
            drawVUMeter();
            break;
        case 'led':
            drawLEDMeter();
            break;
        case 'analog':
            drawAnalogMeter();
            break;
        case 'waveform':
            drawWaveform();
            break;
    }

    updateStats();

    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startMicrophone);

document.getElementById('resetBtn').addEventListener('click', () => {
    peakLevel = -60;
    levelHistory = [];
    avgLevel = -60;
});

document.getElementById('displayMode').addEventListener('change', (e) => {
    displayMode = e.target.value;
});

document.getElementById('smoothSlider').addEventListener('input', (e) => {
    smoothing = parseFloat(e.target.value);
    document.getElementById('smoothValue').textContent = smoothing.toFixed(2);
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
