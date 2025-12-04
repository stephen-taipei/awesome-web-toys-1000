const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let nodes = [];
let numNodes = 20;
let elasticity = 0.1;
let damping = 0.95;
let restLength = 15;

let draggingNode = null;
let pins = [];

class Node {
    constructor(x, y, pinned = false) {
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.pinned = pinned;
    }

    update() {
        if (this.pinned) return;

        const vx = (this.x - this.oldX) * damping;
        const vy = (this.y - this.oldY) * damping;

        this.oldX = this.x;
        this.oldY = this.y;

        this.x += vx;
        this.y += vy;

        // Gravity
        this.y += 0.2;

        // Boundaries
        if (this.x < 10) {
            this.x = 10;
            this.oldX = this.x + vx * 0.5;
        }
        if (this.x > width - 10) {
            this.x = width - 10;
            this.oldX = this.x + vx * 0.5;
        }
        if (this.y < 10) {
            this.y = 10;
            this.oldY = this.y + vy * 0.5;
        }
        if (this.y > height - 10) {
            this.y = height - 10;
            this.oldY = this.y + vy * 0.5;
        }
    }
}

function createRubberBand() {
    nodes = [];
    pins = [0, numNodes - 1]; // Pin first and last nodes

    const startX = width * 0.3;
    const endX = width * 0.7;
    const y = height * 0.3;

    for (let i = 0; i < numNodes; i++) {
        const t = i / (numNodes - 1);
        const x = startX + (endX - startX) * t;
        const pinned = pins.includes(i);
        nodes.push(new Node(x, y, pinned));
    }

    restLength = (endX - startX) / (numNodes - 1);
}

function constrainNodes() {
    for (let iteration = 0; iteration < 5; iteration++) {
        for (let i = 0; i < nodes.length - 1; i++) {
            const n1 = nodes[i];
            const n2 = nodes[i + 1];

            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist === 0) continue;

            const diff = (dist - restLength) / dist;

            // Elastic force
            const moveX = dx * diff * elasticity;
            const moveY = dy * diff * elasticity;

            if (!n1.pinned) {
                n1.x += moveX;
                n1.y += moveY;
            }
            if (!n2.pinned) {
                n2.x -= moveX;
                n2.y -= moveY;
            }
        }
    }
}

function getTotalLength() {
    let length = 0;
    for (let i = 0; i < nodes.length - 1; i++) {
        const dx = nodes[i + 1].x - nodes[i].x;
        const dy = nodes[i + 1].y - nodes[i].y;
        length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
}

function getTension() {
    let totalTension = 0;
    for (let i = 0; i < nodes.length - 1; i++) {
        const dx = nodes[i + 1].x - nodes[i].x;
        const dy = nodes[i + 1].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        totalTension += Math.abs(dist - restLength);
    }
    return totalTension / (nodes.length - 1);
}

function drawRubberBand() {
    const tension = getTension();
    const maxTension = 50;
    const tensionRatio = Math.min(tension / maxTension, 1);

    // Draw shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(nodes[0].x + 4, nodes[0].y + 4);
    for (let i = 1; i < nodes.length; i++) {
        ctx.lineTo(nodes[i].x + 4, nodes[i].y + 4);
    }
    ctx.stroke();

    // Draw rubber band with tension color
    const r = Math.round(200 + tensionRatio * 55);
    const g = Math.round(100 - tensionRatio * 50);
    const b = Math.round(100 - tensionRatio * 50);

    // Outer stroke
    ctx.strokeStyle = `rgb(${r - 40}, ${g - 20}, ${b - 20})`;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
        ctx.lineTo(nodes[i].x, nodes[i].y);
    }
    ctx.stroke();

    // Inner highlight
    ctx.strokeStyle = `rgb(${Math.min(255, r + 30)}, ${g + 20}, ${b + 20})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y - 2);
    for (let i = 1; i < nodes.length; i++) {
        ctx.lineTo(nodes[i].x, nodes[i].y - 2);
    }
    ctx.stroke();

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (node.pinned) {
            // Draw pin
            ctx.fillStyle = '#666';
            ctx.beginPath();
            ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#888';
            ctx.beginPath();
            ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#aaa';
            ctx.beginPath();
            ctx.arc(node.x - 2, node.y - 2, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createRubberBand();
}

function updateStats() {
    document.getElementById('tension').textContent = getTension().toFixed(1);
    document.getElementById('length').textContent = getTotalLength().toFixed(0) + ' px';
}

function animate() {
    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#2d2d3a');
    bgGradient.addColorStop(1, '#1a1a24');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Update physics
    for (const node of nodes) {
        node.update();
    }
    constrainNodes();

    // Draw
    drawRubberBand();
    updateStats();

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest node
    let closest = null;
    let closestDist = 30;

    for (const node of nodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < closestDist) {
            closestDist = dist;
            closest = node;
        }
    }

    if (closest) {
        draggingNode = closest;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!draggingNode) return;

    const rect = canvas.getBoundingClientRect();
    draggingNode.x = e.clientX - rect.left;
    draggingNode.y = e.clientY - rect.top;
    draggingNode.oldX = draggingNode.x;
    draggingNode.oldY = draggingNode.y;
});

canvas.addEventListener('mouseup', () => {
    draggingNode = null;
});

canvas.addEventListener('mouseleave', () => {
    draggingNode = null;
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    let closest = null;
    let closestDist = 40;

    for (const node of nodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < closestDist) {
            closestDist = dist;
            closest = node;
        }
    }

    if (closest) {
        draggingNode = closest;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!draggingNode) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    draggingNode.x = touch.clientX - rect.left;
    draggingNode.y = touch.clientY - rect.top;
    draggingNode.oldX = draggingNode.x;
    draggingNode.oldY = draggingNode.y;
});

canvas.addEventListener('touchend', () => {
    draggingNode = null;
});

// Control listeners
document.getElementById('elasticitySlider').addEventListener('input', (e) => {
    elasticity = parseFloat(e.target.value);
    document.getElementById('elasticityValue').textContent = elasticity.toFixed(2);
});

document.getElementById('dampingSlider').addEventListener('input', (e) => {
    damping = parseFloat(e.target.value);
    document.getElementById('dampingValue').textContent = damping.toFixed(2);
});

document.getElementById('nodesSlider').addEventListener('input', (e) => {
    numNodes = parseInt(e.target.value);
    document.getElementById('nodesValue').textContent = numNodes;
    createRubberBand();
});

document.getElementById('resetBtn').addEventListener('click', createRubberBand);

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
