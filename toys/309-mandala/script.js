const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 300;
canvas.width = size; canvas.height = size;

let isDrawing = false, lastX = 0, lastY = 0;
let color = '#e91e63', symmetry = 8;
const cx = size / 2, cy = size / 2;

function init() {
    clear();

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', e => { e.preventDefault(); startDrawing(e.touches[0]); });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); draw(e.touches[0]); });
    canvas.addEventListener('touchend', stopDrawing);

    document.getElementById('colorPicker').addEventListener('input', e => color = e.target.value);
    document.getElementById('symmetry').addEventListener('input', e => {
        symmetry = parseInt(e.target.value);
        document.getElementById('symLabel').textContent = symmetry;
    });
    document.getElementById('clearBtn').addEventListener('click', clear);
}

function clear() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, size, size);
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    for (let i = 0; i < symmetry; i++) {
        ctx.save();
        ctx.translate(cx, cy);

        const angle = (i * Math.PI * 2) / symmetry;
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(lastX - cx, lastY - cy);
        ctx.lineTo(x - cx, y - cy);
        ctx.stroke();

        ctx.scale(1, -1);
        ctx.beginPath();
        ctx.moveTo(lastX - cx, lastY - cy);
        ctx.lineTo(x - cx, y - cy);
        ctx.stroke();

        ctx.restore();
    }

    lastX = x;
    lastY = y;
}

function stopDrawing() {
    isDrawing = false;
}

document.addEventListener('DOMContentLoaded', init);
