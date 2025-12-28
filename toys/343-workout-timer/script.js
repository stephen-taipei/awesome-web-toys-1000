let workTime = 30;
let restTime = 10;
let totalRounds = 8;
let currentRound = 1;
let timeLeft = workTime;
let isWorking = true;
let isRunning = false;
let interval = null;

function init() {
    document.querySelectorAll('.adj-btn').forEach(btn => {
        btn.addEventListener('click', () => adjust(btn.dataset.target, parseInt(btn.dataset.delta)));
    });
    document.getElementById('startBtn').addEventListener('click', toggle);
    document.getElementById('resetBtn').addEventListener('click', reset);
    updateDisplay();
}

function adjust(target, delta) {
    if (isRunning) return;
    if (target === 'work') {
        workTime = Math.max(5, Math.min(120, workTime + delta));
        document.getElementById('workTime').textContent = workTime;
    } else if (target === 'rest') {
        restTime = Math.max(5, Math.min(60, restTime + delta));
        document.getElementById('restTime').textContent = restTime;
    } else if (target === 'rounds') {
        totalRounds = Math.max(1, Math.min(20, totalRounds + delta));
        document.getElementById('rounds').textContent = totalRounds;
        document.getElementById('totalRounds').textContent = totalRounds;
    }
    reset();
}

function toggle() {
    if (isRunning) {
        clearInterval(interval);
        document.getElementById('startBtn').textContent = '繼續';
    } else {
        interval = setInterval(tick, 1000);
        document.getElementById('startBtn').textContent = '暫停';
    }
    isRunning = !isRunning;
}

function tick() {
    timeLeft--;
    if (timeLeft <= 0) {
        if (isWorking) {
            if (currentRound >= totalRounds) {
                complete();
                return;
            }
            isWorking = false;
            timeLeft = restTime;
        } else {
            isWorking = true;
            currentRound++;
            timeLeft = workTime;
        }
    }
    updateDisplay();
}

function complete() {
    clearInterval(interval);
    isRunning = false;
    document.getElementById('phase').textContent = '完成!';
    document.getElementById('timer').textContent = '🎉';
    document.getElementById('startBtn').textContent = '開始';
}

function reset() {
    clearInterval(interval);
    isRunning = false;
    isWorking = true;
    currentRound = 1;
    timeLeft = workTime;
    document.getElementById('startBtn').textContent = '開始';
    updateDisplay();
}

function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById('timer').textContent =
        String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    document.getElementById('phase').textContent = isWorking ? '運動!' : '休息';
    document.getElementById('currentRound').textContent = currentRound;
    document.body.classList.toggle('resting', !isWorking);
}

document.addEventListener('DOMContentLoaded', init);
