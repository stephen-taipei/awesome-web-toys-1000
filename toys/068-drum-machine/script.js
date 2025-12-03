/**
 * Drum Machine 鼓機
 * Web Toys #068
 *
 * 步進音序鼓機
 *
 * 技術重點：
 * - Web Audio API 音效合成
 * - 步進音序器
 * - 預設節奏模式
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('drumCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    tempo: 120,
    swing: 0,
    volume: 0.8
};

// 音訊相關
let audioContext = null;
let masterGain = null;

// 音序器
const steps = 16;
const tracks = [
    { name: 'Kick', color: '#ff6464' },
    { name: 'Snare', color: '#64ff64' },
    { name: 'HiHat', color: '#6464ff' },
    { name: 'OpenHH', color: '#ffff64' },
    { name: 'Clap', color: '#ff64ff' },
    { name: 'Tom', color: '#64ffff' }
];

let pattern = [];
let isPlaying = false;
let currentStep = 0;
let nextStepTime = 0;
let timerID = null;

// 視覺效果
let visualEffects = [];

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    initAudio();
    createSequencer();
    initPattern();
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

function initPattern() {
    pattern = [];
    for (let t = 0; t < tracks.length; t++) {
        pattern[t] = new Array(steps).fill(false);
    }
}

// ==================== 音序器 UI ====================

function createSequencer() {
    const grid = document.getElementById('grid');
    const trackLabels = document.getElementById('trackLabels');
    const stepNumbers = document.getElementById('stepNumbers');

    grid.innerHTML = '';
    trackLabels.innerHTML = '';
    stepNumbers.innerHTML = '';

    // 步進編號
    for (let s = 0; s < steps; s++) {
        const num = document.createElement('div');
        num.className = 'step-number' + (s % 4 === 0 ? ' beat' : '');
        num.textContent = s + 1;
        stepNumbers.appendChild(num);
    }

    // 軌道
    for (let t = 0; t < tracks.length; t++) {
        // 標籤
        const label = document.createElement('div');
        label.className = 'track-label';
        label.textContent = tracks[t].name;
        label.style.color = tracks[t].color;
        trackLabels.appendChild(label);

        // 步進格子
        const track = document.createElement('div');
        track.className = 'track';

        for (let s = 0; s < steps; s++) {
            const step = document.createElement('div');
            step.className = 'step' + (s % 4 === 0 ? ' beat' : '');
            step.dataset.track = t;
            step.dataset.step = s;

            step.addEventListener('click', () => toggleStep(t, s, step));

            track.appendChild(step);
        }

        grid.appendChild(track);
    }
}

function toggleStep(trackIndex, stepIndex, element) {
    pattern[trackIndex][stepIndex] = !pattern[trackIndex][stepIndex];
    element.classList.toggle('active', pattern[trackIndex][stepIndex]);
}

function updateStepVisuals() {
    const allSteps = document.querySelectorAll('.step');
    allSteps.forEach(step => {
        const t = parseInt(step.dataset.track);
        const s = parseInt(step.dataset.step);
        step.classList.toggle('playing', s === currentStep);
    });
}

// ==================== 音效合成 ====================

function playKick(time) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(time);
    osc.stop(time + 0.3);
}

function playSnare(time) {
    // 噪音
    const bufferSize = audioContext.sampleRate * 0.2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.5, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    noise.start(time);
    noise.stop(time + 0.2);

    // 音調
    const osc = audioContext.createOscillator();
    const oscGain = audioContext.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 180;

    oscGain.gain.setValueAtTime(0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    osc.start(time);
    osc.stop(time + 0.1);
}

function playHiHat(time, open = false) {
    const bufferSize = audioContext.sampleRate * (open ? 0.3 : 0.05);
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + (open ? 0.3 : 0.05));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start(time);
    noise.stop(time + (open ? 0.3 : 0.05));
}

function playClap(time) {
    const bufferSize = audioContext.sampleRate * 0.15;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.setValueAtTime(0.3, time + 0.02);
    gain.gain.setValueAtTime(0.5, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start(time);
    noise.stop(time + 0.15);
}

function playTom(time) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.2);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(time);
    osc.stop(time + 0.3);
}

function playSound(trackIndex, time) {
    switch (trackIndex) {
        case 0: playKick(time); break;
        case 1: playSnare(time); break;
        case 2: playHiHat(time, false); break;
        case 3: playHiHat(time, true); break;
        case 4: playClap(time); break;
        case 5: playTom(time); break;
    }

    // 視覺效果
    addVisualEffect(trackIndex);
}

// ==================== 播放控制 ====================

function scheduler() {
    while (nextStepTime < audioContext.currentTime + 0.1) {
        scheduleStep(currentStep, nextStepTime);
        advanceStep();
    }
    timerID = setTimeout(scheduler, 25);
}

function scheduleStep(step, time) {
    for (let t = 0; t < tracks.length; t++) {
        if (pattern[t][step]) {
            playSound(t, time);
        }
    }
}

function advanceStep() {
    const secondsPerBeat = 60.0 / config.tempo;
    const secondsPerStep = secondsPerBeat / 4;

    // 搖擺
    let swingOffset = 0;
    if (currentStep % 2 === 1 && config.swing > 0) {
        swingOffset = secondsPerStep * (config.swing / 100);
    }

    nextStepTime += secondsPerStep + swingOffset;
    currentStep = (currentStep + 1) % steps;

    document.getElementById('stepDisplay').textContent = currentStep + 1;
}

function play() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (!isPlaying) {
        isPlaying = true;
        currentStep = 0;
        nextStepTime = audioContext.currentTime;
        scheduler();

        document.getElementById('playBtn').textContent = '暫停';
        document.getElementById('playBtn').classList.add('playing');
        document.getElementById('statusDisplay').textContent = '播放中';
    } else {
        pause();
    }
}

function pause() {
    isPlaying = false;
    clearTimeout(timerID);

    document.getElementById('playBtn').textContent = '播放';
    document.getElementById('playBtn').classList.remove('playing');
    document.getElementById('statusDisplay').textContent = '暫停';
}

function stop() {
    isPlaying = false;
    clearTimeout(timerID);
    currentStep = 0;

    document.getElementById('playBtn').textContent = '播放';
    document.getElementById('playBtn').classList.remove('playing');
    document.getElementById('statusDisplay').textContent = '停止';
    document.getElementById('stepDisplay').textContent = '1';

    updateStepVisuals();
}

// ==================== 預設節奏 ====================

function loadPattern(patternName) {
    initPattern();

    switch (patternName) {
        case 'basic':
            pattern[0] = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
            pattern[1] = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
            pattern[2] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
            break;

        case 'rock':
            pattern[0] = [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0];
            pattern[1] = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
            pattern[2] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
            pattern[3] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];
            break;

        case 'hiphop':
            pattern[0] = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0];
            pattern[1] = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1];
            pattern[2] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
            pattern[4] = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
            break;

        case 'house':
            pattern[0] = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
            pattern[2] = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];
            pattern[3] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];
            pattern[4] = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
            break;

        case 'dnb':
            pattern[0] = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0];
            pattern[1] = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
            pattern[2] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
            break;
    }

    // 轉換為布林值
    for (let t = 0; t < tracks.length; t++) {
        pattern[t] = pattern[t].map(v => Boolean(v));
    }

    updateGridUI();
}

function updateGridUI() {
    const allSteps = document.querySelectorAll('.step');
    allSteps.forEach(step => {
        const t = parseInt(step.dataset.track);
        const s = parseInt(step.dataset.step);
        step.classList.toggle('active', pattern[t][s]);
    });
}

// ==================== 視覺效果 ====================

function addVisualEffect(trackIndex) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;

    visualEffects.push({
        x: x,
        y: y,
        radius: 20,
        maxRadius: 100 + Math.random() * 100,
        color: tracks[trackIndex].color,
        opacity: 1
    });
}

function drawVisuals() {
    ctx.fillStyle = 'rgba(10, 10, 20, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製效果
    for (let i = visualEffects.length - 1; i >= 0; i--) {
        const effect = visualEffects[i];

        effect.radius += 5;
        effect.opacity -= 0.03;

        if (effect.opacity <= 0) {
            visualEffects.splice(i, 1);
            continue;
        }

        ctx.strokeStyle = effect.color.replace(')', `, ${effect.opacity})`).replace('rgb', 'rgba');
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 中心節拍指示
    if (isPlaying) {
        const pulseSize = 50 + Math.sin(audioContext.currentTime * config.tempo / 30 * Math.PI) * 20;
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, pulseSize
        );
        gradient.addColorStop(0, 'rgba(255, 150, 50, 0.5)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, pulseSize, 0, Math.PI * 2);
        ctx.fill();
    }

    updateStepVisuals();
    requestAnimationFrame(drawVisuals);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('playBtn').addEventListener('click', play);
document.getElementById('stopBtn').addEventListener('click', stop);

document.getElementById('tempo').addEventListener('input', (e) => {
    config.tempo = parseInt(e.target.value);
    document.getElementById('tempoValue').textContent = config.tempo;
});

document.getElementById('swing').addEventListener('input', (e) => {
    config.swing = parseInt(e.target.value);
    document.getElementById('swingValue').textContent = config.swing;
});

document.getElementById('pattern').addEventListener('change', (e) => {
    loadPattern(e.target.value);
});

document.getElementById('volume').addEventListener('input', (e) => {
    config.volume = parseInt(e.target.value) / 100;
    document.getElementById('volumeValue').textContent = e.target.value;
    if (masterGain) {
        masterGain.gain.value = config.volume;
    }
});

// 鍵盤快捷鍵
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        play();
    }
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(drawVisuals);
