const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height, centerX, centerY;
let audioContext = null;
let analyser = null;
let dataArray = null;
let isRunning = false;
let isDemoMode = false;

let smoothing = 0.9;
let threshold = 0.01;

let currentPitch = 0;
let smoothedPitch = 0;
let pitchHistory = [];
const maxHistory = 200;

let demoTime = 0;

// Note names
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        dataArray = new Float32Array(analyser.fftSize);
        isRunning = true;
        isDemoMode = false;
        document.getElementById('startBtn').textContent = '偵測中';
    } catch (err) {
        console.error('Microphone error:', err);
        alert('無法存取麥克風，請使用演示模式');
    }
}

function startDemo() {
    isDemoMode = true;
    isRunning = true;
    dataArray = new Float32Array(2048);
    document.getElementById('demoBtn').textContent = '演示中';
}

function generateDemoData() {
    demoTime += 0.02;

    // Generate a singing-like pitch pattern
    const basePitch = 220; // A3
    const vibrato = Math.sin(demoTime * 6) * 5;
    const melody = Math.sin(demoTime * 0.5) * 100 + Math.sin(demoTime * 0.2) * 50;

    currentPitch = basePitch + melody + vibrato;

    // Add some silence periods
    if (Math.sin(demoTime * 0.3) < -0.7) {
        currentPitch = 0;
    }
}

function autoCorrelate(buf, sampleRate) {
    // Check if there's enough signal
    let rms = 0;
    for (let i = 0; i < buf.length; i++) {
        rms += buf[i] * buf[i];
    }
    rms = Math.sqrt(rms / buf.length);

    if (rms < threshold) return -1;

    // Autocorrelation
    let size = buf.length;
    let maxSamples = Math.floor(size / 2);
    let bestOffset = -1;
    let bestCorrelation = 0;
    let foundGoodCorrelation = false;
    let correlations = new Array(maxSamples);

    for (let offset = 0; offset < maxSamples; offset++) {
        let correlation = 0;
        for (let i = 0; i < maxSamples; i++) {
            correlation += Math.abs(buf[i] - buf[i + offset]);
        }
        correlation = 1 - correlation / maxSamples;
        correlations[offset] = correlation;

        if (correlation > 0.9 && correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestOffset = offset;
            foundGoodCorrelation = true;
        } else if (foundGoodCorrelation) {
            // We found a good correlation, then a bad one. We're done.
            break;
        }
    }

    if (bestCorrelation > 0.01 && bestOffset > 0) {
        return sampleRate / bestOffset;
    }
    return -1;
}

function frequencyToNote(freq) {
    if (freq <= 0) return { note: '--', octave: 0, cents: 0 };

    // A4 = 440Hz
    const noteNum = 12 * (Math.log2(freq / 440)) + 69;
    const roundedNote = Math.round(noteNum);
    const cents = Math.round((noteNum - roundedNote) * 100);

    const noteName = noteNames[roundedNote % 12];
    const octave = Math.floor(roundedNote / 12) - 1;

    return { note: noteName, octave, cents };
}

function detectPitch() {
    if (isDemoMode) {
        generateDemoData();
    } else if (analyser && dataArray) {
        analyser.getFloatTimeDomainData(dataArray);
        const pitch = autoCorrelate(dataArray, audioContext.sampleRate);
        currentPitch = pitch > 0 ? pitch : 0;
    }

    // Smooth the pitch
    if (currentPitch > 0) {
        smoothedPitch = smoothedPitch * smoothing + currentPitch * (1 - smoothing);
    } else {
        smoothedPitch *= 0.95;
    }

    // Add to history
    pitchHistory.push(smoothedPitch);
    if (pitchHistory.length > maxHistory) {
        pitchHistory.shift();
    }
}

function drawBackground() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 1;

    // Horizontal lines for notes
    for (let freq = 100; freq <= 1000; freq *= 2) {
        const y = freqToY(freq);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.font = '12px monospace';
        ctx.fillText(freq + ' Hz', 10, y - 5);
    }
}

function freqToY(freq) {
    if (freq <= 0) return height;
    // Map frequency logarithmically to screen
    const minFreq = 50;
    const maxFreq = 1000;
    const logMin = Math.log2(minFreq);
    const logMax = Math.log2(maxFreq);
    const logFreq = Math.log2(Math.max(minFreq, Math.min(maxFreq, freq)));

    return height - ((logFreq - logMin) / (logMax - logMin)) * (height - 100) - 50;
}

function drawPitchHistory() {
    if (pitchHistory.length < 2) return;

    // Draw filled area
    ctx.beginPath();
    ctx.moveTo(width, height);

    for (let i = 0; i < pitchHistory.length; i++) {
        const x = width - (pitchHistory.length - i) * (width / maxHistory);
        const y = freqToY(pitchHistory[i]);
        ctx.lineTo(x, y);
    }

    ctx.lineTo(width - pitchHistory.length * (width / maxHistory), height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    for (let i = 0; i < pitchHistory.length; i++) {
        const x = width - (pitchHistory.length - i) * (width / maxHistory);
        const y = freqToY(pitchHistory[i]);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Glow effect
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawCurrentPitch() {
    if (smoothedPitch < 50) return;

    const y = freqToY(smoothedPitch);
    const noteInfo = frequencyToNote(smoothedPitch);

    // Current pitch indicator
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(width - 50, y, 15 + Math.abs(noteInfo.cents) / 10, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal line
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width - 70, y);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawNoteDisplay() {
    const noteInfo = frequencyToNote(smoothedPitch);

    // Large note display
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (smoothedPitch > 50) {
        ctx.fillText(noteInfo.note + noteInfo.octave, centerX, centerY - 50);
    } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText('--', centerX, centerY - 50);
    }

    // Cents indicator
    if (smoothedPitch > 50) {
        const centsWidth = 200;
        const centsHeight = 20;
        const centsX = centerX - centsWidth / 2;
        const centsY = centerY + 50;

        // Background
        ctx.fillStyle = 'rgba(50, 50, 70, 0.5)';
        ctx.fillRect(centsX, centsY, centsWidth, centsHeight);

        // Center line
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centsY);
        ctx.lineTo(centerX, centsY + centsHeight);
        ctx.stroke();

        // Cents indicator
        const centsOffset = (noteInfo.cents / 50) * (centsWidth / 2);
        const indicatorColor = Math.abs(noteInfo.cents) < 10 ? '#22c55e' :
                              Math.abs(noteInfo.cents) < 25 ? '#fbbf24' : '#ef4444';

        ctx.fillStyle = indicatorColor;
        ctx.beginPath();
        ctx.arc(centerX + centsOffset, centsY + centsHeight / 2, 8, 0, Math.PI * 2);
        ctx.fill();

        // Labels
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.fillText('-50', centsX - 15, centsY + centsHeight / 2 + 4);
        ctx.fillText('+50', centsX + centsWidth + 15, centsY + centsHeight / 2 + 4);
    }
}

function drawPiano() {
    const pianoWidth = width * 0.8;
    const pianoHeight = 80;
    const pianoX = (width - pianoWidth) / 2;
    const pianoY = height - pianoHeight - 30;

    const whiteKeys = 14; // 2 octaves
    const whiteKeyWidth = pianoWidth / whiteKeys;

    // White keys
    for (let i = 0; i < whiteKeys; i++) {
        const x = pianoX + i * whiteKeyWidth;
        const noteInOctave = [0, 2, 4, 5, 7, 9, 11][i % 7];
        const octave = Math.floor(i / 7) + 3;
        const freq = 440 * Math.pow(2, (noteInOctave + octave * 12 - 69) / 12);

        const isActive = smoothedPitch > 50 &&
                        Math.abs(Math.log2(smoothedPitch / freq)) < 0.05;

        ctx.fillStyle = isActive ? '#60a5fa' : '#f0f0f0';
        ctx.fillRect(x + 1, pianoY, whiteKeyWidth - 2, pianoHeight);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, pianoY, whiteKeyWidth - 2, pianoHeight);
    }

    // Black keys
    const blackKeyPattern = [1, 1, 0, 1, 1, 1, 0];
    for (let i = 0; i < whiteKeys - 1; i++) {
        if (blackKeyPattern[i % 7]) {
            const x = pianoX + (i + 0.7) * whiteKeyWidth;
            const noteInOctave = [1, 3, 6, 8, 10][blackKeyPattern.slice(0, i % 7 + 1).filter(x => x).length - 1 + Math.floor(i / 7) * 5];
            const octave = Math.floor(i / 7) + 3;
            const freq = 440 * Math.pow(2, ((noteInOctave || 1) + octave * 12 - 69) / 12);

            const isActive = smoothedPitch > 50 &&
                            Math.abs(Math.log2(smoothedPitch / freq)) < 0.05;

            ctx.fillStyle = isActive ? '#3b82f6' : '#222';
            ctx.fillRect(x, pianoY, whiteKeyWidth * 0.6, pianoHeight * 0.6);
        }
    }
}

function updateStats() {
    const noteInfo = frequencyToNote(smoothedPitch);

    document.getElementById('frequency').textContent =
        smoothedPitch > 50 ? smoothedPitch.toFixed(1) + ' Hz' : '-- Hz';
    document.getElementById('note').textContent =
        smoothedPitch > 50 ? noteInfo.note + noteInfo.octave : '--';
    document.getElementById('cents').textContent =
        smoothedPitch > 50 ? (noteInfo.cents > 0 ? '+' : '') + noteInfo.cents + ' cents' : '-- cents';
}

function animate() {
    if (isRunning) {
        detectPitch();
    }

    drawBackground();
    drawPitchHistory();
    drawCurrentPitch();
    drawNoteDisplay();
    drawPiano();
    updateStats();

    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startMicrophone);
document.getElementById('demoBtn').addEventListener('click', startDemo);

document.getElementById('smoothSlider').addEventListener('input', (e) => {
    smoothing = parseFloat(e.target.value);
    document.getElementById('smoothValue').textContent = smoothing.toFixed(2);
});

document.getElementById('thresholdSlider').addEventListener('input', (e) => {
    threshold = parseFloat(e.target.value);
    document.getElementById('thresholdValue').textContent = threshold.toFixed(3);
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
