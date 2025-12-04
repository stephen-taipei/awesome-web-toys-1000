const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let polygons = [];
let gravity = 0.3;
let bounce = 0.7;
let newSides = 5;
let newSize = 40;

let dragging = null;
let dragOffsetX, dragOffsetY;

const colors = [
    '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff',
    '#5f27cd', '#00d2d3', '#a55eea', '#26de81', '#fd9644'
];

class Polygon {
    constructor(x, y, sides, size) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.angle = Math.random() * Math.PI * 2;
        this.angularVelocity = (Math.random() - 0.5) * 0.1;
        this.sides = sides;
        this.radius = size;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.vertices = [];
        this.updateVertices();
    }

    updateVertices() {
        this.vertices = [];
        for (let i = 0; i < this.sides; i++) {
            const angle = this.angle + (i / this.sides) * Math.PI * 2;
            this.vertices.push({
                x: this.x + Math.cos(angle) * this.radius,
                y: this.y + Math.sin(angle) * this.radius
            });
        }
    }

    update() {
        // Apply gravity
        this.vy += gravity;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.angularVelocity;

        // Boundary collision
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -bounce;
            this.angularVelocity += this.vy * 0.01;
        }
        if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx *= -bounce;
            this.angularVelocity -= this.vy * 0.01;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -bounce;
        }
        if (this.y + this.radius > height) {
            this.y = height - this.radius;
            this.vy *= -bounce;
            this.vx *= 0.95; // Friction
            this.angularVelocity *= 0.95;
        }

        // Damping
        this.vx *= 0.999;
        this.vy *= 0.999;
        this.angularVelocity *= 0.998;

        this.updateVertices();
    }

    draw() {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x + 5, this.vertices[0].y + 5);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x + 5, this.vertices[i].y + 5);
        }
        ctx.closePath();
        ctx.fill();

        // Main body with gradient
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x,
            this.y,
            this.radius * 1.2
        );
        gradient.addColorStop(0, this.lightenColor(this.color, 30));
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 30));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.fill();

        // Border
        ctx.strokeStyle = this.darkenColor(this.color, 20);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            this.radius * 0.3,
            this.radius * 0.2,
            this.angle - 0.5,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `rgb(${R}, ${G}, ${B})`;
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `rgb(${R}, ${G}, ${B})`;
    }

    containsPoint(px, py) {
        const dx = px - this.x;
        const dy = py - this.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }
}

function checkCollision(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = p1.radius + p2.radius;

    if (dist < minDist && dist > 0) {
        // Collision response
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        // Rotate velocities
        const vx1 = p1.vx * cos + p1.vy * sin;
        const vy1 = p1.vy * cos - p1.vx * sin;
        const vx2 = p2.vx * cos + p2.vy * sin;
        const vy2 = p2.vy * cos - p2.vx * sin;

        // Calculate mass based on size
        const m1 = p1.radius * p1.radius;
        const m2 = p2.radius * p2.radius;
        const totalMass = m1 + m2;

        // Elastic collision
        const newVx1 = ((m1 - m2) * vx1 + 2 * m2 * vx2) / totalMass * bounce;
        const newVx2 = ((m2 - m1) * vx2 + 2 * m1 * vx1) / totalMass * bounce;

        // Rotate back
        p1.vx = newVx1 * cos - vy1 * sin;
        p1.vy = vy1 * cos + newVx1 * sin;
        p2.vx = newVx2 * cos - vy2 * sin;
        p2.vy = vy2 * cos + newVx2 * sin;

        // Separate polygons
        const overlap = minDist - dist;
        const separateX = (overlap / 2) * cos * 1.01;
        const separateY = (overlap / 2) * sin * 1.01;

        p1.x -= separateX;
        p1.y -= separateY;
        p2.x += separateX;
        p2.y += separateY;

        // Transfer angular momentum
        p1.angularVelocity += (p2.vx - p1.vx) * 0.01;
        p2.angularVelocity += (p1.vx - p2.vx) * 0.01;
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function shake() {
    for (const poly of polygons) {
        poly.vx += (Math.random() - 0.5) * 20;
        poly.vy += (Math.random() - 0.5) * 20 - 10;
        poly.angularVelocity += (Math.random() - 0.5) * 0.5;
    }
}

function updatePolyCount() {
    document.getElementById('polyCount').textContent = polygons.length;
}

function animate() {
    // Clear with gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Check all collisions
    for (let i = 0; i < polygons.length; i++) {
        for (let j = i + 1; j < polygons.length; j++) {
            checkCollision(polygons[i], polygons[j]);
        }
    }

    // Update and draw
    for (const poly of polygons) {
        if (poly !== dragging) {
            poly.update();
        }
        poly.draw();
    }

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('click', (e) => {
    if (dragging) return;
    if (polygons.length >= 50) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    polygons.push(new Polygon(x, y, newSides, newSize));
    updatePolyCount();
});

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = polygons.length - 1; i >= 0; i--) {
        if (polygons[i].containsPoint(x, y)) {
            dragging = polygons[i];
            dragOffsetX = x - dragging.x;
            dragOffsetY = y - dragging.y;
            dragging.vx = 0;
            dragging.vy = 0;
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!dragging) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newX = x - dragOffsetX;
    const newY = y - dragOffsetY;

    dragging.vx = (newX - dragging.x) * 0.5;
    dragging.vy = (newY - dragging.y) * 0.5;
    dragging.x = newX;
    dragging.y = newY;
    dragging.updateVertices();
});

canvas.addEventListener('mouseup', () => {
    dragging = null;
});

canvas.addEventListener('mouseleave', () => {
    dragging = null;
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    for (let i = polygons.length - 1; i >= 0; i--) {
        if (polygons[i].containsPoint(x, y)) {
            dragging = polygons[i];
            dragOffsetX = x - dragging.x;
            dragOffsetY = y - dragging.y;
            return;
        }
    }

    // Add new polygon if not dragging
    if (polygons.length < 50) {
        polygons.push(new Polygon(x, y, newSides, newSize));
        updatePolyCount();
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!dragging) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const newX = x - dragOffsetX;
    const newY = y - dragOffsetY;

    dragging.vx = (newX - dragging.x) * 0.5;
    dragging.vy = (newY - dragging.y) * 0.5;
    dragging.x = newX;
    dragging.y = newY;
    dragging.updateVertices();
});

canvas.addEventListener('touchend', () => {
    dragging = null;
});

// Control listeners
document.getElementById('sidesSlider').addEventListener('input', (e) => {
    newSides = parseInt(e.target.value);
    document.getElementById('sidesValue').textContent = newSides;
});

document.getElementById('sizeSlider').addEventListener('input', (e) => {
    newSize = parseInt(e.target.value);
    document.getElementById('sizeValue').textContent = newSize;
});

document.getElementById('gravitySlider').addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = gravity.toFixed(2);
});

document.getElementById('bounceSlider').addEventListener('input', (e) => {
    bounce = parseFloat(e.target.value);
    document.getElementById('bounceValue').textContent = bounce.toFixed(2);
});

document.getElementById('shakeBtn').addEventListener('click', shake);

document.getElementById('resetBtn').addEventListener('click', () => {
    polygons = [];
    updatePolyCount();
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
