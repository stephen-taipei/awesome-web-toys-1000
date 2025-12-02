/**
 * Wind Map 風場地圖
 * Web Toys #023
 *
 * 粒子模擬風的流動，可調整風速風向，產生動態天氣效果
 *
 * 技術重點：
 * - 向量場插值
 * - 多種天氣型態模擬
 * - 大量粒子渲染優化
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('windCanvas');
const ctx = canvas.getContext('2d');

// ==================== Simplex Noise 實現 ====================

class SimplexNoise {
    constructor(seed = Math.random() * 10000) {
        this.p = new Uint8Array(256);
        this.perm = new Uint8Array(512);

        // 使用種子生成置換表
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

    dot(g, x, y) {
        return g[0] * x + g[1] * y;
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
        if (x0 > y0) {
            i1 = 1; j1 = 0;
        } else {
            i1 = 0; j1 = 1;
        }

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
        if (t0 < 0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
        }

        return 70 * (n0 + n1 + n2);
    }
}

// ==================== 配置參數 ====================

let config = {
    particleCount: 5000,
    windSpeed: 1.0,
    trailLength: 0.92,
    weatherPattern: 'breeze',
    colorScheme: 'wind'
};

let noise = new SimplexNoise();
let particles = [];
let time = 0;
let maxSpeed = 0;

// ==================== 天氣型態定義 ====================

const weatherPatterns = {
    calm: {
        baseSpeed: 0.5,
        turbulence: 0.3,
        noiseScale: 0.002,
        direction: 0
    },
    breeze: {
        baseSpeed: 1.5,
        turbulence: 0.5,
        noiseScale: 0.003,
        direction: Math.PI * 0.1
    },
    storm: {
        baseSpeed: 3,
        turbulence: 1.2,
        noiseScale: 0.005,
        direction: Math.PI * -0.2
    },
    typhoon: {
        baseSpeed: 4,
        turbulence: 1.5,
        noiseScale: 0.004,
        vortex: true
    },
    chaos: {
        baseSpeed: 2,
        turbulence: 2,
        noiseScale: 0.008,
        direction: 0
    }
};

// ==================== 顏色方案 ====================

const colorSchemes = {
    wind: (speed, maxSpeed) => {
        const ratio = Math.min(speed / maxSpeed, 1);
        if (ratio < 0.25) {
            return `rgba(68, 136, 255, ${0.3 + ratio * 2})`;
        } else if (ratio < 0.5) {
            return `rgba(68, 255, 170, ${0.4 + ratio})`;
        } else if (ratio < 0.75) {
            return `rgba(255, 255, 68, ${0.5 + ratio * 0.5})`;
        } else {
            return `rgba(255, 68, 68, ${0.6 + ratio * 0.4})`;
        }
    },
    thermal: (speed, maxSpeed) => {
        const ratio = Math.min(speed / maxSpeed, 1);
        const hue = 240 - ratio * 240;
        return `hsla(${hue}, 80%, 50%, ${0.3 + ratio * 0.7})`;
    },
    ice: (speed, maxSpeed) => {
        const ratio = Math.min(speed / maxSpeed, 1);
        const lightness = 70 + ratio * 20;
        return `hsla(200, 80%, ${lightness}%, ${0.3 + ratio * 0.7})`;
    },
    neon: (speed, maxSpeed) => {
        const ratio = Math.min(speed / maxSpeed, 1);
        const hue = (time * 0.5 + ratio * 120) % 360;
        return `hsla(${hue}, 100%, 60%, ${0.4 + ratio * 0.6})`;
    }
};

// ==================== 風場計算 ====================

function getWindVector(x, y) {
    const pattern = weatherPatterns[config.weatherPattern];
    const scale = pattern.noiseScale;

    let vx, vy;

    if (pattern.vortex) {
        // 颱風型態 - 螺旋渦流
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) + Math.PI / 2;

        // 螺旋力 + 噪聲擾動
        const spiralStrength = Math.max(0, 1 - dist / (canvas.width * 0.4));
        const noiseVal = noise.noise2D(x * scale + time * 0.001, y * scale);

        vx = Math.cos(angle) * spiralStrength * pattern.baseSpeed +
             Math.cos(noiseVal * Math.PI * 2) * pattern.turbulence * (1 - spiralStrength);
        vy = Math.sin(angle) * spiralStrength * pattern.baseSpeed +
             Math.sin(noiseVal * Math.PI * 2) * pattern.turbulence * (1 - spiralStrength);

        // 向中心吸引
        vx -= dx / dist * 0.3 * spiralStrength;
        vy -= dy / dist * 0.3 * spiralStrength;
    } else {
        // 一般流場
        const noiseX = noise.noise2D(x * scale, y * scale + time * 0.0005);
        const noiseY = noise.noise2D(x * scale + 100, y * scale + time * 0.0005);

        // 基礎風向 + 噪聲擾動
        vx = Math.cos(pattern.direction) * pattern.baseSpeed + noiseX * pattern.turbulence;
        vy = Math.sin(pattern.direction) * pattern.baseSpeed + noiseY * pattern.turbulence;
    }

    return { x: vx * config.windSpeed, y: vy * config.windSpeed };
}

// ==================== 粒子系統 ====================

class WindParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.prevX = this.x;
        this.prevY = this.y;
        this.age = 0;
        this.maxAge = 50 + Math.random() * 100;
    }

    update() {
        this.prevX = this.x;
        this.prevY = this.y;

        const wind = getWindVector(this.x, this.y);
        this.x += wind.x;
        this.y += wind.y;

        this.speed = Math.sqrt(wind.x * wind.x + wind.y * wind.y);
        this.age++;

        // 邊界處理 - 從另一側重新進入
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // 超齡重置
        if (this.age > this.maxAge) {
            this.reset();
        }
    }

    draw(ctx) {
        const colorFn = colorSchemes[config.colorScheme];
        ctx.strokeStyle = colorFn(this.speed, maxSpeed || 5);
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
        particles.push(new WindParticle());
    }
    document.getElementById('particleDisplay').textContent = config.particleCount;
}

function clearCanvas() {
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function randomizeWind() {
    noise = new SimplexNoise();
    clearCanvas();
}

// ==================== 動畫迴圈 ====================

function animate() {
    time++;

    // 半透明覆蓋以產生軌跡效果
    ctx.fillStyle = `rgba(26, 42, 58, ${1 - config.trailLength})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 計算最大風速
    let frameMaxSpeed = 0;

    // 更新和繪製粒子
    particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
        if (particle.speed > frameMaxSpeed) {
            frameMaxSpeed = particle.speed;
        }
    });

    // 平滑更新最大風速
    maxSpeed = maxSpeed * 0.95 + frameMaxSpeed * 0.05;
    document.getElementById('maxSpeedDisplay').textContent = maxSpeed.toFixed(1);

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

document.getElementById('windSpeed').addEventListener('input', (e) => {
    config.windSpeed = parseFloat(e.target.value);
    document.getElementById('windSpeedValue').textContent = config.windSpeed.toFixed(1);
});

document.getElementById('trailLength').addEventListener('input', (e) => {
    config.trailLength = parseFloat(e.target.value);
    document.getElementById('trailLengthValue').textContent = config.trailLength.toFixed(2);
});

document.getElementById('weatherPattern').addEventListener('change', (e) => {
    config.weatherPattern = e.target.value;
    clearCanvas();
});

document.getElementById('colorScheme').addEventListener('change', (e) => {
    config.colorScheme = e.target.value;
});

document.getElementById('randomizeBtn').addEventListener('click', randomizeWind);
document.getElementById('clearBtn').addEventListener('click', clearCanvas);

// ==================== 啟動 ====================

resizeCanvas();
initParticles();
requestAnimationFrame(animate);
