/**
 * Particle Life 粒子生命
 * Web Toys #050
 *
 * 人工生命粒子模擬
 *
 * 技術重點：
 * - 多種粒子間的吸引/排斥力
 * - 隨機力矩陣生成
 * - 湧現行為模擬
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    particleCount: 500,
    colorCount: 4,
    forceRange: 80,
    friction: 0.1,
    paused: false
};

let particles = [];
let forceMatrix = [];
let colors = [];

// ==================== 顏色定義 ====================

const colorPalette = [
    '#ff6496', // 粉紅
    '#64ff96', // 綠
    '#6496ff', // 藍
    '#ffff64', // 黃
    '#ff9664', // 橙
    '#c864ff', // 紫
    '#64ffff', // 青
    '#ff6464'  // 紅
];

// ==================== 粒子類別 ====================

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.type = type;
    }

    update() {
        // 應用速度
        this.x += this.vx;
        this.y += this.vy;

        // 摩擦力
        this.vx *= (1 - config.friction);
        this.vy *= (1 - config.friction);

        // 邊界處理（環繞）
        if (this.x < 0) this.x += canvas.width;
        if (this.x > canvas.width) this.x -= canvas.width;
        if (this.y < 0) this.y += canvas.height;
        if (this.y > canvas.height) this.y -= canvas.height;
    }

    draw() {
        ctx.fillStyle = colors[this.type];
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==================== 力矩陣生成 ====================

function generateForceMatrix(preset = 'random') {
    forceMatrix = [];

    for (let i = 0; i < config.colorCount; i++) {
        forceMatrix[i] = [];
        for (let j = 0; j < config.colorCount; j++) {
            switch (preset) {
                case 'random':
                    forceMatrix[i][j] = (Math.random() * 2 - 1);
                    break;

                case 'symmetric':
                    if (j >= i) {
                        forceMatrix[i][j] = (Math.random() * 2 - 1);
                    } else {
                        forceMatrix[i][j] = forceMatrix[j][i];
                    }
                    break;

                case 'chains':
                    // 每種顏色被下一種吸引
                    if ((i + 1) % config.colorCount === j) {
                        forceMatrix[i][j] = 0.8;
                    } else if (i === j) {
                        forceMatrix[i][j] = -0.3;
                    } else {
                        forceMatrix[i][j] = 0;
                    }
                    break;

                case 'orbits':
                    // 創造軌道行為
                    if (i === j) {
                        forceMatrix[i][j] = 0.1; // 輕微自吸引
                    } else if (Math.abs(i - j) === 1 || Math.abs(i - j) === config.colorCount - 1) {
                        forceMatrix[i][j] = 0.5; // 相鄰顏色吸引
                    } else {
                        forceMatrix[i][j] = -0.3; // 其他排斥
                    }
                    break;

                case 'chaos':
                    // 強烈的隨機力
                    forceMatrix[i][j] = (Math.random() * 4 - 2);
                    break;
            }
        }
    }
}

// ==================== 計算粒子間力 ====================

function calculateForces() {
    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        let fx = 0;
        let fy = 0;

        for (let j = 0; j < particles.length; j++) {
            if (i === j) continue;

            const p2 = particles[j];

            // 計算距離（考慮環繞）
            let dx = p2.x - p1.x;
            let dy = p2.y - p1.y;

            // 環繞距離
            if (dx > canvas.width / 2) dx -= canvas.width;
            if (dx < -canvas.width / 2) dx += canvas.width;
            if (dy > canvas.height / 2) dy -= canvas.height;
            if (dy < -canvas.height / 2) dy += canvas.height;

            const d = Math.sqrt(dx * dx + dy * dy);

            if (d > 0 && d < config.forceRange) {
                // 獲取力的大小
                const force = forceMatrix[p1.type][p2.type];

                // 力的衰減（基於距離）
                let strength;
                if (d < config.forceRange * 0.3) {
                    // 近距離排斥（避免重疊）
                    strength = d / (config.forceRange * 0.3) - 1;
                } else {
                    // 遠距離吸引/排斥
                    strength = force * (1 - Math.abs(d - config.forceRange * 0.5) / (config.forceRange * 0.5));
                }

                fx += (dx / d) * strength * 0.5;
                fy += (dy / d) * strength * 0.5;
            }
        }

        p1.vx += fx;
        p1.vy += fy;

        // 限制最大速度
        const speed = Math.sqrt(p1.vx * p1.vx + p1.vy * p1.vy);
        if (speed > 5) {
            p1.vx = (p1.vx / speed) * 5;
            p1.vy = (p1.vy / speed) * 5;
        }
    }
}

// ==================== 初始化 ====================

function init(preset = 'random') {
    resizeCanvas();

    // 設置顏色
    colors = colorPalette.slice(0, config.colorCount);

    // 生成力矩陣
    generateForceMatrix(preset);

    // 創建粒子
    particles = [];
    const particlesPerType = Math.floor(config.particleCount / config.colorCount);

    for (let t = 0; t < config.colorCount; t++) {
        for (let i = 0; i < particlesPerType; i++) {
            particles.push(new Particle(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                t
            ));
        }
    }

    updateDisplay();
}

// ==================== 更新顯示 ====================

function updateDisplay() {
    document.getElementById('countDisplay').textContent = particles.length;
    document.getElementById('typeDisplay').textContent = config.colorCount;
}

// ==================== 動畫迴圈 ====================

function animate() {
    if (!config.paused) {
        // 清除畫布（帶拖尾）
        ctx.fillStyle = 'rgba(5, 5, 5, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 計算力並更新
        calculateForces();

        for (const particle of particles) {
            particle.update();
            particle.draw();
        }
    }

    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 事件處理 ====================

window.addEventListener('resize', () => {
    resizeCanvas();
});

document.getElementById('particleCount').addEventListener('input', (e) => {
    config.particleCount = parseInt(e.target.value);
    document.getElementById('particleCountValue').textContent = config.particleCount;
    init(document.getElementById('preset').value);
});

document.getElementById('colorCount').addEventListener('input', (e) => {
    config.colorCount = parseInt(e.target.value);
    document.getElementById('colorCountValue').textContent = config.colorCount;
    init(document.getElementById('preset').value);
});

document.getElementById('forceRange').addEventListener('input', (e) => {
    config.forceRange = parseInt(e.target.value);
    document.getElementById('forceRangeValue').textContent = config.forceRange;
});

document.getElementById('friction').addEventListener('input', (e) => {
    config.friction = parseFloat(e.target.value);
    document.getElementById('frictionValue').textContent = config.friction.toFixed(2);
});

document.getElementById('preset').addEventListener('change', (e) => {
    init(e.target.value);
});

document.getElementById('resetBtn').addEventListener('click', () => {
    init(document.getElementById('preset').value);
});

document.getElementById('randomizeBtn').addEventListener('click', () => {
    generateForceMatrix('random');
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    config.paused = !config.paused;
    const btn = document.getElementById('pauseBtn');
    btn.textContent = config.paused ? '繼續' : '暫停';
    btn.classList.toggle('paused', config.paused);
});

// 點擊添加粒子
canvas.addEventListener('click', (e) => {
    const type = Math.floor(Math.random() * config.colorCount);
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(
            e.clientX + (Math.random() - 0.5) * 50,
            e.clientY + (Math.random() - 0.5) * 50,
            type
        ));
    }
    updateDisplay();
});

// ==================== 啟動 ====================

init('random');
requestAnimationFrame(animate);
