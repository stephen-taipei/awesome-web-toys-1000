/**
 * Sound Visualizer 聲音視覺化
 * Web Toys #062
 *
 * 麥克風音訊視覺化
 *
 * 技術重點：
 * - Web Audio API
 * - 頻譜分析 (FFT)
 * - 多種視覺模式
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    visualMode: 'bars',
    colorScheme: 'rainbow',
    sensitivity: 1.0,
    smoothing: 0.8,
    showMirror: false
};

// 音訊相關
let audioContext = null;
let analyser = null;
let microphone = null;
let dataArray = null;
let bufferLength = 0;
let isRunning = false;

// 粒子系統（粒子模式用）
let particles = [];
const maxParticles = 200;

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    initParticles();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initParticles() {
    particles = [];
    for (let i = 0; i < maxParticles; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            baseSize: 2 + Math.random() * 4,
            size: 2,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            hue: Math.random() * 360
        });
    }
}

// ==================== 音訊設定 ====================

async function startAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = config.smoothing;

        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        isRunning = true;
        document.getElementById('statusDisplay').textContent = '運行中';
        document.getElementById('startBtn').textContent = '停止麥克風';
        document.getElementById('startBtn').classList.add('active');

    } catch (error) {
        console.error('無法啟用麥克風:', error);
        document.getElementById('statusDisplay').textContent = '權限被拒';
    }
}

function stopAudio() {
    if (microphone) {
        microphone.disconnect();
    }
    if (audioContext) {
        audioContext.close();
    }
    isRunning = false;
    audioContext = null;
    analyser = null;
    microphone = null;

    document.getElementById('statusDisplay').textContent = '已停止';
    document.getElementById('startBtn').textContent = '開始麥克風';
    document.getElementById('startBtn').classList.remove('active');
}

// ==================== 取得顏色 ====================

function getColor(index, total, value) {
    const normalizedValue = value / 255;
    const normalizedIndex = index / total;

    switch (config.colorScheme) {
        case 'rainbow':
            return `hsl(${normalizedIndex * 360}, 80%, ${30 + normalizedValue * 40}%)`;

        case 'fire':
            const fireHue = 60 - normalizedValue * 60;
            return `hsl(${fireHue}, 100%, ${20 + normalizedValue * 50}%)`;

        case 'ocean':
            const oceanHue = 180 + normalizedIndex * 60;
            return `hsl(${oceanHue}, 70%, ${20 + normalizedValue * 40}%)`;

        case 'neon':
            const neonHues = [320, 280, 180, 120];
            const neonHue = neonHues[Math.floor(normalizedIndex * neonHues.length) % neonHues.length];
            return `hsl(${neonHue}, 100%, ${40 + normalizedValue * 30}%)`;

        default:
            return `hsl(${normalizedIndex * 360}, 80%, 50%)`;
    }
}

// ==================== 視覺模式 ====================

function drawBars() {
    const barWidth = canvas.width / bufferLength;
    const heightMultiplier = canvas.height / 256 * config.sensitivity;

    for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const barHeight = value * heightMultiplier;

        const color = getColor(i, bufferLength, value);
        ctx.fillStyle = color;

        const x = i * barWidth;
        const y = canvas.height - barHeight;

        ctx.fillRect(x, y, barWidth - 1, barHeight);

        // 鏡像效果
        if (config.showMirror) {
            ctx.globalAlpha = 0.5;
            ctx.fillRect(x, 0, barWidth - 1, barHeight);
            ctx.globalAlpha = 1;
        }
    }
}

function drawCircle() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = Math.min(canvas.width, canvas.height) * 0.2;

    for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const angle = (i / bufferLength) * Math.PI * 2;
        const radius = baseRadius + value * config.sensitivity * 0.8;

        const x1 = centerX + Math.cos(angle) * baseRadius;
        const y1 = centerY + Math.sin(angle) * baseRadius;
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;

        const color = getColor(i, bufferLength, value);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // 鏡像效果（內圈）
        if (config.showMirror) {
            const innerRadius = baseRadius - (radius - baseRadius) * 0.5;
            const x3 = centerX + Math.cos(angle) * innerRadius;
            const y3 = centerY + Math.sin(angle) * innerRadius;

            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x3, y3);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    // 中心圓
    const avgValue = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    const glowRadius = baseRadius * 0.3 + avgValue * 0.2;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
    gradient.addColorStop(0, `hsla(${avgValue}, 80%, 60%, 0.8)`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawWaveform() {
    ctx.lineWidth = 2;

    const sliceWidth = canvas.width / bufferLength;
    const heightMultiplier = canvas.height / 512 * config.sensitivity;

    // 繪製波形
    ctx.beginPath();

    for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const x = i * sliceWidth;
        const y = canvas.height / 2 + (value - 128) * heightMultiplier;

        const color = getColor(i, bufferLength, value);
        ctx.strokeStyle = color;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();

    // 鏡像效果
    if (config.showMirror) {
        ctx.globalAlpha = 0.4;
        ctx.beginPath();

        for (let i = 0; i < bufferLength; i++) {
            const value = dataArray[i];
            const x = i * sliceWidth;
            const y = canvas.height / 2 - (value - 128) * heightMultiplier;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

function drawParticles() {
    const avgValue = dataArray ? dataArray.reduce((a, b) => a + b, 0) / bufferLength : 0;
    const bassValue = dataArray ? (dataArray[0] + dataArray[1] + dataArray[2]) / 3 : 0;

    for (const particle of particles) {
        // 根據音量更新粒子
        const energyMultiplier = 1 + avgValue / 128 * config.sensitivity;
        const bassMultiplier = 1 + bassValue / 128 * config.sensitivity;

        particle.size = particle.baseSize * bassMultiplier;

        // 更新位置
        particle.x += particle.vx * energyMultiplier;
        particle.y += particle.vy * energyMultiplier;

        // 邊界處理
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // 顏色隨音量變化
        const hue = (particle.hue + avgValue * 0.5) % 360;
        const lightness = 30 + avgValue / 255 * 40;

        // 繪製粒子
        const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 2
        );
        gradient.addColorStop(0, `hsla(${hue}, 80%, ${lightness}%, 1)`);
        gradient.addColorStop(1, `hsla(${hue}, 80%, ${lightness}%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // 核心
        ctx.fillStyle = `hsla(${hue}, 80%, ${lightness + 20}%, 1)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // 連接鄰近粒子
    if (avgValue > 50) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${avgValue / 512})`;
        ctx.lineWidth = 1;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 80) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
}

// ==================== 繪製 ====================

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 20, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isRunning && analyser) {
        analyser.getByteFrequencyData(dataArray);

        // 計算音量
        const volume = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        const dB = volume > 0 ? Math.round(20 * Math.log10(volume / 255) + 100) : 0;
        document.getElementById('volumeDisplay').textContent = dB;

        switch (config.visualMode) {
            case 'bars':
                drawBars();
                break;
            case 'circle':
                drawCircle();
                break;
            case 'waveform':
                drawWaveform();
                break;
            case 'particles':
                drawParticles();
                break;
        }
    } else {
        // 待機畫面
        drawIdleScreen();
    }

    requestAnimationFrame(draw);
}

function drawIdleScreen() {
    const time = Date.now() / 1000;

    // 動態背景圓
    for (let i = 0; i < 5; i++) {
        const x = canvas.width / 2 + Math.cos(time + i) * 50;
        const y = canvas.height / 2 + Math.sin(time + i) * 50;
        const radius = 30 + Math.sin(time * 2 + i) * 10;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `hsla(${(time * 50 + i * 72) % 360}, 60%, 50%, 0.3)`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // 提示文字
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('點擊「開始麥克風」按鈕', canvas.width / 2, canvas.height / 2);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

document.getElementById('startBtn').addEventListener('click', () => {
    if (isRunning) {
        stopAudio();
    } else {
        startAudio();
    }
});

document.getElementById('visualMode').addEventListener('change', (e) => {
    config.visualMode = e.target.value;
    if (config.visualMode === 'particles') {
        initParticles();
    }
});

document.getElementById('colorScheme').addEventListener('change', (e) => {
    config.colorScheme = e.target.value;
});

document.getElementById('sensitivity').addEventListener('input', (e) => {
    config.sensitivity = parseFloat(e.target.value);
    document.getElementById('sensitivityValue').textContent = config.sensitivity.toFixed(1);
});

document.getElementById('smoothing').addEventListener('input', (e) => {
    config.smoothing = parseFloat(e.target.value);
    document.getElementById('smoothingValue').textContent = config.smoothing.toFixed(2);
    if (analyser) {
        analyser.smoothingTimeConstant = config.smoothing;
    }
});

document.getElementById('showMirror').addEventListener('change', (e) => {
    config.showMirror = e.target.checked;
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
