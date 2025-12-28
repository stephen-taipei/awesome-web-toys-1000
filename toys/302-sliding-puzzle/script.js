const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 300, gridSize = 4, cellSize = size / gridSize;
canvas.width = size; canvas.height = size;

let tiles = [], emptyPos = 15, moves = 0;
const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e91e63', '#00bcd4',
                '#ff5722', '#795548', '#607d8b', '#8bc34a', '#cddc39', '#ffc107', '#ff9800'];

function init() {
    document.getElementById('shuffleBtn').addEventListener('click', shuffle);
    canvas.addEventListener('click', handleClick);
    resetTiles();
    shuffle();
}

function resetTiles() {
    tiles = [];
    for (let i = 0; i < 16; i++) tiles.push(i);
    emptyPos = 15;
    moves = 0;
    document.getElementById('moves').textContent = moves;
    document.getElementById('status').textContent = '';
}

function shuffle() {
    resetTiles();
    for (let i = 0; i < 100; i++) {
        const neighbors = getNeighbors(emptyPos);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        swapTiles(emptyPos, randomNeighbor);
    }
    moves = 0;
    document.getElementById('moves').textContent = moves;
    draw();
}

function getNeighbors(pos) {
    const neighbors = [];
    const row = Math.floor(pos / gridSize);
    const col = pos % gridSize;
    if (row > 0) neighbors.push(pos - gridSize);
    if (row < gridSize - 1) neighbors.push(pos + gridSize);
    if (col > 0) neighbors.push(pos - 1);
    if (col < gridSize - 1) neighbors.push(pos + 1);
    return neighbors;
}

function swapTiles(pos1, pos2) {
    [tiles[pos1], tiles[pos2]] = [tiles[pos2], tiles[pos1]];
    if (tiles[pos1] === 15) emptyPos = pos1;
    if (tiles[pos2] === 15) emptyPos = pos2;
}

function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    const pos = row * gridSize + col;

    if (getNeighbors(emptyPos).includes(pos)) {
        swapTiles(pos, emptyPos);
        moves++;
        document.getElementById('moves').textContent = moves;
        draw();
        checkWin();
    }
}

function checkWin() {
    const won = tiles.every((tile, i) => tile === i);
    if (won) {
        document.getElementById('status').textContent = '恭喜完成!';
    }
}

function draw() {
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 16; i++) {
        if (tiles[i] === 15) continue;

        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const x = col * cellSize + 2;
        const y = row * cellSize + 2;
        const s = cellSize - 4;

        ctx.fillStyle = colors[tiles[i]];
        ctx.beginPath();
        ctx.roundRect(x, y, s, s, 8);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tiles[i] + 1, x + s/2, y + s/2);
    }
}

document.addEventListener('DOMContentLoaded', init);
