/**
 * Reaction Diffusion 反應擴散
 * Web Toys #038
 *
 * Gray-Scott 反應擴散模型視覺化
 *
 * 技術重點：
 * - Gray-Scott 模型方程式
 * - 雙緩衝區渲染
 * - 拉普拉斯卷積
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('reactionCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    feedRate: 0.055,    // f - 進料率
    killRate: 0.062,    // k - 消耗率
    diffusionA: 1.0,    // Da - A的擴散率
    diffusionB: 0.5,    // Db - B的擴散率
    colorMode: 'grayscale',
    brushSize: 20
};

// 預設參數
const presets = {
    custom: { f: 0.055, k: 0.062 },
    mitosis: { f: 0.0367, k: 0.0649 },
    coral: { f: 0.0545, k: 0.062 },
    fingerprint: { f: 0.055, k: 0.062 },
    spots: { f: 0.03, k: 0.06 },
    waves: { f: 0.014, k: 0.045 }
};

let gridA, gridB, nextA, nextB;
let width, height;
let isPaused = false;
let isDrawing = false;

// ==================== 顏色模式 ====================

const colorModes = {
    grayscale: (a, b) => {
        const v = Math.floor((1 - b) * 255);
        return [v, v, v];
    },
    heatmap: (a, b) => {
        const v = b;
        if (v < 0.25) {
            return [0, Math.floor(v * 4 * 255), Math.floor(v * 4 * 128 + 127)];
        } else if (v < 0.5) {
            return [0, 255, Math.floor((0.5 - v) * 2 * 255)];
        } else if (v < 0.75) {
            return [Math.floor((v - 0.5) * 4 * 255), 255, 0];
        } else {
            return [255, Math.floor((1 - v) * 4 * 255), 0];
        }
    },
    ocean: (a, b) => {
        const v = b;
        return [
            Math.floor(v * 100),
            Math.floor(150 - v * 100),
            Math.floor(200 - v * 50)
        ];
    },
    neon: (a, b) => {
        const v = b;
        const h = v * 300;
        const s = 1;
        const l = 0.5;
        return hslToRgb(h / 360, s, l);
    }
};

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

// ==================== 初始化 ====================

function initGrids() {
    width = Math.floor(canvas.width / 2);
    height = Math.floor(canvas.height / 2);

    gridA = new Float32Array(width * height);
    gridB = new Float32Array(width * height);
    nextA = new Float32Array(width * height);
    nextB = new Float32Array(width * height);

    // 初始化 A = 1, B = 0
    for (let i = 0; i < width * height; i++) {
        gridA[i] = 1;
        gridB[i] = 0;
    }

    // 在中心添加一些B
    addSeed(width / 2, height / 2, 20);
}

function addSeed(cx, cy, radius) {
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            if (x * x + y * y <= radius * radius) {
                const px = Math.floor(cx + x);
                const py = Math.floor(cy + y);
                if (px >= 0 && px < width && py >= 0 && py < height) {
                    const idx = py * width + px;
                    gridB[idx] = 1;
                }
            }
        }
    }
}

// ==================== 拉普拉斯卷積 ====================

function laplacian(grid, x, y) {
    const idx = y * width + x;

    // 處理邊界（環繞）
    const left = x > 0 ? idx - 1 : idx + width - 1;
    const right = x < width - 1 ? idx + 1 : idx - width + 1;
    const up = y > 0 ? idx - width : idx + (height - 1) * width;
    const down = y < height - 1 ? idx + width : idx - (height - 1) * width;

    // 3x3 拉普拉斯核心
    return grid[left] * 0.2 +
           grid[right] * 0.2 +
           grid[up] * 0.2 +
           grid[down] * 0.2 +
           grid[idx] * -1 +
           // 對角線
           grid[(y > 0 ? up : idx) + (x > 0 ? -1 : width - 1)] * 0.05 +
           grid[(y > 0 ? up : idx) + (x < width - 1 ? 1 : -width + 1)] * 0.05 +
           grid[(y < height - 1 ? down : idx) + (x > 0 ? -1 : width - 1)] * 0.05 +
           grid[(y < height - 1 ? down : idx) + (x < width - 1 ? 1 : -width + 1)] * 0.05;
}

// ==================== 模擬步驟 ====================

function simulate() {
    const f = config.feedRate;
    const k = config.killRate;
    const Da = config.diffusionA;
    const Db = config.diffusionB;
    const dt = 1.0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const a = gridA[idx];
            const b = gridB[idx];

            const lapA = laplacian(gridA, x, y);
            const lapB = laplacian(gridB, x, y);

            const reaction = a * b * b;

            // Gray-Scott 方程式
            nextA[idx] = a + (Da * lapA - reaction + f * (1 - a)) * dt;
            nextB[idx] = b + (Db * lapB + reaction - (k + f) * b) * dt;

            // 限制在 [0, 1]
            nextA[idx] = Math.max(0, Math.min(1, nextA[idx]));
            nextB[idx] = Math.max(0, Math.min(1, nextB[idx]));
        }
    }

    // 交換緩衝區
    [gridA, nextA] = [nextA, gridA];
    [gridB, nextB] = [nextB, gridB];
}

// ==================== 繪製 ====================

function draw() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    const colorFn = colorModes[config.colorMode];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const a = gridA[idx];
            const b = gridB[idx];

            const [r, g, blue] = colorFn(a, b);

            // 放大2倍繪製
            for (let dy = 0; dy < 2; dy++) {
                for (let dx = 0; dx < 2; dx++) {
                    const px = x * 2 + dx;
                    const py = y * 2 + dy;
                    const pIdx = (py * canvas.width + px) * 4;
                    data[pIdx] = r;
                    data[pIdx + 1] = g;
                    data[pIdx + 2] = blue;
                    data[pIdx + 3] = 255;
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

// ==================== 動畫迴圈 ====================

function animate() {
    if (!isPaused) {
        // 每幀執行多次模擬以加速
        for (let i = 0; i < 10; i++) {
            simulate();
        }
        draw();
    }
    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initGrids();
}

// ==================== 事件處理 ====================

function getEventPos(e) {
    if (e.touches) {
        return {
            x: e.touches[0].clientX / 2,
            y: e.touches[0].clientY / 2
        };
    }
    return {
        x: e.clientX / 2,
        y: e.clientY / 2
    };
}

function addBrush(e) {
    const pos = getEventPos(e);
    addSeed(pos.x, pos.y, config.brushSize / 2);
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    addBrush(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) addBrush(e);
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    addBrush(e);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDrawing) addBrush(e);
});

canvas.addEventListener('touchend', () => {
    isDrawing = false;
});

window.addEventListener('resize', resizeCanvas);

document.getElementById('feedRate').addEventListener('input', (e) => {
    config.feedRate = parseFloat(e.target.value);
    document.getElementById('feedRateValue').textContent = config.feedRate.toFixed(3);
    document.getElementById('fDisplay').textContent = config.feedRate.toFixed(3);
    document.getElementById('preset').value = 'custom';
});

document.getElementById('killRate').addEventListener('input', (e) => {
    config.killRate = parseFloat(e.target.value);
    document.getElementById('killRateValue').textContent = config.killRate.toFixed(3);
    document.getElementById('kDisplay').textContent = config.killRate.toFixed(3);
    document.getElementById('preset').value = 'custom';
});

document.getElementById('preset').addEventListener('change', (e) => {
    const preset = presets[e.target.value];
    if (preset) {
        config.feedRate = preset.f;
        config.killRate = preset.k;
        document.getElementById('feedRate').value = preset.f;
        document.getElementById('killRate').value = preset.k;
        document.getElementById('feedRateValue').textContent = preset.f.toFixed(3);
        document.getElementById('killRateValue').textContent = preset.k.toFixed(3);
        document.getElementById('fDisplay').textContent = preset.f.toFixed(3);
        document.getElementById('kDisplay').textContent = preset.k.toFixed(3);
        initGrids();
    }
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('brushSize').addEventListener('input', (e) => {
    config.brushSize = parseInt(e.target.value);
    document.getElementById('brushSizeValue').textContent = config.brushSize;
});

document.getElementById('clearBtn').addEventListener('click', initGrids);

document.getElementById('pauseBtn').addEventListener('click', () => {
    isPaused = !isPaused;
    const btn = document.getElementById('pauseBtn');
    btn.textContent = isPaused ? '繼續' : '暫停';
    btn.classList.toggle('paused', isPaused);
});

// ==================== 啟動 ====================

resizeCanvas();
requestAnimationFrame(animate);
