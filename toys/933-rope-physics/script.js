const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const segments = 25;
const segmentLength = 10;
let points = [];
let time = 0;
let dragIndex = -1;

function init() {
    points = [];
    const startX = canvas.width / 2;
    const startY = 50;

    for (let i = 0; i < segments; i++) {
        points.push({
            x: startX,
            y: startY + i * segmentLength,
            oldX: startX,
            oldY: startY + i * segmentLength,
            pinned: i === 0
        });
    }
}

function updatePhysics() {
    const gravity = 0.8;
    const friction = 0.98;

    points.forEach((p, i) => {
        if (p.pinned || i === dragIndex) return;

        const vx = (p.x - p.oldX) * friction;
        const vy = (p.y - p.oldY) * friction;

        p.oldX = p.x;
        p.oldY = p.y;

        p.x += vx;
        p.y += vy + gravity;

        if (p.y > canvas.height - 10) {
            p.y = canvas.height - 10;
            p.oldY = p.y + vy * 0.5;
        }
        if (p.x < 10) { p.x = 10; p.oldX = p.x + vx * 0.5; }
        if (p.x > canvas.width - 10) { p.x = canvas.width - 10; p.oldX = p.x + vx * 0.5; }
    });

    for (let iter = 0; iter < 5; iter++) {
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const diff = segmentLength - distance;
            const percent = diff / distance / 2;

            const offsetX = dx * percent;
            const offsetY = dy * percent;

            if (!p1.pinned && dragIndex !== i) {
                p1.x -= offsetX;
                p1.y -= offsetY;
            }
            if (!p2.pinned && dragIndex !== i + 1) {
                p2.x += offsetX;
                p2.y += offsetY;
            }
        }
    }
}

function drawRope() {
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    ctx.strokeStyle = '#FFC107';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    ctx.fillStyle = '#666';
    ctx.fillRect(points[0].x - 20, points[0].y - 15, 40, 20);
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, 6, 0, Math.PI * 2);
    ctx.fill();

    const last = points[points.length - 1];
    ctx.fillStyle = '#CD853F';
    ctx.beginPath();
    ctx.arc(last.x, last.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#FFC107';
    ctx.font = '11px Arial';
    ctx.fillText(`節數: ${segments}`, 20, 28);
}

function animate() {
    time++;
    ctx.fillStyle = '#1a1a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updatePhysics();
    drawRope();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    let closestDist = 30;
    points.forEach((p, i) => {
        if (p.pinned) return;
        const dist = Math.sqrt((p.x - mx) ** 2 + (p.y - my) ** 2);
        if (dist < closestDist) {
            closestDist = dist;
            dragIndex = i;
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    if (dragIndex === -1) return;
    const rect = canvas.getBoundingClientRect();
    points[dragIndex].x = (e.clientX - rect.left) * (canvas.width / rect.width);
    points[dragIndex].y = (e.clientY - rect.top) * (canvas.height / rect.height);
});

canvas.addEventListener('mouseup', () => { dragIndex = -1; });
canvas.addEventListener('mouseleave', () => { dragIndex = -1; });

document.getElementById('resetBtn').addEventListener('click', init);

init();
animate();
