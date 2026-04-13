const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let strings = [];
let mouseY = 0;
let isDragging = false;
let dragStringIndex = -1;
let time = 0;

const stringColors = ['#E74C3C', '#F39C12', '#F1C40F', '#2ECC71', '#3498DB', '#9B59B6'];

function init() {
    const spacing = canvas.height / 7;
    for (let i = 0; i < 6; i++) {
        const points = [];
        const y = spacing * (i + 1);
        for (let x = 0; x <= canvas.width; x += 5) {
            points.push({
                x,
                baseY: y,
                y,
                vy: 0
            });
        }
        strings.push({
            points,
            color: stringColors[i],
            tension: 0.03 + i * 0.005,
            damping: 0.98
        });
    }
}

function pluckAll() {
    strings.forEach((string, i) => {
        const midIndex = Math.floor(string.points.length / 2);
        string.points[midIndex].vy = (Math.random() - 0.5) * 15;
    });
}

function updateStrings() {
    strings.forEach(string => {
        string.points.forEach((point, i) => {
            if (i === 0 || i === string.points.length - 1) return;

            const force = (point.baseY - point.y) * string.tension;

            const left = string.points[i - 1];
            const right = string.points[i + 1];
            const neighborForce = ((left.y + right.y) / 2 - point.y) * string.tension * 2;

            point.vy += force + neighborForce;
            point.vy *= string.damping;
            point.y += point.vy;
        });
    });
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1008');
    gradient.addColorStop(1, '#2a1810');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#3a2820';
    ctx.fillRect(0, 0, 20, canvas.height);
    ctx.fillRect(canvas.width - 20, 0, 20, canvas.height);
}

function drawStrings() {
    strings.forEach((string, stringIndex) => {
        ctx.beginPath();
        ctx.moveTo(string.points[0].x, string.points[0].y);

        for (let i = 1; i < string.points.length - 1; i++) {
            const p = string.points[i];
            const next = string.points[i + 1];
            const cpx = (p.x + next.x) / 2;
            const cpy = (p.y + next.y) / 2;
            ctx.quadraticCurveTo(p.x, p.y, cpx, cpy);
        }

        const last = string.points[string.points.length - 1];
        ctx.lineTo(last.x, last.y);

        const maxVelocity = Math.max(...string.points.map(p => Math.abs(p.vy)));
        const brightness = Math.min(1, maxVelocity * 0.3);

        ctx.strokeStyle = string.color;
        ctx.lineWidth = 3 - stringIndex * 0.3;
        ctx.stroke();

        if (brightness > 0.1) {
            ctx.shadowColor = string.color;
            ctx.shadowBlur = brightness * 20;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText('彈性弦模擬', 20, 28);
}

function getStringAtY(y) {
    for (let i = 0; i < strings.length; i++) {
        const stringY = strings[i].points[0].baseY;
        if (Math.abs(y - stringY) < 20) {
            return i;
        }
    }
    return -1;
}

function animate() {
    time++;
    updateStrings();
    drawBackground();
    drawStrings();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    dragStringIndex = getStringAtY(y);
    if (dragStringIndex >= 0) {
        isDragging = true;
        mouseY = y;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && dragStringIndex >= 0) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);

        const string = strings[dragStringIndex];
        string.points.forEach((point, i) => {
            if (i === 0 || i === string.points.length - 1) return;
            const dist = Math.abs(point.x - x);
            if (dist < 50) {
                const influence = 1 - dist / 50;
                point.y = point.baseY + (y - point.baseY) * influence;
            }
        });
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    dragStringIndex = -1;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    dragStringIndex = -1;
});

document.getElementById('pluckBtn').addEventListener('click', pluckAll);

init();
animate();
