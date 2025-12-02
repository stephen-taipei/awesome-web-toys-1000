/**
 * Pendulum Wave 鐘擺波
 * Web Toys #055
 *
 * 不同週期鐘擺產生的波浪效果
 *
 * 技術重點：
 * - 簡諧運動
 * - 頻率差異產生的拍頻
 * - 視覺同步效果
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('pendulumCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    pendulumCount: 15,
    cycleTime: 60,
    amplitude: 45,
    damping: 0,
    colorMode: 'rainbow',
    paused: false
};

let pendulums = [];
let time = 0;
let startTime = 0;

// ==================== 鐘擺類別 ====================

class Pendulum {
    constructor(index, total) {
        this.index = index;
        this.total = total;

        // 計算週期（第一個最長，最後一個最短）
        // 在 cycleTime 秒內，第一個完成 N 次，最後一個完成 N+total-1 次
        const baseOscillations = 51; // 基礎擺動次數
        this.oscillations = baseOscillations + index;
        this.period = config.cycleTime / this.oscillations;

        this.angle = 0;
        this.angularVelocity = (2 * Math.PI) / this.period;
        this.currentAmplitude = config.amplitude * (Math.PI / 180);
        this.trail = [];
    }

    update(dt) {
        // 更新角度
        this.angle = this.currentAmplitude * Math.sin(this.angularVelocity * time);

        // 阻尼
        if (config.damping > 0) {
            this.currentAmplitude *= (1 - config.damping);
        }
    }

    getPosition(pivotX, pivotY, length) {
        return {
            x: pivotX + Math.sin(this.angle) * length,
            y: pivotY + Math.cos(this.angle) * length
        };
    }
}

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    time = 0;
    startTime = performance.now();

    pendulums = [];
    for (let i = 0; i < config.pendulumCount; i++) {
        pendulums.push(new Pendulum(i, config.pendulumCount));
    }
}

// ==================== 顏色計算 ====================

function getColor(index, total, phase) {
    switch (config.colorMode) {
        case 'rainbow':
            const hue = (index / total) * 360;
            return `hsl(${hue}, 80%, 60%)`;

        case 'gradient':
            const gradHue = 240 + (index / total) * 120;
            return `hsl(${gradHue}, 70%, 60%)`;

        case 'mono':
            return '#9664ff';

        case 'phase':
            const phaseHue = (phase / (Math.PI * 2)) * 360 + 240;
            return `hsl(${phaseHue % 360}, 80%, 60%)`;
    }
}

// ==================== 動畫迴圈 ====================

function animate() {
    if (!config.paused) {
        time = (performance.now() - startTime) / 1000;
    }

    // 清除畫布
    ctx.fillStyle = 'rgba(10, 10, 16, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 計算尺寸
    const spacing = canvas.width / (config.pendulumCount + 1);
    const pivotY = 50;
    const maxLength = canvas.height - 150;
    const minLength = maxLength * 0.4;
    const lengthRange = maxLength - minLength;

    // 繪製支架
    ctx.strokeStyle = 'rgba(150, 100, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, pivotY);
    ctx.lineTo(canvas.width, pivotY);
    ctx.stroke();

    // 更新並繪製鐘擺
    for (let i = 0; i < pendulums.length; i++) {
        const pendulum = pendulums[i];
        pendulum.update(0.016);

        const pivotX = spacing * (i + 1);
        // 長度隨索引遞減（產生不同週期）
        const length = maxLength - (i / (pendulums.length - 1)) * lengthRange;
        const pos = pendulum.getPosition(pivotX, pivotY, length);

        const color = getColor(i, pendulums.length, pendulum.angle + Math.PI);

        // 繪製軌跡光暈
        const glowGradient = ctx.createRadialGradient(
            pos.x, pos.y, 0,
            pos.x, pos.y, 30
        );
        glowGradient.addColorStop(0, color);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // 繪製繩子
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        // 繪製擺錘
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(pos.x - 4, pos.y - 4, 5, 0, Math.PI * 2);
        ctx.fill();

        // 繪製支點
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // 繪製連接線（波浪效果）
    ctx.strokeStyle = 'rgba(150, 100, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < pendulums.length; i++) {
        const pendulum = pendulums[i];
        const pivotX = spacing * (i + 1);
        const length = maxLength - (i / (pendulums.length - 1)) * lengthRange;
        const pos = pendulum.getPosition(pivotX, pivotY, length);

        if (i === 0) {
            ctx.moveTo(pos.x, pos.y);
        } else {
            ctx.lineTo(pos.x, pos.y);
        }
    }
    ctx.stroke();

    // 更新顯示
    document.getElementById('timeDisplay').textContent = time.toFixed(1);
    const cyclePercent = ((time % config.cycleTime) / config.cycleTime * 100).toFixed(0);
    document.getElementById('cycleDisplay').textContent = cyclePercent + '%';

    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 事件處理 ====================

window.addEventListener('resize', () => {
    resizeCanvas();
});

document.getElementById('pendulumCount').addEventListener('input', (e) => {
    config.pendulumCount = parseInt(e.target.value);
    document.getElementById('pendulumCountValue').textContent = config.pendulumCount;
    init();
});

document.getElementById('cycleTime').addEventListener('input', (e) => {
    config.cycleTime = parseInt(e.target.value);
    document.getElementById('cycleTimeValue').textContent = config.cycleTime;
    init();
});

document.getElementById('amplitude').addEventListener('input', (e) => {
    config.amplitude = parseInt(e.target.value);
    document.getElementById('amplitudeValue').textContent = config.amplitude;
    for (const p of pendulums) {
        p.currentAmplitude = config.amplitude * (Math.PI / 180);
    }
});

document.getElementById('damping').addEventListener('input', (e) => {
    config.damping = parseFloat(e.target.value);
    document.getElementById('dampingValue').textContent = config.damping.toFixed(3);
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('resetBtn').addEventListener('click', init);

document.getElementById('pauseBtn').addEventListener('click', () => {
    config.paused = !config.paused;
    if (!config.paused) {
        startTime = performance.now() - time * 1000;
    }
    const btn = document.getElementById('pauseBtn');
    btn.textContent = config.paused ? '繼續' : '暫停';
    btn.classList.toggle('paused', config.paused);
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(animate);
