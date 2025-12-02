/**
 * Flow Painting 流場繪畫
 * Web Toys #025
 *
 * 在畫布上繪製流場方向，粒子依照繪製路徑流動
 *
 * 技術重點：
 * - 自訂向量場繪製
 * - 流場網格系統
 * - 多種筆刷模式
 */

// ==================== 畫布設定 ====================

const flowCanvas = document.getElementById('flowCanvas');
const drawCanvas = document.getElementById('drawCanvas');
const flowCtx = flowCanvas.getContext('2d');
const drawCtx = drawCanvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    particleCount: 3000,
    brushSize: 50,
    flowStrength: 3,
    brushMode: 'push',
    colorScheme: 'rainbow'
};

// 流場網格
const gridSize = 20;
let flowField = [];
let gridCols, gridRows;

// 粒子系統
let particles = [];

// 繪製狀態
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// ==================== 顏色方案 ====================

const colorSchemes = {
    rainbow: (x, y, speed) => {
        const hue = (x / flowCanvas.width * 180 + y / flowCanvas.height * 180 + speed * 20) % 360;
        return `hsla(${hue}, 80%, 55%, ${0.3 + speed * 0.1})`;
    },
    fire: (x, y, speed) => {
        const hue = 30 - speed * 10;
        const lightness = 40 + speed * 15;
        return `hsla(${Math.max(0, hue)}, 90%, ${Math.min(70, lightness)}%, ${0.3 + speed * 0.1})`;
    },
    ocean: (x, y, speed) => {
        const hue = 180 + Math.sin(x * 0.01) * 30;
        return `hsla(${hue}, 70%, ${45 + speed * 10}%, ${0.3 + speed * 0.1})`;
    },
    forest: (x, y, speed) => {
        const hue = 100 + Math.sin(y * 0.01) * 40;
        return `hsla(${hue}, 60%, ${35 + speed * 10}%, ${0.3 + speed * 0.1})`;
    },
    mono: (x, y, speed) => {
        const brightness = 50 + speed * 20;
        return `hsla(0, 0%, ${brightness}%, ${0.3 + speed * 0.1})`;
    }
};

// ==================== 流場系統 ====================

function initFlowField() {
    gridCols = Math.ceil(flowCanvas.width / gridSize);
    gridRows = Math.ceil(flowCanvas.height / gridSize);
    flowField = [];

    for (let i = 0; i < gridCols * gridRows; i++) {
        flowField[i] = { x: 0, y: 0 };
    }
}

function getFlowVector(x, y) {
    const col = Math.floor(x / gridSize);
    const row = Math.floor(y / gridSize);

    if (col < 0 || col >= gridCols || row < 0 || row >= gridRows) {
        return { x: 0, y: 0 };
    }

    const index = col + row * gridCols;
    return flowField[index] || { x: 0, y: 0 };
}

function setFlowVector(x, y, vx, vy, radius) {
    const centerCol = Math.floor(x / gridSize);
    const centerRow = Math.floor(y / gridSize);
    const cellRadius = Math.ceil(radius / gridSize);

    for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        for (let dx = -cellRadius; dx <= cellRadius; dx++) {
            const col = centerCol + dx;
            const row = centerRow + dy;

            if (col < 0 || col >= gridCols || row < 0 || row >= gridRows) continue;

            const cellX = col * gridSize + gridSize / 2;
            const cellY = row * gridSize + gridSize / 2;
            const dist = Math.sqrt((cellX - x) ** 2 + (cellY - y) ** 2);

            if (dist < radius) {
                const index = col + row * gridCols;
                const falloff = 1 - dist / radius;
                const strength = falloff * falloff; // 平滑衰減

                flowField[index].x += vx * strength;
                flowField[index].y += vy * strength;

                // 限制最大速度
                const mag = Math.sqrt(flowField[index].x ** 2 + flowField[index].y ** 2);
                if (mag > 10) {
                    flowField[index].x = flowField[index].x / mag * 10;
                    flowField[index].y = flowField[index].y / mag * 10;
                }
            }
        }
    }
}

function applyBrush(x, y, prevX, prevY) {
    const dx = x - prevX;
    const dy = y - prevY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 1) return;

    const strength = config.flowStrength;
    const radius = config.brushSize;

    switch (config.brushMode) {
        case 'push':
            // 沿繪製方向推動
            setFlowVector(x, y, dx / dist * strength, dy / dist * strength, radius);
            break;

        case 'pull':
            // 與繪製方向相反
            setFlowVector(x, y, -dx / dist * strength, -dy / dist * strength, radius);
            break;

        case 'swirl':
            // 漩渦效果
            setFlowVector(x, y, -dy / dist * strength, dx / dist * strength, radius);
            break;

        case 'explode':
            // 從中心向外爆炸
            const centerCol = Math.floor(x / gridSize);
            const centerRow = Math.floor(y / gridSize);
            const cellRadius = Math.ceil(radius / gridSize);

            for (let dRow = -cellRadius; dRow <= cellRadius; dRow++) {
                for (let dCol = -cellRadius; dCol <= cellRadius; dCol++) {
                    const col = centerCol + dCol;
                    const row = centerRow + dRow;
                    if (col < 0 || col >= gridCols || row < 0 || row >= gridRows) continue;

                    const cellX = col * gridSize + gridSize / 2;
                    const cellY = row * gridSize + gridSize / 2;
                    const cellDist = Math.sqrt((cellX - x) ** 2 + (cellY - y) ** 2);

                    if (cellDist < radius && cellDist > 0) {
                        const index = col + row * gridCols;
                        const falloff = 1 - cellDist / radius;
                        const ex = (cellX - x) / cellDist;
                        const ey = (cellY - y) / cellDist;
                        flowField[index].x += ex * strength * falloff;
                        flowField[index].y += ey * strength * falloff;
                    }
                }
            }
            break;
    }
}

function clearFlowField() {
    for (let i = 0; i < flowField.length; i++) {
        flowField[i] = { x: 0, y: 0 };
    }
}

// ==================== 粒子系統 ====================

class FlowParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * flowCanvas.width;
        this.y = Math.random() * flowCanvas.height;
        this.prevX = this.x;
        this.prevY = this.y;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.maxAge = 100 + Math.random() * 150;
    }

    update() {
        this.prevX = this.x;
        this.prevY = this.y;

        const flow = getFlowVector(this.x, this.y);

        // 慣性 + 流場力
        this.vx = this.vx * 0.95 + flow.x * 0.1;
        this.vy = this.vy * 0.95 + flow.y * 0.1;

        this.x += this.vx;
        this.y += this.vy;
        this.age++;

        // 邊界處理
        if (this.x < 0 || this.x > flowCanvas.width ||
            this.y < 0 || this.y > flowCanvas.height ||
            this.age > this.maxAge) {
            this.reset();
        }
    }

    draw(ctx) {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed < 0.1) return;

        const colorFn = colorSchemes[config.colorScheme];
        ctx.strokeStyle = colorFn(this.x, this.y, speed);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new FlowParticle());
    }
    document.getElementById('particleDisplay').textContent = config.particleCount;
}

// ==================== 繪製事件處理 ====================

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

    // 應用筆刷
    applyBrush(pos.x, pos.y, lastX, lastY);

    // 繪製視覺提示
    drawCtx.strokeStyle = 'rgba(255, 170, 100, 0.3)';
    drawCtx.lineWidth = config.brushSize / 5;
    drawCtx.lineCap = 'round';
    drawCtx.beginPath();
    drawCtx.moveTo(lastX, lastY);
    drawCtx.lineTo(pos.x, pos.y);
    drawCtx.stroke();

    lastX = pos.x;
    lastY = pos.y;
}

function stopDrawing() {
    isDrawing = false;
}

// ==================== 初始化與動畫 ====================

function clearCanvas() {
    flowCtx.fillStyle = '#0a0a12';
    flowCtx.fillRect(0, 0, flowCanvas.width, flowCanvas.height);
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}

function resizeCanvas() {
    flowCanvas.width = window.innerWidth;
    flowCanvas.height = window.innerHeight;
    drawCanvas.width = window.innerWidth;
    drawCanvas.height = window.innerHeight;

    initFlowField();
    clearCanvas();
}

function animate() {
    // 淡化背景
    flowCtx.fillStyle = 'rgba(10, 10, 18, 0.03)';
    flowCtx.fillRect(0, 0, flowCanvas.width, flowCanvas.height);

    // 淡化繪製畫布
    drawCtx.fillStyle = 'rgba(10, 10, 18, 0.01)';
    drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);

    // 流場衰減
    for (let i = 0; i < flowField.length; i++) {
        flowField[i].x *= 0.995;
        flowField[i].y *= 0.995;
    }

    // 更新和繪製粒子
    particles.forEach(particle => {
        particle.update();
        particle.draw(flowCtx);
    });

    requestAnimationFrame(animate);
}

// ==================== 事件監聽 ====================

window.addEventListener('resize', resizeCanvas);

// 滑鼠事件
drawCanvas.addEventListener('mousedown', startDrawing);
drawCanvas.addEventListener('mousemove', draw);
drawCanvas.addEventListener('mouseup', stopDrawing);
drawCanvas.addEventListener('mouseleave', stopDrawing);

// 觸控事件
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

document.getElementById('flowStrength').addEventListener('input', (e) => {
    config.flowStrength = parseFloat(e.target.value);
    document.getElementById('flowStrengthValue').textContent = config.flowStrength;
});

document.getElementById('brushMode').addEventListener('change', (e) => {
    config.brushMode = e.target.value;
    const modeNames = { push: '推動', pull: '吸引', swirl: '漩渦', explode: '爆炸' };
    document.getElementById('modeDisplay').textContent = modeNames[config.brushMode];
});

document.getElementById('colorScheme').addEventListener('change', (e) => {
    config.colorScheme = e.target.value;
});

document.getElementById('clearFlowBtn').addEventListener('click', clearFlowField);
document.getElementById('clearCanvasBtn').addEventListener('click', clearCanvas);

// ==================== 啟動 ====================

resizeCanvas();
initParticles();
requestAnimationFrame(animate);
