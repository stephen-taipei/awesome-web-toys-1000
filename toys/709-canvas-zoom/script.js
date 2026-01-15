const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const wrapper = document.getElementById('wrapper');
const zoomLevelEl = document.getElementById('zoomLevel');

canvas.width = 400;
canvas.height = 300;

let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let drawing = false;
let panning = false;
let color = '#55efc4';
let lastX, lastY;

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function updateTransform() {
    canvas.style.transform = `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`;
    zoomLevelEl.textContent = `${Math.round(zoom * 100)}%`;
}

function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    return { x, y };
}

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.ctrlKey) {
        panning = true;
        lastX = e.clientX;
        lastY = e.clientY;
    } else {
        drawing = true;
        const pos = getCanvasPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (panning) {
        offsetX += (e.clientX - lastX) / zoom;
        offsetY += (e.clientY - lastY) / zoom;
        lastX = e.clientX;
        lastY = e.clientY;
        updateTransform();
    } else if (drawing) {
        const pos = getCanvasPos(e);
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }
});

canvas.addEventListener('mouseup', () => { drawing = false; panning = false; });
canvas.addEventListener('mouseleave', () => { drawing = false; panning = false; });

wrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoom = Math.max(0.5, Math.min(4, zoom * delta));
    updateTransform();
});

document.getElementById('zoomIn').addEventListener('click', () => {
    zoom = Math.min(4, zoom * 1.2);
    updateTransform();
});

document.getElementById('zoomOut').addEventListener('click', () => {
    zoom = Math.max(0.5, zoom / 1.2);
    updateTransform();
});

document.getElementById('resetZoom').addEventListener('click', () => {
    zoom = 1;
    offsetX = 0;
    offsetY = 0;
    updateTransform();
});

document.getElementById('colorPicker').addEventListener('input', (e) => color = e.target.value);
document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

updateTransform();
