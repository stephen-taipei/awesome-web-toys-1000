/**
 * Fractal Tree 碎形樹
 * Web Toys #040
 *
 * 互動式碎形樹生成器，支援風動效果
 *
 * 技術重點：
 * - 遞迴分支繪製
 * - 風力物理模擬
 * - 顏色漸變
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    depth: 10,
    angle: 25,
    lengthRatio: 0.7,
    windSpeed: 0,
    colorMode: 'natural',
    animate: true
};

let time = 0;
let branchCount = 0;

// ==================== 顏色模式 ====================

const colorModes = {
    natural: (depth, maxDepth) => {
        const ratio = depth / maxDepth;
        if (ratio < 0.3) {
            // 樹幹 - 棕色
            const h = 30;
            const s = 40 + ratio * 20;
            const l = 25 + ratio * 10;
            return { stroke: `hsl(${h}, ${s}%, ${l}%)`, width: (1 - ratio) * 8 + 1 };
        } else {
            // 葉子 - 綠色
            const h = 100 + ratio * 30;
            const s = 60;
            const l = 35 + ratio * 15;
            return { stroke: `hsl(${h}, ${s}%, ${l}%)`, width: Math.max(1, (1 - ratio) * 4) };
        }
    },
    autumn: (depth, maxDepth) => {
        const ratio = depth / maxDepth;
        if (ratio < 0.3) {
            return { stroke: `hsl(30, 40%, ${25 + ratio * 10}%)`, width: (1 - ratio) * 8 + 1 };
        } else {
            const h = 30 + (1 - ratio) * 30;
            return { stroke: `hsl(${h}, 80%, ${45 + ratio * 10}%)`, width: Math.max(1, (1 - ratio) * 4) };
        }
    },
    cherry: (depth, maxDepth) => {
        const ratio = depth / maxDepth;
        if (ratio < 0.3) {
            return { stroke: `hsl(30, 30%, ${20 + ratio * 10}%)`, width: (1 - ratio) * 8 + 1 };
        } else {
            const h = 330 + ratio * 30;
            return { stroke: `hsl(${h}, 70%, ${70 + ratio * 10}%)`, width: Math.max(1, (1 - ratio) * 4) };
        }
    },
    rainbow: (depth, maxDepth) => {
        const ratio = depth / maxDepth;
        const h = ratio * 300;
        return { stroke: `hsl(${h}, 75%, 50%)`, width: (1 - ratio) * 6 + 1 };
    }
};

// ==================== 繪製碎形樹 ====================

function drawBranch(x, y, length, angle, depth) {
    if (depth <= 0 || length < 2) return;

    branchCount++;

    // 計算風力影響
    let windOffset = 0;
    if (config.animate) {
        const windBase = config.windSpeed * 0.01;
        windOffset = Math.sin(time * 0.02 + depth * 0.5) * windBase * (config.depth - depth + 1);
    } else {
        windOffset = config.windSpeed * 0.02 * (config.depth - depth + 1) / config.depth;
    }

    const adjustedAngle = angle + windOffset;

    // 計算終點
    const endX = x + Math.cos(adjustedAngle) * length;
    const endY = y + Math.sin(adjustedAngle) * length;

    // 獲取顏色和線寬
    const colorFn = colorModes[config.colorMode];
    const style = colorFn(config.depth - depth, config.depth);

    // 繪製分支
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.width;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // 計算下一層長度
    const nextLength = length * config.lengthRatio;
    const angleRad = config.angle * Math.PI / 180;

    // 添加一些隨機變化
    const randomFactor = 0.9 + Math.random() * 0.2;

    // 遞迴繪製左右分支
    drawBranch(endX, endY, nextLength * randomFactor, adjustedAngle - angleRad, depth - 1);
    drawBranch(endX, endY, nextLength * randomFactor, adjustedAngle + angleRad, depth - 1);

    // 有時添加額外分支
    if (depth > 3 && Math.random() < 0.15) {
        const extraAngle = (Math.random() - 0.5) * angleRad;
        drawBranch(endX, endY, nextLength * 0.7, adjustedAngle + extraAngle, depth - 2);
    }
}

function drawTree() {
    // 清除畫布
    ctx.fillStyle = '#0a1015';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製地面
    const groundY = canvas.height * 0.9;
    const gradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
    gradient.addColorStop(0, '#1a2520');
    gradient.addColorStop(1, '#0a1015');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // 重置分支計數
    branchCount = 0;

    // 繪製樹
    const startX = canvas.width / 2;
    const startY = groundY;
    const startLength = Math.min(canvas.width, canvas.height) * 0.2;

    drawBranch(startX, startY, startLength, -Math.PI / 2, config.depth);

    // 更新資訊
    updateInfo();
}

function updateInfo() {
    document.getElementById('depthDisplay').textContent = config.depth;
    document.getElementById('branchDisplay').textContent = branchCount;
}

// ==================== 動畫迴圈 ====================

function animate() {
    if (config.animate) {
        time++;
        drawTree();
    }
    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawTree();
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('depth').addEventListener('input', (e) => {
    config.depth = parseInt(e.target.value);
    document.getElementById('depthValue').textContent = config.depth;
    drawTree();
});

document.getElementById('angle').addEventListener('input', (e) => {
    config.angle = parseInt(e.target.value);
    document.getElementById('angleValue').textContent = config.angle;
    drawTree();
});

document.getElementById('lengthRatio').addEventListener('input', (e) => {
    config.lengthRatio = parseFloat(e.target.value);
    document.getElementById('lengthRatioValue').textContent = config.lengthRatio.toFixed(2);
    drawTree();
});

document.getElementById('windSpeed').addEventListener('input', (e) => {
    config.windSpeed = parseInt(e.target.value);
    document.getElementById('windSpeedValue').textContent = config.windSpeed;
    if (!config.animate) drawTree();
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
    drawTree();
});

document.getElementById('animate').addEventListener('change', (e) => {
    config.animate = e.target.checked;
    if (!config.animate) drawTree();
});

// ==================== 啟動 ====================

resizeCanvas();
requestAnimationFrame(animate);
