const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 9, cellSize = 32, mineCount = 10;
canvas.width = gridSize * cellSize;
canvas.height = gridSize * cellSize;

let board = [], revealed = [], flagged = [], gameOver = false, firstClick = true;

function init() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); handleRightClick(e); });
    let pressTimer;
    canvas.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => handleRightClick(e.touches[0]), 500);
    });
    canvas.addEventListener('touchend', () => clearTimeout(pressTimer));
    startGame();
}

function startGame() {
    board = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    revealed = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
    flagged = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
    gameOver = false;
    firstClick = true;
    document.getElementById('mineCount').textContent = mineCount;
    document.getElementById('status').textContent = '點擊開始';
    draw();
}

function placeMines(excludeRow, excludeCol) {
    let placed = 0;
    while (placed < mineCount) {
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);
        if (board[row][col] !== -1 && !(row === excludeRow && col === excludeCol)) {
            board[row][col] = -1;
            placed++;
        }
    }

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r][c] !== -1) {
                board[r][c] = countAdjacent(r, c);
            }
        }
    }
}

function countAdjacent(row, col) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const r = row + dr, c = col + dc;
            if (r >= 0 && r < gridSize && c >= 0 && c < gridSize && board[r][c] === -1) count++;
        }
    }
    return count;
}

function handleClick(e) {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / cellSize);
    const row = Math.floor((e.clientY - rect.top) / cellSize);

    if (flagged[row][col]) return;

    if (firstClick) {
        placeMines(row, col);
        firstClick = false;
        document.getElementById('status').textContent = '遊戲中';
    }

    reveal(row, col);
    draw();
}

function handleRightClick(e) {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / cellSize);
    const row = Math.floor((e.clientY - rect.top) / cellSize);

    if (!revealed[row][col]) {
        flagged[row][col] = !flagged[row][col];
        const flags = flagged.flat().filter(f => f).length;
        document.getElementById('mineCount').textContent = mineCount - flags;
        draw();
    }
}

function reveal(row, col) {
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return;
    if (revealed[row][col] || flagged[row][col]) return;

    revealed[row][col] = true;

    if (board[row][col] === -1) {
        gameOver = true;
        revealAll();
        document.getElementById('status').textContent = '遊戲結束!';
        return;
    }

    if (board[row][col] === 0) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                reveal(row + dr, col + dc);
            }
        }
    }

    checkWin();
}

function revealAll() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            revealed[r][c] = true;
        }
    }
}

function checkWin() {
    let safe = 0;
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (revealed[r][c] && board[r][c] !== -1) safe++;
        }
    }
    if (safe === gridSize * gridSize - mineCount) {
        gameOver = true;
        document.getElementById('status').textContent = '恭喜過關!';
    }
}

const numColors = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000', '#808080'];

function draw() {
    ctx.fillStyle = '#bdbdbd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const x = col * cellSize, y = row * cellSize;

            if (revealed[row][col]) {
                ctx.fillStyle = '#e0e0e0';
                ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

                if (board[row][col] === -1) {
                    ctx.fillStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(x + cellSize/2, y + cellSize/2, 10, 0, Math.PI * 2);
                    ctx.fill();
                } else if (board[row][col] > 0) {
                    ctx.fillStyle = numColors[board[row][col]];
                    ctx.font = 'bold 18px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(board[row][col], x + cellSize/2, y + cellSize/2);
                }
            } else {
                ctx.fillStyle = '#999';
                ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

                if (flagged[row][col]) {
                    ctx.fillStyle = '#e74c3c';
                    ctx.font = '18px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🚩', x + cellSize/2, y + cellSize/2);
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
