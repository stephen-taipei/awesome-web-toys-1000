const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 400;
let points = [];
let sticks = [];
let isDragging = false;
let dragPoint = null;
let mouseX = 0, mouseY = 0;
let hasWind = false;

const cols = 15;
const rows = 10;
const spacing = 20;
const gravity = 0.5;
const friction = 0.99;
const bounce = 0.9;

function init() {
    setupCanvas();
    createCloth();

    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', endDrag);

    document.getElementById('windBtn').addEventListener('click', toggleWind);
    document.getElementById('resetBtn').addEventListener('click', createCloth);

    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.1;
    canvas.width = width;
    canvas.height = height;
}

function createCloth() {
    points = [];
    sticks = [];

    const startX = (width - (cols - 1) * spacing) / 2;
    const startY = 20;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const point = {
                x: startX + x * spacing,
                y: startY + y * spacing,
                oldX: startX + x * spacing,
                oldY: startY + y * spacing,
                pinned: y === 0
            };
            points.push(point);

            if (x > 0) {
                sticks.push({
                    p0: points[y * cols + x - 1],
                    p1: point,
                    length: spacing
                });
            }
            if (y > 0) {
                sticks.push({
                    p0: points[(y - 1) * cols + x],
                    p1: point,
                    length: spacing
                });
            }
        }
    }
}

function toggleWind() {
    hasWind = !hasWind;
    document.getElementById('windBtn').classList.toggle('active', hasWind);
}

function startDrag(e) {
    const pos = getPos(e);
    mouseX = pos.x;
    mouseY = pos.y;
    findDragPoint();
}

function handleTouchStart(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    findDragPoint();
}

function findDragPoint() {
    let minDist = 30;
    dragPoint = null;

    points.forEach(point => {
        if (point.pinned) return;
        const dx = mouseX - point.x;
        const dy = mouseY - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
            minDist = dist;
            dragPoint = point;
        }
    });

    isDragging = dragPoint !== null;
}

function drag(e) {
    const pos = getPos(e);
    mouseX = pos.x;
    mouseY = pos.y;
}

function handleTouchMove(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
}

function endDrag() {
    isDragging = false;
    dragPoint = null;
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    points.forEach(point => {
        if (point.pinned) return;

        const vx = (point.x - point.oldX) * friction;
        const vy = (point.y - point.oldY) * friction;

        point.oldX = point.x;
        point.oldY = point.y;

        point.x += vx;
        point.y += vy + gravity;

        if (hasWind) {
            point.x += Math.sin(Date.now() * 0.002 + point.y * 0.05) * 0.5;
        }
    });

    if (isDragging && dragPoint) {
        dragPoint.x = mouseX;
        dragPoint.y = mouseY;
    }

    for (let i = 0; i < 3; i++) {
        sticks.forEach(stick => {
            const dx = stick.p1.x - stick.p0.x;
            const dy = stick.p1.y - stick.p0.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const diff = stick.length - dist;
            const percent = diff / dist / 2;
            const offsetX = dx * percent;
            const offsetY = dy * percent;

            if (!stick.p0.pinned) {
                stick.p0.x -= offsetX;
                stick.p0.y -= offsetY;
            }
            if (!stick.p1.pinned) {
                stick.p1.x += offsetX;
                stick.p1.y += offsetY;
            }
        });

        points.forEach(point => {
            if (point.pinned) return;
            if (point.y > height - 10) {
                point.y = height - 10;
                point.oldY = point.y + (point.y - point.oldY) * bounce;
            }
            if (point.x < 5) point.x = 5;
            if (point.x > width - 5) point.x = width - 5;
        });
    }
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f7fa');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;

    sticks.forEach(stick => {
        ctx.beginPath();
        ctx.moveTo(stick.p0.x, stick.p0.y);
        ctx.lineTo(stick.p1.x, stick.p1.y);
        ctx.stroke();
    });

    points.forEach(point => {
        ctx.fillStyle = point.pinned ? '#333' : '#ff6b6b';
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.pinned ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
    setupCanvas();
    createCloth();
});
