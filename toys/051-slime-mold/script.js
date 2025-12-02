/**
 * Slime Mold 黏菌模擬
 * Web Toys #051
 *
 * Physarum 多頭絨泡菌模擬
 *
 * 技術重點：
 * - 代理感測與移動
 * - 費洛蒙軌跡擴散
 * - 自組織網路形成
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    agentCount: 5000,
    sensorAngle: 45,
    sensorDistance: 9,
    turnSpeed: 45,
    moveSpeed: 1,
    decayRate: 0.9,
    depositAmount: 5,
    colorMode: 'green',
    paused: false
};

let agents = [];
let trailMap = [];
let width, height;

// FPS 計算
let lastTime = performance.now();
let frameCount = 0;
let fps = 60;

// ==================== 代理類別 ====================

class Agent {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
    }

    sense(angleOffset) {
        const sensorAngle = this.angle + angleOffset * (Math.PI / 180);
        const sensorX = Math.floor(this.x + Math.cos(sensorAngle) * config.sensorDistance);
        const sensorY = Math.floor(this.y + Math.sin(sensorAngle) * config.sensorDistance);

        // 邊界檢查
        if (sensorX < 0 || sensorX >= width || sensorY < 0 || sensorY >= height) {
            return 0;
        }

        return trailMap[sensorY * width + sensorX];
    }

    update() {
        // 感測三個方向
        const frontSense = this.sense(0);
        const leftSense = this.sense(-config.sensorAngle);
        const rightSense = this.sense(config.sensorAngle);

        const turnSpeedRad = config.turnSpeed * (Math.PI / 180);

        // 根據感測結果轉向
        if (frontSense > leftSense && frontSense > rightSense) {
            // 前方最強，保持方向
        } else if (frontSense < leftSense && frontSense < rightSense) {
            // 前方最弱，隨機轉向
            this.angle += (Math.random() > 0.5 ? 1 : -1) * turnSpeedRad;
        } else if (leftSense > rightSense) {
            // 左邊較強，左轉
            this.angle -= turnSpeedRad;
        } else if (rightSense > leftSense) {
            // 右邊較強，右轉
            this.angle += turnSpeedRad;
        }

        // 移動
        this.x += Math.cos(this.angle) * config.moveSpeed;
        this.y += Math.sin(this.angle) * config.moveSpeed;

        // 邊界處理
        if (this.x < 0) {
            this.x = 0;
            this.angle = Math.random() * Math.PI * 2;
        }
        if (this.x >= width) {
            this.x = width - 1;
            this.angle = Math.random() * Math.PI * 2;
        }
        if (this.y < 0) {
            this.y = 0;
            this.angle = Math.random() * Math.PI * 2;
        }
        if (this.y >= height) {
            this.y = height - 1;
            this.angle = Math.random() * Math.PI * 2;
        }

        // 沉積費洛蒙
        const ix = Math.floor(this.x);
        const iy = Math.floor(this.y);
        if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
            trailMap[iy * width + ix] = Math.min(255, trailMap[iy * width + ix] + config.depositAmount);
        }
    }
}

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    width = canvas.width;
    height = canvas.height;

    // 初始化軌跡地圖
    trailMap = new Float32Array(width * height);

    // 創建代理（從中心圓形分布）
    agents = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    for (let i = 0; i < config.agentCount; i++) {
        // 圓形分布
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        const heading = Math.atan2(centerY - y, centerX - x) + (Math.random() - 0.5);

        agents.push(new Agent(x, y, heading));
    }

    document.getElementById('countDisplay').textContent = config.agentCount;
}

// ==================== 擴散與衰減 ====================

function diffuseAndDecay() {
    const newMap = new Float32Array(width * height);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = y * width + x;

            // 3x3 模糊
            let sum = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    sum += trailMap[(y + dy) * width + (x + dx)];
                }
            }

            // 平均並衰減
            newMap[i] = (sum / 9) * config.decayRate;
        }
    }

    trailMap = newMap;
}

// ==================== 繪製 ====================

function draw() {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < trailMap.length; i++) {
        const value = Math.min(255, trailMap[i]);
        const idx = i * 4;

        switch (config.colorMode) {
            case 'green':
                data[idx] = value * 0.3;
                data[idx + 1] = value;
                data[idx + 2] = value * 0.5;
                break;

            case 'blue':
                data[idx] = value * 0.3;
                data[idx + 1] = value * 0.6;
                data[idx + 2] = value;
                break;

            case 'rainbow':
                const h = (value / 255) * 360;
                const rgb = hslToRgb(h / 360, 0.8, value / 512);
                data[idx] = rgb[0];
                data[idx + 1] = rgb[1];
                data[idx + 2] = rgb[2];
                break;

            case 'heat':
                data[idx] = Math.min(255, value * 1.5);
                data[idx + 1] = value * 0.5;
                data[idx + 2] = value * 0.2;
                break;
        }

        data[idx + 3] = 255;
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
        // 更新所有代理
        for (const agent of agents) {
            agent.update();
        }

        // 擴散與衰減
        diffuseAndDecay();

        // 繪製
        draw();
    }

    // 計算 FPS
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

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    // 使用較低解析度以提高效能
    const scale = 0.5;
    canvas.width = Math.floor(window.innerWidth * scale);
    canvas.height = Math.floor(window.innerHeight * scale);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
}

// ==================== 事件處理 ====================

window.addEventListener('resize', init);

document.getElementById('agentCount').addEventListener('input', (e) => {
    config.agentCount = parseInt(e.target.value);
    document.getElementById('agentCountValue').textContent = config.agentCount;
    init();
});

document.getElementById('sensorAngle').addEventListener('input', (e) => {
    config.sensorAngle = parseInt(e.target.value);
    document.getElementById('sensorAngleValue').textContent = config.sensorAngle;
});

document.getElementById('sensorDistance').addEventListener('input', (e) => {
    config.sensorDistance = parseInt(e.target.value);
    document.getElementById('sensorDistanceValue').textContent = config.sensorDistance;
});

document.getElementById('turnSpeed').addEventListener('input', (e) => {
    config.turnSpeed = parseInt(e.target.value);
    document.getElementById('turnSpeedValue').textContent = config.turnSpeed;
});

document.getElementById('decayRate').addEventListener('input', (e) => {
    config.decayRate = parseFloat(e.target.value);
    document.getElementById('decayRateValue').textContent = config.decayRate.toFixed(2);
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

// 點擊添加代理
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (let i = 0; i < 500; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 30;
        agents.push(new Agent(
            x + Math.cos(angle) * r,
            y + Math.sin(angle) * r,
            Math.random() * Math.PI * 2
        ));
    }

    document.getElementById('countDisplay').textContent = agents.length;
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(animate);
