const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const width = 280, height = 400;
canvas.width = width; canvas.height = height;

let bird = { x: 50, y: 200, vy: 0, size: 20 };
let pipes = [], score = 0, highScore = 0, isPlaying = false;
const gravity = 0.4, jump = -7, pipeWidth = 50, pipeGap = 120;

function init() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    canvas.addEventListener('click', flap);
    document.addEventListener('keydown', e => { if (e.code === 'Space') flap(); });
    draw();
}

function startGame() {
    bird = { x: 50, y: 200, vy: 0, size: 20 };
    pipes = [];
    score = 0;
    isPlaying = true;
    document.getElementById('score').textContent = score;
    gameLoop();
}

function flap() {
    if (isPlaying) bird.vy = jump;
}

function gameLoop() {
    if (!isPlaying) return;

    bird.vy += gravity;
    bird.y += bird.vy;

    if (pipes.length === 0 || pipes[pipes.length - 1].x < width - 150) {
        const gapY = 80 + Math.random() * (height - 160 - pipeGap);
        pipes.push({ x: width, gapY, passed: false });
    }

    pipes.forEach(pipe => {
        pipe.x -= 3;

        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
            document.getElementById('score').textContent = score;
        }
    });

    pipes = pipes.filter(p => p.x > -pipeWidth);

    if (checkCollision()) {
        endGame();
        return;
    }

    draw();
    requestAnimationFrame(gameLoop);
}

function checkCollision() {
    if (bird.y < 0 || bird.y > height - bird.size) return true;

    for (const pipe of pipes) {
        if (bird.x + bird.size > pipe.x && bird.x < pipe.x + pipeWidth) {
            if (bird.y < pipe.gapY || bird.y + bird.size > pipe.gapY + pipeGap) {
                return true;
            }
        }
    }
    return false;
}

function endGame() {
    isPlaying = false;
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
    }
    draw();
}

function draw() {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#4ec0ca');
    skyGrad.addColorStop(1, '#71c9ce');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, height - 20, width, 20);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, height - 25, width, 8);

    pipes.forEach(pipe => {
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapY);
        ctx.fillRect(pipe.x, pipe.gapY + pipeGap, pipeWidth, height - pipe.gapY - pipeGap);

        ctx.fillStyle = '#27ae60';
        ctx.fillRect(pipe.x - 5, pipe.gapY - 20, pipeWidth + 10, 20);
        ctx.fillRect(pipe.x - 5, pipe.gapY + pipeGap, pipeWidth + 10, 20);
    });

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(bird.x + bird.size/2, bird.y + bird.size/2, bird.size/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bird.x + bird.size/2 + 5, bird.y + bird.size/2 - 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.x + bird.size/2 + 6, bird.y + bird.size/2 - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.size, bird.y + bird.size/2);
    ctx.lineTo(bird.x + bird.size + 8, bird.y + bird.size/2 + 3);
    ctx.lineTo(bird.x + bird.size, bird.y + bird.size/2 + 6);
    ctx.closePath();
    ctx.fill();

    if (!isPlaying && score > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('遊戲結束', width/2, height/2 - 20);
        ctx.font = '18px Arial';
        ctx.fillText('分數: ' + score, width/2, height/2 + 15);
    }
}

document.addEventListener('DOMContentLoaded', init);
