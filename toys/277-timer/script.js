const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let size = 200, totalTime = 300, remainingTime = 0, isRunning = false, intervalId = null;

function init() {
    canvas.width = size; canvas.height = size;
    document.getElementById('startBtn').addEventListener('click', toggleTimer);
    document.getElementById('resetBtn').addEventListener('click', reset);
    updateDisplay();
    draw();
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(intervalId);
        isRunning = false;
        document.getElementById('startBtn').textContent = '開始';
    } else {
        if (remainingTime <= 0) {
            const mins = parseInt(document.getElementById('minutes').value) || 0;
            const secs = parseInt(document.getElementById('seconds').value) || 0;
            totalTime = mins * 60 + secs;
            remainingTime = totalTime;
        }
        if (remainingTime > 0) {
            isRunning = true;
            document.getElementById('startBtn').textContent = '暫停';
            intervalId = setInterval(tick, 1000);
        }
    }
}

function tick() {
    remainingTime--;
    updateDisplay();
    draw();
    if (remainingTime <= 0) {
        clearInterval(intervalId);
        isRunning = false;
        document.getElementById('startBtn').textContent = '開始';
        alert('時間到!');
    }
}

function reset() {
    clearInterval(intervalId);
    isRunning = false;
    remainingTime = 0;
    document.getElementById('startBtn').textContent = '開始';
    updateDisplay();
    draw();
}

function updateDisplay() {
    const mins = Math.floor(remainingTime / 60);
    const secs = remainingTime % 60;
    document.getElementById('timerDisplay').textContent =
        String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

function draw() {
    const cx = size/2, cy = size/2, r = size * 0.4;
    ctx.clearRect(0, 0, size, size);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    const progress = totalTime > 0 ? remainingTime / totalTime : 0;
    ctx.strokeStyle = '#00d9ff';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + progress * Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#00d9ff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(progress * 100) + '%', cx, cy);
}

document.addEventListener('DOMContentLoaded', init);
