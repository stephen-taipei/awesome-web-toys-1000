const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const paddleWidth = 80;
const paddleHeight = 10;
const ballSize = 8;
const brickRows = 4;
const brickCols = 8;
const brickWidth = 40;
const brickHeight = 15;

let paddle = { x: canvas.width / 2 - paddleWidth / 2 };
let ball = { x: canvas.width / 2, y: canvas.height - 50, vx: 3, vy: -3 };
let bricks = [];
let score = 0;
let lives = 3;
let gameRunning = false;

function initBricks() {
    bricks = [];
    for (let row = 0; row < brickRows; row++) {
        for (let col = 0; col < brickCols; col++) {
            bricks.push({
                x: col * (brickWidth + 5) + 15,
                y: row * (brickHeight + 5) + 30,
                alive: true,
                hue: 330 + row * 20
            });
        }
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 50;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * 3;
    ball.vy = -3;
}

function update() {
    if (!gameRunning) return;

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x <= ballSize || ball.x >= canvas.width - ballSize) {
        ball.vx *= -1;
    }
    if (ball.y <= ballSize) {
        ball.vy *= -1;
    }

    if (ball.y >= canvas.height - paddleHeight - 20 - ballSize &&
        ball.x >= paddle.x && ball.x <= paddle.x + paddleWidth) {
        ball.vy = -Math.abs(ball.vy);
        const hitPos = (ball.x - paddle.x) / paddleWidth;
        ball.vx = (hitPos - 0.5) * 8;
    }

    if (ball.y >= canvas.height) {
        lives--;
        if (lives <= 0) {
            gameOver();
        } else {
            resetBall();
        }
    }

    bricks.forEach(brick => {
        if (!brick.alive) return;
        if (ball.x >= brick.x && ball.x <= brick.x + brickWidth &&
            ball.y >= brick.y && ball.y <= brick.y + brickHeight) {
            brick.alive = false;
            ball.vy *= -1;
            score += 10;
        }
    });

    if (bricks.every(b => !b.alive)) {
        initBricks();
        resetBall();
    }
}

function draw() {
    ctx.fillStyle = '#150a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    bricks.forEach(brick => {
        if (!brick.alive) return;
        ctx.fillStyle = `hsl(${brick.hue}, 80%, 50%)`;
        ctx.fillRect(brick.x, brick.y, brickWidth - 2, brickHeight - 2);
    });

    ctx.fillStyle = '#E91E63';
    ctx.fillRect(paddle.x, canvas.height - paddleHeight - 20, paddleWidth, paddleHeight);

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 30);
    ctx.fillStyle = '#E91E63';
    ctx.font = '12px Arial';
    ctx.fillText(`分數: ${score}  生命: ${lives}`, 20, 28);
}

function gameOver() {
    gameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#E91E63';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('遊戲結束!', canvas.width / 2, canvas.height / 2);
    ctx.font = '16px Arial';
    ctx.fillText(`最終分數: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = 'left';
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    paddle.x = Math.max(0, Math.min(canvas.width - paddleWidth, x - paddleWidth / 2));
});

document.getElementById('startBtn').addEventListener('click', () => {
    initBricks();
    resetBall();
    score = 0;
    lives = 3;
    gameRunning = true;
});

initBricks();
animate();
