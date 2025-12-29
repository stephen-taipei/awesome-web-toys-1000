let canvas, ctx;
let pressure = 1.0;
let isPumping = false;
let currentObject = 'balloon';
let particles = [];

function init() {
    canvas = document.getElementById('vacuumCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    initParticles();
    animate();
}

function resizeCanvas() {
    const size = Math.min(400, window.innerWidth - 200);
    canvas.width = size;
    canvas.height = size * 1.2;
}

function setupControls() {
    document.getElementById('pumpBtn').addEventListener('click', togglePump);
    document.getElementById('releaseBtn').addEventListener('click', releaseGas);
    document.getElementById('objectSelect').addEventListener('change', (e) => {
        currentObject = e.target.value;
    });
}

function togglePump() {
    isPumping = !isPumping;
    const btn = document.getElementById('pumpBtn');
    btn.textContent = isPumping ? '停止真空泵' : '啟動真空泵';
    btn.classList.toggle('active', isPumping);
}

function releaseGas() {
    isPumping = false;
    document.getElementById('pumpBtn').textContent = '啟動真空泵';
    document.getElementById('pumpBtn').classList.remove('active');
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: 2 + Math.random() * 2
        });
    }
}

function update() {
    if (isPumping && pressure > 0.01) {
        pressure -= 0.005;
    } else if (!isPumping && pressure < 1.0) {
        pressure += 0.01;
    }
    pressure = Math.max(0.01, Math.min(1.0, pressure));

    // Update particles based on pressure
    const numVisible = Math.floor(particles.length * pressure);
    particles.forEach((p, i) => {
        p.visible = i < numVisible;
        if (p.visible) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 20 || p.x > canvas.width - 20) p.vx *= -1;
            if (p.y < 20 || p.y > canvas.height - 20) p.vy *= -1;
        }
    });

    updateDisplay();
}

function updateDisplay() {
    document.getElementById('pressure').textContent = pressure.toFixed(2) + ' atm';
    document.getElementById('vacuum').textContent = Math.round((1 - pressure) * 100) + '%';
    document.getElementById('pumpStatus').textContent = isPumping ? '運轉中' : '停止';
    document.getElementById('pumpStatus').style.color = isPumping ? '#44ff44' : '#aaa';

    // Update gauge needle
    const angle = -90 + (1 - pressure) * 180;
    document.getElementById('gaugeNeedle').style.transform = `translateX(-50%) rotate(${angle}deg)`;
}

function getObjectScale() {
    // Objects expand when pressure decreases (Boyle's Law)
    return 1 / Math.pow(pressure, 0.3);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw vacuum chamber walls
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Draw glass effect
    ctx.fillStyle = 'rgba(100, 150, 255, 0.05)';
    ctx.fillRect(15, 15, canvas.width - 30, canvas.height - 30);

    // Draw air particles
    particles.forEach(p => {
        if (p.visible) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(150, 180, 255, 0.5)';
            ctx.fill();
        }
    });

    // Draw object
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = getObjectScale();

    switch (currentObject) {
        case 'balloon':
            drawBalloon(cx, cy, scale);
            break;
        case 'marshmallow':
            drawMarshmallow(cx, cy, scale);
            break;
        case 'shavingCream':
            drawShavingCream(cx, cy, scale);
            break;
    }

    // Draw pump indicator
    if (isPumping) {
        ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
        ctx.beginPath();
        ctx.arc(canvas.width - 40, 40, 15 + Math.sin(Date.now() / 100) * 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawBalloon(cx, cy, scale) {
    const baseRadius = 40;
    const radius = baseRadius * scale;

    // Balloon body
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 0.9, radius, 0, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
    gradient.addColorStop(0, '#ff9999');
    gradient.addColorStop(0.5, '#ff6b6b');
    gradient.addColorStop(1, '#cc4444');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.ellipse(cx - radius * 0.3, cy - radius * 0.4, radius * 0.15, radius * 0.2, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    // Knot
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + radius);
    ctx.lineTo(cx, cy + radius + 10);
    ctx.lineTo(cx + 6, cy + radius);
    ctx.fillStyle = '#cc4444';
    ctx.fill();

    // String
    ctx.beginPath();
    ctx.moveTo(cx, cy + radius + 10);
    ctx.lineTo(cx, cy + radius + 50);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawMarshmallow(cx, cy, scale) {
    const baseSize = 50;
    const size = baseSize * scale;

    // Marshmallow body
    ctx.beginPath();
    ctx.roundRect(cx - size / 2, cy - size * 0.6, size, size * 1.2, 15 * scale);
    const gradient = ctx.createLinearGradient(cx - size / 2, cy, cx + size / 2, cy);
    gradient.addColorStop(0, '#fff8f0');
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, '#f5e8dc');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawShavingCream(cx, cy, scale) {
    const baseRadius = 30;
    const radius = baseRadius * scale;

    // Multiple bubbles
    const bubbles = [
        { dx: 0, dy: 0, r: 1 },
        { dx: -0.8, dy: -0.5, r: 0.7 },
        { dx: 0.8, dy: -0.4, r: 0.6 },
        { dx: -0.5, dy: 0.6, r: 0.65 },
        { dx: 0.6, dy: 0.5, r: 0.55 },
        { dx: 0, dy: -0.9, r: 0.5 },
        { dx: -0.3, dy: 0.9, r: 0.45 },
        { dx: 0.4, dy: 0.85, r: 0.4 }
    ];

    bubbles.forEach(b => {
        ctx.beginPath();
        ctx.arc(cx + b.dx * radius, cy + b.dy * radius, radius * b.r, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            cx + b.dx * radius - 5, cy + b.dy * radius - 5, 0,
            cx + b.dx * radius, cy + b.dy * radius, radius * b.r
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.7, '#f0f0f0');
        gradient.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = gradient;
        ctx.fill();
    });
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
