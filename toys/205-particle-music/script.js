let canvas, ctx;
let particles = [];
let numParticles = 200;
let particleSize = 4;
let reactivity = 1;
let mode = 'demo';
let time = 0;
let audioContext, analyser, micStream, source;
let dataArray;
let bass = 0, mid = 0, high = 0;

function init() {
    canvas = document.getElementById('particleCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    createParticles();
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

    document.getElementById('countSlider').addEventListener('input', (e) => {
        numParticles = parseInt(e.target.value);
        document.getElementById('countValue').textContent = numParticles;
        createParticles();
    });

    document.getElementById('sizeSlider').addEventListener('input', (e) => {
        particleSize = parseInt(e.target.value);
        document.getElementById('sizeValue').textContent = particleSize;
    });

    document.getElementById('reactSlider').addEventListener('input', (e) => {
        reactivity = parseFloat(e.target.value);
        document.getElementById('reactValue').textContent = reactivity.toFixed(1);
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
            analyser.fftSize = 256;
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

function createParticles() {
    particles = [];
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            baseX: 0,
            baseY: 0,
            vx: 0,
            vy: 0,
            hue: (i / numParticles) * 360,
            freq: Math.floor(Math.random() * 3) // 0=bass, 1=mid, 2=high
        });
        particles[i].baseX = particles[i].x;
        particles[i].baseY = particles[i].y;
    }
}

function getAudioLevels() {
    if (mode === 'demo') {
        bass = 0.5 + 0.5 * Math.sin(time * 2);
        mid = 0.5 + 0.5 * Math.sin(time * 3 + 1);
        high = 0.5 + 0.5 * Math.sin(time * 5 + 2);
    } else if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        const len = dataArray.length;

        // Bass (low frequencies)
        let bassSum = 0;
        for (let i = 0; i < len / 4; i++) {
            bassSum += dataArray[i];
        }
        bass = (bassSum / (len / 4)) / 255;

        // Mid frequencies
        let midSum = 0;
        for (let i = len / 4; i < len / 2; i++) {
            midSum += dataArray[i];
        }
        mid = (midSum / (len / 4)) / 255;

        // High frequencies
        let highSum = 0;
        for (let i = len / 2; i < len; i++) {
            highSum += dataArray[i];
        }
        high = (highSum / (len / 2)) / 255;
    }
}

function update() {
    getAudioLevels();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    particles.forEach(p => {
        let level;
        switch (p.freq) {
            case 0: level = bass; break;
            case 1: level = mid; break;
            case 2: level = high; break;
        }

        // Movement based on audio
        const angle = Math.atan2(p.baseY - centerY, p.baseX - centerX);
        const dist = Math.sqrt((p.baseX - centerX) ** 2 + (p.baseY - centerY) ** 2);
        const expansion = 1 + level * reactivity * 0.5;

        const targetX = centerX + Math.cos(angle) * dist * expansion;
        const targetY = centerY + Math.sin(angle) * dist * expansion;

        // Add some swirl
        const swirlAngle = angle + level * reactivity * 0.5;
        const swirlX = targetX + Math.cos(swirlAngle + time) * level * 20 * reactivity;
        const swirlY = targetY + Math.sin(swirlAngle + time) * level * 20 * reactivity;

        // Smooth movement
        p.vx += (swirlX - p.x) * 0.05;
        p.vy += (swirlY - p.y) * 0.05;
        p.vx *= 0.9;
        p.vy *= 0.9;

        p.x += p.vx;
        p.y += p.vy;

        // Rotate hue with audio
        p.hue += level * reactivity * 2;
    });

    time += 0.02;
}

function draw() {
    // Fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw particles
    particles.forEach(p => {
        let level;
        switch (p.freq) {
            case 0: level = bass; break;
            case 1: level = mid; break;
            case 2: level = high; break;
        }

        const size = particleSize * (1 + level * reactivity);
        const alpha = 0.5 + level * 0.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();
    });

    // Draw connections for nearby particles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 50) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.globalAlpha = (1 - dist / 50) * 0.3;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    }

    // Draw audio levels indicator
    const barWidth = 60;
    const barHeight = 10;
    const startX = 20;
    const startY = canvas.height - 50;

    ctx.fillStyle = `hsl(0, 80%, ${40 + bass * 30}%)`;
    ctx.fillRect(startX, startY, barWidth * bass, barHeight);
    ctx.fillStyle = `hsl(120, 80%, ${40 + mid * 30}%)`;
    ctx.fillRect(startX, startY + 15, barWidth * mid, barHeight);
    ctx.fillStyle = `hsl(240, 80%, ${40 + high * 30}%)`;
    ctx.fillRect(startX, startY + 30, barWidth * high, barHeight);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('Bass', startX + barWidth + 5, startY + 8);
    ctx.fillText('Mid', startX + barWidth + 5, startY + 23);
    ctx.fillText('High', startX + barWidth + 5, startY + 38);
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
