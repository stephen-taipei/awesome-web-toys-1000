const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 500;
let ship = { x: 0, y: 0, width: 30, height: 30 };
let bullets = [];
let enemies = [];
let particles = [];
let score = 0, lives = 3;
let isPlaying = false;
let animationId = null;
let frameCount = 0;
let autoFire = true;

function init() {
    setupCanvas();
    document.getElementById('startBtn').addEventListener('click', startGame);
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('click', shoot);
    canvas.addEventListener('touchstart', shoot);
    draw();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.4;
    canvas.width = width;
    canvas.height = height;
    ship.x = width / 2;
    ship.y = height - 60;
}

function startGame() {
    score = 0;
    lives = 3;
    bullets = [];
    enemies = [];
    particles = [];
    frameCount = 0;
    isPlaying = true;

    document.getElementById('startBtn').classList.add('hidden');
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
    frameCount++;

    if (frameCount % 15 === 0 && autoFire) {
        shoot();
    }

    const spawnRate = Math.max(30, 90 - Math.floor(score / 50));
    if (frameCount % spawnRate === 0) {
        spawnEnemy();
    }

    bullets.forEach(b => b.y -= b.speed);
    bullets = bullets.filter(b => b.y > -10);

    enemies.forEach(e => {
        e.y += e.speed;
        e.x += Math.sin(e.y * 0.02 + e.wobble) * e.wobbleAmp;
    });

    bullets.forEach((bullet, bi) => {
        enemies.forEach((enemy, ei) => {
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            if (Math.abs(dx) < enemy.size && Math.abs(dy) < enemy.size) {
                createExplosion(enemy.x, enemy.y, enemy.color);
                enemies.splice(ei, 1);
                bullets.splice(bi, 1);
                score += 10;
                updateStats();
            }
        });
    });

    enemies = enemies.filter(enemy => {
        if (enemy.y > height + enemy.size) {
            lives--;
            updateStats();
            if (lives <= 0) endGame();
            return false;
        }

        const dx = enemy.x - ship.x;
        const dy = enemy.y - ship.y;
        if (Math.abs(dx) < (enemy.size + ship.width/2) && Math.abs(dy) < (enemy.size + ship.height/2)) {
            createExplosion(ship.x, ship.y, '#00ffff');
            lives--;
            updateStats();
            if (lives <= 0) endGame();
            return false;
        }
        return true;
    });

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.vy += 0.1;
    });
    particles = particles.filter(p => p.life > 0);
}

function spawnEnemy() {
    const colors = ['#ff0066', '#ff6600', '#ffff00', '#00ff00'];
    enemies.push({
        x: 30 + Math.random() * (width - 60),
        y: -30,
        size: 15 + Math.random() * 10,
        speed: 2 + Math.random() * 2 + score * 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
        wobble: Math.random() * Math.PI * 2,
        wobbleAmp: Math.random() * 2
    });
}

function shoot() {
    if (!isPlaying) return;
    bullets.push({
        x: ship.x,
        y: ship.y - ship.height/2,
        speed: 10
    });
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * (2 + Math.random() * 3),
            vy: Math.sin(angle) * (2 + Math.random() * 3),
            color: color,
            life: 30 + Math.random() * 20
        });
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 50; i++) {
        const x = (i * 73 + frameCount * 0.5) % width;
        const y = (i * 37 + frameCount * (0.2 + (i % 3) * 0.1)) % height;
        ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + (i % 5) * 0.15) + ')';
        ctx.fillRect(x, y, 1 + (i % 2), 1 + (i % 2));
    }

    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y - ship.height/2);
    ctx.lineTo(ship.x - ship.width/2, ship.y + ship.height/2);
    ctx.lineTo(ship.x, ship.y + ship.height/4);
    ctx.lineTo(ship.x + ship.width/2, ship.y + ship.height/2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0088ff';
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y + ship.height/4);
    ctx.lineTo(ship.x - 5, ship.y + ship.height/2 + Math.random() * 10);
    ctx.lineTo(ship.x + 5, ship.y + ship.height/2 + Math.random() * 10);
    ctx.closePath();
    ctx.fill();

    bullets.forEach(b => {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(b.x - 2, b.y - 8, 4, 16);
        ctx.fillStyle = '#fff';
        ctx.fillRect(b.x - 1, b.y - 6, 2, 12);
    });

    enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(e.x - e.size * 0.3, e.y - e.size * 0.2, e.size * 0.25, 0, Math.PI * 2);
        ctx.arc(e.x + e.size * 0.3, e.y - e.size * 0.2, e.size * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(e.x - e.size * 0.3, e.y - e.size * 0.2, e.size * 0.1, 0, Math.PI * 2);
        ctx.arc(e.x + e.size * 0.3, e.y - e.size * 0.2, e.size * 0.1, 0, Math.PI * 2);
        ctx.fill();
    });

    particles.forEach(p => {
        ctx.globalAlpha = p.life / 50;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function handleMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    ship.x = (e.clientX - rect.left) * scaleX;
    ship.x = Math.max(ship.width/2, Math.min(width - ship.width/2, ship.x));
}

function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    ship.x = (e.touches[0].clientX - rect.left) * scaleX;
    ship.x = Math.max(ship.width/2, Math.min(width - ship.width/2, ship.x));
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = '❤️'.repeat(Math.max(0, lives));
}

function endGame() {
    isPlaying = false;
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('startBtn').textContent = '分數: ' + score + ' - 再玩一次';
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
