let startTime = 0, elapsedTime = 0, isRunning = false, intervalId = null;
let laps = [];

function init() {
    document.getElementById('startBtn').addEventListener('click', toggleTimer);
    document.getElementById('lapBtn').addEventListener('click', recordLap);
    document.getElementById('resetBtn').addEventListener('click', reset);
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(intervalId);
        elapsedTime += Date.now() - startTime;
        isRunning = false;
        document.getElementById('startBtn').textContent = '繼續';
    } else {
        startTime = Date.now();
        isRunning = true;
        document.getElementById('startBtn').textContent = '暫停';
        intervalId = setInterval(updateDisplay, 10);
    }
}

function updateDisplay() {
    const current = elapsedTime + (isRunning ? Date.now() - startTime : 0);
    document.getElementById('timeDisplay').textContent = formatTime(current);
}

function formatTime(ms) {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const cents = Math.floor((ms % 1000) / 10);
    return String(mins).padStart(2, '0') + ':' +
           String(secs).padStart(2, '0') + '.' +
           String(cents).padStart(2, '0');
}

function recordLap() {
    if (!isRunning && elapsedTime === 0) return;
    const current = elapsedTime + (isRunning ? Date.now() - startTime : 0);
    const lastLap = laps.length > 0 ? laps[laps.length - 1].total : 0;
    const lapTime = current - lastLap;
    laps.push({ lap: laps.length + 1, time: lapTime, total: current });
    renderLaps();
}

function renderLaps() {
    const container = document.getElementById('laps');
    container.innerHTML = laps.map(l =>
        '<div><span>圈 ' + l.lap + '</span><span>' + formatTime(l.time) + '</span></div>'
    ).reverse().join('');
}

function reset() {
    clearInterval(intervalId);
    startTime = 0;
    elapsedTime = 0;
    isRunning = false;
    laps = [];
    document.getElementById('startBtn').textContent = '開始';
    document.getElementById('timeDisplay').textContent = '00:00.00';
    document.getElementById('laps').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', init);
