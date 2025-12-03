/**
 * Tone Generator 音調產生器
 * Web Toys #072
 *
 * 精確頻率音調產生器
 *
 * 技術重點：
 * - 精確頻率控制
 * - 多種波形
 * - 頻率掃描
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('toneCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    frequency: 440,
    waveform: 'sine',
    volume: 0.5,
    sweep: false,
    sweepMin: 100,
    sweepMax: 1000,
    sweepDuration: 5
};

// 音訊相關
let audioContext = null;
let oscillator = null;
let gainNode = null;
let isPlaying = false;

// 掃描相關
let sweepStartTime = 0;
let sweepAnimationId = null;

// 音符名稱
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 音訊控制 ====================

function startTone() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
    }

    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();

    oscillator.type = config.waveform;
    oscillator.frequency.value = config.frequency;
    gainNode.gain.value = config.volume;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    isPlaying = true;

    if (config.sweep) {
        startSweep();
    }

    document.getElementById('playBtn').textContent = '停止';
    document.getElementById('playBtn').classList.add('playing');
    document.getElementById('statusDisplay').textContent = '播放中';
}

function stopTone() {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
    }

    isPlaying = false;

    if (sweepAnimationId) {
        cancelAnimationFrame(sweepAnimationId);
        sweepAnimationId = null;
    }

    document.getElementById('playBtn').textContent = '播放';
    document.getElementById('playBtn').classList.remove('playing');
    document.getElementById('statusDisplay').textContent = '停止';
}

function toggleTone() {
    if (isPlaying) {
        stopTone();
    } else {
        startTone();
    }
}

function setFrequency(freq) {
    config.frequency = Math.max(20, Math.min(20000, freq));

    if (oscillator) {
        oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
    }

    updateDisplay();
}

function updateDisplay() {
    document.getElementById('freqDisplay').textContent = Math.round(config.frequency);
    document.getElementById('frequencyValue').textContent = Math.round(config.frequency);
    document.getElementById('frequency').value = Math.min(2000, config.frequency);
    document.getElementById('freqInput').value = config.frequency.toFixed(1);
    document.getElementById('noteName').textContent = frequencyToNote(config.frequency);
}

// ==================== 頻率掃描 ====================

function startSweep() {
    sweepStartTime = audioContext.currentTime;
    updateSweep();
}

function updateSweep() {
    if (!isPlaying || !config.sweep) return;

    const elapsed = audioContext.currentTime - sweepStartTime;
    const progress = (elapsed % config.sweepDuration) / config.sweepDuration;

    // 對數掃描
    const logMin = Math.log10(config.sweepMin);
    const logMax = Math.log10(config.sweepMax);
    const logFreq = logMin + (logMax - logMin) * progress;
    const freq = Math.pow(10, logFreq);

    config.frequency = freq;
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    updateDisplay();

    sweepAnimationId = requestAnimationFrame(updateSweep);
}

// ==================== 音符計算 ====================

function frequencyToNote(freq) {
    if (freq <= 0) return '--';

    const noteNum = 12 * Math.log2(freq / 440) + 69;
    const roundedNote = Math.round(noteNum);
    const noteIndex = ((roundedNote % 12) + 12) % 12;
    const octave = Math.floor(roundedNote / 12) - 1;

    const cents = Math.round((noteNum - roundedNote) * 100);
    const centsStr = cents >= 0 ? `+${cents}` : `${cents}`;

    return `${noteNames[noteIndex]}${octave} (${centsStr}¢)`;
}

// ==================== 視覺效果 ====================

function draw() {
    ctx.fillStyle = 'rgba(10, 15, 26, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isPlaying) {
        drawWaveform();
        drawFrequencyRing();
    }

    requestAnimationFrame(draw);
}

function drawWaveform() {
    const centerY = canvas.height / 2;
    const amplitude = canvas.height * 0.2 * config.volume;
    const time = Date.now() / 1000;
    const frequency = config.frequency;

    ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        const t = (x / canvas.width) * 4 * Math.PI + time * frequency / 50;
        let y;

        switch (config.waveform) {
            case 'sine':
                y = Math.sin(t);
                break;
            case 'square':
                y = Math.sign(Math.sin(t));
                break;
            case 'sawtooth':
                y = 2 * ((t / (2 * Math.PI)) % 1) - 1;
                break;
            case 'triangle':
                y = 2 * Math.abs(2 * ((t / (2 * Math.PI)) % 1) - 1) - 1;
                break;
            default:
                y = Math.sin(t);
        }

        const screenY = centerY + y * amplitude;

        if (x === 0) {
            ctx.moveTo(x, screenY);
        } else {
            ctx.lineTo(x, screenY);
        }
    }

    ctx.stroke();
}

function drawFrequencyRing() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() / 1000;

    // 頻率相關的脈動
    const pulseSpeed = config.frequency / 100;
    const pulseSize = 150 + Math.sin(time * pulseSpeed) * 30;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);

    // 根據頻率改變顏色
    const hue = (Math.log2(config.frequency / 20) / Math.log2(20000 / 20)) * 270;
    gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.3)`);
    gradient.addColorStop(0.5, `hsla(${hue}, 80%, 50%, 0.1)`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.fill();

    // 外圈
    ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.3)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.stroke();
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('playBtn').addEventListener('click', toggleTone);

document.getElementById('frequency').addEventListener('input', (e) => {
    setFrequency(parseFloat(e.target.value));
});

document.getElementById('freqInput').addEventListener('change', (e) => {
    setFrequency(parseFloat(e.target.value));
});

document.querySelectorAll('.preset-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
        const freq = parseFloat(btn.dataset.freq);
        setFrequency(freq);
        document.getElementById('frequency').value = Math.min(2000, freq);
    });
});

document.getElementById('waveform').addEventListener('change', (e) => {
    config.waveform = e.target.value;
    if (oscillator) {
        oscillator.type = config.waveform;
    }

    const waveNames = {
        sine: '正弦波',
        square: '方波',
        sawtooth: '鋸齒波',
        triangle: '三角波'
    };
    document.getElementById('waveDisplay').textContent = waveNames[config.waveform];
});

document.getElementById('volume').addEventListener('input', (e) => {
    config.volume = parseInt(e.target.value) / 100;
    document.getElementById('volumeValue').textContent = e.target.value;
    if (gainNode) {
        gainNode.gain.setValueAtTime(config.volume, audioContext.currentTime);
    }
});

document.getElementById('sweep').addEventListener('change', (e) => {
    config.sweep = e.target.checked;
    document.getElementById('sweepControls').classList.toggle('visible', config.sweep);

    if (isPlaying && config.sweep) {
        startSweep();
    }
});

document.getElementById('sweepMin').addEventListener('input', (e) => {
    config.sweepMin = parseInt(e.target.value);
    document.getElementById('sweepMinValue').textContent = config.sweepMin;
});

document.getElementById('sweepMax').addEventListener('input', (e) => {
    config.sweepMax = parseInt(e.target.value);
    document.getElementById('sweepMaxValue').textContent = config.sweepMax;
});

document.getElementById('sweepDuration').addEventListener('input', (e) => {
    config.sweepDuration = parseInt(e.target.value);
    document.getElementById('sweepDurationValue').textContent = config.sweepDuration;
});

// 鍵盤控制
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        toggleTone();
    }
});

// ==================== 啟動 ====================

init();
updateDisplay();
requestAnimationFrame(draw);
