const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 300, cellSize = size / 3;
canvas.width = size; canvas.height = size;

let board = [], currentPlayer = 'X', gameOver = false, vsAI = false;
let xScore = 0, oScore = 0;

const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]
];

function init() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('aiBtn').addEventListener('click', () => { vsAI = true; startGame(); });
    canvas.addEventListener('click', handleClick);
    startGame();
}

function startGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameOver = false;
    document.getElementById('status').textContent = 'X 的回合';
    draw();
}

function handleClick(e) {
    if (gameOver || (vsAI && currentPlayer === 'O')) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    const index = row * 3 + col;

    if (board[index]) return;

    makeMove(index);
}

function makeMove(index) {
    board[index] = currentPlayer;
    draw();

    const winner = checkWinner();
    if (winner) {
        gameOver = true;
        if (winner === 'X') { xScore++; document.getElementById('xScore').textContent = xScore; }
        else { oScore++; document.getElementById('oScore').textContent = oScore; }
        document.getElementById('status').textContent = winner + ' 獲勝!';
        return;
    }

    if (board.every(cell => cell)) {
        gameOver = true;
        document.getElementById('status').textContent = '平手!';
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    document.getElementById('status').textContent = currentPlayer + ' 的回合';

    if (vsAI && currentPlayer === 'O') {
        setTimeout(aiMove, 500);
    }
}

function aiMove() {
    const empty = board.map((v, i) => v === '' ? i : -1).filter(i => i >= 0);
    if (empty.length === 0) return;

    for (const i of empty) {
        board[i] = 'O';
        if (checkWinner() === 'O') { board[i] = ''; makeMove(i); return; }
        board[i] = '';
    }

    for (const i of empty) {
        board[i] = 'X';
        if (checkWinner() === 'X') { board[i] = ''; makeMove(i); return; }
        board[i] = '';
    }

    if (board[4] === '') { makeMove(4); return; }

    const corners = [0, 2, 6, 8].filter(i => empty.includes(i));
    if (corners.length) { makeMove(corners[Math.floor(Math.random() * corners.length)]); return; }

    makeMove(empty[Math.floor(Math.random() * empty.length)]);
}

function checkWinner() {
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 3;
    for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(size, i * cellSize);
        ctx.stroke();
    }

    board.forEach((cell, i) => {
        const x = (i % 3) * cellSize + cellSize / 2;
        const y = Math.floor(i / 3) * cellSize + cellSize / 2;

        if (cell === 'X') {
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x - 30, y - 30);
            ctx.lineTo(x + 30, y + 30);
            ctx.moveTo(x + 30, y - 30);
            ctx.lineTo(x - 30, y + 30);
            ctx.stroke();
        } else if (cell === 'O') {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(x, y, 35, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
