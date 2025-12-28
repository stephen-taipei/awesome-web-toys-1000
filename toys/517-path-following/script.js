const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const speedSlider = document.getElementById('speedSlider');
const speedLabel = document.getElementById('speedLabel');
const infoEl = document.getElementById('info');

let isPlaying = true;
let pathProgress = 0;
let speed = 5;

// Define a curved path using control points
const pathPoints = [
    { x: 0, y: 0, z: 0 },
    { x: 5, y: -1, z: 3 },
    { x: 8, y: 0, z: 8 },
    { x: 5, y: 1, z: 12 },
    { x: 0, y: 0, z: 15 },
    { x: -5, y: -1, z: 12 },
    { x: -8, y: 0, z: 8 },
    { x: -5, y: 1, z: 3 },
    { x: 0, y: 0, z: 0 }
];

// Scene objects
const pillars = [];
for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    pillars.push({
        x: Math.cos(angle) * 12,
        z: Math.sin(angle) * 12 + 8,
        height: 3 + Math.random() * 2,
        hue: (i / 12) * 360
    });
}

function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return {
        x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
        z: 0.5 * ((2 * p1.z) + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3)
    };
}

function getPathPosition(progress) {
    const n = pathPoints.length - 1;
    const scaledProgress = progress * n;
    const i = Math.floor(scaledProgress);
    const t = scaledProgress - i;

    const p0 = pathPoints[Math.max(0, i - 1)];
    const p1 = pathPoints[i];
    const p2 = pathPoints[Math.min(n, i + 1)];
    const p3 = pathPoints[Math.min(n, i + 2)];

    return catmullRom(p0, p1, p2, p3, t);
}

function getPathDirection(progress) {
    const delta = 0.001;
    const p1 = getPathPosition(progress);
    const p2 = getPathPosition(Math.min(1, progress + delta));

    return {
        x: p2.x - p1.x,
        y: p2.y - p1.y,
        z: p2.z - p1.z
    };
}

let camX = 0, camY = 0, camZ = 0;
let lookX = 0, lookY = 0, lookZ = 1;

function project(x, y, z) {
    let dx = x - camX;
    let dy = y - camY;
    let dz = z - camZ;

    // Calculate camera angle from look direction
    const yaw = Math.atan2(lookX, lookZ);

    const cos = Math.cos(-yaw);
    const sin = Math.sin(-yaw);
    const rx = dx * cos + dz * sin;
    const rz = -dx * sin + dz * cos;

    if (rz <= 0.1) return null;

    const fov = 200;
    return {
        x: canvas.width / 2 + (rx / rz) * fov,
        y: canvas.height / 2 + ((dy - lookY * 0.3) / rz) * fov,
        z: rz
    };
}

function drawPillar(pillar) {
    const w = 0.5;
    const h = pillar.height;
    const baseY = 1;

    // Front face
    const corners = [
        [pillar.x - w, baseY, pillar.z - w],
        [pillar.x + w, baseY, pillar.z - w],
        [pillar.x + w, baseY - h, pillar.z - w],
        [pillar.x - w, baseY - h, pillar.z - w]
    ];

    const projected = corners.map(c => project(...c)).filter(p => p !== null);
    if (projected.length < 3) return null;

    return {
        z: projected[0].z,
        draw: () => {
            ctx.beginPath();
            ctx.moveTo(projected[0].x, projected[0].y);
            projected.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();

            const brightness = 40 + 20 * (1 - projected[0].z / 20);
            ctx.fillStyle = `hsla(${pillar.hue}, 60%, ${brightness}%, 0.9)`;
            ctx.fill();
            ctx.strokeStyle = `hsla(${pillar.hue}, 70%, ${brightness + 15}%, 0.7)`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    };
}

function drawPathPreview() {
    ctx.strokeStyle = 'rgba(100, 181, 246, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();

    for (let t = 0; t <= 1; t += 0.02) {
        const pos = getPathPosition(t);
        const projected = project(pos.x, pos.y, pos.z);
        if (projected) {
            if (t === 0) ctx.moveTo(projected.x, projected.y);
            else ctx.lineTo(projected.x, projected.y);
        }
    }
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawProgressIndicator() {
    const barWidth = 200;
    const barHeight = 6;
    const x = (canvas.width - barWidth) / 2;
    const y = canvas.height - 20;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = 'rgba(100, 181, 246, 0.8)';
    ctx.fillRect(x, y, barWidth * pathProgress, barHeight);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.strokeRect(x, y, barWidth, barHeight);
}

function update() {
    if (isPlaying) {
        pathProgress += 0.0005 * speed;
        if (pathProgress >= 1) pathProgress = 0;
    }

    const pos = getPathPosition(pathProgress);
    const dir = getPathDirection(pathProgress);

    camX = pos.x;
    camY = pos.y;
    camZ = pos.z;

    // Normalize direction
    const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
    lookX = dir.x / len;
    lookY = dir.y / len;
    lookZ = dir.z / len;
}

function draw() {
    update();

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a1929');
    gradient.addColorStop(0.5, '#1e3c72');
    gradient.addColorStop(1, '#2a5298');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#0a1929';
    ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

    // Draw pillars sorted by depth
    const drawables = pillars
        .map(p => drawPillar(p))
        .filter(d => d !== null)
        .sort((a, b) => b.z - a.z);

    drawables.forEach(d => d.draw());

    // Path preview (optional - comment out for cleaner view)
    // drawPathPreview();

    drawProgressIndicator();

    // HUD
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`進度: ${(pathProgress * 100).toFixed(1)}%`, 10, 20);
    ctx.fillText(isPlaying ? '播放中' : '已暫停', 10, 32);

    requestAnimationFrame(draw);
}

playBtn.addEventListener('click', () => {
    isPlaying = true;
    infoEl.textContent = '相機沿路徑移動中...';
});

pauseBtn.addEventListener('click', () => {
    isPlaying = false;
    infoEl.textContent = '已暫停';
});

speedSlider.addEventListener('input', (e) => {
    speed = parseInt(e.target.value);
    speedLabel.textContent = `速度: ${speed}`;
});

draw();
