/**
 * Flocking 鳥群飛行
 * Web Toys #049
 *
 * 帶有掠食者的鳥群模擬
 *
 * 技術重點：
 * - 掠食者-獵物互動
 * - 環境因素（風）
 * - 時間光影變化
 * - 軌跡繪製
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('flockCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    birdCount: 150,
    predatorCount: 1,
    windStrength: 0,
    fearRadius: 100,
    trailLength: 0,
    timeOfDay: 'day',
    paused: false
};

let birds = [];
let predators = [];
let windAngle = 0;

// 背景顏色
const backgrounds = {
    day: { top: '#87CEEB', bottom: '#E0F4FF' },
    sunset: { top: '#FF6B35', bottom: '#FFB347' },
    night: { top: '#0a0a1a', bottom: '#1a2a3a' }
};

// ==================== 鳥類別 ====================

class Bird {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.trail = [];
        this.maxSpeed = 3 + Math.random();
        this.size = 3 + Math.random() * 2;
    }

    update(birds, predators) {
        // 分離
        let sepX = 0, sepY = 0, sepCount = 0;
        // 對齊
        let aliX = 0, aliY = 0, aliCount = 0;
        // 凝聚
        let cohX = 0, cohY = 0, cohCount = 0;
        // 逃避掠食者
        let fleeX = 0, fleeY = 0;

        const visualRange = 50;
        const separationDist = 20;

        for (const other of birds) {
            if (other === this) continue;
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const d = Math.sqrt(dx * dx + dy * dy);

            if (d < separationDist) {
                sepX -= dx / d;
                sepY -= dy / d;
                sepCount++;
            }

            if (d < visualRange) {
                aliX += other.vx;
                aliY += other.vy;
                aliCount++;

                cohX += other.x;
                cohY += other.y;
                cohCount++;
            }
        }

        // 逃避掠食者
        for (const pred of predators) {
            const dx = pred.x - this.x;
            const dy = pred.y - this.y;
            const d = Math.sqrt(dx * dx + dy * dy);

            if (d < config.fearRadius) {
                const strength = (config.fearRadius - d) / config.fearRadius;
                fleeX -= (dx / d) * strength * 2;
                fleeY -= (dy / d) * strength * 2;
            }
        }

        // 應用力
        if (sepCount > 0) {
            this.vx += sepX * 0.05;
            this.vy += sepY * 0.05;
        }

        if (aliCount > 0) {
            aliX /= aliCount;
            aliY /= aliCount;
            this.vx += (aliX - this.vx) * 0.05;
            this.vy += (aliY - this.vy) * 0.05;
        }

        if (cohCount > 0) {
            cohX /= cohCount;
            cohY /= cohCount;
            this.vx += (cohX - this.x) * 0.001;
            this.vy += (cohY - this.y) * 0.001;
        }

        // 逃避力
        this.vx += fleeX * 0.3;
        this.vy += fleeY * 0.3;

        // 風力
        if (config.windStrength > 0) {
            this.vx += Math.cos(windAngle) * config.windStrength * 0.1;
            this.vy += Math.sin(windAngle) * config.windStrength * 0.1;
        }

        // 限制速度
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        // 更新位置
        this.x += this.vx;
        this.y += this.vy;

        // 邊界
        const margin = 50;
        if (this.x < margin) this.vx += 0.5;
        if (this.x > canvas.width - margin) this.vx -= 0.5;
        if (this.y < margin) this.vy += 0.5;
        if (this.y > canvas.height - margin) this.vy -= 0.5;

        // 軌跡
        if (config.trailLength > 0) {
            this.trail.push({ x: this.x, y: this.y });
            while (this.trail.length > config.trailLength) {
                this.trail.shift();
            }
        } else {
            this.trail = [];
        }
    }

    draw() {
        const angle = Math.atan2(this.vy, this.vx);

        // 繪製軌跡
        if (this.trail.length > 1) {
            ctx.strokeStyle = 'rgba(150, 200, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }

        // 根據時間選擇顏色
        let color;
        switch (config.timeOfDay) {
            case 'day':
                color = '#2a2a2a';
                break;
            case 'sunset':
                color = '#1a1a1a';
                break;
            case 'night':
                color = '#aaccff';
                break;
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        // 繪製鳥
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.size * 2, 0);
        ctx.lineTo(-this.size, this.size);
        ctx.lineTo(-this.size * 0.5, 0);
        ctx.lineTo(-this.size, -this.size);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

// ==================== 掠食者類別 ====================

class Predator {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.maxSpeed = 4;
        this.target = null;
    }

    update(birds) {
        // 找最近的鳥作為目標
        let minDist = Infinity;
        for (const bird of birds) {
            const dx = bird.x - this.x;
            const dy = bird.y - this.y;
            const d = dx * dx + dy * dy;
            if (d < minDist) {
                minDist = d;
                this.target = bird;
            }
        }

        // 追逐目標
        if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const d = Math.sqrt(dx * dx + dy * dy);

            this.vx += (dx / d) * 0.1;
            this.vy += (dy / d) * 0.1;
        }

        // 限制速度
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        // 更新位置
        this.x += this.vx;
        this.y += this.vy;

        // 邊界
        const margin = 100;
        if (this.x < margin) this.vx += 0.3;
        if (this.x > canvas.width - margin) this.vx -= 0.3;
        if (this.y < margin) this.vy += 0.3;
        if (this.y > canvas.height - margin) this.vy -= 0.3;
    }

    draw() {
        const angle = Math.atan2(this.vy, this.vx);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        // 繪製掠食者（較大，紅色）
        ctx.fillStyle = config.timeOfDay === 'night' ? '#ff6666' : '#cc0000';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-8, 8);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-8, -8);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // 繪製恐懼範圍
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, config.fearRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// ==================== 初始化 ====================

function init() {
    resizeCanvas();

    birds = [];
    for (let i = 0; i < config.birdCount; i++) {
        birds.push(new Bird(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }

    predators = [];
    for (let i = 0; i < config.predatorCount; i++) {
        predators.push(new Predator(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }

    updateDisplay();
}

// ==================== 繪製背景 ====================

function drawBackground() {
    const bg = backgrounds[config.timeOfDay];
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, bg.top);
    gradient.addColorStop(1, bg.bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 夜晚星星
    if (config.timeOfDay === 'night') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 50; i++) {
            const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * canvas.width;
            const y = (Math.cos(i * 789.012) * 0.5 + 0.5) * canvas.height * 0.7;
            const size = Math.random() * 2;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 黃昏太陽
    if (config.timeOfDay === 'sunset') {
        const sunGradient = ctx.createRadialGradient(
            canvas.width * 0.8, canvas.height * 0.3, 0,
            canvas.width * 0.8, canvas.height * 0.3, 80
        );
        sunGradient.addColorStop(0, 'rgba(255, 200, 100, 0.8)');
        sunGradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
        ctx.fillStyle = sunGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// ==================== 更新顯示 ====================

function updateDisplay() {
    document.getElementById('countDisplay').textContent = config.birdCount;
    document.getElementById('predatorDisplay').textContent = config.predatorCount;
}

// ==================== 動畫迴圈 ====================

function animate() {
    if (!config.paused) {
        // 更新風向
        windAngle += 0.01;

        // 繪製背景
        drawBackground();

        // 更新並繪製鳥群
        for (const bird of birds) {
            bird.update(birds, predators);
            bird.draw();
        }

        // 更新並繪製掠食者
        for (const pred of predators) {
            pred.update(birds);
            pred.draw();
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

document.getElementById('birdCount').addEventListener('input', (e) => {
    config.birdCount = parseInt(e.target.value);
    document.getElementById('birdCountValue').textContent = config.birdCount;
    init();
});

document.getElementById('predatorCount').addEventListener('input', (e) => {
    config.predatorCount = parseInt(e.target.value);
    document.getElementById('predatorCountValue').textContent = config.predatorCount;
    init();
});

document.getElementById('windStrength').addEventListener('input', (e) => {
    config.windStrength = parseFloat(e.target.value);
    document.getElementById('windStrengthValue').textContent = config.windStrength.toFixed(1);
});

document.getElementById('fearRadius').addEventListener('input', (e) => {
    config.fearRadius = parseInt(e.target.value);
    document.getElementById('fearRadiusValue').textContent = config.fearRadius;
});

document.getElementById('trailLength').addEventListener('input', (e) => {
    config.trailLength = parseInt(e.target.value);
    document.getElementById('trailLengthValue').textContent = config.trailLength;
});

document.getElementById('timeOfDay').addEventListener('change', (e) => {
    config.timeOfDay = e.target.value;
});

document.getElementById('resetBtn').addEventListener('click', init);

document.getElementById('pauseBtn').addEventListener('click', () => {
    config.paused = !config.paused;
    const btn = document.getElementById('pauseBtn');
    btn.textContent = config.paused ? '繼續' : '暫停';
    btn.classList.toggle('paused', config.paused);
});

// 點擊添加掠食者
canvas.addEventListener('click', (e) => {
    predators.push(new Predator(e.clientX, e.clientY));
    config.predatorCount = predators.length;
    document.getElementById('predatorCount').value = config.predatorCount;
    document.getElementById('predatorCountValue').textContent = config.predatorCount;
    updateDisplay();
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(animate);
