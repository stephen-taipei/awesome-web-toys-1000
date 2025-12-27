const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 320, height = 480;
let bird = { x: 50, y: 0, velocity: 0, size: 20 };
let pipes = [];
let score = 0, highScore = 0;
let isPlaying = false;
let animationId = null;

const gravity = 0.5;
const jump = -8;
const pipeWidth = 50;
const pipeGap = 120;

function init() {
    setupCanvas();
    canvas.addEventListener('click', handleInput);
    document.addEventListener('keydown', (e) => { if (e.code === 'Space') handleInput(); });
    draw();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(320, wrapper.clientWidth);
    height = width * 1.5;
    canvas.width = width;
    canvas.height = height;
}

function handleInput() {
    if (!isPlaying) {
        startGame();
    } else {
        bird.velocity = jump;
    }
}

function startGame() {
    bird.y = height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    isPlaying = true;
    document.getElementById('overlay').classList.add('hidden');
    updateStats();
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
    bird.velocity += gravity;
    bird.y += bird.velocity;

    if (bird.y < 0) bird.y = 0;
    if (bird.y > height - bird.size) {
        endGame();
        return;
    }

    if (pipes.length === 0 || pipes[pipes.length - 1].x < width - 150) {
        const gapY = 80 + Math.random() * (height - pipeGap - 160);
        pipes.push({ x: width, gapY: gapY, passed: false });
    }

    pipes.forEach(pipe => {
        pipe.x -= 3;

        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
            updateStats();
        }

        if (bird.x + bird.size > pipe.x && bird.x < pipe.x + pipeWidth) {
            if (bird.y < pipe.gapY || bird.y + bird.size > pipe.gapY + pipeGap) {
                endGame();
            }
        }
    });

    pipes = pipes.filter(p => p.x > -pipeWidth);
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#b0e0e6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, height - 20, width, 20);
    ctx.fillStyle = '#228b22';
    ctx.fillRect(0, height - 25, width, 5);

    pipes.forEach(pipe => {
        ctx.fillStyle = '#2ecc71';

        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapY);
        ctx.fillRect(pipe.x - 5, pipe.gapY - 20, pipeWidth + 10, 20);

        ctx.fillRect(pipe.x, pipe.gapY + pipeGap, pipeWidth, height - pipe.gapY - pipeGap);
        ctx.fillRect(pipe.x - 5, pipe.gapY + pipeGap, pipeWidth + 10, 20);
    });

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(bird.x + bird.size / 2, bird.y + bird.size / 2, bird.size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bird.x + bird.size / 2 + 5, bird.y + bird.size / 2 - 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.x + bird.size / 2 + 6, bird.y + bird.size / 2 - 3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.size, bird.y + bird.size / 2);
    ctx.lineTo(bird.x + bird.size + 8, bird.y + bird.size / 2 + 3);
    ctx.lineTo(bird.x + bird.size, bird.y + bird.size / 2 + 6);
    ctx.fill();
}

function updateStats() {
    document.getElementById('score').textContent = score;
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
    }
}

function endGame() {
    isPlaying = false;
    document.getElementById('message').textContent = '分數: ' + score + '\n點擊重新開始';
    document.getElementById('overlay').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => { setupCanvas(); draw(); });
