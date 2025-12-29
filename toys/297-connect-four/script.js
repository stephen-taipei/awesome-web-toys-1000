const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cols = 7, rows = 6, cellSize = 42;
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let board = [], currentPlayer = 1, gameOver = false;

function init() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    canvas.addEventListener('click', handleClick);
    startGame();
}

function startGame() {
    board = Array(rows).fill().map(() => Array(cols).fill(0));
    currentPlayer = 1;
    gameOver = false;
    document.getElementById('status').textContent = '紅色回合';
    document.getElementById('status').style.color = '#e74c3c';
    draw();
}

function handleClick(e) {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const col = Math.floor(x / cellSize);

    for (let row = rows - 1; row >= 0; row--) {
        if (board[row][col] === 0) {
            board[row][col] = currentPlayer;
            draw();

            if (checkWinner(row, col)) {
                gameOver = true;
                const winner = currentPlayer === 1 ? '紅色' : '黃色';
                document.getElementById('status').textContent = winner + ' 獲勝!';
                return;
            }

            if (board[0].every(cell => cell !== 0)) {
                gameOver = true;
                document.getElementById('status').textContent = '平手!';
                return;
            }

            currentPlayer = currentPlayer === 1 ? 2 : 1;
            const text = currentPlayer === 1 ? '紅色回合' : '黃色回合';
            document.getElementById('status').textContent = text;
            document.getElementById('status').style.color = currentPlayer === 1 ? '#e74c3c' : '#f1c40f';
            break;
        }
    }
}

function checkWinner(row, col) {
    const directions = [[0,1], [1,0], [1,1], [1,-1]];

    for (const [dy, dx] of directions) {
        let count = 1;
        for (let i = 1; i < 4; i++) {
            const r = row + dy * i, c = col + dx * i;
            if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== currentPlayer) break;
            count++;
        }
        for (let i = 1; i < 4; i++) {
            const r = row - dy * i, c = col - dx * i;
            if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== currentPlayer) break;
            count++;
        }
        if (count >= 4) return true;
    }
    return false;
}

function draw() {
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * cellSize + cellSize / 2;
            const y = row * cellSize + cellSize / 2;

            ctx.fillStyle = board[row][col] === 0 ? '#1a1a2e' :
                           board[row][col] === 1 ? '#e74c3c' : '#f1c40f';
            ctx.beginPath();
            ctx.arc(x, y, cellSize / 2 - 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
