const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const cols = 15;
const rows = 10;
const spacing = 20;
const startX = (canvas.width - (cols - 1) * spacing) / 2;
const startY = 30;

let points = [];
let sticks = [];
let wind = false;
let time = 0;
let dragPoint = null;

class Point {
    constructor(x, y, pinned = false) {
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.pinned = pinned;
    }
}

class Stick {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.length = Math.sqrt(
            (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2
        );
    }
}

function init() {
    points = [];
    sticks = [];

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const pinned = y === 0 && (x === 0 || x === cols - 1 || x === Math.floor(cols / 2));
            points.push(new Point(startX + x * spacing, startY + y * spacing, pinned));
        }
    }

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const i = y * cols + x;
            if (x < cols - 1) sticks.push(new Stick(points[i], points[i + 1]));
            if (y < rows - 1) sticks.push(new Stick(points[i], points[i + cols]));
        }
    }
}

function updatePoints() {
    const gravity = 0.5;
    const friction = 0.99;

    points.forEach(p => {
        if (p.pinned) return;

        const vx = (p.x - p.oldX) * friction;
        const vy = (p.y - p.oldY) * friction;

        p.oldX = p.x;
        p.oldY = p.y;

        p.x += vx;
        p.y += vy + gravity;

        if (wind) {
            p.x += Math.sin(time * 0.05 + p.y * 0.1) * 0.8;
        }

        if (p.y > canvas.height - 5) {
            p.y = canvas.height - 5;
            p.oldY = p.y + vy * 0.5;
        }
        if (p.x < 5) p.x = 5;
        if (p.x > canvas.width - 5) p.x = canvas.width - 5;
    });
}

function updateSticks() {
    for (let i = 0; i < 3; i++) {
        sticks.forEach(s => {
            const dx = s.p2.x - s.p1.x;
            const dy = s.p2.y - s.p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const diff = s.length - distance;
            const percent = diff / distance / 2;

            const offsetX = dx * percent;
            const offsetY = dy * percent;

            if (!s.p1.pinned) {
                s.p1.x -= offsetX;
                s.p1.y -= offsetY;
            }
            if (!s.p2.pinned) {
                s.p2.x += offsetX;
                s.p2.y += offsetY;
            }
        });
    }
}

function draw() {
    ctx.fillStyle = '#1a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows - 1; y++) {
        for (let x = 0; x < cols - 1; x++) {
            const i = y * cols + x;
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + cols + 1];
            const p4 = points[i + cols];

            const hue = 340 + (y / rows) * 20;
            ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.8)`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.closePath();
            ctx.fill();
        }
    }

    sticks.forEach(s => {
        ctx.strokeStyle = 'rgba(233, 30, 99, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.p1.x, s.p1.y);
        ctx.lineTo(s.p2.x, s.p2.y);
        ctx.stroke();
    });

    points.filter(p => p.pinned).forEach(p => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 80, 30);
    ctx.fillStyle = '#E91E63';
    ctx.font = '11px Arial';
    ctx.fillText(`風力: ${wind ? '開啟' : '關閉'}`, 20, 28);
}

function animate() {
    time++;
    updatePoints();
    updateSticks();
    draw();
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    let closest = null;
    let closestDist = 30;

    points.forEach(p => {
        const dist = Math.sqrt((p.x - mx) ** 2 + (p.y - my) ** 2);
        if (dist < closestDist) {
            closestDist = dist;
            closest = p;
        }
    });

    dragPoint = closest;
});

canvas.addEventListener('mousemove', (e) => {
    if (!dragPoint) return;
    const rect = canvas.getBoundingClientRect();
    dragPoint.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    dragPoint.y = (e.clientY - rect.top) * (canvas.height / rect.height);
});

canvas.addEventListener('mouseup', () => { dragPoint = null; });
canvas.addEventListener('mouseleave', () => { dragPoint = null; });

document.getElementById('windBtn').addEventListener('click', () => {
    wind = !wind;
});

init();
animate();
