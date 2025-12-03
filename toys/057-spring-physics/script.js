/**
 * Spring Physics 彈簧物理
 * Web Toys #057
 *
 * 彈簧質點系統模擬
 *
 * 技術重點：
 * - 胡克定律
 * - Verlet 積分
 * - 互動式拖曳
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('springCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    nodeCount: 20,
    stiffness: 0.3,
    damping: 0.95,
    gravity: 0.5,
    preset: 'chain',
    paused: false
};

let nodes = [];
let springs = [];
let draggedNode = null;

// ==================== 節點類別 ====================

class Node {
    constructor(x, y, fixed = false) {
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.fixed = fixed;
        this.radius = 8;
    }

    update() {
        if (this.fixed) return;

        const vx = (this.x - this.oldX) * config.damping;
        const vy = (this.y - this.oldY) * config.damping;

        this.oldX = this.x;
        this.oldY = this.y;

        this.x += vx;
        this.y += vy + config.gravity;

        // 邊界碰撞
        if (this.x < this.radius) {
            this.x = this.radius;
            this.oldX = this.x + vx * 0.5;
        }
        if (this.x > canvas.width - this.radius) {
            this.x = canvas.width - this.radius;
            this.oldX = this.x + vx * 0.5;
        }
        if (this.y < this.radius) {
            this.y = this.radius;
            this.oldY = this.y + vy * 0.5;
        }
        if (this.y > canvas.height - this.radius) {
            this.y = canvas.height - this.radius;
            this.oldY = this.y + vy * 0.5;
        }
    }

    draw() {
        // 光暈
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 2
        );
        gradient.addColorStop(0, this.fixed ? 'rgba(255, 100, 100, 0.5)' : 'rgba(100, 255, 200, 0.5)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // 節點
        ctx.fillStyle = this.fixed ? '#ff6464' : '#64ffc8';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==================== 彈簧類別 ====================

class Spring {
    constructor(nodeA, nodeB, restLength = null) {
        this.nodeA = nodeA;
        this.nodeB = nodeB;
        this.restLength = restLength || this.getLength();
    }

    getLength() {
        const dx = this.nodeB.x - this.nodeA.x;
        const dy = this.nodeB.y - this.nodeA.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    update() {
        const dx = this.nodeB.x - this.nodeA.x;
        const dy = this.nodeB.y - this.nodeA.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) return;

        const diff = (dist - this.restLength) / dist;
        const offsetX = dx * diff * config.stiffness;
        const offsetY = dy * diff * config.stiffness;

        if (!this.nodeA.fixed) {
            this.nodeA.x += offsetX;
            this.nodeA.y += offsetY;
        }
        if (!this.nodeB.fixed) {
            this.nodeB.x -= offsetX;
            this.nodeB.y -= offsetY;
        }
    }

    draw() {
        const strain = Math.abs(this.getLength() - this.restLength) / this.restLength;
        const hue = 160 - strain * 160; // 綠到紅

        ctx.strokeStyle = `hsl(${hue}, 80%, 50%)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.nodeA.x, this.nodeA.y);
        ctx.lineTo(this.nodeB.x, this.nodeB.y);
        ctx.stroke();
    }
}

// ==================== 預設模式 ====================

function createPreset(preset) {
    nodes = [];
    springs = [];

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    switch (preset) {
        case 'chain':
            const spacing = 30;
            const startY = 100;
            for (let i = 0; i < config.nodeCount; i++) {
                const node = new Node(cx, startY + i * spacing, i === 0);
                nodes.push(node);
                if (i > 0) {
                    springs.push(new Spring(nodes[i - 1], nodes[i], spacing));
                }
            }
            break;

        case 'web':
            // 中心點
            const center = new Node(cx, cy, true);
            nodes.push(center);

            // 放射狀
            const rings = 4;
            const spokes = 8;
            for (let r = 1; r <= rings; r++) {
                const radius = r * 60;
                for (let s = 0; s < spokes; s++) {
                    const angle = (s / spokes) * Math.PI * 2;
                    const node = new Node(
                        cx + Math.cos(angle) * radius,
                        cy + Math.sin(angle) * radius,
                        r === rings // 外圈固定
                    );
                    nodes.push(node);

                    // 連接到中心或內圈
                    if (r === 1) {
                        springs.push(new Spring(center, node));
                    } else {
                        const innerIndex = 1 + (r - 2) * spokes + s;
                        springs.push(new Spring(nodes[innerIndex], node));
                    }

                    // 連接同圈相鄰
                    if (s > 0) {
                        springs.push(new Spring(nodes[nodes.length - 2], node));
                    }
                }
                // 首尾相連
                const ringStart = 1 + (r - 1) * spokes;
                springs.push(new Spring(nodes[ringStart], nodes[nodes.length - 1]));
            }
            break;

        case 'bridge':
            const bridgeLen = Math.min(canvas.width - 200, 800);
            const bridgeNodes = config.nodeCount;
            const bridgeSpacing = bridgeLen / (bridgeNodes - 1);
            const bridgeY = cy;

            for (let i = 0; i < bridgeNodes; i++) {
                const fixed = i === 0 || i === bridgeNodes - 1;
                nodes.push(new Node(
                    (canvas.width - bridgeLen) / 2 + i * bridgeSpacing,
                    bridgeY,
                    fixed
                ));
                if (i > 0) {
                    springs.push(new Spring(nodes[i - 1], nodes[i], bridgeSpacing));
                }
            }

            // 添加懸索
            const cableY = bridgeY - 100;
            for (let i = 0; i < bridgeNodes; i += 3) {
                const cableNode = new Node(nodes[i].x, cableY, i === 0 || i >= bridgeNodes - 3);
                nodes.push(cableNode);
                springs.push(new Spring(cableNode, nodes[i]));
            }
            break;

        case 'grid':
            const cols = Math.ceil(Math.sqrt(config.nodeCount));
            const rows = Math.ceil(config.nodeCount / cols);
            const gridSpacing = 40;
            const startX = cx - (cols - 1) * gridSpacing / 2;
            const startGridY = 100;

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const fixed = row === 0;
                    const node = new Node(
                        startX + col * gridSpacing,
                        startGridY + row * gridSpacing,
                        fixed
                    );
                    nodes.push(node);

                    const index = row * cols + col;
                    // 水平連接
                    if (col > 0) {
                        springs.push(new Spring(nodes[index - 1], node, gridSpacing));
                    }
                    // 垂直連接
                    if (row > 0) {
                        springs.push(new Spring(nodes[index - cols], node, gridSpacing));
                    }
                }
            }
            break;
    }

    updateDisplay();
}

// ==================== 初始化 ====================

function init() {
    resizeCanvas();
    createPreset(config.preset);
}

// ==================== 更新顯示 ====================

function updateDisplay() {
    document.getElementById('nodeDisplay').textContent = nodes.length;
    document.getElementById('springDisplay').textContent = springs.length;
}

// ==================== 動畫迴圈 ====================

function animate() {
    // 清除畫布
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!config.paused) {
        // 多次迭代提高穩定性
        for (let iter = 0; iter < 3; iter++) {
            for (const spring of springs) {
                spring.update();
            }
        }

        for (const node of nodes) {
            node.update();
        }
    }

    // 繪製彈簧
    for (const spring of springs) {
        spring.draw();
    }

    // 繪製節點
    for (const node of nodes) {
        node.draw();
    }

    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== 滑鼠互動 ====================

function getNodeAt(x, y) {
    for (const node of nodes) {
        const dx = node.x - x;
        const dy = node.y - y;
        if (dx * dx + dy * dy < 400) {
            return node;
        }
    }
    return null;
}

canvas.addEventListener('mousedown', (e) => {
    draggedNode = getNodeAt(e.clientX, e.clientY);
    if (draggedNode) {
        draggedNode.fixed = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (draggedNode) {
        draggedNode.x = e.clientX;
        draggedNode.y = e.clientY;
        draggedNode.oldX = e.clientX;
        draggedNode.oldY = e.clientY;
    }
});

canvas.addEventListener('mouseup', () => {
    if (draggedNode && !draggedNode.wasFixed) {
        // 檢查是否原本就是固定的
        draggedNode.fixed = false;
    }
    draggedNode = null;
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    draggedNode = getNodeAt(touch.clientX, touch.clientY);
    if (draggedNode) {
        draggedNode.fixed = true;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (draggedNode) {
        const touch = e.touches[0];
        draggedNode.x = touch.clientX;
        draggedNode.y = touch.clientY;
        draggedNode.oldX = touch.clientX;
        draggedNode.oldY = touch.clientY;
    }
});

canvas.addEventListener('touchend', () => {
    if (draggedNode) {
        draggedNode.fixed = false;
    }
    draggedNode = null;
});

// ==================== 事件處理 ====================

window.addEventListener('resize', init);

document.getElementById('nodeCount').addEventListener('input', (e) => {
    config.nodeCount = parseInt(e.target.value);
    document.getElementById('nodeCountValue').textContent = config.nodeCount;
    createPreset(config.preset);
});

document.getElementById('stiffness').addEventListener('input', (e) => {
    config.stiffness = parseFloat(e.target.value);
    document.getElementById('stiffnessValue').textContent = config.stiffness.toFixed(2);
});

document.getElementById('damping').addEventListener('input', (e) => {
    config.damping = parseFloat(e.target.value);
    document.getElementById('dampingValue').textContent = config.damping.toFixed(2);
});

document.getElementById('gravity').addEventListener('input', (e) => {
    config.gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = config.gravity.toFixed(1);
});

document.getElementById('preset').addEventListener('change', (e) => {
    config.preset = e.target.value;
    createPreset(config.preset);
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
