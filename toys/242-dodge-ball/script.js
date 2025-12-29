const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 500;
let player = { x: 0, y: 0, size: 25 };
let balls = [];
let score = 0, highScore = 0;
let isPlaying = false;
let animationId = null;
let spawnRate = 60;
let frameCount = 0;

function init() {
    setupCanvas();
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    draw();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.4;
    canvas.width = width;
    canvas.height = height;
    player.x = width / 2;
    player.y = height - 50;
}

function startGame() {
    score = 0;
    balls = [];
    spawnRate = 60;
    frameCount = 0;
    isPlaying = true;
    player.x = width / 2;

    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('gameOver').classList.remove('show');
    document.getElementById('score').textContent = '0';

    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

function gameLoop() {
    update();
    draw();
    if (isPlaying) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function update() {
    frameCount++;

    if (frameCount % spawnRate === 0) {
        spawnBall();
        if (spawnRate > 20) spawnRate--;
    }

    balls.forEach(ball => {
        ball.y += ball.speed;
    });

    balls = balls.filter(ball => {
        if (ball.y > height + ball.size) {
            score++;
            document.getElementById('score').textContent = score;
            return false;
        }
        return true;
    });

    balls.forEach(ball => {
        const dx = ball.x - player.x;
        const dy = ball.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ball.size + player.size) {
            endGame();
        }
    });
}

function spawnBall() {
    const size = 15 + Math.random() * 20;
    balls.push({
        x: size + Math.random() * (width - size * 2),
        y: -size,
        size: size,
        speed: 3 + Math.random() * 3 + score * 0.05,
        color: 'hsl(' + Math.random() * 360 + ', 70%, 50%)'
    });
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);

    balls.forEach(ball => {
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(player.x - 7, player.y - 5, 5, 0, Math.PI * 2);
    ctx.arc(player.x + 7, player.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x - 7, player.y - 5, 2, 0, Math.PI * 2);
    ctx.arc(player.x + 7, player.y - 5, 2, 0, Math.PI * 2);
    ctx.fill();
}

function handleMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    player.x = (e.clientX - rect.left) * scaleX;
    player.x = Math.max(player.size, Math.min(width - player.size, player.x));
}

function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    player.x = (e.touches[0].clientX - rect.left) * scaleX;
    player.x = Math.max(player.size, Math.min(width - player.size, player.x));
}

function endGame() {
    isPlaying = false;
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.add('show');
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('startBtn').textContent = '再玩一次';
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
