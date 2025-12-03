/**
 * Wave Interference 波干涉
 * Web Toys #060
 *
 * 多波源干涉圖案
 *
 * 技術重點：
 * - 波的疊加原理
 * - 建設性/破壞性干涉
 * - 即時干涉圖案計算
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    sourceCount: 2,
    frequency: 0.1,
    wavelength: 30,
    amplitude: 1.0,
    colorMode: 'heatmap',
    paused: false
};

let sources = [];
let time = 0;
let draggedSource = null;

// ==================== 波源類別 ====================

class WaveSource {
    constructor(x, y, phase = 0) {
        this.x = x;
        this.y = y;
        this.phase = phase;
    }

    getWaveAt(px, py, t) {
        const dx = px - this.x;
        const dy = py - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const k = (2 * Math.PI) / config.wavelength;
        const omega = config.frequency * 2 * Math.PI;

        return config.amplitude * Math.sin(k * distance - omega * t + this.phase);
    }
}

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    createSources();
    time = 0;
}

function createSources() {
    sources = [];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const spacing = 150;

    for (let i = 0; i < config.sourceCount; i++) {
        const angle = (i / config.sourceCount) * Math.PI * 2;
        const radius = config.sourceCount === 1 ? 0 : spacing;
        sources.push(new WaveSource(
            cx + Math.cos(angle) * radius,
            cy + Math.sin(angle) * radius,
            0
        ));
    }

    document.getElementById('sourceDisplay').textContent = sources.length;
}

// ==================== 繪製 ====================

function draw() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    // 降低解析度以提高效能
    const scale = 2;

    for (let y = 0; y < canvas.height; y += scale) {
        for (let x = 0; x < canvas.width; x += scale) {
            // 計算所有波源在此點的疊加
            let totalWave = 0;
            for (const source of sources) {
                totalWave += source.getWaveAt(x, y, time);
            }

            // 正規化
            const normalizedWave = totalWave / sources.length;
            const value = (normalizedWave + 1) / 2; // 0 到 1

            let r, g, b;

            switch (config.colorMode) {
                case 'heatmap':
                    if (value > 0.5) {
                        const t = (value - 0.5) * 2;
                        r = 255;
                        g = Math.floor(255 * (1 - t));
                        b = 0;
                    } else {
                        const t = value * 2;
                        r = 0;
                        g = Math.floor(255 * t);
                        b = Math.floor(255 * (1 - t));
                    }
                    break;

                case 'grayscale':
                    r = g = b = Math.floor(value * 255);
                    break;

                case 'rainbow':
                    const hue = value * 270; // 從藍到紅
                    const rgb = hslToRgb(hue / 360, 0.8, 0.5);
                    r = rgb[0];
                    g = rgb[1];
                    b = rgb[2];
                    break;

                case 'contour':
                    const contourLines = 10;
                    const contourValue = Math.abs(Math.sin(value * contourLines * Math.PI));
                    r = Math.floor(contourValue * 100);
                    g = Math.floor(contourValue * 200 + value * 55);
                    b = Math.floor(contourValue * 255);
                    break;
            }

            // 填充像素塊
            for (let dy = 0; dy < scale && y + dy < canvas.height; dy++) {
                for (let dx = 0; dx < scale && x + dx < canvas.width; dx++) {
                    const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                    data[idx + 3] = 255;
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // 繪製波源標記
    for (let i = 0; i < sources.length; i++) {
        const source = sources[i];

        // 光暈
        const gradient = ctx.createRadialGradient(
            source.x, source.y, 0,
            source.x, source.y, 30
        );
        gradient.addColorStop(0, 'rgba(0, 200, 255, 0.8)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(source.x, source.y, 30, 0, Math.PI * 2);
        ctx.fill();

        // 核心
        ctx.fillStyle = '#00c8ff';
        ctx.beginPath();
        ctx.arc(source.x, source.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // 編號
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((i + 1).toString(), source.x, source.y);
    }
}

// ==================== HSL 轉 RGB ====================

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

// ==================== 動畫迴圈 ====================

function animate() {
    if (!config.paused) {
        time += 1;
    }

    draw();
    document.getElementById('timeDisplay').textContent = (time * 0.1).toFixed(1);

    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 滑鼠互動 ====================

function getSourceAt(x, y) {
    for (const source of sources) {
        const dx = source.x - x;
        const dy = source.y - y;
        if (dx * dx + dy * dy < 400) {
            return source;
        }
    }
    return null;
}

canvas.addEventListener('mousedown', (e) => {
    const source = getSourceAt(e.clientX, e.clientY);
    if (source) {
        draggedSource = source;
    } else if (sources.length < 6) {
        sources.push(new WaveSource(e.clientX, e.clientY, 0));
        config.sourceCount = sources.length;
        document.getElementById('sourceCount').value = config.sourceCount;
        document.getElementById('sourceCountValue').textContent = config.sourceCount;
        document.getElementById('sourceDisplay').textContent = sources.length;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (draggedSource) {
        draggedSource.x = e.clientX;
        draggedSource.y = e.clientY;
    }
});

canvas.addEventListener('mouseup', () => {
    draggedSource = null;
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const source = getSourceAt(touch.clientX, touch.clientY);
    if (source) {
        draggedSource = source;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (draggedSource) {
        const touch = e.touches[0];
        draggedSource.x = touch.clientX;
        draggedSource.y = touch.clientY;
    }
});

canvas.addEventListener('touchend', () => {
    draggedSource = null;
});

// ==================== 事件處理 ====================

window.addEventListener('resize', () => {
    resizeCanvas();
    createSources();
});

document.getElementById('sourceCount').addEventListener('input', (e) => {
    config.sourceCount = parseInt(e.target.value);
    document.getElementById('sourceCountValue').textContent = config.sourceCount;
    createSources();
});

document.getElementById('frequency').addEventListener('input', (e) => {
    config.frequency = parseFloat(e.target.value);
    document.getElementById('frequencyValue').textContent = config.frequency.toFixed(2);
});

document.getElementById('wavelength').addEventListener('input', (e) => {
    config.wavelength = parseInt(e.target.value);
    document.getElementById('wavelengthValue').textContent = config.wavelength;
});

document.getElementById('amplitude').addEventListener('input', (e) => {
    config.amplitude = parseFloat(e.target.value);
    document.getElementById('amplitudeValue').textContent = config.amplitude.toFixed(1);
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('resetBtn').addEventListener('click', () => {
    createSources();
    time = 0;
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    config.paused = !config.paused;
    const btn = document.getElementById('pauseBtn');
    btn.textContent = config.paused ? '繼續' : '暫停';
    btn.classList.toggle('paused', config.paused);
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(animate);
