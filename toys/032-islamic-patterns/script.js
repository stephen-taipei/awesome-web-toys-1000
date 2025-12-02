/**
 * Islamic Patterns 伊斯蘭圖案
 * Web Toys #032
 *
 * 互動式伊斯蘭幾何藝術，包含八角星、吉里赫等圖案
 *
 * 技術重點：
 * - 幾何瓷磚系統
 * - 對稱與鏡射
 * - 複雜圖案生成
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('patternCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    pattern: 'eightfold',
    complexity: 3,
    tileSize: 100,
    rotation: 0.2,
    colorScheme: 'moroccan',
    showGrid: false
};

let time = 0;
let centerX, centerY;

// ==================== 顏色方案 ====================

const colorSchemes = {
    moroccan: {
        primary: '#1e90ff',
        secondary: '#ffd700',
        tertiary: '#32cd32',
        accent: '#ff6347',
        background: '#1a0a0a',
        line: '#c89664'
    },
    persian: {
        primary: '#4169e1',
        secondary: '#dc143c',
        tertiary: '#2e8b57',
        accent: '#ffa500',
        background: '#0f0a14',
        line: '#e8d4b8'
    },
    ottoman: {
        primary: '#8b0000',
        secondary: '#4682b4',
        tertiary: '#daa520',
        accent: '#228b22',
        background: '#0a0a14',
        line: '#f5deb3'
    },
    andalusian: {
        primary: '#006400',
        secondary: '#8b4513',
        tertiary: '#4169e1',
        accent: '#ffd700',
        background: '#0f0f0a',
        line: '#d4a574'
    },
    mono: {
        primary: '#ffffff',
        secondary: '#cccccc',
        tertiary: '#999999',
        accent: '#666666',
        background: '#0a0a0a',
        line: '#ffffff'
    }
};

// ==================== 繪製基本形狀 ====================

/**
 * 繪製多邊形
 */
function drawPolygon(cx, cy, radius, sides, rotation = 0, fill = false) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + rotation - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (fill) ctx.fill();
    ctx.stroke();
}

/**
 * 繪製星形
 */
function drawStar(cx, cy, outerR, innerR, points, rotation = 0, fill = false) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2 + rotation - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (fill) ctx.fill();
    ctx.stroke();
}

/**
 * 繪製交織線條
 */
function drawInterlacedLine(x1, y1, x2, y2, over = true) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len * 3;
    const ny = dx / len * 3;

    if (over) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(x1 + nx, y1 + ny);
        ctx.lineTo(x2 + nx, y2 + ny);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1 - nx, y1 - ny);
        ctx.lineTo(x2 - nx, y2 - ny);
        ctx.stroke();
    }
}

// ==================== 伊斯蘭圖案 ====================

/**
 * 八角星圖案
 */
function drawEightfoldPattern(cx, cy, size, rotation) {
    const scheme = colorSchemes[config.colorScheme];
    const r = size / 2;

    // 外層八角星
    ctx.strokeStyle = scheme.line;
    ctx.lineWidth = 2;
    drawStar(cx, cy, r, r * 0.4, 8, rotation);

    // 內層八角形
    ctx.strokeStyle = scheme.primary;
    ctx.lineWidth = 1.5;
    drawPolygon(cx, cy, r * 0.6, 8, rotation);

    // 中心八角星
    if (config.complexity >= 2) {
        ctx.strokeStyle = scheme.secondary;
        drawStar(cx, cy, r * 0.35, r * 0.15, 8, rotation + Math.PI / 8);
    }

    // 連接線
    if (config.complexity >= 3) {
        ctx.strokeStyle = scheme.tertiary;
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + rotation;
            const x1 = cx + Math.cos(angle) * r * 0.6;
            const y1 = cy + Math.sin(angle) * r * 0.6;
            const x2 = cx + Math.cos(angle) * r;
            const y2 = cy + Math.sin(angle) * r;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    // 額外裝飾
    if (config.complexity >= 4) {
        ctx.strokeStyle = scheme.accent;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + rotation + Math.PI / 8;
            const x = cx + Math.cos(angle) * r * 0.75;
            const y = cy + Math.sin(angle) * r * 0.75;
            drawPolygon(x, y, r * 0.1, 4, rotation);
        }
    }
}

/**
 * 六角星圖案
 */
function drawSixfoldPattern(cx, cy, size, rotation) {
    const scheme = colorSchemes[config.colorScheme];
    const r = size / 2;

    // 六角星（大衛之星）
    ctx.strokeStyle = scheme.line;
    ctx.lineWidth = 2;
    drawPolygon(cx, cy, r, 3, rotation);
    drawPolygon(cx, cy, r, 3, rotation + Math.PI);

    // 內層六角形
    ctx.strokeStyle = scheme.primary;
    ctx.lineWidth = 1.5;
    drawPolygon(cx, cy, r * 0.5, 6, rotation + Math.PI / 6);

    if (config.complexity >= 2) {
        // 連接線形成花瓣
        ctx.strokeStyle = scheme.secondary;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + rotation;
            const nextAngle = ((i + 1) / 6) * Math.PI * 2 + rotation;

            const x1 = cx + Math.cos(angle) * r * 0.5;
            const y1 = cy + Math.sin(angle) * r * 0.5;
            const x2 = cx + Math.cos((angle + nextAngle) / 2) * r * 0.8;
            const y2 = cy + Math.sin((angle + nextAngle) / 2) * r * 0.8;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(
                cx + Math.cos((angle + nextAngle) / 2) * r * 0.3,
                cy + Math.sin((angle + nextAngle) / 2) * r * 0.3,
                x2, y2
            );
            ctx.stroke();
        }
    }

    if (config.complexity >= 3) {
        // 中心圖案
        ctx.strokeStyle = scheme.tertiary;
        drawStar(cx, cy, r * 0.25, r * 0.12, 6, rotation);
    }
}

/**
 * 十二角星圖案
 */
function drawTwelvefoldPattern(cx, cy, size, rotation) {
    const scheme = colorSchemes[config.colorScheme];
    const r = size / 2;

    // 外層十二角星
    ctx.strokeStyle = scheme.line;
    ctx.lineWidth = 2;
    drawStar(cx, cy, r, r * 0.5, 12, rotation);

    // 內層十二角形
    ctx.strokeStyle = scheme.primary;
    ctx.lineWidth = 1.5;
    drawPolygon(cx, cy, r * 0.65, 12, rotation + Math.PI / 12);

    if (config.complexity >= 2) {
        // 交織圖案
        ctx.strokeStyle = scheme.secondary;
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + rotation;
            const x1 = cx + Math.cos(angle) * r * 0.3;
            const y1 = cy + Math.sin(angle) * r * 0.3;
            const x2 = cx + Math.cos(angle) * r * 0.65;
            const y2 = cy + Math.sin(angle) * r * 0.65;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    if (config.complexity >= 3) {
        // 中心六角星
        ctx.strokeStyle = scheme.tertiary;
        drawStar(cx, cy, r * 0.25, r * 0.1, 6, rotation);
    }

    if (config.complexity >= 4) {
        // 外層裝飾
        ctx.strokeStyle = scheme.accent;
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + rotation;
            const x = cx + Math.cos(angle) * r * 0.85;
            const y = cy + Math.sin(angle) * r * 0.85;
            drawPolygon(x, y, r * 0.08, 3, rotation + angle);
        }
    }
}

/**
 * 吉里赫瓷磚圖案
 */
function drawGirihPattern(cx, cy, size, rotation) {
    const scheme = colorSchemes[config.colorScheme];
    const r = size / 2;

    // 主要十角形
    ctx.strokeStyle = scheme.line;
    ctx.lineWidth = 2;
    drawPolygon(cx, cy, r, 10, rotation);

    // 內部交織線條
    ctx.strokeStyle = scheme.primary;
    ctx.lineWidth = 1.5;

    const points = [];
    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 + rotation;
        points.push({
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r
        });
    }

    // 連接交替頂點
    for (let i = 0; i < 10; i++) {
        const j = (i + 3) % 10;
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();
    }

    if (config.complexity >= 2) {
        // 內層五邊形
        ctx.strokeStyle = scheme.secondary;
        drawPolygon(cx, cy, r * 0.4, 5, rotation + Math.PI / 10);
        drawPolygon(cx, cy, r * 0.4, 5, rotation - Math.PI / 10);
    }

    if (config.complexity >= 3) {
        // 中心十角星
        ctx.strokeStyle = scheme.tertiary;
        drawStar(cx, cy, r * 0.3, r * 0.15, 10, rotation);
    }

    if (config.complexity >= 4) {
        // 邊緣裝飾
        ctx.strokeStyle = scheme.accent;
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2 + rotation;
            const nextAngle = ((i + 1) / 10) * Math.PI * 2 + rotation;
            const midX = cx + Math.cos((angle + nextAngle) / 2) * r * 0.85;
            const midY = cy + Math.sin((angle + nextAngle) / 2) * r * 0.85;
            drawPolygon(midX, midY, r * 0.08, 5, rotation);
        }
    }
}

/**
 * 澤利赫馬賽克圖案
 */
function drawZelligePattern(cx, cy, size, rotation) {
    const scheme = colorSchemes[config.colorScheme];
    const r = size / 2;

    // 使用多個小形狀組成馬賽克效果
    const colors = [scheme.primary, scheme.secondary, scheme.tertiary, scheme.accent];

    // 中心八角形
    ctx.fillStyle = colors[0];
    ctx.strokeStyle = scheme.line;
    ctx.lineWidth = 1;
    drawPolygon(cx, cy, r * 0.4, 8, rotation, true);

    // 周圍的小三角形和正方形
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + rotation;
        const x = cx + Math.cos(angle) * r * 0.6;
        const y = cy + Math.sin(angle) * r * 0.6;

        ctx.fillStyle = colors[(i + 1) % 4];
        drawPolygon(x, y, r * 0.15, i % 2 === 0 ? 3 : 4, rotation + angle, true);
    }

    if (config.complexity >= 2) {
        // 外層裝飾
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + rotation + Math.PI / 8;
            const x = cx + Math.cos(angle) * r * 0.85;
            const y = cy + Math.sin(angle) * r * 0.85;

            ctx.fillStyle = colors[(i + 2) % 4];
            drawPolygon(x, y, r * 0.12, 4, rotation, true);
        }
    }

    if (config.complexity >= 3) {
        // 連接線
        ctx.strokeStyle = scheme.line;
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + rotation;
            const x1 = cx + Math.cos(angle) * r * 0.4;
            const y1 = cy + Math.sin(angle) * r * 0.4;
            const x2 = cx + Math.cos(angle) * r;
            const y2 = cy + Math.sin(angle) * r;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    // 外框
    ctx.strokeStyle = scheme.line;
    ctx.lineWidth = 2;
    drawPolygon(cx, cy, r, 8, rotation);
}

// ==================== 瓷磚系統 ====================

/**
 * 繪製瓷磚網格
 */
function drawTileGrid() {
    const scheme = colorSchemes[config.colorScheme];
    const size = config.tileSize;
    const rotation = time * config.rotation * 0.01;

    const cols = Math.ceil(canvas.width / size) + 2;
    const rows = Math.ceil(canvas.height / size) + 2;

    const offsetX = (canvas.width - cols * size) / 2;
    const offsetY = (canvas.height - rows * size) / 2;

    // 根據圖案類型決定偏移
    const isHexPattern = config.pattern === 'sixfold';
    const hexOffset = isHexPattern ? size * 0.5 : 0;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let x = offsetX + col * size + size / 2;
            let y = offsetY + row * size + size / 2;

            // 六角形排列偏移
            if (isHexPattern && row % 2 === 1) {
                x += hexOffset;
            }

            // 繪製網格（如果啟用）
            if (config.showGrid) {
                ctx.strokeStyle = 'rgba(200, 150, 100, 0.2)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x - size / 2, y - size / 2, size, size);
            }

            // 繪製圖案
            switch (config.pattern) {
                case 'eightfold':
                    drawEightfoldPattern(x, y, size * 0.9, rotation);
                    break;
                case 'sixfold':
                    drawSixfoldPattern(x, y, size * 0.9, rotation);
                    break;
                case 'twelvefold':
                    drawTwelvefoldPattern(x, y, size * 0.9, rotation);
                    break;
                case 'girih':
                    drawGirihPattern(x, y, size * 0.9, rotation);
                    break;
                case 'zellige':
                    drawZelligePattern(x, y, size * 0.9, rotation);
                    break;
            }
        }
    }
}

// ==================== 主繪製函數 ====================

function draw() {
    const scheme = colorSchemes[config.colorScheme];

    // 清除畫布
    ctx.fillStyle = scheme.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製瓷磚圖案
    drawTileGrid();
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
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('pattern').addEventListener('change', (e) => {
    config.pattern = e.target.value;
    const names = {
        eightfold: '八角星',
        sixfold: '六角星',
        twelvefold: '十二角星',
        girih: '吉里赫瓷磚',
        zellige: '澤利赫馬賽克'
    };
    document.getElementById('patternName').textContent = names[config.pattern];
});

document.getElementById('complexity').addEventListener('input', (e) => {
    config.complexity = parseInt(e.target.value);
    document.getElementById('complexityValue').textContent = config.complexity;
});

document.getElementById('tileSize').addEventListener('input', (e) => {
    config.tileSize = parseInt(e.target.value);
    document.getElementById('tileSizeValue').textContent = config.tileSize;
});

document.getElementById('rotation').addEventListener('input', (e) => {
    config.rotation = parseFloat(e.target.value);
    document.getElementById('rotationValue').textContent = config.rotation.toFixed(1);
});

document.getElementById('colorScheme').addEventListener('change', (e) => {
    config.colorScheme = e.target.value;
});

document.getElementById('showGrid').addEventListener('change', (e) => {
    config.showGrid = e.target.checked;
});

// ==================== 啟動 ====================

resizeCanvas();
requestAnimationFrame(animate);
