let duration = 5 * 60;
let timeLeft = duration;
let totalMinutes = 0;
let isRunning = false;
let interval = null;

function init() {
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', () => setDuration(parseInt(btn.dataset.mins)));
    });
    document.getElementById('startBtn').addEventListener('click', toggle);
    updateDisplay();
}

function setDuration(mins) {
    if (isRunning) return;
    duration = mins * 60;
    timeLeft = duration;
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.mins) === mins);
    });
    updateDisplay();
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
    document.body.classList.add('meditating');
    document.getElementById('startBtn').textContent = '結束冥想';
    document.getElementById('status').textContent = '專注於呼吸...';
    interval = setInterval(tick, 1000);
}

function stop() {
    isRunning = false;
    clearInterval(interval);
    document.body.classList.remove('meditating');
    document.getElementById('startBtn').textContent = '開始冥想';

    // Calculate completed minutes
    const completedSeconds = duration - timeLeft;
    const completedMinutes = Math.floor(completedSeconds / 60);
    if (completedMinutes > 0) {
        totalMinutes += completedMinutes;
        document.getElementById('totalMins').textContent = totalMinutes;
    }

    timeLeft = duration;
    document.getElementById('status').textContent = '選擇時間開始冥想';
    updateDisplay();
}

function tick() {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
        complete();
    }
}

function complete() {
    clearInterval(interval);
    isRunning = false;
    document.body.classList.remove('meditating');
    totalMinutes += Math.floor(duration / 60);
    document.getElementById('totalMins').textContent = totalMinutes;
    document.getElementById('time').textContent = '🧘';
    document.getElementById('status').textContent = '冥想完成!';
    document.getElementById('startBtn').textContent = '再來一次';
    timeLeft = duration;
}

function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById('time').textContent =
        String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

document.addEventListener('DOMContentLoaded', init);
