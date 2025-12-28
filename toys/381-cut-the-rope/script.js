const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultEl = document.getElementById('result');
const levelEl = document.getElementById('level');
const resetBtn = document.getElementById('resetBtn');

let level = 1;
let candy = { x: 180, y: 100, vx: 0, vy: 0, radius: 20 };
let target = { x: 180, y: 350, radius: 35 };
let ropes = [];
let cutting = false;
let cutPath = [];
let gameOver = false;
let won = false;

const gravity = 0.3;
const friction = 0.99;

function initLevel() {
    gameOver = false;
    won = false;
    candy = { x: 180, y: 80, vx: 0, vy: 0, radius: 20 };
    cutPath = [];
    resultEl.textContent = '滑動切斷繩子!';

    if (level === 1) {
        ropes = [{ x: 180, y: 0, cut: false }];
        target = { x: 180, y: 350, radius: 35 };
    } else if (level === 2) {
        ropes = [{ x: 100, y: 0, cut: false }, { x: 260, y: 0, cut: false }];
        candy.x = 180;
        target = { x: 280, y: 350, radius: 35 };
    } else {
        ropes = [{ x: 80, y: 0, cut: false }, { x: 180, y: 50, cut: false }, { x: 280, y: 0, cut: false }];
        candy.x = 180;
        target = { x: 100, y: 350, radius: 35 };
    }
}

function update() {
    if (gameOver) return;

    const activeRopes = ropes.filter(r => !r.cut);

    if (activeRopes.length === 0) {
        candy.vy += gravity;
        candy.vx *= friction;
        candy.vy *= friction;
        candy.x += candy.vx;
        candy.y += candy.vy;

        if (candy.x < candy.radius) { candy.x = candy.radius; candy.vx *= -0.5; }
        if (candy.x > canvas.width - candy.radius) { candy.x = canvas.width - candy.radius; candy.vx *= -0.5; }

        const dx = candy.x - target.x;
        const dy = candy.y - target.y;
        if (Math.sqrt(dx*dx + dy*dy) < candy.radius + target.radius) {
            gameOver = true;
            won = true;
            resultEl.textContent = '🎉 成功!';
            setTimeout(() => { level++; levelEl.textContent = level; initLevel(); }, 1500);
        }

        if (candy.y > canvas.height + 50) {
            gameOver = true;
            resultEl.textContent = '❌ 失敗!';
        }
    } else {
        let avgX = 0, avgY = 0;
        activeRopes.forEach(r => { avgX += r.x; avgY += r.y + 80; });
        avgX /= activeRopes.length;
        avgY /= activeRopes.length;
        candy.x += (avgX - candy.x) * 0.1;
        candy.y += (avgY - candy.y) * 0.1;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Target
    ctx.fillStyle = '#56ab2f';
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('😋', target.x, target.y + 10);

    // Ropes
    ropes.forEach(rope => {
        if (!rope.cut) {
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(rope.x, rope.y);
            ctx.lineTo(candy.x, candy.y);
            ctx.stroke();
        }
    });

    // Candy
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(candy.x, candy.y, candy.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('🍬', candy.x, candy.y + 8);

    // Cut path
    if (cutPath.length > 1) {
        ctx.strokeStyle = 'rgba(255,0,0,0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cutPath[0].x, cutPath[0].y);
        cutPath.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
    }
}

function checkCut() {
    if (cutPath.length < 2) return;

    ropes.forEach(rope => {
        if (rope.cut) return;
        for (let i = 1; i < cutPath.length; i++) {
            if (lineIntersect(cutPath[i-1], cutPath[i], {x: rope.x, y: rope.y}, candy)) {
                rope.cut = true;
                break;
            }
        }
    });
}

function lineIntersect(p1, p2, p3, p4) {
    const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
    if (d === 0) return false;
    const t = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
    const u = -((p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x)) / d;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
}

canvas.addEventListener('mousedown', (e) => { cutting = true; cutPath = [getPos(e)]; });
canvas.addEventListener('mousemove', (e) => { if (cutting) { cutPath.push(getPos(e)); checkCut(); } });
canvas.addEventListener('mouseup', () => { cutting = false; cutPath = []; });

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); cutting = true; cutPath = [getPos(e)]; });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (cutting) { cutPath.push(getPos(e)); checkCut(); } });
canvas.addEventListener('touchend', () => { cutting = false; cutPath = []; });

resetBtn.addEventListener('click', initLevel);

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initLevel();
gameLoop();
