const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const anchor = { x: canvas.width / 2, y: 50 };
const ball = { x: canvas.width / 2, y: 180, vx: 0, vy: 0, radius: 20 };
const spring = { stiffness: 0.03, damping: 0.95, restLength: 100 };

let isDragging = false;
let time = 0;

function reset() {
    ball.x = canvas.width / 2;
    ball.y = 180;
    ball.vx = 0;
    ball.vy = 0;
}

function updatePhysics() {
    if (isDragging) return;

    const dx = ball.x - anchor.x;
    const dy = ball.y - anchor.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const stretch = distance - spring.restLength;

    const fx = -(dx / distance) * stretch * spring.stiffness;
    const fy = -(dy / distance) * stretch * spring.stiffness;

    ball.vx += fx;
    ball.vy += fy + 0.5;

    ball.vx *= spring.damping;
    ball.vy *= spring.damping;

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x < ball.radius) { ball.x = ball.radius; ball.vx *= -0.5; }
    if (ball.x > canvas.width - ball.radius) { ball.x = canvas.width - ball.radius; ball.vx *= -0.5; }
    if (ball.y < ball.radius) { ball.y = ball.radius; ball.vy *= -0.5; }
    if (ball.y > canvas.height - ball.radius) { ball.y = canvas.height - ball.radius; ball.vy *= -0.5; }
}

function drawSpring() {
    const segments = 20;
    const amplitude = 10;
    const dx = ball.x - anchor.x;
    const dy = ball.y - anchor.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(anchor.x, anchor.y);

    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const x = anchor.x + dx * t;
        const y = anchor.y + dy * t;
        const offset = Math.sin(i * Math.PI) * amplitude * (1 - Math.abs(t - 0.5) * 2);
        const perpX = -Math.sin(angle) * offset * (i % 2 === 0 ? 1 : -1);
        const perpY = Math.cos(angle) * offset * (i % 2 === 0 ? 1 : -1);

        ctx.lineTo(x + perpX, y + perpY);
    }

    ctx.lineTo(ball.x, ball.y);
    ctx.stroke();
}

function drawAnchor() {
    ctx.fillStyle = '#666';
    ctx.fillRect(anchor.x - 30, anchor.y - 10, 60, 15);

    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(anchor.x, anchor.y, 8, 0, Math.PI * 2);
    ctx.fill();
}

function drawBall() {
    const gradient = ctx.createRadialGradient(
        ball.x - 5, ball.y - 5, 0,
        ball.x, ball.y, ball.radius
    );
    gradient.addColorStop(0, '#6FCF70');
    gradient.addColorStop(1, '#2E7D32');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1B5E20';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawInfo() {
    const dx = ball.x - anchor.x;
    const dy = ball.y - anchor.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const stretch = distance - spring.restLength;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 50);

    ctx.fillStyle = '#4CAF50';
    ctx.font = '11px Arial';
    ctx.fillText(`伸展: ${stretch.toFixed(1)}px`, 20, 28);
    ctx.fillText(`速度: ${Math.sqrt(ball.vx*ball.vx + ball.vy*ball.vy).toFixed(1)}`, 20, 45);
}

function animate() {
    time++;
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updatePhysics();
    drawAnchor();
    drawSpring();
    drawBall();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const dx = x - ball.x;
    const dy = y - ball.y;

    if (dx * dx + dy * dy < ball.radius * ball.radius) {
        isDragging = true;
        canvas.style.cursor = 'grabbing';
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    ball.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    ball.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    ball.vx = 0;
    ball.vy = 0;
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
});

document.getElementById('resetBtn').addEventListener('click', reset);

animate();
