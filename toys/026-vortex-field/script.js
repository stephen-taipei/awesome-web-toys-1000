/**
 * Vortex Field 漩渦場
 * Web Toys #026
 *
 * 點擊創建順時針或逆時針漩渦，粒子被捲入螺旋運動
 *
 * 技術重點：
 * - 極座標運動
 * - 多漩渦疊加
 * - 渦旋物理模擬
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('vortexCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    particleCount: 5000,
    vortexStrength: 5,
    vortexRadius: 150,
    trailLength: 0.95,
    colorMode: 'speed'
};

// 漩渦和粒子
let vortices = [];
let particles = [];
let nextVortexDirection = 1; // 1 = 順時針, -1 = 逆時針

// ==================== 漩渦類別 ====================

class Vortex {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction; // 1 = 順時針, -1 = 逆時針
        this.strength = config.vortexStrength;
        this.radius = config.vortexRadius;
        this.hue = direction > 0 ? 200 : 320; // 藍色或粉紅色
    }

    /**
     * 計算此漩渦對某點的影響力
     */
    getForce(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5 || dist > this.radius * 2) {
            return { x: 0, y: 0 };
        }

        // 渦旋強度隨距離衰減
        const falloff = Math.max(0, 1 - dist / (this.radius * 2));
        const tangentialStrength = this.strength * falloff * falloff;

        // 向心力（吸向中心）
        const radialStrength = tangentialStrength * 0.3;

        // 計算切線方向（旋轉方向）
        const angle = Math.atan2(dy, dx);
        const tangentAngle = angle + Math.PI / 2 * this.direction;

        // 切向力 + 徑向力
        const fx = Math.cos(tangentAngle) * tangentialStrength - dx / dist * radialStrength;
        const fy = Math.sin(tangentAngle) * tangentialStrength - dy / dist * radialStrength;

        return { x: fx, y: fy };
    }

    draw(ctx) {
        // 繪製漩渦中心標記
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 0.5
        );

        const alpha = 0.3;
        gradient.addColorStop(0, `hsla(${this.hue}, 80%, 60%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${this.hue}, 70%, 50%, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 繪製旋轉指示
        ctx.save();
        ctx.translate(this.x, this.y);

        const time = Date.now() * 0.002 * this.direction;
        for (let i = 0; i < 3; i++) {
            const angle = time + i * Math.PI * 2 / 3;
            const r = 20;
            ctx.beginPath();
            ctx.arc(
                Math.cos(angle) * r,
                Math.sin(angle) * r,
                4, 0, Math.PI * 2
            );
            ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, 0.6)`;
            ctx.fill();
        }

        ctx.restore();
    }
}

// ==================== 顏色方案 ====================

const colorModes = {
    speed: (particle, vortices) => {
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const hue = 200 - Math.min(speed * 15, 150);
        return `hsla(${hue}, 80%, 55%, ${0.3 + Math.min(speed * 0.1, 0.5)})`;
    },
    direction: (particle) => {
        const angle = Math.atan2(particle.vy, particle.vx);
        const hue = ((angle + Math.PI) / (Math.PI * 2) * 360) % 360;
        return `hsla(${hue}, 70%, 55%, 0.4)`;
    },
    vortex: (particle, vortices) => {
        // 根據最近的漩渦顏色
        let minDist = Infinity;
        let nearestHue = 200;

        vortices.forEach(v => {
            const dx = particle.x - v.x;
            const dy = particle.y - v.y;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
                minDist = dist;
                nearestHue = v.hue;
            }
        });

        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        return `hsla(${nearestHue}, 75%, 55%, ${0.3 + Math.min(speed * 0.1, 0.5)})`;
    },
    galaxy: (particle) => {
        const distFromCenter = Math.sqrt(
            (particle.x - canvas.width / 2) ** 2 +
            (particle.y - canvas.height / 2) ** 2
        );
        const ratio = distFromCenter / (Math.min(canvas.width, canvas.height) / 2);
        const hue = 220 + ratio * 60;
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        return `hsla(${hue}, 60%, ${50 + speed * 5}%, ${0.3 + Math.min(speed * 0.08, 0.4)})`;
    }
};

// ==================== 粒子系統 ====================

class VortexParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.prevX = this.x;
        this.prevY = this.y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.age = 0;
        this.maxAge = 150 + Math.random() * 200;
    }

    update() {
        this.prevX = this.x;
        this.prevY = this.y;

        // 計算所有漩渦的合力
        let totalFx = 0;
        let totalFy = 0;

        vortices.forEach(vortex => {
            const force = vortex.getForce(this.x, this.y);
            totalFx += force.x;
            totalFy += force.y;
        });

        // 應用力和阻力
        this.vx = this.vx * 0.98 + totalFx * 0.05;
        this.vy = this.vy * 0.98 + totalFy * 0.05;

        // 限制最大速度
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 10) {
            this.vx = this.vx / speed * 10;
            this.vy = this.vy / speed * 10;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.age++;

        // 邊界處理
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        if (this.age > this.maxAge) {
            this.reset();
        }
    }

    draw(ctx) {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed < 0.1) return;

        const colorFn = colorModes[config.colorMode];
        ctx.strokeStyle = colorFn(this, vortices);
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
        particles.push(new VortexParticle());
    }
    document.getElementById('particleDisplay').textContent = config.particleCount;
}

function addVortex(x, y, direction) {
    vortices.push(new Vortex(x, y, direction));
    document.getElementById('vortexDisplay').textContent = vortices.length;
}

function clearVortices() {
    vortices = [];
    document.getElementById('vortexDisplay').textContent = 0;
}

function clearCanvas() {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    clearCanvas();
}

// ==================== 動畫迴圈 ====================

function animate() {
    // 淡化背景
    ctx.fillStyle = `rgba(5, 5, 8, ${1 - config.trailLength})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新和繪製粒子
    particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
    });

    // 繪製漩渦
    vortices.forEach(vortex => {
        vortex.draw(ctx);
    });

    requestAnimationFrame(animate);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addVortex(x, y, nextVortexDirection);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    addVortex(x, y, nextVortexDirection);
}, { passive: false });

// 控制面板
document.getElementById('particleCount').addEventListener('input', (e) => {
    config.particleCount = parseInt(e.target.value);
    document.getElementById('particleCountValue').textContent = config.particleCount;
    initParticles();
});

document.getElementById('vortexStrength').addEventListener('input', (e) => {
    config.vortexStrength = parseFloat(e.target.value);
    document.getElementById('vortexStrengthValue').textContent = config.vortexStrength;
    // 更新現有漩渦
    vortices.forEach(v => v.strength = config.vortexStrength);
});

document.getElementById('vortexRadius').addEventListener('input', (e) => {
    config.vortexRadius = parseInt(e.target.value);
    document.getElementById('vortexRadiusValue').textContent = config.vortexRadius;
    vortices.forEach(v => v.radius = config.vortexRadius);
});

document.getElementById('trailLength').addEventListener('input', (e) => {
    config.trailLength = parseFloat(e.target.value);
    document.getElementById('trailLengthValue').textContent = config.trailLength.toFixed(2);
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('addCWBtn').addEventListener('click', () => {
    nextVortexDirection = 1;
    const x = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
    const y = canvas.height * 0.3 + Math.random() * canvas.height * 0.4;
    addVortex(x, y, 1);
});

document.getElementById('addCCWBtn').addEventListener('click', () => {
    nextVortexDirection = -1;
    const x = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
    const y = canvas.height * 0.3 + Math.random() * canvas.height * 0.4;
    addVortex(x, y, -1);
});

document.getElementById('clearVortexBtn').addEventListener('click', clearVortices);
document.getElementById('clearCanvasBtn').addEventListener('click', clearCanvas);

// ==================== 啟動 ====================

resizeCanvas();
initParticles();
requestAnimationFrame(animate);
