const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let targets = [];
let score = 0;
let shots = 0;
let timeLeft = 30;
let gameRunning = false;
let gameTimer = null;
let hits = [];

class Target {
    constructor() {
        this.radius = 20 + Math.random() * 15;
        this.x = this.radius + Math.random() * (canvas.width - this.radius * 2);
        this.y = this.radius + Math.random() * (canvas.height - this.radius * 2);
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.points = Math.round(50 / this.radius * 10);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x <= this.radius || this.x >= canvas.width - this.radius) this.vx *= -1;
        if (this.y <= this.radius || this.y >= canvas.height - this.radius) this.vy *= -1;
    }

    draw() {
        const rings = [
            { r: this.radius, color: '#fff' },
            { r: this.radius * 0.8, color: '#F44336' },
            { r: this.radius * 0.6, color: '#fff' },
            { r: this.radius * 0.4, color: '#F44336' },
            { r: this.radius * 0.2, color: '#FFD700' }
        ];

        rings.forEach(ring => {
            ctx.fillStyle = ring.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, ring.r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    contains(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }

    getPoints(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ratio = dist / this.radius;

        if (ratio < 0.2) return this.points * 3;
        if (ratio < 0.4) return this.points * 2;
        return this.points;
    }
}

function spawnTarget() {
    if (targets.length < 5) {
        targets.push(new Target());
    }
}

function draw() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    targets.forEach(t => {
        t.update();
        t.draw();
    });

    hits = hits.filter(h => {
        h.life--;
        ctx.fillStyle = `rgba(255, 215, 0, ${h.life / 30})`;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`+${h.points}`, h.x, h.y - (30 - h.life));
        return h.life > 0;
    });

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 180, 30);
    ctx.fillStyle = '#F44336';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    const accuracy = shots > 0 ? Math.round((score > 0 ? hits.length : 0) / shots * 100) : 0;
    ctx.fillText(`分數: ${score}  時間: ${timeLeft}s`, 20, 28);

    if (!gameRunning && timeLeft === 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#F44336';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('遊戲結束!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '16px Arial';
        ctx.fillText(`最終分數: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText(`射擊次數: ${shots}`, canvas.width / 2, canvas.height / 2 + 35);
    }
}

function startGame() {
    if (gameRunning) return;

    targets = [];
    score = 0;
    shots = 0;
    timeLeft = 30;
    hits = [];
    gameRunning = true;

    for (let i = 0; i < 3; i++) {
        spawnTarget();
    }

    gameTimer = setInterval(() => {
        timeLeft--;
        if (Math.random() < 0.3) spawnTarget();

        if (timeLeft <= 0) {
            gameRunning = false;
            clearInterval(gameTimer);
        }
    }, 1000);
}

canvas.addEventListener('click', (e) => {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    shots++;

    for (let i = targets.length - 1; i >= 0; i--) {
        if (targets[i].contains(mx, my)) {
            const points = targets[i].getPoints(mx, my);
            score += points;
            hits.push({ x: mx, y: my, points, life: 30 });
            targets.splice(i, 1);
            spawnTarget();
            break;
        }
    }
});

document.getElementById('startBtn').addEventListener('click', startGame);

function animate() {
    draw();
    requestAnimationFrame(animate);
}

animate();
