/**
 * Cloth Simulation 布料模擬
 * Web Toys #058
 *
 * 布料物理模擬
 *
 * 技術重點：
 * - 質點彈簧系統
 * - 約束滿足
 * - 可撕裂布料
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('clothCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    resolution: 25,
    stiffness: 0.5,
    gravity: 0.5,
    wind: 0,
    tearable: true,
    renderMode: 'mesh',
    paused: false
};

let points = [];
let constraints = [];
let draggedPoint = null;
let mouseX = 0;
let mouseY = 0;

// ==================== 點類別 ====================

class Point {
    constructor(x, y, pinned = false) {
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.pinned = pinned;
    }

    update() {
        if (this.pinned) return;

        const vx = (this.x - this.oldX) * 0.99;
        const vy = (this.y - this.oldY) * 0.99;

        this.oldX = this.x;
        this.oldY = this.y;

        // 風力
        const windForce = config.wind * (Math.sin(Date.now() * 0.002) * 0.5 + 0.5);

        this.x += vx + windForce;
        this.y += vy + config.gravity;

        // 邊界
        if (this.y > canvas.height - 5) {
            this.y = canvas.height - 5;
            this.oldY = this.y + vy * 0.5;
        }
        if (this.x < 5) {
            this.x = 5;
        }
        if (this.x > canvas.width - 5) {
            this.x = canvas.width - 5;
        }
    }
}

// ==================== 約束類別 ====================

class Constraint {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        this.length = Math.sqrt(dx * dx + dy * dy);
        this.active = true;
    }

    solve() {
        if (!this.active) return;

        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) return;

        // 撕裂檢測
        if (config.tearable && dist > this.length * 2) {
            this.active = false;
            return;
        }

        const diff = (dist - this.length) / dist * config.stiffness;
        const offsetX = dx * diff * 0.5;
        const offsetY = dy * diff * 0.5;

        if (!this.p1.pinned) {
            this.p1.x += offsetX;
            this.p1.y += offsetY;
        }
        if (!this.p2.pinned) {
            this.p2.x -= offsetX;
            this.p2.y -= offsetY;
        }
    }

    draw() {
        if (!this.active) return;

        const dist = Math.sqrt(
            Math.pow(this.p2.x - this.p1.x, 2) +
            Math.pow(this.p2.y - this.p1.y, 2)
        );
        const strain = dist / this.length;

        // 根據應變著色
        let hue = 280; // 紫色基調
        if (strain > 1.5) {
            hue = 0; // 紅色警告
        } else if (strain > 1.2) {
            hue = 30; // 橙色
        }

        ctx.strokeStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
    }
}

// ==================== 初始化 ====================

function init() {
    resizeCanvas();

    points = [];
    constraints = [];

    const clothWidth = Math.min(canvas.width - 200, 600);
    const clothHeight = clothWidth * 0.8;
    const spacing = clothWidth / (config.resolution - 1);

    const startX = (canvas.width - clothWidth) / 2;
    const startY = 50;

    // 創建點網格
    for (let y = 0; y < config.resolution; y++) {
        for (let x = 0; x < config.resolution; x++) {
            const pinned = y === 0 && (x % 4 === 0 || x === config.resolution - 1);
            points.push(new Point(
                startX + x * spacing,
                startY + y * spacing,
                pinned
            ));
        }
    }

    // 創建約束
    for (let y = 0; y < config.resolution; y++) {
        for (let x = 0; x < config.resolution; x++) {
            const index = y * config.resolution + x;

            // 水平約束
            if (x < config.resolution - 1) {
                constraints.push(new Constraint(
                    points[index],
                    points[index + 1]
                ));
            }

            // 垂直約束
            if (y < config.resolution - 1) {
                constraints.push(new Constraint(
                    points[index],
                    points[index + config.resolution]
                ));
            }
        }
    }

    updateDisplay();
}

// ==================== 更新顯示 ====================

function updateDisplay() {
    document.getElementById('nodeDisplay').textContent = points.length;
    document.getElementById('linkDisplay').textContent = constraints.filter(c => c.active).length;
}

// ==================== 繪製 ====================

function draw() {
    // 清除畫布
    ctx.fillStyle = '#0a0810';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (config.renderMode) {
        case 'mesh':
            // 繪製約束線
            for (const constraint of constraints) {
                constraint.draw();
            }
            break;

        case 'solid':
            // 繪製填充三角形
            ctx.fillStyle = 'rgba(200, 100, 255, 0.3)';
            ctx.strokeStyle = 'rgba(200, 100, 255, 0.5)';
            ctx.lineWidth = 1;

            for (let y = 0; y < config.resolution - 1; y++) {
                for (let x = 0; x < config.resolution - 1; x++) {
                    const i = y * config.resolution + x;
                    const p1 = points[i];
                    const p2 = points[i + 1];
                    const p3 = points[i + config.resolution];
                    const p4 = points[i + config.resolution + 1];

                    // 檢查約束是否仍然存在
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineTo(p4.x, p4.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            }
            break;

        case 'points':
            // 只繪製點
            ctx.fillStyle = '#c864ff';
            for (const point of points) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
    }

    // 繪製固定點
    ctx.fillStyle = '#ff6464';
    for (const point of points) {
        if (point.pinned) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// ==================== 動畫迴圈 ====================

function animate() {
    if (!config.paused) {
        // 更新點
        for (const point of points) {
            point.update();
        }

        // 多次迭代約束
        for (let i = 0; i < 5; i++) {
            for (const constraint of constraints) {
                constraint.solve();
            }
        }

        // 更新拖曳的點
        if (draggedPoint) {
            draggedPoint.x = mouseX;
            draggedPoint.y = mouseY;
        }
    }

    draw();
    updateDisplay();

    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 滑鼠互動 ====================

function getPointAt(x, y) {
    for (const point of points) {
        const dx = point.x - x;
        const dy = point.y - y;
        if (dx * dx + dy * dy < 400) {
            return point;
        }
    }
    return null;
}

function tearAt(x, y) {
    for (const constraint of constraints) {
        if (!constraint.active) continue;

        const midX = (constraint.p1.x + constraint.p2.x) / 2;
        const midY = (constraint.p1.y + constraint.p2.y) / 2;

        const dx = midX - x;
        const dy = midY - y;

        if (dx * dx + dy * dy < 400) {
            constraint.active = false;
        }
    }
}

canvas.addEventListener('mousedown', (e) => {
    if (e.shiftKey) {
        tearAt(e.clientX, e.clientY);
    } else {
        draggedPoint = getPointAt(e.clientX, e.clientY);
    }
    mouseX = e.clientX;
    mouseY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (e.buttons === 1 && e.shiftKey) {
        tearAt(e.clientX, e.clientY);
    }
});

canvas.addEventListener('mouseup', () => {
    draggedPoint = null;
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    draggedPoint = getPointAt(touch.clientX, touch.clientY);
    mouseX = touch.clientX;
    mouseY = touch.clientY;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
});

canvas.addEventListener('touchend', () => {
    draggedPoint = null;
});

// ==================== 事件處理 ====================

window.addEventListener('resize', init);

document.getElementById('resolution').addEventListener('input', (e) => {
    config.resolution = parseInt(e.target.value);
    document.getElementById('resolutionValue').textContent = config.resolution;
    init();
});

document.getElementById('stiffness').addEventListener('input', (e) => {
    config.stiffness = parseFloat(e.target.value);
    document.getElementById('stiffnessValue').textContent = config.stiffness.toFixed(1);
});

document.getElementById('gravity').addEventListener('input', (e) => {
    config.gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = config.gravity.toFixed(1);
});

document.getElementById('wind').addEventListener('input', (e) => {
    config.wind = parseFloat(e.target.value);
    document.getElementById('windValue').textContent = config.wind.toFixed(1);
});

document.getElementById('tearable').addEventListener('change', (e) => {
    config.tearable = e.target.checked;
});

document.getElementById('renderMode').addEventListener('change', (e) => {
    config.renderMode = e.target.value;
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
