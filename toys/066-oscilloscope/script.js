/**
 * Oscilloscope 示波器
 * Web Toys #066
 *
 * 即時音訊波形顯示
 *
 * 技術重點：
 * - Web Audio API 時域分析
 * - 觸發同步
 * - 多種顯示模式
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('scopeCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    displayMode: 'waveform',
    timeScale: 1.0,
    amplitude: 1.0,
    persistence: 0.1,
    showGrid: true,
    autoTrigger: true
};

// 音訊相關
let audioContext = null;
let analyser = null;
let microphone = null;
let timeDomainData = null;
let frequencyData = null;
let bufferLength = 0;
let isRunning = false;

// 歷史波形（用於 XY 模式）
let historyBuffer = [];
const historySize = 2048;

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 音訊設定 ====================

async function startAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.5;

        bufferLength = analyser.fftSize;
        timeDomainData = new Uint8Array(bufferLength);
        frequencyData = new Uint8Array(analyser.frequencyBinCount);

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

// ==================== 分析函數 ====================

function findTriggerPoint() {
    if (!config.autoTrigger) return 0;

    // 尋找從低到高穿越中心點的位置
    const center = 128;
    for (let i = 1; i < bufferLength - 1; i++) {
        if (timeDomainData[i - 1] < center && timeDomainData[i] >= center) {
            return i;
        }
    }
    return 0;
}

function estimateFrequency() {
    if (!timeDomainData) return 0;

    // 簡單的零交叉計數
    let crossings = 0;
    const center = 128;

    for (let i = 1; i < bufferLength; i++) {
        if ((timeDomainData[i - 1] < center && timeDomainData[i] >= center) ||
            (timeDomainData[i - 1] >= center && timeDomainData[i] < center)) {
            crossings++;
        }
    }

    // 計算頻率
    const duration = bufferLength / audioContext.sampleRate;
    const frequency = (crossings / 2) / duration;

    return frequency;
}

function calculateAmplitude() {
    if (!timeDomainData) return 0;

    let min = 255;
    let max = 0;

    for (let i = 0; i < bufferLength; i++) {
        if (timeDomainData[i] < min) min = timeDomainData[i];
        if (timeDomainData[i] > max) max = timeDomainData[i];
    }

    return ((max - min) / 255).toFixed(2);
}

// ==================== 繪製函數 ====================

function drawGrid() {
    if (!config.showGrid) return;

    ctx.strokeStyle = 'rgba(0, 255, 100, 0.15)';
    ctx.lineWidth = 1;

    // 垂直線
    const vDivisions = 10;
    for (let i = 0; i <= vDivisions; i++) {
        const x = (i / vDivisions) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // 水平線
    const hDivisions = 8;
    for (let i = 0; i <= hDivisions; i++) {
        const y = (i / hDivisions) * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // 中心線（較亮）
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}

function drawWaveform() {
    if (!timeDomainData) return;

    const triggerPoint = findTriggerPoint();
    const samplesPerPixel = bufferLength / canvas.width / config.timeScale;
    const centerY = canvas.height / 2;

    ctx.strokeStyle = '#00ff64';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ff64';
    ctx.shadowBlur = 10;

    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        const sampleIndex = Math.floor(triggerPoint + x * samplesPerPixel);
        if (sampleIndex >= bufferLength) break;

        const value = timeDomainData[sampleIndex];
        const normalizedValue = (value - 128) / 128;
        const y = centerY - normalizedValue * centerY * config.amplitude;

        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawXY() {
    if (!timeDomainData) return;

    // 更新歷史緩衝
    for (let i = 0; i < bufferLength; i++) {
        historyBuffer.push(timeDomainData[i]);
    }
    while (historyBuffer.length > historySize) {
        historyBuffer.shift();
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) * 0.4 * config.amplitude;

    ctx.strokeStyle = '#00ff64';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#00ff64';
    ctx.shadowBlur = 5;

    ctx.beginPath();

    // XY 李薩如圖形
    const delay = Math.floor(historyBuffer.length / 4); // 90度相位差

    for (let i = delay; i < historyBuffer.length; i++) {
        const xValue = (historyBuffer[i - delay] - 128) / 128;
        const yValue = (historyBuffer[i] - 128) / 128;

        const x = centerX + xValue * scale;
        const y = centerY - yValue * scale;

        if (i === delay) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawDual() {
    if (!timeDomainData) return;

    const triggerPoint = findTriggerPoint();
    const samplesPerPixel = bufferLength / canvas.width / config.timeScale;

    // 上半部：波形
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height / 2);
    ctx.clip();

    const upperCenterY = canvas.height / 4;

    ctx.strokeStyle = '#00ff64';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ff64';
    ctx.shadowBlur = 10;

    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        const sampleIndex = Math.floor(triggerPoint + x * samplesPerPixel);
        if (sampleIndex >= bufferLength) break;

        const value = timeDomainData[sampleIndex];
        const normalizedValue = (value - 128) / 128;
        const y = upperCenterY - normalizedValue * (canvas.height / 4) * config.amplitude * 0.8;

        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // 下半部：頻譜
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, canvas.height / 2, canvas.width, canvas.height / 2);
    ctx.clip();

    analyser.getByteFrequencyData(frequencyData);

    const barWidth = canvas.width / frequencyData.length * 2;
    const baseY = canvas.height;

    for (let i = 0; i < frequencyData.length / 2; i++) {
        const value = frequencyData[i];
        const barHeight = (value / 255) * (canvas.height / 2) * 0.8;
        const x = i * barWidth;

        const hue = 120 + (i / frequencyData.length) * 60;
        ctx.fillStyle = `hsl(${hue}, 80%, ${30 + value / 5}%)`;
        ctx.fillRect(x, baseY - barHeight, barWidth - 1, barHeight);
    }

    ctx.restore();

    // 分隔線
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function drawSpectrumWaveform() {
    if (!timeDomainData) return;

    // 背景頻譜
    analyser.getByteFrequencyData(frequencyData);

    for (let i = 0; i < frequencyData.length; i++) {
        const value = frequencyData[i];
        const barWidth = canvas.width / frequencyData.length;
        const x = i * barWidth;
        const barHeight = (value / 255) * canvas.height;

        const alpha = value / 512;
        ctx.fillStyle = `rgba(0, ${100 + value / 2}, ${50 + value / 5}, ${alpha})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    }

    // 前景波形
    const triggerPoint = findTriggerPoint();
    const samplesPerPixel = bufferLength / canvas.width / config.timeScale;
    const centerY = canvas.height / 2;

    ctx.strokeStyle = '#00ff64';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00ff64';
    ctx.shadowBlur = 15;

    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        const sampleIndex = Math.floor(triggerPoint + x * samplesPerPixel);
        if (sampleIndex >= bufferLength) break;

        const value = timeDomainData[sampleIndex];
        const normalizedValue = (value - 128) / 128;
        const y = centerY - normalizedValue * centerY * config.amplitude;

        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
}

// ==================== 主繪製 ====================

function draw() {
    // 餘輝效果
    ctx.fillStyle = `rgba(10, 21, 16, ${1 - config.persistence})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    if (isRunning && analyser) {
        analyser.getByteTimeDomainData(timeDomainData);

        // 更新資訊
        const freq = estimateFrequency();
        const amp = calculateAmplitude();
        document.getElementById('freqDisplay').textContent = freq > 20 ? freq.toFixed(1) + ' Hz' : '-- Hz';
        document.getElementById('ampDisplay').textContent = amp;

        switch (config.displayMode) {
            case 'waveform':
                drawWaveform();
                break;
            case 'xy':
                drawXY();
                break;
            case 'dual':
                drawDual();
                break;
            case 'spectrum':
                drawSpectrumWaveform();
                break;
        }
    }

    requestAnimationFrame(draw);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('startBtn').addEventListener('click', () => {
    if (isRunning) {
        stopAudio();
    } else {
        startAudio();
    }
});

document.getElementById('displayMode').addEventListener('change', (e) => {
    config.displayMode = e.target.value;
    historyBuffer = [];
});

document.getElementById('timeScale').addEventListener('input', (e) => {
    config.timeScale = parseFloat(e.target.value);
    document.getElementById('timeScaleValue').textContent = config.timeScale.toFixed(2);
});

document.getElementById('amplitude').addEventListener('input', (e) => {
    config.amplitude = parseFloat(e.target.value);
    document.getElementById('amplitudeValue').textContent = config.amplitude.toFixed(1);
});

document.getElementById('persistence').addEventListener('input', (e) => {
    config.persistence = parseFloat(e.target.value);
    document.getElementById('persistenceValue').textContent = config.persistence.toFixed(2);
});

document.getElementById('showGrid').addEventListener('change', (e) => {
    config.showGrid = e.target.checked;
});

document.getElementById('autoTrigger').addEventListener('change', (e) => {
    config.autoTrigger = e.target.checked;
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
