/**
 * Metronome 節拍器
 * Web Toys #071
 *
 * 視覺化節拍器
 *
 * 技術重點：
 * - 精確計時
 * - 擺錘動畫
 * - 多種音色
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('metronomeCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    tempo: 120,
    timeSignature: 4,
    sound: 'click',
    volume: 0.8,
    accentFirst: true
};

// 音訊相關
let audioContext = null;
let masterGain = null;

// 節拍器狀態
let isPlaying = false;
let currentBeat = 0;
let nextBeatTime = 0;
let timerID = null;

// 擺錘動畫
let pendulumAngle = 0;
let pendulumDirection = 1;
let lastBeatTime = 0;

// 視覺效果
let ripples = [];

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    initAudio();
    createBeatIndicators();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = config.volume;
    masterGain.connect(audioContext.destination);
}

function createBeatIndicators() {
    const container = document.getElementById('beatIndicators');
    container.innerHTML = '';

    for (let i = 0; i < config.timeSignature; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'beat-indicator' + (i === 0 ? ' first' : '');
        container.appendChild(indicator);
    }

    document.getElementById('totalBeats').textContent = config.timeSignature;
}

// ==================== 音效 ====================

function playClick(isAccent) {
    const now = audioContext.currentTime;
    const volume = isAccent ? 1 : 0.6;

    switch (config.sound) {
        case 'click':
            playClickSound(now, volume);
            break;
        case 'wood':
            playWoodSound(now, volume);
            break;
        case 'beep':
            playBeepSound(now, volume, isAccent);
            break;
        case 'drum':
            playDrumSound(now, volume, isAccent);
            break;
    }
}

function playClickSound(time, volume) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, time);
    osc.frequency.exponentialRampToValueAtTime(500, time + 0.02);

    gain.gain.setValueAtTime(volume * 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(time);
    osc.stop(time + 0.05);
}

function playWoodSound(time, volume) {
    const bufferSize = audioContext.sampleRate * 0.05;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 5;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(volume * 0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start(time);
    noise.stop(time + 0.05);
}

function playBeepSound(time, volume, isAccent) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = isAccent ? 880 : 660;

    gain.gain.setValueAtTime(volume * 0.3, time);
    gain.gain.setValueAtTime(volume * 0.3, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(time);
    osc.stop(time + 0.08);
}

function playDrumSound(time, volume, isAccent) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAccent ? 200 : 150, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);

    gain.gain.setValueAtTime(volume * 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(time);
    osc.stop(time + 0.15);

    // 添加噪音成分
    const bufferSize = audioContext.sampleRate * 0.05;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.2, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);

    noise.connect(noiseGain);
    noiseGain.connect(masterGain);

    noise.start(time);
    noise.stop(time + 0.03);
}

// ==================== 節拍控制 ====================

function scheduler() {
    while (nextBeatTime < audioContext.currentTime + 0.1) {
        scheduleBeat(currentBeat, nextBeatTime);
        advanceBeat();
    }
    timerID = setTimeout(scheduler, 25);
}

function scheduleBeat(beat, time) {
    const isAccent = config.accentFirst && beat === 0;
    playClick(isAccent);

    // 更新 UI（使用 setTimeout 同步）
    const delay = (time - audioContext.currentTime) * 1000;
    setTimeout(() => {
        updateBeatIndicators(beat);
        updatePendulum();
        addRipple();
    }, Math.max(0, delay));
}

function advanceBeat() {
    const secondsPerBeat = 60.0 / config.tempo;
    nextBeatTime += secondsPerBeat;
    currentBeat = (currentBeat + 1) % config.timeSignature;
}

function updateBeatIndicators(beat) {
    const indicators = document.querySelectorAll('.beat-indicator');
    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === beat);
    });
    document.getElementById('beatDisplay').textContent = beat + 1;
}

function updatePendulum() {
    pendulumDirection *= -1;
    lastBeatTime = Date.now();
}

// ==================== 控制 ====================

function start() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (!isPlaying) {
        isPlaying = true;
        currentBeat = 0;
        nextBeatTime = audioContext.currentTime;
        scheduler();

        document.getElementById('startBtn').textContent = '停止';
        document.getElementById('startBtn').classList.add('playing');
        document.getElementById('statusDisplay').textContent = '播放中';
    } else {
        stop();
    }
}

function stop() {
    isPlaying = false;
    clearTimeout(timerID);
    currentBeat = 0;

    document.getElementById('startBtn').textContent = '開始';
    document.getElementById('startBtn').classList.remove('playing');
    document.getElementById('statusDisplay').textContent = '停止';
    document.getElementById('beatDisplay').textContent = '-';

    const indicators = document.querySelectorAll('.beat-indicator');
    indicators.forEach(indicator => indicator.classList.remove('active'));

    pendulumAngle = 0;
}

// ==================== 視覺效果 ====================

function addRipple() {
    ripples.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 50,
        opacity: 0.5
    });
}

function animatePendulum() {
    if (isPlaying) {
        const beatDuration = 60000 / config.tempo;
        const elapsed = Date.now() - lastBeatTime;
        const progress = Math.min(1, elapsed / beatDuration);

        // 使用正弦函數模擬擺動
        const maxAngle = 30;
        pendulumAngle = Math.sin(progress * Math.PI) * maxAngle * pendulumDirection;
    } else {
        pendulumAngle *= 0.95;
    }

    const pendulum = document.getElementById('pendulum');
    pendulum.style.transform = `rotate(${pendulumAngle}deg)`;
}

function draw() {
    ctx.fillStyle = 'rgba(26, 20, 16, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製漣漪
    for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];

        ripple.radius += 5;
        ripple.opacity -= 0.01;

        if (ripple.opacity <= 0) {
            ripples.splice(i, 1);
            continue;
        }

        ctx.strokeStyle = `rgba(212, 175, 55, ${ripple.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 背景節拍指示
    if (isPlaying) {
        const beatDuration = 60000 / config.tempo;
        const elapsed = Date.now() - lastBeatTime;
        const progress = elapsed / beatDuration;
        const pulseSize = 100 + Math.sin(progress * Math.PI) * 50;

        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, pulseSize
        );
        gradient.addColorStop(0, 'rgba(212, 175, 55, 0.2)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, pulseSize, 0, Math.PI * 2);
        ctx.fill();
    }

    animatePendulum();
    requestAnimationFrame(draw);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('startBtn').addEventListener('click', start);

document.getElementById('tempo').addEventListener('input', (e) => {
    config.tempo = parseInt(e.target.value);
    document.getElementById('tempoValue').textContent = config.tempo;
    document.getElementById('tempoDisplay').textContent = config.tempo;
});

document.querySelectorAll('.tempo-presets button').forEach(btn => {
    btn.addEventListener('click', () => {
        const tempo = parseInt(btn.dataset.tempo);
        config.tempo = tempo;
        document.getElementById('tempo').value = tempo;
        document.getElementById('tempoValue').textContent = tempo;
        document.getElementById('tempoDisplay').textContent = tempo;
    });
});

document.getElementById('timeSignature').addEventListener('change', (e) => {
    config.timeSignature = parseInt(e.target.value);
    createBeatIndicators();
    if (isPlaying) {
        stop();
        start();
    }
});

document.getElementById('sound').addEventListener('change', (e) => {
    config.sound = e.target.value;
});

document.getElementById('volume').addEventListener('input', (e) => {
    config.volume = parseInt(e.target.value) / 100;
    document.getElementById('volumeValue').textContent = e.target.value;
    if (masterGain) {
        masterGain.gain.value = config.volume;
    }
});

document.getElementById('accentFirst').addEventListener('change', (e) => {
    config.accentFirst = e.target.checked;
});

// 空白鍵控制
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        start();
    }
});

// 點擊畫面控制
canvas.addEventListener('click', start);

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
