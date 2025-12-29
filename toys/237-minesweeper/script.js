let gridSize = 9, mineCount = 10;
let board = [], revealed = [], flagged = [];
let gameOver = false, firstClick = true;
let timerInterval = null, seconds = 0;

function init() {
    document.getElementById('newGameBtn').addEventListener('click', newGame);
    document.getElementById('status').addEventListener('click', newGame);
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gridSize = parseInt(btn.dataset.size);
            mineCount = parseInt(btn.dataset.mines);
            newGame();
        });
    });
    newGame();
}

function newGame() {
    board = []; revealed = []; flagged = [];
    gameOver = false; firstClick = true; seconds = 0;
    clearInterval(timerInterval);
    document.getElementById('timer').textContent = '0';
    document.getElementById('mineCount').textContent = mineCount;
    document.getElementById('status').textContent = '😊';

    for (let y = 0; y < gridSize; y++) {
        board[y] = []; revealed[y] = []; flagged[y] = [];
        for (let x = 0; x < gridSize; x++) {
            board[y][x] = 0; revealed[y][x] = false; flagged[y][x] = false;
        }
    }
    render();
}

function placeMines(safeX, safeY) {
    let placed = 0;
    while (placed < mineCount) {
        const x = Math.floor(Math.random() * gridSize);
        const y = Math.floor(Math.random() * gridSize);
        if (board[y][x] !== -1 && !(Math.abs(x - safeX) <= 1 && Math.abs(y - safeY) <= 1)) {
            board[y][x] = -1;
            placed++;
        }
    }
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (board[y][x] !== -1) {
                board[y][x] = countAdjacent(x, y);
            }
        }
    }
}

function countAdjacent(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && board[ny][nx] === -1) {
                count++;
            }
        }
    }
    return count;
}

function render() {
    const grid = document.getElementById('gameGrid');
    grid.style.gridTemplateColumns = 'repeat(' + gridSize + ', 1fr)';
    grid.innerHTML = '';

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            if (revealed[y][x]) {
                cell.classList.add('revealed');
                if (board[y][x] === -1) {
                    cell.textContent = '💣';
                    cell.classList.add('mine');
                } else if (board[y][x] > 0) {
                    cell.textContent = board[y][x];
                    cell.dataset.num = board[y][x];
                }
            } else if (flagged[y][x]) {
                cell.classList.add('flagged');
            }

            cell.addEventListener('click', () => handleClick(x, y));
            cell.addEventListener('contextmenu', (e) => { e.preventDefault(); toggleFlag(x, y); });

            let pressTimer;
            cell.addEventListener('touchstart', () => { pressTimer = setTimeout(() => toggleFlag(x, y), 500); });
            cell.addEventListener('touchend', () => clearTimeout(pressTimer));

            grid.appendChild(cell);
        }
    }
}

function handleClick(x, y) {
    if (gameOver || flagged[y][x] || revealed[y][x]) return;

    if (firstClick) {
        firstClick = false;
        placeMines(x, y);
        timerInterval = setInterval(() => {
            seconds++;
            document.getElementById('timer').textContent = seconds;
        }, 1000);
    }

    reveal(x, y);
    render();
    checkWin();
}

function reveal(x, y) {
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
    if (revealed[y][x] || flagged[y][x]) return;

    revealed[y][x] = true;

    if (board[y][x] === -1) {
        endGame(false);
        return;
    }

    if (board[y][x] === 0) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                reveal(x + dx, y + dy);
            }
        }
    }
}

function toggleFlag(x, y) {
    if (gameOver || revealed[y][x]) return;
    flagged[y][x] = !flagged[y][x];
    const remaining = mineCount - flagged.flat().filter(f => f).length;
    document.getElementById('mineCount').textContent = remaining;
    render();
}

function checkWin() {
    let unrevealed = 0;
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (!revealed[y][x]) unrevealed++;
        }
    }
    if (unrevealed === mineCount) {
        endGame(true);
    }
}

function endGame(won) {
    gameOver = true;
    clearInterval(timerInterval);
    document.getElementById('status').textContent = won ? '😎' : '😵';

    if (!won) {
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (board[y][x] === -1) revealed[y][x] = true;
            }
        }
        render();
    }
}

document.addEventListener('DOMContentLoaded', init);
