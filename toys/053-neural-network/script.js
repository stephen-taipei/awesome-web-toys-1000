/**
 * Neural Network 神經網路
 * Web Toys #053
 *
 * 神經網路結構視覺化
 *
 * 技術重點：
 * - 多層網路結構
 * - 訊號傳遞動畫
 * - 節點激活效果
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('neuralCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    layers: 3,
    neuronsPerLayer: 8,
    signalSpeed: 1.0,
    pulseRate: 2,
    colorScheme: 'neural'
};

let nodes = [];
let connections = [];
let signals = [];
let time = 0;

// 配色方案
const colorSchemes = {
    neural: {
        node: '#6496ff',
        nodeGlow: 'rgba(100, 150, 255, 0.5)',
        connection: 'rgba(100, 150, 255, 0.2)',
        signal: '#c896ff',
        active: '#ff96c8'
    },
    fire: {
        node: '#ff6432',
        nodeGlow: 'rgba(255, 100, 50, 0.5)',
        connection: 'rgba(255, 150, 50, 0.2)',
        signal: '#ffff32',
        active: '#ff3232'
    },
    matrix: {
        node: '#00ff64',
        nodeGlow: 'rgba(0, 255, 100, 0.5)',
        connection: 'rgba(0, 255, 100, 0.15)',
        signal: '#64ff64',
        active: '#ffffff'
    },
    rainbow: {
        node: '#ff6496',
        nodeGlow: 'rgba(255, 100, 150, 0.5)',
        connection: 'rgba(255, 255, 255, 0.15)',
        signal: '#64ffff',
        active: '#ffff64'
    }
};

// ==================== 節點類別 ====================

class Node {
    constructor(x, y, layer, index) {
        this.x = x;
        this.y = y;
        this.layer = layer;
        this.index = index;
        this.activation = 0;
        this.targetActivation = 0;
        this.radius = 12;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
        // 平滑過渡到目標激活值
        this.activation += (this.targetActivation - this.activation) * 0.1;
        this.targetActivation *= 0.95; // 衰減

        // 基礎脈衝
        this.pulsePhase += 0.05;
    }

    draw() {
        const colors = colorSchemes[config.colorScheme];
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 0.8;
        const activeRadius = this.radius + this.activation * 8;

        // 光暈
        if (this.activation > 0.1) {
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, activeRadius * 2
            );
            gradient.addColorStop(0, colors.active);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.globalAlpha = this.activation * 0.5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, activeRadius * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // 外圈光暈
        ctx.fillStyle = colors.nodeGlow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, activeRadius * 1.5 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // 節點主體
        const nodeGradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, activeRadius
        );
        nodeGradient.addColorStop(0, '#ffffff');
        nodeGradient.addColorStop(0.3, colors.node);
        nodeGradient.addColorStop(1, colors.node);

        ctx.fillStyle = nodeGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, activeRadius, 0, Math.PI * 2);
        ctx.fill();

        // 邊框
        ctx.strokeStyle = colors.node;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    activate(strength = 1) {
        this.targetActivation = Math.min(1, this.targetActivation + strength);
    }
}

// ==================== 連接類別 ====================

class Connection {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.weight = Math.random() * 0.5 + 0.5;
        this.activity = 0;
    }

    draw() {
        const colors = colorSchemes[config.colorScheme];

        // 計算線條活動度
        const avgActivation = (this.from.activation + this.to.activation) / 2;
        this.activity = Math.max(this.activity * 0.95, avgActivation);

        // 線條
        ctx.strokeStyle = colors.connection;
        ctx.lineWidth = 1 + this.activity * 3;
        ctx.globalAlpha = 0.3 + this.activity * 0.7;

        ctx.beginPath();
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo(this.to.x, this.to.y);
        ctx.stroke();

        ctx.globalAlpha = 1;
    }
}

// ==================== 訊號類別 ====================

class Signal {
    constructor(connection) {
        this.connection = connection;
        this.progress = 0;
        this.speed = 0.02 * config.signalSpeed;
        this.alive = true;
    }

    update() {
        this.progress += this.speed;

        if (this.progress >= 1) {
            // 到達目標節點
            this.connection.to.activate(0.8);

            // 傳播到下一層
            if (this.connection.to.layer < nodes.length - 1) {
                const nextLayerConnections = connections.filter(
                    c => c.from === this.connection.to
                );
                for (const conn of nextLayerConnections) {
                    if (Math.random() < 0.7) {
                        signals.push(new Signal(conn));
                    }
                }
            }

            this.alive = false;
        }
    }

    draw() {
        const colors = colorSchemes[config.colorScheme];

        const x = this.connection.from.x + (this.connection.to.x - this.connection.from.x) * this.progress;
        const y = this.connection.from.y + (this.connection.to.y - this.connection.from.y) * this.progress;

        // 訊號光點
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
        gradient.addColorStop(0, colors.signal);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();

        // 核心
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==================== 初始化 ====================

function init() {
    resizeCanvas();

    nodes = [];
    connections = [];
    signals = [];

    const totalLayers = config.layers + 2; // 輸入層 + 隱藏層 + 輸出層
    const layerSpacing = canvas.width / (totalLayers + 1);

    // 創建各層節點
    for (let layer = 0; layer < totalLayers; layer++) {
        const layerNodes = [];
        let neuronsInLayer;

        if (layer === 0) {
            neuronsInLayer = Math.ceil(config.neuronsPerLayer * 0.6); // 輸入層
        } else if (layer === totalLayers - 1) {
            neuronsInLayer = Math.ceil(config.neuronsPerLayer * 0.4); // 輸出層
        } else {
            neuronsInLayer = config.neuronsPerLayer; // 隱藏層
        }

        const neuronSpacing = canvas.height / (neuronsInLayer + 1);

        for (let i = 0; i < neuronsInLayer; i++) {
            const x = layerSpacing * (layer + 1);
            const y = neuronSpacing * (i + 1);
            layerNodes.push(new Node(x, y, layer, i));
        }

        nodes.push(layerNodes);
    }

    // 創建連接
    for (let layer = 0; layer < nodes.length - 1; layer++) {
        for (const fromNode of nodes[layer]) {
            for (const toNode of nodes[layer + 1]) {
                // 不是所有節點都連接
                if (Math.random() < 0.7) {
                    connections.push(new Connection(fromNode, toNode));
                }
            }
        }
    }

    updateDisplay();
}

// ==================== 發送脈衝 ====================

function sendPulse() {
    // 從輸入層發送
    for (const node of nodes[0]) {
        if (Math.random() < 0.5) {
            node.activate(1);

            // 創建訊號
            const outConnections = connections.filter(c => c.from === node);
            for (const conn of outConnections) {
                signals.push(new Signal(conn));
            }
        }
    }
}

// ==================== 更新顯示 ====================

function updateDisplay() {
    let totalNodes = 0;
    for (const layer of nodes) {
        totalNodes += layer.length;
    }
    document.getElementById('nodeDisplay').textContent = totalNodes;
    document.getElementById('connectionDisplay').textContent = connections.length;
}

// ==================== 動畫迴圈 ====================

function animate() {
    // 清除畫布
    ctx.fillStyle = 'rgba(10, 10, 21, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    time += 0.016;

    // 自動脈衝
    if (Math.random() < 0.02 * config.pulseRate) {
        const randomInputNode = nodes[0][Math.floor(Math.random() * nodes[0].length)];
        randomInputNode.activate(0.8);

        const outConnections = connections.filter(c => c.from === randomInputNode);
        for (const conn of outConnections) {
            if (Math.random() < 0.5) {
                signals.push(new Signal(conn));
            }
        }
    }

    // 繪製連接
    for (const conn of connections) {
        conn.draw();
    }

    // 更新並繪製訊號
    signals = signals.filter(s => s.alive);
    for (const signal of signals) {
        signal.update();
        signal.draw();
    }

    // 更新並繪製節點
    for (const layer of nodes) {
        for (const node of layer) {
            node.update();
            node.draw();
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

document.getElementById('layers').addEventListener('input', (e) => {
    config.layers = parseInt(e.target.value);
    document.getElementById('layersValue').textContent = config.layers;
    init();
});

document.getElementById('neuronsPerLayer').addEventListener('input', (e) => {
    config.neuronsPerLayer = parseInt(e.target.value);
    document.getElementById('neuronsPerLayerValue').textContent = config.neuronsPerLayer;
    init();
});

document.getElementById('signalSpeed').addEventListener('input', (e) => {
    config.signalSpeed = parseFloat(e.target.value);
    document.getElementById('signalSpeedValue').textContent = config.signalSpeed.toFixed(1);
});

document.getElementById('pulseRate').addEventListener('input', (e) => {
    config.pulseRate = parseFloat(e.target.value);
    document.getElementById('pulseRateValue').textContent = config.pulseRate.toFixed(1);
});

document.getElementById('colorScheme').addEventListener('change', (e) => {
    config.colorScheme = e.target.value;
});

document.getElementById('resetBtn').addEventListener('click', init);

document.getElementById('pulseBtn').addEventListener('click', sendPulse);

// 點擊節點發送訊號
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 尋找最近的節點
    let closestNode = null;
    let closestDist = 50;

    for (const layer of nodes) {
        for (const node of layer) {
            const dx = node.x - x;
            const dy = node.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < closestDist) {
                closestDist = dist;
                closestNode = node;
            }
        }
    }

    if (closestNode) {
        closestNode.activate(1);

        // 發送訊號
        const outConnections = connections.filter(c => c.from === closestNode);
        for (const conn of outConnections) {
            signals.push(new Signal(conn));
        }
    }
});

// ==================== 啟動 ====================

init();
requestAnimationFrame(animate);
