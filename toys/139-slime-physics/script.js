const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let slimes = [];
let dragging = null;
let mouseX = 0, mouseY = 0;

let stiffness = 0.03;
let damping = 0.95;
let gravity = 0.3;

const slimeColors = [
    { main: '#22c55e', light: '#86efac', dark: '#15803d', eye: '#000' },
    { main: '#3b82f6', light: '#93c5fd', dark: '#1d4ed8', eye: '#000' },
    { main: '#ec4899', light: '#f9a8d4', dark: '#be185d', eye: '#000' },
    { main: '#f97316', light: '#fdba74', dark: '#c2410c', eye: '#000' },
    { main: '#8b5cf6', light: '#c4b5fd', dark: '#6d28d9', eye: '#000' },
    { main: '#ef4444', light: '#fca5a5', dark: '#b91c1c', eye: '#000' }
];

class SlimeNode {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.pinned = false;
    }

    update() {
        if (this.pinned) return;

        const vx = (this.x - this.oldX) * damping;
        const vy = (this.y - this.oldY) * damping;

        this.oldX = this.x;
        this.oldY = this.y;

        this.x += vx;
        this.y += vy + gravity;
    }

    constrain() {
        if (this.x < 10) {
            this.x = 10;
            this.oldX = this.x + (this.x - this.oldX) * 0.5;
        }
        if (this.x > width - 10) {
            this.x = width - 10;
            this.oldX = this.x + (this.x - this.oldX) * 0.5;
        }
        if (this.y < 10) {
            this.y = 10;
            this.oldY = this.y + (this.y - this.oldY) * 0.5;
        }
        if (this.y > height - 10) {
            this.y = height - 10;
            this.oldY = this.y + (this.y - this.oldY) * 0.5;
        }
    }
}

class Slime {
    constructor(x, y, radius = 60) {
        this.centerX = x;
        this.centerY = y;
        this.radius = radius;
        this.nodes = [];
        this.springs = [];
        this.color = slimeColors[Math.floor(Math.random() * slimeColors.length)];
        this.eyeOffset = { x: 0, y: 0 };
        this.blinkTimer = Math.random() * 200;

        // Create outer nodes in a circle
        const nodeCount = 16;
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            const nx = x + Math.cos(angle) * radius;
            const ny = y + Math.sin(angle) * radius;
            this.nodes.push(new SlimeNode(nx, ny));
        }

        // Create center node
        this.centerNode = new SlimeNode(x, y);

        // Create springs between adjacent outer nodes
        for (let i = 0; i < nodeCount; i++) {
            const nextI = (i + 1) % nodeCount;
            this.springs.push({
                a: this.nodes[i],
                b: this.nodes[nextI],
                length: this.getDistance(this.nodes[i], this.nodes[nextI])
            });
        }

        // Create springs from center to outer nodes
        for (let i = 0; i < nodeCount; i++) {
            this.springs.push({
                a: this.centerNode,
                b: this.nodes[i],
                length: radius
            });
        }

        // Create cross springs for structure
        for (let i = 0; i < nodeCount; i++) {
            const oppositeI = (i + nodeCount / 2) % nodeCount;
            this.springs.push({
                a: this.nodes[i],
                b: this.nodes[oppositeI],
                length: radius * 2
            });
        }
    }

    getDistance(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    update() {
        // Update all nodes
        this.centerNode.update();
        for (const node of this.nodes) {
            node.update();
        }

        // Apply spring constraints multiple times for stability
        for (let iter = 0; iter < 5; iter++) {
            for (const spring of this.springs) {
                const dx = spring.b.x - spring.a.x;
                const dy = spring.b.y - spring.a.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist === 0) continue;

                const diff = (spring.length - dist) / dist;
                const offsetX = dx * diff * stiffness * 10;
                const offsetY = dy * diff * stiffness * 10;

                if (!spring.a.pinned) {
                    spring.a.x -= offsetX;
                    spring.a.y -= offsetY;
                }
                if (!spring.b.pinned) {
                    spring.b.x += offsetX;
                    spring.b.y += offsetY;
                }
            }
        }

        // Constrain nodes to canvas
        this.centerNode.constrain();
        for (const node of this.nodes) {
            node.constrain();
        }

        // Update eye tracking towards mouse
        const cx = this.centerNode.x;
        const cy = this.centerNode.y;
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.eyeOffset.x += ((dx / dist) * 5 - this.eyeOffset.x) * 0.1;
            this.eyeOffset.y += ((dy / dist) * 5 - this.eyeOffset.y) * 0.1;
        }

        // Blink timer
        this.blinkTimer--;
        if (this.blinkTimer <= 0) {
            this.blinkTimer = 150 + Math.random() * 100;
        }
    }

    draw() {
        const cx = this.centerNode.x;
        const cy = this.centerNode.y;

        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.moveTo(this.nodes[0].x + 10, this.nodes[0].y + 10);
        for (let i = 1; i < this.nodes.length; i++) {
            const prev = this.nodes[i - 1];
            const curr = this.nodes[i];
            const next = this.nodes[(i + 1) % this.nodes.length];

            const cpx = curr.x + 10;
            const cpy = curr.y + 10;

            ctx.quadraticCurveTo(cpx, cpy, (cpx + next.x + 10) / 2, (cpy + next.y + 10) / 2);
        }
        ctx.closePath();
        ctx.fill();

        // Draw body with gradient
        const gradient = ctx.createRadialGradient(
            cx - this.radius * 0.3, cy - this.radius * 0.3, 0,
            cx, cy, this.radius * 1.5
        );
        gradient.addColorStop(0, this.color.light);
        gradient.addColorStop(0.5, this.color.main);
        gradient.addColorStop(1, this.color.dark);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(this.nodes[0].x, this.nodes[0].y);

        // Smooth curve through nodes
        for (let i = 0; i < this.nodes.length; i++) {
            const curr = this.nodes[i];
            const next = this.nodes[(i + 1) % this.nodes.length];

            const midX = (curr.x + next.x) / 2;
            const midY = (curr.y + next.y) / 2;

            ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
        }

        ctx.closePath();
        ctx.fill();

        // Draw highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(
            cx - this.radius * 0.25,
            cy - this.radius * 0.25,
            this.radius * 0.3,
            this.radius * 0.2,
            -0.5, 0, Math.PI * 2
        );
        ctx.fill();

        // Draw eyes
        const eyeSpacing = 15;
        const eyeY = cy - 5;
        const isBlinking = this.blinkTimer < 10;

        // Left eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(cx - eyeSpacing + this.eyeOffset.x * 0.5, eyeY + this.eyeOffset.y * 0.5,
            isBlinking ? 8 : 10, isBlinking ? 2 : 12, 0, 0, Math.PI * 2);
        ctx.fill();

        if (!isBlinking) {
            ctx.fillStyle = this.color.eye;
            ctx.beginPath();
            ctx.arc(cx - eyeSpacing + this.eyeOffset.x, eyeY + this.eyeOffset.y, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(cx - eyeSpacing + this.eyeOffset.x - 2, eyeY + this.eyeOffset.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Right eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(cx + eyeSpacing + this.eyeOffset.x * 0.5, eyeY + this.eyeOffset.y * 0.5,
            isBlinking ? 8 : 10, isBlinking ? 2 : 12, 0, 0, Math.PI * 2);
        ctx.fill();

        if (!isBlinking) {
            ctx.fillStyle = this.color.eye;
            ctx.beginPath();
            ctx.arc(cx + eyeSpacing + this.eyeOffset.x, eyeY + this.eyeOffset.y, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(cx + eyeSpacing + this.eyeOffset.x - 2, eyeY + this.eyeOffset.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw mouth
        ctx.strokeStyle = this.color.dark;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy + 15, 10, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
    }

    contains(x, y) {
        const dx = x - this.centerNode.x;
        const dy = y - this.centerNode.y;
        return dx * dx + dy * dy < this.radius * this.radius * 1.5;
    }

    getClosestNode(x, y) {
        let closest = this.centerNode;
        let minDist = Infinity;

        for (const node of this.nodes) {
            const dx = x - node.x;
            const dy = y - node.y;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
                minDist = dist;
                closest = node;
            }
        }

        const cdx = x - this.centerNode.x;
        const cdy = y - this.centerNode.y;
        const centerDist = cdx * cdx + cdy * cdy;
        if (centerDist < minDist) {
            closest = this.centerNode;
        }

        return closest;
    }
}

function checkSlimeCollision(s1, s2) {
    // Simple collision between slime centers
    const dx = s2.centerNode.x - s1.centerNode.x;
    const dy = s2.centerNode.y - s1.centerNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = s1.radius + s2.radius;

    if (dist < minDist && dist > 0) {
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;

        // Push centers apart
        s1.centerNode.x -= nx * overlap * 0.25;
        s1.centerNode.y -= ny * overlap * 0.25;
        s2.centerNode.x += nx * overlap * 0.25;
        s2.centerNode.y += ny * overlap * 0.25;

        // Push overlapping outer nodes
        for (const n1 of s1.nodes) {
            for (const n2 of s2.nodes) {
                const ndx = n2.x - n1.x;
                const ndy = n2.y - n1.y;
                const nDist = Math.sqrt(ndx * ndx + ndy * ndy);

                if (nDist < 20 && nDist > 0) {
                    const nOverlap = 20 - nDist;
                    n1.x -= (ndx / nDist) * nOverlap * 0.3;
                    n1.y -= (ndy / nDist) * nOverlap * 0.3;
                    n2.x += (ndx / nDist) * nOverlap * 0.3;
                    n2.y += (ndy / nDist) * nOverlap * 0.3;
                }
            }
        }
    }
}

function drawBackground() {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#d1fae5');
    gradient.addColorStop(1, '#a7f3d0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function addSlime(x, y) {
    if (slimes.length < 10) {
        const radius = 50 + Math.random() * 30;
        slimes.push(new Slime(
            x || width / 2 + (Math.random() - 0.5) * 200,
            y || height / 2 + (Math.random() - 0.5) * 200,
            radius
        ));
        updateStats();
    }
}

function updateStats() {
    document.getElementById('slimeCount').textContent = slimes.length;
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function animate() {
    drawBackground();

    // Update slimes
    for (const slime of slimes) {
        slime.update();
    }

    // Check slime-slime collisions
    for (let i = 0; i < slimes.length; i++) {
        for (let j = i + 1; j < slimes.length; j++) {
            checkSlimeCollision(slimes[i], slimes[j]);
        }
    }

    // Draw slimes
    for (const slime of slimes) {
        slime.draw();
    }

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const slime of slimes) {
        if (slime.contains(x, y)) {
            const node = slime.getClosestNode(x, y);
            node.pinned = true;
            dragging = { slime, node };
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (dragging) {
        dragging.node.x = mouseX;
        dragging.node.y = mouseY;
    }
});

canvas.addEventListener('mouseup', () => {
    if (dragging) {
        dragging.node.pinned = false;
        dragging = null;
    }
});

canvas.addEventListener('mouseleave', () => {
    if (dragging) {
        dragging.node.pinned = false;
        dragging = null;
    }
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    mouseX = x;
    mouseY = y;

    for (const slime of slimes) {
        if (slime.contains(x, y)) {
            const node = slime.getClosestNode(x, y);
            node.pinned = true;
            dragging = { slime, node };
            break;
        }
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;

    if (dragging) {
        dragging.node.x = mouseX;
        dragging.node.y = mouseY;
    }
});

canvas.addEventListener('touchend', () => {
    if (dragging) {
        dragging.node.pinned = false;
        dragging = null;
    }
});

document.getElementById('addBtn').addEventListener('click', () => {
    addSlime();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    slimes = [];
    addSlime(width / 2, height / 2);
});

document.getElementById('stiffnessSlider').addEventListener('input', (e) => {
    stiffness = parseFloat(e.target.value);
    document.getElementById('stiffnessValue').textContent = stiffness.toFixed(3);
});

document.getElementById('dampingSlider').addEventListener('input', (e) => {
    damping = parseFloat(e.target.value);
    document.getElementById('dampingValue').textContent = damping.toFixed(2);
});

document.getElementById('gravitySlider').addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = gravity.toFixed(2);
});

window.addEventListener('resize', resize);

// Initialize
resize();
addSlime(width / 2, height / 2);
animate();
