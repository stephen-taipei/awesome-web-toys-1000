const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 200;
let bpm = 120, isRunning = false, intervalId = null;
let pendulumAngle = 0, direction = 1, beatCount = 0;
let tapTimes = [], audioCtx = null;

function init() {
    canvas.width = size; canvas.height = size;
    document.getElementById('startBtn').addEventListener('click', toggleMetronome);
    document.getElementById('tapBtn').addEventListener('click', tapTempo);
    document.getElementById('bpmSlider').addEventListener('input', (e) => {
        bpm = parseInt(e.target.value);
        document.getElementById('bpmValue').textContent = bpm;
        if (isRunning) { clearInterval(intervalId); startBeats(); }
    });
    draw();
}

function toggleMetronome() {
    if (isRunning) {
        clearInterval(intervalId);
        isRunning = false;
        document.getElementById('startBtn').textContent = '開始';
    } else {
        isRunning = true;
        document.getElementById('startBtn').textContent = '停止';
        startBeats();
    }
}

function startBeats() {
    const interval = 60000 / bpm;
    playClick();
    intervalId = setInterval(() => {
        playClick();
        beatCount++;
    }, interval);
    animate();
}

function playClick() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = beatCount % 4 === 0 ? 1000 : 800;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.1);
}

function animate() {
    if (!isRunning) return;
    const speed = bpm / 60 * 0.1;
    pendulumAngle += direction * speed;
    if (Math.abs(pendulumAngle) > 0.8) direction *= -1;
    draw();
    requestAnimationFrame(animate);
}

function tapTempo() {
    const now = Date.now();
    tapTimes.push(now);
    if (tapTimes.length > 4) tapTimes.shift();
    if (tapTimes.length >= 2) {
        let total = 0;
        for (let i = 1; i < tapTimes.length; i++) {
            total += tapTimes[i] - tapTimes[i - 1];
        }
        const avgInterval = total / (tapTimes.length - 1);
        bpm = Math.round(60000 / avgInterval);
        bpm = Math.max(40, Math.min(240, bpm));
        document.getElementById('bpmValue').textContent = bpm;
        document.getElementById('bpmSlider').value = bpm;
    }
}

function draw() {
    const cx = size/2, cy = 30;
    ctx.clearRect(0, 0, size, size);

    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const endX = cx + Math.sin(pendulumAngle) * 140;
    const endY = cy + Math.cos(pendulumAngle) * 140;
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.arc(endX, endY, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#8b6914';
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
}

document.addEventListener('DOMContentLoaded', init);
