const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let balls = [];
let ballCount = 5;
let gravity = 0.5;
let damping = 0.999;
let stringLength = 200;
let ballRadius = 25;

let draggingBall = null;
let pivotY = 100;

class PendulumBall {
    constructor(index, total) {
        this.index = index;
        this.radius = ballRadius;
        this.stringLength = stringLength;

        // Calculate pivot position
        const spacing = this.radius * 2.2;
        const totalWidth = (total - 1) * spacing;
        this.pivotX = width / 2 - totalWidth / 2 + index * spacing;
        this.pivotY = pivotY;

        // Pendulum physics
        this.angle = 0;
        this.angularVelocity = 0;
        this.mass = 1;

        this.updatePosition();
    }

    updatePosition() {
        this.x = this.pivotX + Math.sin(this.angle) * this.stringLength;
        this.y = this.pivotY + Math.cos(this.angle) * this.stringLength;
    }

    update() {
        // Pendulum equation of motion
        const angularAcceleration = -gravity / this.stringLength * Math.sin(this.angle);
        this.angularVelocity += angularAcceleration;
        this.angularVelocity *= damping;
        this.angle += this.angularVelocity;

        this.updatePosition();
    }

    draw() {
        // Draw string
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.pivotX, this.pivotY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        // Draw ball shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + 5, this.y + 10, this.radius, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw ball with metallic gradient
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x,
            this.y,
            this.radius
        );
        gradient.addColorStop(0, '#e8e0c8');
        gradient.addColorStop(0.3, '#c8b478');
        gradient.addColorStop(0.7, '#a89858');
        gradient.addColorStop(1, '#786828');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            this.radius * 0.3,
            this.radius * 0.2,
            -0.5,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Reflection line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
            this.x - this.radius * 0.2,
            this.y - this.radius * 0.2,
            this.radius * 0.5,
            -0.8,
            0.2
        );
        ctx.stroke();
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stringLength = Math.min(height * 0.35, 250);
    pivotY = height * 0.2;
    initBalls();
}

function initBalls() {
    balls = [];
    for (let i = 0; i < ballCount; i++) {
        balls.push(new PendulumBall(i, ballCount));
    }
}

function checkCollisions() {
    for (let i = 0; i < balls.length - 1; i++) {
        const ball1 = balls[i];
        const ball2 = balls[i + 1];

        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = ball1.radius + ball2.radius;

        if (dist < minDist && dist > 0) {
            // Elastic collision - transfer momentum
            const temp = ball1.angularVelocity;
            ball1.angularVelocity = ball2.angularVelocity * 0.99;
            ball2.angularVelocity = temp * 0.99;

            // Separate balls slightly
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            ball1.angle -= Math.asin(overlap * 0.5 / ball1.stringLength) * (nx > 0 ? 1 : -1);
            ball2.angle += Math.asin(overlap * 0.5 / ball2.stringLength) * (nx > 0 ? 1 : -1);
        }
    }
}

function drawFrame() {
    // Draw frame structure
    const frameWidth = ballCount * ballRadius * 2.5 + 80;
    const frameX = width / 2 - frameWidth / 2;

    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 8;

    // Top bar
    ctx.beginPath();
    ctx.moveTo(frameX, pivotY - 20);
    ctx.lineTo(frameX + frameWidth, pivotY - 20);
    ctx.stroke();

    // Side supports
    ctx.beginPath();
    ctx.moveTo(frameX + 20, pivotY - 20);
    ctx.lineTo(frameX, height * 0.75);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(frameX + frameWidth - 20, pivotY - 20);
    ctx.lineTo(frameX + frameWidth, height * 0.75);
    ctx.stroke();

    // Base
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(frameX - 20, height * 0.75);
    ctx.lineTo(frameX + frameWidth + 20, height * 0.75);
    ctx.stroke();

    // Frame gradient overlay
    const frameGradient = ctx.createLinearGradient(frameX, 0, frameX + frameWidth, 0);
    frameGradient.addColorStop(0, '#3a3a3a');
    frameGradient.addColorStop(0.5, '#5a5a5a');
    frameGradient.addColorStop(1, '#3a3a3a');
    ctx.strokeStyle = frameGradient;
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(frameX, pivotY - 20);
    ctx.lineTo(frameX + frameWidth, pivotY - 20);
    ctx.stroke();
}

function animate() {
    // Clear with gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(1, '#16213e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    drawFrame();

    // Update physics
    if (!draggingBall) {
        checkCollisions();
        for (const ball of balls) {
            ball.update();
        }
    }

    // Draw balls
    for (const ball of balls) {
        ball.draw();
    }

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (const ball of balls) {
        const dx = mouseX - ball.x;
        const dy = mouseY - ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < ball.radius) {
            draggingBall = ball;
            draggingBall.angularVelocity = 0;
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!draggingBall) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate angle from pivot to mouse
    const dx = mouseX - draggingBall.pivotX;
    const dy = mouseY - draggingBall.pivotY;

    draggingBall.angle = Math.atan2(dx, dy);

    // Limit swing angle
    const maxAngle = Math.PI / 3;
    draggingBall.angle = Math.max(-maxAngle, Math.min(maxAngle, draggingBall.angle));

    draggingBall.updatePosition();
});

canvas.addEventListener('mouseup', () => {
    draggingBall = null;
});

canvas.addEventListener('mouseleave', () => {
    draggingBall = null;
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    for (const ball of balls) {
        const dx = touchX - ball.x;
        const dy = touchY - ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < ball.radius * 1.5) {
            draggingBall = ball;
            draggingBall.angularVelocity = 0;
            break;
        }
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!draggingBall) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    const dx = touchX - draggingBall.pivotX;
    const dy = touchY - draggingBall.pivotY;

    draggingBall.angle = Math.atan2(dx, dy);

    const maxAngle = Math.PI / 3;
    draggingBall.angle = Math.max(-maxAngle, Math.min(maxAngle, draggingBall.angle));

    draggingBall.updatePosition();
});

canvas.addEventListener('touchend', () => {
    draggingBall = null;
});

// Control listeners
document.getElementById('ballCountSlider').addEventListener('input', (e) => {
    ballCount = parseInt(e.target.value);
    document.getElementById('ballCountValue').textContent = ballCount;
    initBalls();
});

document.getElementById('gravitySlider').addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = gravity.toFixed(2);
});

document.getElementById('dampingSlider').addEventListener('input', (e) => {
    damping = parseFloat(e.target.value);
    document.getElementById('dampingValue').textContent = damping.toFixed(3);
});

document.getElementById('resetBtn').addEventListener('click', () => {
    initBalls();
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
