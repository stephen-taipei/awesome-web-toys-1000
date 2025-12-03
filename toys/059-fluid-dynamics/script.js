/**
 * Fluid Dynamics 流體模擬
 * Web Toys #059
 *
 * 基於 Navier-Stokes 的流體模擬
 *
 * 技術重點：
 * - 速度場模擬
 * - 擴散與平流
 * - 即時互動
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('fluidCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    viscosity: 0.0001,
    diffusion: 0.0001,
    brushSize: 20,
    colorMode: 'rainbow',
    paused: false
};

// 流體網格
let N; // 網格大小
let size;
let density;
let densityPrev;
let velocityX;
let velocityY;
let velocityXPrev;
let velocityYPrev;

// 滑鼠狀態
let mouseX = 0;
let mouseY = 0;
let prevMouseX = 0;
let prevMouseY = 0;
let isMouseDown = false;
let hue = 0;

// FPS
let lastTime = performance.now();
let frameCount = 0;
let fps = 60;

// ==================== 工具函數 ====================

function IX(x, y) {
    x = Math.max(0, Math.min(N - 1, x));
    y = Math.max(0, Math.min(N - 1, y));
    return x + y * N;
}

// ==================== 邊界條件 ====================

function setBoundary(b, x) {
    for (let i = 1; i < N - 1; i++) {
        x[IX(i, 0)] = b === 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
        x[IX(i, N - 1)] = b === 2 ? -x[IX(i, N - 2)] : x[IX(i, N - 2)];
    }
    for (let j = 1; j < N - 1; j++) {
        x[IX(0, j)] = b === 1 ? -x[IX(1, j)] : x[IX(1, j)];
        x[IX(N - 1, j)] = b === 1 ? -x[IX(N - 2, j)] : x[IX(N - 2, j)];
    }

    x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
    x[IX(0, N - 1)] = 0.5 * (x[IX(1, N - 1)] + x[IX(0, N - 2)]);
    x[IX(N - 1, 0)] = 0.5 * (x[IX(N - 2, 0)] + x[IX(N - 1, 1)]);
    x[IX(N - 1, N - 1)] = 0.5 * (x[IX(N - 2, N - 1)] + x[IX(N - 1, N - 2)]);
}

// ==================== 擴散 ====================

function diffuse(b, x, x0, diff, dt) {
    const a = dt * diff * (N - 2) * (N - 2);
    linearSolve(b, x, x0, a, 1 + 6 * a);
}

function linearSolve(b, x, x0, a, c) {
    const cRecip = 1.0 / c;
    for (let k = 0; k < 4; k++) {
        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                x[IX(i, j)] = (x0[IX(i, j)] + a * (
                    x[IX(i + 1, j)] + x[IX(i - 1, j)] +
                    x[IX(i, j + 1)] + x[IX(i, j - 1)]
                )) * cRecip;
            }
        }
        setBoundary(b, x);
    }
}

// ==================== 投影（壓力求解）====================

function project(velocX, velocY, p, div) {
    for (let j = 1; j < N - 1; j++) {
        for (let i = 1; i < N - 1; i++) {
            div[IX(i, j)] = -0.5 * (
                velocX[IX(i + 1, j)] - velocX[IX(i - 1, j)] +
                velocY[IX(i, j + 1)] - velocY[IX(i, j - 1)]
            ) / N;
            p[IX(i, j)] = 0;
        }
    }
    setBoundary(0, div);
    setBoundary(0, p);
    linearSolve(0, p, div, 1, 6);

    for (let j = 1; j < N - 1; j++) {
        for (let i = 1; i < N - 1; i++) {
            velocX[IX(i, j)] -= 0.5 * (p[IX(i + 1, j)] - p[IX(i - 1, j)]) * N;
            velocY[IX(i, j)] -= 0.5 * (p[IX(i, j + 1)] - p[IX(i, j - 1)]) * N;
        }
    }
    setBoundary(1, velocX);
    setBoundary(2, velocY);
}

// ==================== 平流 ====================

function advect(b, d, d0, velocX, velocY, dt) {
    const dtx = dt * (N - 2);
    const dty = dt * (N - 2);

    for (let j = 1; j < N - 1; j++) {
        for (let i = 1; i < N - 1; i++) {
            let x = i - dtx * velocX[IX(i, j)];
            let y = j - dty * velocY[IX(i, j)];

            x = Math.max(0.5, Math.min(N - 1.5, x));
            y = Math.max(0.5, Math.min(N - 1.5, y));

            const i0 = Math.floor(x);
            const i1 = i0 + 1;
            const j0 = Math.floor(y);
            const j1 = j0 + 1;

            const s1 = x - i0;
            const s0 = 1 - s1;
            const t1 = y - j0;
            const t0 = 1 - t1;

            d[IX(i, j)] =
                s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j1)]) +
                s1 * (t0 * d0[IX(i1, j0)] + t1 * d0[IX(i1, j1)]);
        }
    }
    setBoundary(b, d);
}

// ==================== 步進 ====================

function step() {
    const dt = 0.2;

    // 速度擴散
    diffuse(1, velocityXPrev, velocityX, config.viscosity, dt);
    diffuse(2, velocityYPrev, velocityY, config.viscosity, dt);

    project(velocityXPrev, velocityYPrev, velocityX, velocityY);

    // 速度平流
    advect(1, velocityX, velocityXPrev, velocityXPrev, velocityYPrev, dt);
    advect(2, velocityY, velocityYPrev, velocityXPrev, velocityYPrev, dt);

    project(velocityX, velocityY, velocityXPrev, velocityYPrev);

    // 密度擴散
    diffuse(0, densityPrev, density, config.diffusion, dt);

    // 密度平流
    advect(0, density, densityPrev, velocityX, velocityY, dt);
}

// ==================== 添加密度和速度 ====================

function addDensity(x, y, amount) {
    const idx = IX(x, y);
    density[idx] += amount;
}

function addVelocity(x, y, amountX, amountY) {
    const idx = IX(x, y);
    velocityX[idx] += amountX;
    velocityY[idx] += amountY;
}

// ==================== 初始化 ====================

function init() {
    resizeCanvas();

    // 設定網格大小（較低以提高效能）
    const scale = 4;
    N = Math.floor(Math.min(canvas.width, canvas.height) / scale);
    size = N * N;

    density = new Float32Array(size);
    densityPrev = new Float32Array(size);
    velocityX = new Float32Array(size);
    velocityY = new Float32Array(size);
    velocityXPrev = new Float32Array(size);
    velocityYPrev = new Float32Array(size);

    document.getElementById('resDisplay').textContent = `${N}x${N}`;
}

// ==================== 繪製 ====================

function draw() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    const cellWidth = canvas.width / N;
    const cellHeight = canvas.height / N;

    for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
            const d = Math.min(255, density[IX(i, j)] * 255);
            const vx = velocityX[IX(i, j)];
            const vy = velocityY[IX(i, j)];
            const speed = Math.sqrt(vx * vx + vy * vy);

            let r, g, b;

            switch (config.colorMode) {
                case 'rainbow':
                    const h = (i / N * 360 + j / N * 180) % 360;
                    const rgb = hslToRgb(h / 360, 0.8, d / 512);
                    r = rgb[0];
                    g = rgb[1];
                    b = rgb[2];
                    break;

                case 'velocity':
                    const velH = (Math.atan2(vy, vx) / Math.PI * 180 + 180) % 360;
                    const velRgb = hslToRgb(velH / 360, 0.8, Math.min(0.6, speed * 10));
                    r = velRgb[0];
                    g = velRgb[1];
                    b = velRgb[2];
                    break;

                case 'density':
                    r = d;
                    g = d * 0.7;
                    b = d * 0.3;
                    break;

                case 'thermal':
                    r = Math.min(255, d * 1.5);
                    g = Math.min(255, d * 0.5);
                    b = Math.min(255, (255 - d) * 0.5);
                    break;
            }

            // 填充像素
            const startX = Math.floor(i * cellWidth);
            const startY = Math.floor(j * cellHeight);
            const endX = Math.floor((i + 1) * cellWidth);
            const endY = Math.floor((j + 1) * cellHeight);

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
        // 處理滑鼠輸入
        if (isMouseDown) {
            const cellWidth = canvas.width / N;
            const cellHeight = canvas.height / N;

            const x = Math.floor(mouseX / cellWidth);
            const y = Math.floor(mouseY / cellHeight);

            const dx = mouseX - prevMouseX;
            const dy = mouseY - prevMouseY;

            // 添加密度和速度
            const brushCells = Math.ceil(config.brushSize / cellWidth);
            for (let i = -brushCells; i <= brushCells; i++) {
                for (let j = -brushCells; j <= brushCells; j++) {
                    const px = x + i;
                    const py = y + j;
                    if (px >= 0 && px < N && py >= 0 && py < N) {
                        const dist = Math.sqrt(i * i + j * j);
                        if (dist <= brushCells) {
                            const factor = 1 - dist / brushCells;
                            addDensity(px, py, 50 * factor);
                            addVelocity(px, py, dx * factor, dy * factor);
                        }
                    }
                }
            }

            hue = (hue + 1) % 360;
        }

        step();

        // 衰減
        for (let i = 0; i < size; i++) {
            density[i] *= 0.99;
        }
    }

    draw();

    // FPS
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = now;
        document.getElementById('fpsDisplay').textContent = fps;
    }

    prevMouseX = mouseX;
    prevMouseY = mouseY;

    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 事件處理 ====================

window.addEventListener('resize', init);

canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
});

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

canvas.addEventListener('mouseleave', () => {
    isMouseDown = false;
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isMouseDown = true;
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
});

canvas.addEventListener('touchend', () => {
    isMouseDown = false;
});

document.getElementById('viscosity').addEventListener('input', (e) => {
    config.viscosity = parseFloat(e.target.value);
    document.getElementById('viscosityValue').textContent = config.viscosity.toFixed(5);
});

document.getElementById('diffusion').addEventListener('input', (e) => {
    config.diffusion = parseFloat(e.target.value);
    document.getElementById('diffusionValue').textContent = config.diffusion.toFixed(5);
});

document.getElementById('brushSize').addEventListener('input', (e) => {
    config.brushSize = parseInt(e.target.value);
    document.getElementById('brushSizeValue').textContent = config.brushSize;
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('resetBtn').addEventListener('click', init);

document.getElementById('pauseBtn').addEventListener('click', () => {
    config.paused = !config.paused;
    const btn = document.getElementById('pauseBtn');
    btn.textContent = config.paused ? '繼續' : '暫停';
    btn.classList.toggle('paused', config.paused);
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(animate);
