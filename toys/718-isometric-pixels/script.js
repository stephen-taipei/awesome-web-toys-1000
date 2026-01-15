const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

const tileWidth = 30;
const tileHeight = 15;
const cubeHeight = 20;
let color = '#e74c3c';

const blocks = [];

function toIso(x, y) {
    return {
        x: (x - y) * tileWidth / 2 + canvas.width / 2,
        y: (x + y) * tileHeight / 2 + 50
    };
}

function fromIso(screenX, screenY) {
    const sx = screenX - canvas.width / 2;
    const sy = screenY - 50;
    const x = Math.floor((sx / (tileWidth / 2) + sy / (tileHeight / 2)) / 2);
    const y = Math.floor((sy / (tileHeight / 2) - sx / (tileWidth / 2)) / 2);
    return { x, y };
}

function drawCube(gridX, gridY, col) {
    const pos = toIso(gridX, gridY);
    const x = pos.x;
    const y = pos.y;

    // Top face
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x, y - cubeHeight);
    ctx.lineTo(x + tileWidth / 2, y - cubeHeight + tileHeight / 2);
    ctx.lineTo(x, y - cubeHeight + tileHeight);
    ctx.lineTo(x - tileWidth / 2, y - cubeHeight + tileHeight / 2);
    ctx.closePath();
    ctx.fill();

    // Left face
    ctx.fillStyle = shadeColor(col, -30);
    ctx.beginPath();
    ctx.moveTo(x - tileWidth / 2, y - cubeHeight + tileHeight / 2);
    ctx.lineTo(x, y - cubeHeight + tileHeight);
    ctx.lineTo(x, y + tileHeight);
    ctx.lineTo(x - tileWidth / 2, y + tileHeight / 2);
    ctx.closePath();
    ctx.fill();

    // Right face
    ctx.fillStyle = shadeColor(col, -60);
    ctx.beginPath();
    ctx.moveTo(x + tileWidth / 2, y - cubeHeight + tileHeight / 2);
    ctx.lineTo(x, y - cubeHeight + tileHeight);
    ctx.lineTo(x, y + tileHeight);
    ctx.lineTo(x + tileWidth / 2, y + tileHeight / 2);
    ctx.closePath();
    ctx.fill();
}

function shadeColor(col, percent) {
    const num = parseInt(col.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return `rgb(${R},${G},${B})`;
}

function render() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sort by y then x for proper overlap
    blocks.sort((a, b) => (a.x + a.y) - (b.x + b.y));
    blocks.forEach(b => drawCube(b.x, b.y, b.color));
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const { x, y } = fromIso(e.clientX - rect.left, e.clientY - rect.top);

    if (x >= 0 && x < 10 && y >= 0 && y < 10) {
        const existing = blocks.findIndex(b => b.x === x && b.y === y);
        if (existing >= 0) {
            blocks.splice(existing, 1);
        } else {
            blocks.push({ x, y, color });
        }
        render();
    }
});

document.getElementById('colorPicker').addEventListener('input', (e) => color = e.target.value);
document.getElementById('clearBtn').addEventListener('click', () => {
    blocks.length = 0;
    render();
});

render();
