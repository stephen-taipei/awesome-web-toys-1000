let canvas, ctx;
let numRings = 3;
let rotateSpeed = 0.5;
let connectPoints = true;
let mode = 'demo';
let time = 0;
let rotation = 0;
let audioContext, analyser, micStream, source;
let dataArray;
const segments = 64;

function init() {
    canvas = document.getElementById('spectrumCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    animate();
}

function resizeCanvas() {
    const size = Math.min(600, window.innerWidth - 40);
    canvas.width = size;
    canvas.height = size;
}

function setupControls() {
    document.getElementById('micBtn').addEventListener('click', () => setMode('mic'));
    document.getElementById('demoBtn').addEventListener('click', () => setMode('demo'));

    document.getElementById('ringsSlider').addEventListener('input', (e) => {
        numRings = parseInt(e.target.value);
        document.getElementById('ringsValue').textContent = numRings;
    });

    document.getElementById('rotateSlider').addEventListener('input', (e) => {
        rotateSpeed = parseFloat(e.target.value);
        document.getElementById('rotateValue').textContent = rotateSpeed.toFixed(1);
    });

    document.getElementById('connectCheck').addEventListener('change', (e) => {
        connectPoints = e.target.checked;
    });
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
        document.getElementById('micBtn').textContent = '麥克風開啟中';
    } catch (err) {
        alert('無法存取麥克風');
        setMode('demo');
    }
}

function getDemoData() {
    const data = [];
    for (let i = 0; i < segments; i++) {
        const freq = i / segments;
        // Create interesting patterns
        let value = 0;
        value += Math.sin(time * 2 + freq * 10) * 0.3;
        value += Math.sin(time * 3 + freq * 20) * 0.2;
        value += Math.sin(time * 5 + freq * 5) * 0.15;
        value += Math.sin(time + i * 0.5) * 0.2;
        value = (value + 1) / 2; // Normalize to 0-1
        data.push(value * 0.8 + 0.1);
    }
    return data;
}

function getMicData() {
    if (!analyser) return getDemoData();
    analyser.getByteFrequencyData(dataArray);
    const data = [];
    const step = Math.floor(dataArray.length / segments);
    for (let i = 0; i < segments; i++) {
        const idx = Math.min(i * step, dataArray.length - 1);
        data.push(dataArray[idx] / 255);
    }
    return data;
}

function draw() {
    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;

    // Clear with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, w, h);

    // Get spectrum data
    const data = mode === 'mic' ? getMicData() : getDemoData();

    // Draw rings
    for (let ring = 0; ring < numRings; ring++) {
        const baseRadius = 50 + ring * 60;
        const maxHeight = 50;
        const ringRotation = rotation * (ring % 2 === 0 ? 1 : -1);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(ringRotation);

        const points = [];

        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
            const dataIndex = (i + ring * 10) % segments;
            const amplitude = data[dataIndex];
            const radius = baseRadius + amplitude * maxHeight;

            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            points.push({ x, y, amplitude });
        }

        // Draw filled area
        ctx.beginPath();
        points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();

        const gradient = ctx.createRadialGradient(0, 0, baseRadius * 0.5, 0, 0, baseRadius + maxHeight);
        const hueOffset = ring * 60;
        gradient.addColorStop(0, `hsla(${hueOffset}, 80%, 50%, 0.1)`);
        gradient.addColorStop(1, `hsla(${hueOffset + 60}, 80%, 50%, 0.3)`);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw outline
        if (connectPoints) {
            ctx.beginPath();
            points.forEach((p, i) => {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.closePath();
            ctx.strokeStyle = `hsla(${hueOffset + time * 50}, 80%, 60%, 0.8)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw dots at peaks
        points.forEach((p, i) => {
            if (p.amplitude > 0.5) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${hueOffset + i * 5}, 100%, 70%, ${p.amplitude})`;
                ctx.fill();
            }
        });

        ctx.restore();
    }

    // Draw center circle
    const centerPulse = data.reduce((a, b) => a + b, 0) / segments;
    const centerRadius = 30 + centerPulse * 20;

    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    const centerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius);
    centerGrad.addColorStop(0, `hsla(${time * 30}, 80%, 70%, 0.8)`);
    centerGrad.addColorStop(0.5, `hsla(${time * 30 + 60}, 80%, 50%, 0.5)`);
    centerGrad.addColorStop(1, `hsla(${time * 30 + 120}, 80%, 40%, 0.2)`);
    ctx.fillStyle = centerGrad;
    ctx.fill();

    // Update state
    time += 0.02;
    rotation += rotateSpeed * 0.01;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
