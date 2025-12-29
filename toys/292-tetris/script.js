const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cols = 10, rows = 20, cellSize = 20;
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

const shapes = [
    [[1,1,1,1]], [[1,1],[1,1]], [[1,1,1],[0,1,0]],
    [[1,1,1],[1,0,0]], [[1,1,1],[0,0,1]], [[1,1,0],[0,1,1]], [[0,1,1],[1,1,0]]
];
const colors = ['#00d4ff', '#ffd700', '#9b59b6', '#e74c3c', '#f39c12', '#2ecc71', '#ff6b9d'];

let board = [], current = null, currentX = 0, currentY = 0, currentColor = 0;
let score = 0, lines = 0, isPlaying = false, gameInterval = null;

function init() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.addEventListener('keydown', handleKey);
    document.getElementById('leftBtn').addEventListener('click', () => move(-1));
    document.getElementById('rightBtn').addEventListener('click', () => move(1));
    document.getElementById('downBtn').addEventListener('click', drop);
    document.getElementById('rotateBtn').addEventListener('click', rotate);
    draw();
}

function handleKey(e) {
    if (!isPlaying) return;
    switch(e.key) {
        case 'ArrowLeft': move(-1); break;
        case 'ArrowRight': move(1); break;
        case 'ArrowDown': drop(); break;
        case 'ArrowUp': rotate(); break;
    }
}

function startGame() {
    board = Array(rows).fill().map(() => Array(cols).fill(0));
    score = 0; lines = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('lines').textContent = lines;
    spawnPiece();
    isPlaying = true;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 500);
}

function spawnPiece() {
    const idx = Math.floor(Math.random() * shapes.length);
    current = shapes[idx].map(row => [...row]);
    currentColor = idx;
    currentX = Math.floor((cols - current[0].length) / 2);
    currentY = 0;
    if (!canMove(0, 0)) endGame();
}

function canMove(dx, dy, piece = current) {
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x]) {
                const newX = currentX + x + dx;
                const newY = currentY + y + dy;
                if (newX < 0 || newX >= cols || newY >= rows) return false;
                if (newY >= 0 && board[newY][newX]) return false;
            }
        }
    }
    return true;
}

function move(dx) {
    if (canMove(dx, 0)) currentX += dx;
    draw();
}

function rotate() {
    const rotated = current[0].map((_, i) => current.map(row => row[i]).reverse());
    if (canMove(0, 0, rotated)) current = rotated;
    draw();
}

function drop() {
    if (canMove(0, 1)) currentY++;
    else lockPiece();
    draw();
}

function lockPiece() {
    for (let y = 0; y < current.length; y++) {
        for (let x = 0; x < current[y].length; x++) {
            if (current[y][x] && currentY + y >= 0) {
                board[currentY + y][currentX + x] = currentColor + 1;
            }
        }
    }
    clearLines();
    spawnPiece();
}

function clearLines() {
    let cleared = 0;
    for (let y = rows - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(cols).fill(0));
            cleared++;
            y++;
        }
    }
    if (cleared) {
        lines += cleared;
        score += cleared * cleared * 100;
        document.getElementById('score').textContent = score;
        document.getElementById('lines').textContent = lines;
    }
}

function gameLoop() {
    drop();
}

function endGame() {
    clearInterval(gameInterval);
    isPlaying = false;
}

function draw() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (board[y][x]) {
                ctx.fillStyle = colors[board[y][x] - 1];
                ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
            }
        }
    }

    if (current) {
        ctx.fillStyle = colors[currentColor];
        for (let y = 0; y < current.length; y++) {
            for (let x = 0; x < current[y].length; x++) {
                if (current[y][x]) {
                    ctx.fillRect((currentX + x) * cellSize + 1, (currentY + y) * cellSize + 1, cellSize - 2, cellSize - 2);
                }
            }
        }
    }

    if (!isPlaying && score > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('遊戲結束', canvas.width/2, canvas.height/2);
    }
}

document.addEventListener('DOMContentLoaded', init);
