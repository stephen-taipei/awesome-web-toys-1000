const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let dominoes = [];
let gravity = 0.5;
let spacing = 30;
let placementMode = 'single';
let groundY;

// For line/curve placement
let isDrawing = false;
let drawPoints = [];

const dominoWidth = 8;
const dominoHeight = 40;
const dominoColors = ['#f5f5dc', '#ffe4b5', '#ffdab9', '#ffe4c4', '#ffefd5'];

class Domino {
    constructor(x, y, angle = 0) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.angularVelocity = 0;
        this.width = dominoWidth;
        this.height = dominoHeight;
        this.color = dominoColors[Math.floor(Math.random() * dominoColors.length)];
        this.isFalling = false;
        this.hasFallen = false;
    }

    update() {
        if (!this.isFalling && !this.hasFallen) return;

        // Apply gravity torque
        if (this.isFalling) {
            const torque = gravity * 0.02 * Math.cos(this.angle);
            this.angularVelocity += torque;
            this.angularVelocity *= 0.995; // Damping
            this.angle += this.angularVelocity;

            // Check if fallen
            if (Math.abs(this.angle) > Math.PI / 2 - 0.1) {
                this.angle = Math.sign(this.angle) * (Math.PI / 2 - 0.05);
                this.angularVelocity = 0;
                this.isFalling = false;
                this.hasFallen = true;
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(-this.width / 2 + 3, -this.height + 3, this.width, this.height);

        // Main body
        const gradient = ctx.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
        gradient.addColorStop(0, this.darkenColor(this.color, 10));
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 20));

        ctx.fillStyle = gradient;
        ctx.fillRect(-this.width / 2, -this.height, this.width, this.height);

        // Border
        ctx.strokeStyle = this.darkenColor(this.color, 40);
        ctx.lineWidth = 1;
        ctx.strokeRect(-this.width / 2, -this.height, this.width, this.height);

        // Dots pattern
        ctx.fillStyle = this.darkenColor(this.color, 50);
        const dotRadius = 2;

        // Top dots
        ctx.beginPath();
        ctx.arc(0, -this.height + 8, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        // Middle dots
        ctx.beginPath();
        ctx.arc(-2, -this.height / 2, dotRadius, 0, Math.PI * 2);
        ctx.arc(2, -this.height / 2, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        // Bottom dots
        ctx.beginPath();
        ctx.arc(0, -8, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    darkenColor(color, percent) {
        // Convert named colors to hex
        const tempElem = document.createElement('div');
        tempElem.style.color = color;
        document.body.appendChild(tempElem);
        const computedColor = getComputedStyle(tempElem).color;
        document.body.removeChild(tempElem);

        const match = computedColor.match(/\d+/g);
        if (!match) return color;

        const R = Math.max(0, parseInt(match[0]) - Math.round(2.55 * percent));
        const G = Math.max(0, parseInt(match[1]) - Math.round(2.55 * percent));
        const B = Math.max(0, parseInt(match[2]) - Math.round(2.55 * percent));
        return `rgb(${R}, ${G}, ${B})`;
    }

    getTopPosition() {
        const topX = this.x + Math.sin(this.angle) * this.height;
        const topY = this.y - Math.cos(this.angle) * this.height;
        return { x: topX, y: topY };
    }

    push(direction = 1) {
        if (!this.isFalling && !this.hasFallen) {
            this.isFalling = true;
            this.angularVelocity = direction * 0.05;
        }
    }
}

function checkDominoCollisions() {
    for (let i = 0; i < dominoes.length; i++) {
        const d1 = dominoes[i];
        if (!d1.isFalling) continue;

        const top1 = d1.getTopPosition();

        for (let j = 0; j < dominoes.length; j++) {
            if (i === j) continue;

            const d2 = dominoes[j];
            if (d2.isFalling || d2.hasFallen) continue;

            // Check if d1's top is hitting d2
            const dx = top1.x - d2.x;
            const dy = top1.y - (d2.y - d2.height / 2);

            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < d2.height / 2 + 5) {
                // Determine push direction
                const direction = dx > 0 ? 1 : -1;
                d2.push(direction);
            }
        }
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    groundY = height - 50;
}

function placeDomino(x, y, angle = 0) {
    if (y > groundY - dominoHeight / 2) {
        y = groundY;
    }
    dominoes.push(new Domino(x, groundY, angle));
    updateStats();
}

function placeLineOfDominoes(points) {
    if (points.length < 2) return;

    let totalDist = 0;
    for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        totalDist += Math.sqrt(dx * dx + dy * dy);
    }

    const numDominoes = Math.floor(totalDist / spacing);
    let currentDist = 0;
    let pointIndex = 0;

    for (let i = 0; i < numDominoes; i++) {
        const targetDist = i * spacing;

        while (pointIndex < points.length - 1) {
            const dx = points[pointIndex + 1].x - points[pointIndex].x;
            const dy = points[pointIndex + 1].y - points[pointIndex].y;
            const segmentDist = Math.sqrt(dx * dx + dy * dy);

            if (currentDist + segmentDist >= targetDist) {
                const t = (targetDist - currentDist) / segmentDist;
                const x = points[pointIndex].x + dx * t;
                const angle = Math.atan2(dx, -dy);
                placeDomino(x, groundY, 0);
                break;
            }

            currentDist += segmentDist;
            pointIndex++;
        }
    }
}

function pushFirstDomino() {
    if (dominoes.length > 0) {
        // Find the leftmost domino
        let leftmost = dominoes[0];
        for (const d of dominoes) {
            if (d.x < leftmost.x) leftmost = d;
        }
        leftmost.push(1);
    }
}

function resetDominoes() {
    for (const d of dominoes) {
        d.angle = 0;
        d.angularVelocity = 0;
        d.isFalling = false;
        d.hasFallen = false;
    }
    updateStats();
}

function updateStats() {
    document.getElementById('dominoCount').textContent = dominoes.length;
    const fallen = dominoes.filter(d => d.hasFallen).length;
    document.getElementById('fallenCount').textContent = fallen;
}

function drawGround() {
    // Ground surface
    const groundGradient = ctx.createLinearGradient(0, groundY, 0, height);
    groundGradient.addColorStop(0, '#3a5a3a');
    groundGradient.addColorStop(1, '#2a4a2a');

    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundY, width, height - groundY);

    // Ground line
    ctx.strokeStyle = '#4a7a4a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();
}

function animate() {
    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#1a2a1a');
    bgGradient.addColorStop(1, '#0f1a0f');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    drawGround();

    // Check collisions
    checkDominoCollisions();

    // Update and draw dominoes
    for (const domino of dominoes) {
        domino.update();
    }

    // Sort by position for proper layering
    const sortedDominoes = [...dominoes].sort((a, b) => a.x - b.x);
    for (const domino of sortedDominoes) {
        domino.draw();
    }

    // Draw placement preview
    if (isDrawing && drawPoints.length > 0) {
        ctx.strokeStyle = 'rgba(125, 206, 130, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(drawPoints[0].x, drawPoints[0].y);
        for (let i = 1; i < drawPoints.length; i++) {
            ctx.lineTo(drawPoints[i].x, drawPoints[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    updateStats();
    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (placementMode === 'single') {
        placeDomino(x, y);
    } else {
        isDrawing = true;
        drawPoints = [{ x, y }];
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lastPoint = drawPoints[drawPoints.length - 1];
    const dx = x - lastPoint.x;
    const dy = y - lastPoint.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
        drawPoints.push({ x, y });
    }
});

canvas.addEventListener('mouseup', () => {
    if (isDrawing && drawPoints.length > 1) {
        placeLineOfDominoes(drawPoints);
    }
    isDrawing = false;
    drawPoints = [];
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (placementMode === 'single') {
        placeDomino(x, y);
    } else {
        isDrawing = true;
        drawPoints = [{ x, y }];
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const lastPoint = drawPoints[drawPoints.length - 1];
    const dx = x - lastPoint.x;
    const dy = y - lastPoint.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
        drawPoints.push({ x, y });
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (isDrawing && drawPoints.length > 1) {
        placeLineOfDominoes(drawPoints);
    }
    isDrawing = false;
    drawPoints = [];
});

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        placementMode = btn.dataset.mode;
    });
});

document.getElementById('spacingSlider').addEventListener('input', (e) => {
    spacing = parseInt(e.target.value);
    document.getElementById('spacingValue').textContent = spacing;
});

document.getElementById('gravitySlider').addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = gravity.toFixed(1);
});

document.getElementById('pushBtn').addEventListener('click', pushFirstDomino);

document.getElementById('resetBtn').addEventListener('click', () => {
    dominoes = [];
    updateStats();
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        pushFirstDomino();
    }
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
