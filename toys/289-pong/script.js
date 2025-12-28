const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const width = 300, height = 400;
const paddleWidth = 60, paddleHeight = 10;
let playerY = height - 30, playerX = width/2;
let aiX = width/2;
let ball = { x: width/2, y: height/2, vx: 3, vy: 3 };
let playerScore = 0, aiScore = 0, isPlaying = false;

function init() {
    canvas.width = width; canvas.height = height;
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        playerX = e.clientX - rect.left;
        playerX = Math.max(paddleWidth/2, Math.min(width - paddleWidth/2, playerX));
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        playerX = e.touches[0].clientX - rect.left;
        playerX = Math.max(paddleWidth/2, Math.min(width - paddleWidth/2, playerX));
    });
    document.getElementById('startBtn').addEventListener('click', startGame);
    draw();
}

function startGame() {
    playerScore = 0;
    aiScore = 0;
    resetBall();
    isPlaying = true;
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('aiScore').textContent = aiScore;
    gameLoop();
}

function resetBall() {
    ball.x = width/2;
    ball.y = height/2;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * 3;
    ball.vy = (Math.random() > 0.5 ? 1 : -1) * 3;
}

function gameLoop() {
    if (!isPlaying) return;

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x <= 10 || ball.x >= width - 10) ball.vx *= -1;

    if (ball.y >= playerY - 10 &&
        ball.x > playerX - paddleWidth/2 - 10 &&
        ball.x < playerX + paddleWidth/2 + 10) {
        ball.vy = -Math.abs(ball.vy) * 1.05;
        ball.vx += (ball.x - playerX) * 0.1;
    }

    if (ball.y <= 30 &&
        ball.x > aiX - paddleWidth/2 - 10 &&
        ball.x < aiX + paddleWidth/2 + 10) {
        ball.vy = Math.abs(ball.vy) * 1.05;
    }

    const aiSpeed = 3;
    if (aiX < ball.x - 10) aiX += aiSpeed;
    else if (aiX > ball.x + 10) aiX -= aiSpeed;
    aiX = Math.max(paddleWidth/2, Math.min(width - paddleWidth/2, aiX));

    if (ball.y > height) {
        aiScore++;
        document.getElementById('aiScore').textContent = aiScore;
        resetBall();
    } else if (ball.y < 0) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }

    if (playerScore >= 5 || aiScore >= 5) {
        isPlaying = false;
    }

    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#0f0';
    ctx.fillRect(aiX - paddleWidth/2, 20, paddleWidth, paddleHeight);
    ctx.fillRect(playerX - paddleWidth/2, playerY, paddleWidth, paddleHeight);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
    ctx.fill();

    if (!isPlaying && (playerScore >= 5 || aiScore >= 5)) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#0f0';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(playerScore >= 5 ? '你贏了!' : '電腦贏了!', width/2, height/2);
    }
}

document.addEventListener('DOMContentLoaded', init);
