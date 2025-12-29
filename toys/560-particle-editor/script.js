const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const rateSlider = document.getElementById('rateSlider');
const lifeSlider = document.getElementById('lifeSlider');
const speedSlider = document.getElementById('speedSlider');
const sizeSlider = document.getElementById('sizeSlider');
const gravitySlider = document.getElementById('gravitySlider');
const colorPicker = document.getElementById('colorPicker');
const infoEl = document.getElementById('info');

// Particle system settings
let settings = {
    emissionRate: 10,
    lifetime: 5,
    speed: 5,
    size: 5,
    gravity: 3,
    color: { r: 255, g: 107, b: 107 }
};

let particles = [];
let time = 0;
const maxParticles = 500;

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
}

class EditorParticle {
    constructor() {
        const angle = Math.random() * Math.PI * 2;
        const spreadAngle = Math.random() * Math.PI * 0.3;
        const speed = settings.speed * (0.5 + Math.random());

        this.x = 0;
        this.y = 50;
        this.z = 0;

        this.vx = Math.cos(angle) * Math.sin(spreadAngle) * speed;
        this.vy = -Math.cos(spreadAngle) * speed;
        this.vz = Math.sin(angle) * Math.sin(spreadAngle) * speed;

        this.size = settings.size * (0.5 + Math.random());
        this.life = 1;
        this.maxLife = settings.lifetime * (0.8 + Math.random() * 0.4);
        this.decay = 1 / (this.maxLife * 60);

        // Slight color variation
        this.r = Math.min(255, settings.color.r + (Math.random() - 0.5) * 30);
        this.g = Math.min(255, settings.color.g + (Math.random() - 0.5) * 30);
        this.b = Math.min(255, settings.color.b + (Math.random() - 0.5) * 30);
    }

    update() {
        this.vy += settings.gravity * 0.02;

        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        this.life -= this.decay;

        return this.life > 0;
    }
}

function emit() {
    const count = Math.floor(settings.emissionRate / 5) + 1;
    for (let i = 0; i < count && particles.length < maxParticles; i++) {
        particles.push(new EditorParticle());
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
        y: canvas.height / 2 + y * scale,
        scale,
        z: z1
    };
}

function draw() {
    time += 0.016;

    // Clear
    ctx.fillStyle = 'rgba(10, 10, 21, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Emit new particles
    emit();

    // Update particles
    particles = particles.filter(p => p.update());

    const rotY = time * 0.3;

    // Project and sort
    const projected = particles.map(p => ({
        ...p,
        ...project(p.x, p.y, p.z, rotY)
    }));
    projected.sort((a, b) => b.z - a.z);

    // Draw particles
    projected.forEach(p => {
        const size = p.size * p.scale * (0.5 + p.life * 0.5);
        const alpha = p.life * p.scale;

        // Glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
        gradient.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(${p.r}, ${p.g}, ${p.b}, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, size * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.fill();
    });

    // Draw emitter
    const emitterProj = project(0, 50, 0, rotY);
    ctx.beginPath();
    ctx.arc(emitterProj.x, emitterProj.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#888';
    ctx.fill();

    // Stats
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText(`粒子: ${particles.length}`, 10, 15);

    requestAnimationFrame(draw);
}

function updateInfo() {
    infoEl.textContent = `發射: ${settings.emissionRate} | 生命: ${settings.lifetime}s | 速度: ${settings.speed}`;
}

rateSlider.addEventListener('input', (e) => {
    settings.emissionRate = parseInt(e.target.value);
    updateInfo();
});

lifeSlider.addEventListener('input', (e) => {
    settings.lifetime = parseInt(e.target.value);
    updateInfo();
});

speedSlider.addEventListener('input', (e) => {
    settings.speed = parseInt(e.target.value);
    updateInfo();
});

sizeSlider.addEventListener('input', (e) => {
    settings.size = parseInt(e.target.value);
});

gravitySlider.addEventListener('input', (e) => {
    settings.gravity = parseInt(e.target.value);
});

colorPicker.addEventListener('input', (e) => {
    settings.color = hexToRgb(e.target.value);
});

updateInfo();
draw();
