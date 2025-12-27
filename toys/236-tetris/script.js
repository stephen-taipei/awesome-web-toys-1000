const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

const COLS = 10, ROWS = 20;
let cellSize, board, current, next, score, lines, isPlaying, dropInterval;

const SHAPES = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,0],[1,1,1]], // T
    [[1,0,0],[1,1,1]], // L
    [[0,0,1],[1,1,1]], // J
    [[0,1,1],[1,1,0]], // S
    [[1,1,0],[0,1,1]]  // Z
];
const COLORS = ['#00d4ff', '#f1c40f', '#9b59b6', '#e67e22', '#3498db', '#2ecc71', '#e74c3c'];

function init() {
    setupCanvas();
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.addEventListener('keydown', handleKey);
    document.getElementById('leftBtn').addEventListener('click', () => move(-1));
    document.getElementById('rightBtn').addEventListener('click', () => move(1));
    document.getElementById('downBtn').addEventListener('click', drop);
    document.getElementById('rotateBtn').addEventListener('click', rotate);
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    const w = wrapper.clientWidth - 4;
    cellSize = Math.floor(w / COLS);
    canvas.width = cellSize * COLS;
    canvas.height = cellSize * ROWS;
    nextCanvas.width = 80;
    nextCanvas.height = 80;
}

function startGame() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0; lines = 0;
    isPlaying = true;
    document.getElementById('startBtn').classList.add('hidden');
    spawnPiece();
    gameLoop();
}

function spawnPiece() {
    const idx = Math.floor(Math.random() * SHAPES.length);
    current = { shape: SHAPES[idx], color: COLORS[idx], x: 3, y: 0 };
    const nextIdx = Math.floor(Math.random() * SHAPES.length);
    next = { shape: SHAPES[nextIdx], color: COLORS[nextIdx] };
    drawNext();
    if (collision()) endGame();
}

function gameLoop() {
    if (!isPlaying) return;
    drop();
    draw();
    setTimeout(gameLoop, 500 - Math.min(lines * 10, 400));
}

function handleKey(e) {
    if (!isPlaying) return;
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
    if (e.key === 'ArrowDown') drop();
    if (e.key === 'ArrowUp') rotate();
}

function move(dir) {
    current.x += dir;
    if (collision()) current.x -= dir;
    draw();
}

function rotate() {
    const rotated = current.shape[0].map((_, i) =>
        current.shape.map(row => row[i]).reverse()
    );
    const oldShape = current.shape;
    current.shape = rotated;
    if (collision()) current.shape = oldShape;
    draw();
}

function drop() {
    current.y++;
    if (collision()) {
        current.y--;
        lock();
        clearLines();
        spawnPiece();
    }
    draw();
}

function collision() {
    return current.shape.some((row, dy) =>
        row.some((cell, dx) => {
            if (!cell) return false;
            const x = current.x + dx, y = current.y + dy;
            return x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y][x]);
        })
    );
}

function lock() {
    current.shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
            if (cell && current.y + dy >= 0) {
                board[current.y + dy][current.x + dx] = current.color;
            }
        });
    });
}

function clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(c => c)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            cleared++;
            y++;
        }
    }
    if (cleared) {
        lines += cleared;
        score += cleared * cleared * 100;
        updateStats();
    }
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) drawCell(ctx, x, y, cell);
        });
    });

    current.shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
            if (cell) drawCell(ctx, current.x + dx, current.y + dy, current.color);
        });
    });
}

function drawCell(c, x, y, color) {
    c.fillStyle = color;
    c.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
}

function drawNext() {
    nextCtx.fillStyle = '#111';
    nextCtx.fillRect(0, 0, 80, 80);
    const size = 15;
    const ox = (80 - next.shape[0].length * size) / 2;
    const oy = (80 - next.shape.length * size) / 2;
    next.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                nextCtx.fillStyle = next.color;
                nextCtx.fillRect(ox + x * size + 1, oy + y * size + 1, size - 2, size - 2);
            }
        });
    });
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('lines').textContent = lines;
}

function endGame() {
    isPlaying = false;
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('startBtn').textContent = '再玩一次';
    alert('遊戲結束! 分數: ' + score);
}

document.addEventListener('DOMContentLoaded', init);
