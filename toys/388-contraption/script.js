const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const resultEl = document.getElementById('result');

let running = false;
let completed = false;

const ball = { x: 50, y: 30, vx: 0, vy: 0, radius: 12, active: false };
const dominoes = [];
const platforms = [
    { x: 30, y: 80, width: 100, height: 10, angle: 0.1 },
    { x: 180, y: 150, width: 120, height: 10, angle: -0.1 },
    { x: 50, y: 230, width: 100, height: 10, angle: 0.05 }
];
const seesaw = { x: 180, y: 300, width: 120, height: 8, angle: 0, pivot: { x: 240, y: 300 } };
const target = { x: 320, y: 360, width: 30, height: 30, hit: false };
const weight = { x: 260, y: 280, vy: 0, radius: 15, falling: false };

function initGame() {
    running = false;
    completed = false;
    ball.x = 50; ball.y = 30; ball.vx = 0; ball.vy = 0; ball.active = false;
    weight.x = 260; weight.y = 280; weight.vy = 0; weight.falling = false;
    seesaw.angle = 0;
    target.hit = false;
    resultEl.textContent = '點擊啟動觀看連鎖反應!';

    dominoes.length = 0;
    for (let i = 0; i < 5; i++) {
        dominoes.push({ x: 100 + i * 18, y: 140, angle: 0, fallen: false, height: 35, width: 8 });
    }
}

function update() {
    if (!running) return;

    const gravity = 0.3;

    // Ball physics
    if (ball.active) {
        ball.vy += gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Platform collision
        platforms.forEach(p => {
            const cos = Math.cos(p.angle);
            const sin = Math.sin(p.angle);

            if (ball.x > p.x && ball.x < p.x + p.width &&
                ball.y + ball.radius > p.y && ball.y - ball.radius < p.y + p.height) {
                ball.y = p.y - ball.radius;
                ball.vy = -ball.vy * 0.3;
                ball.vx += sin * 2;
            }
        });

        // First domino trigger
        if (dominoes[0] && !dominoes[0].fallen &&
            ball.x > dominoes[0].x - 15 && ball.y > 100) {
            dominoes[0].fallen = true;
        }
    }

    // Dominoes falling
    dominoes.forEach((d, i) => {
        if (d.fallen && d.angle < Math.PI / 3) {
            d.angle += 0.08;
            if (i < dominoes.length - 1 && d.angle > 0.3) {
                dominoes[i + 1].fallen = true;
            }
        }
    });

    // Last domino triggers weight
    const lastDomino = dominoes[dominoes.length - 1];
    if (lastDomino && lastDomino.angle > Math.PI / 4 && !weight.falling) {
        weight.falling = true;
    }

    // Weight falls
    if (weight.falling) {
        weight.vy += gravity;
        weight.y += weight.vy;

        // Hit seesaw
        if (weight.y > seesaw.pivot.y - 20) {
            weight.y = seesaw.pivot.y - 20;
            weight.vy = 0;
            seesaw.angle = Math.min(seesaw.angle + 0.1, 0.4);
        }
    }

    // Seesaw launches ball to target
    if (seesaw.angle > 0.3 && !target.hit) {
        target.hit = true;
        completed = true;
        running = false;
        resultEl.textContent = '🎉 連鎖反應完成!';
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Platforms
    platforms.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = '#636e72';
        ctx.fillRect(0, 0, p.width, p.height);
        ctx.restore();
    });

    // Dominoes
    dominoes.forEach(d => {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle);
        ctx.fillStyle = d.fallen ? '#e74c3c' : '#2d3436';
        ctx.fillRect(-d.width/2, -d.height, d.width, d.height);
        ctx.restore();
    });

    // Seesaw
    ctx.save();
    ctx.translate(seesaw.pivot.x, seesaw.pivot.y);
    ctx.rotate(-seesaw.angle);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-seesaw.width, -seesaw.height/2, seesaw.width, seesaw.height);
    ctx.restore();

    // Pivot
    ctx.fillStyle = '#636e72';
    ctx.beginPath();
    ctx.moveTo(seesaw.pivot.x - 15, seesaw.pivot.y + 30);
    ctx.lineTo(seesaw.pivot.x + 15, seesaw.pivot.y + 30);
    ctx.lineTo(seesaw.pivot.x, seesaw.pivot.y);
    ctx.closePath();
    ctx.fill();

    // Weight
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(weight.x, weight.y, weight.radius, 0, Math.PI * 2);
    ctx.fill();

    // Target
    ctx.fillStyle = target.hit ? '#00b894' : '#fdcb6e';
    ctx.fillRect(target.x, target.y, target.width, target.height);
    ctx.fillStyle = '#333';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔔', target.x + 15, target.y + 22);

    // Ball
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Start arrow
    if (!running && !completed) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⬇ 開始', ball.x, ball.y - 20);
    }
}

startBtn.addEventListener('click', () => {
    if (running) return;
    if (completed) initGame();
    running = true;
    ball.active = true;
    ball.vx = 2;
    resultEl.textContent = '運行中...';
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initGame();
gameLoop();
