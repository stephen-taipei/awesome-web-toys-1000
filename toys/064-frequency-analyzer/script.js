/**
 * Frequency Analyzer 頻率分析器
 * Web Toys #064
 *
 * 音訊頻率分析工具
 *
 * 技術重點：
 * - Web Audio API
 * - FFT 頻譜分析
 * - 多種視覺化模式
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('analyzerCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    displayMode: 'spectrum',
    fftSize: 1024,
    smoothing: 0.8,
    minDecibels: -90,
    showPeaks: true,
    logScale: true
};

// 音訊相關
let audioContext = null;
let analyser = null;
let microphone = null;
let dataArray = null;
let bufferLength = 0;
let isRunning = false;

// 頻譜瀑布歷史
let spectrogramHistory = [];
const maxHistoryLength = 200;

// 峰值追蹤
let peakValues = [];
let peakDecay = 0.98;

// 3D 視角
let rotation3D = 0;

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    spectrogramHistory = [];
}

// ==================== 音訊設定 ====================

async function startAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = config.fftSize;
        analyser.smoothingTimeConstant = config.smoothing;
        analyser.minDecibels = config.minDecibels;
        analyser.maxDecibels = -10;

        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        peakValues = new Array(bufferLength).fill(0);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        isRunning = true;
        document.getElementById('statusDisplay').textContent = '運行中';
        document.getElementById('sampleRate').textContent = audioContext.sampleRate + ' Hz';
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

// ==================== 頻率計算 ====================

function getFrequencyForBin(bin) {
    if (!audioContext) return 0;
    return bin * audioContext.sampleRate / config.fftSize;
}

function findDominantFrequency() {
    if (!dataArray) return 0;

    let maxValue = 0;
    let maxIndex = 0;

    for (let i = 1; i < bufferLength; i++) {
        if (dataArray[i] > maxValue) {
            maxValue = dataArray[i];
            maxIndex = i;
        }
    }

    return getFrequencyForBin(maxIndex);
}

function formatFrequency(freq) {
    if (freq >= 1000) {
        return (freq / 1000).toFixed(2) + ' kHz';
    }
    return freq.toFixed(1) + ' Hz';
}

// ==================== 視覺模式 ====================

function drawSpectrum() {
    const barWidth = canvas.width / bufferLength;
    const heightMultiplier = canvas.height / 256;

    // 繪製網格
    drawGrid();

    // 繪製頻譜
    for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const barHeight = value * heightMultiplier;

        // 更新峰值
        if (config.showPeaks) {
            if (value > peakValues[i]) {
                peakValues[i] = value;
            } else {
                peakValues[i] *= peakDecay;
            }
        }

        // 漸層顏色
        const hue = (i / bufferLength) * 120 + 120; // 綠到藍
        const saturation = 70 + (value / 255) * 30;
        const lightness = 30 + (value / 255) * 40;

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        const x = config.logScale ? getLogX(i, bufferLength, canvas.width) : i * barWidth;
        const nextX = config.logScale ? getLogX(i + 1, bufferLength, canvas.width) : (i + 1) * barWidth;
        const w = Math.max(1, nextX - x - 1);

        ctx.fillRect(x, canvas.height - barHeight, w, barHeight);

        // 繪製峰值線
        if (config.showPeaks && peakValues[i] > 5) {
            const peakY = canvas.height - peakValues[i] * heightMultiplier;
            ctx.fillStyle = '#00ffaa';
            ctx.fillRect(x, peakY - 2, w, 2);
        }
    }

    // 繪製頻率標籤
    drawFrequencyLabels();
}

function drawSpectrogram() {
    // 添加當前幀到歷史
    if (dataArray) {
        spectrogramHistory.unshift(Array.from(dataArray));
        if (spectrogramHistory.length > maxHistoryLength) {
            spectrogramHistory.pop();
        }
    }

    const rowHeight = canvas.height / maxHistoryLength;
    const colWidth = canvas.width / bufferLength;

    for (let y = 0; y < spectrogramHistory.length; y++) {
        const row = spectrogramHistory[y];
        for (let x = 0; x < row.length; x++) {
            const value = row[x];
            const hue = 240 - (value / 255) * 240; // 藍到紅
            const lightness = (value / 255) * 50;

            ctx.fillStyle = `hsl(${hue}, 80%, ${lightness}%)`;

            const px = config.logScale ? getLogX(x, bufferLength, canvas.width) : x * colWidth;
            const nextPx = config.logScale ? getLogX(x + 1, bufferLength, canvas.width) : (x + 1) * colWidth;
            const pw = Math.max(1, nextPx - px);

            ctx.fillRect(px, y * rowHeight, pw, rowHeight + 1);
        }
    }

    // 繪製頻率標籤
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    drawFrequencyLabels();
}

function drawOctave() {
    // 八度頻帶: 31.25, 62.5, 125, 250, 500, 1k, 2k, 4k, 8k, 16k Hz
    const octaveBands = [31.25, 62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    const bandLabels = ['31', '63', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
    const bandValues = new Array(octaveBands.length).fill(0);
    const bandCounts = new Array(octaveBands.length).fill(0);

    // 計算每個頻帶的平均值
    if (dataArray && audioContext) {
        for (let i = 0; i < bufferLength; i++) {
            const freq = getFrequencyForBin(i);
            for (let b = 0; b < octaveBands.length; b++) {
                const low = b === 0 ? 0 : octaveBands[b - 1] * Math.sqrt(2);
                const high = octaveBands[b] * Math.sqrt(2);
                if (freq >= low && freq < high) {
                    bandValues[b] += dataArray[i];
                    bandCounts[b]++;
                    break;
                }
            }
        }
    }

    // 計算平均值
    for (let b = 0; b < octaveBands.length; b++) {
        if (bandCounts[b] > 0) {
            bandValues[b] /= bandCounts[b];
        }
    }

    const barWidth = canvas.width / octaveBands.length * 0.8;
    const gap = canvas.width / octaveBands.length * 0.1;
    const heightMultiplier = (canvas.height - 60) / 256;

    for (let b = 0; b < octaveBands.length; b++) {
        const value = bandValues[b];
        const barHeight = value * heightMultiplier;
        const x = b * (barWidth + gap * 2) + gap + canvas.width * 0.05;

        // 漸層
        const gradient = ctx.createLinearGradient(x, canvas.height - 40, x, canvas.height - 40 - barHeight);
        gradient.addColorStop(0, '#00c896');
        gradient.addColorStop(0.5, '#64dcff');
        gradient.addColorStop(1, '#c864ff');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - 40 - barHeight, barWidth, barHeight);

        // 發光效果
        ctx.shadowColor = '#00c896';
        ctx.shadowBlur = 10;
        ctx.fillRect(x, canvas.height - 40 - barHeight, barWidth, barHeight);
        ctx.shadowBlur = 0;

        // 標籤
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(bandLabels[b], x + barWidth / 2, canvas.height - 20);

        // 數值
        ctx.fillStyle = '#00d0a0';
        ctx.fillText(Math.round(value).toString(), x + barWidth / 2, canvas.height - 50 - barHeight);
    }
}

function draw3D() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    rotation3D += 0.005;

    // 繪製多層3D頻譜
    const layers = 8;
    for (let layer = layers - 1; layer >= 0; layer--) {
        const layerAlpha = 0.3 + (1 - layer / layers) * 0.7;
        const layerZ = layer * 30;

        ctx.beginPath();

        for (let i = 0; i < bufferLength; i++) {
            const value = dataArray ? dataArray[i] : 0;
            const angle = (i / bufferLength) * Math.PI * 2 + rotation3D;
            const r = radius + value * 0.8 - layerZ;

            // 3D 投影
            const x3d = Math.cos(angle) * r;
            const y3d = Math.sin(angle) * r * 0.5; // 壓縮Y軸模擬透視
            const z3d = Math.sin(angle) * r * 0.3 - layerZ;

            const scale = 1 / (1 + z3d * 0.001);
            const screenX = centerX + x3d * scale;
            const screenY = centerY + y3d * scale + z3d * 0.5;

            if (i === 0) {
                ctx.moveTo(screenX, screenY);
            } else {
                ctx.lineTo(screenX, screenY);
            }
        }

        ctx.closePath();

        const hue = (layer / layers) * 60 + 150;
        ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${layerAlpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = `hsla(${hue}, 70%, 30%, ${layerAlpha * 0.3})`;
        ctx.fill();
    }

    // 中心資訊
    if (dataArray) {
        const avgValue = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        const coreRadius = 50 + avgValue * 0.3;

        const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
        coreGradient.addColorStop(0, 'rgba(0, 208, 160, 0.8)');
        coreGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==================== 輔助函數 ====================

function getLogX(bin, totalBins, width) {
    if (bin === 0) return 0;
    const logMin = Math.log10(1);
    const logMax = Math.log10(totalBins);
    const logBin = Math.log10(bin);
    return ((logBin - logMin) / (logMax - logMin)) * width;
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 200, 150, 0.1)';
    ctx.lineWidth = 1;

    // 水平線（分貝）
    for (let db = 0; db <= 100; db += 20) {
        const y = canvas.height - (db / 100) * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`-${100 - db} dB`, 40, y + 4);
    }
}

function drawFrequencyLabels() {
    const frequencies = [100, 200, 500, 1000, 2000, 5000, 10000, 20000];

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';

    for (const freq of frequencies) {
        if (!audioContext) continue;

        const bin = Math.round(freq * config.fftSize / audioContext.sampleRate);
        if (bin >= bufferLength) continue;

        const x = config.logScale ? getLogX(bin, bufferLength, canvas.width) : (bin / bufferLength) * canvas.width;

        ctx.fillText(formatFrequency(freq), x, canvas.height - 5);
    }
}

// ==================== 繪製 ====================

function draw() {
    ctx.fillStyle = 'rgba(10, 15, 20, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isRunning && analyser) {
        analyser.getByteFrequencyData(dataArray);

        // 更新主頻顯示
        const dominantFreq = findDominantFrequency();
        document.getElementById('dominantFreq').textContent = formatFrequency(dominantFreq);
    }

    switch (config.displayMode) {
        case 'spectrum':
            drawSpectrum();
            break;
        case 'spectrogram':
            drawSpectrogram();
            break;
        case 'octave':
            drawOctave();
            break;
        case '3d':
            draw3D();
            break;
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
    spectrogramHistory = [];
});

document.getElementById('fftSize').addEventListener('change', (e) => {
    config.fftSize = parseInt(e.target.value);
    if (analyser) {
        analyser.fftSize = config.fftSize;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        peakValues = new Array(bufferLength).fill(0);
    }
    spectrogramHistory = [];
});

document.getElementById('smoothing').addEventListener('input', (e) => {
    config.smoothing = parseFloat(e.target.value);
    document.getElementById('smoothingValue').textContent = config.smoothing.toFixed(2);
    if (analyser) {
        analyser.smoothingTimeConstant = config.smoothing;
    }
});

document.getElementById('minDecibels').addEventListener('input', (e) => {
    config.minDecibels = parseInt(e.target.value);
    document.getElementById('minDecibelsValue').textContent = config.minDecibels;
    if (analyser) {
        analyser.minDecibels = config.minDecibels;
    }
});

document.getElementById('showPeaks').addEventListener('change', (e) => {
    config.showPeaks = e.target.checked;
    if (!config.showPeaks) {
        peakValues = peakValues.map(() => 0);
    }
});

document.getElementById('logScale').addEventListener('change', (e) => {
    config.logScale = e.target.checked;
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
