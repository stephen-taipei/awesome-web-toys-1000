const gridEl = document.getElementById('grid');
const playBtn = document.getElementById('playBtn');
const clearBtn = document.getElementById('clearBtn');
const tempoInput = document.getElementById('tempo');

const ROWS = 5;
const COLS = 8;
const notes = [523.25, 493.88, 440, 392, 349.23]; // C5, B4, A4, G4, F4

let grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
let isPlaying = false;
let currentCol = 0;
let audioCtx = null;

function createGrid() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => toggleCell(row, col, cell));
            gridEl.appendChild(cell);
        }
    }
}

function toggleCell(row, col, cell) {
    grid[row][col] = !grid[row][col];
    cell.classList.toggle('active');
}

function playNote(frequency) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
}

function playColumn(col) {
    // Clear previous playing state
    document.querySelectorAll('.cell.playing').forEach(c => c.classList.remove('playing'));

    // Highlight current column
    for (let row = 0; row < ROWS; row++) {
        const cell = gridEl.children[row * COLS + col];
        if (grid[row][col]) {
            cell.classList.add('playing');
            playNote(notes[row]);
        }
    }
}

function startPlayback() {
    isPlaying = true;
    playBtn.textContent = '⏸️ 暫停';

    function step() {
        if (!isPlaying) return;

        playColumn(currentCol);
        currentCol = (currentCol + 1) % COLS;

        setTimeout(step, tempoInput.value);
    }

    step();
}

function stopPlayback() {
    isPlaying = false;
    playBtn.textContent = '▶️ 播放';
    document.querySelectorAll('.cell.playing').forEach(c => c.classList.remove('playing'));
}

playBtn.addEventListener('click', () => {
    if (isPlaying) {
        stopPlayback();
    } else {
        startPlayback();
    }
});

clearBtn.addEventListener('click', () => {
    grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('active', 'playing'));
    currentCol = 0;
    stopPlayback();
});

createGrid();
