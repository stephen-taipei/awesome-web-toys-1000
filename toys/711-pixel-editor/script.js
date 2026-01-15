const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 16;
canvas.width = gridSize;
canvas.height = gridSize;

let color = '#e74c3c';
let erasing = false;
let drawing = false;

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, gridSize, gridSize);

function getPixel(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * gridSize);
    const y = Math.floor((e.clientY - rect.top) / rect.height * gridSize);
    return { x, y };
}

function paint(e) {
    const { x, y } = getPixel(e);
    ctx.fillStyle = erasing ? '#fff' : color;
    ctx.fillRect(x, y, 1, 1);
}

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    paint(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) paint(e);
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

// Touch events
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    drawing = true;
    paint(e.touches[0]);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (drawing) paint(e.touches[0]);
});

canvas.addEventListener('touchend', () => drawing = false);

document.getElementById('colorPicker').addEventListener('input', (e) => {
    color = e.target.value;
    erasing = false;
    document.getElementById('eraserBtn').classList.remove('active');
});

document.getElementById('eraserBtn').addEventListener('click', (e) => {
    erasing = !erasing;
    e.target.classList.toggle('active', erasing);
});

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, gridSize, gridSize);
});
