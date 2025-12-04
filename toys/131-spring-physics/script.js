const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let springs = [];
let stiffness = 0.1;
let damping = 0.02;
let mass = 1;
let gravity = 0.3;

let draggingMass = null;
let graphData = [];
const maxGraphPoints = 200;

class Spring {
    constructor(anchorX, anchorY, restLength, label) {
        this.anchorX = anchorX;
        this.anchorY = anchorY;
        this.restLength = restLength;
        this.label = label;

        // Mass properties
        this.massX = anchorX;
        this.massY = anchorY + restLength;
        this.massVx = 0;
        this.massVy = 0;
        this.massRadius = 25;

        this.equilibriumY = anchorY + restLength;
    }

    update() {
        if (draggingMass === this) return;

        // Calculate spring force (Hooke's Law: F = -kx)
        const dx = this.massX - this.anchorX;
        const dy = this.massY - this.anchorY;
        const currentLength = Math.sqrt(dx * dx + dy * dy);
        const extension = currentLength - this.restLength;

        // Spring force direction (normalized)
        const nx = dx / currentLength;
        const ny = dy / currentLength;

        // Spring force
        const springForce = -stiffness * extension;
        const fx = springForce * nx;
        const fy = springForce * ny;

        // Apply gravity
        const gravityForce = gravity * mass;

        // Apply damping
        const dampingFx = -damping * this.massVx;
        const dampingFy = -damping * this.massVy;

        // Total acceleration (F = ma, a = F/m)
        const ax = (fx + dampingFx) / mass;
        const ay = (fy + gravityForce + dampingFy) / mass;

        // Update velocity
        this.massVx += ax;
        this.massVy += ay;

        // Update position
        this.massX += this.massVx;
        this.massY += this.massVy;

        // Keep mass connected to anchor (constraint)
        // Allow horizontal movement but constrain to spring system
        this.massX = this.anchorX; // Vertical spring only
    }

    draw() {
        // Draw spring coils
        this.drawSpring();

        // Draw anchor
        ctx.fillStyle = '#555';
        ctx.fillRect(this.anchorX - 30, this.anchorY - 10, 60, 10);

        ctx.fillStyle = '#777';
        ctx.beginPath();
        ctx.arc(this.anchorX, this.anchorY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw mass
        this.drawMass();

        // Draw label
        ctx.fillStyle = '#88bbdd';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.label, this.anchorX, this.anchorY - 25);
    }

    drawSpring() {
        const coils = 15;
        const coilWidth = 20;

        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const totalLength = this.massY - this.anchorY - this.massRadius;
        const coilHeight = totalLength / coils;

        ctx.beginPath();
        ctx.moveTo(this.anchorX, this.anchorY);

        for (let i = 0; i < coils; i++) {
            const y1 = this.anchorY + i * coilHeight;
            const y2 = this.anchorY + (i + 0.5) * coilHeight;
            const y3 = this.anchorY + (i + 1) * coilHeight;

            const dir = i % 2 === 0 ? 1 : -1;

            ctx.lineTo(this.anchorX + coilWidth * dir, y2);
            ctx.lineTo(this.anchorX, y3);
        }

        ctx.stroke();

        // Spring shadow
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(this.anchorX + 3, this.anchorY + 3);

        for (let i = 0; i < coils; i++) {
            const y1 = this.anchorY + i * coilHeight + 3;
            const y2 = this.anchorY + (i + 0.5) * coilHeight + 3;
            const y3 = this.anchorY + (i + 1) * coilHeight + 3;

            const dir = i % 2 === 0 ? 1 : -1;

            ctx.lineTo(this.anchorX + coilWidth * dir + 3, y2);
            ctx.lineTo(this.anchorX + 3, y3);
        }

        ctx.stroke();
    }

    drawMass() {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(this.massX + 4, this.massY + 4, this.massRadius, 0, Math.PI * 2);
        ctx.fill();

        // Mass body
        const gradient = ctx.createRadialGradient(
            this.massX - this.massRadius * 0.3,
            this.massY - this.massRadius * 0.3,
            0,
            this.massX,
            this.massY,
            this.massRadius
        );

        if (draggingMass === this) {
            gradient.addColorStop(0, '#7dd3fc');
            gradient.addColorStop(0.7, '#38bdf8');
            gradient.addColorStop(1, '#0284c7');
        } else {
            gradient.addColorStop(0, '#64b5f6');
            gradient.addColorStop(0.7, '#42a5f5');
            gradient.addColorStop(1, '#1e88e5');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.massX, this.massY, this.massRadius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(
            this.massX - this.massRadius * 0.3,
            this.massY - this.massRadius * 0.3,
            this.massRadius * 0.3,
            this.massRadius * 0.2,
            -0.5,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Mass label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('m', this.massX, this.massY);
    }

    getDisplacement() {
        return this.massY - this.equilibriumY;
    }

    getVelocity() {
        return this.massVy;
    }

    getEnergy() {
        // Kinetic energy: 0.5 * m * v^2
        const ke = 0.5 * mass * this.massVy * this.massVy;

        // Potential energy (spring): 0.5 * k * x^2
        const extension = this.massY - this.anchorY - this.restLength;
        const pe = 0.5 * stiffness * extension * extension;

        return ke + pe;
    }

    containsPoint(x, y) {
        const dx = x - this.massX;
        const dy = y - this.massY;
        return Math.sqrt(dx * dx + dy * dy) < this.massRadius;
    }

    reset() {
        this.massY = this.anchorY + this.restLength + (gravity * mass) / stiffness;
        this.massVx = 0;
        this.massVy = 0;
        this.equilibriumY = this.massY;
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    // Create springs
    springs = [
        new Spring(width / 2, 100, 150, '彈簧振盪器')
    ];

    for (const spring of springs) {
        spring.reset();
    }
}

function drawGraph() {
    const graphX = width - 320;
    const graphY = 50;
    const graphWidth = 300;
    const graphHeight = 150;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(graphX, graphY, graphWidth, graphHeight);

    ctx.strokeStyle = 'rgba(100, 180, 246, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(graphX, graphY, graphWidth, graphHeight);

    // Grid
    ctx.strokeStyle = 'rgba(100, 180, 246, 0.1)';
    for (let i = 1; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(graphX, graphY + (graphHeight / 5) * i);
        ctx.lineTo(graphX + graphWidth, graphY + (graphHeight / 5) * i);
        ctx.stroke();
    }

    // Center line (equilibrium)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(graphX, graphY + graphHeight / 2);
    ctx.lineTo(graphX + graphWidth, graphY + graphHeight / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot data
    if (graphData.length > 1) {
        ctx.strokeStyle = '#64b5f6';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < graphData.length; i++) {
            const x = graphX + (i / maxGraphPoints) * graphWidth;
            const y = graphY + graphHeight / 2 - graphData[i] * 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    // Labels
    ctx.fillStyle = '#88bbdd';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('位移 vs 時間', graphX + 10, graphY + 20);

    ctx.textAlign = 'right';
    ctx.fillText('+', graphX - 5, graphY + 15);
    ctx.fillText('0', graphX - 5, graphY + graphHeight / 2 + 5);
    ctx.fillText('-', graphX - 5, graphY + graphHeight - 5);
}

function updateStats() {
    if (springs.length === 0) return;

    const spring = springs[0];
    document.getElementById('displacement').textContent = spring.getDisplacement().toFixed(1) + ' px';
    document.getElementById('velocity').textContent = spring.getVelocity().toFixed(2) + ' px/f';
    document.getElementById('energy').textContent = spring.getEnergy().toFixed(2);

    // Add to graph
    graphData.push(spring.getDisplacement());
    if (graphData.length > maxGraphPoints) {
        graphData.shift();
    }
}

function drawEquations() {
    const x = width - 320;
    const y = 230;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, 300, 100);

    ctx.strokeStyle = 'rgba(100, 180, 246, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 300, 100);

    ctx.fillStyle = '#88bbdd';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';

    ctx.fillText('虎克定律: F = -kx', x + 15, y + 25);
    ctx.fillText('運動方程: ma = -kx - cv', x + 15, y + 50);
    ctx.fillText('其中 k = 彈性係數, c = 阻尼係數', x + 15, y + 75);
}

function animate() {
    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#1e3a5f');
    bgGradient.addColorStop(1, '#0d1b2a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Update and draw springs
    for (const spring of springs) {
        spring.update();
        spring.draw();
    }

    // Draw equilibrium line
    if (springs.length > 0) {
        const spring = springs[0];
        ctx.strokeStyle = 'rgba(255, 200, 100, 0.5)';
        ctx.setLineDash([10, 10]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(spring.anchorX - 100, spring.equilibriumY);
        ctx.lineTo(spring.anchorX + 100, spring.equilibriumY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(255, 200, 100, 0.8)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('平衡位置', spring.anchorX + 50, spring.equilibriumY - 5);
    }

    drawGraph();
    drawEquations();
    updateStats();

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const spring of springs) {
        if (spring.containsPoint(x, y)) {
            draggingMass = spring;
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!draggingMass) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    draggingMass.massY = y;
    draggingMass.massVy = 0;
});

canvas.addEventListener('mouseup', () => {
    draggingMass = null;
});

canvas.addEventListener('mouseleave', () => {
    draggingMass = null;
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    for (const spring of springs) {
        if (spring.containsPoint(x, y)) {
            draggingMass = spring;
            break;
        }
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!draggingMass) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const y = touch.clientY - rect.top;

    draggingMass.massY = y;
    draggingMass.massVy = 0;
});

canvas.addEventListener('touchend', () => {
    draggingMass = null;
});

// Control listeners
document.getElementById('stiffnessSlider').addEventListener('input', (e) => {
    stiffness = parseFloat(e.target.value);
    document.getElementById('stiffnessValue').textContent = stiffness.toFixed(2);
    for (const spring of springs) {
        spring.reset();
    }
    graphData = [];
});

document.getElementById('dampingSlider').addEventListener('input', (e) => {
    damping = parseFloat(e.target.value);
    document.getElementById('dampingValue').textContent = damping.toFixed(3);
});

document.getElementById('massSlider').addEventListener('input', (e) => {
    mass = parseFloat(e.target.value);
    document.getElementById('massValue').textContent = mass.toFixed(2);
    for (const spring of springs) {
        spring.reset();
    }
    graphData = [];
});

document.getElementById('gravitySlider').addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = gravity.toFixed(2);
    for (const spring of springs) {
        spring.reset();
    }
    graphData = [];
});

document.getElementById('resetBtn').addEventListener('click', () => {
    for (const spring of springs) {
        spring.reset();
    }
    graphData = [];
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
