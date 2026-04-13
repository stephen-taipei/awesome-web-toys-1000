const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const cannon = { x: 40, y: canvas.height - 40, angle: -45, power: 12 };
let projectiles = [];
let trails = [];
let time = 0;

class Projectile {
    constructor() {
        const rad = cannon.angle * Math.PI / 180;
        this.x = cannon.x + Math.cos(rad) * 30;
        this.y = cannon.y + Math.sin(rad) * 30;
        this.vx = Math.cos(rad) * cannon.power;
        this.vy = Math.sin(rad) * cannon.power;
        this.radius = 8;
        this.trail = [];
        this.active = true;
    }

    update() {
        if (!this.active) return;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 50) this.trail.shift();

        this.vy += 0.3;
        this.x += this.vx;
        this.y += this.vy;

        if (this.y > canvas.height - 20) {
            this.y = canvas.height - 20;
            this.vy *= -0.5;
            this.vx *= 0.8;
            if (Math.abs(this.vy) < 0.5) {
                this.active = false;
            }
        }

        if (this.x > canvas.width + 20 || this.x < -20) {
            this.active = false;
        }
    }

    draw() {
        ctx.strokeStyle = 'rgba(0, 188, 212, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.trail.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        const gradient = ctx.createRadialGradient(
            this.x - 2, this.y - 2, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#80DEEA');
        gradient.addColorStop(1, '#00838F');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function fire() {
    projectiles.push(new Projectile());
    if (projectiles.length > 10) {
        projectiles = projectiles.filter(p => p.active);
    }
}

function drawCannon() {
    const rad = cannon.angle * Math.PI / 180;

    ctx.fillStyle = '#455A64';
    ctx.beginPath();
    ctx.arc(cannon.x, cannon.y, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cannon.x, cannon.y);
    ctx.rotate(rad);

    ctx.fillStyle = '#607D8B';
    ctx.fillRect(0, -8, 40, 16);
    ctx.fillStyle = '#78909C';
    ctx.fillRect(30, -10, 15, 20);

    ctx.restore();

    ctx.fillStyle = '#37474F';
    ctx.fillRect(cannon.x - 30, cannon.y + 10, 60, 15);
}

function drawGround() {
    ctx.fillStyle = '#1B5E20';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    ctx.fillStyle = '#2E7D32';
    for (let x = 0; x < canvas.width; x += 20) {
        ctx.fillRect(x, canvas.height - 20, 10, 5);
    }
}

function drawAimLine() {
    const rad = cannon.angle * Math.PI / 180;
    const length = 80;

    ctx.strokeStyle = 'rgba(0, 188, 212, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cannon.x, cannon.y);
    ctx.lineTo(
        cannon.x + Math.cos(rad) * length,
        cannon.y + Math.sin(rad) * length
    );
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 50);

    ctx.fillStyle = '#00BCD4';
    ctx.font = '11px Arial';
    ctx.fillText(`角度: ${(-cannon.angle).toFixed(0)}°`, 20, 28);
    ctx.fillText(`力道: ${cannon.power.toFixed(1)}`, 20, 45);
}

function animate() {
    time++;
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGround();
    drawAimLine();
    drawCannon();

    projectiles.forEach(p => {
        p.update();
        p.draw();
    });

    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    const dx = mx - cannon.x;
    const dy = my - cannon.y;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;

    angle = Math.max(-80, Math.min(0, angle));
    cannon.angle = angle;

    const dist = Math.sqrt(dx * dx + dy * dy);
    cannon.power = Math.min(20, Math.max(5, dist / 15));
});

document.getElementById('fireBtn').addEventListener('click', fire);

canvas.addEventListener('click', fire);

animate();
