const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let time = 0;
let dimension = 0;
const dimensions = [
    { name: '虛空', colors: ['#7C4DFF', '#B388FF', '#E040FB'] },
    { name: '火焰', colors: ['#FF5722', '#FF9800', '#FFEB3B'] },
    { name: '深淵', colors: ['#1A237E', '#283593', '#3F51B5'] },
    { name: '自然', colors: ['#1B5E20', '#4CAF50', '#8BC34A'] },
    { name: '虹光', colors: ['#E91E63', '#9C27B0', '#2196F3'] }
];

let particles = [];
let portalRings = [];

class PortalParticle {
    constructor() {
        this.reset();
    }

    reset() {
        const angle = Math.random() * Math.PI * 2;
        this.angle = angle;
        this.dist = 150;
        this.speed = Math.random() * 2 + 1;
        this.size = Math.random() * 3 + 1;
        this.colorIndex = Math.floor(Math.random() * 3);
    }

    update() {
        this.dist -= this.speed;
        this.angle += 0.02;

        if (this.dist < 20) {
            this.reset();
        }
    }

    draw() {
        const x = canvas.width / 2 + Math.cos(this.angle) * this.dist;
        const y = canvas.height / 2 + Math.sin(this.angle) * this.dist;

        const alpha = 1 - (150 - this.dist) / 130;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = dimensions[dimension].colors[this.colorIndex] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
    }
}

class PortalRing {
    constructor(radius) {
        this.radius = radius;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.02 + 0.01;
    }

    draw() {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const wobble = Math.sin(time * 0.05 + this.phase) * 10;

        ctx.beginPath();
        ctx.ellipse(cx, cy, this.radius + wobble, this.radius * 0.8, time * this.speed, 0, Math.PI * 2);
        ctx.strokeStyle = dimensions[dimension].colors[1] + '60';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function init() {
    particles = [];
    for (let i = 0; i < 150; i++) {
        const p = new PortalParticle();
        p.dist = Math.random() * 130 + 20;
        particles.push(p);
    }

    portalRings = [];
    for (let i = 1; i <= 5; i++) {
        portalRings.push(new PortalRing(i * 25));
    }
}

function draw() {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const outerGlow = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 50,
        canvas.width / 2, canvas.height / 2, 150
    );
    outerGlow.addColorStop(0, dimensions[dimension].colors[0] + '40');
    outerGlow.addColorStop(0.5, dimensions[dimension].colors[1] + '20');
    outerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    portalRings.forEach(ring => ring.draw());

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    const innerGlow = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 40
    );
    innerGlow.addColorStop(0, '#fff');
    innerGlow.addColorStop(0.3, dimensions[dimension].colors[2]);
    innerGlow.addColorStop(0.7, dimensions[dimension].colors[0] + '80');
    innerGlow.addColorStop(1, 'transparent');

    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(dimensions[dimension].name, canvas.width / 2, 25);

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('portalBtn').addEventListener('click', () => {
    dimension = (dimension + 1) % dimensions.length;
});

init();
animate();
