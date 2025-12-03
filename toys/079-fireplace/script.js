/**
 * Fireplace 壁爐聲
 * Web Toys #079
 *
 * 溫暖的壁爐聲模擬器
 *
 * 技術重點：
 * - 火焰粒子系統
 * - 劈啪聲合成
 * - 動態光影效果
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('fireCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    intensity: 60,
    crackle: 50,
    embers: true,
    woodPop: false,
    volume: 0.5,
    timer: 0
};

// 音訊相關
let audioContext = null;
let masterGain = null;
let fireNode = null;
let isPlaying = false;

// 劈啪定時器
let crackleTimeout = null;
let popTimeout = null;

// 定時器
let timerEndTime = 0;
let timerInterval = null;

// 火焰粒子
let flames = [];
let embers = [];
let sparks = [];

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 音訊控制 ====================

function startFire() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    masterGain = audioContext.createGain();
    masterGain.gain.value = config.volume;
    masterGain.connect(audioContext.destination);

    createFireSound();
    scheduleCrackle();

    if (config.woodPop) {
        scheduleWoodPop();
    }

    isPlaying = true;

    if (config.timer > 0) {
        startTimer();
    }

    document.getElementById('playBtn').textContent = '熄滅壁爐';
    document.getElementById('playBtn').classList.add('playing');
    document.getElementById('statusDisplay').textContent = '燃燒中';
    updateFireDisplay();
}

function createFireSound() {
    // 基礎火焰聲 - 低頻隆隆聲 + 高頻嘶嘶聲
    const bufferSize = audioContext.sampleRate * 3;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        let lastValue = 0;
        let b0 = 0, b1 = 0, b2 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;

            // 棕噪音（低頻隆隆）
            lastValue = (lastValue + white * 0.02) / 1.02;
            const brown = lastValue * 2;

            // 粉紅噪音（中頻）
            b0 = 0.99765 * b0 + white * 0.0990460;
            b1 = 0.96300 * b1 + white * 0.2965164;
            b2 = 0.57000 * b2 + white * 1.0526913;
            const pink = (b0 + b1 + b2 + white * 0.1848) * 0.06;

            // 混合
            data[i] = brown * 0.3 + pink * 0.2 + white * 0.05;

            // 隨機劈啪
            if (Math.random() < 0.0002 * config.crackle / 50) {
                data[i] += (Math.random() * 2 - 1) * 0.5;
            }
        }
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // 濾波器
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 800 + config.intensity * 10;

    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 50;

    // 火焰強度增益
    const fireGain = audioContext.createGain();
    fireGain.gain.value = 0.3 * (config.intensity / 60);

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(fireGain);
    fireGain.connect(masterGain);

    source.start();

    fireNode = { source, lowpass, gain: fireGain };
}

function scheduleCrackle() {
    if (!isPlaying) return;

    const delay = (3000 - config.crackle * 25) + Math.random() * 2000;

    crackleTimeout = setTimeout(() => {
        playCrackle();
        scheduleCrackle();
    }, delay);
}

function playCrackle() {
    if (!audioContext || !isPlaying) return;

    const duration = 0.05 + Math.random() * 0.1;

    // 快速噪音爆發
    const bufferSize = Math.floor(audioContext.sampleRate * duration);
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        const envelope = Math.exp(-i / bufferSize * 5);
        data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const crackleGain = audioContext.createGain();
    crackleGain.gain.value = 0.3 + Math.random() * 0.2;

    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 1000 + Math.random() * 2000;

    const panner = audioContext.createStereoPanner();
    panner.pan.value = (Math.random() * 2 - 1) * 0.5;

    source.connect(highpass);
    highpass.connect(crackleGain);
    crackleGain.connect(panner);
    panner.connect(masterGain);

    source.start();

    // 添加火星效果
    if (config.embers) {
        addSparks(3 + Math.floor(Math.random() * 5));
    }
}

function scheduleWoodPop() {
    if (!isPlaying || !config.woodPop) return;

    const delay = 10000 + Math.random() * 20000;

    popTimeout = setTimeout(() => {
        playWoodPop();
        scheduleWoodPop();
    }, delay);
}

function playWoodPop() {
    if (!audioContext || !isPlaying) return;

    // 木頭爆裂聲 - 低頻衝擊 + 高頻爆裂
    const duration = 0.3;

    // 低頻衝擊
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + duration);

    const oscGain = audioContext.createGain();
    oscGain.gain.setValueAtTime(0.5, audioContext.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    osc.start();
    osc.stop(audioContext.currentTime + duration);

    // 高頻爆裂噪音
    const bufferSize = Math.floor(audioContext.sampleRate * 0.1);
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        const envelope = Math.exp(-i / bufferSize * 10);
        data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const popGain = audioContext.createGain();
    popGain.gain.value = 0.4;

    source.connect(popGain);
    popGain.connect(masterGain);

    source.start();

    // 大量火星
    if (config.embers) {
        addSparks(10 + Math.floor(Math.random() * 10));
    }
}

function addSparks(count) {
    const centerX = canvas.width / 2;
    const baseY = canvas.height * 0.7;

    for (let i = 0; i < count; i++) {
        sparks.push({
            x: centerX + (Math.random() - 0.5) * 100,
            y: baseY,
            vx: (Math.random() - 0.5) * 5,
            vy: -3 - Math.random() * 5,
            life: 1,
            size: 2 + Math.random() * 3
        });
    }
}

function stopFire() {
    if (fireNode) {
        if (fireNode.source) fireNode.source.stop();
        fireNode = null;
    }

    if (crackleTimeout) {
        clearTimeout(crackleTimeout);
        crackleTimeout = null;
    }

    if (popTimeout) {
        clearTimeout(popTimeout);
        popTimeout = null;
    }

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        document.getElementById('timerDisplay').textContent = '';
    }

    isPlaying = false;

    document.getElementById('playBtn').textContent = '點燃壁爐';
    document.getElementById('playBtn').classList.remove('playing');
    document.getElementById('statusDisplay').textContent = '熄滅';
    document.getElementById('fireDisplay').textContent = '--';
}

function toggleFire() {
    if (isPlaying) {
        stopFire();
    } else {
        startFire();
    }
}

function updateFireDisplay() {
    let intensity = '';
    if (config.intensity < 40) {
        intensity = '微火';
    } else if (config.intensity < 70) {
        intensity = '中火';
    } else {
        intensity = '旺火';
    }
    document.getElementById('fireDisplay').textContent = intensity;
}

function getIntensityName(value) {
    if (value < 40) return '微弱';
    if (value < 70) return '中等';
    return '旺盛';
}

function getCrackleName(value) {
    if (value < 30) return '少量';
    if (value < 70) return '適中';
    return '頻繁';
}

// ==================== 定時器 ====================

function startTimer() {
    timerEndTime = Date.now() + config.timer * 60 * 1000;

    timerInterval = setInterval(() => {
        const remaining = timerEndTime - Date.now();

        if (remaining <= 0) {
            stopFire();
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
    const time = Date.now() / 1000;

    // 清除畫布
    ctx.fillStyle = '#1a0a05';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isPlaying) {
        drawFireplace();
        updateFlames(time);
        drawFlames();
        updateEmbers();
        drawEmbers();
        updateSparks();
        drawSparks();
        drawGlow(time);
    } else {
        drawColdFireplace();
    }

    requestAnimationFrame(draw);
}

function drawFireplace() {
    const centerX = canvas.width / 2;
    const baseY = canvas.height * 0.85;

    // 壁爐底座
    ctx.fillStyle = '#2a1810';
    ctx.fillRect(centerX - 200, baseY - 30, 400, 60);

    // 木頭
    ctx.fillStyle = '#3a2015';
    ctx.beginPath();
    ctx.ellipse(centerX - 50, baseY - 20, 80, 20, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(centerX + 50, baseY - 15, 70, 18, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 燃燒中的木頭邊緣
    ctx.strokeStyle = '#ff6020';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX - 50, baseY - 20, 80, 20, -0.2, 0, Math.PI);
    ctx.stroke();
}

function drawColdFireplace() {
    const centerX = canvas.width / 2;
    const baseY = canvas.height * 0.85;

    // 壁爐底座
    ctx.fillStyle = '#1a1010';
    ctx.fillRect(centerX - 200, baseY - 30, 400, 60);

    // 灰燼
    ctx.fillStyle = '#2a2020';
    ctx.beginPath();
    ctx.ellipse(centerX, baseY - 10, 120, 15, 0, 0, Math.PI * 2);
    ctx.fill();
}

function updateFlames(time) {
    // 添加新火焰粒子
    const flameCount = Math.floor(config.intensity / 5);

    for (let i = 0; i < flameCount; i++) {
        if (flames.length < 200) {
            const centerX = canvas.width / 2;
            const baseY = canvas.height * 0.75;

            flames.push({
                x: centerX + (Math.random() - 0.5) * 100,
                y: baseY,
                vx: (Math.random() - 0.5) * 2,
                vy: -2 - Math.random() * 3,
                life: 1,
                size: 10 + Math.random() * 20,
                hue: 20 + Math.random() * 30
            });
        }
    }

    // 更新火焰
    flames.forEach((flame, index) => {
        flame.x += flame.vx + Math.sin(time * 10 + flame.y * 0.1) * 0.5;
        flame.y += flame.vy;
        flame.life -= 0.02;
        flame.size *= 0.98;

        if (flame.life <= 0 || flame.size < 1) {
            flames.splice(index, 1);
        }
    });
}

function drawFlames() {
    flames.forEach(flame => {
        const gradient = ctx.createRadialGradient(
            flame.x, flame.y, 0,
            flame.x, flame.y, flame.size
        );

        gradient.addColorStop(0, `hsla(${flame.hue}, 100%, 70%, ${flame.life * 0.8})`);
        gradient.addColorStop(0.4, `hsla(${flame.hue - 10}, 100%, 50%, ${flame.life * 0.5})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(flame.x, flame.y, flame.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateEmbers() {
    if (!config.embers) return;

    // 添加新餘燼
    if (Math.random() < 0.05 * (config.intensity / 50)) {
        const centerX = canvas.width / 2;
        const baseY = canvas.height * 0.8;

        embers.push({
            x: centerX + (Math.random() - 0.5) * 150,
            y: baseY + Math.random() * 20,
            life: 1,
            flicker: Math.random() * Math.PI * 2
        });
    }

    // 更新餘燼
    embers.forEach((ember, index) => {
        ember.life -= 0.005;
        ember.flicker += 0.2;

        if (ember.life <= 0) {
            embers.splice(index, 1);
        }
    });

    // 限制餘燼數量
    while (embers.length > 50) {
        embers.shift();
    }
}

function drawEmbers() {
    embers.forEach(ember => {
        const brightness = 0.5 + Math.sin(ember.flicker) * 0.3;
        const size = 3 + ember.life * 2;

        ctx.fillStyle = `rgba(255, ${100 + brightness * 100}, 0, ${ember.life * brightness})`;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateSparks() {
    sparks.forEach((spark, index) => {
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy += 0.1; // 重力
        spark.life -= 0.02;

        if (spark.life <= 0 || spark.y > canvas.height) {
            sparks.splice(index, 1);
        }
    });
}

function drawSparks() {
    sparks.forEach(spark => {
        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 50, ${spark.life})`;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size * spark.life, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawGlow(time) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.7;
    const flicker = 0.8 + Math.sin(time * 8) * 0.1 + Math.sin(time * 13) * 0.05;
    const glowSize = 300 * (config.intensity / 60) * flicker;

    const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, glowSize
    );

    gradient.addColorStop(0, `rgba(255, 150, 50, ${0.15 * flicker})`);
    gradient.addColorStop(0.5, `rgba(255, 100, 30, ${0.08 * flicker})`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 頂部暗角
    const topGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.4);
    topGradient.addColorStop(0, 'rgba(10, 5, 0, 0.8)');
    topGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('playBtn').addEventListener('click', toggleFire);

document.getElementById('intensity').addEventListener('input', (e) => {
    config.intensity = parseInt(e.target.value);
    document.getElementById('intensityValue').textContent = getIntensityName(config.intensity);

    if (isPlaying) {
        updateFireDisplay();
        if (fireNode && fireNode.lowpass) {
            fireNode.lowpass.frequency.value = 800 + config.intensity * 10;
        }
        if (fireNode && fireNode.gain) {
            fireNode.gain.gain.value = 0.3 * (config.intensity / 60);
        }
    }
});

document.getElementById('crackle').addEventListener('input', (e) => {
    config.crackle = parseInt(e.target.value);
    document.getElementById('crackleValue').textContent = getCrackleName(config.crackle);
});

document.getElementById('embers').addEventListener('change', (e) => {
    config.embers = e.target.checked;
});

document.getElementById('woodPop').addEventListener('change', (e) => {
    config.woodPop = e.target.checked;

    if (isPlaying && config.woodPop) {
        scheduleWoodPop();
    } else if (popTimeout) {
        clearTimeout(popTimeout);
        popTimeout = null;
    }
});

document.getElementById('volume').addEventListener('input', (e) => {
    config.volume = parseInt(e.target.value) / 100;
    document.getElementById('volumeValue').textContent = e.target.value;

    if (masterGain) {
        masterGain.gain.setValueAtTime(config.volume, audioContext.currentTime);
    }
});

document.getElementById('timer').addEventListener('change', (e) => {
    config.timer = parseInt(e.target.value);

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    if (isPlaying && config.timer > 0) {
        startTimer();
    } else {
        document.getElementById('timerDisplay').textContent = '';
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        toggleFire();
    }
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
