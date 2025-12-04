const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height, centerX, centerY;
let audioContext = null;
let analyser = null;
let dataArray = null;
let isRunning = false;
let isDemoMode = false;

let sensitivity = 1.5;
let decayRate = 0.95;
let minInterval = 200;

// Beat detection variables
let energyHistory = [];
const historyLength = 43; // About 1 second at 60fps
let averageEnergy = 0;
let beatCount = 0;
let lastBeatTime = 0;
let beatTimes = [];
let currentBPM = 0;

// Visual effects
let beatFlash = 0;
let particles = [];
let rings = [];
let demoTime = 0;

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
    dataArray = new Uint8Array(256);
    document.getElementById('demoBtn').textContent = '演示中';
}

function generateDemoData() {
    demoTime += 0.05;

    // Generate demo beat pattern (120 BPM)
    const beatPhase = (demoTime * 2) % 1; // 120 BPM = 2 beats per second
    const isBeat = beatPhase < 0.1;

    for (let i = 0; i < dataArray.length; i++) {
        const freq = i / dataArray.length;

        // Bass on beat
        if (freq < 0.15) {
            dataArray[i] = isBeat ? 200 + Math.random() * 55 : 50 + Math.random() * 30;
        }
        // Mid frequencies
        else if (freq < 0.5) {
            dataArray[i] = 40 + Math.sin(demoTime * 3 + i * 0.1) * 30 + Math.random() * 20;
        }
        // High frequencies
        else {
            dataArray[i] = 30 + Math.sin(demoTime * 5 + i * 0.2) * 20 + Math.random() * 20;
        }
    }
}

function calculateEnergy() {
    if (!dataArray) return 0;

    // Focus on bass frequencies for beat detection
    let energy = 0;
    const bassEnd = Math.floor(dataArray.length * 0.15);

    for (let i = 0; i < bassEnd; i++) {
        energy += dataArray[i] * dataArray[i];
    }

    return Math.sqrt(energy / bassEnd);
}

function detectBeat(energy) {
    // Add to history
    energyHistory.push(energy);
    if (energyHistory.length > historyLength) {
        energyHistory.shift();
    }

    // Calculate average energy
    averageEnergy = energyHistory.reduce((a, b) => a + b, 0) / energyHistory.length;

    // Calculate variance
    let variance = 0;
    for (const e of energyHistory) {
        variance += (e - averageEnergy) * (e - averageEnergy);
    }
    variance = Math.sqrt(variance / energyHistory.length);

    // Beat detection threshold
    const threshold = averageEnergy + variance * sensitivity;
    const now = Date.now();

    if (energy > threshold && now - lastBeatTime > minInterval) {
        // Beat detected!
        beatCount++;
        lastBeatTime = now;

        // Store beat times for BPM calculation
        beatTimes.push(now);
        if (beatTimes.length > 20) {
            beatTimes.shift();
        }

        // Calculate BPM
        if (beatTimes.length >= 4) {
            const intervals = [];
            for (let i = 1; i < beatTimes.length; i++) {
                intervals.push(beatTimes[i] - beatTimes[i - 1]);
            }
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            currentBPM = Math.round(60000 / avgInterval);
        }

        // Trigger visual effects
        triggerBeatEffects();

        return true;
    }

    return false;
}

function triggerBeatEffects() {
    beatFlash = 1;

    // Create expanding ring
    rings.push({
        x: centerX,
        y: centerY,
        radius: 50,
        maxRadius: Math.max(width, height) * 0.6,
        life: 1
    });

    // Create burst particles
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 10;
        particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 5,
            life: 1,
            hue: Math.random() * 60 // Red-orange range
        });
    }
}

function updateEffects() {
    // Decay beat flash
    beatFlash *= 0.9;

    // Update rings
    for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.radius += (ring.maxRadius - ring.radius) * 0.1;
        ring.life -= 0.02;
        if (ring.life <= 0) {
            rings.splice(i, 1);
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy += 0.1; // gravity
        p.life -= 0.02;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawBackground() {
    // Flash on beat
    const flash = beatFlash * 0.3;
    ctx.fillStyle = `rgb(${Math.floor(10 + flash * 50)}, ${Math.floor(10 + flash * 20)}, ${Math.floor(20 + flash * 30)})`;
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawBeatIndicator() {
    const indicatorSize = 100 + beatFlash * 100;

    // Glow
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, indicatorSize);
    gradient.addColorStop(0, `rgba(239, 68, 68, ${0.5 + beatFlash * 0.5})`);
    gradient.addColorStop(0.5, `rgba(239, 68, 68, ${0.2 + beatFlash * 0.3})`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, indicatorSize, 0, Math.PI * 2);
    ctx.fill();

    // Center circle
    ctx.fillStyle = `rgba(239, 68, 68, ${0.8 + beatFlash * 0.2})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30 + beatFlash * 20, 0, Math.PI * 2);
    ctx.fill();

    // BPM text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentBPM > 0 ? currentBPM : '--', centerX, centerY - 100);

    ctx.font = '16px Arial';
    ctx.fillText('BPM', centerX, centerY - 70);
}

function drawRings() {
    for (const ring of rings) {
        ctx.strokeStyle = `rgba(239, 68, 68, ${ring.life * 0.8})`;
        ctx.lineWidth = 3 * ring.life;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawParticles() {
    for (const p of particles) {
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawEnergyMeter() {
    const meterWidth = width * 0.6;
    const meterHeight = 20;
    const meterX = (width - meterWidth) / 2;
    const meterY = height - 100;

    // Background
    ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
    ctx.fillRect(meterX, meterY, meterWidth, meterHeight);

    // Energy bar
    const energy = calculateEnergy();
    const normalizedEnergy = Math.min(1, energy / 200);
    const threshold = (averageEnergy + (Math.sqrt(energyHistory.reduce((a, e) => a + (e - averageEnergy) ** 2, 0) / energyHistory.length) * sensitivity)) / 200;

    const gradient = ctx.createLinearGradient(meterX, meterY, meterX + meterWidth, meterY);
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(0.5, '#fbbf24');
    gradient.addColorStop(1, '#ef4444');

    ctx.fillStyle = gradient;
    ctx.fillRect(meterX, meterY, meterWidth * normalizedEnergy, meterHeight);

    // Threshold line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const thresholdX = meterX + Math.min(1, threshold) * meterWidth;
    ctx.moveTo(thresholdX, meterY - 5);
    ctx.lineTo(thresholdX, meterY + meterHeight + 5);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('能量', width / 2, meterY + meterHeight + 20);
    ctx.fillText('閾值', thresholdX, meterY - 10);
}

function drawWaveform() {
    if (!dataArray) return;

    const waveHeight = 100;
    const startY = height - 180;

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    for (let i = 0; i < dataArray.length; i++) {
        const x = i * sliceWidth;
        const y = startY - (dataArray[i] / 255) * waveHeight;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function updateStats() {
    document.getElementById('bpmValue').textContent = currentBPM > 0 ? currentBPM : '--';
    document.getElementById('beatCount').textContent = beatCount;
    const energy = calculateEnergy();
    document.getElementById('currentEnergy').textContent = Math.round(energy / 2.55) + '%';
}

function animate() {
    if (isRunning) {
        if (isDemoMode) {
            generateDemoData();
        } else if (analyser) {
            analyser.getByteFrequencyData(dataArray);
        }

        const energy = calculateEnergy();
        detectBeat(energy);
    }

    updateEffects();

    drawBackground();
    drawRings();
    drawParticles();
    drawBeatIndicator();
    drawWaveform();
    drawEnergyMeter();
    updateStats();

    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startMicrophone);
document.getElementById('demoBtn').addEventListener('click', startDemo);

document.getElementById('sensSlider').addEventListener('input', (e) => {
    sensitivity = parseFloat(e.target.value);
    document.getElementById('sensValue').textContent = sensitivity.toFixed(1);
});

document.getElementById('decaySlider').addEventListener('input', (e) => {
    decayRate = parseFloat(e.target.value);
    document.getElementById('decayValue').textContent = decayRate.toFixed(2);
});

document.getElementById('intervalSlider').addEventListener('input', (e) => {
    minInterval = parseInt(e.target.value);
    document.getElementById('intervalValue').textContent = minInterval;
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
