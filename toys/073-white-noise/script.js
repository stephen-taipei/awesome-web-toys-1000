/**
 * White Noise 白噪音
 * Web Toys #073
 *
 * 多種噪音類型產生器
 *
 * 技術重點：
 * - 噪音合成算法
 * - 濾波器控制
 * - 定時功能
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('noiseCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    noiseType: 'white',
    volume: 0.5,
    lowpass: 20000,
    highpass: 20,
    timer: 0
};

// 音訊相關
let audioContext = null;
let noiseNode = null;
let gainNode = null;
let lowpassFilter = null;
let highpassFilter = null;
let isPlaying = false;

// 定時器
let timerEndTime = 0;
let timerInterval = null;

// 噪音描述
const noiseDescriptions = {
    white: '白噪音：全頻段等能量分布，幫助集中注意力',
    pink: '粉紅噪音：低頻較強，類似雨聲，促進深度睡眠',
    brown: '棕噪音：深沉低頻，類似瀑布聲，深度放鬆',
    blue: '藍噪音：高頻較強，提升警覺性',
    violet: '紫噪音：極高頻，掩蓋耳鳴'
};

const noiseNames = {
    white: '白噪音',
    pink: '粉紅噪音',
    brown: '棕噪音',
    blue: '藍噪音',
    violet: '紫噪音'
};

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 噪音生成 ====================

function createNoiseBuffer(type) {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    switch (type) {
        case 'white':
            createWhiteNoise(data);
            break;
        case 'pink':
            createPinkNoise(data);
            break;
        case 'brown':
            createBrownNoise(data);
            break;
        case 'blue':
            createBlueNoise(data);
            break;
        case 'violet':
            createVioletNoise(data);
            break;
    }

    return buffer;
}

function createWhiteNoise(data) {
    for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
    }
}

function createPinkNoise(data) {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;

        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;

        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
    }
}

function createBrownNoise(data) {
    let lastOut = 0;

    for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
    }
}

function createBlueNoise(data) {
    let lastValue = 0;

    for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = white - lastValue;
        lastValue = white;
    }

    // 正規化
    let max = 0;
    for (let i = 0; i < data.length; i++) {
        max = Math.max(max, Math.abs(data[i]));
    }
    for (let i = 0; i < data.length; i++) {
        data[i] /= max;
    }
}

function createVioletNoise(data) {
    let lastValue = 0;
    let lastDiff = 0;

    for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        const diff = white - lastValue;
        data[i] = diff - lastDiff;
        lastDiff = diff;
        lastValue = white;
    }

    // 正規化
    let max = 0;
    for (let i = 0; i < data.length; i++) {
        max = Math.max(max, Math.abs(data[i]));
    }
    for (let i = 0; i < data.length; i++) {
        data[i] /= max;
    }
}

// ==================== 音訊控制 ====================

function startNoise() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (noiseNode) {
        noiseNode.stop();
        noiseNode.disconnect();
    }

    // 創建噪音緩衝
    const buffer = createNoiseBuffer(config.noiseType);

    noiseNode = audioContext.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    // 濾波器
    lowpassFilter = audioContext.createBiquadFilter();
    lowpassFilter.type = 'lowpass';
    lowpassFilter.frequency.value = config.lowpass;

    highpassFilter = audioContext.createBiquadFilter();
    highpassFilter.type = 'highpass';
    highpassFilter.frequency.value = config.highpass;

    // 音量
    gainNode = audioContext.createGain();
    gainNode.gain.value = config.volume;

    // 連接
    noiseNode.connect(highpassFilter);
    highpassFilter.connect(lowpassFilter);
    lowpassFilter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noiseNode.start();
    isPlaying = true;

    // 啟動定時器
    if (config.timer > 0) {
        startTimer();
    }

    document.getElementById('playBtn').textContent = '停止';
    document.getElementById('playBtn').classList.add('playing');
    document.getElementById('statusDisplay').textContent = '播放中';
    document.getElementById('noiseIcon').classList.add('playing');
}

function stopNoise() {
    if (noiseNode) {
        noiseNode.stop();
        noiseNode.disconnect();
        noiseNode = null;
    }

    isPlaying = false;

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        document.getElementById('timerDisplay').textContent = '';
    }

    document.getElementById('playBtn').textContent = '播放';
    document.getElementById('playBtn').classList.remove('playing');
    document.getElementById('statusDisplay').textContent = '停止';
    document.getElementById('noiseIcon').classList.remove('playing');
}

function toggleNoise() {
    if (isPlaying) {
        stopNoise();
    } else {
        startNoise();
    }
}

// ==================== 定時器 ====================

function startTimer() {
    timerEndTime = Date.now() + config.timer * 60 * 1000;

    timerInterval = setInterval(() => {
        const remaining = timerEndTime - Date.now();

        if (remaining <= 0) {
            stopNoise();
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        document.getElementById('timerDisplay').textContent =
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// ==================== 視覺效果 ====================

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 20, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isPlaying) {
        drawNoiseVisualization();
    }

    requestAnimationFrame(draw);
}

function drawNoiseVisualization() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() / 1000;

    // 噪音顏色
    const colors = {
        white: 'rgba(255, 255, 255,',
        pink: 'rgba(255, 150, 200,',
        brown: 'rgba(180, 120, 80,',
        blue: 'rgba(100, 150, 255,',
        violet: 'rgba(180, 100, 255,'
    };

    const baseColor = colors[config.noiseType];

    // 繪製隨機點
    for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 200 + 100;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        const size = Math.random() * 3 + 1;
        const alpha = Math.random() * 0.3;

        ctx.fillStyle = baseColor + alpha + ')';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 中心脈動
    const pulseSize = 100 + Math.sin(time * 2) * 20;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
    gradient.addColorStop(0, baseColor + '0.1)');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.fill();
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('playBtn').addEventListener('click', toggleNoise);

document.getElementById('noiseType').addEventListener('change', (e) => {
    config.noiseType = e.target.value;

    document.getElementById('noiseDescription').textContent = noiseDescriptions[config.noiseType];
    document.getElementById('noiseName').textContent = noiseNames[config.noiseType];
    document.getElementById('typeDisplay').textContent = noiseNames[config.noiseType];

    const icon = document.getElementById('noiseIcon');
    icon.className = 'noise-icon ' + config.noiseType;
    if (isPlaying) icon.classList.add('playing');

    if (isPlaying) {
        startNoise();
    }
});

document.getElementById('volume').addEventListener('input', (e) => {
    config.volume = parseInt(e.target.value) / 100;
    document.getElementById('volumeValue').textContent = e.target.value;
    if (gainNode) {
        gainNode.gain.setValueAtTime(config.volume, audioContext.currentTime);
    }
});

document.getElementById('lowpass').addEventListener('input', (e) => {
    config.lowpass = parseInt(e.target.value);
    document.getElementById('lowpassValue').textContent = config.lowpass;
    if (lowpassFilter) {
        lowpassFilter.frequency.setValueAtTime(config.lowpass, audioContext.currentTime);
    }
});

document.getElementById('highpass').addEventListener('input', (e) => {
    config.highpass = parseInt(e.target.value);
    document.getElementById('highpassValue').textContent = config.highpass;
    if (highpassFilter) {
        highpassFilter.frequency.setValueAtTime(config.highpass, audioContext.currentTime);
    }
});

document.getElementById('timer').addEventListener('change', (e) => {
    config.timer = parseInt(e.target.value);

    if (isPlaying && config.timer > 0) {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        startTimer();
    } else if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        document.getElementById('timerDisplay').textContent = '';
    }
});

// 鍵盤控制
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        toggleNoise();
    }
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
