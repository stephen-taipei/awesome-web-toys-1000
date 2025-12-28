const modes = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
let currentMode = 'work';
let timeLeft = modes.work;
let totalTime = modes.work;
let isRunning = false;
let interval = null;
let sessions = 0;

function init() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });
    document.getElementById('startBtn').addEventListener('click', toggleTimer);
    document.getElementById('resetBtn').addEventListener('click', resetTimer);
    updateDisplay();
}

function setMode(mode) {
    if (isRunning) return;
    currentMode = mode;
    timeLeft = modes[mode];
    totalTime = modes[mode];
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    updateBackground();
    updateDisplay();
}

function updateBackground() {
    const colors = {
        work: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        short: 'linear-gradient(135deg, #27ae60, #2ecc71)',
        long: 'linear-gradient(135deg, #3498db, #2980b9)'
    };
    document.body.style.background = colors[currentMode];
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(interval);
        document.getElementById('startBtn').textContent = '開始';
    } else {
        interval = setInterval(tick, 1000);
        document.getElementById('startBtn').textContent = '暫停';
    }
    isRunning = !isRunning;
}

function tick() {
    timeLeft--;
    if (timeLeft <= 0) {
        clearInterval(interval);
        isRunning = false;
        document.getElementById('startBtn').textContent = '開始';
        if (currentMode === 'work') {
            sessions++;
            document.getElementById('sessions').textContent = sessions;
        }
        timeLeft = 0;
    }
    updateDisplay();
}

function resetTimer() {
    clearInterval(interval);
    isRunning = false;
    timeLeft = modes[currentMode];
    totalTime = modes[currentMode];
    document.getElementById('startBtn').textContent = '開始';
    updateDisplay();
}

function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById('time').textContent =
        String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

    const progress = document.getElementById('progress');
    const offset = 283 * (1 - timeLeft / totalTime);
    progress.style.strokeDashoffset = offset;
}

document.addEventListener('DOMContentLoaded', init);
