const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 450;
let balls = [];
let gravity = 0.3;
let gravityModes = [
    { name: '正常', value: 0.3 },
    { name: '低重力', value: 0.1 },
    { name: '高重力', value: 0.6 },
    { name: '無重力', value: 0 },
    { name: '反重力', value: -0.2 }
];
let currentGravity = 0;

function init() {
    setupCanvas();
    canvas.addEventListener('click', addBall);
    canvas.addEventListener('touchstart', handleTouch);
    document.getElementById('clearBtn').addEventListener('click', clearBalls);
    document.getElementById('gravityBtn').addEventListener('click', toggleGravity);
    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.25;
    canvas.width = width;
    canvas.height = height;
}

function addBall(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    createBall(x, y);
}

function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.touches[0].clientX - rect.left) * scaleX;
    const y = (e.touches[0].clientY - rect.top) * scaleY;

    createBall(x, y);
}

function createBall(x, y) {
    const radius = 15 + Math.random() * 20;
    balls.push({
        x: x,
        y: y,
        radius: radius,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 4,
        color: 'hsl(' + Math.random() * 360 + ', 70%, 55%)',
        bounce: 0.7 + Math.random() * 0.2
    });
    updateCount();
}

function clearBalls() {
    balls = [];
    updateCount();
}

function toggleGravity() {
    currentGravity = (currentGravity + 1) % gravityModes.length;
    gravity = gravityModes[currentGravity].value;
    document.getElementById('gravity').textContent = gravityModes[currentGravity].name;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    balls.forEach(ball => {
        ball.vy += gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        ball.vx *= 0.999;

        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx = -ball.vx * ball.bounce;
        }
        if (ball.x + ball.radius > width) {
            ball.x = width - ball.radius;
            ball.vx = -ball.vx * ball.bounce;
        }

        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy = -ball.vy * ball.bounce;
        }
        if (ball.y + ball.radius > height) {
            ball.y = height - ball.radius;
            ball.vy = -ball.vy * ball.bounce;

            if (Math.abs(ball.vy) < 0.5) {
                ball.vy = 0;
            }
        }
    });

    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            collide(balls[i], balls[j]);
        }
    }
}

function collide(b1, b2) {
    const dx = b2.x - b1.x;
    const dy = b2.y - b1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = b1.radius + b2.radius;

    if (dist < minDist) {
        const angle = Math.atan2(dy, dx);
        const overlap = minDist - dist;

        b1.x -= Math.cos(angle) * overlap * 0.5;
        b1.y -= Math.sin(angle) * overlap * 0.5;
        b2.x += Math.cos(angle) * overlap * 0.5;
        b2.y += Math.sin(angle) * overlap * 0.5;

        const v1 = Math.sqrt(b1.vx * b1.vx + b1.vy * b1.vy);
        const v2 = Math.sqrt(b2.vx * b2.vx + b2.vy * b2.vy);
        const d1 = Math.atan2(b1.vy, b1.vx);
        const d2 = Math.atan2(b2.vy, b2.vx);

        const vx1 = v1 * Math.cos(d1 - angle);
        const vy1 = v1 * Math.sin(d1 - angle);
        const vx2 = v2 * Math.cos(d2 - angle);
        const vy2 = v2 * Math.sin(d2 - angle);

        const m1 = b1.radius * b1.radius;
        const m2 = b2.radius * b2.radius;

        const fx1 = (vx1 * (m1 - m2) + 2 * m2 * vx2) / (m1 + m2);
        const fx2 = (vx2 * (m2 - m1) + 2 * m1 * vx1) / (m1 + m2);

        b1.vx = Math.cos(angle) * fx1 + Math.cos(angle + Math.PI/2) * vy1;
        b1.vy = Math.sin(angle) * fx1 + Math.sin(angle + Math.PI/2) * vy1;
        b2.vx = Math.cos(angle) * fx2 + Math.cos(angle + Math.PI/2) * vy2;
        b2.vy = Math.sin(angle) * fx2 + Math.sin(angle + Math.PI/2) * vy2;

        b1.vx *= 0.95;
        b1.vy *= 0.95;
        b2.vx *= 0.95;
        b2.vy *= 0.95;
    }
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    balls.forEach(ball => {
        const gradient = ctx.createRadialGradient(
            ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0,
            ball.x, ball.y, ball.radius
        );
        gradient.addColorStop(0, 'rgba(255,255,255,0.3)');
        gradient.addColorStop(0.5, ball.color);
        gradient.addColorStop(1, ball.color);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateCount() {
    document.getElementById('count').textContent = balls.length;
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
