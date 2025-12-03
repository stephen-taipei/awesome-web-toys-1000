/**
 * Synthesizer 合成器
 * Web Toys #067
 *
 * 虛擬鍵盤合成器
 *
 * 技術重點：
 * - Web Audio API 音源合成
 * - ADSR 包絡控制
 * - 多種波形選擇
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('synthCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    waveform: 'sine',
    octave: 4,
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.3,
    volume: 0.5
};

// 音訊相關
let audioContext = null;
let masterGain = null;
let activeOscillators = new Map();

// 音符定義
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const keyboardMap = {
    'a': 0,  // C
    'w': 1,  // C#
    's': 2,  // D
    'e': 3,  // D#
    'd': 4,  // E
    'f': 5,  // F
    't': 6,  // F#
    'g': 7,  // G
    'y': 8,  // G#
    'h': 9,  // A
    'u': 10, // A#
    'j': 11, // B
    'k': 12, // C+1
    'o': 13, // C#+1
    'l': 14  // D+1
};

// 視覺效果
let visualNotes = [];

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    createKeyboard();
    initAudio();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 200;
}

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = config.volume;
    masterGain.connect(audioContext.destination);
}

// ==================== 鍵盤生成 ====================

function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';

    const whiteKeys = [0, 2, 4, 5, 7, 9, 11, 12, 14]; // C, D, E, F, G, A, B, C, D
    const blackKeys = [1, 3, 6, 8, 10, 13]; // C#, D#, F#, G#, A#, C#

    // 白鍵
    whiteKeys.forEach((noteIndex, i) => {
        const key = document.createElement('div');
        key.className = 'key white';
        key.dataset.note = noteIndex;

        const label = document.createElement('span');
        label.className = 'key-label';
        const noteName = notes[noteIndex % 12];
        const keyChar = Object.keys(keyboardMap).find(k => keyboardMap[k] === noteIndex);
        label.textContent = keyChar ? keyChar.toUpperCase() : '';
        key.appendChild(label);

        key.addEventListener('mousedown', () => playNote(noteIndex));
        key.addEventListener('mouseup', () => stopNote(noteIndex));
        key.addEventListener('mouseleave', () => stopNote(noteIndex));
        key.addEventListener('touchstart', (e) => {
            e.preventDefault();
            playNote(noteIndex);
        });
        key.addEventListener('touchend', (e) => {
            e.preventDefault();
            stopNote(noteIndex);
        });

        keyboard.appendChild(key);
    });

    // 黑鍵
    blackKeys.forEach((noteIndex) => {
        const key = document.createElement('div');
        key.className = 'key black';
        key.dataset.note = noteIndex;

        const label = document.createElement('span');
        label.className = 'key-label';
        const keyChar = Object.keys(keyboardMap).find(k => keyboardMap[k] === noteIndex);
        label.textContent = keyChar ? keyChar.toUpperCase() : '';
        key.appendChild(label);

        key.addEventListener('mousedown', () => playNote(noteIndex));
        key.addEventListener('mouseup', () => stopNote(noteIndex));
        key.addEventListener('mouseleave', () => stopNote(noteIndex));
        key.addEventListener('touchstart', (e) => {
            e.preventDefault();
            playNote(noteIndex);
        });
        key.addEventListener('touchend', (e) => {
            e.preventDefault();
            stopNote(noteIndex);
        });

        keyboard.appendChild(key);
    });
}

// ==================== 音符計算 ====================

function noteToFrequency(noteIndex) {
    // A4 = 440Hz, MIDI note 69
    const midiNote = noteIndex + config.octave * 12 + 12; // C4 = MIDI 60
    return 440 * Math.pow(2, (midiNote - 69) / 12);
}

function getNoteName(noteIndex) {
    const octave = config.octave + Math.floor(noteIndex / 12);
    const note = notes[noteIndex % 12];
    return note + octave;
}

// ==================== 音符播放 ====================

function playNote(noteIndex) {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // 避免重複播放
    if (activeOscillators.has(noteIndex)) return;

    const frequency = noteToFrequency(noteIndex);
    const now = audioContext.currentTime;

    // 創建振盪器
    const oscillator = audioContext.createOscillator();
    oscillator.type = config.waveform;
    oscillator.frequency.value = frequency;

    // 創建增益節點（ADSR 包絡）
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;

    // ADSR
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + config.attack);
    gainNode.gain.linearRampToValueAtTime(config.sustain, now + config.attack + config.decay);

    // 連接
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);

    oscillator.start(now);

    activeOscillators.set(noteIndex, { oscillator, gainNode });

    // 更新 UI
    updateKeyVisual(noteIndex, true);
    document.getElementById('noteDisplay').textContent = getNoteName(noteIndex);
    document.getElementById('freqDisplay').textContent = frequency.toFixed(2) + ' Hz';

    // 添加視覺效果
    addVisualNote(noteIndex, frequency);
}

function stopNote(noteIndex) {
    const active = activeOscillators.get(noteIndex);
    if (!active) return;

    const { oscillator, gainNode } = active;
    const now = audioContext.currentTime;

    // Release
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, now + config.release);

    oscillator.stop(now + config.release + 0.1);

    activeOscillators.delete(noteIndex);

    // 更新 UI
    updateKeyVisual(noteIndex, false);

    if (activeOscillators.size === 0) {
        document.getElementById('noteDisplay').textContent = '--';
        document.getElementById('freqDisplay').textContent = '-- Hz';
    }
}

function updateKeyVisual(noteIndex, active) {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        if (parseInt(key.dataset.note) === noteIndex) {
            key.classList.toggle('active', active);
        }
    });
}

// ==================== 視覺效果 ====================

function addVisualNote(noteIndex, frequency) {
    const hue = (noteIndex % 12) * 30;
    visualNotes.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        maxRadius: 100 + (12 - noteIndex % 12) * 20,
        hue: hue,
        frequency: frequency,
        opacity: 1,
        rings: []
    });
}

function drawVisuals() {
    ctx.fillStyle = 'rgba(15, 10, 26, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製活躍音符
    for (const [noteIndex, active] of activeOscillators) {
        const frequency = active.oscillator.frequency.value;
        const hue = (noteIndex % 12) * 30;
        const x = canvas.width / 2;
        const y = canvas.height / 2;

        // 動態光環
        const time = audioContext.currentTime;
        const pulseRadius = 50 + Math.sin(time * frequency / 50) * 30;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseRadius);
        gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.8)`);
        gradient.addColorStop(0.5, `hsla(${hue}, 80%, 50%, 0.4)`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
        ctx.fill();

        // 波形可視化
        drawWaveform(hue, frequency);
    }

    // 繪製擴散效果
    for (let i = visualNotes.length - 1; i >= 0; i--) {
        const note = visualNotes[i];
        note.radius += 3;
        note.opacity -= 0.02;

        if (note.opacity <= 0) {
            visualNotes.splice(i, 1);
            continue;
        }

        ctx.strokeStyle = `hsla(${note.hue}, 80%, 60%, ${note.opacity})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(note.x, note.y, note.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawWaveform(hue, frequency) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = audioContext.currentTime;
    const points = 100;
    const radius = 150;

    ctx.strokeStyle = `hsla(${hue}, 80%, 70%, 0.6)`;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        let waveValue = 0;

        switch (config.waveform) {
            case 'sine':
                waveValue = Math.sin(angle * 4 + time * frequency / 20);
                break;
            case 'square':
                waveValue = Math.sign(Math.sin(angle * 4 + time * frequency / 20));
                break;
            case 'sawtooth':
                waveValue = ((angle * 4 + time * frequency / 20) % (Math.PI * 2)) / Math.PI - 1;
                break;
            case 'triangle':
                waveValue = Math.abs(((angle * 4 + time * frequency / 20) % (Math.PI * 2)) / Math.PI - 1) * 2 - 1;
                break;
        }

        const r = radius + waveValue * 30;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();
    ctx.stroke();
}

function animate() {
    drawVisuals();
    requestAnimationFrame(animate);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const noteIndex = keyboardMap[e.key.toLowerCase()];
    if (noteIndex !== undefined) {
        playNote(noteIndex);
    }
});

document.addEventListener('keyup', (e) => {
    const noteIndex = keyboardMap[e.key.toLowerCase()];
    if (noteIndex !== undefined) {
        stopNote(noteIndex);
    }
});

document.getElementById('waveform').addEventListener('change', (e) => {
    config.waveform = e.target.value;
});

document.getElementById('octave').addEventListener('input', (e) => {
    config.octave = parseInt(e.target.value);
    document.getElementById('octaveValue').textContent = config.octave;
});

document.getElementById('attack').addEventListener('input', (e) => {
    config.attack = parseFloat(e.target.value);
    document.getElementById('attackValue').textContent = config.attack.toFixed(2);
});

document.getElementById('decay').addEventListener('input', (e) => {
    config.decay = parseFloat(e.target.value);
    document.getElementById('decayValue').textContent = config.decay.toFixed(2);
});

document.getElementById('sustain').addEventListener('input', (e) => {
    config.sustain = parseFloat(e.target.value);
    document.getElementById('sustainValue').textContent = config.sustain.toFixed(2);
});

document.getElementById('release').addEventListener('input', (e) => {
    config.release = parseFloat(e.target.value);
    document.getElementById('releaseValue').textContent = config.release.toFixed(2);
});

document.getElementById('volume').addEventListener('input', (e) => {
    config.volume = parseInt(e.target.value) / 100;
    document.getElementById('volumeValue').textContent = e.target.value;
    if (masterGain) {
        masterGain.gain.value = config.volume;
    }
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(animate);
