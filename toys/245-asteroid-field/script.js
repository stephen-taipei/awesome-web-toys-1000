const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 500;
let ship = { x: 0, y: 0, width: 20, height: 25 };
let asteroids = [];
let stars = [];
let distance = 0, lives = 3;
let isPlaying = false;
let animationId = null;
let frameCount = 0;

function init() {
    setupCanvas();
    createStars();
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
    ship.x = width / 2;
    ship.y = height - 80;
}

function createStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            speed: 1 + Math.random() * 3
        });
    }
}

function startGame() {
    distance = 0;
    lives = 3;
    asteroids = [];
    frameCount = 0;
    isPlaying = true;
    ship.x = width / 2;

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
    distance += 1;
    updateStats();

    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
        }
    });

    const spawnRate = Math.max(15, 40 - Math.floor(distance / 500));
    if (frameCount % spawnRate === 0) {
        spawnAsteroid();
    }

    asteroids.forEach(a => {
        a.y += a.speed;
        a.rotation += a.rotSpeed;
    });

    asteroids = asteroids.filter(a => {
        if (a.y > height + a.size) return false;

        const dx = a.x - ship.x;
        const dy = a.y - ship.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < a.size + 12) {
            lives--;
            updateStats();
            if (lives <= 0) endGame();
            return false;
        }
        return true;
    });
}

function spawnAsteroid() {
    const size = 15 + Math.random() * 35;
    const vertices = [];
    const numVertices = 6 + Math.floor(Math.random() * 4);

    for (let i = 0; i < numVertices; i++) {
        const angle = (Math.PI * 2 / numVertices) * i;
        const r = size * (0.7 + Math.random() * 0.3);
        vertices.push({ angle, r });
    }

    asteroids.push({
        x: 30 + Math.random() * (width - 60),
        y: -size,
        size: size,
        speed: 3 + Math.random() * 3 + distance * 0.001,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        vertices: vertices,
        color: '#' + Math.floor(0x666666 + Math.random() * 0x444444).toString(16)
    });
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    stars.forEach(star => {
        ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + star.size * 0.3) + ')';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    asteroids.forEach(a => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);

        ctx.fillStyle = a.color;
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        a.vertices.forEach((v, i) => {
            const x = Math.cos(v.angle) * v.r;
            const y = Math.sin(v.angle) * v.r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    });

    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y - ship.height/2);
    ctx.lineTo(ship.x - ship.width/2, ship.y + ship.height/2);
    ctx.lineTo(ship.x, ship.y + ship.height/4);
    ctx.lineTo(ship.x + ship.width/2, ship.y + ship.height/2);
    ctx.closePath();
    ctx.fill();

    if (isPlaying) {
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(ship.x - 4, ship.y + ship.height/2);
        ctx.lineTo(ship.x, ship.y + ship.height/2 + 10 + Math.random() * 8);
        ctx.lineTo(ship.x + 4, ship.y + ship.height/2);
        ctx.closePath();
        ctx.fill();
    }
}

function handleMouse(e) {
    if (!isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    ship.x = (e.clientX - rect.left) * scaleX;
    ship.x = Math.max(ship.width, Math.min(width - ship.width, ship.x));
}

function handleTouch(e) {
    if (!isPlaying) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    ship.x = (e.touches[0].clientX - rect.left) * scaleX;
    ship.x = Math.max(ship.width, Math.min(width - ship.width, ship.x));
}

function updateStats() {
    document.getElementById('distance').textContent = distance;
    document.getElementById('lives').textContent = '❤️'.repeat(Math.max(0, lives));
}

function endGame() {
    isPlaying = false;
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('startBtn').textContent = '距離: ' + distance + 'm - 再玩一次';
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
