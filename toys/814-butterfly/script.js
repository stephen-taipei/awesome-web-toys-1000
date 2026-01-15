const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let butterflies = [];

class Butterfly {
    constructor(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.wingPhase = Math.random() * Math.PI * 2;
        this.wingSpeed = 0.2 + Math.random() * 0.1;
        this.size = 15 + Math.random() * 10;
        this.hue = Math.random() * 360;
        this.targetX = Math.random() * canvas.width;
        this.targetY = Math.random() * canvas.height;
    }

    update() {
        if (Math.random() < 0.02) {
            this.targetX = Math.random() * canvas.width;
            this.targetY = Math.random() * canvas.height;
        }

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.vx += dx * 0.001;
        this.vy += dy * 0.001;

        this.vx *= 0.98;
        this.vy *= 0.98;

        this.x += this.vx;
        this.y += this.vy;

        this.wingPhase += this.wingSpeed;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        const wingAngle = Math.sin(this.wingPhase) * 0.8;
        const angle = Math.atan2(this.vy, this.vx);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        const wingScale = Math.abs(Math.cos(this.wingPhase));

        ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, 0.9)`;

        ctx.save();
        ctx.scale(1, wingScale);
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.3, -this.size * 0.5, this.size * 0.6, this.size * 0.4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.scale(1, wingScale);
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.3, this.size * 0.5, this.size * 0.6, this.size * 0.4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = `hsla(${this.hue + 30}, 60%, 50%, 0.9)`;
        ctx.save();
        ctx.scale(1, wingScale);
        ctx.beginPath();
        ctx.ellipse(this.size * 0.2, -this.size * 0.3, this.size * 0.4, this.size * 0.25, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(this.size * 0.2, this.size * 0.3, this.size * 0.4, this.size * 0.25, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.15, this.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.size * 0.3, 0);
        ctx.quadraticCurveTo(this.size * 0.5, -this.size * 0.3, this.size * 0.6, -this.size * 0.4);
        ctx.moveTo(this.size * 0.3, 0);
        ctx.quadraticCurveTo(this.size * 0.5, this.size * 0.3, this.size * 0.6, this.size * 0.4);
        ctx.stroke();

        ctx.restore();
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 5; i++) {
        const x = 50 + i * 80;
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.ellipse(x, canvas.height - 20, 30, 15, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate() {
    drawBackground();

    butterflies.forEach(b => {
        b.update();
        b.draw();
    });

    requestAnimationFrame(animate);
}

document.getElementById('addBtn').addEventListener('click', () => {
    butterflies.push(new Butterfly());
});

for (let i = 0; i < 5; i++) {
    butterflies.push(new Butterfly());
}

animate();
