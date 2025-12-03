/**
 * Forest Sounds 森林聲
 * Web Toys #078
 *
 * 森林環境音效模擬器
 *
 * 技術重點：
 * - 多層環境音效
 * - 時段變化
 * - 程序化自然聲合成
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('forestCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    timeOfDay: 'day',
    density: 50,
    birds: true,
    insects: true,
    stream: false,
    wind: true,
    volume: 0.5,
    timer: 0
};

// 音訊相關
let audioContext = null;
let masterGain = null;
let windNode = null;
let streamNode = null;
let insectNode = null;
let isPlaying = false;

// 鳥鳴定時器
let birdTimeout = null;

// 定時器
let timerEndTime = 0;
let timerInterval = null;

// 視覺元素
let trees = [];
let leaves = [];
let fireflies = [];

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    createTrees();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createTrees();
}

function createTrees() {
    trees = [];
    const treeCount = Math.floor(10 + config.density / 5);

    for (let i = 0; i < treeCount; i++) {
        trees.push({
            x: Math.random() * canvas.width,
            height: 100 + Math.random() * 200,
            width: 30 + Math.random() * 40,
            layer: Math.floor(Math.random() * 3)
        });
    }

    trees.sort((a, b) => a.layer - b.layer);
}

// ==================== 音訊控制 ====================

function startForest() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    masterGain = audioContext.createGain();
    masterGain.gain.value = config.volume;
    masterGain.connect(audioContext.destination);

    // 根據設定創建音效
    if (config.wind) createWindSound();
    if (config.stream) createStreamSound();
    if (config.insects) createInsectSound();
    if (config.birds) scheduleBird();

    isPlaying = true;

    if (config.timer > 0) {
        startTimer();
    }

    document.getElementById('playBtn').textContent = '離開森林';
    document.getElementById('playBtn').classList.add('playing');
    document.getElementById('statusDisplay').textContent = '播放中';
    updateEnvDisplay();
}

function createWindSound() {
    const bufferSize = audioContext.sampleRate * 3;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        let lastValue = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            lastValue = (lastValue + white * 0.02) / 1.02;
            data[i] = lastValue * 1.5;
        }
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // 樹葉沙沙濾波
    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1500;
    bandpass.Q.value = 0.5;

    // LFO 調製
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = 0.3;
    lfoGain.gain.value = 500;

    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);
    lfo.start();

    const windGain = audioContext.createGain();
    windGain.gain.value = 0.2 * (config.density / 50);

    source.connect(bandpass);
    bandpass.connect(windGain);
    windGain.connect(masterGain);

    source.start();

    windNode = { source, lfo, gain: windGain };
}

function createStreamSound() {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;

            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;

            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;

            // 水流泡泡聲
            if (Math.random() < 0.001) {
                data[i] += (Math.random() * 2 - 1) * 0.3;
            }
        }
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 500;

    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 3000;

    const streamGain = audioContext.createGain();
    streamGain.gain.value = 0.15;

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(streamGain);
    streamGain.connect(masterGain);

    source.start();

    streamNode = { source, gain: streamGain };
}

function createInsectSound() {
    // 根據時段調整蟲鳴
    const isNight = config.timeOfDay === 'night' || config.timeOfDay === 'evening';

    if (isNight) {
        // 夜晚蟋蟀聲
        createCricketSound();
    } else {
        // 白天蟬鳴
        createCicadaSound();
    }
}

function createCricketSound() {
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 4000;

    // 快速開關創造蟋蟀聲
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.type = 'square';
    lfo.frequency.value = 20;
    lfoGain.gain.value = 1;

    const insectGain = audioContext.createGain();
    insectGain.gain.value = 0;

    lfo.connect(lfoGain);
    lfoGain.connect(insectGain.gain);

    osc.connect(insectGain);
    insectGain.connect(masterGain);

    // 間歇性播放
    const masterInsectGain = audioContext.createGain();
    masterInsectGain.gain.value = 0.05;

    insectGain.connect(masterInsectGain);
    masterInsectGain.connect(masterGain);

    osc.start();
    lfo.start();

    // 隨機開關
    function toggleCricket() {
        if (!isPlaying) return;
        const on = Math.random() > 0.3;
        masterInsectGain.gain.setValueAtTime(on ? 0.05 : 0, audioContext.currentTime);
        setTimeout(toggleCricket, 500 + Math.random() * 2000);
    }
    toggleCricket();

    insectNode = { osc, lfo, gain: masterInsectGain };
}

function createCicadaSound() {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        const t = i / audioContext.sampleRate;
        // 蟬鳴是高頻振動
        const carrier = Math.sin(t * 8000 * Math.PI * 2);
        const modulator = Math.sin(t * 100 * Math.PI * 2);
        data[i] = carrier * (0.5 + modulator * 0.5) * 0.1;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 5000;
    bandpass.Q.value = 2;

    const insectGain = audioContext.createGain();
    insectGain.gain.value = 0.08;

    source.connect(bandpass);
    bandpass.connect(insectGain);
    insectGain.connect(masterGain);

    source.start();

    insectNode = { source, gain: insectGain };
}

function scheduleBird() {
    if (!isPlaying || !config.birds) return;

    // 根據時段調整鳥鳴頻率
    let minDelay, maxDelay;
    switch (config.timeOfDay) {
        case 'morning':
            minDelay = 1000;
            maxDelay = 4000;
            break;
        case 'day':
            minDelay = 2000;
            maxDelay = 8000;
            break;
        case 'evening':
            minDelay = 3000;
            maxDelay = 10000;
            break;
        case 'night':
            minDelay = 10000;
            maxDelay = 30000;
            break;
    }

    const delay = minDelay + Math.random() * (maxDelay - minDelay);

    birdTimeout = setTimeout(() => {
        playBirdCall();
        scheduleBird();
    }, delay);
}

function playBirdCall() {
    if (!audioContext || !isPlaying) return;

    const birdType = Math.floor(Math.random() * 4);
    const duration = 0.2 + Math.random() * 0.5;
    const baseFreq = 1500 + Math.random() * 2000;

    const osc = audioContext.createOscillator();
    const birdGain = audioContext.createGain();

    osc.type = 'sine';

    // 不同鳥叫類型
    switch (birdType) {
        case 0: // 上升音調
            osc.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
            osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, audioContext.currentTime + duration);
            break;
        case 1: // 下降音調
            osc.frequency.setValueAtTime(baseFreq * 1.5, audioContext.currentTime);
            osc.frequency.linearRampToValueAtTime(baseFreq, audioContext.currentTime + duration);
            break;
        case 2: // 顫音
            osc.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
            for (let i = 0; i < 5; i++) {
                const t = audioContext.currentTime + (i / 5) * duration;
                osc.frequency.setValueAtTime(baseFreq + (i % 2) * 200, t);
            }
            break;
        case 3: // 雙音
            osc.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
            osc.frequency.setValueAtTime(baseFreq * 1.2, audioContext.currentTime + duration * 0.5);
            break;
    }

    birdGain.gain.setValueAtTime(0, audioContext.currentTime);
    birdGain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.02);
    birdGain.gain.setValueAtTime(0.1, audioContext.currentTime + duration - 0.02);
    birdGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

    const panner = audioContext.createStereoPanner();
    panner.pan.value = Math.random() * 2 - 1;

    osc.connect(birdGain);
    birdGain.connect(panner);
    panner.connect(masterGain);

    osc.start();
    osc.stop(audioContext.currentTime + duration);
}

function stopForest() {
    if (windNode) {
        if (windNode.source) windNode.source.stop();
        if (windNode.lfo) windNode.lfo.stop();
        windNode = null;
    }

    if (streamNode) {
        if (streamNode.source) streamNode.source.stop();
        streamNode = null;
    }

    if (insectNode) {
        if (insectNode.source) insectNode.source.stop();
        if (insectNode.osc) insectNode.osc.stop();
        if (insectNode.lfo) insectNode.lfo.stop();
        insectNode = null;
    }

    if (birdTimeout) {
        clearTimeout(birdTimeout);
        birdTimeout = null;
    }

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        document.getElementById('timerDisplay').textContent = '';
    }

    isPlaying = false;

    document.getElementById('playBtn').textContent = '進入森林';
    document.getElementById('playBtn').classList.remove('playing');
    document.getElementById('statusDisplay').textContent = '停止';
}

function toggleForest() {
    if (isPlaying) {
        stopForest();
    } else {
        startForest();
    }
}

function updateEnvDisplay() {
    const timeNames = {
        morning: '清晨',
        day: '白天',
        evening: '黃昏',
        night: '夜晚'
    };
    document.getElementById('envDisplay').textContent = `森林 - ${timeNames[config.timeOfDay]}`;
}

function getDensityName(value) {
    if (value < 30) return '稀疏';
    if (value < 70) return '中等';
    return '茂密';
}

// ==================== 定時器 ====================

function startTimer() {
    timerEndTime = Date.now() + config.timer * 60 * 1000;

    timerInterval = setInterval(() => {
        const remaining = timerEndTime - Date.now();

        if (remaining <= 0) {
            stopForest();
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

    drawBackground(time);
    drawTrees(time);
    drawForeground(time);

    if (isPlaying) {
        updateLeaves(time);
        drawLeaves();

        if (config.timeOfDay === 'night') {
            updateFireflies(time);
            drawFireflies();
        }
    }

    requestAnimationFrame(draw);
}

function drawBackground(time) {
    let gradient;

    switch (config.timeOfDay) {
        case 'morning':
            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#4a6080');
            gradient.addColorStop(0.5, '#7090a0');
            gradient.addColorStop(1, '#203020');
            break;
        case 'day':
            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#4080a0');
            gradient.addColorStop(0.5, '#60a080');
            gradient.addColorStop(1, '#203020');
            break;
        case 'evening':
            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#804060');
            gradient.addColorStop(0.5, '#604030');
            gradient.addColorStop(1, '#1a2018');
            break;
        case 'night':
            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#101520');
            gradient.addColorStop(0.5, '#0a1510');
            gradient.addColorStop(1, '#050a08');
            break;
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 星星（夜晚）
    if (config.timeOfDay === 'night') {
        for (let i = 0; i < 100; i++) {
            const x = (Math.sin(i * 0.7) + 1) / 2 * canvas.width;
            const y = (Math.cos(i * 1.3) + 1) / 2 * canvas.height * 0.4;
            const twinkle = 0.2 + Math.sin(time * 2 + i) * 0.15;

            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 太陽/月亮
    if (config.timeOfDay === 'morning' || config.timeOfDay === 'day') {
        const sunX = canvas.width * 0.8;
        const sunY = canvas.height * 0.15;
        const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 50);
        sunGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        sunGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)');
        sunGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 50, 0, Math.PI * 2);
        ctx.fill();
    } else if (config.timeOfDay === 'night') {
        const moonX = canvas.width * 0.7;
        const moonY = canvas.height * 0.1;
        ctx.fillStyle = 'rgba(200, 220, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 25, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawTrees(time) {
    trees.forEach((tree, index) => {
        const layerAlpha = 0.3 + tree.layer * 0.25;
        const sway = isPlaying ? Math.sin(time + index) * 3 : 0;

        // 樹幹
        ctx.fillStyle = `rgba(60, 40, 30, ${layerAlpha})`;
        ctx.fillRect(
            tree.x - tree.width / 6,
            canvas.height - tree.height,
            tree.width / 3,
            tree.height
        );

        // 樹冠
        const crownColor = config.timeOfDay === 'night'
            ? `rgba(20, 40, 30, ${layerAlpha})`
            : `rgba(40, 80, 40, ${layerAlpha})`;

        ctx.fillStyle = crownColor;
        ctx.beginPath();
        ctx.moveTo(tree.x + sway, canvas.height - tree.height - tree.width);
        ctx.lineTo(tree.x - tree.width / 2, canvas.height - tree.height + 20);
        ctx.lineTo(tree.x + tree.width / 2, canvas.height - tree.height + 20);
        ctx.closePath();
        ctx.fill();

        // 第二層樹冠
        ctx.beginPath();
        ctx.moveTo(tree.x + sway * 0.5, canvas.height - tree.height - tree.width * 0.6);
        ctx.lineTo(tree.x - tree.width * 0.4, canvas.height - tree.height - tree.width * 0.2);
        ctx.lineTo(tree.x + tree.width * 0.4, canvas.height - tree.height - tree.width * 0.2);
        ctx.closePath();
        ctx.fill();
    });
}

function drawForeground(time) {
    // 地面
    const groundGradient = ctx.createLinearGradient(0, canvas.height - 50, 0, canvas.height);
    groundGradient.addColorStop(0, 'rgba(30, 50, 30, 0.8)');
    groundGradient.addColorStop(1, 'rgba(20, 35, 20, 1)');

    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // 草地
    if (config.timeOfDay !== 'night') {
        for (let x = 0; x < canvas.width; x += 10) {
            const grassHeight = 10 + Math.random() * 15;
            const sway = isPlaying ? Math.sin(time * 2 + x * 0.1) * 2 : 0;

            ctx.strokeStyle = 'rgba(60, 100, 50, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 50);
            ctx.quadraticCurveTo(
                x + sway,
                canvas.height - 50 - grassHeight / 2,
                x + sway * 2,
                canvas.height - 50 - grassHeight
            );
            ctx.stroke();
        }
    }
}

function updateLeaves(time) {
    // 添加新葉子
    if (config.wind && Math.random() < 0.05) {
        leaves.push({
            x: Math.random() * canvas.width,
            y: -10,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            speedX: 1 + Math.random() * 2,
            speedY: 1 + Math.random() * 2,
            size: 5 + Math.random() * 5
        });
    }

    // 更新葉子
    leaves.forEach((leaf, index) => {
        leaf.x += leaf.speedX;
        leaf.y += leaf.speedY + Math.sin(time * 3 + leaf.x * 0.01) * 0.5;
        leaf.rotation += leaf.rotationSpeed;

        if (leaf.y > canvas.height || leaf.x > canvas.width) {
            leaves.splice(index, 1);
        }
    });

    // 限制葉子數量
    while (leaves.length > 50) {
        leaves.shift();
    }
}

function drawLeaves() {
    ctx.fillStyle = config.timeOfDay === 'night'
        ? 'rgba(30, 50, 30, 0.6)'
        : 'rgba(80, 120, 60, 0.7)';

    leaves.forEach(leaf => {
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rotation);
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.size, leaf.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function updateFireflies(time) {
    // 添加新螢火蟲
    if (Math.random() < 0.02 && fireflies.length < 30) {
        fireflies.push({
            x: Math.random() * canvas.width,
            y: canvas.height * 0.5 + Math.random() * canvas.height * 0.3,
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 0.5
        });
    }

    // 更新螢火蟲
    fireflies.forEach((fly, index) => {
        fly.x += Math.sin(time + fly.phase) * fly.speed;
        fly.y += Math.cos(time * 0.7 + fly.phase) * fly.speed * 0.5;

        if (fly.x < 0 || fly.x > canvas.width || fly.y < 0 || fly.y > canvas.height) {
            fireflies.splice(index, 1);
        }
    });
}

function drawFireflies() {
    const time = Date.now() / 1000;

    fireflies.forEach(fly => {
        const glow = (Math.sin(time * 3 + fly.phase) + 1) / 2;

        const gradient = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, 10 * glow + 5);
        gradient.addColorStop(0, `rgba(200, 255, 100, ${glow * 0.8})`);
        gradient.addColorStop(0.5, `rgba(150, 200, 50, ${glow * 0.3})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, 10 * glow + 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('playBtn').addEventListener('click', toggleForest);

document.getElementById('timeOfDay').addEventListener('change', (e) => {
    config.timeOfDay = e.target.value;
    updateEnvDisplay();

    if (isPlaying) {
        // 重新創建蟲鳴
        if (insectNode) {
            if (insectNode.source) insectNode.source.stop();
            if (insectNode.osc) insectNode.osc.stop();
            if (insectNode.lfo) insectNode.lfo.stop();
            insectNode = null;
        }
        if (config.insects) createInsectSound();
    }
});

document.getElementById('density').addEventListener('input', (e) => {
    config.density = parseInt(e.target.value);
    document.getElementById('densityValue').textContent = getDensityName(config.density);
    createTrees();

    if (isPlaying && windNode && windNode.gain) {
        windNode.gain.gain.value = 0.2 * (config.density / 50);
    }
});

document.getElementById('birds').addEventListener('change', (e) => {
    config.birds = e.target.checked;

    if (isPlaying) {
        if (config.birds) {
            scheduleBird();
        } else if (birdTimeout) {
            clearTimeout(birdTimeout);
            birdTimeout = null;
        }
    }
});

document.getElementById('insects').addEventListener('change', (e) => {
    config.insects = e.target.checked;

    if (isPlaying) {
        if (config.insects) {
            createInsectSound();
        } else if (insectNode) {
            if (insectNode.source) insectNode.source.stop();
            if (insectNode.osc) insectNode.osc.stop();
            if (insectNode.lfo) insectNode.lfo.stop();
            insectNode = null;
        }
    }
});

document.getElementById('stream').addEventListener('change', (e) => {
    config.stream = e.target.checked;

    if (isPlaying) {
        if (config.stream) {
            createStreamSound();
        } else if (streamNode) {
            if (streamNode.source) streamNode.source.stop();
            streamNode = null;
        }
    }
});

document.getElementById('wind').addEventListener('change', (e) => {
    config.wind = e.target.checked;

    if (isPlaying) {
        if (config.wind) {
            createWindSound();
        } else if (windNode) {
            if (windNode.source) windNode.source.stop();
            if (windNode.lfo) windNode.lfo.stop();
            windNode = null;
        }
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

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        toggleForest();
    }
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
