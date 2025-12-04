const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height, centerX, centerY;
let audioContext = null;
let analyser = null;
let dataArray = null;
let isRunning = false;
let isDemoMode = false;

let mode = 'circular';
let sensitivity = 1.0;
let baseHue = 180;
let particles = [];

// Demo mode oscillators
let demoTime = 0;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
}

async function startAudio() {
    if (audioContext) return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        dataArray = new Uint8Array(analyser.frequencyBinCount);
        isRunning = true;
        isDemoMode = false;
        document.getElementById('startBtn').textContent = '運行中';
    } catch (err) {
        console.error('Audio error:', err);
        alert('無法存取麥克風，請使用演示模式');
    }
}

function startDemo() {
    isDemoMode = true;
    isRunning = true;
    dataArray = new Uint8Array(128);
    document.getElementById('demoBtn').textContent = '演示中';
}

function generateDemoData() {
    demoTime += 0.05;

    for (let i = 0; i < dataArray.length; i++) {
        // Generate interesting patterns
        const freq1 = Math.sin(demoTime * 2 + i * 0.1) * 50;
        const freq2 = Math.sin(demoTime * 3 + i * 0.05) * 30;
        const freq3 = Math.sin(demoTime * 0.5) * Math.sin(i * 0.2) * 40;
        const bass = i < 10 ? Math.sin(demoTime * 4) * 80 + 80 : 0;

        dataArray[i] = Math.max(0, Math.min(255,
            128 + freq1 + freq2 + freq3 + bass
        ));
    }
}

function getAverageVolume() {
    if (!dataArray) return 0;
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    return sum / dataArray.length;
}

function getDominantFrequency() {
    if (!dataArray || !audioContext) return 0;
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > maxValue) {
            maxValue = dataArray[i];
            maxIndex = i;
        }
    }
    const sampleRate = audioContext ? audioContext.sampleRate : 44100;
    return Math.round((maxIndex * sampleRate) / (analyser ? analyser.fftSize : 256));
}

function drawCircular() {
    const bufferLength = dataArray.length;
    const avgVolume = getAverageVolume();
    const baseRadius = Math.min(width, height) * 0.2;

    // Draw glow
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 2);
    gradient.addColorStop(0, `hsla(${baseHue}, 80%, 50%, 0.3)`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw frequency bars in a circle
    for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] * sensitivity;
        const angle = (i / bufferLength) * Math.PI * 2 - Math.PI / 2;

        const barHeight = (value / 255) * baseRadius;
        const innerRadius = baseRadius * 0.5;
        const outerRadius = innerRadius + barHeight;

        const hue = (baseHue + (i / bufferLength) * 60) % 360;

        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
        ctx.lineWidth = (Math.PI * 2 * innerRadius) / bufferLength * 0.8;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(
            centerX + Math.cos(angle) * innerRadius,
            centerY + Math.sin(angle) * innerRadius
        );
        ctx.lineTo(
            centerX + Math.cos(angle) * outerRadius,
            centerY + Math.sin(angle) * outerRadius
        );
        ctx.stroke();
    }

    // Draw center circle
    ctx.fillStyle = `hsla(${baseHue}, 60%, 40%, 0.8)`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 0.3 + avgVolume * 0.1 * sensitivity, 0, Math.PI * 2);
    ctx.fill();

    // Pulsing ring
    ctx.strokeStyle = `hsla(${baseHue}, 80%, 60%, ${0.5 + avgVolume / 512})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 0.5 + avgVolume * 0.2 * sensitivity, 0, Math.PI * 2);
    ctx.stroke();
}

function drawBars() {
    const bufferLength = dataArray.length;
    const barWidth = width / bufferLength;

    for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] * sensitivity;
        const barHeight = (value / 255) * height * 0.8;

        const hue = (baseHue + (i / bufferLength) * 60) % 360;
        const x = i * barWidth;
        const y = height - barHeight;

        // Gradient bar
        const gradient = ctx.createLinearGradient(x, height, x, y);
        gradient.addColorStop(0, `hsla(${hue}, 80%, 30%, 1)`);
        gradient.addColorStop(1, `hsla(${hue}, 80%, 60%, 1)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 1, barHeight);

        // Glow effect
        ctx.shadowColor = `hsla(${hue}, 80%, 50%, 0.5)`;
        ctx.shadowBlur = 10;
        ctx.fillRect(x, y, barWidth - 1, 5);
        ctx.shadowBlur = 0;
    }

    // Mirror effect
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] * sensitivity;
        const barHeight = (value / 255) * height * 0.3;

        const hue = (baseHue + (i / bufferLength) * 60) % 360;
        const x = i * barWidth;

        ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.5)`;
        ctx.fillRect(x, height, barWidth - 1, -barHeight * 0.5);
    }
    ctx.globalAlpha = 1;
}

function drawWave() {
    const bufferLength = dataArray.length;
    const sliceWidth = width / bufferLength;

    // Draw multiple waves with different phases
    for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();

        const hue = (baseHue + wave * 30) % 360;
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.8 - wave * 0.2})`;
        ctx.lineWidth = 4 - wave;

        for (let i = 0; i < bufferLength; i++) {
            const value = dataArray[i] * sensitivity;
            const x = i * sliceWidth;
            const y = centerY + ((value - 128) / 128) * height * 0.3;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                const prevX = (i - 1) * sliceWidth;
                const prevValue = dataArray[i - 1] * sensitivity;
                const prevY = centerY + ((prevValue - 128) / 128) * height * 0.3;

                // Smooth curve
                const cpX = (x + prevX) / 2;
                ctx.quadraticCurveTo(prevX, prevY, cpX, (y + prevY) / 2);
            }
        }
        ctx.stroke();
    }

    // Draw glow line at center
    const avgVolume = getAverageVolume();
    ctx.strokeStyle = `hsla(${baseHue}, 80%, 50%, ${avgVolume / 255})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
}

function drawParticles() {
    const avgVolume = getAverageVolume();

    // Spawn new particles based on volume
    if (avgVolume > 100) {
        const spawnCount = Math.floor((avgVolume - 100) / 30);
        for (let i = 0; i < spawnCount; i++) {
            particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * avgVolume * 0.1 * sensitivity,
                vy: (Math.random() - 0.5) * avgVolume * 0.1 * sensitivity,
                size: 2 + Math.random() * 4,
                hue: baseHue + Math.random() * 60,
                life: 1
            });
        }
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= 0.01;

        if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
            particles.splice(i, 1);
            continue;
        }

        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
    }

    // Limit particles
    if (particles.length > 500) {
        particles.splice(0, particles.length - 500);
    }

    // Draw center indicator
    ctx.fillStyle = `hsla(${baseHue}, 60%, 50%, 0.5)`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20 + avgVolume * 0.2 * sensitivity, 0, Math.PI * 2);
    ctx.fill();
}

function updateStats() {
    if (!dataArray) return;

    const avgVolume = getAverageVolume();
    const dominantFreq = getDominantFrequency();

    document.getElementById('volumeLevel').textContent = Math.round((avgVolume / 255) * 100) + '%';
    document.getElementById('dominantFreq').textContent = dominantFreq + ' Hz';
}

function animate() {
    // Clear with fade effect
    ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
    ctx.fillRect(0, 0, width, height);

    if (isRunning) {
        if (isDemoMode) {
            generateDemoData();
        } else if (analyser) {
            analyser.getByteFrequencyData(dataArray);
        }

        switch (mode) {
            case 'circular':
                drawCircular();
                break;
            case 'bars':
                drawBars();
                break;
            case 'wave':
                drawWave();
                break;
            case 'particles':
                drawParticles();
                break;
        }

        updateStats();
    }

    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startAudio);
document.getElementById('demoBtn').addEventListener('click', startDemo);

document.getElementById('modeSelect').addEventListener('change', (e) => {
    mode = e.target.value;
    particles = [];
});

document.getElementById('sensitivitySlider').addEventListener('input', (e) => {
    sensitivity = parseFloat(e.target.value);
    document.getElementById('sensitivityValue').textContent = sensitivity.toFixed(1);
});

document.getElementById('hueSlider').addEventListener('input', (e) => {
    baseHue = parseInt(e.target.value);
    document.getElementById('hueValue').textContent = baseHue;
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
