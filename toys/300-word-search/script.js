const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 10, cellSize = 28;
canvas.width = gridSize * cellSize;
canvas.height = gridSize * cellSize;

const wordSets = [
    ['CODE', 'JAVA', 'HTML', 'CSS', 'WEB', 'APP'],
    ['GAME', 'PLAY', 'FUN', 'WIN', 'SCORE', 'LEVEL'],
    ['CAT', 'DOG', 'BIRD', 'FISH', 'LION', 'BEAR']
];

let grid = [], words = [], found = [], selection = { start: null, end: null }, selecting = false;

function init() {
    document.getElementById('newBtn').addEventListener('click', startGame);
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('touchstart', e => { e.preventDefault(); handleStart(e.touches[0]); });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); handleMove(e.touches[0]); });
    canvas.addEventListener('touchend', handleEnd);
    startGame();
}

function startGame() {
    grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    words = wordSets[Math.floor(Math.random() * wordSets.length)];
    found = [];
    selection = { start: null, end: null };

    words.forEach(word => placeWord(word));

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (!grid[r][c]) grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
    }

    renderWordList();
    updateStatus();
    draw();
}

function placeWord(word) {
    const dirs = [[0,1], [1,0], [1,1], [0,-1], [-1,0]];
    let placed = false, attempts = 0;

    while (!placed && attempts < 100) {
        attempts++;
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        const startR = Math.floor(Math.random() * gridSize);
        const startC = Math.floor(Math.random() * gridSize);

        let valid = true;
        for (let i = 0; i < word.length; i++) {
            const r = startR + dir[0] * i;
            const c = startC + dir[1] * i;
            if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) { valid = false; break; }
            if (grid[r][c] && grid[r][c] !== word[i]) { valid = false; break; }
        }

        if (valid) {
            for (let i = 0; i < word.length; i++) {
                grid[startR + dir[0] * i][startC + dir[1] * i] = word[i];
            }
            placed = true;
        }
    }
}

function handleStart(e) {
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / cellSize);
    const row = Math.floor((e.clientY - rect.top) / cellSize);
    selection.start = { row, col };
    selection.end = { row, col };
    selecting = true;
    draw();
}

function handleMove(e) {
    if (!selecting) return;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / cellSize);
    const row = Math.floor((e.clientY - rect.top) / cellSize);
    selection.end = { row, col };
    draw();
}

function handleEnd() {
    if (!selecting) return;
    selecting = false;

    const selectedWord = getSelectedWord();
    if (words.includes(selectedWord) && !found.includes(selectedWord)) {
        found.push(selectedWord);
        renderWordList();
        updateStatus();
        if (found.length === words.length) {
            setTimeout(() => alert('恭喜! 全部找到!'), 300);
        }
    }
    selection = { start: null, end: null };
    draw();
}

function getSelectedWord() {
    if (!selection.start || !selection.end) return '';
    const { start, end } = selection;
    const dr = Math.sign(end.row - start.row);
    const dc = Math.sign(end.col - start.col);
    const len = Math.max(Math.abs(end.row - start.row), Math.abs(end.col - start.col)) + 1;

    let word = '';
    for (let i = 0; i < len; i++) {
        const r = start.row + dr * i;
        const c = start.col + dc * i;
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
            word += grid[r][c];
        }
    }
    return word;
}

function renderWordList() {
    const container = document.getElementById('wordList');
    container.innerHTML = words.map(w =>
        '<span class="' + (found.includes(w) ? 'found' : '') + '">' + w + '</span>'
    ).join('');
}

function updateStatus() {
    document.getElementById('status').textContent = '找到: ' + found.length + '/' + words.length;
}

function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (selection.start && selection.end) {
        ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
        const { start, end } = selection;
        const dr = Math.sign(end.row - start.row);
        const dc = Math.sign(end.col - start.col);
        const len = Math.max(Math.abs(end.row - start.row), Math.abs(end.col - start.col)) + 1;
        for (let i = 0; i < len; i++) {
            const r = start.row + dr * i;
            const c = start.col + dc * i;
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
    }

    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            ctx.fillText(grid[r][c], c * cellSize + cellSize/2, r * cellSize + cellSize/2);
        }
    }

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }
}

document.addEventListener('DOMContentLoaded', init);
