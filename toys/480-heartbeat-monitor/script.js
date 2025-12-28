const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const ecgData = [];
const maxPoints = 200;
let position = 0;
let beatTimer = 0;
let heartRate = 72;
let lastBeatTime = 0;

// ECG waveform pattern (simplified PQRST)
function getECGValue(phase) {
    phase = phase % 1;

    if (phase < 0.1) {
        // P wave
        return Math.sin(phase * Math.PI * 10) * 0.15;
    } else if (phase < 0.15) {
        // PR segment
        return 0;
    } else if (phase < 0.18) {
        // Q wave
        return -0.1;
    } else if (phase < 0.22) {
        // R wave (spike)
        const t = (phase - 0.18) / 0.04;
        if (t < 0.5) return t * 2;
        return 1 - (t - 0.5) * 2.5;
    } else if (phase < 0.26) {
        // S wave
        return -0.2 + (phase - 0.22) * 5;
    } else if (phase < 0.4) {
        // ST segment
        return 0;
    } else if (phase < 0.55) {
        // T wave
        return Math.sin((phase - 0.4) * Math.PI / 0.15) * 0.25;
    } else {
        // Baseline
        return 0;
    }
}

function update() {
    const now = Date.now();
    const beatInterval = 60000 / heartRate;

    beatTimer += 16;
    const phase = (beatTimer % beatInterval) / beatInterval;

    let value = getECGValue(phase);

    // Add some noise
    value += (Math.random() - 0.5) * 0.02;

    ecgData.push(value);
    if (ecgData.length > maxPoints) {
        ecgData.shift();
    }

    // Detect beat for visual feedback
    if (phase < 0.22 && phase > 0.18 && now - lastBeatTime > 300) {
        lastBeatTime = now;
    }

    // Slowly vary heart rate
    heartRate += (Math.random() - 0.5) * 0.5;
    heartRate = Math.max(60, Math.min(100, heartRate));

    position++;
}

function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const chartLeft = 20;
    const chartRight = canvas.width - 20;
    const chartTop = 60;
    const chartBottom = canvas.height - 60;
    const chartMid = (chartTop + chartBottom) / 2;

    // Grid
    ctx.strokeStyle = 'rgba(0,255,136,0.1)';
    ctx.lineWidth = 1;

    // Horizontal grid
    for (let i = 0; i <= 4; i++) {
        const y = chartTop + (chartBottom - chartTop) * i / 4;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();
    }

    // Vertical grid
    for (let i = 0; i <= 8; i++) {
        const x = chartLeft + (chartRight - chartLeft) * i / 8;
        ctx.beginPath();
        ctx.moveTo(x, chartTop);
        ctx.lineTo(x, chartBottom);
        ctx.stroke();
    }

    // Draw ECG line
    if (ecgData.length > 1) {
        ctx.beginPath();
        ecgData.forEach((v, i) => {
            const x = chartLeft + (i / (maxPoints - 1)) * (chartRight - chartLeft);
            const y = chartMid - v * (chartBottom - chartTop) * 0.4;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff88';
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Scanning line
    const scanX = chartLeft + ((position % maxPoints) / maxPoints) * (chartRight - chartLeft);
    ctx.beginPath();
    ctx.moveTo(scanX, chartTop);
    ctx.lineTo(scanX, chartBottom);
    ctx.strokeStyle = 'rgba(0,255,136,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Heart rate display
    const beatAge = Date.now() - lastBeatTime;
    const beatScale = beatAge < 200 ? 1.2 - beatAge / 1000 : 1;

    ctx.save();
    ctx.translate(canvas.width / 2, 35);
    ctx.scale(beatScale, beatScale);

    ctx.fillStyle = '#ff4444';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('❤️', 0, 0);

    ctx.restore();

    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 20px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(heartRate)} BPM`, canvas.width / 2, 55);

    // Stats
    ctx.font = '11px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('SpO2: 98%', 20, canvas.height - 35);
    ctx.textAlign = 'right';
    ctx.fillText('BP: 120/80', canvas.width - 20, canvas.height - 35);

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,255,136,0.6)';
    ctx.fillText('LEAD II', canvas.width / 2, canvas.height - 35);
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

animate();

setInterval(() => {
    infoEl.textContent = `心率: ${Math.round(heartRate)} BPM | 狀態: 正常`;
}, 500);
