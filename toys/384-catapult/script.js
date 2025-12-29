const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const ammoEl = document.getElementById('ammo');
const resultEl = document.getElementById('result');
const resetBtn = document.getElementById('resetBtn');

let score = 0;
let ammo = 5;
let projectile = null;
let targets = [];
let dragging = false;
let dragStart = { x: 0, y: 0 };
let dragEnd = { x: 0, y: 0 };

const catapult = { x: 50, y: 280 };
const gravity = 0.3;
const groundY = 280;

function initGame() {
    score = 0;
    ammo = 5;
    projectile = null;
    targets = [];
    scoreEl.textContent = '0';
    ammoEl.textContent = '5';
    resultEl.textContent = '拖曳調整角度和力道!';

    for (let i = 0; i < 3; i++) {
        targets.push({
            x: 200 + i * 50 + Math.random() * 30,
            y: groundY - 20 - Math.random() * 40,
            width: 30,
            height: 40,
            hit: false
        });
    }
}

function launch() {
    if (ammo <= 0 || projectile) return;

    const dx = dragStart.x - dragEnd.x;
    const dy = dragStart.y - dragEnd.y;
    const power = Math.min(Math.sqrt(dx*dx + dy*dy) / 10, 15);

    projectile = {
        x: catapult.x,
        y: catapult.y - 20,
        vx: dx / 10,
        vy: dy / 10,
        radius: 10
    };

    ammo--;
    ammoEl.textContent = ammo;
}

function update() {
    if (!projectile) return;

    projectile.vy += gravity;
    projectile.x += projectile.vx;
    projectile.y += projectile.vy;

    // Check target hits
    targets.forEach(t => {
        if (!t.hit &&
            projectile.x > t.x && projectile.x < t.x + t.width &&
            projectile.y > t.y && projectile.y < t.y + t.height) {
            t.hit = true;
            score += 100;
            scoreEl.textContent = score;
            resultEl.textContent = '🎯 命中! +100';
        }
    });

    // Check ground/out of bounds
    if (projectile.y > groundY || projectile.x > canvas.width + 50 || projectile.x < -50) {
        projectile = null;

        const remaining = targets.filter(t => !t.hit).length;
        if (remaining === 0) {
            resultEl.textContent = '🎉 全部擊中!';
            setTimeout(initGame, 2000);
        } else if (ammo === 0) {
            resultEl.textContent = `遊戲結束! 分數: ${score}`;
        } else {
            resultEl.textContent = '拖曳調整角度和力道!';
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, groundY);

    // Ground
    ctx.fillStyle = '#228b22';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // Catapult
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(catapult.x - 15, catapult.y - 5, 30, 20);
    ctx.fillRect(catapult.x - 5, catapult.y - 30, 10, 30);

    // Targets
    targets.forEach(t => {
        if (!t.hit) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(t.x, t.y, t.width, t.height);
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🎯', t.x + t.width/2, t.y + t.height/2 + 7);
        } else {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(t.x, t.y + 20, t.width, t.height - 10);
        }
    });

    // Drag line
    if (dragging) {
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragEnd.x, dragEnd.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Power indicator
        const power = Math.min(Math.sqrt(Math.pow(dragStart.x - dragEnd.x, 2) + Math.pow(dragStart.y - dragEnd.y, 2)) / 10, 15);
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText(`力道: ${Math.round(power * 10)}%`, dragEnd.x, dragEnd.y - 10);
    }

    // Projectile
    if (projectile) {
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Ammo display
    if (!projectile && ammo > 0) {
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(catapult.x, catapult.y - 25, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
}

canvas.addEventListener('mousedown', (e) => {
    if (projectile || ammo <= 0) return;
    dragging = true;
    dragStart = getPos(e);
    dragEnd = getPos(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (dragging) dragEnd = getPos(e);
});

canvas.addEventListener('mouseup', () => {
    if (dragging) { launch(); dragging = false; }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (projectile || ammo <= 0) return;
    dragging = true;
    dragStart = getPos(e);
    dragEnd = getPos(e);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (dragging) dragEnd = getPos(e);
});

canvas.addEventListener('touchend', () => {
    if (dragging) { launch(); dragging = false; }
});

resetBtn.addEventListener('click', initGame);

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initGame();
gameLoop();
