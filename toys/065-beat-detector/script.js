/**
 * Beat Detector 節拍偵測
 * Web Toys #065
 *
 * 音樂節拍偵測與視覺化
 *
 * 技術重點：
 * - 能量檢測算法
 * - BPM 估算
 * - 節拍觸發視覺效果
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('beatCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    visualStyle: 'pulse',
    sensitivity: 1.5,
    threshold: 0.5,
    decay: 0.95,
    autoColor: true
};

// 音訊相關
let audioContext = null;
let analyser = null;
let microphone = null;
let dataArray = null;
let bufferLength = 0;
let isRunning = false;

// 節拍偵測
let energyHistory = [];
const historySize = 43; // 約 1 秒 (假設 43 fps)
let beatCount = 0;
let lastBeatTime = 0;
let beatTimes = [];
let currentHue = 0;
let beatEnergy = 0;

// 視覺效果
let pulses = [];
let bars = [];
let particles = [];
let wavePoints = [];

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    initBars();
    initWavePoints();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initBars() {
    bars = [];
    const barCount = 32;
    for (let i = 0; i < barCount; i++) {
        bars.push({
            value: 0,
            targetValue: 0
        });
    }
}

function initWavePoints() {
    wavePoints = [];
    const pointCount = 100;
    for (let i = 0; i < pointCount; i++) {
        wavePoints.push({
            x: (i / pointCount) * canvas.width,
            y: canvas.height / 2,
            baseY: canvas.height / 2,
            velocity: 0
        });
    }
}

// ==================== 音訊設定 ====================

async function startAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;

        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        isRunning = true;
        document.getElementById('statusDisplay').textContent = '運行中';
        document.getElementById('startBtn').textContent = '停止';
        document.getElementById('startBtn').classList.add('active');

    } catch (error) {
        console.error('無法啟用麥克風:', error);
        document.getElementById('statusDisplay').textContent = '權限被拒';
    }
}

function stopAudio() {
    if (microphone) {
        microphone.disconnect();
    }
    if (audioContext) {
        audioContext.close();
    }
    isRunning = false;
    audioContext = null;
    analyser = null;
    microphone = null;

    document.getElementById('statusDisplay').textContent = '已停止';
    document.getElementById('startBtn').textContent = '開始麥克風';
    document.getElementById('startBtn').classList.remove('active');
}

// ==================== 節拍偵測 ====================

function detectBeat() {
    if (!dataArray) return false;

    // 計算低頻能量（bass）
    let bassEnergy = 0;
    const bassRange = Math.floor(bufferLength * 0.2); // 低頻20%
    for (let i = 0; i < bassRange; i++) {
        bassEnergy += dataArray[i] * dataArray[i];
    }
    bassEnergy = Math.sqrt(bassEnergy / bassRange) / 255;
    bassEnergy *= config.sensitivity;

    // 維護能量歷史
    energyHistory.push(bassEnergy);
    if (energyHistory.length > historySize) {
        energyHistory.shift();
    }

    // 計算平均能量
    const avgEnergy = energyHistory.reduce((a, b) => a + b, 0) / energyHistory.length;

    // 計算能量變異數
    let variance = 0;
    for (const e of energyHistory) {
        variance += (e - avgEnergy) * (e - avgEnergy);
    }
    variance = Math.sqrt(variance / energyHistory.length);

    // 動態閾值
    const dynamicThreshold = avgEnergy + variance * config.threshold * 2;

    // 偵測節拍（需要間隔至少 150ms）
    const now = performance.now();
    const minInterval = 150;

    if (bassEnergy > dynamicThreshold && now - lastBeatTime > minInterval) {
        lastBeatTime = now;
        beatCount++;
        beatEnergy = bassEnergy;

        // 記錄節拍時間用於 BPM 計算
        beatTimes.push(now);
        if (beatTimes.length > 20) {
            beatTimes.shift();
        }

        // 計算 BPM
        if (beatTimes.length >= 4) {
            let totalInterval = 0;
            for (let i = 1; i < beatTimes.length; i++) {
                totalInterval += beatTimes[i] - beatTimes[i - 1];
            }
            const avgInterval = totalInterval / (beatTimes.length - 1);
            const bpm = Math.round(60000 / avgInterval);
            if (bpm > 40 && bpm < 220) {
                document.getElementById('bpmDisplay').textContent = bpm;
            }
        }

        // 自動變色
        if (config.autoColor) {
            currentHue = (currentHue + 30) % 360;
        }

        return true;
    }

    return false;
}

// ==================== 視覺效果 ====================

function triggerBeatEffect() {
    const indicator = document.getElementById('beatIndicator');
    indicator.style.background = `radial-gradient(circle, hsla(${currentHue}, 80%, 60%, 0.8) 0%, transparent 70%)`;
    indicator.classList.remove('active');
    void indicator.offsetWidth; // 重置動畫
    indicator.classList.add('active');

    // 根據模式觸發效果
    switch (config.visualStyle) {
        case 'pulse':
            pulses.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                radius: 50,
                maxRadius: Math.max(canvas.width, canvas.height),
                opacity: 1,
                hue: currentHue
            });
            break;

        case 'particles':
            for (let i = 0; i < 50; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 5 + Math.random() * 10 * beatEnergy;
                particles.push({
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: 3 + Math.random() * 5,
                    life: 1,
                    hue: currentHue + Math.random() * 30 - 15
                });
            }
            break;
    }
}

function drawPulse() {
    // 更新和繪製脈衝
    for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];

        pulse.radius += 15;
        pulse.opacity *= config.decay;

        if (pulse.opacity < 0.01 || pulse.radius > pulse.maxRadius) {
            pulses.splice(i, 1);
            continue;
        }

        ctx.strokeStyle = `hsla(${pulse.hue}, 80%, 60%, ${pulse.opacity})`;
        ctx.lineWidth = 5 * pulse.opacity;
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.stroke();

        // 內發光
        const gradient = ctx.createRadialGradient(
            pulse.x, pulse.y, pulse.radius - 10,
            pulse.x, pulse.y, pulse.radius + 10
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, `hsla(${pulse.hue}, 80%, 60%, ${pulse.opacity * 0.3})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // 中心圓
    const avgEnergy = energyHistory.length > 0 ?
        energyHistory.reduce((a, b) => a + b, 0) / energyHistory.length : 0;
    const centerRadius = 50 + avgEnergy * 100;

    const centerGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, centerRadius
    );
    centerGradient.addColorStop(0, `hsla(${currentHue}, 80%, 50%, 0.8)`);
    centerGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = centerGradient;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, centerRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawBars() {
    if (!dataArray) return;

    const barWidth = canvas.width / bars.length;
    const heightMultiplier = canvas.height * 0.8 / 256;

    for (let i = 0; i < bars.length; i++) {
        // 取得對應頻率範圍的平均值
        const startBin = Math.floor((i / bars.length) * bufferLength);
        const endBin = Math.floor(((i + 1) / bars.length) * bufferLength);

        let sum = 0;
        for (let j = startBin; j < endBin; j++) {
            sum += dataArray[j];
        }
        const avg = sum / (endBin - startBin);

        bars[i].targetValue = avg;
        bars[i].value += (bars[i].targetValue - bars[i].value) * 0.3;

        const barHeight = bars[i].value * heightMultiplier;
        const x = i * barWidth;
        const y = canvas.height - barHeight;

        // 漸層
        const gradient = ctx.createLinearGradient(x, canvas.height, x, y);
        gradient.addColorStop(0, `hsla(${currentHue + i * 3}, 70%, 40%, 0.8)`);
        gradient.addColorStop(1, `hsla(${currentHue + i * 3 + 30}, 80%, 60%, 0.8)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 2, y, barWidth - 4, barHeight);

        // 頂部發光
        ctx.fillStyle = `hsla(${currentHue + i * 3}, 100%, 80%, 0.8)`;
        ctx.fillRect(x + 2, y - 4, barWidth - 4, 4);
    }
}

function drawParticles() {
    // 更新和繪製粒子
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // 重力
        p.life -= 0.02;

        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 60%, ${p.life})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 背景能量波
    if (dataArray) {
        const avgEnergy = dataArray.reduce((a, b) => a + b, 0) / bufferLength / 255;
        const waveRadius = 100 + avgEnergy * 200;

        ctx.strokeStyle = `hsla(${currentHue}, 60%, 40%, ${avgEnergy * 0.5})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawWaveform() {
    if (!dataArray) return;

    // 計算波形影響
    const avgEnergy = dataArray.reduce((a, b) => a + b, 0) / bufferLength / 255;

    for (let i = 0; i < wavePoints.length; i++) {
        const dataIndex = Math.floor((i / wavePoints.length) * bufferLength);
        const value = dataArray[dataIndex] / 255;

        const targetY = wavePoints[i].baseY + (value - 0.5) * canvas.height * 0.6 * config.sensitivity;
        wavePoints[i].velocity += (targetY - wavePoints[i].y) * 0.1;
        wavePoints[i].velocity *= 0.9;
        wavePoints[i].y += wavePoints[i].velocity;
    }

    // 繪製波形
    ctx.beginPath();
    ctx.moveTo(0, wavePoints[0].y);

    for (let i = 1; i < wavePoints.length; i++) {
        const prev = wavePoints[i - 1];
        const curr = wavePoints[i];
        const cpx = (prev.x + curr.x) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + curr.y) / 2);
    }

    ctx.lineTo(canvas.width, wavePoints[wavePoints.length - 1].y);

    // 填充到底部
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `hsla(${currentHue}, 80%, 60%, 0.6)`);
    gradient.addColorStop(0.5, `hsla(${currentHue + 60}, 80%, 40%, 0.4)`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fill();

    // 頂部線條
    ctx.strokeStyle = `hsla(${currentHue}, 100%, 70%, 0.8)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, wavePoints[0].y);
    for (let i = 1; i < wavePoints.length; i++) {
        const prev = wavePoints[i - 1];
        const curr = wavePoints[i];
        const cpx = (prev.x + curr.x) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + curr.y) / 2);
    }
    ctx.stroke();
}

// ==================== 繪製 ====================

function draw() {
    ctx.fillStyle = 'rgba(5, 5, 16, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isRunning && analyser) {
        analyser.getByteFrequencyData(dataArray);

        if (detectBeat()) {
            triggerBeatEffect();
        }

        document.getElementById('beatCount').textContent = beatCount;
    }

    beatEnergy *= config.decay;

    switch (config.visualStyle) {
        case 'pulse':
            drawPulse();
            break;
        case 'bars':
            drawBars();
            break;
        case 'particles':
            drawParticles();
            break;
        case 'waveform':
            drawWaveform();
            break;
    }

    requestAnimationFrame(draw);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', () => {
    resizeCanvas();
    initBars();
    initWavePoints();
});

document.getElementById('startBtn').addEventListener('click', () => {
    if (isRunning) {
        stopAudio();
    } else {
        startAudio();
    }
});

document.getElementById('visualStyle').addEventListener('change', (e) => {
    config.visualStyle = e.target.value;
    pulses = [];
    particles = [];
    initBars();
    initWavePoints();
});

document.getElementById('sensitivity').addEventListener('input', (e) => {
    config.sensitivity = parseFloat(e.target.value);
    document.getElementById('sensitivityValue').textContent = config.sensitivity.toFixed(1);
});

document.getElementById('threshold').addEventListener('input', (e) => {
    config.threshold = parseFloat(e.target.value);
    document.getElementById('thresholdValue').textContent = config.threshold.toFixed(2);
});

document.getElementById('decay').addEventListener('input', (e) => {
    config.decay = parseFloat(e.target.value);
    document.getElementById('decayValue').textContent = config.decay.toFixed(2);
});

document.getElementById('autoColor').addEventListener('change', (e) => {
    config.autoColor = e.target.checked;
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
