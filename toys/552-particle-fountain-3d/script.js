const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const powerSlider = document.getElementById('powerSlider');
const spreadSlider = document.getElementById('spreadSlider');
const infoEl = document.getElementById('info');

let power = 5;
let spread = 5;
let particles = [];
let time = 0;
const gravity = 0.15;
const maxParticles = 500;

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        const angle = Math.random() * Math.PI * 2;
        const spreadFactor = spread * 0.1;

        this.x = 0;
        this.y = 0;
        this.z = 0;

        this.vx = Math.cos(angle) * spreadFactor * (0.5 + Math.random());
        this.vy = -(power * 0.8 + Math.random() * power * 0.4);
        this.vz = Math.sin(angle) * spreadFactor * (0.5 + Math.random());

        this.life = 1;
        this.decay = 0.008 + Math.random() * 0.005;

        // Color based on initial velocity
        this.hue = 180 + Math.random() * 60; // Cyan to blue
        this.size = 2 + Math.random() * 3;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        this.vy += gravity;
        this.life -= this.decay;

        // Water splash effect at bottom
        if (this.y > 100 && this.life > 0.2) {
            this.life = 0.2;
        }

        if (this.life <= 0) {
            this.reset();
        }
    }
}

function project(x, y, z, rotY) {
    const cosR = Math.cos(rotY);
    const sinR = Math.sin(rotY);

    const x1 = x * cosR - z * sinR;
    const z1 = x * sinR + z * cosR;

    const scale = 200 / (200 + z1);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height * 0.7 + y * scale,
        scale,
        z: z1
    };
}

function init() {
    for (let i = 0; i < maxParticles; i++) {
        const p = new Particle();
        p.life = Math.random(); // Stagger initial particles
        particles.push(p);
    }
}

function draw() {
    time += 0.016;

    // Clear with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a1628');
    gradient.addColorStop(1, '#1a2a4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rotY = Math.sin(time * 0.3) * 0.5;

    // Update and project particles
    const projected = particles.map(p => {
        p.update();
        const proj = project(p.x, p.y, p.z, rotY);
        return { ...p, ...proj };
    });

    // Sort by z for proper depth
    projected.sort((a, b) => b.z - a.z);

    // Draw water pool
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height * 0.85, 80, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 150, 200, 0.3)';
    ctx.fill();

    // Draw particles
    projected.forEach(p => {
        if (p.life <= 0) return;

        const alpha = p.life;
        const size = p.size * p.scale * p.life;

        // Main particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${alpha})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha * 0.3})`;
        ctx.fill();
    });

    // Draw fountain base
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height * 0.72, 15, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#445';
    ctx.fill();

    requestAnimationFrame(draw);
}

powerSlider.addEventListener('input', (e) => {
    power = parseInt(e.target.value);
    infoEl.textContent = `噴射力: ${power}`;
});

spreadSlider.addEventListener('input', (e) => {
    spread = parseInt(e.target.value);
    infoEl.textContent = `擴散度: ${spread}`;
});

init();
draw();
