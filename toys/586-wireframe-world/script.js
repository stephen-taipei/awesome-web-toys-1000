const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gridBtn = document.getElementById('gridBtn');
const tunnelBtn = document.getElementById('tunnelBtn');
const cityBtn = document.getElementById('cityBtn');
const infoEl = document.getElementById('info');

let currentMode = 'grid';
let time = 0;
let cameraZ = 0;

function project(x, y, z) {
    const fov = 200;
    const viewZ = z - cameraZ;
    if (viewZ <= 0.1) return null;

    const scale = fov / viewZ;
    return {
        x: canvas.width / 2 + x * scale,
        y: canvas.height / 2 - y * scale,
        scale,
        z: viewZ
    };
}

function drawLine(p1, p2, alpha = 1) {
    if (!p1 || !p2) return;

    const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
    const a1 = Math.max(0, Math.min(1, alpha * (1 - p1.z / 20)));
    const a2 = Math.max(0, Math.min(1, alpha * (1 - p2.z / 20)));

    gradient.addColorStop(0, `rgba(0, 255, 136, ${a1})`);
    gradient.addColorStop(1, `rgba(0, 255, 136, ${a2})`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = Math.max(0.5, 2 - (p1.z + p2.z) / 20);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function drawGrid() {
    const gridSize = 20;
    const spacing = 2;

    // Horizontal lines
    for (let z = 0; z < gridSize; z++) {
        for (let x = -10; x < 10; x++) {
            const worldZ = (z + (cameraZ % spacing)) * spacing;
            const p1 = project(x * spacing, -2, worldZ);
            const p2 = project((x + 1) * spacing, -2, worldZ);
            drawLine(p1, p2);
        }
    }

    // Vertical lines (depth)
    for (let x = -10; x <= 10; x++) {
        const p1 = project(x * spacing, -2, 0.5);
        const p2 = project(x * spacing, -2, gridSize * spacing);
        drawLine(p1, p2, 0.5);
    }

    // Rising pillars
    for (let z = 2; z < gridSize; z += 3) {
        for (let x = -8; x <= 8; x += 4) {
            const worldZ = (z + (cameraZ % spacing)) * spacing;
            const height = 2 + Math.sin(time + x * 0.5 + z * 0.3) * 1.5;

            const p1 = project(x * spacing / 2, -2, worldZ);
            const p2 = project(x * spacing / 2, height, worldZ);
            drawLine(p1, p2);
        }
    }
}

function drawTunnel() {
    const segments = 30;
    const rings = 20;

    for (let r = 0; r < rings; r++) {
        const z = r * 1.5 + (cameraZ % 1.5);
        const radius = 3 + Math.sin(time + r * 0.3) * 0.5;
        const twist = time * 0.5 + r * 0.1;

        const points = [];
        for (let s = 0; s <= segments; s++) {
            const angle = (s / segments) * Math.PI * 2 + twist;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            points.push(project(x, y, z));
        }

        for (let s = 0; s < segments; s++) {
            drawLine(points[s], points[s + 1], 0.7);
        }

        // Connect to next ring
        if (r < rings - 1) {
            const nextZ = (r + 1) * 1.5 + (cameraZ % 1.5);
            const nextRadius = 3 + Math.sin(time + (r + 1) * 0.3) * 0.5;
            const nextTwist = time * 0.5 + (r + 1) * 0.1;

            for (let s = 0; s < segments; s += 4) {
                const angle = (s / segments) * Math.PI * 2 + twist;
                const nextAngle = (s / segments) * Math.PI * 2 + nextTwist;

                const p1 = project(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
                const p2 = project(Math.cos(nextAngle) * nextRadius, Math.sin(nextAngle) * nextRadius, nextZ);
                drawLine(p1, p2, 0.3);
            }
        }
    }
}

function drawCity() {
    const gridSize = 10;

    // Ground grid
    for (let z = 0; z < 15; z++) {
        const worldZ = z * 2 + (cameraZ % 2);
        for (let x = -gridSize; x < gridSize; x++) {
            const p1 = project(x * 2, -2, worldZ);
            const p2 = project((x + 1) * 2, -2, worldZ);
            drawLine(p1, p2, 0.3);
        }
    }

    // Buildings
    const seed = 12345;
    for (let z = 1; z < 12; z++) {
        for (let x = -4; x <= 4; x++) {
            const hash = Math.sin(x * 127.1 + z * 311.7 + seed) * 43758.5453;
            const hasBuilding = (hash - Math.floor(hash)) > 0.5;

            if (hasBuilding) {
                const worldZ = z * 3 + 2;
                const worldX = x * 3;
                const height = 2 + (hash - Math.floor(hash)) * 4;
                const width = 0.8;

                // Vertical edges
                const corners = [
                    [worldX - width, worldX - width],
                    [worldX + width, worldX - width],
                    [worldX + width, worldX + width],
                    [worldX - width, worldX + width]
                ];

                corners.forEach(([cx]) => {
                    const p1 = project(cx, -2, worldZ);
                    const p2 = project(cx, height, worldZ);
                    drawLine(p1, p2, 0.6);
                });

                // Top edges
                const top = [];
                corners.forEach(([cx], i) => {
                    top.push(project(cx, height, worldZ + (i < 2 ? -width : width)));
                });

                drawLine(top[0], top[1], 0.5);
                drawLine(top[1], top[2], 0.5);
                drawLine(top[2], top[3], 0.5);
                drawLine(top[3], top[0], 0.5);
            }
        }
    }
}

function draw() {
    time += 0.016;
    cameraZ += 0.05;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (currentMode) {
        case 'grid':
            drawGrid();
            break;
        case 'tunnel':
            drawTunnel();
            break;
        case 'city':
            drawCity();
            break;
    }

    requestAnimationFrame(draw);
}

function setMode(mode, btn) {
    currentMode = mode;
    [gridBtn, tunnelBtn, cityBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const names = { grid: '網格', tunnel: '隧道', city: '城市' };
    infoEl.textContent = `模式: ${names[mode]}`;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

gridBtn.addEventListener('click', () => setMode('grid', gridBtn));
tunnelBtn.addEventListener('click', () => setMode('tunnel', tunnelBtn));
cityBtn.addEventListener('click', () => setMode('city', cityBtn));

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
draw();
