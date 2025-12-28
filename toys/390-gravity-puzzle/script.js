const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const levelEl = document.getElementById('level');
const resultEl = document.getElementById('result');

let level = 1;
let player = { x: 50, y: 50, vx: 0, vy: 0, size: 20 };
let target = { x: 300, y: 300, size: 30 };
let walls = [];
let spikes = [];
let gravity = { x: 0, y: 0.3 };
let gameOver = false;
let won = false;

const friction = 0.9;

function initLevel() {
    gameOver = false;
    won = false;
    gravity = { x: 0, y: 0.3 };
    player = { x: 50, y: 50, vx: 0, vy: 0, size: 20 };
    resultEl.textContent = '切換重力方向到達目標!';

    if (level === 1) {
        target = { x: 300, y: 300, size: 30 };
        walls = [
            { x: 0, y: 180, width: 200, height: 20 },
            { x: 160, y: 100, width: 20, height: 100 }
        ];
        spikes = [];
    } else if (level === 2) {
        player = { x: 50, y: 300, vx: 0, vy: 0, size: 20 };
        target = { x: 300, y: 50, size: 30 };
        walls = [
            { x: 100, y: 0, width: 20, height: 200 },
            { x: 240, y: 160, width: 20, height: 200 }
        ];
        spikes = [{ x: 150, y: 340, width: 60, height: 20 }];
    } else {
        player = { x: 180, y: 180, vx: 0, vy: 0, size: 20 };
        target = { x: 300, y: 300, size: 30 };
        walls = [
            { x: 80, y: 80, width: 200, height: 20 },
            { x: 80, y: 260, width: 200, height: 20 },
            { x: 80, y: 80, width: 20, height: 200 },
            { x: 260, y: 80, width: 20, height: 200 }
        ];
        spikes = [
            { x: 120, y: 100, width: 40, height: 15 },
            { x: 200, y: 245, width: 40, height: 15 }
        ];
    }
}

function setGravity(dir) {
    if (gameOver) return;
    switch(dir) {
        case 'up': gravity = { x: 0, y: -0.3 }; break;
        case 'down': gravity = { x: 0, y: 0.3 }; break;
        case 'left': gravity = { x: -0.3, y: 0 }; break;
        case 'right': gravity = { x: 0.3, y: 0 }; break;
    }
}

function update() {
    if (gameOver) return;

    player.vx += gravity.x;
    player.vy += gravity.y;
    player.vx *= friction;
    player.vy *= friction;

    player.x += player.vx;
    player.y += player.vy;

    // Wall collision
    walls.forEach(w => {
        if (player.x + player.size > w.x && player.x < w.x + w.width &&
            player.y + player.size > w.y && player.y < w.y + w.height) {
            // Find smallest overlap
            const overlapLeft = player.x + player.size - w.x;
            const overlapRight = w.x + w.width - player.x;
            const overlapTop = player.y + player.size - w.y;
            const overlapBottom = w.y + w.height - player.y;

            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            if (minOverlap === overlapLeft) { player.x = w.x - player.size; player.vx = 0; }
            else if (minOverlap === overlapRight) { player.x = w.x + w.width; player.vx = 0; }
            else if (minOverlap === overlapTop) { player.y = w.y - player.size; player.vy = 0; }
            else { player.y = w.y + w.height; player.vy = 0; }
        }
    });

    // Canvas bounds
    if (player.x < 0) { player.x = 0; player.vx = 0; }
    if (player.x + player.size > canvas.width) { player.x = canvas.width - player.size; player.vx = 0; }
    if (player.y < 0) { player.y = 0; player.vy = 0; }
    if (player.y + player.size > canvas.height) { player.y = canvas.height - player.size; player.vy = 0; }

    // Spike collision
    spikes.forEach(s => {
        if (player.x + player.size > s.x && player.x < s.x + s.width &&
            player.y + player.size > s.y && player.y < s.y + s.height) {
            gameOver = true;
            resultEl.textContent = '❌ 撞到尖刺了!';
            setTimeout(initLevel, 1500);
        }
    });

    // Target collision
    const dx = (player.x + player.size/2) - (target.x + target.size/2);
    const dy = (player.y + player.size/2) - (target.y + target.size/2);
    if (Math.sqrt(dx*dx + dy*dy) < (player.size + target.size) / 2) {
        gameOver = true;
        won = true;
        resultEl.textContent = '🎉 過關!';
        setTimeout(() => {
            level++;
            levelEl.textContent = level;
            initLevel();
        }, 1500);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gravity indicator
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(180, 180, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(180 + gravity.x * 50, 180 + gravity.y * 50, 8, 0, Math.PI * 2);
    ctx.fill();

    // Walls
    ctx.fillStyle = '#636e72';
    walls.forEach(w => ctx.fillRect(w.x, w.y, w.width, w.height));

    // Spikes
    ctx.fillStyle = '#e74c3c';
    spikes.forEach(s => {
        ctx.beginPath();
        for (let i = 0; i < s.width; i += 15) {
            ctx.moveTo(s.x + i, s.y + s.height);
            ctx.lineTo(s.x + i + 7, s.y);
            ctx.lineTo(s.x + i + 14, s.y + s.height);
        }
        ctx.fill();
    });

    // Target
    ctx.fillStyle = '#00b894';
    ctx.beginPath();
    ctx.arc(target.x + target.size/2, target.y + target.size/2, target.size/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('★', target.x + target.size/2, target.y + target.size/2 + 5);

    // Player
    ctx.fillStyle = won ? '#00b894' : '#fdcb6e';
    ctx.fillRect(player.x, player.y, player.size, player.size);
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(player.x + 6, player.y + 8, 3, 0, Math.PI * 2);
    ctx.arc(player.x + 14, player.y + 8, 3, 0, Math.PI * 2);
    ctx.fill();
}

document.querySelectorAll('.gravity-btn').forEach(btn => {
    btn.addEventListener('click', () => setGravity(btn.dataset.dir));
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') setGravity('up');
    if (e.key === 'ArrowDown') setGravity('down');
    if (e.key === 'ArrowLeft') setGravity('left');
    if (e.key === 'ArrowRight') setGravity('right');
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initLevel();
gameLoop();
