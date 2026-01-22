const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let trails = [];
let currentColorIndex = 0;
let mouseX = 0;
let mouseY = 0;
let isDrawing = false;
let time = 0;

const neonColors = [
    { main: '#FF00FF', glow: '#FF00FF' },
    { main: '#00FFFF', glow: '#00FFFF' },
    { main: '#FF0080', glow: '#FF0080' },
    { main: '#00FF00', glow: '#00FF00' },
    { main: '#FFFF00', glow: '#FFFF00' },
    { main: '#FF4500', glow: '#FF4500' }
];

function changeColor() {
    currentColorIndex = (currentColorIndex + 1) % neonColors.length;
}

function addTrailPoint(x, y) {
    trails.push({
        x, y,
        color: neonColors[currentColorIndex],
        alpha: 1,
        size: 3
    });

    if (trails.length > 200) {
        trails = trails.slice(-150);
    }
}

function updateTrails() {
    trails.forEach(point => {
        point.alpha -= 0.008;
    });

    trails = trails.filter(point => point.alpha > 0);
}

function drawBackground() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawTrails() {
    for (let i = 1; i < trails.length; i++) {
        const prev = trails[i - 1];
        const curr = trails[i];

        if (Math.abs(curr.x - prev.x) > 50 || Math.abs(curr.y - prev.y) > 50) continue;

        ctx.shadowColor = curr.color.glow;
        ctx.shadowBlur = 20;

        ctx.strokeStyle = `rgba(${hexToRgb(curr.color.main)}, ${curr.alpha})`;
        ctx.lineWidth = curr.size + 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.stroke();

        ctx.shadowBlur = 10;
        ctx.strokeStyle = `rgba(255, 255, 255, ${curr.alpha * 0.5})`;
        ctx.lineWidth = curr.size;
        ctx.stroke();

        ctx.shadowBlur = 0;
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '255, 255, 255';
}

function drawCursor() {
    if (isDrawing) {
        const color = neonColors[currentColorIndex];

        ctx.shadowColor = color.glow;
        ctx.shadowBlur = 30;

        ctx.fillStyle = color.main;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = neonColors[currentColorIndex].main;
    ctx.shadowColor = neonColors[currentColorIndex].glow;
    ctx.shadowBlur = 10;
    ctx.font = 'bold 11px Arial';
    ctx.fillText('霓虹模式', 20, 28);
    ctx.shadowBlur = 0;
}

function animate() {
    time++;
    drawBackground();
    updateTrails();
    drawTrails();
    drawCursor();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    addTrailPoint(mouseX, mouseY);
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (isDrawing) {
        addTrailPoint(mouseX, mouseY);
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (touch.clientY - rect.top) * (canvas.height / rect.height);
    addTrailPoint(mouseX, mouseY);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (touch.clientY - rect.top) * (canvas.height / rect.height);

    if (isDrawing) {
        addTrailPoint(mouseX, mouseY);
    }
});

canvas.addEventListener('touchend', () => {
    isDrawing = false;
});

document.getElementById('colorBtn').addEventListener('click', changeColor);

ctx.fillStyle = '#0a0a0a';
ctx.fillRect(0, 0, canvas.width, canvas.height);

animate();
