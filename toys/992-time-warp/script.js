const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let time = 0;
let warpIntensity = 1;
let particles = [];
let trails = [];

class TimeParticle {
    constructor() {
        this.reset();
        this.history = [];
    }

    reset() {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 100 + 50;
        this.x = canvas.width / 2 + Math.cos(angle) * dist;
        this.y = canvas.height / 2 + Math.sin(angle) * dist;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 3 + 1;
        this.hue = Math.random() * 60 + 260;
        this.history = [];
    }

    update() {
        const dx = this.x - canvas.width / 2;
        const dy = this.y - canvas.height / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const warpForce = warpIntensity * 0.1;
        const spiralForce = Math.sin(time * 0.05) * warpForce;

        this.vx += Math.cos(angle + Math.PI / 2) * spiralForce - dx * 0.0001;
        this.vy += Math.sin(angle + Math.PI / 2) * spiralForce - dy * 0.0001;

        this.vx *= 0.99;
        this.vy *= 0.99;

        this.x += this.vx * (1 + Math.sin(time * 0.1) * warpIntensity * 0.5);
        this.y += this.vy * (1 + Math.cos(time * 0.1) * warpIntensity * 0.5);

        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > 30) this.history.shift();

        if (dist > 200 || dist < 10) this.reset();
    }

    draw() {
        if (this.history.length > 1) {
            ctx.beginPath();
            this.history.forEach((pos, i) => {
                if (i === 0) ctx.moveTo(pos.x, pos.y);
                else ctx.lineTo(pos.x, pos.y);
            });
            ctx.strokeStyle = `hsla(${this.hue}, 80%, 60%, 0.3)`;
            ctx.lineWidth = this.size;
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${this.hue}, 80%, 70%)`;
        ctx.fill();
    }
}

function init() {
    particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push(new TimeParticle());
    }
}

function drawClock() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const warpedTime = time * (1 + Math.sin(time * 0.01) * warpIntensity);

    ctx.strokeStyle = 'rgba(224, 64, 251, 0.3)';
    ctx.lineWidth = 2;

    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const warpAngle = angle + Math.sin(time * 0.02 + i) * warpIntensity * 0.2;
        const x1 = cx + Math.cos(warpAngle) * 110;
        const y1 = cy + Math.sin(warpAngle) * 110;
        const x2 = cx + Math.cos(warpAngle) * 130;
        const y2 = cy + Math.sin(warpAngle) * 130;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    const secondAngle = (warpedTime * 0.1) % (Math.PI * 2) - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(secondAngle) * 100, cy + Math.sin(secondAngle) * 100);
    ctx.strokeStyle = 'rgba(224, 64, 251, 0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const minuteAngle = (warpedTime * 0.01) % (Math.PI * 2) - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(minuteAngle) * 80, cy + Math.sin(minuteAngle) * 80);
    ctx.strokeStyle = 'rgba(224, 64, 251, 0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function draw() {
    ctx.fillStyle = 'rgba(10, 5, 21, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawClock();

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    const centerGlow = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 50
    );
    centerGlow.addColorStop(0, 'rgba(224, 64, 251, 0.3)');
    centerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = centerGlow;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.fill();

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('warpBtn').addEventListener('click', () => {
    warpIntensity = (warpIntensity % 3) + 1;
});

init();
animate();
