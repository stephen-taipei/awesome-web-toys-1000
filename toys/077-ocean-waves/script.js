/**
 * Ocean Waves 海浪聲
 * Web Toys #077
 *
 * 真實海浪聲模擬器
 *
 * 技術重點：
 * - 程序化海浪合成
 * - 波浪視覺動畫
 * - 環境音效混合
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('oceanCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    waveIntensity: 50,
    waveFrequency: 50,
    seagulls: false,
    wind: true,
    underwater: false,
    volume: 0.5,
    timer: 0
};

// 音訊相關
let audioContext = null;
let masterGain = null;
let waveNodes = [];
let windNode = null;
let isPlaying = false;

// 海鷗定時器
let seagullTimeout = null;

// 定時器
let timerEndTime = 0;
let timerInterval = null;

// 波浪相關
let wavePhase = 0;

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 音訊控制 ====================

function startOcean() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    masterGain = audioContext.createGain();
    masterGain.gain.value = config.volume;
    masterGain.connect(audioContext.destination);

    // 創建海浪聲
    createWaveSound();

    // 海風聲
    if (config.wind) {
        createWindSound();
    }

    // 海鷗聲
    if (config.seagulls) {
        scheduleSeagull();
    }

    isPlaying = true;

    // 啟動定時器
    if (config.timer > 0) {
        startTimer();
    }

    document.getElementById('playBtn').textContent = '停止';
    document.getElementById('playBtn').classList.add('playing');
    document.getElementById('statusDisplay').textContent = '播放中';
    updateSeaDisplay();
}

function createWaveSound() {
    // 清除舊節點
    waveNodes.forEach(node => {
        if (node.source) node.source.stop();
    });
    waveNodes = [];

    // 創建多層海浪
    for (let i = 0; i < 3; i++) {
        createWaveLayer(i);
    }
}

function createWaveLayer(layerIndex) {
    const bufferSize = audioContext.sampleRate * 4;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);

    // 海浪的基本週期
    const basePeriod = (2 + layerIndex) * audioContext.sampleRate / (config.waveFrequency / 25);

    for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            // 波浪週期性
            const wavePosition = (i % basePeriod) / basePeriod;
            const waveEnvelope = Math.pow(Math.sin(wavePosition * Math.PI), 0.5);

            // 噪音基底
            const white = Math.random() * 2 - 1;

            // 粉紅噪音濾波
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;

            let noise = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;

            // 應用波浪包絡
            data[i] = noise * waveEnvelope * (0.5 + config.waveIntensity / 200);

            // 波峰時的嘶嘶聲
            if (wavePosition > 0.6 && wavePosition < 0.9) {
                data[i] += (Math.random() * 2 - 1) * 0.1 * waveEnvelope;
            }
        }
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // 濾波器
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = config.underwater ? 400 : (1500 + config.waveIntensity * 20);

    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = config.underwater ? 50 : 80;

    // 層級增益
    const layerGain = audioContext.createGain();
    layerGain.gain.value = (0.4 - layerIndex * 0.1) * (config.waveIntensity / 50);

    // 立體聲
    const panner = audioContext.createStereoPanner();
    panner.pan.value = (layerIndex - 1) * 0.3;

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(layerGain);
    layerGain.connect(panner);
    panner.connect(masterGain);

    // 隨機起始位置
    source.start(0, Math.random() * 4);

    waveNodes.push({
        source,
        lowpass,
        highpass,
        gain: layerGain,
        panner
    });
}

function createWindSound() {
    const bufferSize = audioContext.sampleRate * 3;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        let lastValue = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // 棕噪音作為風聲基底
            lastValue = (lastValue + white * 0.02) / 1.02;
            data[i] = lastValue * 2;
        }
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 800;

    // LFO 調製風聲
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = 0.2;
    lfoGain.gain.value = 300;

    lfo.connect(lfoGain);
    lfoGain.connect(lowpass.frequency);
    lfo.start();

    const windGain = audioContext.createGain();
    windGain.gain.value = 0.15 * (config.waveIntensity / 50);

    source.connect(lowpass);
    lowpass.connect(windGain);
    windGain.connect(masterGain);

    source.start();

    windNode = { source, lfo, gain: windGain };
}

function scheduleSeagull() {
    if (!isPlaying || !config.seagulls) return;

    const delay = 5000 + Math.random() * 15000;

    seagullTimeout = setTimeout(() => {
        playSeagull();
        scheduleSeagull();
    }, delay);
}

function playSeagull() {
    if (!audioContext || !isPlaying) return;

    // 海鷗叫聲合成
    const duration = 0.3 + Math.random() * 0.4;

    const osc = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const seagullGain = audioContext.createGain();

    // 雙振盪器創造更真實的叫聲
    osc.type = 'sine';
    osc2.type = 'sine';

    const baseFreq = 1500 + Math.random() * 500;
    osc.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, audioContext.currentTime + duration * 0.3);
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.8, audioContext.currentTime + duration);

    osc2.frequency.setValueAtTime(baseFreq * 1.02, audioContext.currentTime);
    osc2.frequency.linearRampToValueAtTime(baseFreq * 1.52, audioContext.currentTime + duration * 0.3);
    osc2.frequency.linearRampToValueAtTime(baseFreq * 0.82, audioContext.currentTime + duration);

    seagullGain.gain.setValueAtTime(0, audioContext.currentTime);
    seagullGain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.02);
    seagullGain.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + duration * 0.5);
    seagullGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

    // 立體聲位置
    const panner = audioContext.createStereoPanner();
    panner.pan.value = Math.random() * 2 - 1;

    osc.connect(seagullGain);
    osc2.connect(seagullGain);
    seagullGain.connect(panner);
    panner.connect(masterGain);

    osc.start();
    osc2.start();
    osc.stop(audioContext.currentTime + duration);
    osc2.stop(audioContext.currentTime + duration);
}

function stopOcean() {
    waveNodes.forEach(node => {
        if (node.source) {
            node.source.stop();
            node.source.disconnect();
        }
    });
    waveNodes = [];

    if (windNode) {
        if (windNode.source) windNode.source.stop();
        if (windNode.lfo) windNode.lfo.stop();
        windNode = null;
    }

    if (seagullTimeout) {
        clearTimeout(seagullTimeout);
        seagullTimeout = null;
    }

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        document.getElementById('timerDisplay').textContent = '';
    }

    isPlaying = false;

    document.getElementById('playBtn').textContent = '播放';
    document.getElementById('playBtn').classList.remove('playing');
    document.getElementById('statusDisplay').textContent = '停止';
    document.getElementById('seaDisplay').textContent = '平靜';
}

function toggleOcean() {
    if (isPlaying) {
        stopOcean();
    } else {
        startOcean();
    }
}

function updateSeaDisplay() {
    let sea = '';
    if (config.waveIntensity < 30) {
        sea = '平靜';
    } else if (config.waveIntensity < 60) {
        sea = '微浪';
    } else if (config.waveIntensity < 80) {
        sea = '中浪';
    } else {
        sea = '大浪';
    }

    if (config.underwater) {
        sea = '水下 - ' + sea;
    }

    document.getElementById('seaDisplay').textContent = sea;
}

function getIntensityName(value) {
    if (value < 25) return '平靜';
    if (value < 50) return '輕柔';
    if (value < 75) return '中等';
    return '洶湧';
}

function getFrequencyName(value) {
    if (value < 30) return '緩慢';
    if (value < 70) return '正常';
    return '快速';
}

// ==================== 定時器 ====================

function startTimer() {
    timerEndTime = Date.now() + config.timer * 60 * 1000;

    timerInterval = setInterval(() => {
        const remaining = timerEndTime - Date.now();

        if (remaining <= 0) {
            stopOcean();
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

    // 背景漸層
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);

    if (config.underwater) {
        skyGradient.addColorStop(0, '#0a2030');
        skyGradient.addColorStop(1, '#051520');
    } else {
        skyGradient.addColorStop(0, '#1a3050');
        skyGradient.addColorStop(1, '#0a1520');
    }

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (config.underwater) {
        drawUnderwaterScene(time);
    } else {
        drawOceanScene(time);
    }

    requestAnimationFrame(draw);
}

function drawOceanScene(time) {
    const horizonY = canvas.height * 0.5;

    // 月亮/太陽
    const moonX = canvas.width * 0.7;
    const moonY = canvas.height * 0.2;
    const moonGradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 40);
    moonGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    moonGradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.3)');
    moonGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = moonGradient;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 40, 0, Math.PI * 2);
    ctx.fill();

    // 星星
    if (!isPlaying) {
        for (let i = 0; i < 80; i++) {
            const x = (Math.sin(i * 0.7) + 1) / 2 * canvas.width;
            const y = (Math.cos(i * 1.3) + 1) / 2 * horizonY;
            const twinkle = 0.3 + Math.sin(time * 2 + i) * 0.2;

            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 海洋
    const oceanGradient = ctx.createLinearGradient(0, horizonY, 0, canvas.height);
    oceanGradient.addColorStop(0, '#1a4060');
    oceanGradient.addColorStop(1, '#0a2030');

    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);

    // 波浪
    if (isPlaying) {
        wavePhase += 0.02 * (config.waveFrequency / 50);
    }

    // 多層波浪
    for (let layer = 0; layer < 5; layer++) {
        const layerY = horizonY + layer * 30;
        const amplitude = (10 + config.waveIntensity / 5) * (1 - layer * 0.15);
        const frequency = 0.01 + layer * 0.005;
        const speed = wavePhase * (1 + layer * 0.2);
        const alpha = 0.3 - layer * 0.05;

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 5) {
            const y = layerY +
                Math.sin(x * frequency + speed) * amplitude +
                Math.sin(x * frequency * 2.3 + speed * 1.5) * amplitude * 0.3;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        ctx.fillStyle = `rgba(40, 100, 140, ${alpha})`;
        ctx.fill();
    }

    // 月光反射
    ctx.fillStyle = 'rgba(255, 255, 200, 0.05)';
    for (let i = 0; i < 20; i++) {
        const reflectX = moonX + (Math.random() - 0.5) * 100;
        const reflectY = horizonY + 50 + i * 20 + Math.sin(time * 3 + i) * 10;
        const reflectWidth = 20 + Math.random() * 30;

        ctx.beginPath();
        ctx.ellipse(reflectX, reflectY, reflectWidth, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // 浪花
    if (isPlaying && config.waveIntensity > 40) {
        for (let i = 0; i < 10; i++) {
            const foamX = (time * 50 + i * 150) % canvas.width;
            const foamY = horizonY + 10 + Math.sin(time * 2 + i) * 20;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(foamX, foamY, 3 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawUnderwaterScene(time) {
    // 水下光線
    for (let i = 0; i < 5; i++) {
        const x = canvas.width * (0.2 + i * 0.15);
        const gradient = ctx.createLinearGradient(x, 0, x + 50, canvas.height);
        gradient.addColorStop(0, 'rgba(100, 200, 255, 0.1)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 30 + Math.sin(time + i) * 20, canvas.height);
        ctx.lineTo(x + 80 + Math.sin(time + i) * 20, canvas.height);
        ctx.lineTo(x + 50, 0);
        ctx.closePath();
        ctx.fill();
    }

    // 氣泡
    if (isPlaying) {
        for (let i = 0; i < 30; i++) {
            const bubbleX = (Math.sin(i * 0.7 + time * 0.5) + 1) / 2 * canvas.width;
            const bubbleY = canvas.height - ((time * 30 + i * 50) % canvas.height);
            const size = 2 + Math.sin(i) * 2;

            ctx.strokeStyle = 'rgba(150, 220, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY, size, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // 海底
    ctx.fillStyle = 'rgba(20, 60, 80, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    for (let x = 0; x <= canvas.width; x += 20) {
        const y = canvas.height - 50 - Math.sin(x * 0.02) * 30;
        ctx.lineTo(x, y);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('playBtn').addEventListener('click', toggleOcean);

document.getElementById('waveIntensity').addEventListener('input', (e) => {
    config.waveIntensity = parseInt(e.target.value);
    document.getElementById('waveIntensityValue').textContent = getIntensityName(config.waveIntensity);

    if (isPlaying) {
        updateSeaDisplay();
        // 更新濾波器
        waveNodes.forEach((node, i) => {
            if (node.lowpass) {
                node.lowpass.frequency.value = config.underwater ? 400 : (1500 + config.waveIntensity * 20);
            }
            if (node.gain) {
                node.gain.gain.value = (0.4 - i * 0.1) * (config.waveIntensity / 50);
            }
        });
    }
});

document.getElementById('waveFrequency').addEventListener('input', (e) => {
    config.waveFrequency = parseInt(e.target.value);
    document.getElementById('waveFrequencyValue').textContent = getFrequencyName(config.waveFrequency);
});

document.getElementById('seagulls').addEventListener('change', (e) => {
    config.seagulls = e.target.checked;

    if (isPlaying && config.seagulls) {
        scheduleSeagull();
    } else if (seagullTimeout) {
        clearTimeout(seagullTimeout);
        seagullTimeout = null;
    }
});

document.getElementById('wind').addEventListener('change', (e) => {
    config.wind = e.target.checked;

    if (isPlaying) {
        if (config.wind && !windNode) {
            createWindSound();
        } else if (!config.wind && windNode) {
            if (windNode.source) windNode.source.stop();
            if (windNode.lfo) windNode.lfo.stop();
            windNode = null;
        }
    }
});

document.getElementById('underwater').addEventListener('change', (e) => {
    config.underwater = e.target.checked;

    if (isPlaying) {
        updateSeaDisplay();
        // 更新濾波器
        waveNodes.forEach(node => {
            if (node.lowpass) {
                node.lowpass.frequency.value = config.underwater ? 400 : (1500 + config.waveIntensity * 20);
            }
            if (node.highpass) {
                node.highpass.frequency.value = config.underwater ? 50 : 80;
            }
        });
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

// 鍵盤控制
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        toggleOcean();
    }
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
