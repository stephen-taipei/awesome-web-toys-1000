const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 16;
let pixelSize;
let width, height;
let grid = [];
let currentColor = '#000000';
let isErasing = false;
let isDrawing = false;

const palette = [
    '#000000', '#ffffff', '#ff0000', '#ff6600',
    '#ffff00', '#00ff00', '#00ffff', '#0066ff',
    '#9900ff', '#ff00ff', '#ff99cc', '#996633',
    '#808080', '#c0c0c0', '#8b4513', '#006400'
];

function init() {
    setupCanvas();
    setupPalette();
    clearGrid();

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDraw);

    document.getElementById('eraseBtn').addEventListener('click', toggleErase);
    document.getElementById('clearBtn').addEventListener('click', clearGrid);

    render();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width;
    pixelSize = width / gridSize;
    canvas.width = width;
    canvas.height = height;
}

function setupPalette() {
    const paletteEl = document.getElementById('palette');
    palette.forEach((color, index) => {
        const colorEl = document.createElement('div');
        colorEl.className = 'color' + (index === 0 ? ' selected' : '');
        colorEl.style.backgroundColor = color;
        colorEl.addEventListener('click', () => selectColor(color, colorEl));
        paletteEl.appendChild(colorEl);
    });
}

function selectColor(color, el) {
    currentColor = color;
    isErasing = false;
    document.getElementById('eraseBtn').classList.remove('active');
    document.querySelectorAll('.color').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

function toggleErase() {
    isErasing = !isErasing;
    document.getElementById('eraseBtn').classList.toggle('active', isErasing);
    document.querySelectorAll('.color').forEach(c => c.classList.remove('selected'));
}

function clearGrid() {
    grid = [];
    for (let y = 0; y < gridSize; y++) {
        grid[y] = [];
        for (let x = 0; x < gridSize; x++) {
            grid[y][x] = '#ffffff';
        }
    }
    render();
}

function getGridPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX / pixelSize);
    const y = Math.floor((e.clientY - rect.top) * scaleY / pixelSize);
    return { x: Math.max(0, Math.min(gridSize - 1, x)), y: Math.max(0, Math.min(gridSize - 1, y)) };
}

function startDraw(e) {
    isDrawing = true;
    const pos = getGridPos(e);
    paintPixel(pos.x, pos.y);
}

function draw(e) {
    if (!isDrawing) return;
    const pos = getGridPos(e);
    paintPixel(pos.x, pos.y);
}

function stopDraw() {
    isDrawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((touch.clientX - rect.left) * (canvas.width / rect.width) / pixelSize);
    const y = Math.floor((touch.clientY - rect.top) * (canvas.height / rect.height) / pixelSize);
    paintPixel(Math.max(0, Math.min(gridSize - 1, x)), Math.max(0, Math.min(gridSize - 1, y)));
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((touch.clientX - rect.left) * (canvas.width / rect.width) / pixelSize);
    const y = Math.floor((touch.clientY - rect.top) * (canvas.height / rect.height) / pixelSize);
    paintPixel(Math.max(0, Math.min(gridSize - 1, x)), Math.max(0, Math.min(gridSize - 1, y)));
}

function paintPixel(x, y) {
    grid[y][x] = isErasing ? '#ffffff' : currentColor;
    render();
}

function render() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            ctx.fillStyle = grid[y][x];
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
    }

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * pixelSize, 0);
        ctx.lineTo(i * pixelSize, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * pixelSize);
        ctx.lineTo(width, i * pixelSize);
        ctx.stroke();
    }
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
    setupCanvas();
    render();
});
