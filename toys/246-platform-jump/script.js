const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 500;
let player = { x: 0, y: 0, vy: 0, width: 30, height: 30 };
let platforms = [];
let score = 0, bestScore = 0;
let isPlaying = false;
let animationId = null;
let cameraY = 0;

const gravity = 0.4;
const jumpForce = -12;

function init() {
    setupCanvas();
    document.getElementById('startBtn').addEventListener('click', startGame);
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
}

function startGame() {
    score = 0;
    cameraY = 0;
    platforms = [];
    isPlaying = true;

    player.x = width / 2;
    player.y = height - 100;
    player.vy = jumpForce;

    for (let i = 0; i < 10; i++) {
        createPlatform(height - 80 - i * 80);
    }

    document.getElementById('startBtn').classList.add('hidden');
    updateStats();

    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

function createPlatform(y) {
    const types = ['normal', 'normal', 'normal', 'moving', 'breaking'];
    const type = types[Math.floor(Math.random() * types.length)];
    const w = type === 'breaking' ? 50 : 70;

    platforms.push({
        x: 30 + Math.random() * (width - 60 - w),
        y: y,
        width: w,
        height: 15,
        type: type,
        direction: Math.random() > 0.5 ? 1 : -1,
        broken: false
    });
}

function gameLoop() {
    update();
    draw();
    if (isPlaying) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function update() {
    player.vy += gravity;
    player.y += player.vy;

    if (player.x < 0) player.x = width;
    if (player.x > width) player.x = 0;

    if (player.y < height / 2) {
        const diff = height / 2 - player.y;
        player.y = height / 2;
        cameraY += diff;
        score = Math.max(score, Math.floor(cameraY / 10));
        updateStats();

        platforms.forEach(p => p.y += diff);

        while (platforms.length > 0 && platforms[0].y > height + 50) {
            platforms.shift();
            createPlatform(platforms[platforms.length - 1].y - 60 - Math.random() * 40);
        }
    }

    platforms.forEach(p => {
        if (p.type === 'moving') {
            p.x += p.direction * 2;
            if (p.x <= 0 || p.x + p.width >= width) {
                p.direction *= -1;
            }
        }
    });

    if (player.vy > 0) {
        platforms.forEach(p => {
            if (p.broken) return;

            if (player.x + player.width/2 > p.x &&
                player.x - player.width/2 < p.x + p.width &&
                player.y + player.height/2 > p.y &&
                player.y + player.height/2 < p.y + p.height + player.vy) {

                if (p.type === 'breaking') {
                    p.broken = true;
                } else {
                    player.y = p.y - player.height/2;
                    player.vy = jumpForce;
                }
            }
        });
    }

    if (player.y > height + 50) {
        endGame();
    }
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f7fa');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    platforms.forEach(p => {
        if (p.broken) {
            ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
        } else if (p.type === 'moving') {
            ctx.fillStyle = '#2196f3';
        } else if (p.type === 'breaking') {
            ctx.fillStyle = '#ff9800';
        } else {
            ctx.fillStyle = '#4caf50';
        }

        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 5);
        ctx.fill();

        if (!p.broken && p.type === 'normal') {
            ctx.fillStyle = '#81c784';
            ctx.beginPath();
            ctx.roundRect(p.x + 3, p.y + 3, p.width - 6, p.height - 6, 3);
            ctx.fill();
        }
    });

    ctx.fillStyle = '#ff5722';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.width/2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(player.x - 6, player.y - 4, 5, 0, Math.PI * 2);
    ctx.arc(player.x + 6, player.y - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x - 6, player.y - 4, 2, 0, Math.PI * 2);
    ctx.arc(player.x + 6, player.y - 4, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e64a19';
    ctx.beginPath();
    ctx.arc(player.x, player.y + 5, 4, 0, Math.PI);
    ctx.fill();
}

function handleMouse(e) {
    if (!isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    player.x = (e.clientX - rect.left) * scaleX;
}

function handleTouch(e) {
    if (!isPlaying) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    player.x = (e.touches[0].clientX - rect.left) * scaleX;
}

function updateStats() {
    document.getElementById('height').textContent = score;
    document.getElementById('best').textContent = bestScore;
}

function endGame() {
    isPlaying = false;
    if (score > bestScore) {
        bestScore = score;
        updateStats();
    }
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('startBtn').textContent = '高度: ' + score + 'm - 再玩一次';
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
