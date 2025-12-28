const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

// Camera state
let camX = 0, camY = 0, camZ = -5;
let yaw = 0, pitch = 0;
const moveSpeed = 0.1;
const lookSpeed = 0.003;

// Input state
const keys = {};
let isLocked = false;

// 3D world - cubes
const cubes = [];
for (let i = 0; i < 20; i++) {
    cubes.push({
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 20,
        size: 0.5 + Math.random() * 0.5,
        hue: Math.random() * 360
    });
}

// Ground grid
const gridSize = 20;
const gridStep = 2;

function rotateY(x, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [x * cos + z * sin, -x * sin + z * cos];
}

function rotateX(y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [y * cos - z * sin, y * sin + z * cos];
}

function project(x, y, z) {
    // Transform to camera space
    let dx = x - camX;
    let dy = y - camY;
    let dz = z - camZ;

    // Rotate by yaw (around Y axis)
    [dx, dz] = rotateY(dx, dz, -yaw);

    // Rotate by pitch (around X axis)
    [dy, dz] = rotateX(dy, dz, -pitch);

    if (dz <= 0.1) return null;

    const fov = 300;
    const sx = canvas.width / 2 + (dx / dz) * fov;
    const sy = canvas.height / 2 + (dy / dz) * fov;

    return { x: sx, y: sy, z: dz };
}

function drawCube(cube) {
    const { x, y, z, size, hue } = cube;
    const s = size / 2;

    const vertices = [
        [x - s, y - s, z - s], [x + s, y - s, z - s],
        [x + s, y + s, z - s], [x - s, y + s, z - s],
        [x - s, y - s, z + s], [x + s, y - s, z + s],
        [x + s, y + s, z + s], [x - s, y + s, z + s]
    ];

    const faces = [
        [0, 1, 2, 3], [4, 5, 6, 7],
        [0, 4, 7, 3], [1, 5, 6, 2],
        [3, 2, 6, 7], [0, 1, 5, 4]
    ];

    const projectedVerts = vertices.map(v => project(...v));
    if (projectedVerts.some(v => v === null)) return null;

    const avgZ = projectedVerts.reduce((sum, v) => sum + v.z, 0) / 8;

    return {
        avgZ,
        draw: () => {
            faces.forEach((face, idx) => {
                const points = face.map(i => projectedVerts[i]);
                if (points.some(p => p === null)) return;

                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();

                const brightness = 30 + idx * 10;
                ctx.fillStyle = `hsla(${hue}, 60%, ${brightness}%, 0.9)`;
                ctx.fill();
                ctx.strokeStyle = `hsla(${hue}, 70%, ${brightness + 20}%, 0.5)`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            });
        }
    };
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.lineWidth = 1;

    for (let x = -gridSize; x <= gridSize; x += gridStep) {
        const p1 = project(x, 1, -gridSize);
        const p2 = project(x, 1, gridSize);
        if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    for (let z = -gridSize; z <= gridSize; z += gridStep) {
        const p1 = project(-gridSize, 1, z);
        const p2 = project(gridSize, 1, z);
        if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }
}

function update() {
    // Movement
    let moveX = 0, moveZ = 0;

    if (keys['w'] || keys['arrowup']) moveZ = moveSpeed;
    if (keys['s'] || keys['arrowdown']) moveZ = -moveSpeed;
    if (keys['a'] || keys['arrowleft']) moveX = -moveSpeed;
    if (keys['d'] || keys['arrowright']) moveX = moveSpeed;

    // Apply movement in look direction
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    camX += moveX * cos + moveZ * sin;
    camZ += -moveX * sin + moveZ * cos;
}

function draw() {
    update();

    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
    gradient.addColorStop(0, '#1a1a3e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

    drawGrid();

    // Draw cubes (sorted by depth)
    const drawables = cubes
        .map(cube => drawCube(cube))
        .filter(d => d !== null)
        .sort((a, b) => b.avgZ - a.avgZ);

    drawables.forEach(d => d.draw());

    // Crosshair
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();

    // Position indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`X:${camX.toFixed(1)} Z:${camZ.toFixed(1)}`, 10, 20);

    requestAnimationFrame(draw);
}

// Input handling
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    isLocked = document.pointerLockElement === canvas;
    infoEl.textContent = isLocked ? '移動中... ESC 退出' : '點擊畫布開始，WASD 移動，滑鼠轉向';
});

document.addEventListener('mousemove', (e) => {
    if (!isLocked) return;
    yaw += e.movementX * lookSpeed;
    pitch += e.movementY * lookSpeed;
    pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch));
});

draw();
