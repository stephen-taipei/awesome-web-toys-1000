/**
 * Magnetic Field 磁場視覺化
 * Web Toys #022
 *
 * 模擬磁鐵周圍的磁力線，可拖曳磁極位置
 *
 * 技術重點：
 * - 向量場計算
 * - 磁力線繪製演算法
 * - 粒子沿場線運動
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('magnetCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    lineCount: 50,
    lineLength: 200,
    particleCount: 500,
    showFieldLines: true,
    showParticles: true
};

// ==================== 磁極管理 ====================

let poles = [];
let particles = [];
let draggedPole = null;
let dragOffset = { x: 0, y: 0 };

/**
 * 磁極類別
 */
class MagneticPole {
    constructor(x, y, polarity) {
        this.x = x;
        this.y = y;
        this.polarity = polarity; // 1 = N極, -1 = S極
        this.strength = 5000;
        this.radius = 25;
    }

    draw(ctx) {
        // 發光效果
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 2
        );

        if (this.polarity > 0) {
            gradient.addColorStop(0, 'rgba(255, 100, 100, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 50, 50, 0.3)');
            gradient.addColorStop(1, 'transparent');
        } else {
            gradient.addColorStop(0, 'rgba(100, 100, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(50, 50, 255, 0.3)');
            gradient.addColorStop(1, 'transparent');
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 主體
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.polarity > 0 ? '#ff4444' : '#4444ff';
        ctx.fill();

        // 標記
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.polarity > 0 ? 'N' : 'S', this.x, this.y);
    }

    containsPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return dx * dx + dy * dy < this.radius * this.radius;
    }
}

// ==================== 磁場計算 ====================

/**
 * 計算某點的磁場向量
 */
function getMagneticField(x, y) {
    let bx = 0;
    let by = 0;

    poles.forEach(pole => {
        const dx = x - pole.x;
        const dy = y - pole.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist < 5) return; // 避免除以零

        // 磁場強度反比於距離平方
        const strength = pole.strength * pole.polarity / distSq;

        bx += strength * dx / dist;
        by += strength * dy / dist;
    });

    return { x: bx, y: by };
}

/**
 * 獲取磁場強度
 */
function getFieldStrength(x, y) {
    const field = getMagneticField(x, y);
    return Math.sqrt(field.x * field.x + field.y * field.y);
}

// ==================== 場線繪製 ====================

/**
 * 從起點追蹤場線
 */
function traceFieldLine(startX, startY, direction) {
    const points = [{ x: startX, y: startY }];
    let x = startX;
    let y = startY;
    const stepSize = 3;
    const maxSteps = config.lineLength;

    for (let i = 0; i < maxSteps; i++) {
        const field = getMagneticField(x, y);
        const magnitude = Math.sqrt(field.x * field.x + field.y * field.y);

        if (magnitude < 0.01) break;

        // 正規化並移動
        const nx = field.x / magnitude * direction;
        const ny = field.y / magnitude * direction;

        x += nx * stepSize;
        y += ny * stepSize;

        // 邊界檢查
        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) break;

        // 檢查是否接近磁極
        let nearPole = false;
        for (const pole of poles) {
            const dx = x - pole.x;
            const dy = y - pole.y;
            if (dx * dx + dy * dy < pole.radius * pole.radius) {
                nearPole = true;
                break;
            }
        }
        if (nearPole) break;

        points.push({ x, y });
    }

    return points;
}

/**
 * 繪製場線
 */
function drawFieldLines() {
    if (!config.showFieldLines) return;

    // 從每個 N 極發出場線
    poles.forEach(pole => {
        if (pole.polarity > 0) {
            const lineCount = config.lineCount;
            for (let i = 0; i < lineCount; i++) {
                const angle = (i / lineCount) * Math.PI * 2;
                const startX = pole.x + Math.cos(angle) * (pole.radius + 5);
                const startY = pole.y + Math.sin(angle) * (pole.radius + 5);

                const points = traceFieldLine(startX, startY, 1);
                drawFieldLinePath(points);
            }
        }
    });
}

/**
 * 繪製單條場線路徑
 */
function drawFieldLinePath(points) {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    // 漸變顏色
    const gradient = ctx.createLinearGradient(
        points[0].x, points[0].y,
        points[points.length - 1].x, points[points.length - 1].y
    );
    gradient.addColorStop(0, 'rgba(255, 100, 100, 0.6)');
    gradient.addColorStop(0.5, 'rgba(200, 100, 200, 0.4)');
    gradient.addColorStop(1, 'rgba(100, 100, 255, 0.6)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

// ==================== 粒子系統 ====================

class FieldParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.life = Math.random() * 100 + 50;
        this.maxLife = this.life;
        this.speed = 2 + Math.random() * 2;
    }

    update() {
        const field = getMagneticField(this.x, this.y);
        const magnitude = Math.sqrt(field.x * field.x + field.y * field.y);

        if (magnitude > 0.01) {
            this.x += (field.x / magnitude) * this.speed;
            this.y += (field.y / magnitude) * this.speed;
        }

        this.life--;

        // 邊界或生命結束
        if (this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height ||
            this.life <= 0) {
            this.reset();
        }

        // 檢查是否進入磁極
        for (const pole of poles) {
            const dx = this.x - pole.x;
            const dy = this.y - pole.y;
            if (dx * dx + dy * dy < pole.radius * pole.radius) {
                this.reset();
                break;
            }
        }
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        const field = getMagneticField(this.x, this.y);
        const magnitude = Math.sqrt(field.x * field.x + field.y * field.y);

        // 顏色根據場強變化
        const hue = 300 - Math.min(magnitude * 2, 200);
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha * 0.8})`;

        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==================== 初始化 ====================

function initPoles() {
    poles = [
        new MagneticPole(canvas.width * 0.35, canvas.height * 0.5, 1),
        new MagneticPole(canvas.width * 0.65, canvas.height * 0.5, -1)
    ];
    updatePoleDisplay();
}

function initParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new FieldParticle());
    }
}

function updatePoleDisplay() {
    document.getElementById('poleDisplay').textContent = poles.length;
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

    // 清除畫布
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製場線
    drawFieldLines();

    // 更新和繪製粒子
    if (config.showParticles) {
        particles.forEach(particle => {
            particle.update();
            particle.draw(ctx);
        });
    }

    // 繪製磁極
    poles.forEach(pole => pole.draw(ctx));

    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initPoles();
    initParticles();
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

// 拖曳事件
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const pole of poles) {
        if (pole.containsPoint(x, y)) {
            draggedPole = pole;
            dragOffset.x = x - pole.x;
            dragOffset.y = y - pole.y;
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (draggedPole) {
        const rect = canvas.getBoundingClientRect();
        draggedPole.x = e.clientX - rect.left - dragOffset.x;
        draggedPole.y = e.clientY - rect.top - dragOffset.y;
    }
});

canvas.addEventListener('mouseup', () => {
    draggedPole = null;
});

canvas.addEventListener('mouseleave', () => {
    draggedPole = null;
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    for (const pole of poles) {
        if (pole.containsPoint(x, y)) {
            draggedPole = pole;
            dragOffset.x = x - pole.x;
            dragOffset.y = y - pole.y;
            break;
        }
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (draggedPole) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        draggedPole.x = touch.clientX - rect.left - dragOffset.x;
        draggedPole.y = touch.clientY - rect.top - dragOffset.y;
    }
}, { passive: false });

canvas.addEventListener('touchend', () => {
    draggedPole = null;
});

// 控制面板事件
document.getElementById('lineCount').addEventListener('input', (e) => {
    config.lineCount = parseInt(e.target.value);
    document.getElementById('lineCountValue').textContent = config.lineCount;
});

document.getElementById('lineLength').addEventListener('input', (e) => {
    config.lineLength = parseInt(e.target.value);
    document.getElementById('lineLengthValue').textContent = config.lineLength;
});

document.getElementById('particleCount').addEventListener('input', (e) => {
    config.particleCount = parseInt(e.target.value);
    document.getElementById('particleCountValue').textContent = config.particleCount;
    initParticles();
});

document.getElementById('showFieldLines').addEventListener('change', (e) => {
    config.showFieldLines = e.target.checked;
});

document.getElementById('showParticles').addEventListener('change', (e) => {
    config.showParticles = e.target.checked;
});

document.getElementById('addNorthBtn').addEventListener('click', () => {
    const x = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
    const y = canvas.height * 0.3 + Math.random() * canvas.height * 0.4;
    poles.push(new MagneticPole(x, y, 1));
    updatePoleDisplay();
});

document.getElementById('addSouthBtn').addEventListener('click', () => {
    const x = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
    const y = canvas.height * 0.3 + Math.random() * canvas.height * 0.4;
    poles.push(new MagneticPole(x, y, -1));
    updatePoleDisplay();
});

document.getElementById('clearBtn').addEventListener('click', () => {
    initPoles();
});

// ==================== 啟動 ====================

resizeCanvas();
requestAnimationFrame(animate);
