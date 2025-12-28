const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 300; canvas.height = 300;

let isDrawing = false, lastX = 0, lastY = 0;
let color = '#000000', brushSize = 5, isEraser = false;

function init() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', e => { e.preventDefault(); startDrawing(e.touches[0]); });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); draw(e.touches[0]); });
    canvas.addEventListener('touchend', stopDrawing);

    document.getElementById('colorPicker').addEventListener('input', e => {
        color = e.target.value;
        isEraser = false;
        document.getElementById('eraserBtn').classList.remove('active');
    });

    document.getElementById('brushSize').addEventListener('input', e => {
        brushSize = e.target.value;
        document.getElementById('sizeLabel').textContent = brushSize;
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    document.getElementById('eraserBtn').addEventListener('click', e => {
        isEraser = !isEraser;
        e.target.classList.toggle('active');
    });
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

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? '#fff' : color;
    ctx.lineWidth = brushSize;
    ctx.stroke();

    lastX = x;
    lastY = y;
}

function stopDrawing() {
    isDrawing = false;
}

document.addEventListener('DOMContentLoaded', init);
