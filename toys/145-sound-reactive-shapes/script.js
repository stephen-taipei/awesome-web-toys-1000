const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height, centerX, centerY;
let audioContext = null;
let analyser = null;
let dataArray = null;
let isRunning = false;
let isDemoMode = false;

let shapeType = 'polygon';
let sides = 6;
let reactivity = 1.0;
let rotateSpeed = 0.5;

let rotation = 0;
let demoTime = 0;
let bassEnergy = 0;
let trebleEnergy = 0;
let smoothedBass = 0;
let smoothedTreble = 0;

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
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.6;

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
    dataArray = new Uint8Array(128);
    document.getElementById('demoBtn').textContent = '演示中';
}

function generateDemoData() {
    demoTime += 0.05;

    // Generate rhythmic demo data
    const beat = Math.sin(demoTime * 4) > 0.7 ? 1 : 0;

    for (let i = 0; i < dataArray.length; i++) {
        const freq = i / dataArray.length;

        // Bass frequencies
        if (freq < 0.1) {
            dataArray[i] = Math.floor(100 + beat * 100 + Math.sin(demoTime * 8) * 50);
        }
        // Mid frequencies
        else if (freq < 0.4) {
            dataArray[i] = Math.floor(60 + Math.sin(demoTime * 2 + i * 0.1) * 40);
        }
        // High frequencies
        else {
            dataArray[i] = Math.floor(40 + Math.sin(demoTime * 6 + i * 0.2) * 30);
        }

        dataArray[i] = Math.max(0, Math.min(255, dataArray[i] + Math.random() * 20));
    }
}

function analyzeFrequencies() {
    if (!dataArray) return;

    // Calculate bass energy (low frequencies)
    let bassSum = 0;
    const bassEnd = Math.floor(dataArray.length * 0.1);
    for (let i = 0; i < bassEnd; i++) {
        bassSum += dataArray[i];
    }
    bassEnergy = bassSum / bassEnd / 255;

    // Calculate treble energy (high frequencies)
    let trebleSum = 0;
    const trebleStart = Math.floor(dataArray.length * 0.6);
    for (let i = trebleStart; i < dataArray.length; i++) {
        trebleSum += dataArray[i];
    }
    trebleEnergy = trebleSum / (dataArray.length - trebleStart) / 255;

    // Smooth values
    smoothedBass += (bassEnergy - smoothedBass) * 0.3;
    smoothedTreble += (trebleEnergy - smoothedTreble) * 0.3;
}

function drawPolygon(x, y, radius, numSides, color) {
    ctx.beginPath();
    for (let i = 0; i <= numSides; i++) {
        const angle = (i / numSides) * Math.PI * 2 + rotation;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawFlower(x, y, radius, petals, color) {
    ctx.beginPath();
    for (let i = 0; i <= 360; i++) {
        const angle = (i / 360) * Math.PI * 2 + rotation;
        const petalRadius = radius * (0.5 + 0.5 * Math.cos(angle * petals));
        const px = x + Math.cos(angle) * petalRadius;
        const py = y + Math.sin(angle) * petalRadius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawStar(x, y, radius, points, color) {
    ctx.beginPath();
    for (let i = 0; i <= points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2 + rotation;
        const r = i % 2 === 0 ? radius : radius * 0.5;
        const px = x + Math.cos(angle - Math.PI / 2) * r;
        const py = y + Math.sin(angle - Math.PI / 2) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawSpiral(x, y, radius, turns, color) {
    ctx.beginPath();
    const totalPoints = turns * 100;
    for (let i = 0; i <= totalPoints; i++) {
        const angle = (i / 100) * Math.PI * 2 + rotation;
        const r = (i / totalPoints) * radius;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawShape(x, y, baseRadius, index) {
    const radius = baseRadius * (1 + smoothedBass * reactivity);
    const hue = (index * 60 + rotation * 50) % 360;
    const alpha = 0.8 - index * 0.15;
    const color = `hsla(${hue}, 80%, 60%, ${alpha})`;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * (index % 2 === 0 ? 1 : -1));
    ctx.translate(-x, -y);

    switch (shapeType) {
        case 'polygon':
            drawPolygon(x, y, radius, sides, color);
            break;
        case 'flower':
            drawFlower(x, y, radius, sides, color);
            break;
        case 'star':
            drawStar(x, y, radius, sides, color);
            break;
        case 'spiral':
            drawSpiral(x, y, radius, sides, color);
            break;
    }

    ctx.restore();
}

function drawReactiveBackground() {
    // Draw pulsing background gradient
    const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(width, height) * 0.7
    );

    const bgIntensity = smoothedBass * 0.3;
    gradient.addColorStop(0, `rgba(30, 20, 40, ${1})`);
    gradient.addColorStop(0.5, `rgba(${20 + bgIntensity * 100}, 10, ${40 + bgIntensity * 50}, 1)`);
    gradient.addColorStop(1, 'rgba(10, 10, 10, 1)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

function drawCentralShape() {
    const baseRadius = Math.min(width, height) * 0.15;

    // Draw multiple layered shapes
    for (let i = 4; i >= 0; i--) {
        const layerRadius = baseRadius * (1 + i * 0.3);
        const layerRotation = rotation * (1 + i * 0.2);

        ctx.save();

        // Apply glow effect
        if (i === 0) {
            ctx.shadowColor = `hsla(${(rotation * 100) % 360}, 80%, 50%, 0.5)`;
            ctx.shadowBlur = 30 + smoothedBass * 50;
        }

        drawShape(centerX, centerY, layerRadius, i);

        ctx.restore();
    }
}

function drawOrbitingShapes() {
    const orbitRadius = Math.min(width, height) * 0.3 * (1 + smoothedTreble * reactivity * 0.5);
    const numOrbits = sides;

    for (let i = 0; i < numOrbits; i++) {
        const angle = (i / numOrbits) * Math.PI * 2 + rotation * 2;
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius;

        const smallRadius = 30 + smoothedBass * 40 * reactivity;
        const hue = (i * (360 / numOrbits) + rotation * 100) % 360;

        ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.7)`;
        ctx.beginPath();
        ctx.arc(x, y, smallRadius, 0, Math.PI * 2);
        ctx.fill();

        // Connect to center
        ctx.strokeStyle = `hsla(${hue}, 80%, 50%, 0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

function drawParticleRing() {
    const ringRadius = Math.min(width, height) * 0.4;
    const numParticles = 60;

    for (let i = 0; i < numParticles; i++) {
        const angle = (i / numParticles) * Math.PI * 2 + rotation * 0.5;
        const freqIndex = Math.floor((i / numParticles) * (dataArray ? dataArray.length : 1));
        const freqValue = dataArray ? dataArray[freqIndex] / 255 : 0.5;

        const particleRadius = ringRadius * (1 + freqValue * 0.3 * reactivity);
        const x = centerX + Math.cos(angle) * particleRadius;
        const y = centerY + Math.sin(angle) * particleRadius;

        const hue = (i * 6 + rotation * 50) % 360;
        const size = 2 + freqValue * 8;

        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.5 + freqValue * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updateStats() {
    document.getElementById('bassLevel').textContent = Math.round(smoothedBass * 100) + '%';
    document.getElementById('trebleLevel').textContent = Math.round(smoothedTreble * 100) + '%';
}

function animate() {
    if (isRunning) {
        if (isDemoMode) {
            generateDemoData();
        } else if (analyser) {
            analyser.getByteFrequencyData(dataArray);
        }

        analyzeFrequencies();
    }

    // Update rotation
    rotation += 0.01 * rotateSpeed * (1 + smoothedBass * reactivity);

    // Draw everything
    drawReactiveBackground();
    drawParticleRing();
    drawOrbitingShapes();
    drawCentralShape();

    updateStats();

    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startMicrophone);
document.getElementById('demoBtn').addEventListener('click', startDemo);

document.getElementById('shapeType').addEventListener('change', (e) => {
    shapeType = e.target.value;
});

document.getElementById('sidesSlider').addEventListener('input', (e) => {
    sides = parseInt(e.target.value);
    document.getElementById('sidesValue').textContent = sides;
});

document.getElementById('reactSlider').addEventListener('input', (e) => {
    reactivity = parseFloat(e.target.value);
    document.getElementById('reactValue').textContent = reactivity.toFixed(1);
});

document.getElementById('rotateSlider').addEventListener('input', (e) => {
    rotateSpeed = parseFloat(e.target.value);
    document.getElementById('rotateValue').textContent = rotateSpeed.toFixed(1);
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
