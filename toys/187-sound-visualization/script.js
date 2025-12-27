/**
 * Sound Visualization 聲波視覺化
 * Web Toy #187
 *
 * 功能：使用麥克風即時擷取聲音並視覺化
 * 支援多種視覺化模式和顏色主題
 */

// 全域變數
let canvas, ctx;
let audioCtx = null;
let analyser = null;
let microphone = null;
let isRecording = false;
let animationId = null;

// 視覺化設定
let visualMode = 'waveform';
let colorTheme = 'neon';
let sensitivity = 1.5;
let smoothing = 0.8;

// 資料陣列
let dataArray = null;
let frequencyData = null;
let bufferLength = 0;

// 粒子系統（用於粒子模式）
let particles = [];

// 顏色主題
const themes = {
    neon: {
        primary: '#00ff88',
        secondary: '#00ffff',
        tertiary: '#ff00ff',
        background: '#000'
    },
    fire: {
        primary: '#ff4400',
        secondary: '#ffaa00',
        tertiary: '#ff0044',
        background: '#1a0a00'
    },
    ocean: {
        primary: '#0066ff',
        secondary: '#00ccff',
        tertiary: '#0044aa',
        background: '#000a15'
    },
    rainbow: {
        primary: '#ff0000',
        secondary: '#00ff00',
        tertiary: '#0000ff',
        background: '#0a0a0a'
    }
};

// 初始化
function init() {
    canvas = document.getElementById('audioCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    setupControls();
    initParticles();
    animate();
}

// 調整 Canvas 大小
function resizeCanvas() {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = container.clientWidth * dpr;
    canvas.height = 350 * dpr;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = '350px';

    ctx.scale(dpr, dpr);
}

// 設定控制項
function setupControls() {
    // 視覺化模式
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            visualMode = btn.dataset.mode;
        });
    });

    // 顏色主題
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            colorTheme = btn.dataset.theme;
        });
    });

    // 敏感度
    document.getElementById('sensitivity').addEventListener('input', (e) => {
        sensitivity = parseFloat(e.target.value);
        document.getElementById('sensitivityValue').textContent = sensitivity.toFixed(1);
    });

    // 平滑度
    document.getElementById('smoothing').addEventListener('input', (e) => {
        smoothing = parseFloat(e.target.value);
        document.getElementById('smoothingValue').textContent = smoothing.toFixed(2);
        if (analyser) {
            analyser.smoothingTimeConstant = smoothing;
        }
    });

    // 開始/停止按鈕
    document.getElementById('startBtn').addEventListener('click', toggleRecording);

    // 重置按鈕
    document.getElementById('resetBtn').addEventListener('click', reset);
}

// 初始化粒子
function initParticles() {
    particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: 0,
            vy: 0,
            size: Math.random() * 3 + 1,
            life: Math.random()
        });
    }
}

// 切換錄音
async function toggleRecording() {
    const btn = document.getElementById('startBtn');
    const status = document.getElementById('micStatus');

    if (isRecording) {
        stopRecording();
        btn.textContent = '開始錄音';
        btn.classList.remove('recording');
        status.classList.remove('active');
        status.querySelector('.status-text').textContent = '點擊開始錄音';
    } else {
        const success = await startRecording();
        if (success) {
            btn.textContent = '停止錄音';
            btn.classList.add('recording');
            status.classList.add('active');
            status.querySelector('.status-text').textContent = '正在錄音...';
        }
    }
}

// 開始錄音
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = smoothing;

        microphone = audioCtx.createMediaStreamSource(stream);
        microphone.connect(analyser);

        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        frequencyData = new Uint8Array(bufferLength);

        isRecording = true;
        return true;
    } catch (error) {
        console.error('無法存取麥克風:', error);
        alert('無法存取麥克風，請確認已授予權限。');
        return false;
    }
}

// 停止錄音
function stopRecording() {
    isRecording = false;

    if (microphone) {
        microphone.disconnect();
        microphone = null;
    }

    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }

    analyser = null;
}

// 重置
function reset() {
    stopRecording();

    const btn = document.getElementById('startBtn');
    const status = document.getElementById('micStatus');

    btn.textContent = '開始錄音';
    btn.classList.remove('recording');
    status.classList.remove('active');
    status.querySelector('.status-text').textContent = '點擊開始錄音';

    initParticles();
}

// 取得音訊資料
function getAudioData() {
    if (!analyser || !isRecording) return;

    analyser.getByteTimeDomainData(dataArray);
    analyser.getByteFrequencyData(frequencyData);

    // 計算音量
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        const value = (dataArray[i] - 128) / 128;
        sum += value * value;
    }
    const volume = Math.sqrt(sum / bufferLength);
    const volumeDb = 20 * Math.log10(volume + 0.001);

    // 更新音量顯示
    const volumeLevel = document.getElementById('volumeLevel');
    const volumeValue = document.getElementById('volumeValue');
    volumeLevel.style.width = Math.min(100, volume * sensitivity * 200) + '%';
    volumeValue.textContent = volumeDb.toFixed(1) + ' dB';

    // 計算主頻率
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < bufferLength; i++) {
        if (frequencyData[i] > maxValue) {
            maxValue = frequencyData[i];
            maxIndex = i;
        }
    }
    const dominantFreq = maxIndex * audioCtx.sampleRate / analyser.fftSize;
    document.getElementById('frequencyValue').textContent =
        dominantFreq > 0 ? Math.round(dominantFreq) + ' Hz' : '-- Hz';
}

// 繪製
function draw() {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = 350;
    const theme = themes[colorTheme];

    // 清除畫布
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, width, height);

    if (isRecording && analyser) {
        getAudioData();

        switch (visualMode) {
            case 'waveform':
                drawWaveform(width, height, theme);
                break;
            case 'frequency':
                drawFrequency(width, height, theme);
                break;
            case 'circular':
                drawCircular(width, height, theme);
                break;
            case 'bars':
                drawBars(width, height, theme);
                break;
            case 'particles':
                drawParticles(width, height, theme);
                break;
        }
    } else {
        // 無錄音時顯示靜態圖案
        drawIdleState(width, height, theme);
    }
}

// 繪製波形圖
function drawWaveform(width, height, theme) {
    ctx.beginPath();
    ctx.lineWidth = 2;

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, theme.primary);
    gradient.addColorStop(0.5, theme.secondary);
    gradient.addColorStop(1, theme.tertiary);
    ctx.strokeStyle = gradient;

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height / 2) * sensitivity;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.stroke();

    // 發光效果
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// 繪製頻譜圖
function drawFrequency(width, height, theme) {
    const barWidth = width / bufferLength * 2;
    let x = 0;

    for (let i = 0; i < bufferLength / 2; i++) {
        const barHeight = (frequencyData[i] / 255) * height * sensitivity;

        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, theme.primary);
        gradient.addColorStop(0.5, theme.secondary);
        gradient.addColorStop(1, theme.tertiary);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
    }
}

// 繪製圓形視覺化
function drawCircular(width, height, theme) {
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.25;

    // 繪製圓形波形
    ctx.beginPath();
    for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * Math.PI * 2;
        const v = frequencyData[i] / 255;
        const radius = baseRadius + v * 80 * sensitivity;

        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();

    const gradient = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.5, centerX, centerY, baseRadius * 2);
    gradient.addColorStop(0, theme.tertiary);
    gradient.addColorStop(0.5, theme.secondary);
    gradient.addColorStop(1, theme.primary);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.stroke();

    // 中心發光
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 0.3, 0, Math.PI * 2);
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 0.3);
    centerGradient.addColorStop(0, theme.primary);
    centerGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = centerGradient;
    ctx.fill();
}

// 繪製長條圖
function drawBars(width, height, theme) {
    const numBars = 64;
    const barWidth = width / numBars - 2;
    const step = Math.floor(bufferLength / numBars);

    for (let i = 0; i < numBars; i++) {
        const value = frequencyData[i * step] / 255;
        const barHeight = value * height * 0.9 * sensitivity;

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // 漸層
        const gradient = ctx.createLinearGradient(0, height, 0, y);
        gradient.addColorStop(0, theme.primary);
        gradient.addColorStop(0.5, theme.secondary);
        gradient.addColorStop(1, theme.tertiary);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // 頂部高亮
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y, barWidth, 3);
    }
}

// 繪製粒子
function drawParticles(width, height, theme) {
    // 計算平均音量
    let avgVolume = 0;
    for (let i = 0; i < bufferLength; i++) {
        avgVolume += frequencyData[i];
    }
    avgVolume = (avgVolume / bufferLength / 255) * sensitivity;

    // 更新和繪製粒子
    particles.forEach((p, index) => {
        // 根據音量更新粒子
        const freqIndex = index % (bufferLength / 2);
        const freqValue = frequencyData[freqIndex] / 255;

        p.vy += (freqValue * 2 - 1) * sensitivity;
        p.vx += (Math.random() - 0.5) * avgVolume * 2;

        p.x += p.vx;
        p.y += p.vy;

        p.vx *= 0.98;
        p.vy *= 0.98;

        // 邊界處理
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // 繪製粒子
        const size = p.size * (1 + freqValue * 2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);

        const alpha = 0.5 + freqValue * 0.5;
        ctx.fillStyle = `rgba(${hexToRgb(theme.primary)}, ${alpha})`;
        ctx.fill();
    });
}

// 繪製閒置狀態
function drawIdleState(width, height, theme) {
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.fillStyle = theme.primary;
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('點擊「開始錄音」以開始視覺化', centerX, centerY);

    // 裝飾圓圈
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.strokeStyle = theme.primary + '40';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// 十六進位轉 RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
        '255, 255, 255';
}

// 動畫迴圈
function animate() {
    draw();
    animationId = requestAnimationFrame(animate);
}

// 啟動
document.addEventListener('DOMContentLoaded', init);
