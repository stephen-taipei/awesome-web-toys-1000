const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const width = 300, height = 400;
const paddleWidth = 60, paddleHeight = 10;
const brickRows = 5, brickCols = 6;
const brickWidth = 45, brickHeight = 15;
let paddleX = width/2;
let ball = { x: width/2, y: height - 50, vx: 3, vy: -3 };
let bricks = [], score = 0, lives = 3, isPlaying = false;
const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db'];

function init() {
    canvas.width = width; canvas.height = height;
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        paddleX = e.clientX - rect.left;
        paddleX = Math.max(paddleWidth/2, Math.min(width - paddleWidth/2, paddleX));
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        paddleX = e.touches[0].clientX - rect.left;
        paddleX = Math.max(paddleWidth/2, Math.min(width - paddleWidth/2, paddleX));
    });
    document.getElementById('startBtn').addEventListener('click', startGame);
    createBricks();
    draw();
}

function createBricks() {
    bricks = [];
    for (let row = 0; row < brickRows; row++) {
        for (let col = 0; col < brickCols; col++) {
            bricks.push({
                x: col * (brickWidth + 4) + 10,
                y: row * (brickHeight + 4) + 40,
                color: colors[row],
                alive: true
            });
        }
    }
}

function startGame() {
    score = 0;
    lives = 3;
    createBricks();
    resetBall();
    isPlaying = true;
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    gameLoop();
}

function resetBall() {
    ball.x = width/2;
    ball.y = height - 50;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * 3;
    ball.vy = -3;
}

function gameLoop() {
    if (!isPlaying) return;

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x <= 8 || ball.x >= width - 8) ball.vx *= -1;
    if (ball.y <= 8) ball.vy *= -1;

    if (ball.y >= height - 25 &&
        ball.x > paddleX - paddleWidth/2 - 8 &&
        ball.x < paddleX + paddleWidth/2 + 8) {
        ball.vy = -Math.abs(ball.vy);
        ball.vx += (ball.x - paddleX) * 0.1;
    }

    bricks.forEach(brick => {
        if (!brick.alive) return;
        if (ball.x > brick.x - 8 && ball.x < brick.x + brickWidth + 8 &&
            ball.y > brick.y - 8 && ball.y < brick.y + brickHeight + 8) {
            brick.alive = false;
            ball.vy *= -1;
            score += 10;
            document.getElementById('score').textContent = score;
        }
    });

    if (ball.y > height) {
        lives--;
        document.getElementById('lives').textContent = lives;
        if (lives > 0) resetBall();
        else isPlaying = false;
    }

    if (bricks.every(b => !b.alive)) {
        createBricks();
        resetBall();
    }

    draw();
    if (isPlaying) requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, width, height);

    bricks.forEach(brick => {
        if (!brick.alive) return;
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.strokeRect(brick.x, brick.y, brickWidth, brickHeight);
    });

    ctx.fillStyle = '#fff';
    ctx.fillRect(paddleX - paddleWidth/2, height - 20, paddleWidth, paddleHeight);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
    ctx.fill();

    if (!isPlaying && lives <= 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('遊戲結束', width/2, height/2 - 10);
        ctx.font = '18px Arial';
        ctx.fillText('分數: ' + score, width/2, height/2 + 20);
    }
}

document.addEventListener('DOMContentLoaded', init);
