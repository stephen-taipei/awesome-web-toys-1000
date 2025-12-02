/**
 * Audio Flow 音訊流場
 * Web Toys #030
 *
 * 麥克風輸入控制流場強度，音量影響粒子速度和密度
 *
 * 技術重點：
 * - Web Audio API 麥克風輸入
 * - 頻譜分析
 * - 音訊驅動視覺化
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('flowCanvas');
const ctx = canvas.getContext('2d');

// ==================== 音訊設定 ====================

let audioContext = null;
let analyser = null;
let microphone = null;
let isAudioActive = false;

const FFT_SIZE = 256;
let frequencyData = new Uint8Array(FFT_SIZE / 2);
let volumeLevel = 0;
let bassLevel = 0;
let midLevel = 0;
let highLevel = 0;

// ==================== 簡化 Noise ====================

class SimpleNoise {
    constructor(seed = Math.random() * 10000) {
        this.seed = seed;
    }

    noise2D(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1;
    }

    smoothNoise(x, y) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const fx = x - ix;
        const fy = y - iy;

        const u = fx * fx * (3 - 2 * fx);
        const v = fy * fy * (3 - 2 * fy);

        const v00 = this.noise2D(ix, iy);
        const v10 = this.noise2D(ix + 1, iy);
        const v01 = this.noise2D(ix, iy + 1);
        const v11 = this.noise2D(ix + 1, iy + 1);

        return v00 * (1 - u) * (1 - v) + v10 * u * (1 - v) +
               v01 * (1 - u) * v + v11 * u * v;
    }
}

// ==================== 配置參數 ====================

let config = {
    particleCount: 5000,
    sensitivity: 2,
    baseSpeed: 1,
    colorMode: 'frequency'
};

let noise = new SimpleNoise();
let particles = [];
let time = 0;

// ==================== 音訊初始化 ====================

async function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        analyser.smoothingTimeConstant = 0.8;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        frequencyData = new Uint8Array(analyser.frequencyBinCount);

        isAudioActive = true;
        document.getElementById('micBtn').classList.add('active');
        document.querySelector('.mic-text').textContent = '麥克風已啟動';

        // 建立頻譜條
        createSpectrumBars();

    } catch (error) {
        console.error('麥克風存取失敗:', error);
        alert('無法存取麥克風，請確認已授權麥克風權限');
    }
}

function toggleAudio() {
    if (isAudioActive) {
        if (microphone) {
            microphone.disconnect();
        }
        isAudioActive = false;
        document.getElementById('micBtn').classList.remove('active');
        document.querySelector('.mic-text').textContent = '啟動麥克風';
        volumeLevel = 0;
    } else {
        initAudio();
    }
}

/**
 * 分析音訊數據
 */
function analyzeAudio() {
    if (!isAudioActive || !analyser) return;

    analyser.getByteFrequencyData(frequencyData);

    // 計算總音量
    let sum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
        sum += frequencyData[i];
    }
    volumeLevel = (sum / frequencyData.length / 255) * config.sensitivity;

    // 計算頻段
    const bassEnd = Math.floor(frequencyData.length * 0.1);
    const midEnd = Math.floor(frequencyData.length * 0.5);

    let bassSum = 0, midSum = 0, highSum = 0;

    for (let i = 0; i < bassEnd; i++) {
        bassSum += frequencyData[i];
    }
    for (let i = bassEnd; i < midEnd; i++) {
        midSum += frequencyData[i];
    }
    for (let i = midEnd; i < frequencyData.length; i++) {
        highSum += frequencyData[i];
    }

    bassLevel = (bassSum / bassEnd / 255) * config.sensitivity;
    midLevel = (midSum / (midEnd - bassEnd) / 255) * config.sensitivity;
    highLevel = (highSum / (frequencyData.length - midEnd) / 255) * config.sensitivity;

    // 更新 UI
    document.getElementById('volumeBar').style.height = `${Math.min(volumeLevel * 100, 100)}%`;
    document.getElementById('volumeDisplay').textContent = Math.round(volumeLevel * 100);

    // 更新頻譜
    updateSpectrum();
}

/**
 * 建立頻譜條
 */
function createSpectrumBars() {
    const spectrum = document.getElementById('spectrum');
    spectrum.innerHTML = '';

    const barCount = 32;
    for (let i = 0; i < barCount; i++) {
        const bar = document.createElement('div');
        bar.className = 'spectrum-bar';
        bar.style.height = '2px';
        spectrum.appendChild(bar);
    }
}

/**
 * 更新頻譜顯示
 */
function updateSpectrum() {
    const bars = document.querySelectorAll('.spectrum-bar');
    const step = Math.floor(frequencyData.length / bars.length);

    bars.forEach((bar, i) => {
        const value = frequencyData[i * step] || 0;
        const height = (value / 255) * 60;
        bar.style.height = `${Math.max(2, height)}px`;

        // 顏色根據頻率
        const hue = 160 - (i / bars.length) * 60;
        bar.style.background = `linear-gradient(to top, hsl(${hue}, 80%, 50%), hsl(${hue + 30}, 80%, 60%))`;
    });
}

// ==================== 流場計算 ====================

function getFlowVector(x, y) {
    const scale = 0.003;
    const audioInfluence = volumeLevel * 2;

    // 基礎噪聲流場
    const n1 = noise.smoothNoise(x * scale + time * 0.01, y * scale);
    const n2 = noise.smoothNoise(x * scale + 100, y * scale + time * 0.01);

    // 音訊增強的角度
    const baseAngle = n1 * Math.PI * 2;
    const audioAngle = baseAngle + bassLevel * Math.sin(time * 0.1) * 2;

    // 速度受音量和高頻影響
    const speed = (config.baseSpeed + audioInfluence * 2 + highLevel) * (0.5 + n2 * 0.5);

    return {
        x: Math.cos(audioAngle) * speed,
        y: Math.sin(audioAngle) * speed
    };
}

// ==================== 顏色方案 ====================

const colorModes = {
    frequency: (particle) => {
        const hue = 160 - bassLevel * 60 + midLevel * 30;
        const saturation = 70 + highLevel * 30;
        const lightness = 50 + volumeLevel * 20;
        return `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.3 + volumeLevel * 0.4})`;
    },
    volume: (particle) => {
        const hue = 160 + volumeLevel * 100;
        return `hsla(${hue}, 80%, ${50 + volumeLevel * 20}%, ${0.3 + volumeLevel * 0.4})`;
    },
    rainbow: (particle) => {
        const hue = (particle.x / canvas.width * 180 + time * 2 + volumeLevel * 100) % 360;
        return `hsla(${hue}, 80%, 55%, ${0.3 + volumeLevel * 0.4})`;
    },
    fire: (particle) => {
        const hue = 30 - volumeLevel * 30;
        const lightness = 40 + volumeLevel * 30;
        return `hsla(${Math.max(0, hue)}, 90%, ${lightness}%, ${0.3 + volumeLevel * 0.5})`;
    }
};

// ==================== 粒子系統 ====================

class AudioParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.prevX = this.x;
        this.prevY = this.y;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.maxAge = 80 + Math.random() * 120;
    }

    update() {
        this.prevX = this.x;
        this.prevY = this.y;

        const flow = getFlowVector(this.x, this.y);

        this.vx = this.vx * 0.9 + flow.x * 0.15;
        this.vy = this.vy * 0.9 + flow.y * 0.15;

        this.x += this.vx;
        this.y += this.vy;
        this.age++;

        if (this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height ||
            this.age > this.maxAge) {
            this.reset();
        }
    }

    draw(ctx) {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed < 0.1) return;

        const colorFn = colorModes[config.colorMode];
        ctx.strokeStyle = colorFn(this);
        ctx.lineWidth = 1 + volumeLevel;

        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }
}

// ==================== 初始化 ====================

function initParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new AudioParticle());
    }
    document.getElementById('particleDisplay').textContent = config.particleCount;
}

function clearCanvas() {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    clearCanvas();
}

// ==================== 動畫迴圈 ====================

function animate() {
    time++;

    // 分析音訊
    analyzeAudio();

    // 淡化背景（音量越大淡化越慢，軌跡越長）
    const fadeAlpha = 0.02 + (1 - volumeLevel) * 0.03;
    ctx.fillStyle = `rgba(5, 5, 16, ${fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新和繪製粒子
    particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
    });

    requestAnimationFrame(animate);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('micBtn').addEventListener('click', toggleAudio);

document.getElementById('particleCount').addEventListener('input', (e) => {
    config.particleCount = parseInt(e.target.value);
    document.getElementById('particleCountValue').textContent = config.particleCount;
    initParticles();
});

document.getElementById('sensitivity').addEventListener('input', (e) => {
    config.sensitivity = parseFloat(e.target.value);
    document.getElementById('sensitivityValue').textContent = config.sensitivity;
});

document.getElementById('baseSpeed').addEventListener('input', (e) => {
    config.baseSpeed = parseFloat(e.target.value);
    document.getElementById('baseSpeedValue').textContent = config.baseSpeed;
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('clearBtn').addEventListener('click', clearCanvas);

// ==================== 啟動 ====================

resizeCanvas();
initParticles();
createSpectrumBars();
requestAnimationFrame(animate);
