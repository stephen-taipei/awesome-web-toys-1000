/**
 * Electric Field 電場模擬
 * Web Toys #027
 *
 * 放置正負電荷，觀察電力線分布，可測量任一點的場強
 *
 * 技術重點：
 * - 庫侖定律計算
 * - 電力線繪製
 * - 等電位線計算
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('fieldCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    lineCount: 24,
    lineLength: 300,
    chargeStrength: 5000,
    showVectors: false,
    showEquipotential: false
};

// 電荷和拖曳狀態
let charges = [];
let draggedCharge = null;
let dragOffset = { x: 0, y: 0 };
let mousePos = { x: 0, y: 0 };

// 庫侖常數 (簡化)
const k = 1;

// ==================== 電荷類別 ====================

class Charge {
    constructor(x, y, q) {
        this.x = x;
        this.y = y;
        this.q = q; // 正負表示電性
        this.radius = 20;
    }

    draw(ctx) {
        // 發光效果
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 2
        );

        if (this.q > 0) {
            gradient.addColorStop(0, 'rgba(255, 80, 80, 0.9)');
            gradient.addColorStop(0.5, 'rgba(255, 50, 50, 0.4)');
            gradient.addColorStop(1, 'transparent');
        } else {
            gradient.addColorStop(0, 'rgba(80, 80, 255, 0.9)');
            gradient.addColorStop(0.5, 'rgba(50, 50, 255, 0.4)');
            gradient.addColorStop(1, 'transparent');
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 主體
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.q > 0 ? '#ff4444' : '#4444ff';
        ctx.fill();

        // 符號
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.q > 0 ? '+' : '−', this.x, this.y);
    }

    containsPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return dx * dx + dy * dy < this.radius * this.radius;
    }
}

// ==================== 電場計算 ====================

/**
 * 計算某點的電場向量
 */
function getElectricField(x, y) {
    let ex = 0;
    let ey = 0;

    charges.forEach(charge => {
        const dx = x - charge.x;
        const dy = y - charge.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist < 10) return;

        // E = kq/r² 方向沿徑向
        const magnitude = k * Math.abs(charge.q) * config.chargeStrength / distSq;
        const direction = charge.q > 0 ? 1 : -1;

        ex += direction * magnitude * dx / dist;
        ey += direction * magnitude * dy / dist;
    });

    return { x: ex, y: ey };
}

/**
 * 計算某點的電位
 */
function getPotential(x, y) {
    let v = 0;

    charges.forEach(charge => {
        const dx = x - charge.x;
        const dy = y - charge.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) return;

        // V = kq/r
        v += k * charge.q * config.chargeStrength / dist;
    });

    return v;
}

/**
 * 獲取場強大小
 */
function getFieldMagnitude(x, y) {
    const field = getElectricField(x, y);
    return Math.sqrt(field.x * field.x + field.y * field.y);
}

// ==================== 電力線繪製 ====================

/**
 * 從正電荷追蹤電力線
 */
function traceFieldLine(startX, startY, direction) {
    const points = [{ x: startX, y: startY }];
    let x = startX;
    let y = startY;
    const stepSize = 4;
    const maxSteps = config.lineLength;

    for (let i = 0; i < maxSteps; i++) {
        const field = getElectricField(x, y);
        const magnitude = Math.sqrt(field.x * field.x + field.y * field.y);

        if (magnitude < 0.1) break;

        const nx = field.x / magnitude * direction;
        const ny = field.y / magnitude * direction;

        x += nx * stepSize;
        y += ny * stepSize;

        // 邊界檢查
        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) break;

        // 檢查是否接近電荷
        let nearCharge = false;
        for (const charge of charges) {
            const dx = x - charge.x;
            const dy = y - charge.y;
            if (dx * dx + dy * dy < charge.radius * charge.radius) {
                nearCharge = true;
                break;
            }
        }
        if (nearCharge) break;

        points.push({ x, y });
    }

    return points;
}

/**
 * 繪製所有電力線
 */
function drawFieldLines() {
    // 從每個正電荷發出電力線
    charges.forEach(charge => {
        if (charge.q > 0) {
            for (let i = 0; i < config.lineCount; i++) {
                const angle = (i / config.lineCount) * Math.PI * 2;
                const startX = charge.x + Math.cos(angle) * (charge.radius + 5);
                const startY = charge.y + Math.sin(angle) * (charge.radius + 5);

                const points = traceFieldLine(startX, startY, 1);
                drawFieldLinePath(points);
            }
        }
    });

    // 如果只有負電荷，從邊界發出電力線
    const hasPositive = charges.some(c => c.q > 0);
    if (!hasPositive && charges.length > 0) {
        charges.forEach(charge => {
            if (charge.q < 0) {
                for (let i = 0; i < config.lineCount; i++) {
                    const angle = (i / config.lineCount) * Math.PI * 2;
                    // 從遠處向負電荷追蹤
                    const startX = charge.x + Math.cos(angle) * 300;
                    const startY = charge.y + Math.sin(angle) * 300;

                    const points = traceFieldLine(startX, startY, -1);
                    drawFieldLinePath(points.reverse());
                }
            }
        });
    }
}

/**
 * 繪製單條電力線路徑
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
    gradient.addColorStop(0, 'rgba(255, 100, 50, 0.7)');
    gradient.addColorStop(0.5, 'rgba(255, 200, 50, 0.5)');
    gradient.addColorStop(1, 'rgba(50, 100, 255, 0.7)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 繪製箭頭
    if (points.length > 10) {
        const midIdx = Math.floor(points.length / 2);
        const p1 = points[midIdx - 1];
        const p2 = points[midIdx];
        drawArrow(p1.x, p1.y, p2.x, p2.y);
    }
}

/**
 * 繪製箭頭
 */
function drawArrow(x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const size = 8;

    ctx.save();
    ctx.translate(x2, y2);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size / 2);
    ctx.lineTo(-size, size / 2);
    ctx.closePath();

    ctx.fillStyle = 'rgba(255, 200, 100, 0.8)';
    ctx.fill();

    ctx.restore();
}

// ==================== 場強向量場 ====================

function drawVectorField() {
    if (!config.showVectors) return;

    const gridSize = 40;
    const arrowScale = 0.5;

    for (let x = gridSize; x < canvas.width; x += gridSize) {
        for (let y = gridSize; y < canvas.height; y += gridSize) {
            // 檢查是否在電荷內
            let inCharge = false;
            for (const charge of charges) {
                const dx = x - charge.x;
                const dy = y - charge.y;
                if (dx * dx + dy * dy < (charge.radius + 20) * (charge.radius + 20)) {
                    inCharge = true;
                    break;
                }
            }
            if (inCharge) continue;

            const field = getElectricField(x, y);
            const magnitude = Math.sqrt(field.x * field.x + field.y * field.y);

            if (magnitude < 0.5) continue;

            const normalizedMag = Math.min(magnitude * arrowScale, gridSize * 0.8);
            const endX = x + field.x / magnitude * normalizedMag;
            const endY = y + field.y / magnitude * normalizedMag;

            // 顏色根據場強
            const hue = Math.max(0, 60 - magnitude * 2);
            ctx.strokeStyle = `hsla(${hue}, 80%, 50%, 0.5)`;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // 小箭頭
            const angle = Math.atan2(field.y, field.x);
            ctx.save();
            ctx.translate(endX, endY);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-5, -3);
            ctx.lineTo(-5, 3);
            ctx.closePath();
            ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.5)`;
            ctx.fill();
            ctx.restore();
        }
    }
}

// ==================== 等電位線 ====================

function drawEquipotentialLines() {
    if (!config.showEquipotential) return;

    const levels = [-500, -200, -100, -50, 50, 100, 200, 500];
    const step = 5;

    ctx.lineWidth = 1;

    levels.forEach(level => {
        ctx.strokeStyle = level > 0 ? 'rgba(255, 100, 100, 0.3)' : 'rgba(100, 100, 255, 0.3)';
        ctx.beginPath();

        for (let x = 0; x < canvas.width; x += step) {
            for (let y = 0; y < canvas.height; y += step) {
                const v = getPotential(x, y);

                // 簡單的等值線檢測
                const vRight = getPotential(x + step, y);
                const vDown = getPotential(x, y + step);

                if ((v - level) * (vRight - level) < 0) {
                    ctx.moveTo(x + step / 2, y);
                    ctx.lineTo(x + step / 2, y + step);
                }
                if ((v - level) * (vDown - level) < 0) {
                    ctx.moveTo(x, y + step / 2);
                    ctx.lineTo(x + step, y + step / 2);
                }
            }
        }

        ctx.stroke();
    });
}

// ==================== 初始化與渲染 ====================

function clearCanvas() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function render() {
    clearCanvas();

    // 繪製等電位線
    drawEquipotentialLines();

    // 繪製電力線
    drawFieldLines();

    // 繪製向量場
    drawVectorField();

    // 繪製電荷
    charges.forEach(charge => charge.draw(ctx));

    // 更新場強顯示
    if (charges.length > 0) {
        const magnitude = getFieldMagnitude(mousePos.x, mousePos.y);
        const potential = getPotential(mousePos.x, mousePos.y);
        document.getElementById('fieldStrength').textContent = magnitude.toFixed(1);
        document.getElementById('potential').textContent = potential.toFixed(1);
    }

    requestAnimationFrame(render);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function addCharge(x, y, q) {
    charges.push(new Charge(x, y, q));
    document.getElementById('chargeDisplay').textContent = charges.length;
}

function clearCharges() {
    charges = [];
    document.getElementById('chargeDisplay').textContent = 0;
}

function createDipole() {
    clearCharges();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    addCharge(cx - 100, cy, 1);
    addCharge(cx + 100, cy, -1);
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const charge of charges) {
        if (charge.containsPoint(x, y)) {
            draggedCharge = charge;
            dragOffset.x = x - charge.x;
            dragOffset.y = y - charge.y;
            return;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;

    if (draggedCharge) {
        draggedCharge.x = mousePos.x - dragOffset.x;
        draggedCharge.y = mousePos.y - dragOffset.y;
    }
});

canvas.addEventListener('mouseup', () => {
    draggedCharge = null;
});

canvas.addEventListener('mouseleave', () => {
    draggedCharge = null;
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    for (const charge of charges) {
        if (charge.containsPoint(x, y)) {
            draggedCharge = charge;
            dragOffset.x = x - charge.x;
            dragOffset.y = y - charge.y;
            return;
        }
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    mousePos.x = touch.clientX - rect.left;
    mousePos.y = touch.clientY - rect.top;

    if (draggedCharge) {
        draggedCharge.x = mousePos.x - dragOffset.x;
        draggedCharge.y = mousePos.y - dragOffset.y;
    }
}, { passive: false });

canvas.addEventListener('touchend', () => {
    draggedCharge = null;
});

// 控制面板
document.getElementById('lineCount').addEventListener('input', (e) => {
    config.lineCount = parseInt(e.target.value);
    document.getElementById('lineCountValue').textContent = config.lineCount;
});

document.getElementById('lineLength').addEventListener('input', (e) => {
    config.lineLength = parseInt(e.target.value);
    document.getElementById('lineLengthValue').textContent = config.lineLength;
});

document.getElementById('chargeStrength').addEventListener('input', (e) => {
    config.chargeStrength = parseInt(e.target.value);
    document.getElementById('chargeStrengthValue').textContent = config.chargeStrength;
});

document.getElementById('showVectors').addEventListener('change', (e) => {
    config.showVectors = e.target.checked;
});

document.getElementById('showEquipotential').addEventListener('change', (e) => {
    config.showEquipotential = e.target.checked;
});

document.getElementById('addPositiveBtn').addEventListener('click', () => {
    const x = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
    const y = canvas.height * 0.3 + Math.random() * canvas.height * 0.4;
    addCharge(x, y, 1);
});

document.getElementById('addNegativeBtn').addEventListener('click', () => {
    const x = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
    const y = canvas.height * 0.3 + Math.random() * canvas.height * 0.4;
    addCharge(x, y, -1);
});

document.getElementById('clearBtn').addEventListener('click', clearCharges);
document.getElementById('dipoleBtn').addEventListener('click', createDipole);

// ==================== 啟動 ====================

resizeCanvas();
createDipole(); // 初始顯示電偶極
requestAnimationFrame(render);
