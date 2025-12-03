/**
 * Rain Sounds 雨聲模擬
 * Web Toys #076
 *
 * 真實雨聲模擬器
 *
 * 技術重點：
 * - 程序化雨聲合成
 * - 雷聲生成
 * - 雨滴視覺動畫
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    intensity: 50,
    thunder: 30,
    windowEffect: true,
    puddleEffect: true,
    volume: 0.5,
    timer: 0
};

// 音訊相關
let audioContext = null;
let masterGain = null;
let rainNode = null;
let isPlaying = false;

// 雷聲定時器
let thunderTimeout = null;

// 定時器
let timerEndTime = 0;
let timerInterval = null;

// 雨滴
let raindrops = [];
let splashes = [];

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    createRaindrops();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createRaindrops();
}

function createRaindrops() {
    raindrops = [];
    const count = Math.floor(config.intensity * 3);

    for (let i = 0; i < count; i++) {
        raindrops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: 10 + Math.random() * 20,
            speed: 15 + Math.random() * 10,
            opacity: 0.2 + Math.random() * 0.3
        });
    }
}

// ==================== 音訊控制 ====================

function startRain() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    masterGain = audioContext.createGain();
    masterGain.gain.value = config.volume;
    masterGain.connect(audioContext.destination);

    // 創建雨聲
    createRainSound();

    isPlaying = true;

    // 開始雷聲
    if (config.thunder > 0) {
        scheduleThunder();
    }

    // 啟動定時器
    if (config.timer > 0) {
        startTimer();
    }

    document.getElementById('playBtn').textContent = '停止下雨';
    document.getElementById('playBtn').classList.add('playing');
    document.getElementById('statusDisplay').textContent = '播放中';
    updateWeatherDisplay();
}

function createRainSound() {
    // 主要雨聲 - 濾波噪音
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;

            // 粉紅噪音濾波
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;

            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;

            // 添加隨機雨滴聲
            if (Math.random() < 0.0001 * config.intensity) {
                data[i] += (Math.random() * 2 - 1) * 0.3;
            }
        }
    }

    rainNode = audioContext.createBufferSource();
    rainNode.buffer = buffer;
    rainNode.loop = true;

    // 低通濾波器模擬雨聲
    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 2000 + config.intensity * 30;

    // 高通濾波器
    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 100;

    // 雨量增益
    const rainGain = audioContext.createGain();
    rainGain.gain.value = 0.3 + config.intensity / 200;

    rainNode.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(rainGain);
    rainGain.connect(masterGain);

    rainNode.start();

    // 水坑聲效果
    if (config.puddleEffect) {
        createPuddleSound();
    }
}

function createPuddleSound() {
    function scheduleDrop() {
        if (!isPlaying) return;

        const osc = audioContext.createOscillator();
        const dropGain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = 300 + Math.random() * 500;

        dropGain.gain.setValueAtTime(0.1 * (config.intensity / 100), audioContext.currentTime);
        dropGain.gain.setTargetAtTime(0.001, audioContext.currentTime, 0.02);

        // 立體聲位置
        const panner = audioContext.createStereoPanner();
        panner.pan.value = Math.random() * 2 - 1;

        osc.connect(dropGain);
        dropGain.connect(panner);
        panner.connect(masterGain);

        osc.start();
        osc.stop(audioContext.currentTime + 0.05);

        const nextDrop = 50 + Math.random() * (500 - config.intensity * 4);
        setTimeout(scheduleDrop, nextDrop);
    }

    scheduleDrop();
}

function scheduleThunder() {
    if (!isPlaying || config.thunder === 0) return;

    const delay = (15000 - config.thunder * 100) + Math.random() * 20000;

    thunderTimeout = setTimeout(() => {
        playThunder();
        scheduleThunder();
    }, delay);
}

function playThunder() {
    if (!audioContext || !isPlaying) return;

    // 雷聲合成
    const duration = 2 + Math.random() * 2;
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        let lastValue = 0;

        for (let i = 0; i < bufferSize; i++) {
            const t = i / audioContext.sampleRate;
            const envelope = Math.exp(-t * 1.5) * (1 + Math.random() * 0.3);

            // 棕噪音基底
            const white = Math.random() * 2 - 1;
            lastValue = (lastValue + white * 0.1) / 1.1;

            // 低頻隆隆聲
            const rumble = Math.sin(t * 30 + Math.random() * 0.5) * 0.3;

            data[i] = (lastValue * 3 + rumble) * envelope;

            // 隨機閃電爆裂
            if (Math.random() < 0.001 && t < 0.5) {
                data[i] += (Math.random() * 2 - 1) * envelope * 2;
            }
        }
    }

    const thunderNode = audioContext.createBufferSource();
    thunderNode.buffer = buffer;

    const thunderGain = audioContext.createGain();
    thunderGain.gain.value = 0.4 + config.thunder / 200;

    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 500;

    thunderNode.connect(lowpass);
    lowpass.connect(thunderGain);
    thunderGain.connect(masterGain);

    thunderNode.start();

    // 閃電效果
    flashLightning();
}

function flashLightning() {
    let flashes = 1 + Math.floor(Math.random() * 3);
    let flashIndex = 0;

    function flash() {
        canvas.style.filter = 'brightness(3)';
        setTimeout(() => {
            canvas.style.filter = 'brightness(1)';
            flashIndex++;
            if (flashIndex < flashes) {
                setTimeout(flash, 50 + Math.random() * 100);
            }
        }, 50);
    }

    flash();
}

function stopRain() {
    if (rainNode) {
        rainNode.stop();
        rainNode.disconnect();
        rainNode = null;
    }

    if (thunderTimeout) {
        clearTimeout(thunderTimeout);
        thunderTimeout = null;
    }

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        document.getElementById('timerDisplay').textContent = '';
    }

    isPlaying = false;

    document.getElementById('playBtn').textContent = '開始下雨';
    document.getElementById('playBtn').classList.remove('playing');
    document.getElementById('statusDisplay').textContent = '停止';
    document.getElementById('weatherDisplay').textContent = '晴天';
}

function toggleRain() {
    if (isPlaying) {
        stopRain();
    } else {
        startRain();
    }
}

function updateWeatherDisplay() {
    let weather = '';
    if (config.intensity < 30) {
        weather = '毛毛雨';
    } else if (config.intensity < 60) {
        weather = '中雨';
    } else if (config.intensity < 80) {
        weather = '大雨';
    } else {
        weather = '暴雨';
    }

    if (config.thunder > 50) {
        weather += ' + 雷暴';
    } else if (config.thunder > 0) {
        weather += ' + 雷聲';
    }

    document.getElementById('weatherDisplay').textContent = weather;
}

function getIntensityName(value) {
    if (value < 20) return '毛毛雨';
    if (value < 40) return '小雨';
    if (value < 60) return '中雨';
    if (value < 80) return '大雨';
    return '暴雨';
}

function getThunderName(value) {
    if (value === 0) return '無';
    if (value < 30) return '偶爾';
    if (value < 60) return '頻繁';
    return '持續';
}

// ==================== 定時器 ====================

function startTimer() {
    timerEndTime = Date.now() + config.timer * 60 * 1000;

    timerInterval = setInterval(() => {
        const remaining = timerEndTime - Date.now();

        if (remaining <= 0) {
            stopRain();
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
    // 清除畫布
    ctx.fillStyle = 'rgba(10, 16, 24, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isPlaying) {
        drawRain();
        drawSplashes();
        if (config.windowEffect) {
            drawWindowEffect();
        }
    } else {
        // 靜止畫面
        drawStaticScene();
    }

    requestAnimationFrame(draw);
}

function drawRain() {
    ctx.strokeStyle = 'rgba(150, 200, 255, 0.4)';
    ctx.lineWidth = 1;

    const speed = 10 + config.intensity / 5;

    raindrops.forEach(drop => {
        ctx.globalAlpha = drop.opacity;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.length);
        ctx.stroke();

        // 更新位置
        drop.y += drop.speed * (config.intensity / 50);
        drop.x -= 1;

        // 重置
        if (drop.y > canvas.height) {
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;

            // 創建水花
            if (config.puddleEffect && Math.random() < 0.3) {
                splashes.push({
                    x: drop.x,
                    y: canvas.height - 5,
                    size: 2 + Math.random() * 3,
                    life: 1
                });
            }
        }

        if (drop.x < 0) {
            drop.x = canvas.width;
        }
    });

    ctx.globalAlpha = 1;

    // 動態調整雨滴數量
    const targetCount = Math.floor(config.intensity * 3);
    while (raindrops.length < targetCount) {
        raindrops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: 10 + Math.random() * 20,
            speed: 15 + Math.random() * 10,
            opacity: 0.2 + Math.random() * 0.3
        });
    }
    while (raindrops.length > targetCount) {
        raindrops.pop();
    }
}

function drawSplashes() {
    splashes.forEach((splash, index) => {
        ctx.fillStyle = `rgba(150, 200, 255, ${splash.life * 0.5})`;
        ctx.beginPath();
        ctx.arc(splash.x, splash.y, splash.size * (1 - splash.life * 0.5), 0, Math.PI * 2);
        ctx.fill();

        splash.life -= 0.05;

        if (splash.life <= 0) {
            splashes.splice(index, 1);
        }
    });
}

function drawWindowEffect() {
    // 窗戶邊框
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.1)';
    ctx.lineWidth = 20;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // 窗戶水珠
    const time = Date.now() / 1000;
    for (let i = 0; i < 20; i++) {
        const x = (Math.sin(i * 0.7 + time * 0.1) + 1) / 2 * canvas.width;
        const y = ((time * 0.05 + i * 0.1) % 1) * canvas.height;
        const size = 3 + Math.sin(i) * 2;

        ctx.fillStyle = 'rgba(150, 200, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawStaticScene() {
    // 靜態夜景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(20, 30, 50, 0.5)');
    gradient.addColorStop(1, 'rgba(10, 15, 25, 0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 星星
    for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 0.7) + 1) / 2 * canvas.width;
        const y = (Math.cos(i * 1.3) + 1) / 2 * canvas.height * 0.5;
        const twinkle = 0.3 + Math.sin(Date.now() / 500 + i) * 0.2;

        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('playBtn').addEventListener('click', toggleRain);

document.getElementById('intensity').addEventListener('input', (e) => {
    config.intensity = parseInt(e.target.value);
    document.getElementById('intensityValue').textContent = getIntensityName(config.intensity);
    if (isPlaying) {
        updateWeatherDisplay();
    }
});

document.getElementById('thunder').addEventListener('input', (e) => {
    config.thunder = parseInt(e.target.value);
    document.getElementById('thunderValue').textContent = getThunderName(config.thunder);
    if (isPlaying) {
        updateWeatherDisplay();
    }
});

document.getElementById('windowEffect').addEventListener('change', (e) => {
    config.windowEffect = e.target.checked;
});

document.getElementById('puddleEffect').addEventListener('change', (e) => {
    config.puddleEffect = e.target.checked;
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

// 鍵盤控制
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        toggleRain();
    }
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
