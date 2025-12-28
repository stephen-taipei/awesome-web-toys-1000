const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 306, cellSize = size / 9;
canvas.width = size; canvas.height = size;

let puzzle = [], solution = [], userInput = [], selected = null;

const puzzles = [
    '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
    '003020600900305001001806400008102900700000008006708200002609500800203009005010300',
    '200080300060070084030500209000105408000000000402706000301007040720040060004010003'
];

function init() {
    document.getElementById('newBtn').addEventListener('click', startGame);
    document.getElementById('checkBtn').addEventListener('click', checkSolution);
    canvas.addEventListener('click', handleClick);

    const numpad = document.getElementById('numpad');
    for (let i = 1; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.addEventListener('click', () => inputNumber(i));
        numpad.appendChild(btn);
    }

    startGame();
}

function startGame() {
    const puzzleStr = puzzles[Math.floor(Math.random() * puzzles.length)];
    puzzle = [];
    userInput = [];

    for (let i = 0; i < 81; i++) {
        const row = Math.floor(i / 9);
        if (!puzzle[row]) { puzzle[row] = []; userInput[row] = []; }
        puzzle[row][i % 9] = parseInt(puzzleStr[i]);
        userInput[row][i % 9] = 0;
    }

    selected = null;
    draw();
}

function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (puzzle[row][col] === 0) {
        selected = { row, col };
    } else {
        selected = null;
    }
    draw();
}

function inputNumber(num) {
    if (selected && puzzle[selected.row][selected.col] === 0) {
        userInput[selected.row][selected.col] = num;
        draw();
    }
}

function checkSolution() {
    let complete = true;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = puzzle[r][c] || userInput[r][c];
            if (val === 0 || !isValid(r, c, val)) {
                complete = false;
            }
        }
    }
    alert(complete ? '恭喜! 答案正確!' : '還有錯誤，請檢查');
}

function isValid(row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (i !== col && getCell(row, i) === num) return false;
        if (i !== row && getCell(i, col) === num) return false;
    }

    const boxR = Math.floor(row / 3) * 3;
    const boxC = Math.floor(col / 3) * 3;
    for (let r = boxR; r < boxR + 3; r++) {
        for (let c = boxC; c < boxC + 3; c++) {
            if ((r !== row || c !== col) && getCell(r, c) === num) return false;
        }
    }
    return true;
}

function getCell(r, c) {
    return puzzle[r][c] || userInput[r][c];
}

function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const x = c * cellSize, y = r * cellSize;

            if (selected && selected.row === r && selected.col === c) {
                ctx.fillStyle = '#e3f2fd';
                ctx.fillRect(x, y, cellSize, cellSize);
            }

            const val = puzzle[r][c] || userInput[r][c];
            if (val) {
                ctx.fillStyle = puzzle[r][c] ? '#000' : '#3498db';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(val, x + cellSize/2, y + cellSize/2);
            }
        }
    }

    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 9; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(size, i * cellSize);
        ctx.stroke();
    }

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 3 * cellSize, 0);
        ctx.lineTo(i * 3 * cellSize, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * 3 * cellSize);
        ctx.lineTo(size, i * 3 * cellSize);
        ctx.stroke();
    }
}

document.addEventListener('DOMContentLoaded', init);
