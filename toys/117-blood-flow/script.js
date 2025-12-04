const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let flowSpeed = 5;
let vesselDiameter = 100;
let zoom = 1;
let viewMode = 'normal';
let time = 0;

// Blood cells
let redCells = [];
let whiteCells = [];
let platelets = [];

// UI elements
const rbcCountEl = document.getElementById('rbcCount');
const wbcCountEl = document.getElementById('wbcCount');
const plateletCountEl = document.getElementById('plateletCount');
const zoomValueEl = document.getElementById('zoomValue');

class RedBloodCell {
    constructor() {
        this.reset();
        this.x = Math.random() * width * 1.5;
    }

    reset() {
        this.x = -50;
        this.baseY = height / 2 + (Math.random() - 0.5) * vesselDiameter * 0.7;
        this.y = this.baseY;
        this.size = 8 + Math.random() * 4;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.05 + Math.random() * 0.05;
        this.speedFactor = 0.8 + Math.random() * 0.4;

        // Cells near center move faster (parabolic flow profile)
        const distFromCenter = Math.abs(this.baseY - height / 2) / (vesselDiameter / 2);
        this.speedFactor *= (1 - distFromCenter * distFromCenter * 0.5);
    }

    update() {
        this.x += flowSpeed * this.speedFactor * 0.5;
        this.rotation += this.rotationSpeed;
        this.wobble += this.wobbleSpeed;
        this.y = this.baseY + Math.sin(this.wobble) * 3;

        if (this.x > width + 50) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(zoom, zoom);

        // Red blood cell (biconcave disc shape from side)
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, '#ff2222');
        gradient.addColorStop(0.3, '#cc0000');
        gradient.addColorStop(0.7, '#aa0000');
        gradient.addColorStop(1, '#880000');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Center dimple
        ctx.fillStyle = 'rgba(100, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.4, this.size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.3, -this.size * 0.1, this.size * 0.3, this.size * 0.1, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class WhiteBloodCell {
    constructor() {
        this.reset();
        this.x = Math.random() * width * 1.5;
    }

    reset() {
        this.x = -80;
        this.baseY = height / 2 + (Math.random() - 0.5) * vesselDiameter * 0.6;
        this.y = this.baseY;
        this.size = 15 + Math.random() * 5;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.03 + Math.random() * 0.02;
        this.speedFactor = 0.6 + Math.random() * 0.3;
        this.nucleusOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.x += flowSpeed * this.speedFactor * 0.4;
        this.wobble += this.wobbleSpeed;
        this.y = this.baseY + Math.sin(this.wobble) * 5;

        if (this.x > width + 80) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(zoom, zoom);

        // Cell body
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, 'rgba(255, 255, 240, 0.9)');
        gradient.addColorStop(0.5, 'rgba(230, 230, 210, 0.8)');
        gradient.addColorStop(1, 'rgba(200, 200, 180, 0.7)');

        ctx.fillStyle = gradient;
        ctx.beginPath();

        // Irregular shape
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const r = this.size * (0.8 + Math.sin(angle * 3 + this.wobble) * 0.2);
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Nucleus (multi-lobed)
        ctx.fillStyle = 'rgba(80, 60, 120, 0.7)';
        for (let i = 0; i < 3; i++) {
            const angle = this.nucleusOffset + (i / 3) * Math.PI * 2;
            const nx = Math.cos(angle) * this.size * 0.3;
            const ny = Math.sin(angle) * this.size * 0.3;
            ctx.beginPath();
            ctx.arc(nx, ny, this.size * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

class Platelet {
    constructor() {
        this.reset();
        this.x = Math.random() * width * 1.5;
    }

    reset() {
        this.x = -20;
        this.baseY = height / 2 + (Math.random() - 0.5) * vesselDiameter * 0.8;
        this.y = this.baseY;
        this.size = 3 + Math.random() * 2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.08 + Math.random() * 0.05;
        this.speedFactor = 0.9 + Math.random() * 0.2;
    }

    update() {
        this.x += flowSpeed * this.speedFactor * 0.5;
        this.rotation += this.rotationSpeed;
        this.wobble += this.wobbleSpeed;
        this.y = this.baseY + Math.sin(this.wobble) * 2;

        if (this.x > width + 20) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(zoom, zoom);

        // Platelet (irregular small shape)
        ctx.fillStyle = 'rgba(255, 200, 150, 0.8)';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const r = this.size * (0.7 + Math.random() * 0.3);
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initCells();
}

function initCells() {
    redCells = [];
    whiteCells = [];
    platelets = [];

    // Red blood cells (most numerous)
    const rbcCount = Math.floor(80 * (vesselDiameter / 100));
    for (let i = 0; i < rbcCount; i++) {
        redCells.push(new RedBloodCell());
    }

    // White blood cells (fewer)
    const wbcCount = Math.floor(5 * (vesselDiameter / 100));
    for (let i = 0; i < wbcCount; i++) {
        whiteCells.push(new WhiteBloodCell());
    }

    // Platelets
    const plateletCount = Math.floor(30 * (vesselDiameter / 100));
    for (let i = 0; i < plateletCount; i++) {
        platelets.push(new Platelet());
    }

    updateCounts();
}

function updateCounts() {
    rbcCountEl.textContent = redCells.length;
    wbcCountEl.textContent = whiteCells.length;
    plateletCountEl.textContent = platelets.length;
}

function drawVessel() {
    const centerY = height / 2;
    const radius = vesselDiameter / 2 * zoom;

    // Vessel wall outer
    ctx.fillStyle = '#4a2020';
    ctx.fillRect(0, centerY - radius - 20, width, radius * 2 + 40);

    // Vessel inner (blood flow area)
    const gradient = ctx.createLinearGradient(0, centerY - radius, 0, centerY + radius);

    if (viewMode === 'plasma') {
        gradient.addColorStop(0, '#ffeeaa');
        gradient.addColorStop(0.5, '#ffdd88');
        gradient.addColorStop(1, '#ffcc66');
    } else {
        gradient.addColorStop(0, '#660000');
        gradient.addColorStop(0.3, '#880000');
        gradient.addColorStop(0.5, '#990000');
        gradient.addColorStop(0.7, '#880000');
        gradient.addColorStop(1, '#660000');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, centerY - radius, width, radius * 2);

    // Vessel wall texture
    ctx.strokeStyle = 'rgba(100, 50, 50, 0.5)';
    ctx.lineWidth = 2;

    // Top wall
    ctx.beginPath();
    ctx.moveTo(0, centerY - radius);
    for (let x = 0; x < width; x += 20) {
        ctx.lineTo(x, centerY - radius + Math.sin(x * 0.05 + time) * 2);
    }
    ctx.stroke();

    // Bottom wall
    ctx.beginPath();
    ctx.moveTo(0, centerY + radius);
    for (let x = 0; x < width; x += 20) {
        ctx.lineTo(x, centerY + radius + Math.sin(x * 0.05 + time + 1) * 2);
    }
    ctx.stroke();
}

function animate() {
    // Background
    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(0, 0, width, height);

    drawVessel();

    // Update and draw cells
    if (viewMode !== 'plasma') {
        // Platelets (back layer)
        for (const platelet of platelets) {
            platelet.update();
            platelet.draw();
        }

        // Red blood cells
        for (const cell of redCells) {
            cell.update();
            cell.draw();
        }

        // White blood cells (front layer)
        if (viewMode === 'cells' || viewMode === 'normal') {
            for (const cell of whiteCells) {
                cell.update();
                cell.draw();
            }
        }
    }

    // Flow lines effect
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const y = height / 2 + (i - 2) * vesselDiameter * 0.15 * zoom;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < width; x += 10) {
            ctx.lineTo(x, y + Math.sin(x * 0.02 + time * 2) * 3);
        }
        ctx.stroke();
    }

    time += 0.02;
    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('speedSlider').addEventListener('input', (e) => {
    flowSpeed = parseInt(e.target.value);
});

document.getElementById('diameterSlider').addEventListener('input', (e) => {
    vesselDiameter = parseInt(e.target.value);
    initCells();
});

document.getElementById('zoomSlider').addEventListener('input', (e) => {
    zoom = parseFloat(e.target.value);
    zoomValueEl.textContent = zoom + 'x';
});

document.getElementById('viewSelect').addEventListener('change', (e) => {
    viewMode = e.target.value;
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
