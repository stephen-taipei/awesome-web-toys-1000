let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let scores = { X: 0, O: 0, draws: 0 };

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function init() {
    createGrid();
    document.getElementById('restartBtn').addEventListener('click', resetGame);
    updateStatus();
}

function createGrid() {
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleClick(i));
        grid.appendChild(cell);
    }
}

function handleClick(index) {
    if (!gameActive || board[index] !== '') return;

    board[index] = currentPlayer;
    updateCell(index);

    const winResult = checkWin();
    if (winResult) {
        highlightWin(winResult);
        scores[currentPlayer]++;
        updateScores();
        showStatus(currentPlayer + ' 獲勝!', 'winner');
        gameActive = false;
        return;
    }

    if (board.every(cell => cell !== '')) {
        scores.draws++;
        updateScores();
        showStatus('平手!', 'draw');
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
}

function updateCell(index) {
    const cells = document.querySelectorAll('.cell');
    cells[index].textContent = board[index];
    cells[index].classList.add(board[index].toLowerCase(), 'taken');
}

function checkWin() {
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return pattern;
        }
    }
    return null;
}

function highlightWin(pattern) {
    const cells = document.querySelectorAll('.cell');
    pattern.forEach(index => {
        cells[index].classList.add('winning');
    });
}

function updateStatus() {
    const status = document.getElementById('status');
    status.textContent = currentPlayer + ' 的回合';
    status.className = 'status ' + currentPlayer.toLowerCase() + '-turn';
}

function showStatus(message, className) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status ' + className;
}

function updateScores() {
    document.getElementById('xScore').textContent = scores.X;
    document.getElementById('oScore').textContent = scores.O;
    document.getElementById('draws').textContent = scores.draws;
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;

    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });

    updateStatus();
}

document.addEventListener('DOMContentLoaded', init);
