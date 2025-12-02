/**
 * Boids 群集模擬
 * Web Toys #048
 *
 * Craig Reynolds 的群集行為演算法
 *
 * 技術重點：
 * - 分離、對齊、凝聚三規則
 * - 空間分區優化
 * - 互動式吸引/驅散
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('boidsCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    boidCount: 200,
    separation: 1.5,
    alignment: 1.0,
    cohesion: 1.0,
    visualRange: 75,
    maxSpeed: 4,
    maxForce: 0.1,
    colorMode: 'velocity',
    paused: false
};

let boids = [];
let mousePos = null;
let mouseRepel = false;

// FPS 計算
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 60;

// ==================== Boid 類別 ====================

class Boid {
    constructor(x, y) {
        this.position = { x, y };
        this.velocity = {
            x: (Math.random() - 0.5) * config.maxSpeed * 2,
            y: (Math.random() - 0.5) * config.maxSpeed * 2
        };
        this.acceleration = { x: 0, y: 0 };
        this.id = Math.random();
    }

    // 計算與其他 boid 的距離
    distance(other) {
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 分離：避免過度擁擠
    separate(boids) {
        const desiredSeparation = 25;
        let steer = { x: 0, y: 0 };
        let count = 0;

        for (const other of boids) {
            const d = this.distance(other);
            if (d > 0 && d < desiredSeparation) {
                let diff = {
                    x: this.position.x - other.position.x,
                    y: this.position.y - other.position.y
                };
                const mag = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
                diff.x /= mag;
                diff.y /= mag;
                diff.x /= d;
                diff.y /= d;
                steer.x += diff.x;
                steer.y += diff.y;
                count++;
            }
        }

        if (count > 0) {
            steer.x /= count;
            steer.y /= count;
        }

        const mag = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
        if (mag > 0) {
            steer.x = (steer.x / mag) * config.maxSpeed - this.velocity.x;
            steer.y = (steer.y / mag) * config.maxSpeed - this.velocity.y;
            const steerMag = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
            if (steerMag > config.maxForce) {
                steer.x = (steer.x / steerMag) * config.maxForce;
                steer.y = (steer.y / steerMag) * config.maxForce;
            }
        }

        return steer;
    }

    // 對齊：與鄰近 boid 保持相同方向
    align(boids) {
        let sum = { x: 0, y: 0 };
        let count = 0;

        for (const other of boids) {
            const d = this.distance(other);
            if (d > 0 && d < config.visualRange) {
                sum.x += other.velocity.x;
                sum.y += other.velocity.y;
                count++;
            }
        }

        if (count > 0) {
            sum.x /= count;
            sum.y /= count;
            const mag = Math.sqrt(sum.x * sum.x + sum.y * sum.y);
            sum.x = (sum.x / mag) * config.maxSpeed;
            sum.y = (sum.y / mag) * config.maxSpeed;
            let steer = {
                x: sum.x - this.velocity.x,
                y: sum.y - this.velocity.y
            };
            const steerMag = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
            if (steerMag > config.maxForce) {
                steer.x = (steer.x / steerMag) * config.maxForce;
                steer.y = (steer.y / steerMag) * config.maxForce;
            }
            return steer;
        }

        return { x: 0, y: 0 };
    }

    // 凝聚：向鄰近 boid 的中心靠攏
    cohere(boids) {
        let sum = { x: 0, y: 0 };
        let count = 0;

        for (const other of boids) {
            const d = this.distance(other);
            if (d > 0 && d < config.visualRange) {
                sum.x += other.position.x;
                sum.y += other.position.y;
                count++;
            }
        }

        if (count > 0) {
            sum.x /= count;
            sum.y /= count;
            return this.seek(sum);
        }

        return { x: 0, y: 0 };
    }

    // 尋找目標
    seek(target) {
        let desired = {
            x: target.x - this.position.x,
            y: target.y - this.position.y
        };
        const mag = Math.sqrt(desired.x * desired.x + desired.y * desired.y);
        desired.x = (desired.x / mag) * config.maxSpeed;
        desired.y = (desired.y / mag) * config.maxSpeed;

        let steer = {
            x: desired.x - this.velocity.x,
            y: desired.y - this.velocity.y
        };
        const steerMag = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
        if (steerMag > config.maxForce) {
            steer.x = (steer.x / steerMag) * config.maxForce;
            steer.y = (steer.y / steerMag) * config.maxForce;
        }

        return steer;
    }

    // 滑鼠互動
    mouseInteraction() {
        if (!mousePos) return { x: 0, y: 0 };

        const dx = mousePos.x - this.position.x;
        const dy = mousePos.y - this.position.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < 150) {
            const force = mouseRepel ? -1 : 1;
            const strength = (150 - d) / 150 * 0.5;
            return {
                x: (dx / d) * strength * force,
                y: (dy / d) * strength * force
            };
        }

        return { x: 0, y: 0 };
    }

    // 應用行為規則
    flock(boids) {
        const sep = this.separate(boids);
        const ali = this.align(boids);
        const coh = this.cohere(boids);
        const mouse = this.mouseInteraction();

        // 權重
        sep.x *= config.separation;
        sep.y *= config.separation;
        ali.x *= config.alignment;
        ali.y *= config.alignment;
        coh.x *= config.cohesion;
        coh.y *= config.cohesion;

        this.acceleration.x += sep.x + ali.x + coh.x + mouse.x;
        this.acceleration.y += sep.y + ali.y + coh.y + mouse.y;
    }

    // 更新位置
    update() {
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;

        // 限制速度
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > config.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * config.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * config.maxSpeed;
        }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // 重設加速度
        this.acceleration.x = 0;
        this.acceleration.y = 0;

        // 邊界環繞
        if (this.position.x < 0) this.position.x = canvas.width;
        if (this.position.x > canvas.width) this.position.x = 0;
        if (this.position.y < 0) this.position.y = canvas.height;
        if (this.position.y > canvas.height) this.position.y = 0;
    }

    // 繪製
    draw() {
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);

        // 顏色
        let color;
        switch (config.colorMode) {
            case 'velocity':
                const h = 200 + (speed / config.maxSpeed) * 60;
                color = `hsl(${h}, 80%, 60%)`;
                break;
            case 'direction':
                const dirH = ((angle + Math.PI) / (Math.PI * 2)) * 360;
                color = `hsl(${dirH}, 70%, 55%)`;
                break;
            case 'cluster':
                const clusterH = (this.id * 360) % 360;
                color = `hsl(${clusterH}, 70%, 55%)`;
                break;
            case 'rainbow':
                const rainbowH = (Date.now() / 20 + this.id * 100) % 360;
                color = `hsl(${rainbowH}, 80%, 55%)`;
                break;
        }

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle);

        // 繪製三角形
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-5, 4);
        ctx.lineTo(-5, -4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    boids = [];

    for (let i = 0; i < config.boidCount; i++) {
        boids.push(new Boid(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }

    document.getElementById('countDisplay').textContent = config.boidCount;
}

// ==================== 動畫迴圈 ====================

function animate() {
    if (!config.paused) {
        // 清除畫布
        ctx.fillStyle = 'rgba(5, 5, 16, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 更新並繪製所有 boid
        for (const boid of boids) {
            boid.flock(boids);
            boid.update();
            boid.draw();
        }
    }

    // 計算 FPS
    frameCount++;
    const now = performance.now();
    if (now - lastFrameTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFrameTime = now;
        document.getElementById('fpsDisplay').textContent = fps;
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

canvas.addEventListener('mousemove', (e) => {
    mousePos = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('mouseleave', () => {
    mousePos = null;
});

canvas.addEventListener('mousedown', (e) => {
    mousePos = { x: e.clientX, y: e.clientY };
    mouseRepel = e.shiftKey;
});

canvas.addEventListener('mouseup', () => {
    mouseRepel = false;
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') mouseRepel = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') mouseRepel = false;
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mousePos = { x: touch.clientX, y: touch.clientY };
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mousePos = { x: touch.clientX, y: touch.clientY };
});

canvas.addEventListener('touchend', () => {
    mousePos = null;
});

// 控制項
document.getElementById('boidCount').addEventListener('input', (e) => {
    config.boidCount = parseInt(e.target.value);
    document.getElementById('boidCountValue').textContent = config.boidCount;
    init();
});

document.getElementById('separation').addEventListener('input', (e) => {
    config.separation = parseFloat(e.target.value);
    document.getElementById('separationValue').textContent = config.separation.toFixed(1);
});

document.getElementById('alignment').addEventListener('input', (e) => {
    config.alignment = parseFloat(e.target.value);
    document.getElementById('alignmentValue').textContent = config.alignment.toFixed(1);
});

document.getElementById('cohesion').addEventListener('input', (e) => {
    config.cohesion = parseFloat(e.target.value);
    document.getElementById('cohesionValue').textContent = config.cohesion.toFixed(1);
});

document.getElementById('visualRange').addEventListener('input', (e) => {
    config.visualRange = parseInt(e.target.value);
    document.getElementById('visualRangeValue').textContent = config.visualRange;
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
