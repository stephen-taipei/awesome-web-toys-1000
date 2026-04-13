const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const numBalls = 5;
const ballRadius = 20;
const stringLength = 150;
const anchorY = 30;
const spacing = ballRadius * 2 + 2;
const startX = (canvas.width - (numBalls - 1) * spacing) / 2;

let balls = [];
let time = 0;
let isAnimating = false;

class PendulumBall {
    constructor(index) {
        this.index = index;
        this.anchorX = startX + index * spacing;
        this.angle = 0;
        this.angularVelocity = 0;
        this.x = this.anchorX;
        this.y = anchorY + stringLength;
    }

    update() {
        const gravity = 0.001;
        const damping = 0.999;

        this.angularVelocity -= gravity * Math.sin(this.angle);
        this.angularVelocity *= damping;
        this.angle += this.angularVelocity;

        this.x = this.anchorX + Math.sin(this.angle) * stringLength;
        this.y = anchorY + Math.cos(this.angle) * stringLength;
    }

    draw() {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.anchorX, anchorY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        const gradient = ctx.createRadialGradient(
            this.x - 5, this.y - 5, 0,
            this.x, this.y, ballRadius
        );
        gradient.addColorStop(0, '#CE93D8');
        gradient.addColorStop(1, '#6A1B9A');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, ballRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#4A148C';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function init() {
    balls = [];
    for (let i = 0; i < numBalls; i++) {
        balls.push(new PendulumBall(i));
    }
}

function startAnimation() {
    balls[0].angle = -0.5;
    balls[0].angularVelocity = 0;
    isAnimating = true;
}

function checkCollisions() {
    for (let i = 0; i < balls.length - 1; i++) {
        const b1 = balls[i];
        const b2 = balls[i + 1];

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ballRadius * 2) {
            const temp = b1.angularVelocity;
            b1.angularVelocity = b2.angularVelocity * 0.99;
            b2.angularVelocity = temp * 0.99;

            const overlap = ballRadius * 2 - distance;
            if (b1.angle < b2.angle) {
                b1.angle -= overlap * 0.01;
                b2.angle += overlap * 0.01;
            } else {
                b1.angle += overlap * 0.01;
                b2.angle -= overlap * 0.01;
            }
        }
    }
}

function drawFrame() {
    ctx.fillStyle = '#555';
    ctx.fillRect(startX - 40, anchorY - 15, (numBalls - 1) * spacing + 80, 20);

    ctx.fillStyle = '#777';
    ctx.fillRect(startX - 50, anchorY - 20, 15, 25);
    ctx.fillRect(startX + (numBalls - 1) * spacing + 35, anchorY - 20, 15, 25);

    balls.forEach(b => {
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(b.anchorX, anchorY, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 50);

    ctx.fillStyle = '#9C27B0';
    ctx.font = '11px Arial';
    ctx.fillText('牛頓擺', 20, 28);
    ctx.fillText(`動量守恆演示`, 20, 45);
}

function animate() {
    time++;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawFrame();

    if (isAnimating) {
        balls.forEach(b => b.update());
        checkCollisions();
    }

    balls.forEach(b => b.draw());
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('startBtn').addEventListener('click', () => {
    init();
    startAnimation();
});

init();
animate();
