const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const infoEl = document.getElementById('info');

let audioContext;
let analyser;
let dataArray;
let isRunning = false;
let simulationMode = false;

// Simulated frequency data for demo
let simPhase = 0;

function generateSimulatedData() {
    simPhase += 0.05;
    const data = new Uint8Array(128);
    for (let i = 0; i < data.length; i++) {
        const freq = i / data.length;
        const wave = Math.sin(simPhase + i * 0.1) * 0.5 + 0.5;
        const bass = i < 20 ? Math.sin(simPhase * 2) * 0.8 + 0.2 : 0;
        const mid = i > 20 && i < 80 ? Math.sin(simPhase * 3 + i * 0.05) * 0.5 + 0.3 : 0;
        const high = i > 80 ? Math.sin(simPhase * 5) * 0.3 + 0.1 : 0;
        data[i] = Math.floor((bass + mid + high + wave * 0.2) * 128);
    }
    return data;
}

async function startAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        simulationMode = false;
        infoEl.textContent = '正在接收麥克風音訊...';
    } catch (e) {
        // Fall back to simulation mode
        simulationMode = true;
        dataArray = new Uint8Array(128);
        infoEl.textContent = '模擬模式 (無麥克風權限)';
    }

    isRunning = true;
    startBtn.textContent = '停止';
    startBtn.classList.add('active');
    draw();
}

function stopAudio() {
    isRunning = false;
    if (audioContext) {
        audioContext.close();
    }
    startBtn.textContent = '開啟麥克風';
    startBtn.classList.remove('active');
    infoEl.textContent = '已停止';
}

function draw() {
    if (!isRunning) return;

    if (simulationMode) {
        dataArray = generateSimulatedData();
    } else if (analyser) {
        analyser.getByteFrequencyData(dataArray);
    }

    // Clear with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Circular visualization
    const bars = dataArray.length;
    const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 20;

    for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2;
        const amplitude = dataArray[i] / 255;
        const radius = 50 + amplitude * (maxRadius - 50);

        const x1 = cx + Math.cos(angle) * 50;
        const y1 = cy + Math.sin(angle) * 50;
        const x2 = cx + Math.cos(angle) * radius;
        const y2 = cy + Math.sin(angle) * radius;

        const hue = (i / bars) * 360;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `hsla(${hue}, 80%, ${50 + amplitude * 30}%, ${0.5 + amplitude * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add glow dots at the ends
        if (amplitude > 0.5) {
            ctx.beginPath();
            ctx.arc(x2, y2, 3 + amplitude * 3, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${amplitude})`;
            ctx.fill();
        }
    }

    // Center circle
    const avgAmplitude = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
    ctx.beginPath();
    ctx.arc(cx, cy, 30 + avgAmplitude * 20, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + avgAmplitude * 0.3})`;
    ctx.fill();

    requestAnimationFrame(draw);
}

startBtn.addEventListener('click', () => {
    if (isRunning) {
        stopAudio();
    } else {
        startAudio();
    }
});

// Draw initial state
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = 'rgba(255,255,255,0.3)';
ctx.font = '14px Arial';
ctx.textAlign = 'center';
ctx.fillText('點擊按鈕開始', canvas.width / 2, canvas.height / 2);
