const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let cupAngle = 0;
let targetAngle = 0;
let gravity = 0.5;
let maxParticles = 150;
let liquidType = 'water';

// Cup properties
const cup = {
    x: 0,
    y: 0,
    width: 120,
    height: 160,
    rimWidth: 130,
    bottomWidth: 100,
    wallThickness: 8
};

// Receiving container
const container = {
    x: 0,
    y: 0,
    width: 200,
    height: 120,
    waterLevel: 0
};

const liquidColors = {
    water: { color: 'rgba(100, 180, 255, 0.7)', splash: 'rgba(150, 200, 255, 0.8)' },
    juice: { color: 'rgba(255, 165, 0, 0.8)', splash: 'rgba(255, 200, 100, 0.9)' },
    wine: { color: 'rgba(139, 0, 30, 0.85)', splash: 'rgba(180, 50, 80, 0.9)' },
    milk: { color: 'rgba(255, 255, 255, 0.95)', splash: 'rgba(255, 255, 255, 1)' },
    coffee: { color: 'rgba(101, 67, 33, 0.9)', splash: 'rgba(139, 90, 43, 0.95)' }
};

class Particle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 4 + Math.random() * 4;
        this.life = 1;
        this.inContainer = false;
    }

    update() {
        if (this.inContainer) {
            // Settle in container
            this.vy += gravity * 0.5;
            this.vy *= 0.9;
            this.vx *= 0.95;

            this.x += this.vx;
            this.y += this.vy;

            // Container bounds
            const containerLeft = container.x - container.width / 2 + 10;
            const containerRight = container.x + container.width / 2 - 10;
            const containerBottom = container.y;

            if (this.x < containerLeft) {
                this.x = containerLeft;
                this.vx *= -0.3;
            }
            if (this.x > containerRight) {
                this.x = containerRight;
                this.vx *= -0.3;
            }
            if (this.y > containerBottom - this.radius) {
                this.y = containerBottom - this.radius;
                this.vy *= -0.2;
            }

            return true;
        }

        // Apply gravity
        this.vy += gravity;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Check if entering container
        const containerLeft = container.x - container.width / 2;
        const containerRight = container.x + container.width / 2;
        const containerTop = container.y - container.height;

        if (this.x > containerLeft && this.x < containerRight &&
            this.y > containerTop && this.y < container.y) {
            this.inContainer = true;
            this.vy *= 0.5;
            container.waterLevel = Math.min(container.height - 10,
                container.waterLevel + 0.1);
        }

        // Remove if out of screen
        if (this.y > height + 50 || this.x < -50 || this.x > width + 50) {
            return false;
        }

        return true;
    }

    draw() {
        const colors = liquidColors[liquidType];
        ctx.fillStyle = colors.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3,
                this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    cup.x = width * 0.35;
    cup.y = height * 0.4;

    container.x = width * 0.65;
    container.y = height * 0.75;
}

function getCupPoints() {
    const cos = Math.cos(cupAngle);
    const sin = Math.sin(cupAngle);

    // Cup shape points (relative to center)
    const points = {
        topLeft: { x: -cup.rimWidth / 2, y: -cup.height / 2 },
        topRight: { x: cup.rimWidth / 2, y: -cup.height / 2 },
        bottomLeft: { x: -cup.bottomWidth / 2, y: cup.height / 2 },
        bottomRight: { x: cup.bottomWidth / 2, y: cup.height / 2 }
    };

    // Rotate points
    for (const key in points) {
        const p = points[key];
        const rx = p.x * cos - p.y * sin;
        const ry = p.x * sin + p.y * cos;
        points[key] = { x: cup.x + rx, y: cup.y + ry };
    }

    return points;
}

function getPourPoint() {
    const points = getCupPoints();
    // Pour from the lower rim edge when tilted
    if (cupAngle > 0.1) {
        return {
            x: points.topRight.x,
            y: points.topRight.y
        };
    } else if (cupAngle < -0.1) {
        return {
            x: points.topLeft.x,
            y: points.topLeft.y
        };
    }
    return null;
}

function pourLiquid() {
    const pourPoint = getPourPoint();
    if (!pourPoint) return;

    const pourRate = Math.abs(cupAngle) * 3;

    for (let i = 0; i < pourRate && particles.length < maxParticles; i++) {
        const speed = 2 + Math.random() * 2;
        const angle = cupAngle + (Math.random() - 0.5) * 0.3;

        particles.push(new Particle(
            pourPoint.x + (Math.random() - 0.5) * 10,
            pourPoint.y,
            Math.sin(angle) * speed,
            Math.cos(angle) * speed * 0.5
        ));
    }
}

function drawCup() {
    ctx.save();
    ctx.translate(cup.x, cup.y);
    ctx.rotate(cupAngle);

    // Glass cup
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.8)';
    ctx.lineWidth = cup.wallThickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Cup outline
    ctx.beginPath();
    ctx.moveTo(-cup.rimWidth / 2, -cup.height / 2);
    ctx.lineTo(-cup.bottomWidth / 2, cup.height / 2);
    ctx.lineTo(cup.bottomWidth / 2, cup.height / 2);
    ctx.lineTo(cup.rimWidth / 2, -cup.height / 2);
    ctx.stroke();

    // Liquid inside cup (simplified)
    const liquidHeight = cup.height * 0.6;
    const liquidY = cup.height / 2 - liquidHeight;

    // Calculate liquid width at that height
    const t = (liquidY + cup.height / 2) / cup.height;
    const liquidWidth = cup.bottomWidth + (cup.rimWidth - cup.bottomWidth) * (1 - t);

    const colors = liquidColors[liquidType];
    ctx.fillStyle = colors.color;
    ctx.beginPath();
    ctx.moveTo(-liquidWidth / 2 + 5, liquidY);
    ctx.lineTo(-cup.bottomWidth / 2 + 5, cup.height / 2 - 5);
    ctx.lineTo(cup.bottomWidth / 2 - 5, cup.height / 2 - 5);
    ctx.lineTo(liquidWidth / 2 - 5, liquidY);
    ctx.closePath();
    ctx.fill();

    // Glass reflection
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-cup.rimWidth / 2 + 15, -cup.height / 2 + 20);
    ctx.lineTo(-cup.bottomWidth / 2 + 10, cup.height / 2 - 20);
    ctx.stroke();

    ctx.restore();
}

function drawContainer() {
    // Container shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(container.x, container.y + 10, container.width / 2, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Container body
    ctx.fillStyle = 'rgba(200, 220, 255, 0.3)';
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.8)';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(container.x - container.width / 2, container.y);
    ctx.lineTo(container.x - container.width / 2 + 10, container.y - container.height);
    ctx.lineTo(container.x + container.width / 2 - 10, container.y - container.height);
    ctx.lineTo(container.x + container.width / 2, container.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Water in container
    if (container.waterLevel > 0) {
        const colors = liquidColors[liquidType];
        ctx.fillStyle = colors.color;

        const waterY = container.y - container.waterLevel;
        const t = container.waterLevel / container.height;
        const waterWidth = container.width - 20 + t * 10;

        ctx.beginPath();
        ctx.moveTo(container.x - waterWidth / 2 + 5, waterY);
        ctx.lineTo(container.x - container.width / 2 + 10, container.y - 5);
        ctx.lineTo(container.x + container.width / 2 - 10, container.y - 5);
        ctx.lineTo(container.x + waterWidth / 2 - 5, waterY);
        ctx.closePath();
        ctx.fill();

        // Water surface wave
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(container.x - waterWidth / 2 + 10, waterY);
        ctx.quadraticCurveTo(container.x, waterY - 3, container.x + waterWidth / 2 - 10, waterY);
        ctx.stroke();
    }

    // Container rim highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(container.x - container.width / 2 + 15, container.y - container.height + 5);
    ctx.lineTo(container.x - container.width / 2 + 10, container.y - 10);
    ctx.stroke();
}

function drawBackground() {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Table surface
    ctx.fillStyle = 'rgba(50, 30, 20, 0.3)';
    ctx.fillRect(0, height * 0.7, width, height * 0.3);

    // Table edge
    ctx.fillStyle = 'rgba(80, 50, 30, 0.5)';
    ctx.fillRect(0, height * 0.7, width, 5);
}

function animate() {
    drawBackground();

    // Smooth angle transition
    cupAngle += (targetAngle - cupAngle) * 0.1;

    // Pour if tilted enough
    if (Math.abs(cupAngle) > 0.3) {
        pourLiquid();
    }

    // Update particles
    particles = particles.filter(p => p.update());

    // Draw container first
    drawContainer();

    // Draw particles
    for (const particle of particles) {
        particle.draw();
    }

    // Draw cup
    drawCup();

    requestAnimationFrame(animate);
}

// Mouse/touch controls
let isDragging = false;
let dragStartY = 0;

canvas.addEventListener('mousedown', (e) => {
    const dx = e.clientX - cup.x;
    const dy = e.clientY - cup.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 150) {
        isDragging = true;
        dragStartY = e.clientY;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const dx = e.clientX - cup.x;
        targetAngle = Math.max(-1.2, Math.min(1.2, dx * 0.005));
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    targetAngle = 0;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    targetAngle = 0;
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - cup.x;
    const dy = touch.clientY - cup.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 150) {
        isDragging = true;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDragging) {
        const touch = e.touches[0];
        const dx = touch.clientX - cup.x;
        targetAngle = Math.max(-1.2, Math.min(1.2, dx * 0.005));
    }
});

canvas.addEventListener('touchend', () => {
    isDragging = false;
    targetAngle = 0;
});

// UI controls
document.getElementById('liquidSelect').addEventListener('change', (e) => {
    liquidType = e.target.value;
});

document.getElementById('particleSlider').addEventListener('input', (e) => {
    maxParticles = parseInt(e.target.value);
});

document.getElementById('gravitySlider').addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
});

document.getElementById('refillBtn').addEventListener('click', () => {
    particles = [];
    container.waterLevel = 0;
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
