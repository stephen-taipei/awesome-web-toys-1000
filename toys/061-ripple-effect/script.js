/**
 * Ripple Effect 漣漪效果
 * Web Toys #061
 *
 * 水面漣漪模擬
 *
 * 技術重點：
 * - 波動方程式模擬
 * - 雙緩衝技術
 * - 阻尼與傳播
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('rippleCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    rippleSpeed: 5,
    damping: 0.98,
    rippleStrength: 500,
    colorMode: 'water',
    autoRipple: false,
    paused: false
};

// 水波模擬用雙緩衝
let width, height;
let current, previous;
let rippleCount = 0;

// FPS
let lastTime = performance.now();
let frameCount = 0;
let fps = 60;

// ==================== 初始化 ====================

function init() {
    resizeCanvas();

    // 降低解析度以提高效能
    const scale = 2;
    width = Math.floor(canvas.width / scale);
    height = Math.floor(canvas.height / scale);

    current = new Float32Array(width * height);
    previous = new Float32Array(width * height);

    rippleCount = 0;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 索引函數 ====================

function IX(x, y) {
    x = Math.max(0, Math.min(width - 1, x));
    y = Math.max(0, Math.min(height - 1, y));
    return x + y * width;
}

// ==================== 添加漣漪 ====================

function addRipple(x, y, strength) {
    const scale = canvas.width / width;
    const gridX = Math.floor(x / scale);
    const gridY = Math.floor(y / scale);

    const radius = 3;
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const px = gridX + dx;
            const py = gridY + dy;
            if (px >= 0 && px < width && py >= 0 && py < height) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= radius) {
                    const factor = 1 - dist / radius;
                    current[IX(px, py)] += strength * factor;
                }
            }
        }
    }

    rippleCount++;
}

// ==================== 更新水波 ====================

function update() {
    const speed = config.rippleSpeed;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = IX(x, y);

            // 波動方程式：新值 = (鄰居平均 * 2 - 舊值) * 阻尼
            const avg = (
                current[IX(x - 1, y)] +
                current[IX(x + 1, y)] +
                current[IX(x, y - 1)] +
                current[IX(x, y + 1)]
            ) / 2;

            previous[idx] = (avg - previous[idx]) * config.damping;
        }
    }

    // 交換緩衝區
    const temp = current;
    current = previous;
    previous = temp;
}

// ==================== 繪製 ====================

function draw() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    const scaleX = canvas.width / width;
    const scaleY = canvas.height / height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = current[IX(x, y)];
            const normalizedValue = Math.max(-1, Math.min(1, value / 100));

            let r, g, b;

            switch (config.colorMode) {
                case 'water':
                    // 水面效果：基於高度的藍色調
                    const waterBase = 40;
                    const waterLight = normalizedValue * 80;
                    r = Math.max(0, Math.min(255, waterBase + waterLight * 0.3));
                    g = Math.max(0, Math.min(255, waterBase + 60 + waterLight * 0.6));
                    b = Math.max(0, Math.min(255, waterBase + 120 + waterLight));
                    break;

                case 'rainbow':
                    const hue = (normalizedValue + 1) / 2 * 360;
                    const rgb = hslToRgb(hue / 360, 0.8, 0.4 + normalizedValue * 0.2);
                    r = rgb[0];
                    g = rgb[1];
                    b = rgb[2];
                    break;

                case 'monochrome':
                    const gray = Math.floor(128 + normalizedValue * 127);
                    r = g = b = Math.max(0, Math.min(255, gray));
                    break;

                case 'thermal':
                    const heat = (normalizedValue + 1) / 2;
                    if (heat < 0.5) {
                        r = 0;
                        g = Math.floor(heat * 2 * 255);
                        b = Math.floor((1 - heat * 2) * 255);
                    } else {
                        r = Math.floor((heat - 0.5) * 2 * 255);
                        g = Math.floor((1 - (heat - 0.5) * 2) * 255);
                        b = 0;
                    }
                    break;
            }

            // 填充像素塊
            const startX = Math.floor(x * scaleX);
            const startY = Math.floor(y * scaleY);
            const endX = Math.floor((x + 1) * scaleX);
            const endY = Math.floor((y + 1) * scaleY);

            for (let py = startY; py < endY; py++) {
                for (let px = startX; px < endX; px++) {
                    const idx = (py * canvas.width + px) * 4;
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                    data[idx + 3] = 255;
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
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
        // 自動產生漣漪
        if (config.autoRipple && Math.random() < 0.05) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            addRipple(x, y, config.rippleStrength * (0.5 + Math.random() * 0.5));
        }

        update();
    }

    draw();

    // 更新顯示
    document.getElementById('rippleCount').textContent = rippleCount;

    // FPS
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = now;
        document.getElementById('fpsDisplay').textContent = fps;
    }

    requestAnimationFrame(animate);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', init);

canvas.addEventListener('mousedown', (e) => {
    addRipple(e.clientX, e.clientY, config.rippleStrength);
});

canvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) {
        addRipple(e.clientX, e.clientY, config.rippleStrength * 0.3);
    }
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (const touch of e.touches) {
        addRipple(touch.clientX, touch.clientY, config.rippleStrength);
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (const touch of e.touches) {
        addRipple(touch.clientX, touch.clientY, config.rippleStrength * 0.3);
    }
});

document.getElementById('rippleSpeed').addEventListener('input', (e) => {
    config.rippleSpeed = parseInt(e.target.value);
    document.getElementById('rippleSpeedValue').textContent = config.rippleSpeed;
});

document.getElementById('damping').addEventListener('input', (e) => {
    config.damping = parseFloat(e.target.value);
    document.getElementById('dampingValue').textContent = config.damping.toFixed(3);
});

document.getElementById('rippleStrength').addEventListener('input', (e) => {
    config.rippleStrength = parseInt(e.target.value);
    document.getElementById('rippleStrengthValue').textContent = config.rippleStrength;
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('autoRipple').addEventListener('change', (e) => {
    config.autoRipple = e.target.checked;
});

document.getElementById('resetBtn').addEventListener('click', () => {
    current.fill(0);
    previous.fill(0);
    rippleCount = 0;
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
