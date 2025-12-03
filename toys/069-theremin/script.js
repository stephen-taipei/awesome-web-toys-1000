/**
 * Theremin 特雷門琴
 * Web Toys #069
 *
 * 虛擬特雷門琴
 *
 * 技術重點：
 * - 連續音高控制
 * - 音量漸變
 * - 顫音效果
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('thereminCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    waveform: 'sine',
    minFreq: 100,
    maxFreq: 2000,
    vibrato: 0,
    reverb: 0.3,
    showGuides: true
};

// 音訊相關
let audioContext = null;
let oscillator = null;
let gainNode = null;
let vibratoOsc = null;
let vibratoGain = null;
let reverbNode = null;
let isPlaying = false;

// 滑鼠/觸控位置
let mouseX = 0;
let mouseY = 0;
let targetFreq = 0;
let targetVolume = 0;
let currentFreq = 0;
let currentVolume = 0;

// 音符名稱
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 視覺效果
let trails = [];

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 音訊設定 ====================

function initAudio() {
    if (audioContext) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // 主振盪器
    oscillator = audioContext.createOscillator();
    oscillator.type = config.waveform;
    oscillator.frequency.value = 440;

    // 顫音振盪器
    vibratoOsc = audioContext.createOscillator();
    vibratoOsc.type = 'sine';
    vibratoOsc.frequency.value = 6;

    vibratoGain = audioContext.createGain();
    vibratoGain.gain.value = config.vibrato;

    vibratoOsc.connect(vibratoGain);
    vibratoGain.connect(oscillator.frequency);

    // 音量控制
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0;

    // 連接
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 開始振盪器
    oscillator.start();
    vibratoOsc.start();

    isPlaying = true;
}

function updateAudio() {
    if (!audioContext || !oscillator) return;

    // 平滑過渡
    currentFreq += (targetFreq - currentFreq) * 0.1;
    currentVolume += (targetVolume - currentVolume) * 0.15;

    oscillator.frequency.setValueAtTime(currentFreq, audioContext.currentTime);
    gainNode.gain.setValueAtTime(currentVolume * 0.5, audioContext.currentTime);
}

// ==================== 頻率/音符計算 ====================

function frequencyToNote(freq) {
    if (freq <= 0) return '--';

    const noteNum = 12 * (Math.log2(freq / 440)) + 69;
    const noteIndex = Math.round(noteNum) % 12;
    const octave = Math.floor(Math.round(noteNum) / 12) - 1;

    return noteNames[noteIndex] + octave;
}

function getNoteFrequencies() {
    const frequencies = [];
    const startNote = Math.floor(12 * Math.log2(config.minFreq / 440) + 69);
    const endNote = Math.ceil(12 * Math.log2(config.maxFreq / 440) + 69);

    for (let note = startNote; note <= endNote; note++) {
        const freq = 440 * Math.pow(2, (note - 69) / 12);
        if (freq >= config.minFreq && freq <= config.maxFreq) {
            frequencies.push({
                freq: freq,
                name: noteNames[note % 12],
                isWhite: ![1, 3, 6, 8, 10].includes(note % 12)
            });
        }
    }

    return frequencies;
}

// ==================== 繪製 ====================

function draw() {
    // 背景
    ctx.fillStyle = 'rgba(10, 10, 26, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 音階參考線
    if (config.showGuides) {
        drawGuides();
    }

    // 繪製軌跡
    drawTrails();

    // 繪製指示器
    drawIndicator();

    // 更新音訊
    updateAudio();

    // 更新顯示
    document.getElementById('freqDisplay').textContent = Math.round(currentFreq) + ' Hz';
    document.getElementById('volumeDisplay').textContent = Math.round(currentVolume * 100) + '%';
    document.getElementById('noteDisplay').textContent = frequencyToNote(currentFreq);

    requestAnimationFrame(draw);
}

function drawGuides() {
    const notes = getNoteFrequencies();

    notes.forEach(note => {
        const x = ((Math.log2(note.freq) - Math.log2(config.minFreq)) /
            (Math.log2(config.maxFreq) - Math.log2(config.minFreq))) * canvas.width;

        ctx.strokeStyle = note.isWhite ? 'rgba(100, 200, 255, 0.15)' : 'rgba(200, 100, 255, 0.1)';
        ctx.lineWidth = note.isWhite ? 1 : 0.5;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

        // 音符標籤（只顯示白鍵）
        if (note.isWhite) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(note.name, x, canvas.height - 10);
        }
    });

    // 音量參考線
    for (let i = 0; i <= 10; i++) {
        const y = (i / 10) * canvas.height;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawTrails() {
    // 添加新軌跡點
    if (isPlaying && currentVolume > 0.01) {
        trails.push({
            x: mouseX,
            y: mouseY,
            freq: currentFreq,
            volume: currentVolume,
            life: 1
        });
    }

    // 繪製並更新軌跡
    for (let i = trails.length - 1; i >= 0; i--) {
        const trail = trails[i];
        trail.life -= 0.02;

        if (trail.life <= 0) {
            trails.splice(i, 1);
            continue;
        }

        const hue = ((Math.log2(trail.freq) - Math.log2(config.minFreq)) /
            (Math.log2(config.maxFreq) - Math.log2(config.minFreq))) * 270;

        const size = 5 + trail.volume * 20;

        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${trail.life * 0.5})`;
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, size * trail.life, 0, Math.PI * 2);
        ctx.fill();
    }

    // 限制軌跡數量
    while (trails.length > 200) {
        trails.shift();
    }
}

function drawIndicator() {
    if (!isPlaying) return;

    const hue = ((Math.log2(currentFreq) - Math.log2(config.minFreq)) /
        (Math.log2(config.maxFreq) - Math.log2(config.minFreq))) * 270;

    // 外圈發光
    const glowSize = 30 + currentVolume * 50;
    const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, glowSize);
    gradient.addColorStop(0, `hsla(${hue}, 80%, 70%, ${currentVolume * 0.8})`);
    gradient.addColorStop(0.5, `hsla(${hue}, 80%, 50%, ${currentVolume * 0.4})`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // 核心
    ctx.fillStyle = `hsla(${hue}, 80%, 80%, ${0.5 + currentVolume * 0.5})`;
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 8 + currentVolume * 10, 0, Math.PI * 2);
    ctx.fill();

    // 波紋
    if (currentVolume > 0.1) {
        const time = Date.now() / 1000;
        for (let i = 0; i < 3; i++) {
            const phase = (time * 3 + i * 0.3) % 1;
            const ringSize = glowSize * phase * 2;
            const ringAlpha = (1 - phase) * currentVolume * 0.3;

            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${ringAlpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, ringSize, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

// ==================== 事件處理 ====================

function handleMove(x, y) {
    mouseX = x;
    mouseY = y;

    // 計算頻率（對數刻度）
    const freqRatio = x / canvas.width;
    targetFreq = config.minFreq * Math.pow(config.maxFreq / config.minFreq, freqRatio);

    // 計算音量（從上到下）
    targetVolume = 1 - (y / canvas.height);
    targetVolume = Math.max(0, Math.min(1, targetVolume));
}

canvas.addEventListener('mouseenter', () => {
    initAudio();
});

canvas.addEventListener('mousemove', (e) => {
    handleMove(e.clientX, e.clientY);
});

canvas.addEventListener('mouseleave', () => {
    targetVolume = 0;
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    initAudio();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
});

canvas.addEventListener('touchend', () => {
    targetVolume = 0;
});

window.addEventListener('resize', resizeCanvas);

document.getElementById('waveform').addEventListener('change', (e) => {
    config.waveform = e.target.value;
    if (oscillator) {
        oscillator.type = config.waveform;
    }
});

document.getElementById('minFreq').addEventListener('input', (e) => {
    config.minFreq = parseInt(e.target.value);
    document.getElementById('minFreqValue').textContent = config.minFreq;
});

document.getElementById('maxFreq').addEventListener('input', (e) => {
    config.maxFreq = parseInt(e.target.value);
    document.getElementById('maxFreqValue').textContent = config.maxFreq;
});

document.getElementById('vibrato').addEventListener('input', (e) => {
    config.vibrato = parseInt(e.target.value);
    document.getElementById('vibratoValue').textContent = config.vibrato;
    if (vibratoGain) {
        vibratoGain.gain.value = config.vibrato;
    }
});

document.getElementById('reverb').addEventListener('input', (e) => {
    config.reverb = parseFloat(e.target.value);
    document.getElementById('reverbValue').textContent = config.reverb.toFixed(1);
});

document.getElementById('showGuides').addEventListener('change', (e) => {
    config.showGuides = e.target.checked;
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
