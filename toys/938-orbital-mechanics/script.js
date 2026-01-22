const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const sun = { x: canvas.width / 2, y: canvas.height / 2, radius: 25, mass: 1000 };
let satellites = [];
let time = 0;

class Satellite {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 5;
        this.trail = [];
        this.hue = Math.random() * 360;
        this.alive = true;
    }

    update() {
        const dx = sun.x - this.x;
        const dy = sun.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < sun.radius + this.radius) {
            this.alive = false;
            return;
        }

        const force = sun.mass / (distance * distance);
        const ax = (dx / distance) * force * 0.01;
        const ay = (dy / distance) * force * 0.01;

        this.vx += ax;
        this.vy += ay;

        this.x += this.vx;
        this.y += this.vy;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 100) this.trail.shift();

        if (this.x < -50 || this.x > canvas.width + 50 ||
            this.y < -50 || this.y > canvas.height + 50) {
            this.alive = false;
        }
    }

    draw() {
        ctx.strokeStyle = `hsla(${this.hue}, 80%, 60%, 0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        this.trail.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        ctx.fillStyle = `hsl(${this.hue}, 80%, 60%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsl(${this.hue}, 80%, 80%)`;
        ctx.beginPath();
        ctx.arc(this.x - 1, this.y - 1, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    satellites = [];

    satellites.push(new Satellite(
        sun.x + 80, sun.y,
        0, 2.5
    ));

    satellites.push(new Satellite(
        sun.x, sun.y - 120,
        2, 0
    ));
}

function drawSun() {
    const gradient = ctx.createRadialGradient(
        sun.x, sun.y, 0,
        sun.x, sun.y, sun.radius * 2
    );
    gradient.addColorStop(0, '#FFD54F');
    gradient.addColorStop(0.5, '#FF9800');
    gradient.addColorStop(1, 'rgba(255, 152, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    const coreGradient = ctx.createRadialGradient(
        sun.x - 5, sun.y - 5, 0,
        sun.x, sun.y, sun.radius
    );
    coreGradient.addColorStop(0, '#FFF9C4');
    coreGradient.addColorStop(1, '#FF9800');

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawStars() {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 73) % canvas.width;
        const y = (i * 47) % canvas.height;
        const size = (i % 3) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#2196F3';
    ctx.font = '11px Arial';
    ctx.fillText(`衛星: ${satellites.filter(s => s.alive).length}`, 20, 28);
}

function animate() {
    time++;
    ctx.fillStyle = '#000010';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawSun();

    satellites = satellites.filter(s => s.alive);
    satellites.forEach(s => {
        s.update();
        s.draw();
    });

    drawInfo();

    requestAnimationFrame(animate);
}

let dragStart = null;

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    dragStart = {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
});

canvas.addEventListener('mouseup', (e) => {
    if (!dragStart) return;

    const rect = canvas.getBoundingClientRect();
    const endX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const endY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const vx = (endX - dragStart.x) * 0.05;
    const vy = (endY - dragStart.y) * 0.05;

    if (satellites.length < 10) {
        satellites.push(new Satellite(dragStart.x, dragStart.y, vx, vy));
    }

    dragStart = null;
});

document.getElementById('resetBtn').addEventListener('click', init);

init();
animate();
