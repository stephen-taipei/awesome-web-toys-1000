let canvas, ctx;
let particles = [];
let numParticles = 150;
let speed = 1;
let isOrdering = false;
let targetPositions = [];

function init() {
    canvas = document.getElementById('entropyCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    createParticles();
    animate();
}

function resizeCanvas() {
    const size = Math.min(600, window.innerWidth - 40);
    canvas.width = size;
    canvas.height = size;
}

function setupControls() {
    document.getElementById('orderBtn').addEventListener('click', orderParticles);
    document.getElementById('shuffleBtn').addEventListener('click', shuffleParticles);
    document.getElementById('speedSlider').addEventListener('input', (e) => {
        speed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = speed.toFixed(1) + 'x';
    });
    document.getElementById('particleSlider').addEventListener('input', (e) => {
        numParticles = parseInt(e.target.value);
        document.getElementById('particleValue').textContent = numParticles;
        createParticles();
    });
}

function createParticles() {
    particles = [];
    const colors = ['#ff00d9', '#00d9ff', '#ffff00', '#00ff00'];

    for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 1 + Math.random() * 2;
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            radius: 4 + Math.random() * 3,
            color: colors[Math.floor(i / (numParticles / 4)) % 4],
            colorIndex: Math.floor(i / (numParticles / 4)) % 4
        });
    }
    calculateTargetPositions();
}

function calculateTargetPositions() {
    targetPositions = [];
    const gridSize = Math.ceil(Math.sqrt(numParticles / 4));
    const cellSize = canvas.width / (gridSize * 2 + 2);
    const quadrants = [
        { x: cellSize, y: cellSize },
        { x: canvas.width / 2 + cellSize, y: cellSize },
        { x: cellSize, y: canvas.height / 2 + cellSize },
        { x: canvas.width / 2 + cellSize, y: canvas.height / 2 + cellSize }
    ];

    let counts = [0, 0, 0, 0];
    particles.forEach((p, i) => {
        const q = p.colorIndex;
        const row = Math.floor(counts[q] / gridSize);
        const col = counts[q] % gridSize;
        targetPositions.push({
            x: quadrants[q].x + col * cellSize + cellSize / 2,
            y: quadrants[q].y + row * cellSize + cellSize / 2
        });
        counts[q]++;
    });
}

function orderParticles() {
    isOrdering = true;
    calculateTargetPositions();
}

function shuffleParticles() {
    isOrdering = false;
    particles.forEach(p => {
        const angle = Math.random() * Math.PI * 2;
        const spd = 3 + Math.random() * 3;
        p.vx = Math.cos(angle) * spd;
        p.vy = Math.sin(angle) * spd;
    });
}

function calculateEntropy() {
    // Divide canvas into grid cells
    const gridCells = 10;
    const cellW = canvas.width / gridCells;
    const cellH = canvas.height / gridCells;
    const distribution = new Array(gridCells * gridCells).fill(0);

    particles.forEach(p => {
        const cx = Math.floor(p.x / cellW);
        const cy = Math.floor(p.y / cellH);
        const idx = Math.min(gridCells - 1, Math.max(0, cy)) * gridCells + Math.min(gridCells - 1, Math.max(0, cx));
        distribution[idx]++;
    });

    // Calculate entropy using Shannon entropy formula
    let entropy = 0;
    const n = particles.length;
    distribution.forEach(count => {
        if (count > 0) {
            const p = count / n;
            entropy -= p * Math.log(p);
        }
    });

    // Normalize to 0-1
    const maxEntropy = Math.log(gridCells * gridCells);
    return entropy / maxEntropy;
}

function update() {
    const w = canvas.width;
    const h = canvas.height;

    particles.forEach((p, i) => {
        if (isOrdering && targetPositions[i]) {
            const target = targetPositions[i];
            const dx = target.x - p.x;
            const dy = target.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1) {
                p.vx = dx * 0.05 * speed;
                p.vy = dy * 0.05 * speed;
            } else {
                p.vx = 0;
                p.vy = 0;
            }
        } else {
            // Random motion with collisions
            p.vx += (Math.random() - 0.5) * 0.1 * speed;
            p.vy += (Math.random() - 0.5) * 0.1 * speed;

            // Limit speed
            const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (spd > 3) {
                p.vx = (p.vx / spd) * 3;
                p.vy = (p.vy / spd) * 3;
            }
        }

        p.x += p.vx * speed;
        p.y += p.vy * speed;

        // Boundary collision
        if (p.x < p.radius) { p.x = p.radius; p.vx *= -1; }
        if (p.x > w - p.radius) { p.x = w - p.radius; p.vx *= -1; }
        if (p.y < p.radius) { p.y = p.radius; p.vy *= -1; }
        if (p.y > h - p.radius) { p.y = h - p.radius; p.vy *= -1; }
    });

    updateDisplay();
}

function updateDisplay() {
    const entropy = calculateEntropy();
    const disorder = entropy * 100;

    document.getElementById('entropyFill').style.width = disorder + '%';
    document.getElementById('entropyValue').textContent = entropy.toFixed(2);
    document.getElementById('disorder').textContent = Math.round(disorder) + '%';

    // Estimate microstates (simplified)
    const microstates = Math.pow(10, entropy * 5).toFixed(0);
    document.getElementById('microstates').textContent = microstates > 1000000 ? '>10^6' : microstates;
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 4;
    const cellW = canvas.width / gridSize;
    const cellH = canvas.height / gridSize;

    for (let i = 1; i < gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellW, 0);
        ctx.lineTo(i * cellW, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellH);
        ctx.lineTo(canvas.width, i * cellH);
        ctx.stroke();
    }

    // Draw particles
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(p.x - 2, p.y - 2, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.5, p.color);
        gradient.addColorStop(1, p.color + '88');
        ctx.fillStyle = gradient;
        ctx.fill();
    });

    // Draw quadrant labels when ordering
    if (isOrdering) {
        ctx.font = '12px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText('區域 A', 20, 20);
        ctx.fillText('區域 B', canvas.width / 2 + 20, 20);
        ctx.fillText('區域 C', 20, canvas.height / 2 + 20);
        ctx.fillText('區域 D', canvas.width / 2 + 20, canvas.height / 2 + 20);
    }
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
