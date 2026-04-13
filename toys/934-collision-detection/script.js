const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let balls = [];
let time = 0;

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15 + Math.random() * 15;
        this.mass = this.radius;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.hue = Math.random() * 360;
        this.colliding = false;
    }

    update() {
        this.vy += 0.2;
        this.x += this.vx;
        this.y += this.vy;

        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -0.9;
        }
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx *= -0.9;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -0.9;
        }
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.vy *= -0.9;
        }

        this.colliding = false;
    }

    draw() {
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, this.radius
        );

        const lightness = this.colliding ? 70 : 50;
        gradient.addColorStop(0, `hsl(${this.hue}, 80%, ${lightness + 20}%)`);
        gradient.addColorStop(1, `hsl(${this.hue}, 80%, ${lightness}%)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        if (this.colliding) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}

function init() {
    balls = [];
    for (let i = 0; i < 5; i++) {
        addBall();
    }
}

function addBall() {
    if (balls.length >= 15) return;
    const x = 50 + Math.random() * (canvas.width - 100);
    const y = 50 + Math.random() * (canvas.height - 100);
    balls.push(new Ball(x, y));
}

function checkCollisions() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const b1 = balls[i];
            const b2 = balls[j];

            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDist = b1.radius + b2.radius;

            if (distance < minDist) {
                b1.colliding = true;
                b2.colliding = true;

                const overlap = minDist - distance;
                const nx = dx / distance;
                const ny = dy / distance;

                b1.x -= nx * overlap / 2;
                b1.y -= ny * overlap / 2;
                b2.x += nx * overlap / 2;
                b2.y += ny * overlap / 2;

                const dvx = b1.vx - b2.vx;
                const dvy = b1.vy - b2.vy;
                const dvn = dvx * nx + dvy * ny;

                if (dvn > 0) {
                    const m1 = b1.mass;
                    const m2 = b2.mass;
                    const restitution = 0.9;

                    const impulse = (2 * dvn * restitution) / (m1 + m2);

                    b1.vx -= impulse * m2 * nx;
                    b1.vy -= impulse * m2 * ny;
                    b2.vx += impulse * m1 * nx;
                    b2.vy += impulse * m1 * ny;
                }
            }
        }
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#FF5722';
    ctx.font = '11px Arial';
    ctx.fillText(`球數: ${balls.length}`, 20, 28);
}

function animate() {
    time++;
    ctx.fillStyle = '#0a0a1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    balls.forEach(b => b.update());
    checkCollisions();
    balls.forEach(b => b.draw());
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('addBtn').addEventListener('click', addBall);

init();
animate();
