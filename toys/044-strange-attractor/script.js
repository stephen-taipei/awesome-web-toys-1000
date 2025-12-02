/**
 * Strange Attractor 奇異吸引子
 * Web Toys #044
 *
 * 視覺化多種混沌吸引子
 *
 * 技術重點：
 * - 微分方程數值積分
 * - 3D 投影
 * - 動態軌跡渲染
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('attractorCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    attractorType: 'lorenz',
    speed: 1,
    trailLength: 5000,
    rotationSpeed: 0.5,
    colorMode: 'velocity'
};

// 吸引子參數
const attractors = {
    lorenz: {
        name: '洛倫茲',
        params: { sigma: 10, rho: 28, beta: 8/3 },
        scale: 8,
        dt: 0.005,
        init: () => ({ x: 1, y: 1, z: 1 }),
        step: (p, params, dt) => ({
            x: p.x + params.sigma * (p.y - p.x) * dt,
            y: p.y + (p.x * (params.rho - p.z) - p.y) * dt,
            z: p.z + (p.x * p.y - params.beta * p.z) * dt
        })
    },
    rossler: {
        name: '羅斯勒',
        params: { a: 0.2, b: 0.2, c: 5.7 },
        scale: 15,
        dt: 0.02,
        init: () => ({ x: 0.1, y: 0.1, z: 0.1 }),
        step: (p, params, dt) => ({
            x: p.x + (-p.y - p.z) * dt,
            y: p.y + (p.x + params.a * p.y) * dt,
            z: p.z + (params.b + p.z * (p.x - params.c)) * dt
        })
    },
    thomas: {
        name: '托馬斯',
        params: { b: 0.208186 },
        scale: 25,
        dt: 0.05,
        init: () => ({ x: 1.1, y: 1.1, z: -0.01 }),
        step: (p, params, dt) => ({
            x: p.x + (Math.sin(p.y) - params.b * p.x) * dt,
            y: p.y + (Math.sin(p.z) - params.b * p.y) * dt,
            z: p.z + (Math.sin(p.x) - params.b * p.z) * dt
        })
    },
    aizawa: {
        name: '艾澤瓦',
        params: { a: 0.95, b: 0.7, c: 0.6, d: 3.5, e: 0.25, f: 0.1 },
        scale: 120,
        dt: 0.01,
        init: () => ({ x: 0.1, y: 0, z: 0 }),
        step: (p, params, dt) => ({
            x: p.x + ((p.z - params.b) * p.x - params.d * p.y) * dt,
            y: p.y + (params.d * p.x + (p.z - params.b) * p.y) * dt,
            z: p.z + (params.c + params.a * p.z - p.z * p.z * p.z / 3 -
                (p.x * p.x + p.y * p.y) * (1 + params.e * p.z) + params.f * p.z * p.x * p.x * p.x) * dt
        })
    },
    halvorsen: {
        name: '哈爾沃森',
        params: { a: 1.89 },
        scale: 12,
        dt: 0.005,
        init: () => ({ x: -1.48, y: -1.51, z: 2.04 }),
        step: (p, params, dt) => ({
            x: p.x + (-params.a * p.x - 4 * p.y - 4 * p.z - p.y * p.y) * dt,
            y: p.y + (-params.a * p.y - 4 * p.z - 4 * p.x - p.z * p.z) * dt,
            z: p.z + (-params.a * p.z - 4 * p.x - 4 * p.y - p.x * p.x) * dt
        })
    }
};

let points = [];
let point;
let time = 0;
let rotationAngle = 0;

// ==================== 顏色模式 ====================

const colorModes = {
    velocity: (index, total, velocity) => {
        const h = 30 + velocity * 200;
        const l = 40 + velocity * 20;
        return `hsl(${h}, 90%, ${l}%)`;
    },
    rainbow: (index, total) => {
        const h = (index / total) * 360;
        return `hsl(${h}, 80%, 55%)`;
    },
    depth: (index, total, velocity, z) => {
        const h = 30;
        const l = 30 + z * 40;
        return `hsl(${h}, 80%, ${Math.max(20, Math.min(70, l))}%)`;
    },
    mono: () => '#ff9664'
};

// ==================== 3D 投影 ====================

function project(x, y, z, angle) {
    // 繞 Y 軸旋轉
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const rx = x * cosA - z * sinA;
    const rz = x * sinA + z * cosA;

    // 簡單透視投影
    const scale = 300 / (300 + rz);
    return {
        x: rx * scale,
        y: y * scale,
        z: rz,
        scale: scale
    };
}

// ==================== 初始化 ====================

function init() {
    const attractor = attractors[config.attractorType];
    point = attractor.init();
    points = [];
    time = 0;

    document.getElementById('typeDisplay').textContent = attractor.name;
}

// ==================== 模擬步進 ====================

function simulate() {
    const attractor = attractors[config.attractorType];
    const dt = attractor.dt * config.speed;

    // 計算速度（用於著色）
    const prevPoint = { ...point };
    point = attractor.step(point, attractor.params, dt);

    const dx = point.x - prevPoint.x;
    const dy = point.y - prevPoint.y;
    const dz = point.z - prevPoint.z;
    const velocity = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // 添加到軌跡
    points.push({
        x: point.x,
        y: point.y,
        z: point.z,
        velocity: Math.min(1, velocity * 10)
    });

    // 限制軌跡長度
    while (points.length > config.trailLength) {
        points.shift();
    }
}

// ==================== 繪製 ====================

function draw() {
    // 清除畫布
    ctx.fillStyle = 'rgba(5, 5, 8, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (points.length < 2) return;

    const attractor = attractors[config.attractorType];
    const scale = attractor.scale;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 更新旋轉角度
    rotationAngle += config.rotationSpeed * 0.01;

    // 繪製軌跡
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];

        const proj1 = project(p1.x * scale, p1.y * scale, p1.z * scale, rotationAngle);
        const proj2 = project(p2.x * scale, p2.y * scale, p2.z * scale, rotationAngle);

        // 根據深度調整透明度
        const alpha = 0.3 + proj2.scale * 0.5;

        // 選擇顏色
        const colorFn = colorModes[config.colorMode];
        const normalizedZ = (p2.z - Math.min(...points.map(p => p.z))) /
            (Math.max(...points.map(p => p.z)) - Math.min(...points.map(p => p.z)) || 1);

        ctx.strokeStyle = colorFn(i, points.length, p2.velocity, normalizedZ);
        ctx.globalAlpha = alpha * (i / points.length);

        ctx.beginPath();
        ctx.moveTo(centerX + proj1.x, centerY - proj1.y);
        ctx.lineTo(centerX + proj2.x, centerY - proj2.y);
        ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // 更新資訊
    document.getElementById('pointsDisplay').textContent = points.length;
}

// ==================== 動畫迴圈 ====================

function animate() {
    // 每幀多次模擬以加速
    const steps = Math.ceil(config.speed * 5);
    for (let i = 0; i < steps; i++) {
        simulate();
    }

    draw();
    time++;

    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('attractorType').addEventListener('change', (e) => {
    config.attractorType = e.target.value;
    init();
});

document.getElementById('speed').addEventListener('input', (e) => {
    config.speed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = config.speed.toFixed(1);
});

document.getElementById('trailLength').addEventListener('input', (e) => {
    config.trailLength = parseInt(e.target.value);
    document.getElementById('trailLengthValue').textContent = config.trailLength;
});

document.getElementById('rotationSpeed').addEventListener('input', (e) => {
    config.rotationSpeed = parseFloat(e.target.value);
    document.getElementById('rotationSpeedValue').textContent = config.rotationSpeed.toFixed(1);
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('resetBtn').addEventListener('click', init);

// ==================== 啟動 ====================

resizeCanvas();
init();
requestAnimationFrame(animate);
