const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height, centerX, centerY;
let audioContext = null;
let analyser = null;
let dataArray = null;
let freqArray = null;
let isRunning = false;
let isFrozen = false;

let timebase = 10; // ms per division
let vscale = 1.0;
let triggerLevel = 0;
let displayMode = 'normal';

let frozenData = null;
let measuredFreq = 0;
let measuredAmp = 0;

const gridDivisions = 10;

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
        analyser.fftSize = 4096;
        analyser.smoothingTimeConstant = 0;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        dataArray = new Float32Array(analyser.fftSize);
        freqArray = new Float32Array(analyser.frequencyBinCount);
        isRunning = true;
        document.getElementById('startBtn').textContent = '運行中';
    } catch (err) {
        console.error('Microphone error:', err);
        alert('無法存取麥克風');
    }
}

function toggleFreeze() {
    isFrozen = !isFrozen;
    if (isFrozen && dataArray) {
        frozenData = new Float32Array(dataArray);
    }
    document.getElementById('freezeBtn').textContent = isFrozen ? '解凍' : '凍結';
}

function findTriggerPoint(data) {
    // Find rising edge crossing trigger level
    for (let i = 1; i < data.length - 1; i++) {
        if (data[i - 1] < triggerLevel && data[i] >= triggerLevel) {
            return i;
        }
    }
    return 0;
}

function measureFrequency(data, sampleRate) {
    // Simple zero-crossing frequency detection
    let crossings = 0;
    for (let i = 1; i < data.length; i++) {
        if ((data[i - 1] < 0 && data[i] >= 0) || (data[i - 1] >= 0 && data[i] < 0)) {
            crossings++;
        }
    }
    return (crossings / 2) * (sampleRate / data.length);
}

function measureAmplitude(data) {
    let max = -Infinity;
    let min = Infinity;
    for (let i = 0; i < data.length; i++) {
        if (data[i] > max) max = data[i];
        if (data[i] < min) min = data[i];
    }
    return (max - min) / 2;
}

function drawGrid() {
    const margin = 50;
    const gridWidth = width - margin * 2;
    const gridHeight = height - margin * 2;
    const divWidth = gridWidth / gridDivisions;
    const divHeight = gridHeight / gridDivisions;

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // Grid background
    ctx.fillStyle = '#0a0f14';
    ctx.fillRect(margin, margin, gridWidth, gridHeight);

    // Minor grid lines
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= gridDivisions * 5; i++) {
        const x = margin + (i / 5) * divWidth;
        ctx.beginPath();
        ctx.moveTo(x, margin);
        ctx.lineTo(x, height - margin);
        ctx.stroke();
    }

    for (let i = 0; i <= gridDivisions * 5; i++) {
        const y = margin + (i / 5) * divHeight;
        ctx.beginPath();
        ctx.moveTo(margin, y);
        ctx.lineTo(width - margin, y);
        ctx.stroke();
    }

    // Major grid lines
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridDivisions; i++) {
        const x = margin + i * divWidth;
        ctx.beginPath();
        ctx.moveTo(x, margin);
        ctx.lineTo(x, height - margin);
        ctx.stroke();
    }

    for (let i = 0; i <= gridDivisions; i++) {
        const y = margin + i * divHeight;
        ctx.beginPath();
        ctx.moveTo(margin, y);
        ctx.lineTo(width - margin, y);
        ctx.stroke();
    }

    // Center lines (axes)
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
    ctx.lineWidth = 1;

    // Horizontal center
    ctx.beginPath();
    ctx.moveTo(margin, centerY);
    ctx.lineTo(width - margin, centerY);
    ctx.stroke();

    // Vertical center
    ctx.beginPath();
    ctx.moveTo(centerX, margin);
    ctx.lineTo(centerX, height - margin);
    ctx.stroke();

    // Border
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, gridWidth, gridHeight);

    // Scale labels
    ctx.fillStyle = '#00ff88';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    // Time scale
    for (let i = 0; i <= gridDivisions; i++) {
        const x = margin + i * divWidth;
        const time = (i - gridDivisions / 2) * timebase;
        ctx.fillText(time + 'ms', x, height - margin + 20);
    }

    // Voltage scale
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridDivisions; i++) {
        const y = margin + i * divHeight;
        const voltage = ((gridDivisions / 2 - i) / (gridDivisions / 2)).toFixed(1);
        ctx.fillText(voltage + 'V', margin - 5, y + 4);
    }
}

function drawWaveform() {
    const data = isFrozen && frozenData ? frozenData : dataArray;
    if (!data) return;

    const margin = 50;
    const gridWidth = width - margin * 2;
    const gridHeight = height - margin * 2;

    const triggerPoint = findTriggerPoint(data);
    const sampleRate = audioContext ? audioContext.sampleRate : 44100;
    const samplesPerMs = sampleRate / 1000;
    const totalMs = timebase * gridDivisions;
    const samplesToShow = Math.min(data.length - triggerPoint, Math.floor(totalMs * samplesPerMs));

    // Draw waveform with glow
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 5;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < samplesToShow; i++) {
        const sampleIndex = triggerPoint + i;
        if (sampleIndex >= data.length) break;

        const x = margin + (i / samplesToShow) * gridWidth;
        const y = centerY - data[sampleIndex] * (gridHeight / 2) * vscale;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.stroke();
    ctx.shadowBlur = 0;

    // Measurements
    if (!isFrozen) {
        measuredFreq = measureFrequency(data, sampleRate);
        measuredAmp = measureAmplitude(data);
    }
}

function drawXYMode() {
    if (!dataArray) return;

    const margin = 50;
    const gridWidth = width - margin * 2;
    const gridHeight = height - margin * 2;

    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 5;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Use first half as X, second half as Y
    const halfLength = Math.floor(dataArray.length / 2);

    for (let i = 0; i < halfLength; i++) {
        const x = centerX + dataArray[i] * (gridWidth / 2) * vscale;
        const y = centerY - dataArray[i + halfLength] * (gridHeight / 2) * vscale;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawFFT() {
    if (!analyser || !freqArray) return;

    analyser.getFloatFrequencyData(freqArray);

    const margin = 50;
    const gridWidth = width - margin * 2;
    const gridHeight = height - margin * 2;

    // Draw frequency bars
    const barCount = 128;
    const barWidth = gridWidth / barCount;

    for (let i = 0; i < barCount; i++) {
        const value = freqArray[i];
        const normalizedValue = (value + 100) / 100; // Normalize from -100dB to 0dB
        const barHeight = Math.max(0, normalizedValue * gridHeight);

        const x = margin + i * barWidth;
        const y = height - margin - barHeight;

        // Gradient color based on frequency
        const hue = 120 + (i / barCount) * 60;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
    }

    // Draw line on top
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 5;
    ctx.beginPath();

    for (let i = 0; i < barCount; i++) {
        const value = freqArray[i];
        const normalizedValue = (value + 100) / 100;
        const barHeight = Math.max(0, normalizedValue * gridHeight);

        const x = margin + i * barWidth + barWidth / 2;
        const y = height - margin - barHeight;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.stroke();
    ctx.shadowBlur = 0;

    // Frequency scale
    ctx.fillStyle = '#00ff88';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    const sampleRate = audioContext ? audioContext.sampleRate : 44100;
    const freqMarks = [100, 500, 1000, 2000, 5000, 10000, 20000];

    for (const freq of freqMarks) {
        const x = margin + (freq / (sampleRate / 2)) * gridWidth;
        if (x < width - margin) {
            ctx.fillText(freq >= 1000 ? (freq / 1000) + 'k' : freq + '', x, height - margin + 20);
        }
    }
}

function drawTriggerLevel() {
    if (displayMode !== 'normal') return;

    const margin = 50;
    const y = centerY - triggerLevel * ((height - margin * 2) / 2) * vscale;

    ctx.strokeStyle = 'rgba(255, 200, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(width - margin, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Trigger marker
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.moveTo(margin - 10, y);
    ctx.lineTo(margin, y - 5);
    ctx.lineTo(margin, y + 5);
    ctx.closePath();
    ctx.fill();
}

function drawInfo() {
    ctx.fillStyle = '#00ff88';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';

    const infoX = width - 70;
    const infoY = 70;

    ctx.fillText(`CH1: ${vscale.toFixed(1)}x`, infoX, infoY);
    ctx.fillText(`Time: ${timebase}ms/div`, infoX, infoY + 20);
    ctx.fillText(`Trig: ${triggerLevel.toFixed(2)}`, infoX, infoY + 40);

    if (isFrozen) {
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText('FROZEN', infoX, infoY + 60);
    }
}

function updateStats() {
    document.getElementById('frequency').textContent =
        measuredFreq > 0 ? measuredFreq.toFixed(1) + ' Hz' : '-- Hz';
    document.getElementById('amplitude').textContent =
        measuredAmp > 0 ? measuredAmp.toFixed(3) + ' V' : '-- V';
}

function animate() {
    if (isRunning && !isFrozen && analyser) {
        analyser.getFloatTimeDomainData(dataArray);
    }

    drawGrid();
    drawTriggerLevel();

    switch (displayMode) {
        case 'normal':
            drawWaveform();
            break;
        case 'xy':
            drawXYMode();
            break;
        case 'fft':
            drawFFT();
            break;
    }

    drawInfo();
    updateStats();

    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startMicrophone);
document.getElementById('freezeBtn').addEventListener('click', toggleFreeze);

document.getElementById('timebaseSlider').addEventListener('input', (e) => {
    timebase = parseInt(e.target.value);
    document.getElementById('timebaseValue').textContent = timebase;
});

document.getElementById('vscaleSlider').addEventListener('input', (e) => {
    vscale = parseFloat(e.target.value);
    document.getElementById('vscaleValue').textContent = vscale.toFixed(1);
});

document.getElementById('triggerSlider').addEventListener('input', (e) => {
    triggerLevel = parseFloat(e.target.value);
    document.getElementById('triggerValue').textContent = triggerLevel.toFixed(2);
});

document.getElementById('displayMode').addEventListener('change', (e) => {
    displayMode = e.target.value;
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
