/**
 * Gradient Flow 梯度流
 * Web Toys #029
 *
 * 粒子沿著顏色梯度方向流動，可繪製自訂梯度場
 *
 * 技術重點：
 * - 梯度計算（圖像處理）
 * - 顏色亮度分析
 * - 向量場生成
 */

// ==================== 畫布設定 ====================

const gradientCanvas = document.getElementById('gradientCanvas');
const drawCanvas = document.getElementById('drawCanvas');
const gradientCtx = gradientCanvas.getContext('2d');
const drawCtx = drawCanvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    particleCount: 4000,
    brushSize: 60,
    flowSpeed: 2,
    brushColor: '#ff6600',
    gradientMode: 'ascend'
};

let particles = [];
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// 梯度場緩存
let gradientField = null;
let fieldWidth = 0;
let fieldHeight = 0;
const fieldScale = 4; // 降低解析度以提升效能

// ==================== 梯度計算 ====================

/**
 * 計算亮度
 */
function getLuminance(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * 更新梯度場
 */
function updateGradientField() {
    fieldWidth = Math.ceil(drawCanvas.width / fieldScale);
    fieldHeight = Math.ceil(drawCanvas.height / fieldScale);

    // 獲取繪圖畫布的像素數據
    const imageData = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
    const data = imageData.data;

    gradientField = new Float32Array(fieldWidth * fieldHeight * 2);

    for (let fy = 0; fy < fieldHeight; fy++) {
        for (let fx = 0; fx < fieldWidth; fx++) {
            const x = fx * fieldScale;
            const y = fy * fieldScale;

            // 計算中心點亮度
            const centerIdx = (y * drawCanvas.width + x) * 4;
            const centerLum = getLuminance(data[centerIdx], data[centerIdx + 1], data[centerIdx + 2]);

            // 計算鄰近點亮度
            let leftLum = 0, rightLum = 0, topLum = 0, bottomLum = 0;

            if (x > 0) {
                const idx = (y * drawCanvas.width + (x - fieldScale)) * 4;
                leftLum = getLuminance(data[idx], data[idx + 1], data[idx + 2]);
            }
            if (x < drawCanvas.width - fieldScale) {
                const idx = (y * drawCanvas.width + (x + fieldScale)) * 4;
                rightLum = getLuminance(data[idx], data[idx + 1], data[idx + 2]);
            }
            if (y > 0) {
                const idx = ((y - fieldScale) * drawCanvas.width + x) * 4;
                topLum = getLuminance(data[idx], data[idx + 1], data[idx + 2]);
            }
            if (y < drawCanvas.height - fieldScale) {
                const idx = ((y + fieldScale) * drawCanvas.width + x) * 4;
                bottomLum = getLuminance(data[idx], data[idx + 1], data[idx + 2]);
            }

            // 計算梯度（Sobel 簡化版）
            let gx = rightLum - leftLum;
            let gy = bottomLum - topLum;

            // 根據模式調整方向
            switch (config.gradientMode) {
                case 'ascend':
                    // 向亮處流動（梯度上升）
                    break;
                case 'descend':
                    // 向暗處流動（梯度下降）
                    gx = -gx;
                    gy = -gy;
                    break;
                case 'both':
                    // 垂直於梯度方向流動
                    const temp = gx;
                    gx = -gy;
                    gy = temp;
                    break;
            }

            const fieldIdx = (fy * fieldWidth + fx) * 2;
            gradientField[fieldIdx] = gx;
            gradientField[fieldIdx + 1] = gy;
        }
    }
}

/**
 * 獲取某點的梯度向量
 */
function getGradientVector(x, y) {
    const fx = Math.floor(x / fieldScale);
    const fy = Math.floor(y / fieldScale);

    if (fx < 0 || fx >= fieldWidth || fy < 0 || fy >= fieldHeight) {
        return { x: 0, y: 0 };
    }

    const idx = (fy * fieldWidth + fx) * 2;
    return {
        x: gradientField[idx] || 0,
        y: gradientField[idx + 1] || 0
    };
}

// ==================== 粒子系統 ====================

class GradientParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * gradientCanvas.width;
        this.y = Math.random() * gradientCanvas.height;
        this.prevX = this.x;
        this.prevY = this.y;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.maxAge = 100 + Math.random() * 150;
        this.hue = Math.random() * 60 + 15; // 橙黃色系
    }

    update() {
        this.prevX = this.x;
        this.prevY = this.y;

        // 獲取梯度向量
        const gradient = getGradientVector(this.x, this.y);
        const magnitude = Math.sqrt(gradient.x * gradient.x + gradient.y * gradient.y);

        if (magnitude > 0.1) {
            // 正規化並應用速度
            this.vx = this.vx * 0.9 + (gradient.x / magnitude) * config.flowSpeed * 0.15;
            this.vy = this.vy * 0.9 + (gradient.y / magnitude) * config.flowSpeed * 0.15;

            // 顏色根據梯度強度變化
            this.hue = 30 + magnitude * 2;
        } else {
            // 無梯度區域，添加微小隨機運動
            this.vx = this.vx * 0.95 + (Math.random() - 0.5) * 0.1;
            this.vy = this.vy * 0.95 + (Math.random() - 0.5) * 0.1;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.age++;

        // 邊界處理
        if (this.x < 0 || this.x > gradientCanvas.width ||
            this.y < 0 || this.y > gradientCanvas.height ||
            this.age > this.maxAge) {
            this.reset();
        }
    }

    draw(ctx) {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed < 0.05) return;

        const alpha = 0.3 + Math.min(speed * 0.15, 0.5);
        ctx.strokeStyle = `hsla(${this.hue}, 80%, 55%, ${alpha})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }
}

// ==================== 繪圖功能 ====================

function getEventPos(e) {
    const rect = drawCanvas.getBoundingClientRect();
    if (e.touches) {
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    }
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function startDrawing(e) {
    isDrawing = true;
    const pos = getEventPos(e);
    lastX = pos.x;
    lastY = pos.y;
}

function draw(e) {
    if (!isDrawing) return;

    const pos = getEventPos(e);

    // 繪製漸層圓
    const gradient = drawCtx.createRadialGradient(
        pos.x, pos.y, 0,
        pos.x, pos.y, config.brushSize
    );
    gradient.addColorStop(0, config.brushColor);
    gradient.addColorStop(1, 'transparent');

    drawCtx.globalCompositeOperation = 'lighter';
    drawCtx.fillStyle = gradient;
    drawCtx.beginPath();
    drawCtx.arc(pos.x, pos.y, config.brushSize, 0, Math.PI * 2);
    drawCtx.fill();
    drawCtx.globalCompositeOperation = 'source-over';

    lastX = pos.x;
    lastY = pos.y;

    // 更新梯度場
    updateGradientField();
}

function stopDrawing() {
    isDrawing = false;
}

// ==================== 初始化 ====================

function initParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new GradientParticle());
    }
    document.getElementById('particleDisplay').textContent = config.particleCount;
}

function clearGradient() {
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    updateGradientField();
}

function clearParticleCanvas() {
    gradientCtx.fillStyle = '#0a0a0f';
    gradientCtx.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);
}

function resizeCanvas() {
    gradientCanvas.width = window.innerWidth;
    gradientCanvas.height = window.innerHeight;
    drawCanvas.width = window.innerWidth;
    drawCanvas.height = window.innerHeight;

    clearParticleCanvas();
    updateGradientField();
}

// ==================== 動畫迴圈 ====================

let lastTime = 0;
let frameCount = 0;
let fpsTime = 0;

function animate(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // FPS 計算
    frameCount++;
    fpsTime += deltaTime;
    if (fpsTime >= 1000) {
        document.getElementById('fpsDisplay').textContent = frameCount;
        frameCount = 0;
        fpsTime = 0;
    }

    // 淡化背景
    gradientCtx.fillStyle = 'rgba(10, 10, 15, 0.03)';
    gradientCtx.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);

    // 更新和繪製粒子
    particles.forEach(particle => {
        particle.update();
        particle.draw(gradientCtx);
    });

    requestAnimationFrame(animate);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

// 繪圖事件
drawCanvas.addEventListener('mousedown', startDrawing);
drawCanvas.addEventListener('mousemove', draw);
drawCanvas.addEventListener('mouseup', stopDrawing);
drawCanvas.addEventListener('mouseleave', stopDrawing);

drawCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e);
}, { passive: false });
drawCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e);
}, { passive: false });
drawCanvas.addEventListener('touchend', stopDrawing);

// 控制面板
document.getElementById('particleCount').addEventListener('input', (e) => {
    config.particleCount = parseInt(e.target.value);
    document.getElementById('particleCountValue').textContent = config.particleCount;
    initParticles();
});

document.getElementById('brushSize').addEventListener('input', (e) => {
    config.brushSize = parseInt(e.target.value);
    document.getElementById('brushSizeValue').textContent = config.brushSize;
});

document.getElementById('flowSpeed').addEventListener('input', (e) => {
    config.flowSpeed = parseFloat(e.target.value);
    document.getElementById('flowSpeedValue').textContent = config.flowSpeed;
});

document.getElementById('brushColor').addEventListener('input', (e) => {
    config.brushColor = e.target.value;
});

document.getElementById('gradientMode').addEventListener('change', (e) => {
    config.gradientMode = e.target.value;
    updateGradientField();
});

// 預設顏色按鈕
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        config.brushColor = btn.dataset.color;
        document.getElementById('brushColor').value = btn.dataset.color;
    });
});

document.getElementById('clearGradientBtn').addEventListener('click', clearGradient);
document.getElementById('clearCanvasBtn').addEventListener('click', clearParticleCanvas);

// ==================== 啟動 ====================

resizeCanvas();
initParticles();
updateGradientField();
requestAnimationFrame(animate);
