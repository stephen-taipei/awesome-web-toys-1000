/**
 * Celtic Knots 凱爾特結
 * Web Toys #033
 *
 * 互動式凱爾特結圖案生成器
 *
 * 技術重點：
 * - 貝茲曲線繪製
 * - 交織效果（上下穿越）
 * - 對稱圖案生成
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('knotCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    pattern: 'triquetra',
    complexity: 3,
    scale: 1,
    lineWidth: 12,
    colorScheme: 'gold',
    animate: true
};

let time = 0;
let centerX, centerY, baseRadius;

// ==================== 顏色方案 ====================

const colorSchemes = {
    gold: {
        primary: '#c9a227',
        secondary: '#ffd700',
        outline: '#8b6914',
        background: '#0a1a0a',
        glow: 'rgba(201, 162, 39, 0.3)'
    },
    green: {
        primary: '#228b22',
        secondary: '#32cd32',
        outline: '#006400',
        background: '#0a0a14',
        glow: 'rgba(34, 139, 34, 0.3)'
    },
    silver: {
        primary: '#c0c0c0',
        secondary: '#e8e8e8',
        outline: '#808080',
        background: '#0a0a0f',
        glow: 'rgba(192, 192, 192, 0.3)'
    },
    rainbow: {
        primary: (t) => `hsl(${t % 360}, 70%, 50%)`,
        secondary: (t) => `hsl(${(t + 30) % 360}, 80%, 60%)`,
        outline: (t) => `hsl(${t % 360}, 60%, 30%)`,
        background: '#0a0a0a',
        glow: 'rgba(255, 255, 255, 0.2)'
    },
    bronze: {
        primary: '#cd7f32',
        secondary: '#daa06d',
        outline: '#8b4513',
        background: '#0f0a0a',
        glow: 'rgba(205, 127, 50, 0.3)'
    }
};

// ==================== 繪製函數 ====================

/**
 * 取得顏色（支援動態顏色）
 */
function getColor(scheme, colorType, t = 0) {
    const color = scheme[colorType];
    if (typeof color === 'function') {
        return color(t);
    }
    return color;
}

/**
 * 繪製帶邊框的曲線段
 */
function drawKnotSegment(points, isOver = true) {
    const scheme = colorSchemes[config.colorScheme];
    const lw = config.lineWidth;

    // 外框
    ctx.strokeStyle = getColor(scheme, 'outline', time);
    ctx.lineWidth = lw + 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // 主線
    ctx.strokeStyle = getColor(scheme, 'primary', time);
    ctx.lineWidth = lw;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // 高光
    ctx.strokeStyle = getColor(scheme, 'secondary', time);
    ctx.lineWidth = lw * 0.3;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
}

/**
 * 繪製貝茲曲線段
 */
function drawBezierKnot(p0, p1, p2, p3) {
    const scheme = colorSchemes[config.colorScheme];
    const lw = config.lineWidth;

    // 外框
    ctx.strokeStyle = getColor(scheme, 'outline', time);
    ctx.lineWidth = lw + 4;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    ctx.stroke();

    // 主線
    ctx.strokeStyle = getColor(scheme, 'primary', time);
    ctx.lineWidth = lw;

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    ctx.stroke();

    // 高光
    ctx.strokeStyle = getColor(scheme, 'secondary', time);
    ctx.lineWidth = lw * 0.3;

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    ctx.stroke();
}

// ==================== 凱爾特結圖案 ====================

/**
 * 三角結 (Triquetra)
 */
function drawTriquetra(cx, cy, r, rotation) {
    const scheme = colorSchemes[config.colorScheme];

    // 繪製三個交織的弧形
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 + rotation;
        const nextAngle = ((i + 1) / 3) * Math.PI * 2 + rotation;

        // 外弧
        const x1 = cx + Math.cos(angle) * r;
        const y1 = cy + Math.sin(angle) * r;
        const x2 = cx + Math.cos(nextAngle) * r;
        const y2 = cy + Math.sin(nextAngle) * r;

        // 控制點
        const midAngle = (angle + nextAngle) / 2;
        const cp1x = cx + Math.cos(angle + 0.3) * r * 1.3;
        const cp1y = cy + Math.sin(angle + 0.3) * r * 1.3;
        const cp2x = cx + Math.cos(nextAngle - 0.3) * r * 1.3;
        const cp2y = cy + Math.sin(nextAngle - 0.3) * r * 1.3;

        drawBezierKnot(
            { x: x1, y: y1 },
            { x: cp1x, y: cp1y },
            { x: cp2x, y: cp2y },
            { x: x2, y: y2 }
        );

        // 內弧（連接到中心）
        if (config.complexity >= 2) {
            const innerR = r * 0.3;
            const ix1 = cx + Math.cos(angle) * innerR;
            const iy1 = cy + Math.sin(angle) * innerR;

            const icp1x = cx + Math.cos(angle - 0.5) * r * 0.6;
            const icp1y = cy + Math.sin(angle - 0.5) * r * 0.6;
            const icp2x = cx + Math.cos(angle) * r * 0.5;
            const icp2y = cy + Math.sin(angle) * r * 0.5;

            drawBezierKnot(
                { x: ix1, y: iy1 },
                { x: icp1x, y: icp1y },
                { x: icp2x, y: icp2y },
                { x: x1, y: y1 }
            );
        }
    }

    // 中心圓
    if (config.complexity >= 3) {
        ctx.strokeStyle = getColor(scheme, 'outline', time);
        ctx.lineWidth = config.lineWidth + 4;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = getColor(scheme, 'primary', time);
        ctx.lineWidth = config.lineWidth;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 外圓
    if (config.complexity >= 4) {
        ctx.strokeStyle = getColor(scheme, 'outline', time);
        ctx.lineWidth = config.lineWidth * 0.5 + 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = getColor(scheme, 'primary', time);
        ctx.lineWidth = config.lineWidth * 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
        ctx.stroke();
    }
}

/**
 * 四元結 (Quaternary Knot)
 */
function drawQuaternaryKnot(cx, cy, r, rotation) {
    const scheme = colorSchemes[config.colorScheme];

    // 四個交織的環
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + rotation;
        const nextAngle = ((i + 1) / 4) * Math.PI * 2 + rotation;

        // 外弧
        const x1 = cx + Math.cos(angle) * r;
        const y1 = cy + Math.sin(angle) * r;
        const x2 = cx + Math.cos(nextAngle) * r;
        const y2 = cy + Math.sin(nextAngle) * r;

        const midAngle = (angle + nextAngle) / 2;
        const cp1x = cx + Math.cos(midAngle) * r * 1.4;
        const cp1y = cy + Math.sin(midAngle) * r * 1.4;

        // 使用二次曲線
        ctx.strokeStyle = getColor(scheme, 'outline', time);
        ctx.lineWidth = config.lineWidth + 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cp1x, cp1y, x2, y2);
        ctx.stroke();

        ctx.strokeStyle = getColor(scheme, 'primary', time);
        ctx.lineWidth = config.lineWidth;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cp1x, cp1y, x2, y2);
        ctx.stroke();

        ctx.strokeStyle = getColor(scheme, 'secondary', time);
        ctx.lineWidth = config.lineWidth * 0.3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cp1x, cp1y, x2, y2);
        ctx.stroke();

        // 內部連接
        if (config.complexity >= 2) {
            const innerR = r * 0.4;
            const ix = cx + Math.cos(angle + Math.PI / 4) * innerR;
            const iy = cy + Math.sin(angle + Math.PI / 4) * innerR;

            ctx.strokeStyle = getColor(scheme, 'outline', time);
            ctx.lineWidth = config.lineWidth + 4;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(ix, iy);
            ctx.stroke();

            ctx.strokeStyle = getColor(scheme, 'primary', time);
            ctx.lineWidth = config.lineWidth;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(ix, iy);
            ctx.stroke();
        }
    }

    // 中心正方形
    if (config.complexity >= 3) {
        const sq = r * 0.3;
        ctx.strokeStyle = getColor(scheme, 'outline', time);
        ctx.lineWidth = config.lineWidth * 0.7 + 2;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + rotation + Math.PI / 4;
            const x = cx + Math.cos(angle) * sq;
            const y = cy + Math.sin(angle) * sq;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = getColor(scheme, 'primary', time);
        ctx.lineWidth = config.lineWidth * 0.7;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + rotation + Math.PI / 4;
            const x = cx + Math.cos(angle) * sq;
            const y = cy + Math.sin(angle) * sq;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }
}

/**
 * 螺旋結 (Spiral Knot)
 */
function drawSpiralKnot(cx, cy, r, rotation) {
    const scheme = colorSchemes[config.colorScheme];
    const turns = config.complexity + 1;

    // 繪製雙螺旋
    for (let spiral = 0; spiral < 2; spiral++) {
        const offset = spiral * Math.PI;
        const points = [];

        for (let i = 0; i <= turns * 20; i++) {
            const t = i / 20;
            const angle = t * Math.PI * 2 + rotation + offset;
            const radius = r * 0.2 + (r * 0.8 * t / turns);
            points.push({
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            });
        }

        // 繪製螺旋
        ctx.strokeStyle = getColor(scheme, 'outline', time);
        ctx.lineWidth = config.lineWidth + 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();

        ctx.strokeStyle = getColor(scheme, 'primary', time + spiral * 60);
        ctx.lineWidth = config.lineWidth;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();

        ctx.strokeStyle = getColor(scheme, 'secondary', time + spiral * 60);
        ctx.lineWidth = config.lineWidth * 0.3;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
    }

    // 中心點
    ctx.fillStyle = getColor(scheme, 'primary', time);
    ctx.beginPath();
    ctx.arc(cx, cy, config.lineWidth * 0.8, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * 交織結 (Interlace Knot)
 */
function drawInterlaceKnot(cx, cy, r, rotation) {
    const scheme = colorSchemes[config.colorScheme];
    const segments = 6 + config.complexity * 2;

    // 繪製交織圖案
    for (let layer = 0; layer < 2; layer++) {
        const layerOffset = layer * Math.PI / segments;

        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2 + rotation + layerOffset;
            const nextAngle = ((i + 1) / segments) * Math.PI * 2 + rotation + layerOffset;

            const x1 = cx + Math.cos(angle) * r;
            const y1 = cy + Math.sin(angle) * r;
            const x2 = cx + Math.cos(nextAngle) * r;
            const y2 = cy + Math.sin(nextAngle) * r;

            // 到對角的連線
            const oppAngle = angle + Math.PI;
            const ox = cx + Math.cos(oppAngle) * r * 0.5;
            const oy = cy + Math.sin(oppAngle) * r * 0.5;

            const midAngle = (angle + nextAngle) / 2;
            const cpx = cx + Math.cos(midAngle) * r * 0.3;
            const cpy = cy + Math.sin(midAngle) * r * 0.3;

            drawBezierKnot(
                { x: x1, y: y1 },
                { x: cpx, y: cpy },
                { x: cpx, y: cpy },
                { x: ox, y: oy }
            );
        }
    }

    // 外圈
    ctx.strokeStyle = getColor(scheme, 'outline', time);
    ctx.lineWidth = config.lineWidth * 0.5 + 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = getColor(scheme, 'primary', time);
    ctx.lineWidth = config.lineWidth * 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2);
    ctx.stroke();
}

/**
 * 盾牌結 (Shield Knot)
 */
function drawShieldKnot(cx, cy, r, rotation) {
    const scheme = colorSchemes[config.colorScheme];

    // 外框四角
    const corners = [];
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + rotation + Math.PI / 4;
        corners.push({
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r
        });
    }

    // 繪製四條邊
    for (let i = 0; i < 4; i++) {
        const p1 = corners[i];
        const p2 = corners[(i + 1) % 4];

        drawKnotSegment([p1, p2]);
    }

    // 內部交織
    if (config.complexity >= 2) {
        const innerR = r * 0.5;
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + rotation + Math.PI / 4;
            const x = cx + Math.cos(angle) * innerR;
            const y = cy + Math.sin(angle) * innerR;

            // 連接到角落
            drawKnotSegment([
                { x: corners[i].x, y: corners[i].y },
                { x: x, y: y }
            ]);
        }

        // 內部正方形
        const innerCorners = [];
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + rotation + Math.PI / 4;
            innerCorners.push({
                x: cx + Math.cos(angle) * innerR,
                y: cy + Math.sin(angle) * innerR
            });
        }

        for (let i = 0; i < 4; i++) {
            drawKnotSegment([innerCorners[i], innerCorners[(i + 1) % 4]]);
        }
    }

    // 中心裝飾
    if (config.complexity >= 3) {
        const centerR = r * 0.2;
        ctx.strokeStyle = getColor(scheme, 'outline', time);
        ctx.lineWidth = config.lineWidth + 4;
        ctx.beginPath();
        ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = getColor(scheme, 'primary', time);
        ctx.lineWidth = config.lineWidth;
        ctx.beginPath();
        ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
        ctx.stroke();

        // 十字
        if (config.complexity >= 4) {
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 + rotation;
                const x1 = cx + Math.cos(angle) * centerR * 0.5;
                const y1 = cy + Math.sin(angle) * centerR * 0.5;
                const x2 = cx + Math.cos(angle) * innerR;
                const y2 = cy + Math.sin(angle) * innerR;

                ctx.strokeStyle = getColor(scheme, 'outline', time);
                ctx.lineWidth = config.lineWidth * 0.6 + 2;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                ctx.strokeStyle = getColor(scheme, 'primary', time);
                ctx.lineWidth = config.lineWidth * 0.6;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
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

    // 計算中心和半徑
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    baseRadius = Math.min(centerX, centerY) * 0.4 * config.scale;

    // 旋轉動畫
    const rotation = config.animate ? time * 0.005 : 0;

    // 發光效果
    ctx.shadowBlur = 20;
    ctx.shadowColor = scheme.glow;

    // 根據選擇繪製不同圖案
    switch (config.pattern) {
        case 'triquetra':
            drawTriquetra(centerX, centerY, baseRadius, rotation);
            break;
        case 'quaternary':
            drawQuaternaryKnot(centerX, centerY, baseRadius, rotation);
            break;
        case 'spiral':
            drawSpiralKnot(centerX, centerY, baseRadius, rotation);
            break;
        case 'interlace':
            drawInterlaceKnot(centerX, centerY, baseRadius, rotation);
            break;
        case 'shield':
            drawShieldKnot(centerX, centerY, baseRadius, rotation);
            break;
    }

    ctx.shadowBlur = 0;
}

// ==================== 動畫迴圈 ====================

function animate() {
    if (config.animate) {
        time++;
    }
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
        triquetra: '三角結',
        quaternary: '四元結',
        spiral: '螺旋結',
        interlace: '交織結',
        shield: '盾牌結'
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

document.getElementById('lineWidth').addEventListener('input', (e) => {
    config.lineWidth = parseInt(e.target.value);
    document.getElementById('lineWidthValue').textContent = config.lineWidth;
});

document.getElementById('colorScheme').addEventListener('change', (e) => {
    config.colorScheme = e.target.value;
});

document.getElementById('animate').addEventListener('change', (e) => {
    config.animate = e.target.checked;
});

// ==================== 啟動 ====================

resizeCanvas();
requestAnimationFrame(animate);
