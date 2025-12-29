const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const width = 300, height = 400;
let basketX = 150, items = [], score = 0, lives = 3, isPlaying = false;
let spawnTimer = 0, difficulty = 1;

function init() {
    canvas.width = width; canvas.height = height;
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        basketX = e.clientX - rect.left;
        basketX = Math.max(40, Math.min(width - 40, basketX));
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        basketX = e.touches[0].clientX - rect.left;
        basketX = Math.max(40, Math.min(width - 40, basketX));
    });
    document.getElementById('startBtn').addEventListener('click', startGame);
    draw();
}

function startGame() {
    score = 0;
    lives = 3;
    items = [];
    difficulty = 1;
    isPlaying = true;
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    gameLoop();
}

function gameLoop() {
    if (!isPlaying) return;

    spawnTimer++;
    if (spawnTimer > 60 / difficulty) {
        spawnTimer = 0;
        items.push({
            x: Math.random() * (width - 40) + 20,
            y: -20,
            type: Math.random() < 0.2 ? 'bad' : 'good',
            speed: 2 + difficulty * 0.5
        });
    }

    items.forEach(item => {
        item.y += item.speed;
    });

    items = items.filter(item => {
        if (item.y > height - 50 && Math.abs(item.x - basketX) < 50) {
            if (item.type === 'good') {
                score += 10;
                difficulty = 1 + score / 100;
            } else {
                lives--;
            }
            document.getElementById('score').textContent = score;
            document.getElementById('lives').textContent = lives;
            return false;
        }
        if (item.y > height) {
            if (item.type === 'good') {
                lives--;
                document.getElementById('lives').textContent = lives;
            }
            return false;
        }
        return true;
    });

    if (lives <= 0) {
        isPlaying = false;
        draw();
        return;
    }

    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#87ceeb');
    skyGrad.addColorStop(1, '#98fb98');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    items.forEach(item => {
        if (item.type === 'good') {
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(item.x, item.y, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(item.x - 2, item.y - 20, 4, 8);
        } else {
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.moveTo(item.x, item.y - 15);
            ctx.lineTo(item.x + 12, item.y + 10);
            ctx.lineTo(item.x - 12, item.y + 10);
            ctx.closePath();
            ctx.fill();
        }
    });

    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.moveTo(basketX - 40, height - 20);
    ctx.lineTo(basketX - 30, height - 50);
    ctx.lineTo(basketX + 30, height - 50);
    ctx.lineTo(basketX + 40, height - 20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a3010';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (!isPlaying && lives <= 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('遊戲結束', width/2, height/2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText('分數: ' + score, width/2, height/2 + 20);
    }
}

document.addEventListener('DOMContentLoaded', init);
