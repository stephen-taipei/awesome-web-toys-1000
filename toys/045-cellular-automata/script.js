/**
 * Cellular Automata 細胞自動機
 * Web Toys #045
 *
 * 一維元胞自動機視覺化
 *
 * 技術重點：
 * - Wolfram 256 規則
 * - 即時世代演算
 * - 多種初始化模式
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('automatonCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    rule: 110,
    cellSize: 4,
    speed: 10,
    colorMode: 'classic',
    initMode: 'single',
    paused: false
};

let cells = [];
let generation = 0;
let ruleSet = [];
let animationId;
let lastTime = 0;

// ==================== 顏色模式 ====================

const colorModes = {
    classic: (gen, total) => '#00ff96',
    rainbow: (gen, total) => `hsl(${(gen / total) * 360}, 80%, 55%)`,
    heatmap: (gen, total) => {
        const t = gen / total;
        const r = Math.floor(255 * Math.min(1, t * 2));
        const g = Math.floor(255 * Math.min(1, (1 - t) * 2));
        return `rgb(${r}, ${g}, 50)`;
    },
    matrix: (gen, total) => {
        const brightness = 50 + Math.random() * 50;
        return `hsl(120, 100%, ${brightness}%)`;
    }
};

// ==================== 規則解析 ====================

function parseRule(ruleNum) {
    // 將規則編號轉換為 8 位元二進位數組
    const binary = ruleNum.toString(2).padStart(8, '0');
    return binary.split('').map(b => parseInt(b)).reverse();
}

// ==================== 初始化 ====================

function init() {
    resizeCanvas();

    const width = Math.ceil(canvas.width / config.cellSize);
    cells = new Array(width).fill(0);

    // 根據初始模式設定
    switch (config.initMode) {
        case 'single':
            cells[Math.floor(width / 2)] = 1;
            break;
        case 'random':
            for (let i = 0; i < width; i++) {
                cells[i] = Math.random() > 0.5 ? 1 : 0;
            }
            break;
        case 'alternating':
            for (let i = 0; i < width; i++) {
                cells[i] = i % 2;
            }
            break;
    }

    ruleSet = parseRule(config.rule);
    generation = 0;

    // 清除畫布
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製第一行
    drawGeneration();

    updateDisplay();
}

// ==================== 計算下一代 ====================

function nextGeneration() {
    const width = cells.length;
    const newCells = new Array(width).fill(0);

    for (let i = 0; i < width; i++) {
        // 獲取左、中、右三個細胞的狀態
        const left = cells[(i - 1 + width) % width];
        const center = cells[i];
        const right = cells[(i + 1) % width];

        // 將三個狀態組合成索引（0-7）
        const index = left * 4 + center * 2 + right;

        // 根據規則決定新狀態
        newCells[i] = ruleSet[index];
    }

    cells = newCells;
    generation++;
}

// ==================== 繪製當前世代 ====================

function drawGeneration() {
    const width = cells.length;
    const y = (generation % Math.ceil(canvas.height / config.cellSize)) * config.cellSize;
    const maxGen = Math.ceil(canvas.height / config.cellSize);

    // 如果到達底部，清除並重新開始
    if (generation > 0 && generation % maxGen === 0) {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const colorFn = colorModes[config.colorMode];

    for (let i = 0; i < width; i++) {
        if (cells[i] === 1) {
            ctx.fillStyle = colorFn(generation, maxGen);
            ctx.fillRect(
                i * config.cellSize,
                y,
                config.cellSize - 1,
                config.cellSize - 1
            );
        }
    }
}

// ==================== 更新顯示 ====================

function updateDisplay() {
    document.getElementById('ruleDisplay').textContent = config.rule;
    document.getElementById('genDisplay').textContent = generation;
}

// ==================== 動畫迴圈 ====================

function animate(currentTime) {
    if (config.paused) {
        animationId = requestAnimationFrame(animate);
        return;
    }

    const interval = 1000 / config.speed;

    if (currentTime - lastTime >= interval) {
        nextGeneration();
        drawGeneration();
        updateDisplay();
        lastTime = currentTime;
    }

    animationId = requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 事件處理 ====================

window.addEventListener('resize', () => {
    init();
});

// 規則滑桿
document.getElementById('rule').addEventListener('input', (e) => {
    config.rule = parseInt(e.target.value);
    document.getElementById('ruleValue').textContent = config.rule;
    init();
});

// 預設規則
document.getElementById('preset').addEventListener('change', (e) => {
    config.rule = parseInt(e.target.value);
    document.getElementById('rule').value = config.rule;
    document.getElementById('ruleValue').textContent = config.rule;
    init();
});

// 細胞大小
document.getElementById('cellSize').addEventListener('input', (e) => {
    config.cellSize = parseInt(e.target.value);
    document.getElementById('cellSizeValue').textContent = config.cellSize;
    init();
});

// 速度
document.getElementById('speed').addEventListener('input', (e) => {
    config.speed = parseInt(e.target.value);
    document.getElementById('speedValue').textContent = config.speed;
});

// 顏色模式
document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

// 初始模式
document.getElementById('initMode').addEventListener('change', (e) => {
    config.initMode = e.target.value;
    init();
});

// 重新開始按鈕
document.getElementById('resetBtn').addEventListener('click', init);

// 暫停按鈕
document.getElementById('pauseBtn').addEventListener('click', () => {
    config.paused = !config.paused;
    const btn = document.getElementById('pauseBtn');
    btn.textContent = config.paused ? '繼續' : '暫停';
    btn.classList.toggle('paused', config.paused);
});

// 點擊畫布切換暫停
canvas.addEventListener('click', () => {
    config.paused = !config.paused;
    const btn = document.getElementById('pauseBtn');
    btn.textContent = config.paused ? '繼續' : '暫停';
    btn.classList.toggle('paused', config.paused);
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(animate);
