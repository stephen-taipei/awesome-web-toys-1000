const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const bird = {
    x: 80,
    y: canvas.height / 2,
    radius: 15,
    velocity: 0,
    gravity: 0.4,
    jump: -7
};

let pipes = [];
const pipeWidth = 50;
const pipeGap = 100;
const pipeSpeed = 2;

let score = 0;
let bestScore = 0;
let gameRunning = false;
let gameOver = false;

function reset() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
}

function spawnPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = minHeight + Math.random() * (maxHeight - minHeight);

    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        passed: false
    });
}

function update() {
    if (!gameRunning || gameOver) return;

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y - bird.radius <= 0 || bird.y + bird.radius >= canvas.height) {
        endGame();
        return;
    }

    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
        }

        if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipeWidth) {
            if (bird.y - bird.radius < pipe.topHeight || bird.y + bird.radius > pipe.topHeight + pipeGap) {
                endGame();
            }
        }
    });

    pipes = pipes.filter(p => p.x + pipeWidth > 0);

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        spawnPipe();
    }
}

function endGame() {
    gameOver = true;
    gameRunning = false;
    if (score > bestScore) bestScore = score;
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    pipes.forEach(pipe => {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height - pipe.topHeight - pipeGap);

        ctx.fillStyle = '#388E3C';
        ctx.fillRect(pipe.x - 3, pipe.topHeight - 20, pipeWidth + 6, 20);
        ctx.fillRect(pipe.x - 3, pipe.topHeight + pipeGap, pipeWidth + 6, 20);
    });

    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(Math.min(Math.PI / 4, bird.velocity * 0.05));

    ctx.fillStyle = '#FFC107';
    ctx.beginPath();
    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(5, -3, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(7, -3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.moveTo(bird.radius, 0);
    ctx.lineTo(bird.radius + 10, -3);
    ctx.lineTo(bird.radius + 10, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`分數: ${score}`, 20, 30);

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#4FC3F7';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('遊戲結束!', canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = '16px Arial';
        ctx.fillText(`分數: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`最佳: ${bestScore}`, canvas.width / 2, canvas.height / 2 + 25);
    }

    if (!gameRunning && !gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('點擊開始', canvas.width / 2, canvas.height / 2);
    }
}

function flap() {
    if (gameOver) {
        reset();
        return;
    }
    if (!gameRunning) {
        gameRunning = true;
        spawnPipe();
    }
    bird.velocity = bird.jump;
}

canvas.addEventListener('click', flap);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        flap();
    }
});

document.getElementById('startBtn').addEventListener('click', () => {
    if (gameOver) reset();
    if (!gameRunning) {
        gameRunning = true;
        spawnPipe();
    }
});

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

animate();
