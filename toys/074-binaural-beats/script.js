/**
 * Binaural Beats 雙耳節拍
 * Web Toys #074
 *
 * 雙耳節拍產生器，用於腦波調節
 *
 * 技術重點：
 * - 立體聲分離
 * - 腦波頻率對應
 * - 視覺化節拍效果
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('binauralCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    beatFreq: 10,
    baseFreq: 200,
    volume: 0.5,
    waveform: 'sine',
    timer: 0
};

// 音訊相關
let audioContext = null;
let leftOscillator = null;
let rightOscillator = null;
let leftGain = null;
let rightGain = null;
let merger = null;
let isPlaying = false;

// 定時器
let timerEndTime = 0;
let timerInterval = null;

// 腦波預設
const brainWavePresets = {
    delta: { min: 0.5, max: 4, default: 2, name: 'Delta', description: 'Delta 波促進深度睡眠和身體修復。' },
    theta: { min: 4, max: 8, default: 6, name: 'Theta', description: 'Theta 波有助於深度冥想、創造力和記憶整合。' },
    alpha: { min: 8, max: 14, default: 10, name: 'Alpha', description: 'Alpha 波有助於放鬆身心，提升創造力和專注力。' },
    beta: { min: 14, max: 30, default: 20, name: 'Beta', description: 'Beta 波提升警覺性、集中力和認知能力。' },
    gamma: { min: 30, max: 50, default: 40, name: 'Gamma', description: 'Gamma 波與高度認知功能、學習和問題解決相關。' }
};

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    updateFrequencyDisplay();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 音訊控制 ====================

function startBinaural() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    stopBinaural(false);

    // 計算左右耳頻率
    const leftFreq = config.baseFreq - config.beatFreq / 2;
    const rightFreq = config.baseFreq + config.beatFreq / 2;

    // 左耳振盪器
    leftOscillator = audioContext.createOscillator();
    leftOscillator.type = config.waveform;
    leftOscillator.frequency.value = leftFreq;

    // 右耳振盪器
    rightOscillator = audioContext.createOscillator();
    rightOscillator.type = config.waveform;
    rightOscillator.frequency.value = rightFreq;

    // 增益節點
    leftGain = audioContext.createGain();
    rightGain = audioContext.createGain();
    leftGain.gain.value = config.volume;
    rightGain.gain.value = config.volume;

    // 立體聲合併器
    merger = audioContext.createChannelMerger(2);

    // 連接
    leftOscillator.connect(leftGain);
    rightOscillator.connect(rightGain);
    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);
    merger.connect(audioContext.destination);

    leftOscillator.start();
    rightOscillator.start();
    isPlaying = true;

    // 啟動定時器
    if (config.timer > 0) {
        startTimer();
    }

    updateUI();
    updateFrequencyDisplay();
}

function stopBinaural(updateUIFlag = true) {
    if (leftOscillator) {
        leftOscillator.stop();
        leftOscillator.disconnect();
        leftOscillator = null;
    }

    if (rightOscillator) {
        rightOscillator.stop();
        rightOscillator.disconnect();
        rightOscillator = null;
    }

    if (updateUIFlag) {
        isPlaying = false;

        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            document.getElementById('timerDisplay').textContent = '';
        }

        updateUI();
    }
}

function toggleBinaural() {
    if (isPlaying) {
        stopBinaural();
    } else {
        startBinaural();
    }
}

function updateUI() {
    document.getElementById('playBtn').textContent = isPlaying ? '停止' : '播放';
    document.getElementById('playBtn').classList.toggle('playing', isPlaying);
    document.getElementById('statusDisplay').textContent = isPlaying ? '播放中' : '停止';
}

function updateFrequencyDisplay() {
    const leftFreq = config.baseFreq - config.beatFreq / 2;
    const rightFreq = config.baseFreq + config.beatFreq / 2;

    document.getElementById('beatFreqDisplay').textContent = config.beatFreq;
    document.getElementById('beatFreqValue').textContent = config.beatFreq;
    document.getElementById('leftFreq').textContent = leftFreq.toFixed(1);
    document.getElementById('rightFreq').textContent = rightFreq.toFixed(1);

    // 更新腦波狀態
    const brainState = getBrainWaveState(config.beatFreq);
    document.getElementById('brainState').textContent = brainState.state;
    document.getElementById('waveDisplay').textContent = brainState.name;
    document.getElementById('brainDescription').textContent = brainState.description;
}

function getBrainWaveState(freq) {
    if (freq >= 0.5 && freq < 4) {
        return { name: 'Delta', state: 'Delta 波 - 深度睡眠', description: brainWavePresets.delta.description };
    } else if (freq >= 4 && freq < 8) {
        return { name: 'Theta', state: 'Theta 波 - 冥想放鬆', description: brainWavePresets.theta.description };
    } else if (freq >= 8 && freq < 14) {
        return { name: 'Alpha', state: 'Alpha 波 - 放鬆專注', description: brainWavePresets.alpha.description };
    } else if (freq >= 14 && freq < 30) {
        return { name: 'Beta', state: 'Beta 波 - 警覺集中', description: brainWavePresets.beta.description };
    } else {
        return { name: 'Gamma', state: 'Gamma 波 - 高度認知', description: brainWavePresets.gamma.description };
    }
}

// ==================== 定時器 ====================

function startTimer() {
    timerEndTime = Date.now() + config.timer * 60 * 1000;

    timerInterval = setInterval(() => {
        const remaining = timerEndTime - Date.now();

        if (remaining <= 0) {
            stopBinaural();
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
    ctx.fillStyle = 'rgba(10, 10, 24, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isPlaying) {
        drawBinauralVisualization();
    }

    requestAnimationFrame(draw);
}

function drawBinauralVisualization() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() / 1000;

    // 雙耳節拍視覺化 - 兩個波形干涉
    const beatPhase = time * config.beatFreq * Math.PI * 2;

    // 左右圓環
    const leftX = centerX - 150;
    const rightX = centerX + 150;

    // 左耳波紋
    for (let i = 0; i < 3; i++) {
        const leftPhase = (time * 2 + i * 0.5) % 2;
        const leftRadius = leftPhase * 100;
        const leftAlpha = (1 - leftPhase) * 0.3;

        ctx.strokeStyle = `rgba(100, 100, 255, ${leftAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(leftX, centerY, leftRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 右耳波紋
    for (let i = 0; i < 3; i++) {
        const rightPhase = (time * 2 + i * 0.5 + 0.25) % 2;
        const rightRadius = rightPhase * 100;
        const rightAlpha = (1 - rightPhase) * 0.3;

        ctx.strokeStyle = `rgba(255, 100, 255, ${rightAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rightX, centerY, rightRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 中央節拍脈動
    const beatIntensity = (Math.sin(beatPhase) + 1) / 2;
    const pulseSize = 80 + beatIntensity * 40;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
    gradient.addColorStop(0, `rgba(180, 100, 255, ${0.3 * beatIntensity})`);
    gradient.addColorStop(0.5, `rgba(128, 128, 255, ${0.15 * beatIntensity})`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.fill();

    // 連接線
    ctx.strokeStyle = `rgba(180, 140, 255, ${0.2 + beatIntensity * 0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftX, centerY);
    ctx.quadraticCurveTo(centerX, centerY - 50 * beatIntensity, rightX, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(leftX, centerY);
    ctx.quadraticCurveTo(centerX, centerY + 50 * beatIntensity, rightX, centerY);
    ctx.stroke();

    // 頻率波形
    drawFrequencyWaves(time, beatIntensity);
}

function drawFrequencyWaves(time, beatIntensity) {
    const centerY = canvas.height / 2;

    // 繪製雙耳頻率差異波
    ctx.strokeStyle = `rgba(160, 120, 255, ${0.2 + beatIntensity * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        const t = (x / canvas.width) * Math.PI * 8;
        const leftWave = Math.sin(t * (config.baseFreq / 100) + time * 10);
        const rightWave = Math.sin(t * (config.baseFreq / 100) + time * 10 + config.beatFreq * time);
        const combined = (leftWave + rightWave) / 2;

        const y = centerY + combined * 30 * config.volume;

        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();

    // 節拍包絡線
    ctx.strokeStyle = `rgba(255, 150, 255, 0.15)`;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        const t = x / canvas.width * Math.PI * config.beatFreq / 2 + time * config.beatFreq;
        const envelope = Math.abs(Math.cos(t));
        const y = centerY + envelope * 40 * config.volume;

        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();

    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        const t = x / canvas.width * Math.PI * config.beatFreq / 2 + time * config.beatFreq;
        const envelope = Math.abs(Math.cos(t));
        const y = centerY - envelope * 40 * config.volume;

        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('playBtn').addEventListener('click', toggleBinaural);

document.getElementById('preset').addEventListener('change', (e) => {
    const preset = e.target.value;

    if (preset !== 'custom' && brainWavePresets[preset]) {
        const presetData = brainWavePresets[preset];
        config.beatFreq = presetData.default;
        document.getElementById('beatFreq').value = config.beatFreq;

        updateFrequencyDisplay();

        if (isPlaying) {
            startBinaural();
        }
    }
});

document.getElementById('beatFreq').addEventListener('input', (e) => {
    config.beatFreq = parseFloat(e.target.value);
    document.getElementById('preset').value = 'custom';

    updateFrequencyDisplay();

    if (isPlaying && leftOscillator && rightOscillator) {
        const leftFreq = config.baseFreq - config.beatFreq / 2;
        const rightFreq = config.baseFreq + config.beatFreq / 2;
        leftOscillator.frequency.setValueAtTime(leftFreq, audioContext.currentTime);
        rightOscillator.frequency.setValueAtTime(rightFreq, audioContext.currentTime);
    }
});

document.getElementById('baseFreq').addEventListener('input', (e) => {
    config.baseFreq = parseInt(e.target.value);
    document.getElementById('baseFreqValue').textContent = config.baseFreq;

    updateFrequencyDisplay();

    if (isPlaying && leftOscillator && rightOscillator) {
        const leftFreq = config.baseFreq - config.beatFreq / 2;
        const rightFreq = config.baseFreq + config.beatFreq / 2;
        leftOscillator.frequency.setValueAtTime(leftFreq, audioContext.currentTime);
        rightOscillator.frequency.setValueAtTime(rightFreq, audioContext.currentTime);
    }
});

document.getElementById('volume').addEventListener('input', (e) => {
    config.volume = parseInt(e.target.value) / 100;
    document.getElementById('volumeValue').textContent = e.target.value;

    if (leftGain && rightGain) {
        leftGain.gain.setValueAtTime(config.volume, audioContext.currentTime);
        rightGain.gain.setValueAtTime(config.volume, audioContext.currentTime);
    }
});

document.getElementById('waveform').addEventListener('change', (e) => {
    config.waveform = e.target.value;

    if (isPlaying) {
        startBinaural();
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
        toggleBinaural();
    }
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
