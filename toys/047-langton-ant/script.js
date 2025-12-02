/**
 * Langton's Ant 蘭頓螞蟻
 * Web Toys #047
 *
 * 圖靈機式細胞自動機
 *
 * 技術重點：
 * - 多色蘭頓螞蟻擴展
 * - 多螞蟻模擬
 * - 湧現行為視覺化
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('antCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    ruleSet: 'RL',
    cellSize: 4,
    speed: 100,
    antCount: 1,
    colorMode: 'classic',
    paused: false
};

let grid = [];
let gridWidth, gridHeight;
let ants = [];
let step = 0;

// 方向：0=上, 1=右, 2=下, 3=左
const directions = [
    { dx: 0, dy: -1 },  // 上
    { dx: 1, dy: 0 },   // 右
    { dx: 0, dy: 1 },   // 下
    { dx: -1, dy: 0 }   // 左
];

// ==================== 顏色生成 ====================

function generateColors(numColors, mode) {
    const colors = [];

    switch (mode) {
        case 'classic':
            // 經典黑白
            colors.push('#0a0a0f');
            for (let i = 1; i < numColors; i++) {
                const t = i / (numColors - 1);
                const brightness = Math.floor(50 + t * 150);
                colors.push(`rgb(${brightness}, ${brightness}, ${brightness})`);
            }
            break;

        case 'rainbow':
            colors.push('#0a0a0f');
            for (let i = 1; i < numColors; i++) {
                const h = ((i - 1) / (numColors - 1)) * 360;
                colors.push(`hsl(${h}, 80%, 50%)`);
            }
            break;

        case 'gradient':
            colors.push('#0a0a0f');
            for (let i = 1; i < numColors; i++) {
                const t = i / (numColors - 1);
                const h = 30 + t * 180;
                colors.push(`hsl(${h}, 70%, 55%)`);
            }
            break;

        case 'neon':
            const neonPalette = ['#0a0a0f', '#ff00ff', '#00ffff', '#ffff00', '#ff6600', '#00ff00', '#ff0066', '#6600ff', '#00ff66', '#ff9900', '#0066ff', '#ff0099'];
            for (let i = 0; i < numColors; i++) {
                colors.push(neonPalette[i % neonPalette.length]);
            }
            break;
    }

    return colors;
}

// ==================== 螞蟻類 ====================

class Ant {
    constructor(x, y, direction, id) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.id = id;
    }

    move(rule) {
        // 獲取當前格子的顏色狀態
        const currentState = grid[this.y][this.x];
        const numStates = rule.length;

        // 根據規則轉向
        const turn = rule[currentState];
        if (turn === 'R') {
            this.direction = (this.direction + 1) % 4;
        } else if (turn === 'L') {
            this.direction = (this.direction + 3) % 4;
        }
        // 'N' = 不轉向, 'U' = 掉頭
        else if (turn === 'U') {
            this.direction = (this.direction + 2) % 4;
        }

        // 改變格子顏色（循環到下一個狀態）
        grid[this.y][this.x] = (currentState + 1) % numStates;

        // 向前移動
        const dir = directions[this.direction];
        this.x = (this.x + dir.dx + gridWidth) % gridWidth;
        this.y = (this.y + dir.dy + gridHeight) % gridHeight;
    }
}

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    gridWidth = Math.floor(canvas.width / config.cellSize);
    gridHeight = Math.floor(canvas.height / config.cellSize);

    // 初始化網格
    grid = [];
    for (let y = 0; y < gridHeight; y++) {
        grid[y] = new Array(gridWidth).fill(0);
    }

    // 初始化螞蟻
    ants = [];
    const centerX = Math.floor(gridWidth / 2);
    const centerY = Math.floor(gridHeight / 2);

    for (let i = 0; i < config.antCount; i++) {
        const angle = (i / config.antCount) * Math.PI * 2;
        const radius = Math.min(gridWidth, gridHeight) * 0.1;
        const x = Math.floor(centerX + Math.cos(angle) * radius * (i > 0 ? 1 : 0));
        const y = Math.floor(centerY + Math.sin(angle) * radius * (i > 0 ? 1 : 0));
        const direction = i % 4;
        ants.push(new Ant(x, y, direction, i));
    }

    step = 0;

    // 清除畫布
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateDisplay();
}

// ==================== 模擬步進 ====================

function simulate() {
    const rule = config.ruleSet.split('');

    for (const ant of ants) {
        ant.move(rule);
    }

    step++;
}

// ==================== 繪製 ====================

function draw() {
    const numStates = config.ruleSet.length;
    const colors = generateColors(numStates, config.colorMode);

    // 繪製改變的格子
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const state = grid[y][x];
            ctx.fillStyle = colors[state];
            ctx.fillRect(
                x * config.cellSize,
                y * config.cellSize,
                config.cellSize,
                config.cellSize
            );
        }
    }

    // 繪製螞蟻
    ctx.fillStyle = '#ff0000';
    for (const ant of ants) {
        ctx.fillRect(
            ant.x * config.cellSize,
            ant.y * config.cellSize,
            config.cellSize,
            config.cellSize
        );
    }
}

// ==================== 更新顯示 ====================

function updateDisplay() {
    document.getElementById('stepDisplay').textContent = step.toLocaleString();
    document.getElementById('ruleDisplay').textContent = config.ruleSet;
}

// ==================== 動畫迴圈 ====================

let lastTime = 0;
let accumulatedTime = 0;

function animate(currentTime) {
    if (!config.paused) {
        const deltaTime = currentTime - lastTime;
        accumulatedTime += deltaTime;

        const stepTime = 1000 / config.speed;
        const stepsToRun = Math.floor(accumulatedTime / stepTime);

        if (stepsToRun > 0) {
            for (let i = 0; i < stepsToRun; i++) {
                simulate();
            }
            accumulatedTime -= stepsToRun * stepTime;
            updateDisplay();
        }
    }

    lastTime = currentTime;
    draw();
    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 事件處理 ====================

window.addEventListener('resize', init);

document.getElementById('ruleSet').addEventListener('change', (e) => {
    config.ruleSet = e.target.value;
    init();
});

document.getElementById('cellSize').addEventListener('input', (e) => {
    config.cellSize = parseInt(e.target.value);
    document.getElementById('cellSizeValue').textContent = config.cellSize;
    init();
});

document.getElementById('speed').addEventListener('input', (e) => {
    config.speed = parseInt(e.target.value);
    document.getElementById('speedValue').textContent = config.speed;
});

document.getElementById('antCount').addEventListener('input', (e) => {
    config.antCount = parseInt(e.target.value);
    document.getElementById('antCountValue').textContent = config.antCount;
    init();
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

// 點擊畫布添加螞蟻
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / config.cellSize);
    const y = Math.floor((e.clientY - rect.top) / config.cellSize);

    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        ants.push(new Ant(x, y, Math.floor(Math.random() * 4), ants.length));
        config.antCount = ants.length;
        document.getElementById('antCount').value = config.antCount;
        document.getElementById('antCountValue').textContent = config.antCount;
    }
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(animate);
