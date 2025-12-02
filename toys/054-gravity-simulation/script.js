/**
 * Gravity Simulation 重力模擬
 * Web Toys #054
 *
 * N體重力模擬
 *
 * 技術重點：
 * - 牛頓萬有引力
 * - Verlet 積分
 * - 軌跡繪製
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('gravityCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    bodyCount: 50,
    gravity: 1.0,
    trailLength: 50,
    colorMode: 'mass',
    paused: false
};

let bodies = [];
let time = 0;
let isDragging = false;
let dragStart = null;
let dragEnd = null;

// ==================== 天體類別 ====================

class Body {
    constructor(x, y, vx, vy, mass) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.mass = mass;
        this.radius = Math.pow(mass, 0.33) * 2;
        this.trail = [];
        this.hue = Math.random() * 360;
    }

    update(bodies, dt) {
        // 計算所有其他天體的引力
        let ax = 0;
        let ay = 0;

        for (const other of bodies) {
            if (other === this) continue;

            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            // 軟化因子避免奇異點
            const softening = 10;
            const force = (config.gravity * other.mass) / (distSq + softening);

            ax += force * dx / dist;
            ay += force * dy / dist;
        }

        // 更新速度和位置
        this.vx += ax * dt;
        this.vy += ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // 記錄軌跡
        if (config.trailLength > 0) {
            this.trail.push({ x: this.x, y: this.y });
            while (this.trail.length > config.trailLength) {
                this.trail.shift();
            }
        }

        // 邊界處理（環繞）
        if (this.x < 0) this.x += canvas.width;
        if (this.x > canvas.width) this.x -= canvas.width;
        if (this.y < 0) this.y += canvas.height;
        if (this.y > canvas.height) this.y -= canvas.height;
    }

    draw() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

        // 決定顏色
        let color;
        switch (config.colorMode) {
            case 'mass':
                const massHue = 30 + (this.mass / 100) * 30;
                color = `hsl(${massHue}, 80%, ${50 + this.mass}%)`;
                break;
            case 'velocity':
                const velHue = 200 + speed * 20;
                color = `hsl(${velHue}, 80%, 60%)`;
                break;
            case 'rainbow':
                color = `hsl(${this.hue}, 70%, 60%)`;
                break;
        }

        // 繪製軌跡
        if (this.trail.length > 1) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                // 檢查是否跨越邊界
                const dx = Math.abs(this.trail[i].x - this.trail[i-1].x);
                const dy = Math.abs(this.trail[i].y - this.trail[i-1].y);
                if (dx > canvas.width / 2 || dy > canvas.height / 2) {
                    ctx.moveTo(this.trail[i].x, this.trail[i].y);
                } else {
                    ctx.lineTo(this.trail[i].x, this.trail[i].y);
                }
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // 繪製光暈
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 3
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // 繪製天體
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==================== 預設場景 ====================

function createPreset(preset) {
    bodies = [];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    switch (preset) {
        case 'random':
            for (let i = 0; i < config.bodyCount; i++) {
                bodies.push(new Body(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    5 + Math.random() * 20
                ));
            }
            break;

        case 'solar':
            // 太陽
            bodies.push(new Body(cx, cy, 0, 0, 200));

            // 行星
            for (let i = 0; i < 8; i++) {
                const orbitRadius = 80 + i * 50;
                const angle = Math.random() * Math.PI * 2;
                const orbitalSpeed = Math.sqrt(config.gravity * 200 / orbitRadius) * 0.8;

                bodies.push(new Body(
                    cx + Math.cos(angle) * orbitRadius,
                    cy + Math.sin(angle) * orbitRadius,
                    -Math.sin(angle) * orbitalSpeed,
                    Math.cos(angle) * orbitalSpeed,
                    5 + Math.random() * 15
                ));
            }
            break;

        case 'binary':
            // 雙星
            const binaryDist = 100;
            const binarySpeed = Math.sqrt(config.gravity * 80 / binaryDist) * 0.5;

            bodies.push(new Body(cx - binaryDist, cy, 0, binarySpeed, 80));
            bodies.push(new Body(cx + binaryDist, cy, 0, -binarySpeed, 80));

            // 行星
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 250 + Math.random() * 150;

                bodies.push(new Body(
                    cx + Math.cos(angle) * dist,
                    cy + Math.sin(angle) * dist,
                    (Math.random() - 0.5) * 1,
                    (Math.random() - 0.5) * 1,
                    3 + Math.random() * 8
                ));
            }
            break;

        case 'cluster':
            for (let i = 0; i < config.bodyCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 200;

                bodies.push(new Body(
                    cx + Math.cos(angle) * dist,
                    cy + Math.sin(angle) * dist,
                    -Math.sin(angle) * 0.5 + (Math.random() - 0.5) * 0.5,
                    Math.cos(angle) * 0.5 + (Math.random() - 0.5) * 0.5,
                    5 + Math.random() * 15
                ));
            }
            break;
    }
}

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    createPreset(document.getElementById('preset').value);
    time = 0;
    updateDisplay();
}

// ==================== 更新顯示 ====================

function updateDisplay() {
    document.getElementById('countDisplay').textContent = bodies.length;
    document.getElementById('timeDisplay').textContent = Math.floor(time);
}

// ==================== 繪製星空背景 ====================

function drawStars() {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
        const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 789.012) * 0.5 + 0.5) * canvas.height;
        const size = Math.random() * 1.5;
        ctx.globalAlpha = 0.3 + Math.random() * 0.4;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// ==================== 動畫迴圈 ====================

function animate() {
    if (!config.paused) {
        // 清除畫布
        ctx.fillStyle = '#000008';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 繪製星空
        drawStars();

        // 更新並繪製天體
        const dt = 0.5;
        for (const body of bodies) {
            body.update(bodies, dt);
        }

        for (const body of bodies) {
            body.draw();
        }

        time += dt;
        updateDisplay();
    }

    // 繪製拖曳線
    if (isDragging && dragStart && dragEnd) {
        ctx.strokeStyle = '#ffc864';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragEnd.x, dragEnd.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // 預覽天體
        ctx.fillStyle = 'rgba(255, 200, 100, 0.5)';
        ctx.beginPath();
        ctx.arc(dragStart.x, dragStart.y, 10, 0, Math.PI * 2);
        ctx.fill();
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

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    dragEnd = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        dragEnd = { x: e.clientX, y: e.clientY };
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (isDragging && dragStart) {
        const vx = (dragStart.x - e.clientX) * 0.05;
        const vy = (dragStart.y - e.clientY) * 0.05;

        bodies.push(new Body(dragStart.x, dragStart.y, vx, vy, 15));
        updateDisplay();
    }
    isDragging = false;
    dragStart = null;
    dragEnd = null;
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    isDragging = true;
    dragStart = { x: touch.clientX, y: touch.clientY };
    dragEnd = { x: touch.clientX, y: touch.clientY };
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDragging) {
        const touch = e.touches[0];
        dragEnd = { x: touch.clientX, y: touch.clientY };
    }
});

canvas.addEventListener('touchend', (e) => {
    if (isDragging && dragStart && dragEnd) {
        const vx = (dragStart.x - dragEnd.x) * 0.05;
        const vy = (dragStart.y - dragEnd.y) * 0.05;

        bodies.push(new Body(dragStart.x, dragStart.y, vx, vy, 15));
        updateDisplay();
    }
    isDragging = false;
    dragStart = null;
    dragEnd = null;
});

document.getElementById('bodyCount').addEventListener('input', (e) => {
    config.bodyCount = parseInt(e.target.value);
    document.getElementById('bodyCountValue').textContent = config.bodyCount;
});

document.getElementById('gravity').addEventListener('input', (e) => {
    config.gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = config.gravity.toFixed(1);
});

document.getElementById('trailLength').addEventListener('input', (e) => {
    config.trailLength = parseInt(e.target.value);
    document.getElementById('trailLengthValue').textContent = config.trailLength;
});

document.getElementById('preset').addEventListener('change', (e) => {
    createPreset(e.target.value);
    updateDisplay();
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
