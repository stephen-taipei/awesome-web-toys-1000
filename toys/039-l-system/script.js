/**
 * L-System 林登麥爾系統
 * Web Toys #039
 *
 * 互動式 L-System 分形生成器
 *
 * 技術重點：
 * - 字串重寫系統
 * - 龜繪圖法
 * - 堆疊狀態管理
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('lsystemCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    preset: 'tree',
    iterations: 5,
    angle: 25,
    length: 10,
    colorMode: 'gradient'
};

// ==================== L-System 預設 ====================

const presets = {
    tree: {
        axiom: 'X',
        rules: {
            'X': 'F+[[X]-X]-F[-FX]+X',
            'F': 'FF'
        },
        angle: 25,
        startAngle: -90,
        iterations: 5
    },
    koch: {
        axiom: 'F',
        rules: {
            'F': 'F+F-F-F+F'
        },
        angle: 90,
        startAngle: 0,
        iterations: 4
    },
    sierpinski: {
        axiom: 'F-G-G',
        rules: {
            'F': 'F-G+F+G-F',
            'G': 'GG'
        },
        angle: 120,
        startAngle: 0,
        iterations: 6
    },
    dragon: {
        axiom: 'FX',
        rules: {
            'X': 'X+YF+',
            'Y': '-FX-Y'
        },
        angle: 90,
        startAngle: 0,
        iterations: 12
    },
    plant: {
        axiom: 'X',
        rules: {
            'X': 'F-[[X]+X]+F[+FX]-X',
            'F': 'FF'
        },
        angle: 22.5,
        startAngle: -90,
        iterations: 5
    },
    hilbert: {
        axiom: 'A',
        rules: {
            'A': '-BF+AFA+FB-',
            'B': '+AF-BFB-FA+'
        },
        angle: 90,
        startAngle: 0,
        iterations: 5
    }
};

let segmentCount = 0;

// ==================== L-System 生成 ====================

/**
 * 應用重寫規則生成字串
 */
function generateString(axiom, rules, iterations) {
    let current = axiom;

    for (let i = 0; i < iterations; i++) {
        let next = '';
        for (const char of current) {
            next += rules[char] || char;
        }
        current = next;
    }

    return current;
}

/**
 * 計算繪製邊界
 */
function calculateBounds(instructions, angle, length, startAngle) {
    let x = 0, y = 0;
    let currentAngle = startAngle * Math.PI / 180;
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    const stack = [];

    for (const char of instructions) {
        switch (char) {
            case 'F':
            case 'G':
                x += Math.cos(currentAngle) * length;
                y += Math.sin(currentAngle) * length;
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
                break;
            case '+':
                currentAngle += angle * Math.PI / 180;
                break;
            case '-':
                currentAngle -= angle * Math.PI / 180;
                break;
            case '[':
                stack.push({ x, y, angle: currentAngle });
                break;
            case ']':
                const state = stack.pop();
                if (state) {
                    x = state.x;
                    y = state.y;
                    currentAngle = state.angle;
                }
                break;
        }
    }

    return { minX, maxX, minY, maxY };
}

// ==================== 顏色模式 ====================

const colorModes = {
    gradient: (depth, maxDepth, index, total) => {
        const h = 100 + (depth / maxDepth) * 40;
        const l = 40 + (1 - depth / maxDepth) * 20;
        return `hsl(${h}, 70%, ${l}%)`;
    },
    depth: (depth, maxDepth, index, total) => {
        const ratio = depth / maxDepth;
        const h = 120 - ratio * 80;
        return `hsl(${h}, 75%, 45%)`;
    },
    rainbow: (depth, maxDepth, index, total) => {
        const h = (index / total) * 360;
        return `hsl(${h}, 75%, 50%)`;
    },
    mono: () => '#64c878'
};

// ==================== 繪製 L-System ====================

function drawLSystem() {
    // 清除畫布
    ctx.fillStyle = '#0a0f0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const preset = presets[config.preset];
    const angle = config.angle;
    const length = config.length;
    const iterations = config.iterations;

    // 生成指令字串
    const instructions = generateString(preset.axiom, preset.rules, iterations);

    // 計算邊界以居中顯示
    const bounds = calculateBounds(instructions, angle, length, preset.startAngle);
    const drawWidth = bounds.maxX - bounds.minX;
    const drawHeight = bounds.maxY - bounds.minY;

    // 計算縮放和偏移
    const padding = 50;
    const scaleX = (canvas.width - padding * 2) / (drawWidth || 1);
    const scaleY = (canvas.height - padding * 2) / (drawHeight || 1);
    const scale = Math.min(scaleX, scaleY, 1);

    const offsetX = canvas.width / 2 - (bounds.minX + drawWidth / 2) * scale;
    const offsetY = canvas.height / 2 - (bounds.minY + drawHeight / 2) * scale;

    // 繪製
    let x = 0, y = 0;
    let currentAngle = preset.startAngle * Math.PI / 180;
    const stack = [];
    let depth = 0;
    let maxDepth = 0;
    segmentCount = 0;

    // 先計算最大深度
    for (const char of instructions) {
        if (char === '[') depth++;
        if (char === ']') depth--;
        maxDepth = Math.max(maxDepth, depth);
    }
    depth = 0;

    ctx.lineWidth = Math.max(1, 3 - iterations * 0.3);
    ctx.lineCap = 'round';

    let index = 0;
    const totalSegments = (instructions.match(/[FG]/g) || []).length;

    for (const char of instructions) {
        switch (char) {
            case 'F':
            case 'G':
                const newX = x + Math.cos(currentAngle) * length;
                const newY = y + Math.sin(currentAngle) * length;

                const colorFn = colorModes[config.colorMode];
                ctx.strokeStyle = colorFn(depth, maxDepth || 1, index, totalSegments);

                ctx.beginPath();
                ctx.moveTo(x * scale + offsetX, y * scale + offsetY);
                ctx.lineTo(newX * scale + offsetX, newY * scale + offsetY);
                ctx.stroke();

                x = newX;
                y = newY;
                segmentCount++;
                index++;
                break;
            case '+':
                currentAngle += angle * Math.PI / 180;
                break;
            case '-':
                currentAngle -= angle * Math.PI / 180;
                break;
            case '[':
                stack.push({ x, y, angle: currentAngle, depth });
                depth++;
                break;
            case ']':
                const state = stack.pop();
                if (state) {
                    x = state.x;
                    y = state.y;
                    currentAngle = state.angle;
                    depth = state.depth;
                }
                break;
        }
    }

    updateInfo();
}

function updateInfo() {
    document.getElementById('iterDisplay').textContent = config.iterations;
    document.getElementById('segmentDisplay').textContent = segmentCount;
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawLSystem();
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('preset').addEventListener('change', (e) => {
    config.preset = e.target.value;
    const preset = presets[config.preset];

    // 更新角度和迭代次數為預設值
    config.angle = preset.angle;
    config.iterations = preset.iterations;

    document.getElementById('angle').value = preset.angle;
    document.getElementById('angleValue').textContent = preset.angle;
    document.getElementById('iterations').value = preset.iterations;
    document.getElementById('iterationsValue').textContent = preset.iterations;

    drawLSystem();
});

document.getElementById('iterations').addEventListener('input', (e) => {
    config.iterations = parseInt(e.target.value);
    document.getElementById('iterationsValue').textContent = config.iterations;
    drawLSystem();
});

document.getElementById('angle').addEventListener('input', (e) => {
    config.angle = parseInt(e.target.value);
    document.getElementById('angleValue').textContent = config.angle;
    drawLSystem();
});

document.getElementById('length').addEventListener('input', (e) => {
    config.length = parseInt(e.target.value);
    document.getElementById('lengthValue').textContent = config.length;
    drawLSystem();
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
    drawLSystem();
});

document.getElementById('generateBtn').addEventListener('click', drawLSystem);

// ==================== 啟動 ====================

resizeCanvas();
