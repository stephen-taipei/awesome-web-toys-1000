const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 400, height = 300;
const paddleWidth = 10, paddleHeight = 60;
const ballSize = 10;

let playerY = 0, cpuY = 0;
let ball = { x: 0, y: 0, dx: 5, dy: 3 };
let playerScore = 0, cpuScore = 0;
let isPlaying = false;
let animationId = null;

function init() {
    setupCanvas();
    document.getElementById('startBtn').addEventListener('click', startGame);
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    draw();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(400, wrapper.clientWidth - 4);
    height = width * 0.75;
    canvas.width = width;
    canvas.height = height;
    playerY = cpuY = (height - paddleHeight) / 2;
    resetBall();
}

function startGame() {
    playerScore = 0;
    cpuScore = 0;
    isPlaying = true;
    updateScore();
    document.getElementById('startBtn').classList.add('hidden');
    resetBall();
    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

function resetBall() {
    ball.x = width / 2;
    ball.y = height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 6;
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

    if (ball.y < ballSize / 2 || ball.y > height - ballSize / 2) {
        ball.dy = -ball.dy;
    }

    if (ball.x < paddleWidth + ballSize / 2 &&
        ball.y > playerY && ball.y < playerY + paddleHeight) {
        ball.dx = Math.abs(ball.dx) * 1.05;
        ball.dy += (ball.y - (playerY + paddleHeight / 2)) * 0.1;
    }

    if (ball.x > width - paddleWidth - ballSize / 2 &&
        ball.y > cpuY && ball.y < cpuY + paddleHeight) {
        ball.dx = -Math.abs(ball.dx) * 1.05;
        ball.dy += (ball.y - (cpuY + paddleHeight / 2)) * 0.1;
    }

    ball.dx = Math.min(15, Math.max(-15, ball.dx));
    ball.dy = Math.min(8, Math.max(-8, ball.dy));

    if (ball.x < 0) {
        cpuScore++;
        updateScore();
        resetBall();
    } else if (ball.x > width) {
        playerScore++;
        updateScore();
        resetBall();
    }

    const cpuCenter = cpuY + paddleHeight / 2;
    const diff = ball.y - cpuCenter;
    cpuY += diff * 0.08;
    cpuY = Math.max(0, Math.min(height - paddleHeight, cpuY));

    if (playerScore >= 11 || cpuScore >= 11) {
        endGame();
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#333';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, playerY, paddleWidth, paddleHeight);
    ctx.fillRect(width - paddleWidth, cpuY, paddleWidth, paddleHeight);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballSize / 2, 0, Math.PI * 2);
    ctx.fill();
}

function handleMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    playerY = (e.clientY - rect.top) * scaleY - paddleHeight / 2;
    playerY = Math.max(0, Math.min(height - paddleHeight, playerY));
}

function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    playerY = (e.touches[0].clientY - rect.top) * scaleY - paddleHeight / 2;
    playerY = Math.max(0, Math.min(height - paddleHeight, playerY));
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('cpuScore').textContent = cpuScore;
}

function endGame() {
    isPlaying = false;
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('startBtn').textContent = playerScore > cpuScore ? '你贏了! 再來一局' : '再來一局';
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => { setupCanvas(); draw(); });
