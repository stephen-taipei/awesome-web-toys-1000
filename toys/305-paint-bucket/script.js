const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 300, gridSize = 10, cellSize = size / gridSize;
canvas.width = size; canvas.height = size;

const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#e91e63'];
let currentColor = colors[0];
let grid = [];

function init() {
    createPalette();
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    canvas.addEventListener('click', handleClick);
    clearCanvas();
}

function createPalette() {
    const palette = document.getElementById('palette');
    colors.forEach((color, i) => {
        const btn = document.createElement('button');
        btn.style.background = color;
        btn.className = i === 0 ? 'active' : '';
        btn.addEventListener('click', () => selectColor(color, btn));
        palette.appendChild(btn);
    });
}

function selectColor(color, btn) {
    currentColor = color;
    document.querySelectorAll('.palette button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function clearCanvas() {
    grid = Array(gridSize).fill().map(() => Array(gridSize).fill('#fff'));
    draw();
}

function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        const targetColor = grid[y][x];
        if (targetColor !== currentColor) {
            floodFill(x, y, targetColor, currentColor);
            draw();
        }
    }
}

function floodFill(x, y, targetColor, fillColor) {
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
    if (grid[y][x] !== targetColor) return;

    grid[y][x] = fillColor;

    floodFill(x + 1, y, targetColor, fillColor);
    floodFill(x - 1, y, targetColor, fillColor);
    floodFill(x, y + 1, targetColor, fillColor);
    floodFill(x, y - 1, targetColor, fillColor);
}

function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            ctx.fillStyle = grid[y][x];
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.strokeStyle = '#ddd';
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
