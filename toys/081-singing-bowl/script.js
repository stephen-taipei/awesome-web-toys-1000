/**
 * Singing Bowl 頌缽
 * Web Toys #081
 *
 * 頌缽音療模擬器
 *
 * 技術重點：
 * - 泛音合成
 * - 長延音效果
 * - 繞缽技術模擬
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('bowlCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    bowlSize: 'medium',
    material: 'bronze',
    technique: 'strike',
    decay: 50,
    volume: 0.5
};

// 音訊相關
let audioContext = null;
let masterGain = null;
let activeNodes = [];
let isRimming = false;
let rimOscillators = [];

// 視覺效果
let vibration = 0;
let ripples = [];
let lastRimAngle = 0;

// 缽的配置
const bowlConfigs = {
    small: { baseFreq: 523.25, size: 120, name: '小型' },
    medium: { baseFreq: 349.23, size: 180, name: '中型' },
    large: { baseFreq: 220, size: 240, name: '大型' },
    xlarge: { baseFreq: 130.81, size: 300, name: '特大' }
};

const materialConfigs = {
    bronze: { harmonics: [1, 2.71, 5.04, 8.47], brightness: 0.7, color: '#b08050' },
    brass: { harmonics: [1, 2.5, 4.5, 7.5], brightness: 0.8, color: '#c8a060' },
    crystal: { harmonics: [1, 2, 3, 4, 5], brightness: 1.0, color: '#d0e0f0' }
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
        masterGain.connect(audioContext.destination);
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// ==================== 音訊控制 ====================

function playBowl() {
    initAudio();

    const bowlConfig = bowlConfigs[config.bowlSize];
    const materialConfig = materialConfigs[config.material];
    const baseFreq = bowlConfig.baseFreq;

    // 停止之前的聲音
    stopActiveNodes();

    // 延音時間
    const decayTime = 3 + (config.decay / 100) * 12;

    // 創建泛音
    materialConfig.harmonics.forEach((harmonic, i) => {
        const osc = audioContext.createOscillator();
        const oscGain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = baseFreq * harmonic;

        // 泛音衰減
        const harmonicLevel = Math.pow(0.5, i) * materialConfig.brightness;

        // ADSR 包絡
        const now = audioContext.currentTime;
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.2 * harmonicLevel, now + 0.01);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + decayTime);

        activeNodes.push({ osc, gain: oscGain });
    });

    // 敲擊聲
    playStrikeNoise();

    // 更新顯示
    document.getElementById('freqDisplay').textContent = Math.round(baseFreq);

    // 視覺效果
    vibration = 1;
    addRipple(canvas.width / 2, canvas.height / 2);
}

function playStrikeNoise() {
    const noiseLength = 0.05;
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * noiseLength, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.2));
    }

    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.15;

    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = bowlConfigs[config.bowlSize].baseFreq * 2;
    noiseFilter.Q.value = 2;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    noiseSource.start();
}

function startRimming() {
    initAudio();

    if (isRimming) return;
    isRimming = true;

    const bowlConfig = bowlConfigs[config.bowlSize];
    const materialConfig = materialConfigs[config.material];
    const baseFreq = bowlConfig.baseFreq;

    // 創建持續的泛音
    materialConfig.harmonics.forEach((harmonic, i) => {
        const osc = audioContext.createOscillator();
        const oscGain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = baseFreq * harmonic;

        const harmonicLevel = Math.pow(0.5, i) * materialConfig.brightness * 0.5;
        oscGain.gain.setValueAtTime(0, audioContext.currentTime);
        oscGain.gain.linearRampToValueAtTime(0.1 * harmonicLevel, audioContext.currentTime + 0.5);

        // 添加輕微顫音
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        lfo.frequency.value = 3 + Math.random() * 2;
        lfoGain.gain.value = baseFreq * harmonic * 0.002;

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();

        rimOscillators.push({ osc, gain: oscGain, lfo });
    });

    document.getElementById('freqDisplay').textContent = Math.round(baseFreq);
}

function updateRimming(angle) {
    if (!isRimming) return;

    // 根據繞缽速度調整音量
    const angleDiff = Math.abs(angle - lastRimAngle);
    const speed = Math.min(angleDiff * 10, 1);

    rimOscillators.forEach(({ gain }) => {
        const targetGain = 0.1 * speed;
        gain.gain.setTargetAtTime(targetGain, audioContext.currentTime, 0.1);
    });

    lastRimAngle = angle;
    vibration = Math.max(vibration, speed * 0.5);
}

function stopRimming() {
    if (!isRimming) return;
    isRimming = false;

    rimOscillators.forEach(({ osc, gain, lfo }) => {
        gain.gain.setTargetAtTime(0, audioContext.currentTime, 0.3);
        setTimeout(() => {
            osc.stop();
            lfo.stop();
        }, 1000);
    });

    rimOscillators = [];
}

function stopActiveNodes() {
    activeNodes.forEach(({ osc }) => {
        try {
            osc.stop();
        } catch (e) {}
    });
    activeNodes = [];
}

// ==================== 視覺效果 ====================

function addRipple(x, y) {
    ripples.push({
        x, y,
        radius: 0,
        maxRadius: bowlConfigs[config.bowlSize].size * 0.8,
        alpha: 1
    });
}

function draw() {
    const time = Date.now() / 1000;

    // 背景
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 環境光
    drawAmbientLight(time);

    // 繪製頌缽
    drawBowl(time);

    // 波紋
    drawRipples();

    // 衰減振動
    vibration *= 0.98;

    requestAnimationFrame(draw);
}

function drawAmbientLight(time) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 柔和的環境光
    const glowSize = 400 + Math.sin(time * 0.5) * 20;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize);
    gradient.addColorStop(0, 'rgba(50, 40, 30, 0.2)');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
    ctx.fill();
}

function drawBowl(time) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const bowlConfig = bowlConfigs[config.bowlSize];
    const materialConfig = materialConfigs[config.material];
    const size = bowlConfig.size;

    // 振動偏移
    const vibeX = Math.sin(time * 50) * vibration * 3;
    const vibeY = Math.cos(time * 47) * vibration * 3;

    // 缽的陰影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX + 10, centerY + size * 0.4 + 10, size * 0.8, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 缽身 - 側面
    const sideGradient = ctx.createLinearGradient(
        centerX - size, centerY,
        centerX + size, centerY
    );

    const baseColor = materialConfig.color;
    sideGradient.addColorStop(0, shadeColor(baseColor, -30));
    sideGradient.addColorStop(0.3, shadeColor(baseColor, 20));
    sideGradient.addColorStop(0.5, shadeColor(baseColor, 40));
    sideGradient.addColorStop(0.7, shadeColor(baseColor, 10));
    sideGradient.addColorStop(1, shadeColor(baseColor, -40));

    ctx.fillStyle = sideGradient;
    ctx.beginPath();
    ctx.ellipse(centerX + vibeX, centerY + vibeY, size, size * 0.3, 0, 0, Math.PI);
    ctx.lineTo(centerX - size * 0.7 + vibeX, centerY + size * 0.4 + vibeY);
    ctx.ellipse(centerX + vibeX, centerY + size * 0.4 + vibeY, size * 0.7, size * 0.15, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();

    // 缽口 - 頂部橢圓
    const topGradient = ctx.createRadialGradient(
        centerX + vibeX, centerY - size * 0.1 + vibeY, 0,
        centerX + vibeX, centerY + vibeY, size
    );
    topGradient.addColorStop(0, shadeColor(baseColor, -50));
    topGradient.addColorStop(0.7, shadeColor(baseColor, -30));
    topGradient.addColorStop(1, shadeColor(baseColor, 10));

    ctx.fillStyle = topGradient;
    ctx.beginPath();
    ctx.ellipse(centerX + vibeX, centerY + vibeY, size, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 缽口高光
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + vibration * 0.3})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(centerX + vibeX, centerY + vibeY, size, size * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 內部高光
    ctx.strokeStyle = `rgba(255, 255, 200, ${0.1 + vibration * 0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX + vibeX, centerY + vibeY, size * 0.7, size * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 振動時的光暈
    if (vibration > 0.1) {
        const glowGradient = ctx.createRadialGradient(
            centerX, centerY, size * 0.5,
            centerX, centerY, size * 1.5
        );
        glowGradient.addColorStop(0, `rgba(255, 220, 150, ${vibration * 0.2})`);
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // 繞缽時的木槌
    if (isRimming) {
        const malletAngle = time * 2;
        const malletX = centerX + Math.cos(malletAngle) * (size + 20);
        const malletY = centerY + Math.sin(malletAngle) * (size * 0.3 + 10);

        ctx.fillStyle = '#5a4030';
        ctx.beginPath();
        ctx.arc(malletX, malletY, 15, 0, Math.PI * 2);
        ctx.fill();

        // 木槌柄
        ctx.strokeStyle = '#4a3020';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(malletX, malletY);
        ctx.lineTo(malletX + Math.cos(malletAngle + Math.PI / 2) * 60,
                   malletY + Math.sin(malletAngle + Math.PI / 2) * 20);
        ctx.stroke();
    }
}

function drawRipples() {
    ripples.forEach((ripple, index) => {
        ctx.strokeStyle = `rgba(255, 220, 150, ${ripple.alpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();

        ripple.radius += 3;
        ripple.alpha -= 0.02;

        if (ripple.alpha <= 0 || ripple.radius > ripple.maxRadius) {
            ripples.splice(index, 1);
        }
    });
}

function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `rgb(${R}, ${G}, ${B})`;
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('click', (e) => {
    if (config.technique === 'strike') {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const bowlSize = bowlConfigs[config.bowlSize].size;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < bowlSize * 1.2) {
            playBowl();
        }
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (config.technique === 'rim') {
        startRimming();
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isRimming) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        updateRimming(angle);
    }
});

canvas.addEventListener('mouseup', () => {
    if (isRimming) {
        stopRimming();
    }
});

canvas.addEventListener('mouseleave', () => {
    if (isRimming) {
        stopRimming();
    }
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (config.technique === 'strike') {
        const touch = e.touches[0];
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const bowlSize = bowlConfigs[config.bowlSize].size;

        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < bowlSize * 1.2) {
            playBowl();
        }
    } else {
        startRimming();
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isRimming) {
        const touch = e.touches[0];
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
        updateRimming(angle);
    }
});

canvas.addEventListener('touchend', () => {
    if (isRimming) {
        stopRimming();
    }
});

document.getElementById('bowlSize').addEventListener('change', (e) => {
    config.bowlSize = e.target.value;
    document.getElementById('sizeDisplay').textContent = bowlConfigs[config.bowlSize].name;
});

document.getElementById('material').addEventListener('change', (e) => {
    config.material = e.target.value;
});

document.getElementById('technique').addEventListener('change', (e) => {
    config.technique = e.target.value;
    if (isRimming) {
        stopRimming();
    }
});

document.getElementById('decay').addEventListener('input', (e) => {
    config.decay = parseInt(e.target.value);
    let decayName = '';
    if (config.decay < 30) decayName = '短';
    else if (config.decay < 70) decayName = '中等';
    else decayName = '長';
    document.getElementById('decayValue').textContent = decayName;
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
