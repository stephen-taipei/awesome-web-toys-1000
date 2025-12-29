const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 300, gridSize = 4, cellSize = size / gridSize, gap = 8;
canvas.width = size; canvas.height = size;

const colors = {
    0: '#cdc1b4', 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
    32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
    512: '#edc850', 1024: '#edc53f', 2048: '#edc22e'
};

let grid = [], score = 0, highScore = 0;

function init() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.addEventListener('keydown', handleKey);
    setupTouch();
    startGame();
}

function setupTouch() {
    let startX, startY;
    canvas.addEventListener('touchstart', e => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; });
    canvas.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > Math.abs(dy)) { dx > 0 ? move('right') : move('left'); }
        else { dy > 0 ? move('down') : move('up'); }
    });
}

function handleKey(e) {
    switch(e.key) {
        case 'ArrowUp': move('up'); break;
        case 'ArrowDown': move('down'); break;
        case 'ArrowLeft': move('left'); break;
        case 'ArrowRight': move('right'); break;
    }
}

function startGame() {
    grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    score = 0;
    document.getElementById('score').textContent = score;
    addTile(); addTile();
    draw();
}

function addTile() {
    const empty = [];
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (grid[y][x] === 0) empty.push({ x, y });
        }
    }
    if (empty.length) {
        const { x, y } = empty[Math.floor(Math.random() * empty.length)];
        grid[y][x] = Math.random() < 0.9 ? 2 : 4;
    }
}

function move(dir) {
    let moved = false;
    const rotated = dir === 'up' || dir === 'down';
    const reversed = dir === 'right' || dir === 'down';

    for (let i = 0; i < gridSize; i++) {
        let line = [];
        for (let j = 0; j < gridSize; j++) {
            const y = rotated ? j : i;
            const x = rotated ? i : j;
            line.push(grid[y][x]);
        }
        if (reversed) line.reverse();

        const newLine = [];
        let merged = false;
        for (const val of line) {
            if (val === 0) continue;
            if (!merged && newLine.length && newLine[newLine.length - 1] === val) {
                newLine[newLine.length - 1] *= 2;
                score += newLine[newLine.length - 1];
                merged = true;
            } else {
                newLine.push(val);
                merged = false;
            }
        }
        while (newLine.length < gridSize) newLine.push(0);
        if (reversed) newLine.reverse();

        for (let j = 0; j < gridSize; j++) {
            const y = rotated ? j : i;
            const x = rotated ? i : j;
            if (grid[y][x] !== newLine[j]) moved = true;
            grid[y][x] = newLine[j];
        }
    }

    if (moved) {
        addTile();
        document.getElementById('score').textContent = score;
        if (score > highScore) {
            highScore = score;
            document.getElementById('highScore').textContent = highScore;
        }
    }
    draw();
}

function draw() {
    ctx.fillStyle = '#bbada0';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const val = grid[y][x];
            const px = x * cellSize + gap/2;
            const py = y * cellSize + gap/2;
            const cs = cellSize - gap;

            ctx.fillStyle = colors[val] || '#3c3a32';
            ctx.beginPath();
            ctx.roundRect(px, py, cs, cs, 5);
            ctx.fill();

            if (val) {
                ctx.fillStyle = val <= 4 ? '#776e65' : '#f9f6f2';
                ctx.font = 'bold ' + (val >= 1000 ? 24 : 32) + 'px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(val, px + cs/2, py + cs/2);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
