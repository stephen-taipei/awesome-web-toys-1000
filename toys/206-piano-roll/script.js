let canvas, ctx;
let audioContext;
let notes = [];
let isPlaying = false;
let playPosition = 0;
let bpm = 120;

const noteNames = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4', 'B3', 'A3', 'G3', 'F3'];
const noteFreqs = {
    'C5': 523.25, 'B4': 493.88, 'A4': 440.00, 'G4': 392.00,
    'F4': 349.23, 'E4': 329.63, 'D4': 293.66, 'C4': 261.63,
    'B3': 246.94, 'A3': 220.00, 'G3': 196.00, 'F3': 174.61
};

const numRows = noteNames.length;
const numCols = 32;
const cellWidth = 30;
const cellHeight = 25;

const presets = {
    scale: [[0,7],[1,6],[2,5],[3,4],[4,3],[5,2],[6,1],[7,0]],
    twinkle: [[0,7],[1,7],[2,4],[3,4],[4,3],[5,3],[6,4],[8,5],[9,5],[10,6],[11,6],[12,7]],
    ode: [[0,5],[1,5],[2,4],[3,3],[4,3],[5,4],[6,5],[7,6],[8,7],[9,7],[10,6],[11,5],[12,5],[14,6],[15,6]]
};

function init() {
    canvas = document.getElementById('rollCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = numCols * cellWidth;
    canvas.height = numRows * cellHeight;

    createKeyboard();
    setupControls();
    draw();

    canvas.addEventListener('click', handleCanvasClick);
}

function createKeyboard() {
    const panel = document.getElementById('keysPanel');
    noteNames.forEach((note, i) => {
        const key = document.createElement('div');
        key.className = 'key ' + (note.includes('#') ? 'black' : 'white');
        key.textContent = note;
        key.dataset.note = note;
        key.addEventListener('click', () => playNote(note));
        panel.appendChild(key);
    });
}

function setupControls() {
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('clearBtn').addEventListener('click', clearNotes);

    document.getElementById('bpmSlider').addEventListener('input', (e) => {
        bpm = parseInt(e.target.value);
        document.getElementById('bpmValue').textContent = bpm;
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => loadPreset(btn.dataset.preset));
    });
}

function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (col >= 0 && col < numCols && row >= 0 && row < numRows) {
        toggleNote(col, row);
    }
}

function toggleNote(col, row) {
    const existingIndex = notes.findIndex(n => n.col === col && n.row === row);

    if (existingIndex >= 0) {
        notes.splice(existingIndex, 1);
    } else {
        notes.push({ col, row, note: noteNames[row] });
        playNote(noteNames[row]);
    }

    draw();
}

function loadPreset(preset) {
    notes = [];
    presets[preset].forEach(([col, row]) => {
        notes.push({ col, row, note: noteNames[row] });
    });
    draw();
}

function clearNotes() {
    notes = [];
    draw();
}

function togglePlay() {
    isPlaying = !isPlaying;
    document.getElementById('playBtn').textContent = isPlaying ? '停止' : '播放';

    if (isPlaying) {
        playPosition = 0;
        playSequence();
    }
}

function playSequence() {
    if (!isPlaying) return;

    const beatDuration = 60000 / bpm / 2;

    // Find and play notes at current position
    notes.filter(n => n.col === playPosition).forEach(n => {
        playNote(n.note);
    });

    draw();

    playPosition++;
    if (playPosition >= numCols) {
        playPosition = 0;
    }

    setTimeout(playSequence, beatDuration);
}

function playNote(noteName) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(noteFreqs[noteName], audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);

    // Highlight key
    const key = document.querySelector(`[data-note="${noteName}"]`);
    if (key) {
        key.classList.add('active');
        setTimeout(() => key.classList.remove('active'), 200);
    }
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = col * cellWidth;
            const y = row * cellHeight;

            // Alternating row colors
            if (row % 2 === 0) {
                ctx.fillStyle = '#1e2a3a';
            } else {
                ctx.fillStyle = '#1a2535';
            }
            ctx.fillRect(x, y, cellWidth, cellHeight);

            // Beat markers
            if (col % 4 === 0) {
                ctx.fillStyle = 'rgba(79, 172, 254, 0.1)';
                ctx.fillRect(x, y, cellWidth, cellHeight);
            }

            // Grid lines
            ctx.strokeStyle = '#333';
            ctx.strokeRect(x, y, cellWidth, cellHeight);
        }
    }

    // Draw notes
    notes.forEach(n => {
        const x = n.col * cellWidth;
        const y = n.row * cellHeight;

        const gradient = ctx.createLinearGradient(x, y, x + cellWidth, y + cellHeight);
        gradient.addColorStop(0, '#4facfe');
        gradient.addColorStop(1, '#00f2fe');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
    });

    // Draw playhead
    if (isPlaying) {
        ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
        ctx.fillRect(playPosition * cellWidth, 0, cellWidth, canvas.height);

        ctx.strokeStyle = '#ff6464';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playPosition * cellWidth + cellWidth / 2, 0);
        ctx.lineTo(playPosition * cellWidth + cellWidth / 2, canvas.height);
        ctx.stroke();
    }
}

document.addEventListener('DOMContentLoaded', init);
