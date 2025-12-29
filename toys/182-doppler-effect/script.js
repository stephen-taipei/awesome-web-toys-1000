/**
 * Doppler Effect 都卜勒效應
 * Web Toy #182
 *
 * 功能：視覺化移動波源的都卜勒效應
 * 展示波源前方波長壓縮、後方波長拉伸的現象
 */

// 全域變數
let canvas, ctx;
let isPlaying = true;
let animationId = null;
let time = 0;

// 音訊相關
let audioCtx = null;
let oscillator = null;
let gainNode = null;
let isSoundOn = false;

// 波源設定
const source = {
    x: 0.5,
    y: 0.5,
    speed: 100,      // m/s
    frequency: 3,    // Hz
    direction: 0     // 弧度
};

// 波設定
let waveSpeed = 340; // m/s（聲速）
let mode = 'horizontal'; // horizontal, circular, manual

// 波紋陣列
const waves = [];
const maxWaves = 50;
let lastWaveTime = 0;

// 拖曳狀態
let isDragging = false;

// 初始化
function init() {
    canvas = document.getElementById('dopplerCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 事件監聽
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    // 控制項
    setupControls();

    // 開始動畫
    animate();
}

// 調整 Canvas 大小
function resizeCanvas() {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = container.clientWidth * dpr;
    canvas.height = 450 * dpr;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = '450px';

    ctx.scale(dpr, dpr);
}

// 設定控制項
function setupControls() {
    // 波源速度
    document.getElementById('sourceSpeed').addEventListener('input', (e) => {
        source.speed = parseInt(e.target.value);
        document.getElementById('sourceSpeedValue').textContent = source.speed + ' m/s';
        updateFrequencyDisplay();
    });

    // 發射頻率
    document.getElementById('sourceFreq').addEventListener('input', (e) => {
        source.frequency = parseFloat(e.target.value);
        document.getElementById('sourceFreqValue').textContent = source.frequency.toFixed(1) + ' Hz';
        updateFrequencyDisplay();
        updateOscillatorFrequency();
    });

    // 波速
    document.getElementById('waveSpeed').addEventListener('input', (e) => {
        waveSpeed = parseInt(e.target.value);
        document.getElementById('waveSpeedValue').textContent = waveSpeed + ' m/s';
        updateFrequencyDisplay();
    });

    // 模式選擇
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mode = btn.dataset.mode;
            resetSource();
        });
    });

    // 播放/暫停
    document.getElementById('playBtn').addEventListener('click', togglePlay);

    // 重置
    document.getElementById('resetBtn').addEventListener('click', reset);

    // 聲音
    document.getElementById('soundBtn').addEventListener('click', toggleSound);

    // 初始顯示
    updateFrequencyDisplay();
}

// 更新頻率顯示
function updateFrequencyDisplay() {
    const f0 = source.frequency;
    const vs = source.speed;
    const v = waveSpeed;

    // 計算都卜勒頻率
    // 靠近：f' = f × v / (v - vs)
    // 遠離：f' = f × v / (v + vs)

    let fApproach, fRecede;

    if (vs >= v) {
        // 超音速
        fApproach = '∞ (超音速)';
        fRecede = (f0 * v / (v + vs)).toFixed(2) + ' Hz';
    } else {
        fApproach = (f0 * v / (v - vs)).toFixed(2) + ' Hz';
        fRecede = (f0 * v / (v + vs)).toFixed(2) + ' Hz';
    }

    document.getElementById('freqApproach').textContent = fApproach;
    document.getElementById('freqSource').textContent = f0.toFixed(1) + ' Hz';
    document.getElementById('freqRecede').textContent = fRecede;
}

// 切換播放
function togglePlay() {
    const btn = document.getElementById('playBtn');
    isPlaying = !isPlaying;

    if (isPlaying) {
        btn.textContent = '暫停';
        btn.classList.remove('paused');
        animate();
    } else {
        btn.textContent = '播放';
        btn.classList.add('paused');
        cancelAnimationFrame(animationId);
    }
}

// 重置
function reset() {
    time = 0;
    waves.length = 0;
    resetSource();
}

// 重置波源位置
function resetSource() {
    source.x = 0.5;
    source.y = 0.5;
    source.direction = 0;
    waves.length = 0;

    if (mode === 'horizontal') {
        source.x = 0.1;
    }
}

// 切換聲音
function toggleSound() {
    const btn = document.getElementById('soundBtn');

    if (isSoundOn) {
        stopSound();
        btn.textContent = '開啟聲音';
        btn.classList.remove('active');
    } else {
        startSound();
        btn.textContent = '關閉聲音';
        btn.classList.add('active');
    }

    isSoundOn = !isSoundOn;
}

// 開始聲音
function startSound() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(source.frequency * 100, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
}

// 停止聲音
function stopSound() {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
    }
}

// 更新振盪器頻率
function updateOscillatorFrequency() {
    if (oscillator && audioCtx) {
        // 根據波源位置計算觀察者聽到的頻率
        // 假設觀察者在畫布中心
        const observerX = 0.5;
        const observerY = 0.5;

        const dx = observerX - source.x;
        const dy = observerY - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.01) {
            // 計算相對速度分量
            const vx = source.speed * Math.cos(source.direction);
            const vy = source.speed * Math.sin(source.direction);

            // 沿連線方向的速度分量
            const vr = (vx * dx + vy * dy) / dist;

            // 都卜勒頻率
            let observedFreq;
            if (waveSpeed + vr > 0) {
                observedFreq = source.frequency * waveSpeed / (waveSpeed - vr);
            } else {
                observedFreq = source.frequency * 5; // 限制最大值
            }

            observedFreq = Math.max(50, Math.min(2000, observedFreq * 100));
            oscillator.frequency.setValueAtTime(observedFreq, audioCtx.currentTime);
        }
    }
}

// 滑鼠事件
function handleMouseDown(e) {
    if (mode === 'manual') {
        isDragging = true;
        updateSourcePosition(e);
    }
}

function handleMouseMove(e) {
    if (isDragging && mode === 'manual') {
        updateSourcePosition(e);
    }
}

function handleMouseUp() {
    isDragging = false;
}

// 觸控事件
function handleTouchStart(e) {
    e.preventDefault();
    if (mode === 'manual') {
        isDragging = true;
        updateSourcePosition(e.touches[0]);
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (isDragging && mode === 'manual') {
        updateSourcePosition(e.touches[0]);
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    isDragging = false;
}

// 更新波源位置
function updateSourcePosition(e) {
    const rect = canvas.getBoundingClientRect();
    const newX = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    const newY = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / 450));

    // 計算移動方向
    const dx = newX - source.x;
    const dy = newY - source.y;
    if (dx !== 0 || dy !== 0) {
        source.direction = Math.atan2(dy, dx);
    }

    source.x = newX;
    source.y = newY;
}

// 更新波源
function updateSource(dt) {
    const pixelSpeed = source.speed * 0.0005; // 轉換為畫布單位

    switch (mode) {
        case 'horizontal':
            source.x += pixelSpeed;
            source.direction = 0;
            if (source.x > 0.95) {
                source.x = 0.05;
                waves.length = 0;
            }
            break;

        case 'circular':
            const radius = 0.25;
            const angularSpeed = source.speed * 0.002;
            source.direction += angularSpeed * dt;

            source.x = 0.5 + radius * Math.cos(source.direction);
            source.y = 0.5 + radius * Math.sin(source.direction);

            // 切線方向
            source.direction += Math.PI / 2;
            break;

        case 'manual':
            // 由滑鼠控制
            break;
    }
}

// 產生波
function emitWave() {
    const waveInterval = 1 / source.frequency;

    if (time - lastWaveTime >= waveInterval) {
        waves.push({
            x: source.x,
            y: source.y,
            radius: 0,
            birthTime: time,
            alpha: 1
        });

        if (waves.length > maxWaves) {
            waves.shift();
        }

        lastWaveTime = time;
    }
}

// 更新波
function updateWaves(dt) {
    const wavePixelSpeed = waveSpeed * 0.0003; // 轉換為畫布單位

    for (let i = waves.length - 1; i >= 0; i--) {
        const wave = waves[i];
        wave.radius += wavePixelSpeed;
        wave.alpha = Math.max(0, 1 - wave.radius * 1.5);

        if (wave.alpha <= 0) {
            waves.splice(i, 1);
        }
    }
}

// 繪製
function draw() {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = 450;

    // 清除畫布
    ctx.fillStyle = '#0a0a1e';
    ctx.fillRect(0, 0, width, height);

    // 繪製格線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = 0; y <= height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // 繪製波紋
    waves.forEach(wave => {
        const cx = wave.x * width;
        const cy = wave.y * height;
        const r = wave.radius * width;

        // 計算顏色（根據波長）
        const wavelength = waveSpeed / source.frequency;
        const compression = wavelength / (wavelength + source.speed / source.frequency);

        // 漸層圓環
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 200, 255, ${wave.alpha * 0.8})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 內部光暈
        if (wave.alpha > 0.5) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(wave.alpha - 0.5) * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });

    // 繪製速度向量
    if (mode !== 'manual' || isDragging) {
        const sx = source.x * width;
        const sy = source.y * height;
        const arrowLength = 40;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(
            sx + arrowLength * Math.cos(source.direction),
            sy + arrowLength * Math.sin(source.direction)
        );
        ctx.strokeStyle = '#ffd93d';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 箭頭
        const arrowSize = 10;
        const ax = sx + arrowLength * Math.cos(source.direction);
        const ay = sy + arrowLength * Math.sin(source.direction);

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(
            ax - arrowSize * Math.cos(source.direction - Math.PI / 6),
            ay - arrowSize * Math.sin(source.direction - Math.PI / 6)
        );
        ctx.lineTo(
            ax - arrowSize * Math.cos(source.direction + Math.PI / 6),
            ay - arrowSize * Math.sin(source.direction + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = '#ffd93d';
        ctx.fill();
    }

    // 繪製波源
    const sx = source.x * width;
    const sy = source.y * height;

    // 光暈
    const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, 30);
    gradient.addColorStop(0, 'rgba(255, 107, 107, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 107, 107, 0.3)');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sx, sy, 30, 0, Math.PI * 2);
    ctx.fill();

    // 波源中心
    ctx.beginPath();
    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 標籤
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('波源', sx, sy - 20);

    // 繪製圓周軌道（圓周模式）
    if (mode === 'circular') {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, width * 0.25, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 217, 61, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // 繪製速度與波速比較
    if (source.speed >= waveSpeed) {
        // 馬赫錐
        const machAngle = Math.asin(waveSpeed / source.speed);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(
            sx + 200 * Math.cos(source.direction + machAngle),
            sy + 200 * Math.sin(source.direction + machAngle)
        );
        ctx.moveTo(sx, sy);
        ctx.lineTo(
            sx + 200 * Math.cos(source.direction - machAngle),
            sy + 200 * Math.sin(source.direction - machAngle)
        );
        ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 超音速提示
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 16px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('超音速!', width / 2, 30);
    }
}

// 動畫迴圈
function animate() {
    if (!isPlaying) return;

    const dt = 0.016; // 約 60fps
    time += dt;

    updateSource(dt);
    emitWave();
    updateWaves(dt);
    draw();

    if (isSoundOn) {
        updateOscillatorFrequency();
    }

    animationId = requestAnimationFrame(animate);
}

// 啟動
document.addEventListener('DOMContentLoaded', init);
