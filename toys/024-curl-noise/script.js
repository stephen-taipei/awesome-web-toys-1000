/**
 * Curl Noise 捲曲噪聲
 * Web Toys #024
 *
 * 使用 Curl Noise 產生無發散流場，粒子永不相交的優雅運動
 *
 * 技術重點：
 * - Curl Noise 演算法（旋度計算）
 * - 無發散向量場
 * - WebGL 著色器優化（可選）
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('curlCanvas');
const ctx = canvas.getContext('2d');

// ==================== Simplex Noise 實現 ====================

class SimplexNoise {
    constructor(seed = Math.random() * 10000) {
        this.seed = seed;
        this.p = new Uint8Array(256);
        this.perm = new Uint8Array(512);

        const random = this.seededRandom(seed);
        for (let i = 0; i < 256; i++) {
            this.p[i] = i;
        }

        for (let i = 255; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }

        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }

        this.grad3 = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];
    }

    seededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    dot(g, x, y, z) {
        return g[0] * x + g[1] * y + (z !== undefined ? g[2] * z : 0);
    }

    noise2D(xin, yin) {
        const F2 = 0.5 * (Math.sqrt(3) - 1);
        const G2 = (3 - Math.sqrt(3)) / 6;

        let n0, n1, n2;

        const s = (xin + yin) * F2;
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);

        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;

        let i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; }
        else { i1 = 0; j1 = 1; }

        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2;
        const y2 = y0 - 1 + 2 * G2;

        const ii = i & 255;
        const jj = j & 255;
        const gi0 = this.perm[ii + this.perm[jj]] % 12;
        const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

        let t0 = 0.5 - x0 * x0 - y0 * y0;
        n0 = t0 < 0 ? 0 : (t0 *= t0, t0 * t0 * this.dot(this.grad3[gi0], x0, y0));

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        n1 = t1 < 0 ? 0 : (t1 *= t1, t1 * t1 * this.dot(this.grad3[gi1], x1, y1));

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        n2 = t2 < 0 ? 0 : (t2 *= t2, t2 * t2 * this.dot(this.grad3[gi2], x2, y2));

        return 70 * (n0 + n1 + n2);
    }

    // 3D 噪聲用於時間演化
    noise3D(xin, yin, zin) {
        // 簡化的 3D 噪聲（使用 2D 噪聲組合）
        const xy = this.noise2D(xin, yin);
        const yz = this.noise2D(yin + 31.416, zin);
        const xz = this.noise2D(xin + 47.853, zin);
        return (xy + yz + xz) / 3;
    }
}

// ==================== 配置參數 ====================

let config = {
    particleCount: 8000,
    noiseScale: 0.004,
    speed: 1.5,
    evolution: 0.0005,
    colorMode: 'velocity'
};

let noise = new SimplexNoise();
let particles = [];
let time = 0;

// ==================== Curl Noise 計算 ====================

/**
 * 計算 Curl Noise 向量
 * Curl = (∂ψ/∂y, -∂ψ/∂x) 其中 ψ 是純量勢場
 */
function getCurlNoise(x, y, t) {
    const eps = 0.0001; // 微分步長
    const scale = config.noiseScale;

    // 計算純量勢場在四個方向的值
    const n = noise.noise3D(x * scale, (y + eps) * scale, t);
    const s = noise.noise3D(x * scale, (y - eps) * scale, t);
    const e = noise.noise3D((x + eps) * scale, y * scale, t);
    const w = noise.noise3D((x - eps) * scale, y * scale, t);

    // 計算旋度 (curl)
    // curl_x = ∂ψ/∂y
    // curl_y = -∂ψ/∂x
    const curlX = (n - s) / (2 * eps);
    const curlY = -(e - w) / (2 * eps);

    return { x: curlX, y: curlY };
}

/**
 * 多重八度 Curl Noise
 */
function getMultiOctaveCurl(x, y, t) {
    let totalX = 0;
    let totalY = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxAmp = 0;

    for (let i = 0; i < 3; i++) {
        const curl = getCurlNoise(x * frequency, y * frequency, t);
        totalX += curl.x * amplitude;
        totalY += curl.y * amplitude;
        maxAmp += amplitude;

        amplitude *= 0.5;
        frequency *= 2;
    }

    return {
        x: (totalX / maxAmp) * config.speed,
        y: (totalY / maxAmp) * config.speed
    };
}

// ==================== 顏色方案 ====================

const colorModes = {
    velocity: (particle) => {
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const hue = 260 - speed * 30;
        const alpha = 0.3 + Math.min(speed * 0.1, 0.5);
        return `hsla(${hue}, 80%, 60%, ${alpha})`;
    },
    position: (particle) => {
        const hue = (particle.x / canvas.width * 120 + particle.y / canvas.height * 120) % 360;
        return `hsla(${hue}, 70%, 55%, 0.4)`;
    },
    age: (particle) => {
        const ratio = particle.age / particle.maxAge;
        const hue = 280 - ratio * 80;
        const alpha = 0.2 + (1 - ratio) * 0.5;
        return `hsla(${hue}, 75%, 60%, ${alpha})`;
    },
    smoke: (particle) => {
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const brightness = 30 + speed * 10;
        const alpha = 0.1 + Math.min(speed * 0.05, 0.3);
        return `hsla(0, 0%, ${brightness}%, ${alpha})`;
    },
    neon: (particle) => {
        const hue = (time * 0.5 + particle.x * 0.1 + particle.y * 0.1) % 360;
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const alpha = 0.3 + Math.min(speed * 0.15, 0.6);
        return `hsla(${hue}, 100%, 60%, ${alpha})`;
    }
};

// ==================== 粒子系統 ====================

class CurlParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.prevX = this.x;
        this.prevY = this.y;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.maxAge = 100 + Math.random() * 200;
    }

    update(t) {
        this.prevX = this.x;
        this.prevY = this.y;

        // 取得 Curl Noise 向量
        const curl = getMultiOctaveCurl(this.x, this.y, t);

        // 平滑過渡速度
        this.vx = this.vx * 0.9 + curl.x * 0.1;
        this.vy = this.vy * 0.9 + curl.y * 0.1;

        this.x += this.vx;
        this.y += this.vy;
        this.age++;

        // 邊界處理
        if (this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height ||
            this.age > this.maxAge) {
            this.reset();
        }
    }

    draw(ctx) {
        const colorFn = colorModes[config.colorMode];
        ctx.strokeStyle = colorFn(this);
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
        particles.push(new CurlParticle());
    }
    document.getElementById('particleDisplay').textContent = config.particleCount;
}

function clearCanvas() {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function randomize() {
    noise = new SimplexNoise();
    clearCanvas();
}

// ==================== 動畫迴圈 ====================

let lastTime = 0;
let frameCount = 0;
let fpsTime = 0;

function animate(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // FPS 計算
    frameCount++;
    fpsTime += deltaTime;
    if (fpsTime >= 1000) {
        document.getElementById('fpsDisplay').textContent = frameCount;
        frameCount = 0;
        fpsTime = 0;
    }

    // 時間演化
    time += config.evolution;

    // 淡化背景
    ctx.fillStyle = 'rgba(5, 5, 16, 0.02)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新和繪製粒子
    particles.forEach(particle => {
        particle.update(time);
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
    document.getElementById('speedValue').textContent = config.speed.toFixed(1);
});

document.getElementById('evolution').addEventListener('input', (e) => {
    config.evolution = parseFloat(e.target.value);
    document.getElementById('evolutionValue').textContent = config.evolution.toFixed(4);
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('clearBtn').addEventListener('click', clearCanvas);
document.getElementById('randomBtn').addEventListener('click', randomize);

// ==================== 啟動 ====================

resizeCanvas();
initParticles();
requestAnimationFrame(animate);
