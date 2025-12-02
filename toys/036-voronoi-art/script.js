/**
 * Voronoi Art 沃羅諾伊藝術
 * Web Toys #036
 *
 * 互動式沃羅諾伊圖生成器
 *
 * 技術重點：
 * - 沃羅諾伊圖演算法
 * - 最近鄰搜尋
 * - 動態種子點移動
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('voronoiCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    pointCount: 50,
    speed: 1,
    colorMode: 'distance',
    showPoints: true,
    showEdges: true
};

let points = [];
let time = 0;

// ==================== 顏色模式 ====================

const colorModes = {
    distance: (distance, maxDist, index, total) => {
        const ratio = distance / maxDist;
        const h = 200 + ratio * 40;
        const l = 30 + (1 - ratio) * 30;
        return `hsl(${h}, 70%, ${l}%)`;
    },
    rainbow: (distance, maxDist, index, total) => {
        const h = (index / total) * 360;
        const l = 40 + (1 - distance / maxDist) * 20;
        return `hsl(${h}, 75%, ${l}%)`;
    },
    ocean: (distance, maxDist, index, total) => {
        const ratio = distance / maxDist;
        const h = 180 + ratio * 40;
        const l = 25 + (1 - ratio) * 35;
        return `hsl(${h}, 80%, ${l}%)`;
    },
    sunset: (distance, maxDist, index, total) => {
        const ratio = distance / maxDist;
        const h = 20 + ratio * 30;
        const l = 35 + (1 - ratio) * 30;
        return `hsl(${h}, 85%, ${l}%)`;
    },
    mono: (distance, maxDist, index, total) => {
        const ratio = distance / maxDist;
        const l = 20 + (1 - ratio) * 40;
        return `hsl(210, 20%, ${l}%)`;
    }
};

// ==================== 種子點類別 ====================

class VoronoiPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.originalX = x;
        this.originalY = y;
    }

    update(width, height, speed) {
        // 添加一些隨機擾動
        this.vx += (Math.random() - 0.5) * 0.1;
        this.vy += (Math.random() - 0.5) * 0.1;

        // 限制速度
        const maxSpeed = 2 * speed;
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > maxSpeed) {
            this.vx = (this.vx / currentSpeed) * maxSpeed;
            this.vy = (this.vy / currentSpeed) * maxSpeed;
        }

        // 更新位置
        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // 邊界反彈
        if (this.x < 0 || this.x > width) {
            this.vx *= -1;
            this.x = Math.max(0, Math.min(width, this.x));
        }
        if (this.y < 0 || this.y > height) {
            this.vy *= -1;
            this.y = Math.max(0, Math.min(height, this.y));
        }
    }
}

// ==================== 沃羅諾伊圖計算 ====================

/**
 * 計算點到最近種子點的距離和索引
 */
function findNearestPoint(x, y) {
    let minDist = Infinity;
    let nearestIndex = 0;
    let secondDist = Infinity;

    for (let i = 0; i < points.length; i++) {
        const dx = x - points[i].x;
        const dy = y - points[i].y;
        const dist = dx * dx + dy * dy; // 使用平方距離避免開根號

        if (dist < minDist) {
            secondDist = minDist;
            minDist = dist;
            nearestIndex = i;
        } else if (dist < secondDist) {
            secondDist = dist;
        }
    }

    return {
        index: nearestIndex,
        distance: Math.sqrt(minDist),
        edgeDistance: Math.sqrt(secondDist) - Math.sqrt(minDist)
    };
}

/**
 * 使用像素方式繪製沃羅諾伊圖
 */
function drawVoronoi() {
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // 計算最大距離用於顏色映射
    const maxDist = Math.sqrt(width * width + height * height) / points.length;

    // 使用較低解析度計算，然後放大
    const scale = 2;
    const scaledWidth = Math.ceil(width / scale);
    const scaledHeight = Math.ceil(height / scale);

    // 預計算每個區塊的顏色
    const colorCache = new Map();

    for (let sy = 0; sy < scaledHeight; sy++) {
        for (let sx = 0; sx < scaledWidth; sx++) {
            const x = sx * scale + scale / 2;
            const y = sy * scale + scale / 2;
            const result = findNearestPoint(x, y);

            // 取得顏色
            const colorFn = colorModes[config.colorMode];
            const colorStr = colorFn(result.distance, maxDist, result.index, points.length);

            // 解析 HSL 顏色
            const hslMatch = colorStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            let r, g, b;

            if (hslMatch) {
                const [h, s, l] = [parseInt(hslMatch[1]), parseInt(hslMatch[2]) / 100, parseInt(hslMatch[3]) / 100];
                [r, g, b] = hslToRgb(h / 360, s, l);
            } else {
                r = g = b = 128;
            }

            // 邊緣檢測
            let edgeFactor = 1;
            if (config.showEdges && result.edgeDistance < 3) {
                edgeFactor = 0.3 + (result.edgeDistance / 3) * 0.7;
            }

            // 填充放大的區塊
            for (let dy = 0; dy < scale; dy++) {
                for (let dx = 0; dx < scale; dx++) {
                    const px = sx * scale + dx;
                    const py = sy * scale + dy;
                    if (px < width && py < height) {
                        const idx = (py * width + px) * 4;
                        data[idx] = r * edgeFactor;
                        data[idx + 1] = g * edgeFactor;
                        data[idx + 2] = b * edgeFactor;
                        data[idx + 3] = 255;
                    }
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // 繪製種子點
    if (config.showPoints) {
        drawPoints();
    }
}

/**
 * HSL 轉 RGB
 */
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * 繪製種子點
 */
function drawPoints() {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    for (const point of points) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}

// ==================== 初始化 ====================

function initPoints() {
    points = [];
    const width = canvas.width;
    const height = canvas.height;

    for (let i = 0; i < config.pointCount; i++) {
        points.push(new VoronoiPoint(
            Math.random() * width,
            Math.random() * height
        ));
    }

    updateInfo();
}

function updateInfo() {
    document.getElementById('pointDisplay').textContent = points.length;
    document.getElementById('cellDisplay').textContent = points.length;
}

// ==================== 動畫迴圈 ====================

function animate() {
    time++;

    // 更新種子點位置
    if (config.speed > 0) {
        for (const point of points) {
            point.update(canvas.width, canvas.height, config.speed);
        }
    }

    // 繪製沃羅諾伊圖
    drawVoronoi();

    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initPoints();
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

// 點擊添加新種子點
canvas.addEventListener('click', (e) => {
    points.push(new VoronoiPoint(e.clientX, e.clientY));
    updateInfo();
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    points.push(new VoronoiPoint(touch.clientX, touch.clientY));
    updateInfo();
});

document.getElementById('pointCount').addEventListener('input', (e) => {
    config.pointCount = parseInt(e.target.value);
    document.getElementById('pointCountValue').textContent = config.pointCount;
    initPoints();
});

document.getElementById('speed').addEventListener('input', (e) => {
    config.speed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = config.speed.toFixed(1);
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('showPoints').addEventListener('change', (e) => {
    config.showPoints = e.target.checked;
});

document.getElementById('showEdges').addEventListener('change', (e) => {
    config.showEdges = e.target.checked;
});

document.getElementById('resetBtn').addEventListener('click', initPoints);

// ==================== 啟動 ====================

resizeCanvas();
requestAnimationFrame(animate);
