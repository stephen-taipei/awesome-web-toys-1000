const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultEl = document.getElementById('result');
const levelEl = document.getElementById('level');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

let level = 1;
let ball = { x: 180, y: 200, vx: 0, vy: 0, radius: 15 };
let target = { x: 300, y: 200, radius: 25 };
let platforms = [];
let tilt = 0;
let gameOver = false;

const gravity = 0.3;
const friction = 0.98;

function initLevel() {
    gameOver = false;
    tilt = 0;
    ball = { x: 60, y: 100, vx: 0, vy: 0, radius: 15 };
    resultEl.textContent = '傾斜平台讓球滾到目標!';

    if (level === 1) {
        target = { x: 300, y: 320, radius: 25 };
        platforms = [
            { x: 30, y: 150, width: 300, height: 15 },
            { x: 60, y: 250, width: 280, height: 15 },
            { x: 30, y: 350, width: 300, height: 15 }
        ];
    } else if (level === 2) {
        target = { x: 60, y: 320, radius: 25 };
        platforms = [
            { x: 30, y: 130, width: 200, height: 15 },
            { x: 130, y: 220, width: 200, height: 15 },
            { x: 30, y: 310, width: 200, height: 15 }
        ];
        ball.x = 300;
    } else {
        target = { x: 180, y: 350, radius: 25 };
        platforms = [
            { x: 50, y: 120, width: 120, height: 15 },
            { x: 190, y: 120, width: 120, height: 15 },
            { x: 100, y: 220, width: 160, height: 15 },
            { x: 60, y: 320, width: 240, height: 15 }
        ];
        ball.x = 80;
    }
}

function update() {
    if (gameOver) return;

    const gravityX = Math.sin(tilt * Math.PI / 180) * gravity * 2;
    const gravityY = Math.cos(tilt * Math.PI / 180) * gravity;

    ball.vx += gravityX;
    ball.vy += gravityY;
    ball.vx *= friction;
    ball.vy *= friction;

    ball.x += ball.vx;
    ball.y += ball.vy;

    // Platform collision
    platforms.forEach(p => {
        const cos = Math.cos(tilt * Math.PI / 180);
        const sin = Math.sin(tilt * Math.PI / 180);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        const corners = [
            { x: p.x, y: p.y },
            { x: p.x + p.width, y: p.y },
            { x: p.x + p.width, y: p.y + p.height },
            { x: p.x, y: p.y + p.height }
        ].map(c => ({
            x: cx + (c.x - cx) * cos - (c.y - cy) * sin,
            y: cy + (c.x - cx) * sin + (c.y - cy) * cos
        }));

        const minX = Math.min(...corners.map(c => c.x));
        const maxX = Math.max(...corners.map(c => c.x));
        const minY = Math.min(...corners.map(c => c.y));
        const maxY = Math.max(...corners.map(c => c.y));

        if (ball.x > minX - ball.radius && ball.x < maxX + ball.radius &&
            ball.y > minY - ball.radius && ball.y < maxY + ball.radius) {
            if (ball.vy > 0 && ball.y - ball.vy <= minY) {
                ball.y = minY - ball.radius;
                ball.vy *= -0.3;
            }
        }
    });

    // Wall collision
    if (ball.x < ball.radius) { ball.x = ball.radius; ball.vx *= -0.5; }
    if (ball.x > canvas.width - ball.radius) { ball.x = canvas.width - ball.radius; ball.vx *= -0.5; }

    // Check win/lose
    const dx = ball.x - target.x;
    const dy = ball.y - target.y;
    if (Math.sqrt(dx*dx + dy*dy) < ball.radius + target.radius) {
        gameOver = true;
        resultEl.textContent = '🎉 成功!';
        setTimeout(() => { level++; levelEl.textContent = level; initLevel(); }, 1500);
    }

    if (ball.y > canvas.height + 50) {
        gameOver = true;
        resultEl.textContent = '❌ 掉落了! 點擊重新開始';
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(tilt * Math.PI / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Target
    ctx.fillStyle = '#00b894';
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎯', target.x, target.y + 7);

    // Platforms
    ctx.fillStyle = '#636e72';
    platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    ctx.restore();

    // Ball (not rotated)
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(ball.x - 4, ball.y - 4, 5, 0, Math.PI * 2);
    ctx.fill();
}

let leftPressed = false;
let rightPressed = false;

leftBtn.addEventListener('mousedown', () => leftPressed = true);
leftBtn.addEventListener('mouseup', () => leftPressed = false);
leftBtn.addEventListener('mouseleave', () => leftPressed = false);
leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); leftPressed = true; });
leftBtn.addEventListener('touchend', () => leftPressed = false);

rightBtn.addEventListener('mousedown', () => rightPressed = true);
rightBtn.addEventListener('mouseup', () => rightPressed = false);
rightBtn.addEventListener('mouseleave', () => rightPressed = false);
rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); rightPressed = true; });
rightBtn.addEventListener('touchend', () => rightPressed = false);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') leftPressed = true;
    if (e.key === 'ArrowRight') rightPressed = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') leftPressed = false;
    if (e.key === 'ArrowRight') rightPressed = false;
});

canvas.addEventListener('click', () => { if (gameOver) initLevel(); });

function gameLoop() {
    if (leftPressed) tilt = Math.max(tilt - 1, -30);
    else if (rightPressed) tilt = Math.min(tilt + 1, 30);
    else tilt *= 0.9;

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initLevel();
gameLoop();
