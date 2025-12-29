let canvas, ctx;
let moles = 0.041;
let temperature = 300;
let balloonColor = '#ff6b6b';
let particles = [];
let isPopped = false;
let popParticles = [];
let isInflating = false;
let isDeflating = false;

const R = 0.0821;
const maxMoles = 0.2;
const minMoles = 0.01;

function init() {
    canvas = document.getElementById('balloonCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    initParticles();
    animate();
}

function resizeCanvas() {
    const size = Math.min(500, window.innerWidth - 40);
    canvas.width = size;
    canvas.height = size;
}

function setupControls() {
    const inflateBtn = document.getElementById('inflateBtn');
    const deflateBtn = document.getElementById('deflateBtn');

    inflateBtn.addEventListener('mousedown', () => isInflating = true);
    inflateBtn.addEventListener('mouseup', () => isInflating = false);
    inflateBtn.addEventListener('mouseleave', () => isInflating = false);
    inflateBtn.addEventListener('touchstart', (e) => { e.preventDefault(); isInflating = true; });
    inflateBtn.addEventListener('touchend', () => isInflating = false);

    deflateBtn.addEventListener('mousedown', () => isDeflating = true);
    deflateBtn.addEventListener('mouseup', () => isDeflating = false);
    deflateBtn.addEventListener('mouseleave', () => isDeflating = false);
    deflateBtn.addEventListener('touchstart', (e) => { e.preventDefault(); isDeflating = true; });
    deflateBtn.addEventListener('touchend', () => isDeflating = false);

    document.getElementById('tempSlider').addEventListener('input', (e) => {
        temperature = parseInt(e.target.value);
        document.getElementById('tempValue').textContent = temperature + ' K';
        updateParticleSpeed();
    });

    document.getElementById('colorPicker').addEventListener('input', (e) => {
        balloonColor = e.target.value;
    });

    document.getElementById('resetBtn').addEventListener('click', resetBalloon);
    document.getElementById('popBtn').addEventListener('click', popBalloon);
}

function resetBalloon() {
    isPopped = false;
    moles = 0.041;
    popParticles = [];
    initParticles();
}

function initParticles() {
    particles = [];
    const numParticles = 30;
    for (let i = 0; i < numParticles; i++) {
        particles.push(createParticle());
    }
}

function createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.sqrt(temperature / 300) * 2;
    return {
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 0.8,
        vAngle: (Math.random() - 0.5) * 0.05,
        vDist: (Math.random() - 0.5) * 0.02,
        size: 3 + Math.random() * 2
    };
}

function updateParticleSpeed() {
    const speedFactor = Math.sqrt(temperature / 300);
    particles.forEach(p => {
        p.vAngle = (Math.random() - 0.5) * 0.05 * speedFactor;
        p.vDist = (Math.random() - 0.5) * 0.02 * speedFactor;
    });
}

function getVolume() {
    return (moles * R * temperature) / 1.0;
}

function getRadius() {
    const volume = getVolume();
    return Math.pow((3 * volume) / (4 * Math.PI), 1/3) * 100;
}

function popBalloon() {
    if (isPopped) return;
    isPopped = true;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 30;
    const radius = getRadius();

    for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 10;
        popParticles.push({
            x: cx + Math.cos(angle) * radius * Math.random(),
            y: cy + Math.sin(angle) * radius * Math.random(),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 5,
            size: 5 + Math.random() * 10,
            color: balloonColor,
            life: 1
        });
    }
}

function update() {
    if (isPopped) {
        popParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3;
            p.life -= 0.02;
        });
        popParticles = popParticles.filter(p => p.life > 0);
        return;
    }

    if (isInflating) {
        moles = Math.min(maxMoles, moles + 0.002);
        if (moles >= maxMoles) popBalloon();
    }
    if (isDeflating) {
        moles = Math.max(minMoles, moles - 0.002);
    }

    particles.forEach(p => {
        p.angle += p.vAngle;
        p.dist += p.vDist;
        if (p.dist < 0.1 || p.dist > 0.85) p.vDist *= -1;
        p.dist = Math.max(0.1, Math.min(0.85, p.dist));
    });

    updateDisplay();
}

function updateDisplay() {
    const volume = getVolume();
    const pressure = (moles * R * temperature) / volume;

    document.getElementById('pressure').textContent = pressure.toFixed(2) + ' atm';
    document.getElementById('volume').textContent = volume.toFixed(2) + ' L';
    document.getElementById('moles').textContent = moles.toFixed(3) + ' mol';

    if (moles > 0.18) {
        document.getElementById('status').textContent = '危險!';
        document.getElementById('status').style.color = '#ff4444';
    } else if (moles > 0.12) {
        document.getElementById('status').textContent = '膨脹中';
        document.getElementById('status').style.color = '#ffaa00';
    } else {
        document.getElementById('status').textContent = '正常';
        document.getElementById('status').style.color = '#44ff44';
    }
}

function draw() {
    // Sky background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#87ceeb');
    skyGrad.addColorStop(1, '#e0f0ff');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    drawCloud(50, 60, 40);
    drawCloud(canvas.width - 80, 80, 30);

    if (isPopped) {
        // Draw pop particles
        popParticles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
            ctx.fill();
        });

        // Draw "POP!" text
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#ff4444';
        ctx.textAlign = 'center';
        ctx.fillText('POP!', canvas.width / 2, canvas.height / 2);
        return;
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 30;
    const radius = getRadius();

    // Draw balloon shadow
    ctx.beginPath();
    ctx.ellipse(cx + 10, canvas.height - 40, radius * 0.6, radius * 0.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fill();

    // Draw balloon
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 0.9, radius, 0, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
    gradient.addColorStop(0, lightenColor(balloonColor, 60));
    gradient.addColorStop(0.5, balloonColor);
    gradient.addColorStop(1, darkenColor(balloonColor, 30));
    ctx.fillStyle = gradient;
    ctx.fill();

    // Balloon highlight
    ctx.beginPath();
    ctx.ellipse(cx - radius * 0.3, cy - radius * 0.4, radius * 0.15, radius * 0.25, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    // Draw particles inside balloon
    particles.forEach(p => {
        const px = cx + Math.cos(p.angle) * p.dist * radius * 0.8;
        const py = cy + Math.sin(p.angle) * p.dist * radius * 0.9;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
    });

    // Draw knot
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy + radius);
    ctx.lineTo(cx, cy + radius + 15);
    ctx.lineTo(cx + 8, cy + radius);
    ctx.fillStyle = darkenColor(balloonColor, 20);
    ctx.fill();

    // Draw string
    ctx.beginPath();
    ctx.moveTo(cx, cy + radius + 15);
    ctx.quadraticCurveTo(cx + 20, cy + radius + 60, cx, canvas.height - 20);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y - size * 0.2, size * 0.7, 0, Math.PI * 2);
    ctx.arc(x + size * 1.5, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
}

function lightenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const r = Math.min(255, (num >> 16) + percent);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
    const b = Math.min(255, (num & 0x0000FF) + percent);
    return `rgb(${r},${g},${b})`;
}

function darkenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const r = Math.max(0, (num >> 16) - percent);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - percent);
    const b = Math.max(0, (num & 0x0000FF) - percent);
    return `rgb(${r},${g},${b})`;
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
