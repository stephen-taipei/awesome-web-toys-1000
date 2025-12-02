/**
 * Spirograph 螺旋圖形
 * Web Toys #035
 *
 * 基於齒輪原理的螺旋圖形生成器
 *
 * 技術重點：
 * - 內擺線/外擺線數學公式
 * - 齒輪動畫視覺化
 * - 連續繪製軌跡
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('spirographCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    outerRadius: 200,  // R - 外圓（固定齒輪）半徑
    innerRadius: 80,   // r - 內圓（滾動齒輪）半徑
    penOffset: 60,     // d - 筆孔距離內圓圓心的距離
    speed: 2,
    colorMode: 'rainbow',
    showGears: false
};

let angle = 0;
let isPaused = false;
let points = [];
let centerX, centerY;
let loopCount = 0;
let prevX = null, prevY = null;

// ==================== 顏色模式 ====================

const colorModes = {
    rainbow: (t) => `hsl(${t % 360}, 80%, 60%)`,
    gradient: (t) => {
        const h = 200 + Math.sin(t * 0.01) * 60;
        return `hsl(${h}, 75%, 55%)`;
    },
    neon: (t) => {
        const colors = ['#ff00ff', '#00ffff', '#ff00aa', '#00ff88'];
        return colors[Math.floor(t * 0.02) % colors.length];
    },
    mono: () => '#00ccff'
};

// ==================== 螺旋圖形計算 ====================

/**
 * 計算內擺線座標
 * x = (R-r) * cos(θ) + d * cos((R-r)/r * θ)
 * y = (R-r) * sin(θ) - d * sin((R-r)/r * θ)
 */
function calculateHypotrochoid(t) {
    const R = config.outerRadius;
    const r = config.innerRadius;
    const d = config.penOffset;

    const diff = R - r;
    const ratio = diff / r;

    const x = diff * Math.cos(t) + d * Math.cos(ratio * t);
    const y = diff * Math.sin(t) - d * Math.sin(ratio * t);

    return { x: centerX + x, y: centerY + y };
}

/**
 * 計算內圓圓心位置
 */
function getInnerCircleCenter(t) {
    const R = config.outerRadius;
    const r = config.innerRadius;
    const diff = R - r;

    return {
        x: centerX + diff * Math.cos(t),
        y: centerY + diff * Math.sin(t)
    };
}

/**
 * 計算筆尖位置相對於內圓
 */
function getPenPosition(t) {
    const r = config.innerRadius;
    const d = config.penOffset;
    const R = config.outerRadius;
    const diff = R - r;
    const ratio = diff / r;

    const innerCenter = getInnerCircleCenter(t);
    const penAngle = -ratio * t;

    return {
        x: innerCenter.x + d * Math.cos(penAngle),
        y: innerCenter.y + d * Math.sin(penAngle)
    };
}

/**
 * 計算完成一個完整圖案所需的角度
 */
function getFullCycleAngle() {
    const R = config.outerRadius;
    const r = config.innerRadius;
    // 最小公倍數
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
    return (lcm(R, r) / R) * Math.PI * 2;
}

// ==================== 繪製函數 ====================

/**
 * 繪製齒輪
 */
function drawGears(t) {
    const R = config.outerRadius;
    const r = config.innerRadius;
    const innerCenter = getInnerCircleCenter(t);
    const penPos = getPenPosition(t);

    // 外圓（固定齒輪）
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, R, 0, Math.PI * 2);
    ctx.stroke();

    // 繪製外圓齒
    const outerTeeth = Math.floor(R / 8);
    for (let i = 0; i < outerTeeth; i++) {
        const toothAngle = (i / outerTeeth) * Math.PI * 2;
        const x = centerX + Math.cos(toothAngle) * (R + 5);
        const y = centerY + Math.sin(toothAngle) * (R + 5);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 內圓（滾動齒輪）
    ctx.strokeStyle = 'rgba(255, 100, 200, 0.5)';
    ctx.beginPath();
    ctx.arc(innerCenter.x, innerCenter.y, r, 0, Math.PI * 2);
    ctx.stroke();

    // 繪製內圓齒
    const innerTeeth = Math.floor(r / 8);
    const ratio = (R - r) / r;
    for (let i = 0; i < innerTeeth; i++) {
        const toothAngle = (i / innerTeeth) * Math.PI * 2 - ratio * t;
        const x = innerCenter.x + Math.cos(toothAngle) * (r + 5);
        const y = innerCenter.y + Math.sin(toothAngle) * (r + 5);
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 筆臂
    ctx.strokeStyle = 'rgba(255, 255, 100, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(innerCenter.x, innerCenter.y);
    ctx.lineTo(penPos.x, penPos.y);
    ctx.stroke();

    // 內圓圓心
    ctx.fillStyle = 'rgba(255, 100, 200, 0.8)';
    ctx.beginPath();
    ctx.arc(innerCenter.x, innerCenter.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // 筆尖
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(penPos.x, penPos.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(penPos.x, penPos.y, 2, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * 繪製螺旋軌跡
 */
function drawSpirograph() {
    const pos = calculateHypotrochoid(angle);
    const colorFn = colorModes[config.colorMode];

    if (prevX !== null && prevY !== null) {
        ctx.strokeStyle = colorFn(angle * 30);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }

    prevX = pos.x;
    prevY = pos.y;
}

/**
 * 清除畫布
 */
function clearCanvas() {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    points = [];
    prevX = null;
    prevY = null;
    angle = 0;
    loopCount = 0;
    updateInfo();
}

/**
 * 更新資訊顯示
 */
function updateInfo() {
    document.getElementById('angleDisplay').textContent = Math.round((angle * 180 / Math.PI) % 360);
    document.getElementById('loopDisplay').textContent = loopCount;
}

// ==================== 動畫迴圈 ====================

function animate() {
    if (!isPaused) {
        // 如果要顯示齒輪，先清除整個畫布並重繪軌跡
        if (config.showGears) {
            ctx.fillStyle = 'rgba(5, 5, 16, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 繪製螺旋軌跡
        const step = config.speed * 0.02;
        for (let i = 0; i < 5; i++) {
            drawSpirograph();
            angle += step;
        }

        // 計算迴圈數
        const fullCycle = getFullCycleAngle();
        loopCount = Math.floor(angle / fullCycle);

        // 更新資訊
        updateInfo();

        // 繪製齒輪（如果啟用）
        if (config.showGears) {
            drawGears(angle);
        }
    }

    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    clearCanvas();
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

document.getElementById('outerRadius').addEventListener('input', (e) => {
    config.outerRadius = parseInt(e.target.value);
    document.getElementById('outerRadiusValue').textContent = config.outerRadius;
    clearCanvas();
});

document.getElementById('innerRadius').addEventListener('input', (e) => {
    config.innerRadius = parseInt(e.target.value);
    document.getElementById('innerRadiusValue').textContent = config.innerRadius;
    clearCanvas();
});

document.getElementById('penOffset').addEventListener('input', (e) => {
    config.penOffset = parseInt(e.target.value);
    document.getElementById('penOffsetValue').textContent = config.penOffset;
    clearCanvas();
});

document.getElementById('speed').addEventListener('input', (e) => {
    config.speed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = config.speed;
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('showGears').addEventListener('change', (e) => {
    config.showGears = e.target.checked;
});

document.getElementById('clearBtn').addEventListener('click', clearCanvas);

document.getElementById('pauseBtn').addEventListener('click', () => {
    isPaused = !isPaused;
    const btn = document.getElementById('pauseBtn');
    btn.textContent = isPaused ? '繼續' : '暫停';
    btn.classList.toggle('paused', isPaused);
});

// ==================== 啟動 ====================

resizeCanvas();
requestAnimationFrame(animate);
