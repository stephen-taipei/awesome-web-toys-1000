/**
 * Flow Typography 流動文字
 * Web Toys #028
 *
 * 文字沿著流場路徑排列，產生動態書法效果
 *
 * 技術重點：
 * - Canvas 文字路徑解析
 * - 流場與文字結合
 * - 粒子沿文字邊緣流動
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('flowCanvas');
const ctx = canvas.getContext('2d');

// 離屏畫布用於文字檢測
const offCanvas = document.createElement('canvas');
const offCtx = offCanvas.getContext('2d');

// ==================== 簡化 Noise ====================

class SimpleNoise {
    constructor(seed = Math.random() * 10000) {
        this.seed = seed;
    }

    noise2D(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1;
    }

    smoothNoise(x, y) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const fx = x - ix;
        const fy = y - iy;

        const v00 = this.noise2D(ix, iy);
        const v10 = this.noise2D(ix + 1, iy);
        const v01 = this.noise2D(ix, iy + 1);
        const v11 = this.noise2D(ix + 1, iy + 1);

        const u = fx * fx * (3 - 2 * fx);
        const v = fy * fy * (3 - 2 * fy);

        return v00 * (1 - u) * (1 - v) + v10 * u * (1 - v) +
               v01 * (1 - u) * v + v11 * u * v;
    }
}

// ==================== 配置參數 ====================

let config = {
    text: 'FLOW',
    fontSize: 200,
    particleCount: 3000,
    flowSpeed: 1.5,
    flowStyle: 'wave',
    colorMode: 'gradient'
};

let noise = new SimpleNoise();
let particles = [];
let textPixels = [];
let time = 0;

// ==================== 文字解析 ====================

function parseTextPixels() {
    const text = config.text || 'FLOW';

    // 設定離屏畫布
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;

    offCtx.fillStyle = '#000';
    offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);

    // 繪製文字
    offCtx.fillStyle = '#fff';
    offCtx.font = `bold ${config.fontSize}px Arial, sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

    // 獲取像素數據
    const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const data = imageData.data;

    textPixels = [];

    // 取樣文字區域內的像素
    const step = 4; // 取樣間隔
    for (let y = 0; y < offCanvas.height; y += step) {
        for (let x = 0; x < offCanvas.width; x += step) {
            const index = (y * offCanvas.width + x) * 4;
            if (data[index] > 128) {
                textPixels.push({ x, y });
            }
        }
    }
}

/**
 * 檢查點是否在文字內
 */
function isInsideText(x, y) {
    if (x < 0 || x >= offCanvas.width || y < 0 || y >= offCanvas.height) {
        return false;
    }

    const imageData = offCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
    return imageData.data[0] > 128;
}

// ==================== 流場計算 ====================

function getFlowVector(x, y) {
    const scale = 0.005;

    switch (config.flowStyle) {
        case 'wave':
            return {
                x: Math.cos(y * 0.02 + time * 0.02) * config.flowSpeed,
                y: Math.sin(x * 0.01 + time * 0.015) * config.flowSpeed * 0.5
            };

        case 'spiral':
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) + 0.1;
            return {
                x: Math.cos(angle) * config.flowSpeed - dx / dist * 0.5,
                y: Math.sin(angle) * config.flowSpeed - dy / dist * 0.5
            };

        case 'noise':
            const n = noise.smoothNoise(x * scale + time * 0.01, y * scale);
            const angle2 = n * Math.PI * 2;
            return {
                x: Math.cos(angle2) * config.flowSpeed,
                y: Math.sin(angle2) * config.flowSpeed
            };

        case 'gravity':
            return {
                x: (Math.random() - 0.5) * config.flowSpeed * 0.5,
                y: config.flowSpeed * 0.8
            };

        default:
            return { x: 0, y: 0 };
    }
}

// ==================== 顏色方案 ====================

const colorModes = {
    gradient: (particle) => {
        const ratio = particle.x / canvas.width;
        const hue = 260 + ratio * 60;
        return `hsla(${hue}, 70%, 60%, ${0.4 + particle.brightness * 0.4})`;
    },
    rainbow: (particle) => {
        const hue = (particle.x / canvas.width * 180 + time * 2) % 360;
        return `hsla(${hue}, 80%, 55%, ${0.4 + particle.brightness * 0.4})`;
    },
    fire: (particle) => {
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const hue = 30 - speed * 5;
        return `hsla(${Math.max(0, hue)}, 90%, ${50 + speed * 5}%, ${0.4 + particle.brightness * 0.4})`;
    },
    mono: (particle) => {
        const brightness = 60 + particle.brightness * 30;
        return `hsla(270, 20%, ${brightness}%, ${0.4 + particle.brightness * 0.4})`;
    }
};

// ==================== 粒子系統 ====================

class FlowParticle {
    constructor() {
        this.reset();
    }

    reset() {
        // 從文字像素中隨機選擇起點
        if (textPixels.length > 0) {
            const pixel = textPixels[Math.floor(Math.random() * textPixels.length)];
            this.x = pixel.x + (Math.random() - 0.5) * 4;
            this.y = pixel.y + (Math.random() - 0.5) * 4;
        } else {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }

        this.originX = this.x;
        this.originY = this.y;
        this.prevX = this.x;
        this.prevY = this.y;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.maxAge = 80 + Math.random() * 120;
        this.brightness = Math.random();
    }

    update() {
        this.prevX = this.x;
        this.prevY = this.y;

        // 獲取流場向量
        const flow = getFlowVector(this.x, this.y);

        // 應用流場力
        this.vx = this.vx * 0.9 + flow.x * 0.15;
        this.vy = this.vy * 0.9 + flow.y * 0.15;

        // 向原點的回歸力（保持在文字附近）
        const dx = this.originX - this.x;
        const dy = this.originY - this.y;
        this.vx += dx * 0.002;
        this.vy += dy * 0.002;

        this.x += this.vx;
        this.y += this.vy;
        this.age++;

        // 重置條件
        if (this.age > this.maxAge ||
            this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw(ctx) {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed < 0.1) return;

        const colorFn = colorModes[config.colorMode];
        ctx.strokeStyle = colorFn(this);
        ctx.lineWidth = 1 + this.brightness;

        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }
}

// ==================== 初始化 ====================

function initParticles() {
    parseTextPixels();

    particles = [];
    const count = Math.min(config.particleCount, textPixels.length * 2);

    for (let i = 0; i < count; i++) {
        particles.push(new FlowParticle());
    }

    document.getElementById('particleDisplay').textContent = particles.length;
}

function clearCanvas() {
    ctx.fillStyle = '#08080f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
    clearCanvas();
}

// ==================== 動畫迴圈 ====================

let lastTime = 0;
let frameCount = 0;
let fpsTime = 0;

function animate(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    time++;

    // FPS 計算
    frameCount++;
    fpsTime += deltaTime;
    if (fpsTime >= 1000) {
        document.getElementById('fpsDisplay').textContent = frameCount;
        frameCount = 0;
        fpsTime = 0;
    }

    // 淡化背景
    ctx.fillStyle = 'rgba(8, 8, 15, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新和繪製粒子
    particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
    });

    requestAnimationFrame(animate);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('inputText').addEventListener('input', (e) => {
    config.text = e.target.value.toUpperCase() || 'FLOW';
    initParticles();
    clearCanvas();
});

document.getElementById('fontSize').addEventListener('input', (e) => {
    config.fontSize = parseInt(e.target.value);
    document.getElementById('fontSizeValue').textContent = config.fontSize;
    initParticles();
    clearCanvas();
});

document.getElementById('particleCount').addEventListener('input', (e) => {
    config.particleCount = parseInt(e.target.value);
    document.getElementById('particleCountValue').textContent = config.particleCount;
    initParticles();
});

document.getElementById('flowSpeed').addEventListener('input', (e) => {
    config.flowSpeed = parseFloat(e.target.value);
    document.getElementById('flowSpeedValue').textContent = config.flowSpeed.toFixed(1);
});

document.getElementById('flowStyle').addEventListener('change', (e) => {
    config.flowStyle = e.target.value;
    noise = new SimpleNoise(); // 重新生成噪聲
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('regenerateBtn').addEventListener('click', () => {
    noise = new SimpleNoise();
    initParticles();
    clearCanvas();
});

document.getElementById('clearBtn').addEventListener('click', clearCanvas);

// ==================== 啟動 ====================

resizeCanvas();
requestAnimationFrame(animate);
