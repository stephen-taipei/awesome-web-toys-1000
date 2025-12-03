/**
 * Tibetan Bells 西藏鐘
 * Web Toys #082
 *
 * 藏傳佛教鐘聲模擬器
 *
 * 技術重點：
 * - 金屬鐘聲合成
 * - 拍頻效果
 * - 長延音與殘響
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('bellCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    bellType: 'tingsha',
    pitch: 50,
    decay: 50,
    interval: 0,
    volume: 0.5
};

// 音訊相關
let audioContext = null;
let masterGain = null;
let convolver = null;

// 自動敲擊
let autoInterval = null;

// 視覺效果
let vibration = 0;
let rings = [];

// 鐘的配置
const bellConfigs = {
    tingsha: {
        name: '丁夏',
        baseFreq: 2000,
        harmonics: [1, 1.5, 2.1, 3.2, 4.5],
        beatFreq: 2,
        brightness: 0.9
    },
    ghanta: {
        name: '金剛鈴',
        baseFreq: 1200,
        harmonics: [1, 2.3, 3.8, 5.2, 7.1],
        beatFreq: 3,
        brightness: 0.7
    },
    temple: {
        name: '寺院鐘',
        baseFreq: 400,
        harmonics: [1, 2, 3.5, 4.7, 6.2],
        beatFreq: 1,
        brightness: 0.5
    }
};

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.gain.value = config.volume;

        // 創建殘響
        createReverb();

        masterGain.connect(convolver);
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function createReverb() {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * 3;
    const impulse = audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            const decay = Math.exp(-i / (sampleRate * 1));
            data[i] = (Math.random() * 2 - 1) * decay;
        }
    }

    convolver = audioContext.createConvolver();
    convolver.buffer = impulse;

    const wetGain = audioContext.createGain();
    wetGain.gain.value = 0.3;
    convolver.connect(wetGain);
    wetGain.connect(audioContext.destination);

    // 乾訊號
    const dryGain = audioContext.createGain();
    dryGain.gain.value = 0.7;
    masterGain.connect(dryGain);
    dryGain.connect(audioContext.destination);
}

// ==================== 音訊控制 ====================

function playBell() {
    initAudio();

    const bellConfig = bellConfigs[config.bellType];

    // 計算實際頻率
    const pitchMultiplier = Math.pow(2, (config.pitch - 50) / 50);
    const baseFreq = bellConfig.baseFreq * pitchMultiplier;

    // 延音時間
    const decayTime = 2 + (config.decay / 100) * 8;

    // 創建兩個稍微不同頻率的鐘聲（模擬丁夏的一對鐘）
    const frequencies = [baseFreq, baseFreq + bellConfig.beatFreq];

    frequencies.forEach((freq, bellIndex) => {
        bellConfig.harmonics.forEach((harmonic, i) => {
            const osc = audioContext.createOscillator();
            const oscGain = audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq * harmonic;

            // 泛音衰減
            const harmonicLevel = Math.pow(0.5, i) * bellConfig.brightness;
            const harmonicDecay = decayTime * (1 - i * 0.1);

            const now = audioContext.currentTime;
            oscGain.gain.setValueAtTime(0, now);
            oscGain.gain.linearRampToValueAtTime(0.1 * harmonicLevel, now + 0.005);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + harmonicDecay);

            // 立體聲位置
            const panner = audioContext.createStereoPanner();
            panner.pan.value = bellIndex === 0 ? -0.3 : 0.3;

            osc.connect(oscGain);
            oscGain.connect(panner);
            panner.connect(masterGain);

            osc.start(now);
            osc.stop(now + harmonicDecay);
        });
    });

    // 敲擊聲
    playStrikeSound(baseFreq);

    // 更新顯示
    document.getElementById('freqDisplay').textContent = Math.round(baseFreq);

    // 視覺效果
    vibration = 1;
    addRing();
}

function playStrikeSound(baseFreq) {
    const noiseLength = 0.03;
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * noiseLength, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.1));
    }

    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.2;

    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = baseFreq;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    noiseSource.start();
}

function startAutoPlay() {
    if (autoInterval) {
        clearInterval(autoInterval);
    }

    if (config.interval > 0) {
        playBell();
        autoInterval = setInterval(playBell, config.interval * 1000);
    }
}

function stopAutoPlay() {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
    }
}

// ==================== 視覺效果 ====================

function addRing() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    rings.push({
        x: centerX,
        y: centerY,
        radius: 50,
        alpha: 1
    });
}

function draw() {
    const time = Date.now() / 1000;

    // 背景
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, '#14101e');
    gradient.addColorStop(1, '#0a0810');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製鐘
    drawBells(time);

    // 繪製波紋
    drawRings();

    // 衰減振動
    vibration *= 0.97;

    requestAnimationFrame(draw);
}

function drawBells(time) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const bellConfig = bellConfigs[config.bellType];
    const vibeOffset = Math.sin(time * 30) * vibration * 5;

    if (config.bellType === 'tingsha') {
        // 丁夏 - 兩個小鐘
        drawTingsha(centerX - 80 + vibeOffset, centerY, time, -1);
        drawTingsha(centerX + 80 - vibeOffset, centerY, time, 1);

        // 連接繩
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 80, centerY - 60);
        ctx.quadraticCurveTo(centerX, centerY - 120, centerX + 80, centerY - 60);
        ctx.stroke();
    } else if (config.bellType === 'ghanta') {
        // 金剛鈴
        drawGhanta(centerX, centerY, time);
    } else {
        // 寺院鐘
        drawTempleBell(centerX, centerY, time);
    }

    // 發光效果
    if (vibration > 0.1) {
        const glowGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 200
        );
        glowGradient.addColorStop(0, `rgba(220, 180, 100, ${vibration * 0.3})`);
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawTingsha(x, y, time, direction) {
    const size = 60;
    const vibeY = Math.sin(time * 25 + direction) * vibration * 3;

    // 鐘身
    const gradient = ctx.createRadialGradient(x, y + vibeY, 0, x, y + vibeY, size);
    gradient.addColorStop(0, '#f0d080');
    gradient.addColorStop(0.5, '#c8a050');
    gradient.addColorStop(1, '#8a6030');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y + vibeY, size, 0, Math.PI * 2);
    ctx.fill();

    // 鐘邊
    ctx.strokeStyle = '#dcb464';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y + vibeY, size, 0, Math.PI * 2);
    ctx.stroke();

    // 中心圓
    ctx.fillStyle = '#8a6030';
    ctx.beginPath();
    ctx.arc(x, y + vibeY, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 裝飾紋路
    ctx.strokeStyle = 'rgba(255, 220, 150, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x, y + vibeY, size * 0.6, angle, angle + 0.2);
        ctx.stroke();
    }

    // 繩孔
    ctx.fillStyle = '#4a3020';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.7 + vibeY, 8, 0, Math.PI * 2);
    ctx.fill();
}

function drawGhanta(x, y, time) {
    const vibeOffset = Math.sin(time * 20) * vibration * 4;

    // 鈴身
    ctx.fillStyle = '#c8a050';
    ctx.beginPath();
    ctx.moveTo(x - 50, y - 40 + vibeOffset);
    ctx.quadraticCurveTo(x - 60, y + 40, x - 40, y + 80);
    ctx.lineTo(x + 40, y + 80);
    ctx.quadraticCurveTo(x + 60, y + 40, x + 50, y - 40 + vibeOffset);
    ctx.closePath();
    ctx.fill();

    // 鈴口
    ctx.strokeStyle = '#dcb464';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(x, y + 80, 40, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 手柄
    ctx.fillStyle = '#8a6030';
    ctx.beginPath();
    ctx.moveTo(x - 15, y - 40 + vibeOffset);
    ctx.lineTo(x - 10, y - 100 + vibeOffset);
    ctx.lineTo(x + 10, y - 100 + vibeOffset);
    ctx.lineTo(x + 15, y - 40 + vibeOffset);
    ctx.closePath();
    ctx.fill();

    // 金剛杵頂部
    ctx.fillStyle = '#dcb464';
    ctx.beginPath();
    ctx.arc(x, y - 100 + vibeOffset, 15, 0, Math.PI * 2);
    ctx.fill();
}

function drawTempleBell(x, y, time) {
    const vibeOffset = Math.sin(time * 15) * vibration * 6;
    const size = 120;

    // 鐘身
    const gradient = ctx.createLinearGradient(x - size, y, x + size, y);
    gradient.addColorStop(0, '#6a5030');
    gradient.addColorStop(0.3, '#c8a050');
    gradient.addColorStop(0.5, '#dcb464');
    gradient.addColorStop(0.7, '#c8a050');
    gradient.addColorStop(1, '#6a5030');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.3, y - size + vibeOffset);
    ctx.quadraticCurveTo(x - size, y, x - size * 0.8, y + size * 0.8);
    ctx.lineTo(x + size * 0.8, y + size * 0.8);
    ctx.quadraticCurveTo(x + size, y, x + size * 0.3, y - size + vibeOffset);
    ctx.closePath();
    ctx.fill();

    // 鐘口
    ctx.strokeStyle = '#dcb464';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.8, size * 0.8, size * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 頂部裝飾
    ctx.fillStyle = '#8a6030';
    ctx.beginPath();
    ctx.arc(x, y - size + vibeOffset, 25, 0, Math.PI * 2);
    ctx.fill();

    // 吊環
    ctx.strokeStyle = '#6a5030';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(x, y - size - 30 + vibeOffset, 20, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
}

function drawRings() {
    rings.forEach((ring, index) => {
        ctx.strokeStyle = `rgba(220, 180, 100, ${ring.alpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();

        ring.radius += 2;
        ring.alpha -= 0.01;

        if (ring.alpha <= 0) {
            rings.splice(index, 1);
        }
    });
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('click', () => {
    playBell();
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        playBell();
    }
});

document.getElementById('bellType').addEventListener('change', (e) => {
    config.bellType = e.target.value;
    document.getElementById('typeDisplay').textContent = bellConfigs[config.bellType].name;

    if (autoInterval) {
        startAutoPlay();
    }
});

document.getElementById('pitch').addEventListener('input', (e) => {
    config.pitch = parseInt(e.target.value);
    let pitchName = '';
    if (config.pitch < 30) pitchName = '低音';
    else if (config.pitch < 70) pitchName = '中音';
    else pitchName = '高音';
    document.getElementById('pitchValue').textContent = pitchName;
});

document.getElementById('decay').addEventListener('input', (e) => {
    config.decay = parseInt(e.target.value);
    let decayName = '';
    if (config.decay < 30) decayName = '短';
    else if (config.decay < 70) decayName = '中等';
    else decayName = '長';
    document.getElementById('decayValue').textContent = decayName;
});

document.getElementById('interval').addEventListener('change', (e) => {
    config.interval = parseInt(e.target.value);

    if (config.interval > 0) {
        startAutoPlay();
    } else {
        stopAutoPlay();
    }
});

document.getElementById('volume').addEventListener('input', (e) => {
    config.volume = parseInt(e.target.value) / 100;
    document.getElementById('volumeValue').textContent = e.target.value;

    if (masterGain) {
        masterGain.gain.setValueAtTime(config.volume, audioContext.currentTime);
    }
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
