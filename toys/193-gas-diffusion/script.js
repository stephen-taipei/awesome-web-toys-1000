let canvas, ctx;
let temperature = 300;
let barrierOpen = false;
let redParticles = [], blueParticles = [];
const numParticles = 100;

function init() {
    canvas = document.getElementById('diffusionCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    resetSimulation();
    animate();
}

function resizeCanvas() {
    const width = Math.min(800, window.innerWidth - 40);
    canvas.width = width;
    canvas.height = width * 0.5;
}

function setupControls() {
    document.getElementById('tempSlider').addEventListener('input', (e) => {
        temperature = parseInt(e.target.value);
        document.getElementById('tempValue').textContent = temperature + ' K';
    });
    document.getElementById('barrierBtn').addEventListener('click', () => {
        barrierOpen = !barrierOpen;
        document.getElementById('barrierBtn').textContent = barrierOpen ? '恢復隔板' : '移除隔板';
    });
    document.getElementById('resetBtn').addEventListener('click', resetSimulation);
}

function resetSimulation() {
    barrierOpen = false;
    document.getElementById('barrierBtn').textContent = '移除隔板';
    redParticles = [];
    blueParticles = [];

    const w = canvas.width;
    const h = canvas.height;

    // Red particles on the left
    for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        redParticles.push({
            x: Math.random() * (w / 2 - 20) + 10,
            y: Math.random() * (h - 20) + 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 4
        });
    }

    // Blue particles on the right
    for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        blueParticles.push({
            x: Math.random() * (w / 2 - 20) + w / 2 + 10,
            y: Math.random() * (h - 20) + 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 4
        });
    }
}

function updateParticles(particles, color) {
    const w = canvas.width;
    const h = canvas.height;
    const speedFactor = Math.sqrt(temperature / 300);
    const barrierX = w / 2;

    particles.forEach(p => {
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;

        // Wall collisions
        if (p.x < p.radius) { p.vx *= -1; p.x = p.radius; }
        if (p.x > w - p.radius) { p.vx *= -1; p.x = w - p.radius; }
        if (p.y < p.radius) { p.vy *= -1; p.y = p.radius; }
        if (p.y > h - p.radius) { p.vy *= -1; p.y = h - p.radius; }

        // Barrier collision
        if (!barrierOpen) {
            if (p.x > barrierX - 3 - p.radius && p.x < barrierX + 3 + p.radius) {
                if (p.vx > 0 && p.x < barrierX) {
                    p.vx *= -1;
                    p.x = barrierX - 3 - p.radius;
                } else if (p.vx < 0 && p.x > barrierX) {
                    p.vx *= -1;
                    p.x = barrierX + 3 + p.radius;
                }
            }
        }
    });
}

function updateStats() {
    const w = canvas.width;
    const mid = w / 2;

    let leftRed = 0, rightRed = 0, leftBlue = 0, rightBlue = 0;

    redParticles.forEach(p => {
        if (p.x < mid) leftRed++;
        else rightRed++;
    });

    blueParticles.forEach(p => {
        if (p.x < mid) leftBlue++;
        else rightBlue++;
    });

    document.getElementById('leftRed').textContent = leftRed;
    document.getElementById('rightRed').textContent = rightRed;
    document.getElementById('leftBlue').textContent = leftBlue;
    document.getElementById('rightBlue').textContent = rightBlue;
}

function draw() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);

    // Draw barrier
    if (!barrierOpen) {
        ctx.fillStyle = '#555';
        ctx.fillRect(w / 2 - 3, 0, 6, h);
    } else {
        ctx.strokeStyle = '#333';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw red particles
    redParticles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6b6b';
        ctx.fill();
    });

    // Draw blue particles
    blueParticles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#4ecdc4';
        ctx.fill();
    });

    // Draw container border
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, w - 4, h - 4);
}

function animate() {
    updateParticles(redParticles);
    updateParticles(blueParticles);
    updateStats();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
