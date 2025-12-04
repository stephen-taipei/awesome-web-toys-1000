const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let stiffness = 0.08;
let recovery = 0.05;
let squeezeCount = 0;
let isSqueezing = false;
let squeezeStartTime = 0;

const ballColors = [
    { main: '#ef4444', light: '#fca5a5', dark: '#b91c1c' },
    { main: '#f97316', light: '#fdba74', dark: '#c2410c' },
    { main: '#eab308', light: '#fde047', dark: '#a16207' },
    { main: '#22c55e', light: '#86efac', dark: '#15803d' },
    { main: '#3b82f6', light: '#93c5fd', dark: '#1d4ed8' },
    { main: '#8b5cf6', light: '#c4b5fd', dark: '#6d28d9' },
    { main: '#ec4899', light: '#f9a8d4', dark: '#be185d' }
];

let currentColorIndex = 0;

// Ball properties
let ball = {
    x: 0,
    y: 0,
    baseRadius: 120,
    nodes: [],
    innerNodes: [],
    squeezePressure: 0,
    squeezePoint: null
};

class Node {
    constructor(x, y, baseX, baseY) {
        this.x = x;
        this.y = y;
        this.baseX = baseX;
        this.baseY = baseY;
        this.vx = 0;
        this.vy = 0;
    }

    update(targetX, targetY) {
        // Spring force towards target
        const dx = targetX - this.x;
        const dy = targetY - this.y;

        this.vx += dx * recovery;
        this.vy += dy * recovery;

        // Damping
        this.vx *= 0.9;
        this.vy *= 0.9;

        // Update position
        this.x += this.vx;
        this.y += this.vy;
    }
}

function initBall() {
    ball.x = width / 2;
    ball.y = height / 2;
    ball.nodes = [];
    ball.innerNodes = [];
    ball.squeezePressure = 0;
    ball.squeezePoint = null;

    // Create outer nodes
    const outerNodeCount = 32;
    for (let i = 0; i < outerNodeCount; i++) {
        const angle = (i / outerNodeCount) * Math.PI * 2;
        const x = ball.x + Math.cos(angle) * ball.baseRadius;
        const y = ball.y + Math.sin(angle) * ball.baseRadius;
        ball.nodes.push(new Node(x, y, x, y));
    }

    // Create inner nodes for volume preservation effect
    const innerNodeCount = 16;
    const innerRadius = ball.baseRadius * 0.5;
    for (let i = 0; i < innerNodeCount; i++) {
        const angle = (i / innerNodeCount) * Math.PI * 2;
        const x = ball.x + Math.cos(angle) * innerRadius;
        const y = ball.y + Math.sin(angle) * innerRadius;
        ball.innerNodes.push(new Node(x, y, x, y));
    }
}

function squeezeAtPoint(px, py, pressure) {
    const dx = px - ball.x;
    const dy = py - ball.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > ball.baseRadius * 1.5) return;

    // Calculate squeeze direction
    const dirX = dx / (dist || 1);
    const dirY = dy / (dist || 1);

    // Apply squeeze to outer nodes
    for (let i = 0; i < ball.nodes.length; i++) {
        const node = ball.nodes[i];
        const nodeDx = node.baseX - ball.x;
        const nodeDy = node.baseY - ball.y;
        const nodeAngle = Math.atan2(nodeDy, nodeDx);
        const squeezeAngle = Math.atan2(dirY, dirX);

        // Calculate how aligned this node is with squeeze direction
        let angleDiff = Math.abs(nodeAngle - squeezeAngle);
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

        const alignment = Math.cos(angleDiff);

        if (alignment > 0) {
            // Push inward on squeeze side
            const pushAmount = pressure * alignment * stiffness * 50;
            node.x = node.baseX - dirX * pushAmount;
            node.y = node.baseY - dirY * pushAmount;
        } else {
            // Bulge outward on opposite side (volume preservation)
            const bulgeAmount = pressure * (-alignment) * stiffness * 30;
            node.x = node.baseX - dirX * bulgeAmount;
            node.y = node.baseY - dirY * bulgeAmount;
        }
    }

    // Update inner nodes for internal deformation
    for (let i = 0; i < ball.innerNodes.length; i++) {
        const node = ball.innerNodes[i];
        const nodeDx = node.baseX - ball.x;
        const nodeDy = node.baseY - ball.y;
        const nodeAngle = Math.atan2(nodeDy, nodeDx);
        const squeezeAngle = Math.atan2(dirY, dirX);

        let angleDiff = Math.abs(nodeAngle - squeezeAngle);
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

        const alignment = Math.cos(angleDiff);
        const pushAmount = pressure * alignment * stiffness * 25;

        node.x = node.baseX - dirX * pushAmount;
        node.y = node.baseY - dirY * pushAmount;
    }

    ball.squeezePressure = pressure;
    ball.squeezePoint = { x: px, y: py };
}

function releaseSqueeze() {
    // Animate nodes back to rest position
    for (const node of ball.nodes) {
        node.update(node.baseX, node.baseY);
    }
    for (const node of ball.innerNodes) {
        node.update(node.baseX, node.baseY);
    }

    ball.squeezePressure *= 0.9;
    if (ball.squeezePressure < 0.01) {
        ball.squeezePressure = 0;
        ball.squeezePoint = null;
    }
}

function drawBall() {
    const color = ballColors[currentColorIndex];

    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    drawSmoothShape(ball.nodes.map(n => ({ x: n.x + 15, y: n.y + 15 })));
    ctx.fill();

    // Create gradient
    const gradient = ctx.createRadialGradient(
        ball.x - ball.baseRadius * 0.3, ball.y - ball.baseRadius * 0.3, 0,
        ball.x, ball.y, ball.baseRadius * 1.3
    );
    gradient.addColorStop(0, color.light);
    gradient.addColorStop(0.4, color.main);
    gradient.addColorStop(1, color.dark);

    // Draw main ball body
    ctx.fillStyle = gradient;
    ctx.beginPath();
    drawSmoothShape(ball.nodes);
    ctx.fill();

    // Draw internal texture lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    drawSmoothShape(ball.innerNodes);
    ctx.stroke();

    // Draw squeeze deformation patterns
    if (ball.squeezePressure > 0.1) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${ball.squeezePressure * 0.3})`;
        ctx.lineWidth = 3;

        // Draw stress lines
        for (let i = 0; i < 5; i++) {
            const offset = (i - 2) * 15;
            ctx.beginPath();
            ctx.moveTo(ball.x - 50 + offset, ball.y - 40);
            ctx.quadraticCurveTo(
                ball.x + offset + ball.squeezePressure * 20,
                ball.y,
                ball.x - 50 + offset,
                ball.y + 40
            );
            ctx.stroke();
        }
    }

    // Draw highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.ellipse(
        ball.x - ball.baseRadius * 0.35,
        ball.y - ball.baseRadius * 0.35,
        ball.baseRadius * 0.25,
        ball.baseRadius * 0.15,
        -0.5, 0, Math.PI * 2
    );
    ctx.fill();

    // Draw smaller highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(
        ball.x - ball.baseRadius * 0.45,
        ball.y - ball.baseRadius * 0.45,
        ball.baseRadius * 0.08,
        ball.baseRadius * 0.05,
        -0.5, 0, Math.PI * 2
    );
    ctx.fill();

    // Draw squeeze indicator
    if (ball.squeezePoint && ball.squeezePressure > 0.1) {
        ctx.fillStyle = `rgba(255, 255, 255, ${ball.squeezePressure * 0.5})`;
        ctx.beginPath();
        ctx.arc(ball.squeezePoint.x, ball.squeezePoint.y, 20 * ball.squeezePressure, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSmoothShape(nodes) {
    if (nodes.length < 3) return;

    ctx.moveTo(
        (nodes[nodes.length - 1].x + nodes[0].x) / 2,
        (nodes[nodes.length - 1].y + nodes[0].y) / 2
    );

    for (let i = 0; i < nodes.length; i++) {
        const curr = nodes[i];
        const next = nodes[(i + 1) % nodes.length];

        const midX = (curr.x + next.x) / 2;
        const midY = (curr.y + next.y) / 2;

        ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
    }

    ctx.closePath();
}

function drawBackground() {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#fef9c3');
    gradient.addColorStop(0.5, '#fef08a');
    gradient.addColorStop(1, '#fde047');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(width * 0.1, height * 0.2, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.7, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width * 0.7, height * 0.15, 50, 0, Math.PI * 2);
    ctx.fill();
}

function drawPressureMeter() {
    const meterX = width - 80;
    const meterY = height / 2 - 100;
    const meterWidth = 30;
    const meterHeight = 200;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(meterX, meterY, meterWidth, meterHeight);

    // Pressure level
    const pressureHeight = meterHeight * ball.squeezePressure;
    const pressureGradient = ctx.createLinearGradient(meterX, meterY + meterHeight, meterX, meterY);
    pressureGradient.addColorStop(0, '#22c55e');
    pressureGradient.addColorStop(0.5, '#fbbf24');
    pressureGradient.addColorStop(1, '#ef4444');

    ctx.fillStyle = pressureGradient;
    ctx.fillRect(meterX, meterY + meterHeight - pressureHeight, meterWidth, pressureHeight);

    // Border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('壓力', meterX + meterWidth / 2, meterY - 10);
}

function updateStats() {
    document.getElementById('squeezeCount').textContent = squeezeCount;
    document.getElementById('pressureLevel').textContent = Math.round(ball.squeezePressure * 100) + '%';
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initBall();
}

let mouseX = 0, mouseY = 0;
let mouseDown = false;

function animate() {
    drawBackground();

    if (mouseDown) {
        const timeSqueeze = (Date.now() - squeezeStartTime) / 1000;
        const pressure = Math.min(timeSqueeze * 2, 1);
        squeezeAtPoint(mouseX, mouseY, pressure);
    } else {
        releaseSqueeze();
    }

    drawBall();
    drawPressureMeter();
    updateStats();

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    // Check if clicking on ball
    const dx = mouseX - ball.x;
    const dy = mouseY - ball.y;
    if (dx * dx + dy * dy < ball.baseRadius * ball.baseRadius * 1.5) {
        mouseDown = true;
        squeezeStartTime = Date.now();
        squeezeCount++;
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mouseup', () => {
    mouseDown = false;
});

canvas.addEventListener('mouseleave', () => {
    mouseDown = false;
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;

    const dx = mouseX - ball.x;
    const dy = mouseY - ball.y;
    if (dx * dx + dy * dy < ball.baseRadius * ball.baseRadius * 1.5) {
        mouseDown = true;
        squeezeStartTime = Date.now();
        squeezeCount++;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
});

canvas.addEventListener('touchend', () => {
    mouseDown = false;
});

document.getElementById('colorBtn').addEventListener('click', () => {
    currentColorIndex = (currentColorIndex + 1) % ballColors.length;
});

document.getElementById('resetBtn').addEventListener('click', () => {
    squeezeCount = 0;
    initBall();
    updateStats();
});

document.getElementById('stiffnessSlider').addEventListener('input', (e) => {
    stiffness = parseFloat(e.target.value);
    document.getElementById('stiffnessValue').textContent = stiffness.toFixed(2);
});

document.getElementById('recoverySlider').addEventListener('input', (e) => {
    recovery = parseFloat(e.target.value);
    document.getElementById('recoveryValue').textContent = recovery.toFixed(2);
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
