/**
 * Ant Colony 螞蟻群落
 * Web Toys #052
 *
 * 螞蟻覓食行為模擬
 *
 * 技術重點：
 * - 費洛蒙軌跡系統
 * - 隨機漫步與跟蹤
 * - 食物收集機制
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('antCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    antCount: 100,
    foodCount: 5,
    pheromoneStrength: 1.0,
    evaporationRate: 0.02,
    showPheromones: 'both',
    paused: false
};

let ants = [];
let foods = [];
let nest = { x: 0, y: 0, radius: 30 };
let foodCollected = 0;

// 費洛蒙網格
let foodPheromone = [];
let homePheromone = [];
let gridSize = 5;
let gridWidth, gridHeight;

// ==================== 螞蟻類別 ====================

class Ant {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 2;
        this.hasFood = false;
        this.wanderStrength = 0.3;
    }

    update() {
        // 感測費洛蒙
        const pheromoneToFollow = this.hasFood ? homePheromone : foodPheromone;
        const sensedAngle = this.sensePheromone(pheromoneToFollow);

        if (sensedAngle !== null) {
            // 跟隨費洛蒙
            const angleDiff = sensedAngle - this.angle;
            this.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 0.3);
        } else {
            // 隨機漫步
            this.angle += (Math.random() - 0.5) * this.wanderStrength;
        }

        // 移動
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // 邊界處理
        const margin = 20;
        if (this.x < margin || this.x > canvas.width - margin ||
            this.y < margin || this.y > canvas.height - margin) {
            this.angle += Math.PI + (Math.random() - 0.5);
            this.x = Math.max(margin, Math.min(canvas.width - margin, this.x));
            this.y = Math.max(margin, Math.min(canvas.height - margin, this.y));
        }

        // 留下費洛蒙
        const gx = Math.floor(this.x / gridSize);
        const gy = Math.floor(this.y / gridSize);
        if (gx >= 0 && gx < gridWidth && gy >= 0 && gy < gridHeight) {
            const idx = gy * gridWidth + gx;
            if (this.hasFood) {
                foodPheromone[idx] = Math.min(1, foodPheromone[idx] + 0.1 * config.pheromoneStrength);
            } else {
                homePheromone[idx] = Math.min(1, homePheromone[idx] + 0.05 * config.pheromoneStrength);
            }
        }

        // 檢查食物
        if (!this.hasFood) {
            for (const food of foods) {
                if (food.amount > 0) {
                    const dx = food.x - this.x;
                    const dy = food.y - this.y;
                    if (dx * dx + dy * dy < food.radius * food.radius) {
                        this.hasFood = true;
                        food.amount--;
                        this.angle += Math.PI; // 轉向
                        break;
                    }
                }
            }
        }

        // 檢查巢穴
        if (this.hasFood) {
            const dx = nest.x - this.x;
            const dy = nest.y - this.y;
            if (dx * dx + dy * dy < nest.radius * nest.radius) {
                this.hasFood = false;
                foodCollected++;
                this.angle += Math.PI; // 轉向
                document.getElementById('foodDisplay').textContent = foodCollected;
            }
        }
    }

    sensePheromone(pheromoneGrid) {
        let maxValue = 0.1; // 最小閾值
        let bestAngle = null;

        // 檢查三個方向
        const sensorAngles = [-0.5, 0, 0.5];
        const sensorDistance = 15;

        for (const offset of sensorAngles) {
            const senseAngle = this.angle + offset;
            const sx = this.x + Math.cos(senseAngle) * sensorDistance;
            const sy = this.y + Math.sin(senseAngle) * sensorDistance;

            const gx = Math.floor(sx / gridSize);
            const gy = Math.floor(sy / gridSize);

            if (gx >= 0 && gx < gridWidth && gy >= 0 && gy < gridHeight) {
                const value = pheromoneGrid[gy * gridWidth + gx];
                if (value > maxValue) {
                    maxValue = value;
                    bestAngle = senseAngle;
                }
            }
        }

        return bestAngle;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // 身體
        ctx.fillStyle = this.hasFood ? '#64c864' : '#2a2015';
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 頭
        ctx.beginPath();
        ctx.arc(4, 0, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ==================== 食物類別 ====================

class Food {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.amount = 50;
        this.maxAmount = 50;
        this.radius = 25;
    }

    draw() {
        if (this.amount <= 0) return;

        const ratio = this.amount / this.maxAmount;
        const currentRadius = this.radius * Math.sqrt(ratio);

        // 食物
        ctx.fillStyle = '#4a9648';
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.fillStyle = 'rgba(150, 255, 150, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x - currentRadius * 0.3, this.y - currentRadius * 0.3, currentRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==================== 初始化 ====================

function init() {
    resizeCanvas();

    gridWidth = Math.ceil(canvas.width / gridSize);
    gridHeight = Math.ceil(canvas.height / gridSize);

    // 初始化費洛蒙網格
    foodPheromone = new Float32Array(gridWidth * gridHeight);
    homePheromone = new Float32Array(gridWidth * gridHeight);

    // 設置巢穴位置
    nest.x = canvas.width / 2;
    nest.y = canvas.height / 2;

    // 創建螞蟻
    ants = [];
    for (let i = 0; i < config.antCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * nest.radius;
        ants.push(new Ant(
            nest.x + Math.cos(angle) * r,
            nest.y + Math.sin(angle) * r
        ));
    }

    // 創建食物
    createFoods();

    foodCollected = 0;
    document.getElementById('countDisplay').textContent = config.antCount;
    document.getElementById('foodDisplay').textContent = foodCollected;
}

function createFoods() {
    foods = [];
    for (let i = 0; i < config.foodCount; i++) {
        let x, y;
        do {
            x = 100 + Math.random() * (canvas.width - 200);
            y = 100 + Math.random() * (canvas.height - 200);
        } while (Math.hypot(x - nest.x, y - nest.y) < 150);

        foods.push(new Food(x, y));
    }
}

// ==================== 費洛蒙蒸發 ====================

function evaporatePheromones() {
    for (let i = 0; i < foodPheromone.length; i++) {
        foodPheromone[i] *= (1 - config.evaporationRate);
        homePheromone[i] *= (1 - config.evaporationRate);
    }
}

// ==================== 繪製費洛蒙 ====================

function drawPheromones() {
    const showFood = config.showPheromones === 'both' || config.showPheromones === 'food';
    const showHome = config.showPheromones === 'both' || config.showPheromones === 'home';

    for (let gy = 0; gy < gridHeight; gy++) {
        for (let gx = 0; gx < gridWidth; gx++) {
            const idx = gy * gridWidth + gx;
            const foodVal = showFood ? foodPheromone[idx] : 0;
            const homeVal = showHome ? homePheromone[idx] : 0;

            if (foodVal > 0.01 || homeVal > 0.01) {
                const r = Math.floor(homeVal * 100);
                const g = Math.floor(foodVal * 200);
                const b = Math.floor(foodVal * 100);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
                ctx.fillRect(gx * gridSize, gy * gridSize, gridSize, gridSize);
            }
        }
    }
}

// ==================== 繪製巢穴 ====================

function drawNest() {
    // 巢穴陰影
    ctx.fillStyle = 'rgba(100, 70, 40, 0.5)';
    ctx.beginPath();
    ctx.arc(nest.x, nest.y, nest.radius + 5, 0, Math.PI * 2);
    ctx.fill();

    // 巢穴
    ctx.fillStyle = '#5a3a20';
    ctx.beginPath();
    ctx.arc(nest.x, nest.y, nest.radius, 0, Math.PI * 2);
    ctx.fill();

    // 入口
    ctx.fillStyle = '#3a2010';
    ctx.beginPath();
    ctx.arc(nest.x, nest.y, nest.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
}

// ==================== 動畫迴圈 ====================

function animate() {
    if (!config.paused) {
        // 清除畫布
        ctx.fillStyle = '#d4c4a8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 添加沙土紋理
        ctx.fillStyle = 'rgba(180, 160, 130, 0.3)';
        for (let i = 0; i < 100; i++) {
            const x = (Math.sin(i * 234.567) * 0.5 + 0.5) * canvas.width;
            const y = (Math.cos(i * 345.678) * 0.5 + 0.5) * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // 蒸發費洛蒙
        evaporatePheromones();

        // 繪製費洛蒙
        drawPheromones();

        // 繪製食物
        for (const food of foods) {
            food.draw();
        }

        // 繪製巢穴
        drawNest();

        // 更新並繪製螞蟻
        for (const ant of ants) {
            ant.update();
            ant.draw();
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

window.addEventListener('resize', init);

document.getElementById('antCount').addEventListener('input', (e) => {
    config.antCount = parseInt(e.target.value);
    document.getElementById('antCountValue').textContent = config.antCount;
    init();
});

document.getElementById('foodCount').addEventListener('input', (e) => {
    config.foodCount = parseInt(e.target.value);
    document.getElementById('foodCountValue').textContent = config.foodCount;
    createFoods();
});

document.getElementById('pheromoneStrength').addEventListener('input', (e) => {
    config.pheromoneStrength = parseFloat(e.target.value);
    document.getElementById('pheromoneStrengthValue').textContent = config.pheromoneStrength.toFixed(1);
});

document.getElementById('evaporationRate').addEventListener('input', (e) => {
    config.evaporationRate = parseFloat(e.target.value);
    document.getElementById('evaporationRateValue').textContent = config.evaporationRate.toFixed(3);
});

document.getElementById('showPheromones').addEventListener('change', (e) => {
    config.showPheromones = e.target.value;
});

document.getElementById('resetBtn').addEventListener('click', init);

document.getElementById('pauseBtn').addEventListener('click', () => {
    config.paused = !config.paused;
    const btn = document.getElementById('pauseBtn');
    btn.textContent = config.paused ? '繼續' : '暫停';
    btn.classList.toggle('paused', config.paused);
});

// 點擊放置食物
canvas.addEventListener('click', (e) => {
    foods.push(new Food(e.clientX, e.clientY));
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(animate);
