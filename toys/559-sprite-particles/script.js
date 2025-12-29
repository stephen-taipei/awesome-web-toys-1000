const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spriteSelect = document.getElementById('spriteSelect');
const countSlider = document.getElementById('countSlider');
const infoEl = document.getElementById('info');

let spriteType = 'star';
let particleCount = 50;
let particles = [];
let time = 0;

// Sprite drawing functions
function drawStar(x, y, size, rotation, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;

    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;

    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
}

function drawHeart(x, y, size, rotation, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size / 20, size / 20);
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(-10, -10, -20, 0, 0, 20);
    ctx.bezierCurveTo(20, 0, 10, -10, 0, 5);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
}

function drawSnowflake(x, y, size, rotation, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;

    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.15;
    ctx.lineCap = 'round';

    for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 3);

        // Main branch
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -size);
        ctx.stroke();

        // Side branches
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.4);
        ctx.lineTo(-size * 0.3, -size * 0.6);
        ctx.moveTo(0, -size * 0.4);
        ctx.lineTo(size * 0.3, -size * 0.6);
        ctx.stroke();

        ctx.restore();
    }

    ctx.restore();
}

function drawSpark(x, y, size, rotation, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Cross flare
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.2;
    ctx.beginPath();
    ctx.moveTo(-size * 1.5, 0);
    ctx.lineTo(size * 1.5, 0);
    ctx.moveTo(0, -size * 1.5);
    ctx.lineTo(0, size * 1.5);
    ctx.stroke();

    ctx.restore();
}

function drawSprite(type, x, y, size, rotation, color, alpha) {
    switch (type) {
        case 'star': drawStar(x, y, size, rotation, color, alpha); break;
        case 'heart': drawHeart(x, y, size, rotation, color, alpha); break;
        case 'snowflake': drawSnowflake(x, y, size, rotation, color, alpha); break;
        case 'spark': drawSpark(x, y, size, rotation, color, alpha); break;
    }
}

class SpriteParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = (Math.random() - 0.5) * 200;
        this.y = (Math.random() - 0.5) * 200;
        this.z = (Math.random() - 0.5) * 200;

        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -1 - Math.random();
        this.vz = (Math.random() - 0.5) * 0.5;

        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;

        this.size = 10 + Math.random() * 15;
        this.hue = Math.random() * 60 + 30; // Yellow to orange

        this.life = 1;
        this.decay = 0.005 + Math.random() * 0.005;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        this.rotation += this.rotationSpeed;
        this.life -= this.decay;

        if (this.life <= 0 || this.y < -150) {
            this.reset();
            this.y = 100;
        }
    }
}

function init() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        const p = new SpriteParticle();
        p.life = Math.random();
        particles.push(p);
    }
}

function project(x, y, z, rotY) {
    const cosR = Math.cos(rotY);
    const sinR = Math.sin(rotY);

    const x1 = x * cosR - z * sinR;
    const z1 = x * sinR + z * cosR;

    const scale = 300 / (300 + z1);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 + y * scale,
        scale,
        z: z1
    };
}

function draw() {
    time += 0.016;

    // Clear with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a0a2e');
    gradient.addColorStop(1, '#0a1a3e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rotY = time * 0.2;

    // Update and project
    const projected = particles.map(p => {
        p.update();
        const proj = project(p.x, p.y, p.z, rotY);
        return { ...p, ...proj };
    });

    // Sort by depth
    projected.sort((a, b) => b.z - a.z);

    // Draw sprites
    projected.forEach(p => {
        const size = p.size * p.scale;
        const alpha = p.life * p.scale;
        const color = `hsl(${p.hue}, 80%, 60%)`;

        drawSprite(spriteType, p.x, p.y, size, p.rotation, color, alpha);
    });

    requestAnimationFrame(draw);
}

spriteSelect.addEventListener('change', (e) => {
    spriteType = e.target.value;
    const names = { star: '星星', heart: '愛心', snowflake: '雪花', spark: '火花' };
    infoEl.textContent = `精靈: ${names[spriteType]}`;
});

countSlider.addEventListener('input', (e) => {
    particleCount = parseInt(e.target.value);
    init();
    infoEl.textContent = `數量: ${particleCount}`;
});

init();
draw();
