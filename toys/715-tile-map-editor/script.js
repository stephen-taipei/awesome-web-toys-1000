const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const tilesetEl = document.getElementById('tileset');

const mapWidth = 16;
const mapHeight = 8;
const tileSize = 8;

canvas.width = mapWidth * tileSize;
canvas.height = mapHeight * tileSize;

const tiles = [
    { name: 'grass', color: '#2ecc71' },
    { name: 'water', color: '#3498db' },
    { name: 'sand', color: '#f1c40f' },
    { name: 'rock', color: '#7f8c8d' },
    { name: 'tree', color: '#27ae60' },
    { name: 'dirt', color: '#8b4513' }
];

let currentTile = 0;
let drawing = false;

// Render tileset
tiles.forEach((tile, i) => {
    const el = document.createElement('div');
    el.className = 'tile' + (i === 0 ? ' active' : '');
    el.style.background = tile.color;
    el.addEventListener('click', () => {
        document.querySelectorAll('.tile').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        currentTile = i;
    });
    tilesetEl.appendChild(el);
});

function getTilePos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * mapWidth);
    const y = Math.floor((e.clientY - rect.top) / rect.height * mapHeight);
    return { x, y };
}

function paintTile(e) {
    const { x, y } = getTilePos(e);
    ctx.fillStyle = tiles[currentTile].color;
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
}

canvas.addEventListener('mousedown', (e) => { drawing = true; paintTile(e); });
canvas.addEventListener('mousemove', (e) => { if (drawing) paintTile(e); });
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; paintTile(e.touches[0]); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (drawing) paintTile(e.touches[0]); });
canvas.addEventListener('touchend', () => drawing = false);

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
