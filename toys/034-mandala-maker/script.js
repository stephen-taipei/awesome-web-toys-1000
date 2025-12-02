/**
 * Mandala Maker 曼陀羅生成器
 * Web Toys #034
 *
 * 互動式曼陀羅繪製工具，支援對稱繪製與隨機生成
 *
 * 技術重點：
 * - 放射對稱繪製
 * - 座標旋轉變換
 * - 隨機圖案生成
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('mandalaCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    symmetry: 8,
    layers: 5,
    brushSize: 4,
    colorScheme: 'rainbow',
    mirror: true
};

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let centerX, centerY;
let hue = 0;

// ==================== 顏色方案 ====================

const colorSchemes = {
    rainbow: (distance, angle) => {
        const h = (angle * 180 / Math.PI + distance * 0.5 + hue) % 360;
        return `hsl(${h}, 80%, 60%)`;
    },
    sunset: (distance, angle) => {
        const h = 20 + (distance * 0.3) % 40;
        const l = 50 + Math.sin(angle * 3) * 20;
        return `hsl(${h}, 90%, ${l}%)`;
    },
    ocean: (distance, angle) => {
        const h = 180 + (distance * 0.2 + angle * 20) % 60;
        return `hsl(${h}, 70%, 55%)`;
    },
    forest: (distance, angle) => {
        const h = 80 + (distance * 0.15) % 50;
        const l = 40 + Math.sin(angle * 4) * 15;
        return `hsl(${h}, 60%, ${l}%)`;
    },
    galaxy: (distance, angle) => {
        const h = 260 + (distance * 0.4 + angle * 30) % 80;
        return `hsl(${h}, 75%, 55%)`;
    }
};

// ==================== 繪製函數 ====================

/**
 * 取得顏色
 */
function getColor(x, y) {
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    return colorSchemes[config.colorScheme](distance, angle);
}

/**
 * 繪製對稱點
 */
function drawSymmetricPoint(x, y, fromX, fromY) {
    const dx = x - centerX;
    const dy = y - centerY;
    const fdx = fromX - centerX;
    const fdy = fromY - centerY;

    const angleStep = (Math.PI * 2) / config.symmetry;

    for (let i = 0; i < config.symmetry; i++) {
        const angle = angleStep * i;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // 旋轉座標
        const rx = centerX + dx * cos - dy * sin;
        const ry = centerY + dx * sin + dy * cos;
        const rfx = centerX + fdx * cos - fdy * sin;
        const rfy = centerY + fdx * sin + fdy * cos;

        // 繪製線條
        ctx.strokeStyle = getColor(rx, ry);
        ctx.lineWidth = config.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(rfx, rfy);
        ctx.lineTo(rx, ry);
        ctx.stroke();

        // 鏡射模式
        if (config.mirror) {
            const mx = centerX - dx * cos - dy * sin;
            const my = centerY - dx * sin + dy * cos;
            const mfx = centerX - fdx * cos - fdy * sin;
            const mfy = centerY - fdx * sin + fdy * cos;

            ctx.beginPath();
            ctx.moveTo(mfx, mfy);
            ctx.lineTo(mx, my);
            ctx.stroke();
        }
    }
}

/**
 * 清除畫布
 */
function clearCanvas() {
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製中心點和輔助線
    drawGuides();
}

/**
 * 繪製輔助線
 */
function drawGuides() {
    ctx.strokeStyle = 'rgba(180, 100, 200, 0.1)';
    ctx.lineWidth = 1;

    // 放射線
    const angleStep = (Math.PI * 2) / config.symmetry;
    for (let i = 0; i < config.symmetry; i++) {
        const angle = angleStep * i;
        const x = centerX + Math.cos(angle) * Math.max(centerX, centerY);
        const y = centerY + Math.sin(angle) * Math.max(centerX, centerY);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    // 同心圓
    const maxRadius = Math.min(centerX, centerY) * 0.9;
    const layerStep = maxRadius / config.layers;

    for (let i = 1; i <= config.layers; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, layerStep * i, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 中心點
    ctx.fillStyle = 'rgba(255, 105, 180, 0.5)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
}

// ==================== 隨機生成 ====================

/**
 * 隨機生成曼陀羅
 */
function generateMandala() {
    clearCanvas();

    const maxRadius = Math.min(centerX, centerY) * 0.85;
    const layerStep = maxRadius / config.layers;

    // 為每層生成不同的圖案
    for (let layer = 1; layer <= config.layers; layer++) {
        const radius = layerStep * layer;
        const prevRadius = layerStep * (layer - 1);

        // 隨機選擇圖案類型
        const patternType = Math.floor(Math.random() * 5);

        switch (patternType) {
            case 0:
                generateDots(radius, layer);
                break;
            case 1:
                generatePetals(radius, prevRadius, layer);
                break;
            case 2:
                generateWaves(radius, layer);
                break;
            case 3:
                generateSpirals(radius, prevRadius, layer);
                break;
            case 4:
                generateGeometric(radius, prevRadius, layer);
                break;
        }
    }

    // 中心裝飾
    generateCenter();
}

/**
 * 生成點狀圖案
 */
function generateDots(radius, layer) {
    const dotCount = config.symmetry * (layer + 1);
    const angleStep = (Math.PI * 2) / dotCount;
    const dotSize = config.brushSize * (1 + layer * 0.3);

    for (let i = 0; i < dotCount; i++) {
        const angle = angleStep * i;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.fillStyle = getColor(x, y);
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * 生成花瓣圖案
 */
function generatePetals(radius, innerRadius, layer) {
    const petalCount = config.symmetry;
    const angleStep = (Math.PI * 2) / petalCount;

    for (let i = 0; i < petalCount; i++) {
        const angle = angleStep * i;
        const nextAngle = angleStep * (i + 0.5);

        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(nextAngle) * radius;
        const y2 = centerY + Math.sin(nextAngle) * radius;
        const x3 = centerX + Math.cos(angle + angleStep) * innerRadius;
        const y3 = centerY + Math.sin(angle + angleStep) * innerRadius;

        ctx.strokeStyle = getColor(x2, y2);
        ctx.lineWidth = config.brushSize * 0.8;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(x2, y2, x3, y3);
        ctx.stroke();
    }
}

/**
 * 生成波浪圖案
 */
function generateWaves(radius, layer) {
    const waveCount = config.symmetry * 2;
    const points = [];

    for (let i = 0; i <= waveCount; i++) {
        const angle = (i / waveCount) * Math.PI * 2;
        const waveR = radius + Math.sin(angle * config.symmetry) * (radius * 0.1);
        points.push({
            x: centerX + Math.cos(angle) * waveR,
            y: centerY + Math.sin(angle) * waveR
        });
    }

    ctx.strokeStyle = getColor(centerX + radius, centerY);
    ctx.lineWidth = config.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.stroke();
}

/**
 * 生成螺旋圖案
 */
function generateSpirals(radius, innerRadius, layer) {
    const spiralCount = config.symmetry;
    const angleStep = (Math.PI * 2) / spiralCount;
    const steps = 20;

    for (let s = 0; s < spiralCount; s++) {
        const baseAngle = angleStep * s;
        const points = [];

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const r = innerRadius + (radius - innerRadius) * t;
            const angle = baseAngle + t * Math.PI * 0.5;
            points.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r
            });
        }

        ctx.strokeStyle = getColor(points[steps].x, points[steps].y);
        ctx.lineWidth = config.brushSize * 0.7;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
    }
}

/**
 * 生成幾何圖案
 */
function generateGeometric(radius, innerRadius, layer) {
    const shapeCount = config.symmetry;
    const angleStep = (Math.PI * 2) / shapeCount;

    // 連接線
    for (let i = 0; i < shapeCount; i++) {
        const angle = angleStep * i;
        const nextAngle = angleStep * (i + 1);

        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(nextAngle) * innerRadius;
        const y2 = centerY + Math.sin(nextAngle) * innerRadius;

        ctx.strokeStyle = getColor(x1, y1);
        ctx.lineWidth = config.brushSize * 0.6;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // 外圈點
    for (let i = 0; i < shapeCount; i++) {
        const angle = angleStep * i;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.fillStyle = getColor(x, y);
        ctx.beginPath();
        ctx.arc(x, y, config.brushSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * 生成中心裝飾
 */
function generateCenter() {
    const centerRadius = Math.min(centerX, centerY) * 0.1;

    // 中心圓
    ctx.fillStyle = getColor(centerX, centerY);
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    ctx.fill();

    // 中心花瓣
    const petalCount = config.symmetry;
    const angleStep = (Math.PI * 2) / petalCount;

    for (let i = 0; i < petalCount; i++) {
        const angle = angleStep * i;
        const x = centerX + Math.cos(angle) * centerRadius * 1.5;
        const y = centerY + Math.sin(angle) * centerRadius * 1.5;

        ctx.fillStyle = getColor(x, y);
        ctx.beginPath();
        ctx.arc(x, y, centerRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    // 最中心點
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, config.brushSize, 0, Math.PI * 2);
    ctx.fill();
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    clearCanvas();
}

// ==================== 事件處理 ====================

function getEventPos(e) {
    if (e.touches) {
        return {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }
    return {
        x: e.clientX,
        y: e.clientY
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
    e.preventDefault();

    const pos = getEventPos(e);
    drawSymmetricPoint(pos.x, pos.y, lastX, lastY);
    lastX = pos.x;
    lastY = pos.y;
    hue = (hue + 0.5) % 360;
}

function stopDrawing() {
    isDrawing = false;
}

// 滑鼠事件
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// 觸控事件
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e);
});
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

// 視窗調整
window.addEventListener('resize', resizeCanvas);

// 控制項
document.getElementById('symmetry').addEventListener('input', (e) => {
    config.symmetry = parseInt(e.target.value);
    document.getElementById('symmetryValue').textContent = config.symmetry;
    document.getElementById('symmetryDisplay').textContent = config.symmetry;
    clearCanvas();
});

document.getElementById('layers').addEventListener('input', (e) => {
    config.layers = parseInt(e.target.value);
    document.getElementById('layersValue').textContent = config.layers;
    document.getElementById('layersDisplay').textContent = config.layers;
    clearCanvas();
});

document.getElementById('brushSize').addEventListener('input', (e) => {
    config.brushSize = parseInt(e.target.value);
    document.getElementById('brushSizeValue').textContent = config.brushSize;
});

document.getElementById('colorScheme').addEventListener('change', (e) => {
    config.colorScheme = e.target.value;
});

document.getElementById('mirror').addEventListener('change', (e) => {
    config.mirror = e.target.checked;
});

document.getElementById('clearBtn').addEventListener('click', clearCanvas);
document.getElementById('generateBtn').addEventListener('click', generateMandala);

// ==================== 啟動 ====================

resizeCanvas();
