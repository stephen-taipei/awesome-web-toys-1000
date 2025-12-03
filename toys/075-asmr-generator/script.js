/**
 * ASMR Generator ASMR 產生器
 * Web Toys #075
 *
 * 多種 ASMR 音效混合器
 *
 * 技術重點：
 * - 程序化音效生成
 * - 多層音效混合
 * - 立體聲平移
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('asmrCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    masterVolume: 0.5,
    panning: 'center',
    timer: 0
};

// 音訊相關
let audioContext = null;
let masterGain = null;
let pannerNode = null;
let sounds = {};
let isInitialized = false;

// 定時器
let timerEndTime = 0;
let timerInterval = null;

// 平移動畫
let panningPhase = 0;

// 視覺效果
let particles = [];

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    setupEventListeners();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initAudio() {
    if (isInitialized) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioContext.createGain();
    masterGain.gain.value = config.masterVolume;

    // 立體聲平移
    pannerNode = audioContext.createStereoPanner();
    pannerNode.pan.value = 0;

    masterGain.connect(pannerNode);
    pannerNode.connect(audioContext.destination);

    isInitialized = true;
}

// ==================== 音效生成 ====================

function createSound(type) {
    if (!audioContext) initAudio();

    const sound = {
        type: type,
        gain: audioContext.createGain(),
        nodes: [],
        active: false,
        volume: 0
    };

    sound.gain.connect(masterGain);

    switch (type) {
        case 'crackling':
            createCracklingSound(sound);
            break;
        case 'typing':
            createTypingSound(sound);
            break;
        case 'paper':
            createPaperSound(sound);
            break;
        case 'breathing':
            createBreathingSound(sound);
            break;
        case 'tapping':
            createTappingSound(sound);
            break;
        case 'brushing':
            createBrushingSound(sound);
            break;
        case 'whisper':
            createWhisperSound(sound);
            break;
        case 'scratching':
            createScratchingSound(sound);
            break;
    }

    return sound;
}

function createCracklingSound(sound) {
    // 火焰劈啪聲 - 使用濾波噪音和隨機脈衝
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        // 基礎噪音
        let sample = (Math.random() * 2 - 1) * 0.1;

        // 隨機劈啪
        if (Math.random() < 0.001) {
            sample += (Math.random() * 2 - 1) * 0.8;
        }

        data[i] = sample;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 0.5;

    source.connect(filter);
    filter.connect(sound.gain);
    source.start();

    sound.nodes.push(source, filter);
}

function createTypingSound(sound) {
    // 打字聲 - 隨機節奏的點擊
    function scheduleClick() {
        if (!sound.active) return;

        const osc = audioContext.createOscillator();
        const clickGain = audioContext.createGain();

        osc.type = 'square';
        osc.frequency.value = 200 + Math.random() * 300;

        clickGain.gain.setValueAtTime(0.3, audioContext.currentTime);
        clickGain.gain.exponentialDecayTo = 0.001;
        clickGain.gain.setTargetAtTime(0.001, audioContext.currentTime, 0.02);

        osc.connect(clickGain);
        clickGain.connect(sound.gain);

        osc.start();
        osc.stop(audioContext.currentTime + 0.05);

        const nextClick = 50 + Math.random() * 200;
        setTimeout(scheduleClick, nextClick);
    }

    sound.startTyping = scheduleClick;
}

function createPaperSound(sound) {
    // 紙張翻動聲 - 濾波噪音
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = 0.5;
    lfoGain.gain.value = 1000;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    source.connect(filter);
    filter.connect(sound.gain);
    source.start();

    sound.nodes.push(source, filter, lfo, lfoGain);
}

function createBreathingSound(sound) {
    // 呼吸聲 - 緩慢的濾波噪音
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;

    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = 0.15; // 呼吸頻率
    lfoGain.gain.value = 400;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // 音量呼吸調製
    const volumeLfo = audioContext.createOscillator();
    const volumeLfoGain = audioContext.createGain();
    volumeLfo.frequency.value = 0.15;
    volumeLfoGain.gain.value = 0.5;

    volumeLfo.connect(volumeLfoGain);
    volumeLfoGain.connect(sound.gain.gain);
    volumeLfo.start();

    source.connect(filter);
    filter.connect(sound.gain);
    source.start();

    sound.nodes.push(source, filter, lfo, lfoGain, volumeLfo, volumeLfoGain);
}

function createTappingSound(sound) {
    // 敲擊聲 - 隨機節奏
    function scheduleTap() {
        if (!sound.active) return;

        const osc = audioContext.createOscillator();
        const tapGain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = 150 + Math.random() * 100;

        tapGain.gain.setValueAtTime(0.4, audioContext.currentTime);
        tapGain.gain.setTargetAtTime(0.001, audioContext.currentTime, 0.03);

        osc.connect(tapGain);
        tapGain.connect(sound.gain);

        osc.start();
        osc.stop(audioContext.currentTime + 0.08);

        const nextTap = 200 + Math.random() * 500;
        setTimeout(scheduleTap, nextTap);
    }

    sound.startTapping = scheduleTap;
}

function createBrushingSound(sound) {
    // 刷子聲 - 高頻濾波噪音
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.3;

    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = 2;
    lfoGain.gain.value = 0.3;

    lfo.connect(lfoGain);
    lfoGain.connect(sound.gain.gain);
    lfo.start();

    source.connect(filter);
    filter.connect(sound.gain);
    source.start();

    sound.nodes.push(source, filter, lfo, lfoGain);
}

function createWhisperSound(sound) {
    // 低語聲 - 濾波白噪音加調製
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500;
    filter.Q.value = 1;

    // 語調變化
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = 0.3;
    lfoGain.gain.value = 500;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    source.connect(filter);
    filter.connect(sound.gain);
    source.start();

    sound.nodes.push(source, filter, lfo, lfoGain);
}

function createScratchingSound(sound) {
    // 摩擦聲 - 粗糙噪音
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    let lastValue = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastValue + white * 0.3) / 1.1;
        lastValue = data[i];
        data[i] *= 0.5;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;

    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = 1.5;
    lfoGain.gain.value = 500;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    source.connect(filter);
    filter.connect(sound.gain);
    source.start();

    sound.nodes.push(source, filter, lfo, lfoGain);
}

// ==================== 音效控制 ====================

function setSoundVolume(type, volume) {
    if (!sounds[type]) {
        sounds[type] = createSound(type);
    }

    const sound = sounds[type];
    sound.volume = volume;
    sound.gain.gain.setValueAtTime(volume, audioContext.currentTime);

    if (volume > 0 && !sound.active) {
        sound.active = true;
        if (sound.startTyping) sound.startTyping();
        if (sound.startTapping) sound.startTapping();
    } else if (volume === 0) {
        sound.active = false;
    }

    updateActiveCount();
}

function updateActiveCount() {
    let count = 0;
    for (const type in sounds) {
        if (sounds[type].volume > 0) count++;
    }
    document.getElementById('activeCount').textContent = count;
}

// ==================== 立體聲平移 ====================

function updatePanning() {
    if (!pannerNode) return;

    switch (config.panning) {
        case 'center':
            pannerNode.pan.setValueAtTime(0, audioContext.currentTime);
            break;
        case 'left':
            pannerNode.pan.setValueAtTime(-0.7, audioContext.currentTime);
            break;
        case 'right':
            pannerNode.pan.setValueAtTime(0.7, audioContext.currentTime);
            break;
        case 'moving':
            // 由動畫循環處理
            break;
    }
}

// ==================== 定時器 ====================

function startTimer() {
    timerEndTime = Date.now() + config.timer * 60 * 1000;

    timerInterval = setInterval(() => {
        const remaining = timerEndTime - Date.now();

        if (remaining <= 0) {
            stopAllSounds();
            clearInterval(timerInterval);
            timerInterval = null;
            document.getElementById('timerDisplay').textContent = '';
            document.getElementById('timerInfo').textContent = '';
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timerDisplay').textContent = timeStr;
        document.getElementById('timerInfo').textContent = `剩餘: ${timeStr}`;
    }, 1000);
}

function stopAllSounds() {
    document.querySelectorAll('.sound-volume').forEach(slider => {
        slider.value = 0;
        const soundItem = slider.closest('.sound-item');
        const type = soundItem.dataset.sound;
        if (sounds[type]) {
            sounds[type].volume = 0;
            sounds[type].gain.gain.setValueAtTime(0, audioContext.currentTime);
            sounds[type].active = false;
        }
        soundItem.classList.remove('active');
    });
    updateActiveCount();
}

// ==================== 視覺效果 ====================

function draw() {
    ctx.fillStyle = 'rgba(15, 10, 20, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 移動平移
    if (config.panning === 'moving' && pannerNode) {
        panningPhase += 0.01;
        const panValue = Math.sin(panningPhase) * 0.8;
        pannerNode.pan.setValueAtTime(panValue, audioContext.currentTime);
    }

    drawVisualizations();

    requestAnimationFrame(draw);
}

function drawVisualizations() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() / 1000;

    // 為每個活躍音效繪製視覺效果
    let activeIndex = 0;
    for (const type in sounds) {
        const sound = sounds[type];
        if (sound.volume > 0) {
            drawSoundVisualization(type, sound.volume, activeIndex, time);
            activeIndex++;
        }
    }

    // 中央脈動
    let totalVolume = 0;
    for (const type in sounds) {
        totalVolume += sounds[type].volume || 0;
    }

    if (totalVolume > 0) {
        const pulseSize = 50 + totalVolume * 100 + Math.sin(time * 2) * 20;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
        gradient.addColorStop(0, `rgba(200, 150, 255, ${totalVolume * 0.15})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSoundVisualization(type, volume, index, time) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const colors = {
        crackling: 'rgba(255, 150, 100,',
        typing: 'rgba(100, 200, 255,',
        paper: 'rgba(255, 255, 200,',
        breathing: 'rgba(150, 255, 200,',
        tapping: 'rgba(255, 200, 150,',
        brushing: 'rgba(200, 150, 255,',
        whisper: 'rgba(255, 150, 200,',
        scratching: 'rgba(200, 200, 150,'
    };

    const color = colors[type] || 'rgba(255, 255, 255,';
    const angle = (index / 8) * Math.PI * 2 + time * 0.2;
    const distance = 150 + Math.sin(time * 3 + index) * 30;

    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    // 粒子效果
    const particleCount = Math.floor(volume * 5);
    for (let i = 0; i < particleCount; i++) {
        const px = x + (Math.random() - 0.5) * 60;
        const py = y + (Math.random() - 0.5) * 60;
        const size = Math.random() * 3 + 1;
        const alpha = Math.random() * volume * 0.5;

        ctx.fillStyle = color + alpha + ')';
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 光暈
    const glowSize = 30 + volume * 40;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
    gradient.addColorStop(0, color + (volume * 0.3) + ')');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, glowSize, 0, Math.PI * 2);
    ctx.fill();
}

// ==================== 事件處理 ====================

function setupEventListeners() {
    window.addEventListener('resize', resizeCanvas);

    // 音效音量控制
    document.querySelectorAll('.sound-item').forEach(item => {
        const slider = item.querySelector('.sound-volume');
        const type = item.dataset.sound;

        slider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value) / 100;
            setSoundVolume(type, volume);

            if (volume > 0) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    });

    // 主音量
    document.getElementById('masterVolume').addEventListener('input', (e) => {
        config.masterVolume = parseInt(e.target.value) / 100;
        document.getElementById('masterVolumeValue').textContent = e.target.value;

        if (masterGain) {
            masterGain.gain.setValueAtTime(config.masterVolume, audioContext.currentTime);
        }
    });

    // 立體聲平移
    document.getElementById('panning').addEventListener('change', (e) => {
        config.panning = e.target.value;
        updatePanning();
    });

    // 定時器
    document.getElementById('timer').addEventListener('change', (e) => {
        config.timer = parseInt(e.target.value);

        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        if (config.timer > 0) {
            startTimer();
        } else {
            document.getElementById('timerDisplay').textContent = '';
            document.getElementById('timerInfo').textContent = '';
        }
    });
}

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
