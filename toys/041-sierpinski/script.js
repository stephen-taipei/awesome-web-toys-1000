/**
 * Sierpinski 謝爾賓斯基三角形
 * Web Toys #041
 *
 * 多種謝爾賓斯基分形圖案
 *
 * 技術重點：
 * - 遞迴細分
 * - 多邊形生成
 * - 分形維度
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('sierpinskiCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    fractalType: 'triangle',
    depth: 6,
    rotation: 0,
    colorMode: 'depth',
    animate: false
};

let time = 0;
let shapeCount = 0;

// ==================== 顏色模式 ====================

const colorModes = {
    depth: (depth, maxDepth, index) => {
        const ratio = depth / maxDepth;
        const h = 320 + ratio * 40;
        const l = 40 + ratio * 20;
        return `hsl(${h}, 70%, ${l}%)`;
    },
    rainbow: (depth, maxDepth, index) => {
        const h = (index * 30 + depth * 50) % 360;
        return `hsl(${h}, 75%, 50%)`;
    },
    neon: (depth, maxDepth, index) => {
        const colors = ['#ff00ff', '#00ffff', '#ff0088', '#00ff88', '#8800ff'];
        return colors[depth % colors.length];
    },
    mono: () => '#c86496'
};

// ==================== 繪製多邊形 ====================

function drawPolygon(points, color) {
    if (points.length < 3) return;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();

    shapeCount++;
}

function getMidpoint(p1, p2) {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
    };
}

// ==================== 謝爾賓斯基三角形 ====================

function sierpinskiTriangle(p1, p2, p3, depth, index = 0) {
    if (depth <= 0) {
        const colorFn = colorModes[config.colorMode];
        const color = colorFn(config.depth - depth, config.depth, index);
        drawPolygon([p1, p2, p3], color);
        return;
    }

    const m1 = getMidpoint(p1, p2);
    const m2 = getMidpoint(p2, p3);
    const m3 = getMidpoint(p3, p1);

    // 遞迴繪製三個子三角形
    sierpinskiTriangle(p1, m1, m3, depth - 1, index * 3);
    sierpinskiTriangle(m1, p2, m2, depth - 1, index * 3 + 1);
    sierpinskiTriangle(m3, m2, p3, depth - 1, index * 3 + 2);
}

// ==================== 謝爾賓斯基地毯 ====================

function sierpinskiCarpet(x, y, size, depth, index = 0) {
    if (depth <= 0) {
        const colorFn = colorModes[config.colorMode];
        const color = colorFn(config.depth - depth, config.depth, index);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
        shapeCount++;
        return;
    }

    const newSize = size / 3;

    let subIndex = 0;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            // 跳過中間的正方形
            if (row === 1 && col === 1) continue;

            sierpinskiCarpet(
                x + col * newSize,
                y + row * newSize,
                newSize,
                depth - 1,
                index * 8 + subIndex
            );
            subIndex++;
        }
    }
}

// ==================== 謝爾賓斯基墊片（混沌遊戲） ====================

function sierpinskiGasket(vertices, iterations) {
    let x = canvas.width / 2;
    let y = canvas.height / 2;

    const colorFn = colorModes[config.colorMode];

    for (let i = 0; i < iterations; i++) {
        // 隨機選擇一個頂點
        const vertex = vertices[Math.floor(Math.random() * vertices.length)];

        // 移動到中點
        x = (x + vertex.x) / 2;
        y = (y + vertex.y) / 2;

        // 繪製點
        const color = colorFn(i % config.depth, config.depth, i);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);

        shapeCount++;
    }
}

// ==================== 謝爾賓斯基五邊形 ====================

function sierpinskiPentagon(cx, cy, radius, depth, index = 0) {
    if (depth <= 0) {
        const colorFn = colorModes[config.colorMode];
        const color = colorFn(config.depth - depth, config.depth, index);

        // 繪製五邊形
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        shapeCount++;
        return;
    }

    const newRadius = radius * 0.38;
    const distance = radius * 0.62;

    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const nx = cx + Math.cos(angle) * distance;
        const ny = cy + Math.sin(angle) * distance;

        sierpinskiPentagon(nx, ny, newRadius, depth - 1, index * 5 + i);
    }
}

// ==================== 主繪製函數 ====================

function draw() {
    // 清除畫布
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapeCount = 0;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(canvas.width, canvas.height) * 0.8;
    const rotation = (config.rotation + (config.animate ? time * 0.5 : 0)) * Math.PI / 180;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.translate(-centerX, -centerY);

    switch (config.fractalType) {
        case 'triangle': {
            const height = size * Math.sqrt(3) / 2;
            const p1 = { x: centerX, y: centerY - height * 0.6 };
            const p2 = { x: centerX - size / 2, y: centerY + height * 0.4 };
            const p3 = { x: centerX + size / 2, y: centerY + height * 0.4 };
            sierpinskiTriangle(p1, p2, p3, config.depth);
            break;
        }
        case 'carpet': {
            sierpinskiCarpet(
                centerX - size / 2,
                centerY - size / 2,
                size,
                config.depth
            );
            break;
        }
        case 'gasket': {
            const height = size * Math.sqrt(3) / 2;
            const vertices = [
                { x: centerX, y: centerY - height * 0.6 },
                { x: centerX - size / 2, y: centerY + height * 0.4 },
                { x: centerX + size / 2, y: centerY + height * 0.4 }
            ];
            sierpinskiGasket(vertices, Math.pow(10, config.depth));
            break;
        }
        case 'pentagon': {
            sierpinskiPentagon(centerX, centerY, size / 2, config.depth);
            break;
        }
    }

    ctx.restore();
    updateInfo();
}

function updateInfo() {
    document.getElementById('depthDisplay').textContent = config.depth;
    document.getElementById('shapeDisplay').textContent = shapeCount;
}

// ==================== 動畫迴圈 ====================

function animate() {
    if (config.animate) {
        time++;
        draw();
    }
    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('fractalType').addEventListener('change', (e) => {
    config.fractalType = e.target.value;
    draw();
});

document.getElementById('depth').addEventListener('input', (e) => {
    config.depth = parseInt(e.target.value);
    document.getElementById('depthValue').textContent = config.depth;
    draw();
});

document.getElementById('rotation').addEventListener('input', (e) => {
    config.rotation = parseInt(e.target.value);
    document.getElementById('rotationValue').textContent = config.rotation;
    if (!config.animate) draw();
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
    draw();
});

document.getElementById('animate').addEventListener('change', (e) => {
    config.animate = e.target.checked;
    if (!config.animate) draw();
});

document.getElementById('generateBtn').addEventListener('click', draw);

// ==================== 啟動 ====================

resizeCanvas();
requestAnimationFrame(animate);
