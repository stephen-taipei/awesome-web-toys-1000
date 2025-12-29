let size = 3;
let tiles = [];
let emptyPos = { x: 0, y: 0 };
let moves = 0;
let seconds = 0;
let timerInterval = null;

function init() {
    document.getElementById('shuffleBtn').addEventListener('click', shuffle);
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            size = parseInt(btn.dataset.size);
            resetGame();
        });
    });
    resetGame();
}

function resetGame() {
    tiles = [];
    for (let i = 0; i < size * size - 1; i++) {
        tiles.push(i + 1);
    }
    tiles.push(0);
    emptyPos = { x: size - 1, y: size - 1 };
    moves = 0;
    seconds = 0;
    clearInterval(timerInterval);
    updateStats();
    render();
}

function shuffle() {
    resetGame();
    for (let i = 0; i < size * 100; i++) {
        const neighbors = getNeighbors(emptyPos.x, emptyPos.y);
        const random = neighbors[Math.floor(Math.random() * neighbors.length)];
        swapTiles(random.x, random.y);
    }
    moves = 0;
    seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        updateStats();
    }, 1000);
    updateStats();
    render();
}

function getNeighbors(x, y) {
    const neighbors = [];
    if (x > 0) neighbors.push({ x: x - 1, y });
    if (x < size - 1) neighbors.push({ x: x + 1, y });
    if (y > 0) neighbors.push({ x, y: y - 1 });
    if (y < size - 1) neighbors.push({ x, y: y + 1 });
    return neighbors;
}

function swapTiles(x, y) {
    const idx1 = y * size + x;
    const idx2 = emptyPos.y * size + emptyPos.x;
    [tiles[idx1], tiles[idx2]] = [tiles[idx2], tiles[idx1]];
    emptyPos = { x, y };
}

function handleClick(x, y) {
    if (Math.abs(x - emptyPos.x) + Math.abs(y - emptyPos.y) !== 1) return;
    swapTiles(x, y);
    moves++;
    updateStats();
    render();
    checkWin();
}

function render() {
    const grid = document.getElementById('puzzleGrid');
    grid.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';
    grid.innerHTML = '';

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            const value = tiles[y * size + x];

            if (value === 0) {
                tile.classList.add('empty');
            } else {
                tile.textContent = value;
                if (value === y * size + x + 1) {
                    tile.classList.add('correct');
                }
            }

            tile.addEventListener('click', () => handleClick(x, y));
            grid.appendChild(tile);
        }
    }
}

function updateStats() {
    document.getElementById('moves').textContent = moves;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('timer').textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function checkWin() {
    for (let i = 0; i < size * size - 1; i++) {
        if (tiles[i] !== i + 1) return;
    }
    clearInterval(timerInterval);
    setTimeout(() => {
        alert('恭喜完成! 步數: ' + moves + ', 時間: ' + document.getElementById('timer').textContent);
    }, 100);
}

document.addEventListener('DOMContentLoaded', init);
