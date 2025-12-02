/**
 * Perlin Flow 柏林流場
 * Web Toys #021
 *
 * 粒子沿著 Perlin 噪聲流場移動，產生如絲綢般的軌跡藝術
 *
 * 技術重點：
 * - Perlin Noise 演算法
 * - 向量場視覺化
 * - 粒子軌跡渲染
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('flowCanvas');
const ctx = canvas.getContext('2d');

// ==================== Perlin Noise 實現 ====================

class PerlinNoise {
    constructor(seed = Math.random() * 10000) {
        this.seed = seed;
        this.permutation = this.generatePermutation();
    }

    generatePermutation() {
        const p = [];
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }

        // Fisher-Yates shuffle with seed
        let n = 256;
        const random = this.seededRandom(this.seed);
        while (n > 1) {
            const k = Math.floor(random() * n);
            n--;
            [p[n], p[k]] = [p[k], p[n]];
        }

        // 複製陣列以避免索引溢出
        return [...p, ...p];
    }

    seededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const p = this.permutation;
        const A = p[X] + Y;
        const B = p[X + 1] + Y;

        return this.lerp(
            this.lerp(this.grad(p[A], x, y), this.grad(p[B], x - 1, y), u),
            this.lerp(this.grad(p[A + 1], x, y - 1), this.grad(p[B + 1], x - 1, y - 1), u),
            v
        );
    }

    // 多重八度噪聲
    octaveNoise(x, y, octaves = 4, persistence = 0.5) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        return total / maxValue;
    }
}

// ==================== 配置參數 ====================

let config = {
    particleCount: 3000,
    noiseScale: 0.003,
    speed: 2,
    fadeSpeed: 0.03,
    colorMode: 'rainbow'
};

let perlin = new PerlinNoise();
let particles = [];
let time = 0;

// ==================== 顏色方案 ====================

const colorSchemes = {
    rainbow: (angle, speed) => {
        const hue = (angle / Math.PI / 2 * 360 + time * 10) % 360;
        return `hsla(${hue}, 80%, 60%, ${0.3 + speed * 0.1})`;
    },
    ocean: (angle, speed) => {
        const hue = 180 + Math.sin(angle) * 40;
        return `hsla(${hue}, 70%, ${40 + speed * 10}%, ${0.3 + speed * 0.1})`;
    },
    fire: (angle, speed) => {
        const hue = 20 + Math.sin(angle) * 30;
        return `hsla(${hue}, 90%, ${50 + speed * 10}%, ${0.3 + speed * 0.1})`;
    },
    aurora: (angle, speed) => {
        const hue = 120 + Math.sin(angle + time * 0.5) * 60;
        return `hsla(${hue}, 70%, ${50 + speed * 10}%, ${0.2 + speed * 0.1})`;
    },
    monochrome: (angle, speed) => {
        const brightness = 50 + speed * 20;
        return `hsla(200, 10%, ${brightness}%, ${0.3 + speed * 0.1})`;
    }
};

// ==================== 粒子類別 ====================

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.prevX = this.x;
        this.prevY = this.y;
        this.life = Math.random() * 100 + 100;
        this.maxLife = this.life;
    }

    update() {
        this.prevX = this.x;
        this.prevY = this.y;

        // 取得流場角度
        const noiseValue = perlin.octaveNoise(
            this.x * config.noiseScale,
            this.y * config.noiseScale + time * 0.0001,
            4,
            0.5
        );
        const angle = noiseValue * Math.PI * 4;

        // 移動粒子
        this.x += Math.cos(angle) * config.speed;
        this.y += Math.sin(angle) * config.speed;

        this.life--;

        // 檢查邊界或生命結束
        if (this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height ||
            this.life <= 0) {
            this.reset();
        }
    }

    draw(ctx) {
        const dx = this.x - this.prevX;
        const dy = this.y - this.prevY;
        const speed = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const colorFn = colorSchemes[config.colorMode];
        ctx.strokeStyle = colorFn(angle, speed / config.speed);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }
}

// ==================== 初始化 ====================

function initParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
    }
    document.getElementById('particleDisplay').textContent = config.particleCount;
}

function clearCanvas() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ==================== 動畫迴圈 ====================

let lastTime = 0;
let frameCount = 0;
let fpsTime = 0;

function animate(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    time++;

    // FPS 計算
    frameCount++;
    fpsTime += deltaTime;
    if (fpsTime >= 1000) {
        document.getElementById('fpsDisplay').textContent = frameCount;
        frameCount = 0;
        fpsTime = 0;
    }

    // 淡化背景以產生軌跡效果
    ctx.fillStyle = `rgba(0, 0, 0, ${config.fadeSpeed})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新和繪製粒子
    particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
    });

    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    clearCanvas();
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('particleCount').addEventListener('input', (e) => {
    config.particleCount = parseInt(e.target.value);
    document.getElementById('particleCountValue').textContent = config.particleCount;
    initParticles();
});

document.getElementById('noiseScale').addEventListener('input', (e) => {
    config.noiseScale = parseFloat(e.target.value);
    document.getElementById('noiseScaleValue').textContent = config.noiseScale.toFixed(3);
});

document.getElementById('speed').addEventListener('input', (e) => {
    config.speed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = config.speed;
});

document.getElementById('fadeSpeed').addEventListener('input', (e) => {
    config.fadeSpeed = parseFloat(e.target.value);
    document.getElementById('fadeSpeedValue').textContent = config.fadeSpeed.toFixed(2);
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('clearBtn').addEventListener('click', clearCanvas);

document.getElementById('randomizeBtn').addEventListener('click', () => {
    perlin = new PerlinNoise();
    clearCanvas();
});

// ==================== 啟動 ====================

resizeCanvas();
initParticles();
requestAnimationFrame(animate);
