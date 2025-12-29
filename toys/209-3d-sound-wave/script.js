let canvas, ctx;
let audioContext, analyser, micStream, source;
let dataArray;
let mode = 'demo';
let rotateSpeed = 0.5;
let depth = 30;
let perspective = 400;
let angleX = 0.3;
let angleY = 0;
let time = 0;
let isDragging = false;
let lastMouseX, lastMouseY;
let waveHistory = [];
const historyLength = 30;

function init() {
    canvas = document.getElementById('waveCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    setupDragControls();
    animate();
}

function resizeCanvas() {
    const width = Math.min(800, window.innerWidth - 40);
    canvas.width = width;
    canvas.height = width * 0.6;
}

function setupControls() {
    document.getElementById('micBtn').addEventListener('click', () => setMode('mic'));
    document.getElementById('demoBtn').addEventListener('click', () => setMode('demo'));

    document.getElementById('rotateSlider').addEventListener('input', (e) => {
        rotateSpeed = parseFloat(e.target.value);
        document.getElementById('rotateValue').textContent = rotateSpeed.toFixed(1);
    });

    document.getElementById('depthSlider').addEventListener('input', (e) => {
        depth = parseInt(e.target.value);
        document.getElementById('depthValue').textContent = depth;
    });

    document.getElementById('perspectiveSlider').addEventListener('input', (e) => {
        perspective = parseInt(e.target.value);
        document.getElementById('perspectiveValue').textContent = perspective;
    });
}

function setupDragControls() {
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        angleY += dx * 0.01;
        angleX += dy * 0.01;
        angleX = Math.max(-1, Math.min(1, angleX));
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    canvas.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('mouseleave', () => isDragging = false);
}

function setMode(newMode) {
    mode = newMode;
    document.querySelectorAll('.source-btn').forEach(btn => btn.classList.remove('active'));

    if (newMode === 'demo') {
        document.getElementById('demoBtn').classList.add('active');
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
            micStream = null;
        }
    } else if (newMode === 'mic') {
        document.getElementById('micBtn').classList.add('active');
        startMicrophone();
    }
}

async function startMicrophone() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 128;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        }

        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        source = audioContext.createMediaStreamSource(micStream);
        source.connect(analyser);
    } catch (err) {
        alert('無法存取麥克風');
        setMode('demo');
    }
}

function getDemoData() {
    const data = [];
    const segments = 32;
    for (let i = 0; i < segments; i++) {
        const freq = i / segments;
        let value = 0;
        value += Math.sin(time * 2 + freq * 8) * 0.4;
        value += Math.sin(time * 3 + freq * 12) * 0.3;
        value += Math.sin(time * 5 + freq * 4) * 0.2;
        value = (value + 1) / 2;
        data.push(value * 0.8 + 0.1);
    }
    return data;
}

function getMicData() {
    if (!analyser) return getDemoData();
    analyser.getByteFrequencyData(dataArray);
    const data = [];
    for (let i = 0; i < dataArray.length; i++) {
        data.push(dataArray[i] / 255);
    }
    return data;
}

function project(x, y, z) {
    const rotY = angleY + (isDragging ? 0 : time * rotateSpeed * 0.5);

    // Rotate around Y axis
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    // Rotate around X axis
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    // Perspective projection
    const scale = perspective / (perspective + z2);
    const screenX = canvas.width / 2 + x1 * scale;
    const screenY = canvas.height / 2 + y1 * scale;

    return { x: screenX, y: screenY, z: z2, scale };
}

function update() {
    const data = mode === 'mic' ? getMicData() : getDemoData();
    waveHistory.unshift(data);
    if (waveHistory.length > historyLength) {
        waveHistory.pop();
    }
    time += 0.02;
}

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const segments = waveHistory[0] ? waveHistory[0].length : 32;
    const width = 300;
    const totalDepth = depth * historyLength;

    // Draw waves from back to front
    for (let d = waveHistory.length - 1; d >= 0; d--) {
        const data = waveHistory[d];
        if (!data) continue;

        const z = (d / historyLength - 0.5) * totalDepth;
        const alpha = 1 - d / historyLength;

        // Draw filled area
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const x = (i / segments - 0.5) * width;
            const value = i < segments ? data[i] : data[segments - 1];
            const y = -value * 80;

            const p = project(x, y, z);

            if (i === 0) {
                ctx.moveTo(p.x, p.y);
            } else {
                ctx.lineTo(p.x, p.y);
            }
        }

        // Close the path to baseline
        const pEnd = project(width / 2, 0, z);
        const pStart = project(-width / 2, 0, z);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.lineTo(pStart.x, pStart.y);
        ctx.closePath();

        const hue = 260 + d * 3;
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${alpha * 0.3})`;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        for (let i = 0; i < segments; i++) {
            const x = (i / segments - 0.5) * width;
            const y = -data[i] * 80;
            const p = project(x, y, z);

            if (i === 0) {
                ctx.moveTo(p.x, p.y);
            } else {
                ctx.lineTo(p.x, p.y);
            }
        }

        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Draw glowing points on front wave
    if (waveHistory[0]) {
        const data = waveHistory[0];
        for (let i = 0; i < segments; i++) {
            const x = (i / segments - 0.5) * width;
            const y = -data[i] * 80;
            const p = project(x, y, 0);

            if (data[i] > 0.5) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${260 + i * 5}, 100%, 70%, ${data[i]})`;
                ctx.fill();
            }
        }
    }
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
