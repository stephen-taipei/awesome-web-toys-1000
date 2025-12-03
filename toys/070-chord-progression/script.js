/**
 * Chord Progression 和弦進行
 * Web Toys #070
 *
 * 和弦進行播放器
 *
 * 技術重點：
 * - 和弦音程計算
 * - 自動伴奏
 * - 調性轉換
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('chordCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    key: 'C',
    preset: 'pop',
    tempo: 80,
    voicing: 'piano'
};

// 音訊相關
let audioContext = null;
let masterGain = null;

// 和弦進行
let progression = [0, 4, 5, 3]; // I, V, vi, IV 對應音級
let currentChordIndex = 0;
let isPlaying = false;
let playInterval = null;

// 音樂理論
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const majorScale = [0, 2, 4, 5, 7, 9, 11];
const minorScale = [0, 2, 3, 5, 7, 8, 10];

// 和弦類型
const chordTypes = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
    dom7: [0, 4, 7, 10]
};

// 各調性的和弦
const scaleChords = {
    major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'dim'],
    minor: ['minor', 'dim', 'major', 'minor', 'minor', 'major', 'major']
};

const romanNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const minorRomanNumerals = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

// 預設進行
const presets = {
    pop: [0, 4, 5, 3],      // I-V-vi-IV
    jazz: [1, 4, 0],         // ii-V-I
    blues: [0, 3, 0, 4],     // I-IV-I-V
    rock: [0, 3, 4, 0],      // I-IV-V-I
    sad: [5, 3, 0, 4]        // vi-IV-I-V
};

// 視覺效果
let particles = [];

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    initAudio();
    createChordGrid();
    updateProgression();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(audioContext.destination);
}

// ==================== 和弦計算 ====================

function getKeyRoot(key) {
    const isMinor = key.endsWith('m');
    const noteName = isMinor ? key.slice(0, -1) : key;
    return noteNames.indexOf(noteName);
}

function isMinorKey(key) {
    return key.endsWith('m');
}

function getChordInfo(scaleIndex, key) {
    const root = getKeyRoot(key);
    const isMinor = isMinorKey(key);
    const scale = isMinor ? minorScale : majorScale;
    const chordTypeList = isMinor ? scaleChords.minor : scaleChords.major;
    const romanList = isMinor ? minorRomanNumerals : romanNumerals;

    const chordRoot = (root + scale[scaleIndex]) % 12;
    const chordType = chordTypeList[scaleIndex];
    const intervals = chordTypes[chordType];

    const notes = intervals.map(interval => (chordRoot + interval) % 12);
    const notesStr = notes.map(n => noteNames[n]).join(' - ');

    let chordName = noteNames[chordRoot];
    if (chordType === 'minor') chordName += 'm';
    else if (chordType === 'dim') chordName += 'dim';

    return {
        name: chordName,
        roman: romanList[scaleIndex],
        notes: notes,
        notesStr: notesStr,
        root: chordRoot
    };
}

function getChordFrequencies(notes, octave = 4) {
    return notes.map((note, i) => {
        const midiNote = note + (octave + Math.floor(i / 3)) * 12 + 12;
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    });
}

// ==================== 和弦格子 ====================

function createChordGrid() {
    const grid = document.getElementById('chordGrid');
    grid.innerHTML = '';

    for (let i = 0; i < 4; i++) {
        const slot = document.createElement('div');
        slot.className = 'chord-slot';
        slot.dataset.index = i;

        const nameEl = document.createElement('div');
        nameEl.className = 'chord-name';
        nameEl.textContent = '--';

        const romanEl = document.createElement('div');
        romanEl.className = 'chord-roman';
        romanEl.textContent = '--';

        slot.appendChild(nameEl);
        slot.appendChild(romanEl);

        slot.addEventListener('click', () => selectChordSlot(i));

        grid.appendChild(slot);
    }
}

function updateChordGrid() {
    const slots = document.querySelectorAll('.chord-slot');
    slots.forEach((slot, i) => {
        const chordInfo = getChordInfo(progression[i], config.key);
        slot.querySelector('.chord-name').textContent = chordInfo.name;
        slot.querySelector('.chord-roman').textContent = chordInfo.roman;
    });
}

function selectChordSlot(index) {
    // 顯示和弦選擇器或循環切換和弦
    const currentScaleIndex = progression[index];
    progression[index] = (currentScaleIndex + 1) % 7;
    updateChordGrid();

    // 預覽和弦
    const chordInfo = getChordInfo(progression[index], config.key);
    playChord(chordInfo.notes);
}

function updateProgression() {
    if (config.preset !== 'custom') {
        progression = [...presets[config.preset]];
    }
    updateChordGrid();
}

// ==================== 播放 ====================

function playChord(notes) {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const frequencies = getChordFrequencies(notes, 3);
    const now = audioContext.currentTime;

    frequencies.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        switch (config.voicing) {
            case 'piano':
                osc.type = 'triangle';
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.15, now + 0.3);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
                break;

            case 'pad':
                osc.type = 'sine';
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.2, now + 0.3);
                gain.gain.linearRampToValueAtTime(0.15, now + 1);
                gain.gain.linearRampToValueAtTime(0, now + 2);
                break;

            case 'organ':
                osc.type = 'square';
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
                gain.gain.linearRampToValueAtTime(0.08, now + 1.5);
                gain.gain.linearRampToValueAtTime(0.01, now + 1.8);
                break;
        }

        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 2);
    });

    // 視覺效果
    addParticles(notes);
}

function play() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (!isPlaying) {
        isPlaying = true;
        currentChordIndex = 0;
        playCurrentChord();

        const beatDuration = (60 / config.tempo) * 4 * 1000; // 每小節
        playInterval = setInterval(playCurrentChord, beatDuration);

        document.getElementById('playBtn').textContent = '暫停';
        document.getElementById('playBtn').classList.add('playing');
    } else {
        pause();
    }
}

function playCurrentChord() {
    const chordInfo = getChordInfo(progression[currentChordIndex], config.key);
    playChord(chordInfo.notes);

    // 更新顯示
    document.getElementById('currentChord').textContent = chordInfo.name;
    document.getElementById('chordNotes').textContent = chordInfo.notesStr;
    document.getElementById('barDisplay').textContent = currentChordIndex + 1;

    // 更新格子狀態
    const slots = document.querySelectorAll('.chord-slot');
    slots.forEach((slot, i) => {
        slot.classList.toggle('active', i === currentChordIndex);
        if (i === currentChordIndex) {
            slot.classList.add('playing');
            setTimeout(() => slot.classList.remove('playing'), 300);
        }
    });

    currentChordIndex = (currentChordIndex + 1) % progression.length;
}

function pause() {
    isPlaying = false;
    clearInterval(playInterval);
    document.getElementById('playBtn').textContent = '播放';
    document.getElementById('playBtn').classList.remove('playing');
}

function stop() {
    pause();
    currentChordIndex = 0;
    document.getElementById('currentChord').textContent = '--';
    document.getElementById('chordNotes').textContent = '--';
    document.getElementById('barDisplay').textContent = '1';

    const slots = document.querySelectorAll('.chord-slot');
    slots.forEach(slot => slot.classList.remove('active'));
}

// ==================== 視覺效果 ====================

function addParticles(notes) {
    notes.forEach(note => {
        const hue = (note / 12) * 360;
        for (let i = 0; i < 10; i++) {
            particles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 200,
                y: canvas.height / 2 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5 - 2,
                size: 5 + Math.random() * 10,
                hue: hue,
                life: 1
            });
        }
    });
}

function drawVisuals() {
    ctx.fillStyle = 'rgba(15, 10, 26, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製粒子
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.02;

        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
    }

    // 背景波紋
    if (isPlaying) {
        const time = Date.now() / 1000;
        const pulseSize = 100 + Math.sin(time * config.tempo / 30 * Math.PI) * 50;

        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, pulseSize
        );
        gradient.addColorStop(0, 'rgba(255, 100, 150, 0.2)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, pulseSize, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(drawVisuals);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('playBtn').addEventListener('click', play);
document.getElementById('stopBtn').addEventListener('click', stop);

document.getElementById('key').addEventListener('change', (e) => {
    config.key = e.target.value;
    document.getElementById('keyDisplay').textContent = config.key;
    updateChordGrid();
});

document.getElementById('preset').addEventListener('change', (e) => {
    config.preset = e.target.value;
    updateProgression();
});

document.getElementById('tempo').addEventListener('input', (e) => {
    config.tempo = parseInt(e.target.value);
    document.getElementById('tempoValue').textContent = config.tempo;

    if (isPlaying) {
        pause();
        play();
    }
});

document.getElementById('voicing').addEventListener('change', (e) => {
    config.voicing = e.target.value;
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(drawVisuals);
