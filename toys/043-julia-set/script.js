/**
 * Julia Set 茱莉亞集合
 * Web Toys #043
 *
 * 互動式茱莉亞集合生成器
 *
 * 技術重點：
 * - 複數平面迭代 (z = z² + c)
 * - 參數空間探索
 * - 動態參數變化
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('juliaCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    realC: -0.7,
    imagC: 0.27,
    maxIterations: 100,
    colorScheme: 'electric',
    animate: false
};

// 預設參數
const presets = {
    custom: null,
    dendrite: { r: 0, i: 1 },
    rabbit: { r: -0.123, i: 0.745 },
    siegel: { r: -0.391, i: -0.587 },
    dragon: { r: -0.8, i: 0.156 },
    spiral: { r: -0.742, i: 0.1 }
};

let time = 0;
let zoom = 1.5;

// ==================== 顏色方案 ====================

const colorSchemes = {
    electric: (iter, maxIter, smooth) => {
        if (iter === maxIter) return [0, 0, 0];
        const t = smooth / maxIter;
        const h = 180 + t * 60;
        return hslToRgb(h / 360, 0.9, 0.5);
    },
    sunset: (iter, maxIter, smooth) => {
        if (iter === maxIter) return [0, 0, 0];
        const t = smooth / maxIter;
        const h = 30 - t * 30;
        const l = 30 + t * 40;
        return hslToRgb(Math.max(0, h) / 360, 0.9, l / 100);
    },
    aurora: (iter, maxIter, smooth) => {
        if (iter === maxIter) return [0, 0, 10];
        const t = smooth / maxIter;
        const h = 120 + Math.sin(t * Math.PI * 2) * 60;
        return hslToRgb(h / 360, 0.8, 0.45 + t * 0.2);
    },
    cosmic: (iter, maxIter, smooth) => {
        if (iter === maxIter) return [5, 0, 15];
        const t = smooth / maxIter;
        const h = 280 + t * 80;
        return hslToRgb((h % 360) / 360, 0.85, 0.4 + t * 0.3);
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

// ==================== 茱莉亞計算 ====================

function julia(zx, zy, cx, cy, maxIter) {
    let x = zx, y = zy;
    let iter = 0;

    while (x * x + y * y <= 4 && iter < maxIter) {
        const xtemp = x * x - y * y + cx;
        y = 2 * x * y + cy;
        x = xtemp;
        iter++;
    }

    // 平滑迭代計數
    if (iter < maxIter) {
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
    const xRange = zoom * 2 * aspectRatio;
    const yRange = zoom * 2;

    const xMin = -xRange / 2;
    const yMin = -yRange / 2;

    const cx = config.realC;
    const cy = config.imagC;
    const colorFn = colorSchemes[config.colorScheme];

    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
            const zx = xMin + (px / width) * xRange;
            const zy = yMin + (py / height) * yRange;

            const iter = julia(zx, zy, cx, cy, config.maxIterations);
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
    const sign = config.imagC >= 0 ? '+' : '-';
    document.getElementById('cDisplay').textContent =
        `${config.realC.toFixed(3)} ${sign} ${Math.abs(config.imagC).toFixed(3)}i`;
}

// ==================== 動畫 ====================

function animate() {
    if (config.animate) {
        time += 0.02;
        // 沿著有趣的路徑移動 c 值
        config.realC = -0.7 + Math.sin(time) * 0.3;
        config.imagC = 0.27 + Math.cos(time * 1.3) * 0.2;

        document.getElementById('realC').value = config.realC;
        document.getElementById('imagC').value = config.imagC;
        document.getElementById('realCValue').textContent = config.realC.toFixed(2);
        document.getElementById('imagCValue').textContent = config.imagC.toFixed(2);

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

// 滾輪縮放
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    zoom *= zoomFactor;
    zoom = Math.max(0.1, Math.min(10, zoom));
    draw();
});

document.getElementById('preset').addEventListener('change', (e) => {
    const preset = presets[e.target.value];
    if (preset) {
        config.realC = preset.r;
        config.imagC = preset.i;
        document.getElementById('realC').value = preset.r;
        document.getElementById('imagC').value = preset.i;
        document.getElementById('realCValue').textContent = preset.r.toFixed(2);
        document.getElementById('imagCValue').textContent = preset.i.toFixed(2);
        draw();
    }
});

document.getElementById('realC').addEventListener('input', (e) => {
    config.realC = parseFloat(e.target.value);
    document.getElementById('realCValue').textContent = config.realC.toFixed(2);
    document.getElementById('preset').value = 'custom';
    if (!config.animate) draw();
});

document.getElementById('imagC').addEventListener('input', (e) => {
    config.imagC = parseFloat(e.target.value);
    document.getElementById('imagCValue').textContent = config.imagC.toFixed(2);
    document.getElementById('preset').value = 'custom';
    if (!config.animate) draw();
});

document.getElementById('maxIterations').addEventListener('input', (e) => {
    config.maxIterations = parseInt(e.target.value);
    document.getElementById('maxIterationsValue').textContent = config.maxIterations;
    draw();
});

document.getElementById('colorScheme').addEventListener('change', (e) => {
    config.colorScheme = e.target.value;
    draw();
});

document.getElementById('animate').addEventListener('change', (e) => {
    config.animate = e.target.checked;
    if (!config.animate) draw();
});

// ==================== 啟動 ====================

resizeCanvas();
requestAnimationFrame(animate);
