const patterns = {
    relaxing: { inhale: 4, hold: 7, exhale: 8, name: '4-7-8 放鬆' },
    energizing: { inhale: 4, hold: 4, exhale: 4, name: '4-4-4 提神' },
    calming: { inhale: 5, hold: 5, exhale: 5, name: '5-5-5 平靜' }
};

let currentPattern = 'relaxing';
let phase = 'ready';
let timeLeft = 0;
let cycles = 0;
let isRunning = false;
let interval = null;

function init() {
    document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.addEventListener('click', () => setPattern(btn.dataset.pattern));
    });
    document.getElementById('startBtn').addEventListener('click', toggle);
}

function setPattern(pattern) {
    if (isRunning) return;
    currentPattern = pattern;
    document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pattern === pattern);
    });
}

function toggle() {
    if (isRunning) {
        stop();
    } else {
        start();
    }
}

function start() {
    isRunning = true;
    document.getElementById('startBtn').textContent = '停止';
    startPhase('inhale');
}

function stop() {
    isRunning = false;
    clearInterval(interval);
    document.getElementById('startBtn').textContent = '開始';
    document.getElementById('instruction').textContent = '準備';
    document.getElementById('timer').textContent = '';
    document.getElementById('circle').className = 'circle';
}

function startPhase(newPhase) {
    phase = newPhase;
    const pattern = patterns[currentPattern];
    const circle = document.getElementById('circle');

    if (phase === 'inhale') {
        timeLeft = pattern.inhale;
        document.getElementById('instruction').textContent = '吸氣';
        circle.className = 'circle inhale';
        circle.style.transition = `transform ${pattern.inhale}s ease-in-out`;
    } else if (phase === 'hold') {
        timeLeft = pattern.hold;
        document.getElementById('instruction').textContent = '屏息';
    } else if (phase === 'exhale') {
        timeLeft = pattern.exhale;
        document.getElementById('instruction').textContent = '呼氣';
        circle.className = 'circle exhale';
        circle.style.transition = `transform ${pattern.exhale}s ease-in-out`;
    }

    updateTimer();
    interval = setInterval(tick, 1000);
}

function tick() {
    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
        clearInterval(interval);
        if (phase === 'inhale') {
            startPhase('hold');
        } else if (phase === 'hold') {
            startPhase('exhale');
        } else if (phase === 'exhale') {
            cycles++;
            document.getElementById('cycles').textContent = cycles;
            startPhase('inhale');
        }
    }
}

function updateTimer() {
    document.getElementById('timer').textContent = timeLeft;
}

document.addEventListener('DOMContentLoaded', init);
