const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const paletteEl = document.getElementById('palette');

const gridSize = 32;
canvas.width = gridSize;
canvas.height = gridSize;

const palettes = {
    gameboy: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
    nes: ['#000000', '#fcfcfc', '#f8f8f8', '#bcbcbc', '#7c7c7c', '#a4e4fc', '#3cbcfc', '#0078f8', '#0000fc', '#b8b8f8', '#6888fc', '#0058f8', '#d8b8f8', '#9878f8', '#6844fc'],
    pico8: ['#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8', '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa']
};

let currentPalette = 'gameboy';
let currentColor = palettes.gameboy[2];
let drawing = false;

function renderPalette() {
    paletteEl.innerHTML = '';
    palettes[currentPalette].forEach((color, i) => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch' + (color === currentColor ? ' active' : '');
        swatch.style.background = color;
        swatch.addEventListener('click', () => {
            currentColor = color;
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
        });
        paletteEl.appendChild(swatch);
    });
    canvas.style.background = palettes[currentPalette][0];
}

function getPixel(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * gridSize);
    const y = Math.floor((e.clientY - rect.top) / rect.height * gridSize);
    return { x, y };
}

function paint(e) {
    const { x, y } = getPixel(e);
    ctx.fillStyle = currentColor;
    ctx.fillRect(x, y, 1, 1);
}

canvas.addEventListener('mousedown', (e) => { drawing = true; paint(e); });
canvas.addEventListener('mousemove', (e) => { if (drawing) paint(e); });
canvas.addEventListener('mouseup', () => drawing = false);

document.getElementById('paletteSelect').addEventListener('change', (e) => {
    currentPalette = e.target.value;
    currentColor = palettes[currentPalette][Math.min(2, palettes[currentPalette].length - 1)];
    renderPalette();
    ctx.clearRect(0, 0, gridSize, gridSize);
});

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, gridSize, gridSize);
});

renderPalette();
