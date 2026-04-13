const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let balls = [];
const gravity = 0.3;
const friction = 0.99;
const bounce = 0.8;

const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6', '#1ABC9C'];

function addBall(x, y) {
    balls.push({
        x: x || Math.random() * canvas.width,
        y: y || 50,
        vx: (Math.random() - 0.5) * 5,
        vy: 0,
        radius: 10 + Math.random() * 15,
        color: colors[Math.floor(Math.random() * colors.length)]
    });
}

function updateBalls() {
    balls.forEach(ball => {
        ball.vy += gravity;
        ball.vx *= friction;
        ball.vy *= friction;

        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx *= -bounce;
        }
        if (ball.x + ball.radius > canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.vx *= -bounce;
        }
        if (ball.y + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
            ball.vy *= -bounce;
        }
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy *= -bounce;
        }
    });

    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const dx = balls[j].x - balls[i].x;
            const dy = balls[j].y - balls[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = balls[i].radius + balls[j].radius;

            if (dist < minDist) {
                const angle = Math.atan2(dy, dx);
                const overlap = minDist - dist;

                balls[i].x -= Math.cos(angle) * overlap / 2;
                balls[i].y -= Math.sin(angle) * overlap / 2;
                balls[j].x += Math.cos(angle) * overlap / 2;
                balls[j].y += Math.sin(angle) * overlap / 2;

                const v1 = { x: balls[i].vx, y: balls[i].vy };
                const v2 = { x: balls[j].vx, y: balls[j].vy };

                balls[i].vx = v2.x * bounce;
                balls[i].vy = v2.y * bounce;
                balls[j].vx = v1.x * bounce;
                balls[j].vy = v1.y * bounce;
            }
        }
    }

    if (balls.length > 30) balls = balls.slice(-25);
}

function drawBackground() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

function drawBalls() {
    balls.forEach(ball => {
        const gradient = ctx.createRadialGradient(
            ball.x - ball.radius * 0.3,
            ball.y - ball.radius * 0.3,
            0,
            ball.x,
            ball.y,
            ball.radius
        );
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.3, ball.color);
        gradient.addColorStop(1, ball.color + '80');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = ball.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`球數: ${balls.length}`, 20, 28);
}

function animate() {
    updateBalls();
    drawBackground();
    drawBalls();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    addBall(x, y);
});

document.getElementById('addBtn').addEventListener('click', () => addBall());

for (let i = 0; i < 5; i++) addBall();
animate();
