const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultEl = document.getElementById('result');
const levelEl = document.getElementById('level');
const resetBtn = document.getElementById('resetBtn');

let level = 1;
let particles = [];
let paths = [];
let currentPath = [];
let drawing = false;
let source = { x: 180, y: 30 };
let target = { x: 180, y: 350, width: 60, height: 40 };
let obstacles = [];
let gameWon = false;
let waterCollected = 0;

function initLevel() {
    particles = [];
    paths = [];
    currentPath = [];
    gameWon = false;
    waterCollected = 0;
    resultEl.textContent = '畫線引導水流到浴缸!';

    if (level === 1) {
        source = { x: 180, y: 30 };
        target = { x: 150, y: 350, width: 60, height: 40 };
        obstacles = [];
    } else if (level === 2) {
        source = { x: 80, y: 30 };
        target = { x: 270, y: 350, width: 60, height: 40 };
        obstacles = [{ x: 150, y: 150, width: 60, height: 20 }];
    } else {
        source = { x: 280, y: 30 };
        target = { x: 50, y: 350, width: 60, height: 40 };
        obstacles = [
            { x: 100, y: 120, width: 80, height: 20 },
            { x: 200, y: 220, width: 80, height: 20 }
        ];
    }
}

function spawnParticle() {
    if (particles.length < 100 && !gameWon) {
        particles.push({
            x: source.x + (Math.random() - 0.5) * 20,
            y: source.y,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 2 + 1,
            radius: 4
        });
    }
}

function update() {
    if (gameWon) return;

    particles.forEach(p => {
        p.vy += 0.2;
        p.x += p.vx;
        p.y += p.vy;

        // Path collision
        paths.forEach(path => {
            for (let i = 1; i < path.length; i++) {
                const dx = path[i].x - path[i-1].x;
                const dy = path[i].y - path[i-1].y;
                const len = Math.sqrt(dx*dx + dy*dy);
                if (len === 0) continue;

                const nx = -dy / len;
                const ny = dx / len;

                const px = p.x - path[i-1].x;
                const py = p.y - path[i-1].y;
                const proj = (px * dx + py * dy) / len;

                if (proj >= 0 && proj <= len) {
                    const dist = px * nx + py * ny;
                    if (Math.abs(dist) < p.radius + 3) {
                        p.x += nx * (p.radius + 3 - Math.abs(dist)) * Math.sign(dist);
                        p.y += ny * (p.radius + 3 - Math.abs(dist)) * Math.sign(dist);

                        const dot = p.vx * nx + p.vy * ny;
                        p.vx -= 1.5 * dot * nx;
                        p.vy -= 1.5 * dot * ny;
                        p.vx += dx / len * 0.5;
                        p.vy += dy / len * 0.5;
                    }
                }
            }
        });

        // Obstacle collision
        obstacles.forEach(obs => {
            if (p.x > obs.x && p.x < obs.x + obs.width &&
                p.y > obs.y && p.y < obs.y + obs.height) {
                p.y = obs.y - p.radius;
                p.vy *= -0.3;
            }
        });

        // Wall collision
        if (p.x < p.radius) { p.x = p.radius; p.vx *= -0.5; }
        if (p.x > canvas.width - p.radius) { p.x = canvas.width - p.radius; p.vx *= -0.5; }

        // Target collision
        if (p.x > target.x && p.x < target.x + target.width &&
            p.y > target.y && p.y < target.y + target.height) {
            waterCollected++;
            p.y = canvas.height + 100;
        }
    });

    particles = particles.filter(p => p.y < canvas.height + 50);

    if (waterCollected >= 30) {
        gameWon = true;
        resultEl.textContent = '🎉 成功!';
        setTimeout(() => { level++; levelEl.textContent = level; initLevel(); }, 1500);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Source
    ctx.fillStyle = '#74b9ff';
    ctx.beginPath();
    ctx.arc(source.x, source.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💧', source.x, source.y + 7);

    // Target
    ctx.fillStyle = '#fff';
    ctx.fillRect(target.x, target.y, target.width, target.height);
    ctx.strokeStyle = '#0984e3';
    ctx.lineWidth = 3;
    ctx.strokeRect(target.x, target.y, target.width, target.height);
    ctx.fillStyle = '#333';
    ctx.fillText('🛁', target.x + target.width/2, target.y + 25);

    // Progress
    ctx.fillStyle = '#74b9ff';
    const progress = Math.min(waterCollected / 30, 1);
    ctx.fillRect(target.x, target.y + target.height - progress * target.height, target.width, progress * target.height);

    // Obstacles
    ctx.fillStyle = '#636e72';
    obstacles.forEach(obs => ctx.fillRect(obs.x, obs.y, obs.width, obs.height));

    // Paths
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    paths.forEach(path => {
        if (path.length > 1) {
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            path.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        }
    });

    // Current path
    if (currentPath.length > 1) {
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        currentPath.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
    }

    // Particles
    ctx.fillStyle = '#0984e3';
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
}

canvas.addEventListener('mousedown', (e) => { drawing = true; currentPath = [getPos(e)]; });
canvas.addEventListener('mousemove', (e) => { if (drawing) currentPath.push(getPos(e)); });
canvas.addEventListener('mouseup', () => { if (currentPath.length > 1) paths.push([...currentPath]); drawing = false; currentPath = []; });

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; currentPath = [getPos(e)]; });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (drawing) currentPath.push(getPos(e)); });
canvas.addEventListener('touchend', () => { if (currentPath.length > 1) paths.push([...currentPath]); drawing = false; currentPath = []; });

resetBtn.addEventListener('click', initLevel);

let frameCount = 0;
function gameLoop() {
    frameCount++;
    if (frameCount % 5 === 0) spawnParticle();
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initLevel();
gameLoop();
