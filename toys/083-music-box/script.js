/**
 * Music Box 音樂盒
 * Web Toys #083
 *
 * 經典音樂盒模擬器
 *
 * 技術重點：
 * - 音樂盒音色合成
 * - MIDI 樂譜播放
 * - 機械視覺效果
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('musicBoxCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    melody: 'twinkle',
    tempo: 80,
    reverb: 40,
    loop: true,
    volume: 0.5
};

// 音訊相關
let audioContext = null;
let masterGain = null;
let convolver = null;
let isPlaying = false;
let currentNoteIndex = 0;
let playTimeout = null;

// 視覺效果
let cylinderRotation = 0;
let activeNotes = [];
let sparkles = [];

// 旋律定義 (MIDI 音符, 持續時間)
const melodies = {
    twinkle: {
        name: '小星星',
        notes: [
            [60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2],
            [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2],
            [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2],
            [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2],
            [60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2],
            [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2]
        ]
    },
    canon: {
        name: '卡農',
        notes: [
            [67, 1], [64, 1], [65, 1], [62, 1], [63, 1], [60, 1], [63, 1], [62, 1],
            [67, 1], [69, 1], [71, 1], [67, 1], [65, 1], [64, 1], [65, 1], [62, 1],
            [60, 1], [62, 1], [64, 1], [60, 1], [59, 1], [60, 1], [62, 1], [59, 1],
            [67, 1], [64, 1], [65, 1], [62, 1], [63, 1], [60, 1], [63, 1], [62, 1]
        ]
    },
    furElise: {
        name: '乃愛麗絲',
        notes: [
            [76, 0.5], [75, 0.5], [76, 0.5], [75, 0.5], [76, 0.5], [71, 0.5], [74, 0.5], [72, 0.5],
            [69, 1], [0, 0.5], [60, 0.5], [64, 0.5], [69, 0.5], [71, 1], [0, 0.5], [64, 0.5],
            [68, 0.5], [71, 0.5], [72, 1], [0, 0.5], [64, 0.5], [76, 0.5], [75, 0.5], [76, 0.5],
            [75, 0.5], [76, 0.5], [71, 0.5], [74, 0.5], [72, 0.5], [69, 1]
        ]
    },
    moonlight: {
        name: '月光',
        notes: [
            [49, 1], [52, 1], [56, 1], [49, 1], [52, 1], [56, 1], [49, 1], [52, 1],
            [56, 1], [49, 1], [52, 1], [56, 1], [49, 1], [52, 1], [56, 1], [49, 1],
            [51, 1], [56, 1], [49, 1], [51, 1], [56, 1], [49, 1], [51, 1], [56, 1],
            [49, 1], [52, 1], [57, 1], [49, 1], [52, 1], [57, 1], [49, 1], [52, 1]
        ]
    },
    swan: {
        name: '天鵝湖',
        notes: [
            [69, 2], [68, 0.5], [69, 0.5], [71, 1], [69, 1], [68, 1], [66, 2],
            [64, 2], [66, 0.5], [68, 0.5], [69, 1], [68, 1], [66, 1], [64, 2],
            [69, 2], [68, 0.5], [69, 0.5], [71, 1], [73, 1], [71, 1], [69, 2],
            [68, 1], [66, 1], [68, 1], [69, 2]
        ]
    }
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

        createReverb();

        masterGain.connect(convolver);
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function createReverb() {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * 2;
    const impulse = audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            const decay = Math.exp(-i / (sampleRate * 0.8));
            data[i] = (Math.random() * 2 - 1) * decay;
        }
    }

    convolver = audioContext.createConvolver();
    convolver.buffer = impulse;

    const wetGain = audioContext.createGain();
    wetGain.gain.value = config.reverb / 100;
    convolver.connect(wetGain);
    wetGain.connect(audioContext.destination);

    const dryGain = audioContext.createGain();
    dryGain.gain.value = 1 - config.reverb / 200;
    masterGain.connect(dryGain);
    dryGain.connect(audioContext.destination);
}

// ==================== 音訊控制 ====================

function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

function playNote(midi, duration) {
    if (midi === 0) return; // 休止符

    const freq = midiToFreq(midi);

    // 音樂盒泛音
    const harmonics = [1, 2, 3, 4, 6];
    const decayTime = 1.5;

    harmonics.forEach((harmonic, i) => {
        const osc = audioContext.createOscillator();
        const oscGain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq * harmonic;

        // 音樂盒特有的尖銳起音
        const harmonicLevel = Math.pow(0.4, i);
        const now = audioContext.currentTime;

        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.15 * harmonicLevel, now + 0.001);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + decayTime);
    });

    // 金屬敲擊聲
    playChimeNoise(freq);

    // 視覺效果
    addActiveNote(midi);
    addSparkle();
}

function playChimeNoise(freq) {
    const noiseLength = 0.02;
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * noiseLength, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.05));
    }

    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.1;

    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = freq * 2;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    noiseSource.start();
}

function startMelody() {
    initAudio();

    isPlaying = true;
    currentNoteIndex = 0;

    document.getElementById('playBtn').textContent = '停止';
    document.getElementById('playBtn').classList.add('playing');
    document.getElementById('statusDisplay').textContent = '播放中';

    playNextNote();
}

function playNextNote() {
    if (!isPlaying) return;

    const melody = melodies[config.melody];
    const note = melody.notes[currentNoteIndex];

    if (note) {
        const [midi, duration] = note;
        playNote(midi, duration);

        const beatDuration = (60 / config.tempo) * 1000 * duration;

        currentNoteIndex++;

        if (currentNoteIndex >= melody.notes.length) {
            if (config.loop) {
                currentNoteIndex = 0;
            } else {
                stopMelody();
                return;
            }
        }

        playTimeout = setTimeout(playNextNote, beatDuration);
    }
}

function stopMelody() {
    isPlaying = false;

    if (playTimeout) {
        clearTimeout(playTimeout);
        playTimeout = null;
    }

    document.getElementById('playBtn').textContent = '播放';
    document.getElementById('playBtn').classList.remove('playing');
    document.getElementById('statusDisplay').textContent = '停止';
}

function toggleMelody() {
    if (isPlaying) {
        stopMelody();
    } else {
        startMelody();
    }
}

// ==================== 視覺效果 ====================

function addActiveNote(midi) {
    activeNotes.push({
        midi: midi,
        life: 1,
        y: canvas.height / 2 - (midi - 60) * 5
    });
}

function addSparkle() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < 3; i++) {
        sparkles.push({
            x: centerX + (Math.random() - 0.5) * 200,
            y: centerY + (Math.random() - 0.5) * 100,
            size: 2 + Math.random() * 3,
            life: 1,
            vy: -1 - Math.random() * 2
        });
    }
}

function draw() {
    const time = Date.now() / 1000;

    // 背景
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, '#2a1820');
    gradient.addColorStop(1, '#1a1015');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新滾筒旋轉
    if (isPlaying) {
        cylinderRotation += 0.02;
    }

    // 繪製音樂盒
    drawMusicBox(time);

    // 繪製音符
    drawActiveNotes();

    // 繪製閃光
    drawSparkles();

    requestAnimationFrame(draw);
}

function drawMusicBox(time) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 音樂盒底座
    ctx.fillStyle = '#4a3035';
    ctx.beginPath();
    ctx.roundRect(centerX - 200, centerY + 50, 400, 150, 10);
    ctx.fill();

    // 木紋
    ctx.strokeStyle = 'rgba(60, 40, 45, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
        const y = centerY + 70 + i * 12;
        ctx.beginPath();
        ctx.moveTo(centerX - 190, y);
        ctx.lineTo(centerX + 190, y);
        ctx.stroke();
    }

    // 滾筒
    drawCylinder(centerX, centerY, time);

    // 梳子（音梳）
    drawComb(centerX, centerY);

    // 裝飾邊框
    ctx.strokeStyle = '#8a6070';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(centerX - 200, centerY + 50, 400, 150, 10);
    ctx.stroke();

    // 金屬角落裝飾
    const corners = [
        [centerX - 195, centerY + 55],
        [centerX + 175, centerY + 55],
        [centerX - 195, centerY + 175],
        [centerX + 175, centerY + 175]
    ];

    corners.forEach(([x, y]) => {
        ctx.fillStyle = '#c8a0a8';
        ctx.beginPath();
        ctx.arc(x + 10, y + 10, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#a08088';
        ctx.beginPath();
        ctx.arc(x + 10, y + 10, 6, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawCylinder(centerX, centerY, time) {
    const cylinderWidth = 300;
    const cylinderHeight = 60;
    const y = centerY;

    // 滾筒陰影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX, y + cylinderHeight / 2 + 40, cylinderWidth / 2, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // 滾筒側面
    const cylinderGradient = ctx.createLinearGradient(
        centerX - cylinderWidth / 2, y,
        centerX + cylinderWidth / 2, y
    );
    cylinderGradient.addColorStop(0, '#a08088');
    cylinderGradient.addColorStop(0.3, '#d8b8c0');
    cylinderGradient.addColorStop(0.5, '#e8c8d0');
    cylinderGradient.addColorStop(0.7, '#d8b8c0');
    cylinderGradient.addColorStop(1, '#a08088');

    ctx.fillStyle = cylinderGradient;
    ctx.beginPath();
    ctx.ellipse(centerX, y - cylinderHeight / 2, cylinderWidth / 2, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(centerX - cylinderWidth / 2, y - cylinderHeight / 2, cylinderWidth, cylinderHeight);

    ctx.beginPath();
    ctx.ellipse(centerX, y + cylinderHeight / 2, cylinderWidth / 2, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // 滾筒上的凸點
    const melody = melodies[config.melody];
    const noteCount = melody.notes.length;

    for (let i = 0; i < noteCount; i++) {
        const [midi] = melody.notes[i];
        if (midi === 0) continue;

        const angle = (i / noteCount) * Math.PI * 2 + cylinderRotation;
        const noteY = y - 20 + (midi - 60) * 2;
        const noteX = centerX + Math.cos(angle) * (cylinderWidth / 2 - 10);

        if (Math.cos(angle) > 0) {
            const brightness = 0.5 + Math.cos(angle) * 0.5;
            ctx.fillStyle = `rgba(255, 220, 230, ${brightness})`;
            ctx.beginPath();
            ctx.arc(noteX, noteY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawComb(centerX, centerY) {
    const combX = centerX + 160;
    const combY = centerY;

    // 梳子底座
    ctx.fillStyle = '#6a5058';
    ctx.fillRect(combX, combY - 50, 30, 100);

    // 梳齒
    for (let i = 0; i < 20; i++) {
        const toothY = combY - 45 + i * 5;
        const toothLength = 20 + (20 - i) * 0.5;

        ctx.fillStyle = '#c8a8b0';
        ctx.fillRect(combX - toothLength, toothY, toothLength, 3);

        // 梳齒高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(combX - toothLength, toothY, toothLength, 1);
    }
}

function drawActiveNotes() {
    activeNotes.forEach((note, index) => {
        const x = canvas.width / 2 + 180;

        ctx.fillStyle = `rgba(255, 180, 200, ${note.life})`;
        ctx.beginPath();
        ctx.arc(x, note.y, 5 * note.life, 0, Math.PI * 2);
        ctx.fill();

        // 音符軌跡
        ctx.strokeStyle = `rgba(255, 180, 200, ${note.life * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, note.y);
        ctx.lineTo(x + 50 * note.life, note.y);
        ctx.stroke();

        note.life -= 0.02;

        if (note.life <= 0) {
            activeNotes.splice(index, 1);
        }
    });
}

function drawSparkles() {
    sparkles.forEach((sparkle, index) => {
        ctx.fillStyle = `rgba(255, 220, 230, ${sparkle.life})`;
        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.size * sparkle.life, 0, Math.PI * 2);
        ctx.fill();

        sparkle.y += sparkle.vy;
        sparkle.life -= 0.02;

        if (sparkle.life <= 0) {
            sparkles.splice(index, 1);
        }
    });
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('playBtn').addEventListener('click', toggleMelody);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        toggleMelody();
    }
});

document.getElementById('melody').addEventListener('change', (e) => {
    config.melody = e.target.value;
    document.getElementById('melodyDisplay').textContent = melodies[config.melody].name;

    if (isPlaying) {
        stopMelody();
        startMelody();
    }
});

document.getElementById('tempo').addEventListener('input', (e) => {
    config.tempo = parseInt(e.target.value);
    let tempoName = '';
    if (config.tempo < 60) tempoName = '慢';
    else if (config.tempo < 100) tempoName = '中等';
    else tempoName = '快';
    document.getElementById('tempoValue').textContent = tempoName;
});

document.getElementById('reverb').addEventListener('input', (e) => {
    config.reverb = parseInt(e.target.value);
    let reverbName = '';
    if (config.reverb < 30) reverbName = '少量';
    else if (config.reverb < 70) reverbName = '中等';
    else reverbName = '豐富';
    document.getElementById('reverbValue').textContent = reverbName;
});

document.getElementById('loop').addEventListener('change', (e) => {
    config.loop = e.target.checked;
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
