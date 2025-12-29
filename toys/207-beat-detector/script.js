let canvas, ctx;
let audioContext, analyser, micStream, source;
let dataArray;
let sensitivity = 1;
let threshold = 0.6;
let beatTimes = [];
let tapTimes = [];
let lastBeatTime = 0;
let currentEnergy = 0;
let energyHistory = [];
let isMicActive = false;

function init() {
    canvas = document.getElementById('beatCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    animate();
}

function resizeCanvas() {
    const width = Math.min(800, window.innerWidth - 40);
    canvas.width = width;
    canvas.height = 150;
}

function setupControls() {
    document.getElementById('micBtn').addEventListener('click', toggleMicrophone);
    document.getElementById('tapBtn').addEventListener('click', handleTap);

    document.getElementById('sensitivitySlider').addEventListener('input', (e) => {
        sensitivity = parseFloat(e.target.value);
        document.getElementById('sensitivityValue').textContent = sensitivity.toFixed(1);
    });

    document.getElementById('thresholdSlider').addEventListener('input', (e) => {
        threshold = parseFloat(e.target.value);
        document.getElementById('thresholdValue').textContent = threshold.toFixed(2);
    });

    // Keyboard support for tapping
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            handleTap();
        }
    });
}

async function toggleMicrophone() {
    const btn = document.getElementById('micBtn');

    if (isMicActive) {
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
            micStream = null;
        }
        isMicActive = false;
        btn.classList.remove('active');
        btn.textContent = '開啟麥克風';
    } else {
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                dataArray = new Uint8Array(analyser.frequencyBinCount);
            }

            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            source = audioContext.createMediaStreamSource(micStream);
            source.connect(analyser);

            isMicActive = true;
            btn.classList.add('active');
            btn.textContent = '關閉麥克風';
        } catch (err) {
            alert('無法存取麥克風');
        }
    }
}

function handleTap() {
    const now = Date.now();
    tapTimes.push(now);

    // Keep only recent taps (last 10 seconds)
    tapTimes = tapTimes.filter(t => now - t < 10000);

    triggerBeat();
    updateStats();
}

function triggerBeat() {
    const now = Date.now();
    beatTimes.push(now);

    // Keep only recent beats
    beatTimes = beatTimes.filter(t => now - t < 10000);

    // Pulse animation
    const circle = document.getElementById('beatCircle');
    circle.classList.add('pulse');
    setTimeout(() => circle.classList.remove('pulse'), 100);

    // Update BPM
    calculateBPM();
}

function calculateBPM() {
    const times = tapTimes.length > beatTimes.length ? tapTimes : beatTimes;

    if (times.length < 2) {
        document.getElementById('bpmDisplay').textContent = '---';
        return;
    }

    const intervals = [];
    for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60000 / avgInterval);

    if (bpm > 30 && bpm < 300) {
        document.getElementById('bpmDisplay').textContent = bpm;
    }
}

function updateStats() {
    const times = tapTimes.length > beatTimes.length ? tapTimes : beatTimes;

    document.getElementById('beatCount').textContent = times.length;

    if (times.length >= 2) {
        const intervals = [];
        for (let i = 1; i < times.length; i++) {
            intervals.push(times[i] - times[i - 1]);
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        document.getElementById('avgInterval').textContent = Math.round(avgInterval) + ' ms';

        // Calculate stability (standard deviation)
        const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);
        const stability = Math.max(0, Math.round(100 - stdDev / avgInterval * 100));
        document.getElementById('stability').textContent = stability + '%';
    }
}

function detectBeat() {
    if (!isMicActive || !analyser) return;

    analyser.getByteFrequencyData(dataArray);

    // Calculate energy (focus on bass frequencies)
    let energy = 0;
    for (let i = 0; i < 10; i++) {
        energy += dataArray[i];
    }
    energy = (energy / 10 / 255) * sensitivity;

    currentEnergy = energy;
    energyHistory.push(energy);
    if (energyHistory.length > 43) energyHistory.shift();

    // Calculate average energy
    const avgEnergy = energyHistory.reduce((a, b) => a + b, 0) / energyHistory.length;

    // Beat detection
    const now = Date.now();
    if (energy > avgEnergy * (1 + threshold) && now - lastBeatTime > 200) {
        lastBeatTime = now;
        triggerBeat();
        updateStats();
    }
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw energy history
    const barWidth = canvas.width / energyHistory.length;

    energyHistory.forEach((energy, i) => {
        const height = energy * canvas.height * 0.8;
        const x = i * barWidth;
        const y = canvas.height - height;

        const hue = 0 + energy * 30;
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.8)`;
        ctx.fillRect(x, y, barWidth - 1, height);
    });

    // Draw threshold line
    if (energyHistory.length > 0) {
        const avgEnergy = energyHistory.reduce((a, b) => a + b, 0) / energyHistory.length;
        const thresholdY = canvas.height - avgEnergy * (1 + threshold) * canvas.height * 0.8;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, thresholdY);
        ctx.lineTo(canvas.width, thresholdY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '12px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText('閾值', 10, thresholdY - 5);
    }

    // Draw current energy indicator
    ctx.fillStyle = `hsl(${currentEnergy * 60}, 80%, 50%)`;
    ctx.beginPath();
    ctx.arc(canvas.width - 30, 30, 15, 0, Math.PI * 2);
    ctx.fill();
}

function animate() {
    detectBeat();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
