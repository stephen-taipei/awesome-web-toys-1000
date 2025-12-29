const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const buttons = document.querySelectorAll('.cam-btn');
const infoEl = document.getElementById('info');

let currentCamera = 0;
let transitionProgress = 1;
let time = 0;

// Camera configurations
const cameras = [
    { name: '正面視角', x: 0, y: 0, z: -8, pitch: 0, yaw: 0 },
    { name: '側面視角', x: 8, y: 0, z: 0, pitch: 0, yaw: Math.PI / 2 },
    { name: '俯視視角', x: 0, y: -8, z: 0, pitch: Math.PI / 2, yaw: 0 },
    { name: '追蹤視角', x: 0, y: -3, z: -6, pitch: 0.3, yaw: 0 }
];

let camState = { ...cameras[0] };
let targetCam = { ...cameras[0] };

// Moving object to track
let objectAngle = 0;

// Scene objects
const cubes = [
    { x: 0, y: 0, z: 0, size: 1, hue: 45 },
    { x: -2.5, y: 0.5, z: 2, size: 0.7, hue: 200 },
    { x: 2.5, y: -0.5, z: -2, size: 0.8, hue: 320 }
];

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function project(x, y, z) {
    let dx = x - camState.x;
    let dy = y - camState.y;
    let dz = z - camState.z;

    // Yaw rotation
    let cos = Math.cos(-camState.yaw), sin = Math.sin(-camState.yaw);
    [dx, dz] = [dx * cos + dz * sin, -dx * sin + dz * cos];

    // Pitch rotation
    cos = Math.cos(-camState.pitch); sin = Math.sin(-camState.pitch);
    [dy, dz] = [dy * cos - dz * sin, dy * sin + dz * cos];

    if (dz <= 0.1) return null;

    const fov = 180;
    return {
        x: canvas.width / 2 + (dx / dz) * fov,
        y: canvas.height / 2 + (dy / dz) * fov,
        z: dz
    };
}

function drawCube(cube) {
    const s = cube.size / 2;
    const cx = cube.x, cy = cube.y, cz = cube.z;

    const vertices = [
        [cx - s, cy - s, cz - s], [cx + s, cy - s, cz - s],
        [cx + s, cy + s, cz - s], [cx - s, cy + s, cz - s],
        [cx - s, cy - s, cz + s], [cx + s, cy - s, cz + s],
        [cx + s, cy + s, cz + s], [cx - s, cy + s, cz + s]
    ];

    const faces = [
        { verts: [0, 1, 2, 3], shade: 0.9 },
        { verts: [4, 5, 6, 7], shade: 0.9 },
        { verts: [0, 4, 7, 3], shade: 0.7 },
        { verts: [1, 5, 6, 2], shade: 1.0 },
        { verts: [3, 2, 6, 7], shade: 0.8 },
        { verts: [0, 1, 5, 4], shade: 0.6 }
    ];

    const projected = vertices.map(v => project(...v));
    if (projected.some(p => p === null)) return null;

    const avgZ = projected.reduce((s, p) => s + p.z, 0) / 8;

    return {
        avgZ,
        draw: () => {
            faces.forEach(face => {
                const points = face.verts.map(i => projected[i]);
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();

                const l = 40 + face.shade * 25;
                ctx.fillStyle = `hsla(${cube.hue}, 60%, ${l}%, 0.9)`;
                ctx.fill();
                ctx.strokeStyle = `hsla(${cube.hue}, 70%, ${l + 15}%, 0.6)`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            });
        }
    };
}

function drawGrid() {
    const gridSize = 8;
    const step = 2;
    const y = 2;

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)';
    ctx.lineWidth = 1;

    for (let x = -gridSize; x <= gridSize; x += step) {
        const p1 = project(x, y, -gridSize);
        const p2 = project(x, y, gridSize);
        if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    for (let z = -gridSize; z <= gridSize; z += step) {
        const p1 = project(-gridSize, y, z);
        const p2 = project(gridSize, y, z);
        if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }
}

function drawAxes() {
    const origin = project(0, 0, 0);
    if (!origin) return;

    const axes = [
        { end: [2, 0, 0], color: '#ff4444', label: 'X' },
        { end: [0, -2, 0], color: '#44ff44', label: 'Y' },
        { end: [0, 0, 2], color: '#4444ff', label: 'Z' }
    ];

    axes.forEach(axis => {
        const end = project(...axis.end);
        if (end) {
            ctx.strokeStyle = axis.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            ctx.fillStyle = axis.color;
            ctx.font = 'bold 12px Arial';
            ctx.fillText(axis.label, end.x + 5, end.y);
        }
    });
}

function update() {
    time += 0.016;
    objectAngle += 0.02;

    // Update tracking camera
    if (currentCamera === 3) {
        const trackX = Math.cos(objectAngle) * 3;
        const trackZ = Math.sin(objectAngle) * 3;
        targetCam.x = trackX - 4;
        targetCam.z = trackZ - 4;
        targetCam.yaw = Math.atan2(trackX - targetCam.x, trackZ - targetCam.z);
    }

    // Smooth camera transition
    if (transitionProgress < 1) {
        transitionProgress += 0.03;
        transitionProgress = Math.min(1, transitionProgress);

        const t = 1 - Math.pow(1 - transitionProgress, 3); // Ease out cubic
        camState.x = lerp(camState.x, targetCam.x, t * 0.1);
        camState.y = lerp(camState.y, targetCam.y, t * 0.1);
        camState.z = lerp(camState.z, targetCam.z, t * 0.1);
        camState.pitch = lerp(camState.pitch, targetCam.pitch, t * 0.1);
        camState.yaw = lerp(camState.yaw, targetCam.yaw, t * 0.1);
    } else if (currentCamera === 3) {
        // Continuously track
        camState.x = lerp(camState.x, targetCam.x, 0.05);
        camState.z = lerp(camState.z, targetCam.z, 0.05);
        camState.yaw = lerp(camState.yaw, targetCam.yaw, 0.05);
    }

    // Animate first cube rotation
    cubes[0].x = Math.cos(objectAngle) * 0.5;
    cubes[0].z = Math.sin(objectAngle) * 0.5;
}

function draw() {
    update();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawAxes();

    // Draw cubes sorted by depth
    const drawables = cubes
        .map(c => drawCube(c))
        .filter(d => d !== null)
        .sort((a, b) => b.avgZ - a.avgZ);

    drawables.forEach(d => d.draw());

    // Camera indicator
    ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Camera: ${cameras[currentCamera].name}`, 10, 20);

    // Camera position
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText(`X:${camState.x.toFixed(1)} Y:${camState.y.toFixed(1)} Z:${camState.z.toFixed(1)}`, 10, 35);

    // Transition indicator
    if (transitionProgress < 1) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.fillRect(0, canvas.height - 4, canvas.width * transitionProgress, 4);
    }

    requestAnimationFrame(draw);
}

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const camIndex = parseInt(btn.dataset.cam);
        if (camIndex !== currentCamera) {
            currentCamera = camIndex;
            targetCam = { ...cameras[camIndex] };
            transitionProgress = 0;

            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            infoEl.textContent = cameras[camIndex].name;
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key >= '1' && key <= '4') {
        const index = parseInt(key) - 1;
        buttons[index].click();
    }
});

draw();
