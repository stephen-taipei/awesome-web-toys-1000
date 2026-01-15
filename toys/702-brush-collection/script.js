const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let drawing = false;
let brush = 'pencil';
let color = '#6c5ce7';
let lastX, lastY;

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    return { x: x * canvas.width / rect.width, y: y * canvas.height / rect.height };
}

function drawPencil(x, y) {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function drawMarker(x, y) {
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.globalAlpha = 1;
}

function drawSpray(x, y) {
    const density = 30;
    for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 15;
        ctx.fillStyle = color;
        ctx.fillRect(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, 1, 1);
    }
}

function drawWatercolor(x, y) {
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = color;
    for (let i = 0; i < 3; i++) {
        const size = 20 + Math.random() * 10;
        ctx.beginPath();
        ctx.arc(x + Math.random() * 10 - 5, y + Math.random() * 10 - 5, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function startDraw(e) {
    drawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);

    switch(brush) {
        case 'pencil': drawPencil(pos.x, pos.y); break;
        case 'marker': drawMarker(pos.x, pos.y); break;
        case 'spray': drawSpray(pos.x, pos.y); break;
        case 'watercolor': drawWatercolor(pos.x, pos.y); break;
    }

    lastX = pos.x;
    lastY = pos.y;
}

function endDraw() {
    drawing = false;
    ctx.beginPath();
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseleave', endDraw);
canvas.addEventListener('touchstart', startDraw);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', endDraw);

document.querySelectorAll('.brush').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.brush').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        brush = btn.dataset.brush;
    });
});

document.getElementById('colorPicker').addEventListener('input', (e) => color = e.target.value);
document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
