let canvas, ctx, piston;
let volume = 1, temperature = 300;
let particles = [];
const numParticles = 50;
const n = 1, R = 0.0821;

function init() {
    canvas = document.getElementById('gasCanvas');
    ctx = canvas.getContext('2d');
    piston = document.getElementById('piston');
    resizeCanvas();
    initParticles();
    setupControls();
    animate();
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 300 * dpr;
    canvas.height = 350 * dpr;
    ctx.scale(dpr, dpr);
}

function initParticles() {
    particles = [];
    const containerHeight = 350 - getPistonY() - 30;
    for (let i = 0; i < numParticles; i++) {
        const speed = Math.sqrt(temperature / 300) * 3;
        const angle = Math.random() * Math.PI * 2;
        particles.push({
            x: 20 + Math.random() * 260,
            y: getPistonY() + 30 + Math.random() * containerHeight,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 5
        });
    }
}

function getPistonY() { return 50 + (1 - volume/2) * 200; }

function setupControls() {
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        volume = parseFloat(e.target.value);
        updatePiston();
        updateDisplay();
    });
    document.getElementById('tempSlider').addEventListener('input', (e) => {
        temperature = parseInt(e.target.value);
        updateParticleSpeed();
        updateDisplay();
    });
    let isDragging = false;
    piston.addEventListener('mousedown', () => isDragging = true);
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = canvas.parentElement.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const newVolume = 2 - (y - 50) / 100;
        volume = Math.max(0.3, Math.min(2, newVolume));
        document.getElementById('volumeSlider').value = volume;
        updatePiston();
        updateDisplay();
    });
    document.addEventListener('mouseup', () => isDragging = false);
    updatePiston();
    updateDisplay();
}

function updatePiston() {
    piston.style.top = getPistonY() + 'px';
}

function updateParticleSpeed() {
    const speedFactor = Math.sqrt(temperature / 300);
    particles.forEach(p => {
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (currentSpeed > 0) {
            p.vx = (p.vx / currentSpeed) * 3 * speedFactor;
            p.vy = (p.vy / currentSpeed) * 3 * speedFactor;
        }
    });
}

function updateDisplay() {
    const pressure = (n * R * temperature) / volume;
    document.getElementById('pressure').textContent = pressure.toFixed(2) + ' atm';
    document.getElementById('volume').textContent = volume.toFixed(2) + ' L';
    document.getElementById('temperature').textContent = temperature + ' K';
}

function updateParticles() {
    const pistonY = getPistonY() + 30;
    const bottom = 340;
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 10 || p.x > 290) { p.vx *= -1; p.x = Math.max(10, Math.min(290, p.x)); }
        if (p.y < pistonY || p.y > bottom) { p.vy *= -1; p.y = Math.max(pistonY, Math.min(bottom, p.y)); }
    });
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 300, 350);
    const pistonY = getPistonY();
    ctx.fillStyle = '#222';
    ctx.fillRect(5, pistonY + 30, 290, 350 - pistonY - 35);
    const hue = (temperature - 200) / 300 * 60;
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        ctx.fill();
    });
}

function animate() {
    updateParticles();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
