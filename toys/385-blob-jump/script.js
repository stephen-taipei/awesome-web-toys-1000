const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const resultEl = document.getElementById('result');

let score = 0;
let highScore = 0;
let gameOver = false;
let started = false;

const blob = {
    x: 180,
    y: 350,
    vy: 0,
    radius: 25,
    squash: 1
};

let platforms = [];
const gravity = 0.4;
const jumpPower = -12;
const platformSpeed = 2;

function initGame() {
    score = 0;
    gameOver = false;
    started = false;
    blob.x = 180;
    blob.y = 350;
    blob.vy = 0;
    blob.squash = 1;
    scoreEl.textContent = '0';
    resultEl.textContent = '點擊或按空白鍵跳躍!';

    platforms = [];
    for (let i = 0; i < 8; i++) {
        platforms.push({
            x: Math.random() * (canvas.width - 80) + 40,
            y: 400 - i * 60,
            width: 70,
            height: 15
        });
    }
}

function jump() {
    if (gameOver) {
        initGame();
        return;
    }
    started = true;
    blob.vy = jumpPower;
    blob.squash = 1.3;
}

function update() {
    if (!started || gameOver) return;

    blob.vy += gravity;
    blob.y += blob.vy;
    blob.squash += (1 - blob.squash) * 0.1;

    // Horizontal movement based on position
    const centerX = canvas.width / 2;
    blob.x += (centerX - blob.x) * 0.02;

    // Platform collision
    platforms.forEach(p => {
        if (blob.vy > 0 &&
            blob.x > p.x - blob.radius &&
            blob.x < p.x + p.width + blob.radius &&
            blob.y + blob.radius * blob.squash > p.y &&
            blob.y + blob.radius * blob.squash < p.y + p.height + 10) {
            blob.y = p.y - blob.radius * blob.squash;
            blob.vy = jumpPower * 0.8;
            blob.squash = 0.6;
            score += 10;
            scoreEl.textContent = score;
        }
    });

    // Move platforms down when blob goes up
    if (blob.y < 200) {
        const diff = 200 - blob.y;
        blob.y = 200;
        platforms.forEach(p => p.y += diff);

        // Remove off-screen platforms and add new ones
        platforms = platforms.filter(p => p.y < canvas.height + 20);
        while (platforms.length < 8) {
            const topY = Math.min(...platforms.map(p => p.y));
            platforms.push({
                x: Math.random() * (canvas.width - 80) + 40,
                y: topY - 60 - Math.random() * 20,
                width: 60 + Math.random() * 30,
                height: 15
            });
        }
    }

    // Game over
    if (blob.y > canvas.height + 50) {
        gameOver = true;
        if (score > highScore) highScore = score;
        resultEl.textContent = `遊戲結束! 分數: ${score} | 最高: ${highScore}`;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Platforms
    platforms.forEach(p => {
        ctx.fillStyle = '#6c5ce7';
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 5);
        ctx.fill();
    });

    // Blob
    ctx.fillStyle = '#e84393';
    ctx.beginPath();
    ctx.ellipse(
        blob.x,
        blob.y,
        blob.radius,
        blob.radius * blob.squash,
        0, 0, Math.PI * 2
    );
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(blob.x - 8, blob.y - 5, 8, 0, Math.PI * 2);
    ctx.arc(blob.x + 8, blob.y - 5, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(blob.x - 6, blob.y - 3, 4, 0, Math.PI * 2);
    ctx.arc(blob.x + 10, blob.y - 3, 4, 0, Math.PI * 2);
    ctx.fill();

    // Start prompt
    if (!started) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('點擊開始!', canvas.width/2, canvas.height/2);
    }
}

canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); jump(); }
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initGame();
gameLoop();
