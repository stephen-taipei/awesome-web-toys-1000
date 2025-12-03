/**
 * Music Visualizer 音樂視覺化
 * Web Toys #063
 *
 * 音樂檔案視覺化播放器
 *
 * 技術重點：
 * - Web Audio API
 * - 頻譜分析 (FFT)
 * - 多種視覺效果
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    visualMode: 'spectrum',
    colorTheme: 'sunset',
    intensity: 1.0,
    volume: 0.8
};

// 音訊相關
let audioContext = null;
let analyser = null;
let source = null;
let audioElement = null;
let dataArray = null;
let bufferLength = 0;
let isPlaying = false;

// 動畫變數
let time = 0;
let particles = [];

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
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            z: Math.random() * 1000,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 2 + 1
        });
    }
}

// ==================== 音訊設定 ====================

function setupAudio(file) {
    if (audioContext) {
        audioContext.close();
    }

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;

    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // 創建音訊元素
    if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
    }

    audioElement = new Audio();
    audioElement.src = URL.createObjectURL(file);
    audioElement.volume = config.volume;

    source = audioContext.createMediaElementSource(audioElement);
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1;

    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 事件
    audioElement.addEventListener('ended', () => {
        isPlaying = false;
        document.getElementById('playBtn').textContent = '播放';
        document.getElementById('playBtn').classList.remove('playing');
        document.getElementById('statusDisplay').textContent = '播放結束';
    });

    audioElement.addEventListener('timeupdate', () => {
        const current = formatTime(audioElement.currentTime);
        const total = formatTime(audioElement.duration || 0);
        document.getElementById('timeDisplay').textContent = `${current} / ${total}`;
    });

    // 啟用按鈕
    document.getElementById('playBtn').disabled = false;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('statusDisplay').textContent = '準備就緒';
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function play() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    audioElement.play();
    isPlaying = true;
    document.getElementById('playBtn').textContent = '暫停';
    document.getElementById('playBtn').classList.add('playing');
    document.getElementById('statusDisplay').textContent = '播放中';
}

function pause() {
    audioElement.pause();
    isPlaying = false;
    document.getElementById('playBtn').textContent = '播放';
    document.getElementById('playBtn').classList.remove('playing');
    document.getElementById('statusDisplay').textContent = '已暫停';
}

function stop() {
    audioElement.pause();
    audioElement.currentTime = 0;
    isPlaying = false;
    document.getElementById('playBtn').textContent = '播放';
    document.getElementById('playBtn').classList.remove('playing');
    document.getElementById('statusDisplay').textContent = '已停止';
}

// ==================== 取得顏色 ====================

function getThemeColors() {
    switch (config.colorTheme) {
        case 'sunset':
            return ['#ff6496', '#ff9664', '#ffdc64', '#ff6496'];
        case 'aurora':
            return ['#64ff96', '#64c8ff', '#c864ff', '#64ff96'];
        case 'neon':
            return ['#ff00ff', '#00ffff', '#ffff00', '#ff00ff'];
        case 'ocean':
            return ['#004080', '#0080c0', '#00c0ff', '#80e0ff'];
        default:
            return ['#ff6496', '#ff9664', '#ffdc64', '#ff6496'];
    }
}

function getColor(index, total, value) {
    const colors = getThemeColors();
    const normalizedIndex = index / total;
    const colorIndex = normalizedIndex * (colors.length - 1);
    const startIndex = Math.floor(colorIndex);
    const endIndex = Math.min(startIndex + 1, colors.length - 1);
    const t = colorIndex - startIndex;

    const startColor = hexToRgb(colors[startIndex]);
    const endColor = hexToRgb(colors[endIndex]);

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * t);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * t);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * t);

    const brightness = 0.5 + (value / 255) * 0.5;
    return `rgb(${Math.round(r * brightness)}, ${Math.round(g * brightness)}, ${Math.round(b * brightness)})`;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// ==================== 視覺模式 ====================

function drawSpectrum() {
    const barWidth = canvas.width / bufferLength * 2;
    const heightMultiplier = canvas.height / 256 * config.intensity;
    const centerY = canvas.height;

    // 山脈效果
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const barHeight = value * heightMultiplier;
        const x = i * barWidth;
        const y = canvas.height - barHeight;

        if (i === 0) {
            ctx.lineTo(x, y);
        } else {
            const prevX = (i - 1) * barWidth;
            const prevY = canvas.height - dataArray[i - 1] * heightMultiplier;
            const cpX = (prevX + x) / 2;
            ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
        }
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();

    // 漸層填充
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    const colors = getThemeColors();
    colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fill();

    // 發光線條
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawOrbital() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;

    // 多層軌道
    for (let layer = 0; layer < 3; layer++) {
        const layerOffset = layer * (bufferLength / 3);
        const baseRadius = maxRadius * (0.4 + layer * 0.3);

        ctx.beginPath();

        for (let i = 0; i < bufferLength / 3; i++) {
            const dataIndex = Math.floor(layerOffset + i);
            const value = dataArray[dataIndex] || 0;
            const angle = (i / (bufferLength / 3)) * Math.PI * 2 + time * (0.5 + layer * 0.2);
            const radius = baseRadius + value * config.intensity * 0.5;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.strokeStyle = getColor(layer, 3, 200);
        ctx.lineWidth = 3;
        ctx.stroke();

        // 發光效果
        ctx.shadowColor = getColor(layer, 3, 255);
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // 中心光球
    const avgValue = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    const coreRadius = 30 + avgValue * 0.3 * config.intensity;

    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
    coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    coreGradient.addColorStop(0.5, getColor(0, 1, avgValue));
    coreGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawTunnel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const avgValue = dataArray ? dataArray.reduce((a, b) => a + b, 0) / bufferLength : 0;

    // 更新粒子
    for (const p of particles) {
        p.z -= p.speed * (1 + avgValue / 128) * config.intensity * 3;
        if (p.z <= 0) {
            p.z = 1000;
            p.x = (Math.random() - 0.5) * canvas.width * 2;
            p.y = (Math.random() - 0.5) * canvas.height * 2;
        }

        const scale = 500 / p.z;
        const screenX = centerX + p.x * scale;
        const screenY = centerY + p.y * scale;
        const size = p.size * scale * (1 + avgValue / 256);

        if (screenX > 0 && screenX < canvas.width && screenY > 0 && screenY < canvas.height) {
            const alpha = Math.min(1, (1000 - p.z) / 500);
            const colorIndex = (p.x + p.y + time * 100) % 360;

            ctx.fillStyle = `hsla(${colorIndex}, 80%, 60%, ${alpha})`;
            ctx.beginPath();
            ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 隧道環
    for (let i = 0; i < 10; i++) {
        const z = ((time * 100 + i * 100) % 1000);
        const scale = 500 / (z + 1);
        const radius = 400 * scale;
        const alpha = (1000 - z) / 1000 * 0.5;

        const dataIndex = Math.floor((i / 10) * bufferLength);
        const value = dataArray ? dataArray[dataIndex] : 0;
        const pulseRadius = radius * (1 + value / 512 * config.intensity);

        ctx.strokeStyle = `hsla(${(i * 36 + time * 50) % 360}, 70%, 50%, ${alpha})`;
        ctx.lineWidth = 2 + value / 64;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawFractal() {
    const avgValue = dataArray ? dataArray.reduce((a, b) => a + b, 0) / bufferLength : 0;
    const bassValue = dataArray ? (dataArray[0] + dataArray[1] + dataArray[2]) / 3 : 0;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height);

    const maxDepth = 8;
    const baseLength = 120 + bassValue * 0.5 * config.intensity;

    function drawBranch(depth, length, angle) {
        if (depth > maxDepth || length < 5) return;

        const dataIndex = Math.floor((depth / maxDepth) * bufferLength);
        const value = dataArray ? dataArray[dataIndex] : 0;
        const adjustedLength = length * (0.8 + value / 512 * config.intensity);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -adjustedLength);

        const hue = (depth * 30 + time * 20) % 360;
        ctx.strokeStyle = `hsl(${hue}, 70%, ${40 + value / 5}%)`;
        ctx.lineWidth = Math.max(1, maxDepth - depth);
        ctx.stroke();

        ctx.translate(0, -adjustedLength);

        const branchAngle = 25 + value / 10;

        ctx.save();
        ctx.rotate((branchAngle * Math.PI) / 180);
        drawBranch(depth + 1, adjustedLength * 0.7, branchAngle);
        ctx.restore();

        ctx.save();
        ctx.rotate((-branchAngle * Math.PI) / 180);
        drawBranch(depth + 1, adjustedLength * 0.7, -branchAngle);
        ctx.restore();
    }

    drawBranch(0, baseLength, 0);
    ctx.restore();
}

// ==================== 繪製 ====================

function draw() {
    // 背景淡出
    ctx.fillStyle = 'rgba(10, 5, 16, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
    }

    time += 0.016;

    switch (config.visualMode) {
        case 'spectrum':
            drawSpectrum();
            break;
        case 'orbital':
            drawOrbital();
            break;
        case 'tunnel':
            drawTunnel();
            break;
        case 'fractal':
            drawFractal();
            break;
    }

    requestAnimationFrame(draw);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

document.getElementById('audioFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        setupAudio(file);
    }
});

document.getElementById('playBtn').addEventListener('click', () => {
    if (isPlaying) {
        pause();
    } else {
        play();
    }
});

document.getElementById('stopBtn').addEventListener('click', stop);

document.getElementById('visualMode').addEventListener('change', (e) => {
    config.visualMode = e.target.value;
    if (config.visualMode === 'tunnel') {
        initParticles();
    }
});

document.getElementById('colorTheme').addEventListener('change', (e) => {
    config.colorTheme = e.target.value;
});

document.getElementById('intensity').addEventListener('input', (e) => {
    config.intensity = parseFloat(e.target.value);
    document.getElementById('intensityValue').textContent = config.intensity.toFixed(1);
});

document.getElementById('volume').addEventListener('input', (e) => {
    config.volume = parseInt(e.target.value) / 100;
    document.getElementById('volumeValue').textContent = e.target.value;
    if (audioElement) {
        audioElement.volume = config.volume;
    }
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(draw);
