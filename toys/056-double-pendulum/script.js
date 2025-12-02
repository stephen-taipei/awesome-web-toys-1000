/**
 * Double Pendulum 雙擺
 * Web Toys #056
 *
 * 雙擺混沌系統視覺化
 *
 * 技術重點：
 * - 拉格朗日力學
 * - Runge-Kutta 積分
 * - 混沌行為展示
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('pendulumCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    pendulumCount: 3,
    length1: 150,
    length2: 150,
    mass1: 10,
    mass2: 10,
    gravity: 1.0,
    trailLength: 500,
    colorMode: 'rainbow',
    paused: false
};

let pendulums = [];
let time = 0;

// ==================== 雙擺類別 ====================

class DoublePendulum {
    constructor(angle1, angle2, hue) {
        this.angle1 = angle1;
        this.angle2 = angle2;
        this.angularVel1 = 0;
        this.angularVel2 = 0;
        this.trail = [];
        this.hue = hue;
    }

    update(dt) {
        const g = config.gravity * 9.8;
        const m1 = config.mass1;
        const m2 = config.mass2;
        const l1 = config.length1;
        const l2 = config.length2;

        // 使用 Runge-Kutta 4 積分
        const state = [this.angle1, this.angle2, this.angularVel1, this.angularVel2];
        const k1 = this.derivatives(state, g, m1, m2, l1, l2);
        const k2 = this.derivatives(this.addStates(state, k1, dt/2), g, m1, m2, l1, l2);
        const k3 = this.derivatives(this.addStates(state, k2, dt/2), g, m1, m2, l1, l2);
        const k4 = this.derivatives(this.addStates(state, k3, dt), g, m1, m2, l1, l2);

        this.angle1 += (k1[0] + 2*k2[0] + 2*k3[0] + k4[0]) * dt / 6;
        this.angle2 += (k1[1] + 2*k2[1] + 2*k3[1] + k4[1]) * dt / 6;
        this.angularVel1 += (k1[2] + 2*k2[2] + 2*k3[2] + k4[2]) * dt / 6;
        this.angularVel2 += (k1[3] + 2*k2[3] + 2*k3[3] + k4[3]) * dt / 6;

        // 記錄末端位置
        const pos = this.getPositions(canvas.width / 2, canvas.height * 0.3);
        this.trail.push({ x: pos.x2, y: pos.y2, vel: Math.abs(this.angularVel2) });

        while (this.trail.length > config.trailLength) {
            this.trail.shift();
        }
    }

    addStates(state, k, dt) {
        return [
            state[0] + k[0] * dt,
            state[1] + k[1] * dt,
            state[2] + k[2] * dt,
            state[3] + k[3] * dt
        ];
    }

    derivatives(state, g, m1, m2, l1, l2) {
        const [a1, a2, w1, w2] = state;
        const delta = a1 - a2;

        const denominator1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * delta));
        const denominator2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * delta));

        const alpha1 = (-g * (2 * m1 + m2) * Math.sin(a1)
            - m2 * g * Math.sin(a1 - 2 * a2)
            - 2 * Math.sin(delta) * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(delta)))
            / denominator1;

        const alpha2 = (2 * Math.sin(delta) * (w1 * w1 * l1 * (m1 + m2)
            + g * (m1 + m2) * Math.cos(a1)
            + w2 * w2 * l2 * m2 * Math.cos(delta)))
            / denominator2;

        return [w1, w2, alpha1, alpha2];
    }

    getPositions(pivotX, pivotY) {
        const x1 = pivotX + config.length1 * Math.sin(this.angle1);
        const y1 = pivotY + config.length1 * Math.cos(this.angle1);
        const x2 = x1 + config.length2 * Math.sin(this.angle2);
        const y2 = y1 + config.length2 * Math.cos(this.angle2);
        return { x1, y1, x2, y2 };
    }

    draw(pivotX, pivotY) {
        const pos = this.getPositions(pivotX, pivotY);

        // 繪製軌跡
        if (this.trail.length > 1) {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';

            for (let i = 1; i < this.trail.length; i++) {
                const alpha = i / this.trail.length;
                const point = this.trail[i];
                const prevPoint = this.trail[i - 1];

                let color;
                switch (config.colorMode) {
                    case 'rainbow':
                        color = `hsla(${this.hue}, 80%, 60%, ${alpha * 0.8})`;
                        break;
                    case 'velocity':
                        const velHue = 200 + point.vel * 50;
                        color = `hsla(${velHue}, 80%, 60%, ${alpha * 0.8})`;
                        break;
                    case 'gradient':
                        const gradHue = this.hue + (i / this.trail.length) * 60;
                        color = `hsla(${gradHue}, 80%, 60%, ${alpha * 0.8})`;
                        break;
                }

                ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.moveTo(prevPoint.x, prevPoint.y);
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
            }
        }

        // 繪製連桿
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(pos.x1, pos.y1);
        ctx.lineTo(pos.x2, pos.y2);
        ctx.stroke();

        // 繪製擺錘1
        const color1 = `hsl(${this.hue}, 70%, 50%)`;
        ctx.fillStyle = color1;
        ctx.beginPath();
        ctx.arc(pos.x1, pos.y1, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(pos.x1 - 4, pos.y1 - 4, 4, 0, Math.PI * 2);
        ctx.fill();

        // 繪製擺錘2
        const color2 = `hsl(${(this.hue + 30) % 360}, 70%, 50%)`;
        ctx.fillStyle = color2;
        ctx.beginPath();
        ctx.arc(pos.x2, pos.y2, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(pos.x2 - 3, pos.y2 - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // 繪製支點
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    time = 0;

    pendulums = [];

    // 創建多個雙擺，初始角度略有不同
    const baseAngle1 = Math.PI / 2;
    const baseAngle2 = Math.PI / 2;

    for (let i = 0; i < config.pendulumCount; i++) {
        const hue = (i / config.pendulumCount) * 360;
        // 每個雙擺初始角度相差極小（展示混沌敏感性）
        const offset = i * 0.001;
        pendulums.push(new DoublePendulum(
            baseAngle1 + offset,
            baseAngle2,
            hue
        ));
    }

    document.getElementById('countDisplay').textContent = config.pendulumCount;
}

// ==================== 動畫迴圈 ====================

function animate() {
    // 清除畫布
    ctx.fillStyle = 'rgba(5, 5, 8, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!config.paused) {
        const dt = 0.3;
        time += dt * 0.016;

        for (const pendulum of pendulums) {
            pendulum.update(dt);
        }
    }

    // 繪製所有雙擺
    const pivotX = canvas.width / 2;
    const pivotY = canvas.height * 0.3;

    for (const pendulum of pendulums) {
        pendulum.draw(pivotX, pivotY);
    }

    // 更新顯示
    document.getElementById('timeDisplay').textContent = time.toFixed(1);

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

document.getElementById('pendulumCount').addEventListener('input', (e) => {
    config.pendulumCount = parseInt(e.target.value);
    document.getElementById('pendulumCountValue').textContent = config.pendulumCount;
    init();
});

document.getElementById('length1').addEventListener('input', (e) => {
    config.length1 = parseInt(e.target.value);
    document.getElementById('length1Value').textContent = config.length1;
});

document.getElementById('length2').addEventListener('input', (e) => {
    config.length2 = parseInt(e.target.value);
    document.getElementById('length2Value').textContent = config.length2;
});

document.getElementById('gravity').addEventListener('input', (e) => {
    config.gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = config.gravity.toFixed(1);
});

document.getElementById('trailLength').addEventListener('input', (e) => {
    config.trailLength = parseInt(e.target.value);
    document.getElementById('trailLengthValue').textContent = config.trailLength;
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
