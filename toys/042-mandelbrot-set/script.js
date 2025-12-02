/**
 * Mandelbrot Set 曼德博集合
 * Web Toys #042
 *
 * 互動式曼德博集合探索器
 *
 * 技術重點：
 * - 複數平面迭代
 * - 逃逸時間演算法
 * - 平滑著色
 * - 縮放與平移
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('mandelbrotCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    maxIterations: 100,
    colorScheme: 'classic',
    smoothing: true
};

// 視角參數
let view = {
    centerX: -0.5,
    centerY: 0,
    zoom: 1
};

let isDragging = false;
let dragStartX, dragStartY;
let dragStartCenterX, dragStartCenterY;

// ==================== 顏色方案 ====================

const colorSchemes = {
    classic: (iter, maxIter, smooth) => {
        if (iter === maxIter) return [0, 0, 0];
        const t = smooth / maxIter;
        const h = 240 - t * 240;
        return hslToRgb(h / 360, 0.8, 0.5);
    },
    fire: (iter, maxIter, smooth) => {
        if (iter === maxIter) return [0, 0, 0];
        const t = smooth / maxIter;
        const r = Math.min(255, t * 3 * 255);
        const g = Math.min(255, Math.max(0, (t * 3 - 1) * 255));
        const b = Math.min(255, Math.max(0, (t * 3 - 2) * 255));
        return [r, g, b];
    },
    ocean: (iter, maxIter, smooth) => {
        if (iter === maxIter) return [0, 0, 20];
        const t = smooth / maxIter;
        const h = 200 + t * 40;
        const l = 30 + t * 40;
        return hslToRgb(h / 360, 0.8, l / 100);
    },
    rainbow: (iter, maxIter, smooth) => {
        if (iter === maxIter) return [0, 0, 0];
        const t = smooth / maxIter;
        const h = t * 360;
        return hslToRgb(h / 360, 0.9, 0.5);
    },
    grayscale: (iter, maxIter, smooth) => {
        if (iter === maxIter) return [0, 0, 0];
        const t = smooth / maxIter;
        const v = Math.floor(t * 255);
        return [v, v, v];
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

// ==================== 曼德博計算 ====================

function mandelbrot(cx, cy, maxIter) {
    let x = 0, y = 0;
    let iter = 0;

    while (x * x + y * y <= 4 && iter < maxIter) {
        const xtemp = x * x - y * y + cx;
        y = 2 * x * y + cy;
        x = xtemp;
        iter++;
    }

    // 平滑迭代計數
    if (config.smoothing && iter < maxIter) {
        const log_zn = Math.log(x * x + y * y) / 2;
        const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        return iter + 1 - nu;
    }

    return iter;
}

// ==================== 繪製 ====================

function draw() {
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const aspectRatio = width / height;
    const xRange = 3.5 / view.zoom;
    const yRange = xRange / aspectRatio;

    const xMin = view.centerX - xRange / 2;
    const yMin = view.centerY - yRange / 2;

    const colorFn = colorSchemes[config.colorScheme];

    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
            const cx = xMin + (px / width) * xRange;
            const cy = yMin + (py / height) * yRange;

            const iter = mandelbrot(cx, cy, config.maxIterations);
            const [r, g, b] = colorFn(
                Math.floor(iter),
                config.maxIterations,
                iter
            );

            const idx = (py * width + px) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    updateInfo();
}

function updateInfo() {
    const zoomStr = view.zoom >= 1000000
        ? (view.zoom / 1000000).toFixed(1) + 'M'
        : view.zoom >= 1000
            ? (view.zoom / 1000).toFixed(1) + 'K'
            : view.zoom.toFixed(1);

    document.getElementById('zoomLevel').textContent = zoomStr + 'x';
    document.getElementById('zoomDisplay').textContent = zoomStr + 'x';
    document.getElementById('centerX').textContent = view.centerX.toFixed(6);
    document.getElementById('centerY').textContent = view.centerY.toFixed(6);
    document.getElementById('iterDisplay').textContent = config.maxIterations;
}

// ==================== 座標轉換 ====================

function screenToComplex(px, py) {
    const aspectRatio = canvas.width / canvas.height;
    const xRange = 3.5 / view.zoom;
    const yRange = xRange / aspectRatio;

    return {
        x: view.centerX - xRange / 2 + (px / canvas.width) * xRange,
        y: view.centerY - yRange / 2 + (py / canvas.height) * yRange
    };
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

// 滾輪縮放
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const complex = screenToComplex(px, py);

    const zoomFactor = e.deltaY > 0 ? 0.8 : 1.25;
    view.zoom *= zoomFactor;

    // 以滑鼠位置為中心縮放
    view.centerX = complex.x + (view.centerX - complex.x) / zoomFactor;
    view.centerY = complex.y + (view.centerY - complex.y) / zoomFactor;

    draw();
});

// 拖曳平移
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartCenterX = view.centerX;
    dragStartCenterY = view.centerY;
    canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    const aspectRatio = canvas.width / canvas.height;
    const xRange = 3.5 / view.zoom;
    const yRange = xRange / aspectRatio;

    view.centerX = dragStartCenterX - (dx / canvas.width) * xRange;
    view.centerY = dragStartCenterY - (dy / canvas.height) * yRange;

    draw();
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'crosshair';
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    canvas.style.cursor = 'crosshair';
});

// 雙擊放大
canvas.addEventListener('dblclick', (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const complex = screenToComplex(px, py);
    view.centerX = complex.x;
    view.centerY = complex.y;
    view.zoom *= 2;

    draw();
});

// 觸控支援
let lastTouchDist = 0;
let lastTouchCenter = null;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        dragStartCenterX = view.centerX;
        dragStartCenterY = view.centerY;
    } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        lastTouchDist = Math.sqrt(dx * dx + dy * dy);
        lastTouchCenter = {
            x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
            y: (e.touches[0].clientY + e.touches[1].clientY) / 2
        };
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - dragStartX;
        const dy = e.touches[0].clientY - dragStartY;

        const aspectRatio = canvas.width / canvas.height;
        const xRange = 3.5 / view.zoom;
        const yRange = xRange / aspectRatio;

        view.centerX = dragStartCenterX - (dx / canvas.width) * xRange;
        view.centerY = dragStartCenterY - (dy / canvas.height) * yRange;

        draw();
    } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (lastTouchDist > 0) {
            const scale = dist / lastTouchDist;
            view.zoom *= scale;
            draw();
        }

        lastTouchDist = dist;
    }
});

canvas.addEventListener('touchend', () => {
    isDragging = false;
    lastTouchDist = 0;
});

// 控制項
document.getElementById('maxIterations').addEventListener('input', (e) => {
    config.maxIterations = parseInt(e.target.value);
    document.getElementById('maxIterationsValue').textContent = config.maxIterations;
    draw();
});

document.getElementById('colorScheme').addEventListener('change', (e) => {
    config.colorScheme = e.target.value;
    draw();
});

document.getElementById('smoothing').addEventListener('change', (e) => {
    config.smoothing = e.target.checked;
    draw();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    view.centerX = -0.5;
    view.centerY = 0;
    view.zoom = 1;
    draw();
});

// ==================== 啟動 ====================

resizeCanvas();
