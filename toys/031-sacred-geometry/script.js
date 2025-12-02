/**
 * Sacred Geometry 神聖幾何
 * Web Toys #031
 *
 * 互動式生命之花、梅塔特隆立方等神聖幾何圖形
 *
 * 技術重點：
 * - SVG/Canvas 幾何計算
 * - 對稱圖形生成
 * - 動態旋轉與縮放
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('geometryCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    pattern: 'flowerOfLife',
    complexity: 3,
    scale: 1,
    rotation: 0.5,
    colorScheme: 'gold',
    showGuides: true
};

let time = 0;
let centerX, centerY, baseRadius;

// ==================== 顏色方案 ====================

const colorSchemes = {
    gold: {
        primary: '#ffd700',
        secondary: '#ff8c00',
        tertiary: '#daa520',
        background: 'rgba(255, 215, 0, 0.1)',
        guide: 'rgba(255, 200, 100, 0.2)'
    },
    rainbow: {
        primary: (i, total) => `hsl(${(i / total) * 360}, 80%, 60%)`,
        secondary: (i, total) => `hsl(${(i / total) * 360 + 30}, 70%, 50%)`,
        tertiary: '#ffffff',
        background: 'rgba(255, 255, 255, 0.05)',
        guide: 'rgba(255, 255, 255, 0.15)'
    },
    cosmic: {
        primary: '#9966ff',
        secondary: '#00ccff',
        tertiary: '#ff66cc',
        background: 'rgba(150, 100, 255, 0.1)',
        guide: 'rgba(150, 100, 255, 0.2)'
    },
    mono: {
        primary: '#ffffff',
        secondary: '#cccccc',
        tertiary: '#999999',
        background: 'rgba(255, 255, 255, 0.05)',
        guide: 'rgba(255, 255, 255, 0.15)'
    }
};

// ==================== 繪製函數 ====================

/**
 * 繪製圓形
 */
function drawCircle(x, y, radius, stroke = true, fill = false) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

/**
 * 繪製六邊形
 */
function drawHexagon(x, y, radius, rotation = 0) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + rotation;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
}

/**
 * 繪製線段
 */
function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// ==================== 神聖幾何圖案 ====================

/**
 * 生命種子 - 7個重疊圓形
 */
function drawSeedOfLife(cx, cy, r, rotation) {
    const scheme = colorSchemes[config.colorScheme];

    // 中心圓
    ctx.strokeStyle = typeof scheme.primary === 'function'
        ? scheme.primary(0, 7) : scheme.primary;
    ctx.lineWidth = 2;
    drawCircle(cx, cy, r);

    // 周圍6個圓
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + rotation;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        ctx.strokeStyle = typeof scheme.primary === 'function'
            ? scheme.primary(i + 1, 7) : scheme.primary;
        drawCircle(x, y, r);
    }
}

/**
 * 生命之花 - 多層重疊圓形
 */
function drawFlowerOfLife(cx, cy, r, rotation, layers) {
    const scheme = colorSchemes[config.colorScheme];
    const drawnCircles = new Set();

    function addCircle(x, y, layer) {
        const key = `${Math.round(x)},${Math.round(y)}`;
        if (drawnCircles.has(key)) return;
        drawnCircles.add(key);

        ctx.strokeStyle = typeof scheme.primary === 'function'
            ? scheme.primary(layer, layers) : scheme.primary;
        ctx.lineWidth = 2 - layer * 0.2;
        ctx.globalAlpha = 1 - layer * 0.1;
        drawCircle(x, y, r);

        if (layer < layers) {
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + rotation;
                const nx = x + Math.cos(angle) * r;
                const ny = y + Math.sin(angle) * r;
                addCircle(nx, ny, layer + 1);
            }
        }
    }

    ctx.globalAlpha = 1;
    addCircle(cx, cy, 0);
    ctx.globalAlpha = 1;

    // 外圍大圓（輔助線）
    if (config.showGuides) {
        ctx.strokeStyle = scheme.guide;
        ctx.lineWidth = 1;
        drawCircle(cx, cy, r * (layers + 1));
        drawCircle(cx, cy, r * (layers + 2));
    }
}

/**
 * 梅塔特隆立方
 */
function drawMetatronsCube(cx, cy, r, rotation) {
    const scheme = colorSchemes[config.colorScheme];

    // 13個頂點位置（生命之花的中心點）
    const points = [];

    // 中心
    points.push({ x: cx, y: cy });

    // 內層6點
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + rotation;
        points.push({
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r
        });
    }

    // 外層6點
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + rotation + Math.PI / 6;
        points.push({
            x: cx + Math.cos(angle) * r * 2,
            y: cy + Math.sin(angle) * r * 2
        });
    }

    // 繪製所有連線
    ctx.strokeStyle = scheme.secondary;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;

    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            drawLine(points[i].x, points[i].y, points[j].x, points[j].y);
        }
    }

    ctx.globalAlpha = 1;

    // 繪製圓形
    ctx.strokeStyle = typeof scheme.primary === 'function'
        ? scheme.primary(0, 13) : scheme.primary;
    ctx.lineWidth = 2;

    points.forEach((p, i) => {
        ctx.strokeStyle = typeof scheme.primary === 'function'
            ? scheme.primary(i, 13) : scheme.primary;
        drawCircle(p.x, p.y, r * 0.5);
    });

    // 外圍圓
    if (config.showGuides) {
        ctx.strokeStyle = scheme.guide;
        ctx.lineWidth = 1;
        drawCircle(cx, cy, r * 2.5);
    }
}

/**
 * 斯里揚特拉 (簡化版)
 */
function drawSriYantra(cx, cy, r, rotation) {
    const scheme = colorSchemes[config.colorScheme];

    // 繪製多層三角形
    const layers = config.complexity + 2;

    for (let layer = 0; layer < layers; layer++) {
        const layerR = r * (1 - layer * 0.12);
        const isUp = layer % 2 === 0;

        ctx.strokeStyle = typeof scheme.primary === 'function'
            ? scheme.primary(layer, layers) : scheme.primary;
        ctx.lineWidth = 2;

        // 向上或向下的三角形
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2 + rotation + (isUp ? -Math.PI / 2 : Math.PI / 2);
            const px = cx + Math.cos(angle) * layerR;
            const py = cy + Math.sin(angle) * layerR;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
    }

    // 中心點
    ctx.fillStyle = scheme.primary;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    // 外圍圓和蓮花
    if (config.showGuides) {
        ctx.strokeStyle = scheme.guide;
        ctx.lineWidth = 1;
        drawCircle(cx, cy, r * 1.1);

        // 蓮花瓣
        const petalCount = 16;
        for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2 + rotation;
            const x1 = cx + Math.cos(angle) * r * 1.1;
            const y1 = cy + Math.sin(angle) * r * 1.1;
            const x2 = cx + Math.cos(angle) * r * 1.25;
            const y2 = cy + Math.sin(angle) * r * 1.25;
            drawLine(x1, y1, x2, y2);
        }
    }
}

/**
 * 環面 (Torus)
 */
function drawTorus(cx, cy, r, rotation) {
    const scheme = colorSchemes[config.colorScheme];
    const rings = 12 + config.complexity * 4;
    const segments = 24;

    ctx.lineWidth = 1;

    // 繪製環形線條
    for (let ring = 0; ring < rings; ring++) {
        const ringAngle = (ring / rings) * Math.PI * 2 + rotation;
        const ringR = r * 0.3;

        ctx.strokeStyle = typeof scheme.primary === 'function'
            ? scheme.primary(ring, rings) : scheme.primary;
        ctx.globalAlpha = 0.6 + Math.sin(ringAngle) * 0.3;

        ctx.beginPath();
        for (let seg = 0; seg <= segments; seg++) {
            const segAngle = (seg / segments) * Math.PI * 2;

            // 環面參數方程
            const torusR = r * 0.7;
            const x = cx + (torusR + ringR * Math.cos(segAngle)) * Math.cos(ringAngle);
            const y = cy + ringR * Math.sin(segAngle);

            // 簡化的 2D 投影
            const projX = x;
            const projY = cy + (y - cy) * 0.5 + (torusR + ringR * Math.cos(segAngle)) * Math.sin(ringAngle) * 0.3;

            if (seg === 0) ctx.moveTo(projX, projY);
            else ctx.lineTo(projX, projY);
        }
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
}

// ==================== 主繪製函數 ====================

function draw() {
    // 清除畫布
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 計算中心和半徑
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    baseRadius = Math.min(centerX, centerY) * 0.3 * config.scale;

    // 旋轉動畫
    const rotation = time * config.rotation * 0.01;

    // 根據選擇繪製不同圖案
    switch (config.pattern) {
        case 'seedOfLife':
            drawSeedOfLife(centerX, centerY, baseRadius, rotation);
            break;
        case 'flowerOfLife':
            drawFlowerOfLife(centerX, centerY, baseRadius, rotation, config.complexity);
            break;
        case 'metatron':
            drawMetatronsCube(centerX, centerY, baseRadius, rotation);
            break;
        case 'sriYantra':
            drawSriYantra(centerX, centerY, baseRadius, rotation);
            break;
        case 'torus':
            drawTorus(centerX, centerY, baseRadius * 1.5, rotation);
            break;
    }
}

// ==================== 動畫迴圈 ====================

function animate() {
    time++;
    draw();
    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('pattern').addEventListener('change', (e) => {
    config.pattern = e.target.value;
    const names = {
        flowerOfLife: '生命之花',
        seedOfLife: '生命種子',
        metatron: '梅塔特隆立方',
        sriYantra: '斯里揚特拉',
        torus: '環面'
    };
    document.getElementById('patternName').textContent = names[config.pattern];
});

document.getElementById('complexity').addEventListener('input', (e) => {
    config.complexity = parseInt(e.target.value);
    document.getElementById('complexityValue').textContent = config.complexity;
});

document.getElementById('scale').addEventListener('input', (e) => {
    config.scale = parseFloat(e.target.value);
    document.getElementById('scaleValue').textContent = config.scale.toFixed(1);
});

document.getElementById('rotation').addEventListener('input', (e) => {
    config.rotation = parseFloat(e.target.value);
    document.getElementById('rotationValue').textContent = config.rotation.toFixed(1);
});

document.getElementById('colorScheme').addEventListener('change', (e) => {
    config.colorScheme = e.target.value;
});

document.getElementById('showGuides').addEventListener('change', (e) => {
    config.showGuides = e.target.checked;
});

// ==================== 啟動 ====================

resizeCanvas();
requestAnimationFrame(animate);
