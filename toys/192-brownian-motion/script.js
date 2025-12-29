let canvas, ctx;
let temperature = 300;
let numParticles = 200;
let showTrace = true;
let particles = [];
let trackedParticle = null;
let trace = [];

function init() {
    canvas = document.getElementById('brownianCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    resetSimulation();
    animate();
}

function resizeCanvas() {
    const size = Math.min(600, window.innerWidth - 40);
    canvas.width = size;
    canvas.height = size;
}

function setupControls() {
    document.getElementById('tempSlider').addEventListener('input', (e) => {
        temperature = parseInt(e.target.value);
        document.getElementById('tempValue').textContent = temperature + ' K';
    });
    document.getElementById('particleSlider').addEventListener('input', (e) => {
        numParticles = parseInt(e.target.value);
        document.getElementById('particleValue').textContent = numParticles;
        resetSimulation();
    });
    document.getElementById('traceCheck').addEventListener('change', (e) => {
        showTrace = e.target.checked;
        if (!showTrace) trace = [];
    });
    document.getElementById('resetBtn').addEventListener('click', resetSimulation);
    document.getElementById('clearTraceBtn').addEventListener('click', () => { trace = []; });
}

function resetSimulation() {
    particles = [];
    trace = [];
    const size = canvas.width;

    // Create tracked particle (larger)
    trackedParticle = {
        x: size / 2,
        y: size / 2,
        vx: 0,
        vy: 0,
        radius: 12,
        mass: 50
    };

    // Create small molecules
    for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 2 + 1) * Math.sqrt(temperature / 300);
        particles.push({
            x: Math.random() * size,
            y: Math.random() * size,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 2,
            mass: 1
        });
    }
}

function update() {
    const size = canvas.width;
    const speedFactor = Math.sqrt(temperature / 300);

    // Update small particles
    particles.forEach(p => {
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;

        // Boundary collision
        if (p.x < p.radius || p.x > size - p.radius) {
            p.vx *= -1;
            p.x = Math.max(p.radius, Math.min(size - p.radius, p.x));
        }
        if (p.y < p.radius || p.y > size - p.radius) {
            p.vy *= -1;
            p.y = Math.max(p.radius, Math.min(size - p.radius, p.y));
        }

        // Collision with tracked particle
        const dx = trackedParticle.x - p.x;
        const dy = trackedParticle.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = trackedParticle.radius + p.radius;

        if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;

            // Elastic collision
            const dvx = p.vx - trackedParticle.vx;
            const dvy = p.vy - trackedParticle.vy;
            const dvn = dvx * nx + dvy * ny;

            const m1 = p.mass;
            const m2 = trackedParticle.mass;
            const factor = 2 * dvn / (m1 + m2);

            p.vx -= factor * m2 * nx;
            p.vy -= factor * m2 * ny;
            trackedParticle.vx += factor * m1 * nx;
            trackedParticle.vy += factor * m1 * ny;

            // Separate particles
            const overlap = minDist - dist;
            p.x -= nx * overlap * 0.5;
            p.y -= ny * overlap * 0.5;
            trackedParticle.x += nx * overlap * 0.5;
            trackedParticle.y += ny * overlap * 0.5;
        }
    });

    // Update tracked particle
    trackedParticle.x += trackedParticle.vx;
    trackedParticle.y += trackedParticle.vy;

    // Boundary for tracked particle
    if (trackedParticle.x < trackedParticle.radius || trackedParticle.x > size - trackedParticle.radius) {
        trackedParticle.vx *= -0.9;
        trackedParticle.x = Math.max(trackedParticle.radius, Math.min(size - trackedParticle.radius, trackedParticle.x));
    }
    if (trackedParticle.y < trackedParticle.radius || trackedParticle.y > size - trackedParticle.radius) {
        trackedParticle.vy *= -0.9;
        trackedParticle.y = Math.max(trackedParticle.radius, Math.min(size - trackedParticle.radius, trackedParticle.y));
    }

    // Record trace
    if (showTrace) {
        trace.push({ x: trackedParticle.x, y: trackedParticle.y });
        if (trace.length > 1000) trace.shift();
    }
}

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw trace
    if (showTrace && trace.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trace[0].x, trace[0].y);
        for (let i = 1; i < trace.length; i++) {
            ctx.lineTo(trace[i].x, trace[i].y);
        }
        ctx.strokeStyle = 'rgba(255, 205, 86, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Draw small particles
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 150, 255, 0.6)';
        ctx.fill();
    });

    // Draw tracked particle
    ctx.beginPath();
    ctx.arc(trackedParticle.x, trackedParticle.y, trackedParticle.radius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(
        trackedParticle.x - 3, trackedParticle.y - 3, 0,
        trackedParticle.x, trackedParticle.y, trackedParticle.radius
    );
    gradient.addColorStop(0, '#ffcd56');
    gradient.addColorStop(1, '#ff9a56');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
