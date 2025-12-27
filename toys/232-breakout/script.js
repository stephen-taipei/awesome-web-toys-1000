const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let canvasWidth = 400, canvasHeight = 500;
let paddle = { x: 0, y: 0, width: 80, height: 12 };
let ball = { x: 0, y: 0, radius: 8, dx: 4, dy: -4 };
let bricks = [];
let score = 0, lives = 3;
let isPlaying = false;
let animationId = null;

const brickRows = 5, brickCols = 8;
const brickWidth = 45, brickHeight = 15, brickPadding = 4;
const brickColors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db'];

function init() {
    setupCanvas();
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);

    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    canvasWidth = Math.min(400, wrapper.clientWidth - 6);
    canvasHeight = canvasWidth * 1.25;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

function startGame() {
    score = 0;
    lives = 3;
    isPlaying = true;
    updateStats();

    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('gameOver').classList.remove('show');

    createBricks();
    resetBall();
    paddle.y = canvasHeight - 30;
    paddle.x = (canvasWidth - paddle.width) / 2;

    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

function createBricks() {
    bricks = [];
    const offsetX = (canvasWidth - (brickCols * (brickWidth + brickPadding) - brickPadding)) / 2;
    for (let row = 0; row < brickRows; row++) {
        for (let col = 0; col < brickCols; col++) {
            bricks.push({
                x: offsetX + col * (brickWidth + brickPadding),
                y: 40 + row * (brickHeight + brickPadding),
                width: brickWidth,
                height: brickHeight,
                color: brickColors[row],
                alive: true
            });
        }
    }
}

function resetBall() {
    ball.x = canvasWidth / 2;
    ball.y = canvasHeight - 50;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
    ball.dy = -4;
}

function gameLoop() {
    update();
    draw();
    if (isPlaying) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function update() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvasWidth) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    if (ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -Math.abs(ball.dy);
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = 8 * (hitPos - 0.5);
    }

    if (ball.y > canvasHeight) {
        lives--;
        updateStats();
        if (lives <= 0) {
            endGame(false);
        } else {
            resetBall();
        }
    }

    bricks.forEach(brick => {
        if (brick.alive && checkCollision(ball, brick)) {
            brick.alive = false;
            ball.dy = -ball.dy;
            score += 10;
            updateStats();
        }
    });

    if (bricks.every(b => !b.alive)) {
        endGame(true);
    }
}

function checkCollision(ball, brick) {
    return ball.x > brick.x && ball.x < brick.x + brick.width &&
           ball.y > brick.y && ball.y < brick.y + brick.height;
}

function draw() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    bricks.forEach(brick => {
        if (brick.alive) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
    });

    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function handleMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    paddle.x = (e.clientX - rect.left) * scaleX - paddle.width / 2;
    paddle.x = Math.max(0, Math.min(canvasWidth - paddle.width, paddle.x));
}

function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    paddle.x = (e.touches[0].clientX - rect.left) * scaleX - paddle.width / 2;
    paddle.x = Math.max(0, Math.min(canvasWidth - paddle.width, paddle.x));
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

function endGame(win) {
    isPlaying = false;
    const title = document.getElementById('endTitle');
    title.textContent = win ? '恭喜過關!' : '遊戲結束';
    title.className = win ? 'win' : 'lose';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.add('show');
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('startBtn').textContent = '再玩一次';
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
