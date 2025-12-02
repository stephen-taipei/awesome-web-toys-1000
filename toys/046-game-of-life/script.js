/**
 * Game of Life 生命遊戲
 * Web Toys #046
 *
 * 康威生命遊戲視覺化
 *
 * 技術重點：
 * - 二維細胞自動機
 * - 經典生命遊戲規則
 * - 預設圖案
 * - 互動繪製
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('lifeCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    cellSize: 8,
    speed: 10,
    colorMode: 'classic',
    paused: false
};

let grid = [];
let gridWidth, gridHeight;
let generation = 0;
let lastTime = 0;
let isDrawing = false;

// ==================== 預設圖案 ====================

const patterns = {
    glider: [
        [0, 1, 0],
        [0, 0, 1],
        [1, 1, 1]
    ],
    lwss: [
        [0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0]
    ],
    pulsar: [
        [0,0,1,1,1,0,0,0,1,1,1,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,1,0,1,0,0,0,0,1],
        [1,0,0,0,0,1,0,1,0,0,0,0,1],
        [1,0,0,0,0,1,0,1,0,0,0,0,1],
        [0,0,1,1,1,0,0,0,1,1,1,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,1,1,0,0,0,1,1,1,0,0],
        [1,0,0,0,0,1,0,1,0,0,0,0,1],
        [1,0,0,0,0,1,0,1,0,0,0,0,1],
        [1,0,0,0,0,1,0,1,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,1,1,0,0,0,1,1,1,0,0]
    ],
    pentadecathlon: [
        [0,0,1,0,0,0,0,1,0,0],
        [1,1,0,1,1,1,1,0,1,1],
        [0,0,1,0,0,0,0,1,0,0]
    ],
    gosperGun: [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
        [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ]
};

// ==================== 顏色模式 ====================

const colorModes = {
    classic: (age) => '#64c8ff',
    age: (age) => {
        const h = 200 - Math.min(age, 50) * 3;
        const l = 50 + Math.min(age, 20) * 1;
        return `hsl(${h}, 80%, ${l}%)`;
    },
    rainbow: (age) => {
        const h = (age * 15) % 360;
        return `hsl(${h}, 80%, 55%)`;
    },
    neon: (age) => {
        const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff00aa', '#00ffaa'];
        return colors[age % colors.length];
    }
};

// ==================== 初始化網格 ====================

function initGrid() {
    resizeCanvas();
    gridWidth = Math.floor(canvas.width / config.cellSize);
    gridHeight = Math.floor(canvas.height / config.cellSize);

    // 創建空網格，存儲細胞年齡（0 = 死亡，>0 = 存活代數）
    grid = [];
    for (let y = 0; y < gridHeight; y++) {
        grid[y] = new Array(gridWidth).fill(0);
    }

    generation = 0;
}

// ==================== 放置圖案 ====================

function placePattern(pattern, offsetX, offsetY) {
    const patternHeight = pattern.length;
    const patternWidth = pattern[0].length;

    for (let y = 0; y < patternHeight; y++) {
        for (let x = 0; x < patternWidth; x++) {
            const gridX = offsetX + x;
            const gridY = offsetY + y;
            if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
                grid[gridY][gridX] = pattern[y][x] ? 1 : 0;
            }
        }
    }
}

// ==================== 初始化 ====================

function init(preset = 'random') {
    initGrid();

    if (preset === 'random') {
        // 隨機填充
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                grid[y][x] = Math.random() > 0.7 ? 1 : 0;
            }
        }
    } else if (patterns[preset]) {
        // 放置預設圖案在中央
        const pattern = patterns[preset];
        const offsetX = Math.floor((gridWidth - pattern[0].length) / 2);
        const offsetY = Math.floor((gridHeight - pattern.length) / 2);
        placePattern(pattern, offsetX, offsetY);
    }

    updateDisplay();
}

// ==================== 計算下一代 ====================

function nextGeneration() {
    const newGrid = [];

    for (let y = 0; y < gridHeight; y++) {
        newGrid[y] = new Array(gridWidth).fill(0);
        for (let x = 0; x < gridWidth; x++) {
            const neighbors = countNeighbors(x, y);
            const alive = grid[y][x] > 0;

            if (alive) {
                // 存活規則：2或3個鄰居則存活
                if (neighbors === 2 || neighbors === 3) {
                    newGrid[y][x] = grid[y][x] + 1; // 增加年齡
                } else {
                    newGrid[y][x] = 0; // 死亡
                }
            } else {
                // 出生規則：恰好3個鄰居則出生
                if (neighbors === 3) {
                    newGrid[y][x] = 1;
                }
            }
        }
    }

    grid = newGrid;
    generation++;
}

// ==================== 計算鄰居數 ====================

function countNeighbors(x, y) {
    let count = 0;

    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;

            const nx = (x + dx + gridWidth) % gridWidth;
            const ny = (y + dy + gridHeight) % gridHeight;

            if (grid[ny][nx] > 0) {
                count++;
            }
        }
    }

    return count;
}

// ==================== 繪製 ====================

function draw() {
    // 清除畫布
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製網格線（可選）
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.05)';
    ctx.lineWidth = 0.5;

    const colorFn = colorModes[config.colorMode];
    let cellCount = 0;

    // 繪製細胞
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] > 0) {
                ctx.fillStyle = colorFn(grid[y][x]);
                ctx.fillRect(
                    x * config.cellSize + 1,
                    y * config.cellSize + 1,
                    config.cellSize - 2,
                    config.cellSize - 2
                );
                cellCount++;
            }
        }
    }

    document.getElementById('cellDisplay').textContent = cellCount;
}

// ==================== 更新顯示 ====================

function updateDisplay() {
    document.getElementById('genDisplay').textContent = generation;
}

// ==================== 動畫迴圈 ====================

function animate(currentTime) {
    if (!config.paused) {
        const interval = 1000 / config.speed;

        if (currentTime - lastTime >= interval) {
            nextGeneration();
            updateDisplay();
            lastTime = currentTime;
        }
    }

    draw();
    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 繪製細胞 ====================

function toggleCell(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) / config.cellSize);
    const y = Math.floor((clientY - rect.top) / config.cellSize);

    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        grid[y][x] = grid[y][x] > 0 ? 0 : 1;
    }
}

// ==================== 事件處理 ====================

window.addEventListener('resize', () => {
    const preset = document.getElementById('preset').value;
    init(preset);
});

// 滑鼠事件
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    toggleCell(e.clientX, e.clientY);
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / config.cellSize);
        const y = Math.floor((e.clientY - rect.top) / config.cellSize);

        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
            grid[y][x] = 1;
        }
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

// 觸控事件
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const touch = e.touches[0];
    toggleCell(touch.clientX, touch.clientY);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDrawing) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((touch.clientX - rect.left) / config.cellSize);
        const y = Math.floor((touch.clientY - rect.top) / config.cellSize);

        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
            grid[y][x] = 1;
        }
    }
});

canvas.addEventListener('touchend', () => {
    isDrawing = false;
});

// 控制項
document.getElementById('preset').addEventListener('change', (e) => {
    init(e.target.value);
});

document.getElementById('cellSize').addEventListener('input', (e) => {
    config.cellSize = parseInt(e.target.value);
    document.getElementById('cellSizeValue').textContent = config.cellSize;
    const preset = document.getElementById('preset').value;
    init(preset);
});

document.getElementById('speed').addEventListener('input', (e) => {
    config.speed = parseInt(e.target.value);
    document.getElementById('speedValue').textContent = config.speed;
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('resetBtn').addEventListener('click', () => {
    const preset = document.getElementById('preset').value;
    init(preset);
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    config.paused = !config.paused;
    const btn = document.getElementById('pauseBtn');
    btn.textContent = config.paused ? '繼續' : '暫停';
    btn.classList.toggle('paused', config.paused);
});

document.getElementById('clearBtn').addEventListener('click', () => {
    initGrid();
});

document.getElementById('stepBtn').addEventListener('click', () => {
    nextGeneration();
    updateDisplay();
});

// ==================== 啟動 ====================

init('random');
requestAnimationFrame(animate);
