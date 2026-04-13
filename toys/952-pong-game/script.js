const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const paddleWidth = 10;
const paddleHeight = 60;
const ballSize = 10;

let player = { y: canvas.height / 2 - paddleHeight / 2 };
let ai = { y: canvas.height / 2 - paddleHeight / 2 };
let ball = { x: canvas.width / 2, y: canvas.height / 2, vx: 4, vy: 3 };
let playerScore = 0;
let aiScore = 0;
let gameRunning = false;

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * 4;
    ball.vy = (Math.random() - 0.5) * 6;
}

function update() {
    if (!gameRunning) return;

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y <= 0 || ball.y >= canvas.height - ballSize) {
        ball.vy *= -1;
    }

    if (ball.x <= paddleWidth + 15) {
        if (ball.y + ballSize >= player.y && ball.y <= player.y + paddleHeight) {
            ball.vx = Math.abs(ball.vx) * 1.05;
            ball.vy += (ball.y - (player.y + paddleHeight / 2)) * 0.1;
        } else if (ball.x <= 0) {
            aiScore++;
            resetBall();
        }
    }

    if (ball.x >= canvas.width - paddleWidth - 15 - ballSize) {
        if (ball.y + ballSize >= ai.y && ball.y <= ai.y + paddleHeight) {
            ball.vx = -Math.abs(ball.vx) * 1.05;
            ball.vy += (ball.y - (ai.y + paddleHeight / 2)) * 0.1;
        } else if (ball.x >= canvas.width - ballSize) {
            playerScore++;
            resetBall();
        }
    }

    const aiCenter = ai.y + paddleHeight / 2;
    const ballCenter = ball.y + ballSize / 2;
    if (aiCenter < ballCenter - 10) ai.y += 3;
    else if (aiCenter > ballCenter + 10) ai.y -= 3;

    ai.y = Math.max(0, Math.min(canvas.height - paddleHeight, ai.y));

    ball.vx = Math.max(-10, Math.min(10, ball.vx));
    ball.vy = Math.max(-8, Math.min(8, ball.vy));
}

function draw() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(33, 150, 243, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#2196F3';
    ctx.fillRect(15, player.y, paddleWidth, paddleHeight);

    ctx.fillStyle = '#FF5722';
    ctx.fillRect(canvas.width - 15 - paddleWidth, ai.y, paddleWidth, paddleHeight);

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x + ballSize / 2, ball.y + ballSize / 2, ballSize / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2196F3';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(playerScore, canvas.width / 4, 50);
    ctx.fillStyle = '#FF5722';
    ctx.fillText(aiScore, canvas.width * 3 / 4, 50);
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    player.y = Math.max(0, Math.min(canvas.height - paddleHeight, y - paddleHeight / 2));
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    player.y = Math.max(0, Math.min(canvas.height - paddleHeight, y - paddleHeight / 2));
});

document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        playerScore = 0;
        aiScore = 0;
        resetBall();
    }
});

animate();
