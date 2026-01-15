const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let drawing = false;
let shape = 'rect';
let color = '#00cec9';
let fill = true;
let startX, startY;
let snapshot;

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    return { x: x * canvas.width / rect.width, y: y * canvas.height / rect.height };
}

function drawShape(endX, endY) {
    ctx.putImageData(snapshot, 0, 0);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    const width = endX - startX;
    const height = endY - startY;

    ctx.beginPath();
    switch(shape) {
        case 'rect':
            if (fill) ctx.fillRect(startX, startY, width, height);
            else ctx.strokeRect(startX, startY, width, height);
            break;
        case 'circle':
            const radius = Math.sqrt(width * width + height * height) / 2;
            const cx = startX + width / 2;
            const cy = startY + height / 2;
            ctx.arc(cx, cy, Math.abs(radius), 0, Math.PI * 2);
            fill ? ctx.fill() : ctx.stroke();
            break;
        case 'triangle':
            ctx.moveTo(startX + width / 2, startY);
            ctx.lineTo(startX, endY);
            ctx.lineTo(endX, endY);
            ctx.closePath();
            fill ? ctx.fill() : ctx.stroke();
            break;
        case 'line':
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            break;
    }
}

function startDraw(e) {
    drawing = true;
    const pos = getPos(e);
    startX = pos.x;
    startY = pos.y;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    drawShape(pos.x, pos.y);
}

function endDraw() {
    drawing = false;
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('touchstart', startDraw);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', endDraw);

document.querySelectorAll('.shape').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.shape').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        shape = btn.dataset.shape;
    });
});

document.getElementById('colorPicker').addEventListener('input', (e) => color = e.target.value);
document.getElementById('fillCheck').addEventListener('change', (e) => fill = e.target.checked);
document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
