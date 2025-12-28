const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const buttons = document.querySelectorAll('.pivot-btn');
const infoEl = document.getElementById('info');

let camRotY = 0.3;
let objectRotation = 0;
let pivotMode = 'center';

// Object and pivot
const obj = { x: 0, y: 0, z: 0, size: 1.5 };
let pivot = { x: 0, y: 0, z: 0 };
let customPivot = { x: 1, y: 0, z: 0 };

function updatePivot() {
    switch (pivotMode) {
        case 'center':
            pivot = { x: obj.x, y: obj.y, z: obj.z };
            break;
        case 'corner':
            pivot = { x: obj.x + obj.size / 2, y: obj.y + obj.size / 2, z: obj.z + obj.size / 2 };
            break;
        case 'custom':
            pivot = { ...customPivot };
            break;
    }
}

function rotateAroundPivot(x, y, z, px, py, pz, angle) {
    // Translate to pivot
    let dx = x - px;
    let dy = y - py;
    let dz = z - pz;

    // Rotate around Y axis
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rx = dx * cos + dz * sin;
    const rz = -dx * sin + dz * cos;

    // Translate back
    return [rx + px, dy + py, rz + pz];
}

function project(x, y, z) {
    const cos = Math.cos(camRotY);
    const sin = Math.sin(camRotY);
    const rx = x * cos + z * sin;
    const rz = -x * sin + z * cos;

    const dist = 8;
    const adjustedZ = rz + dist;
    if (adjustedZ <= 0.1) return null;

    const fov = 150;
    return {
        x: canvas.width / 2 + (rx / adjustedZ) * fov,
        y: canvas.height / 2 + (y / adjustedZ) * fov,
        z: adjustedZ
    };
}

function drawCube() {
    const s = obj.size / 2;
    const baseVertices = [
        [obj.x - s, obj.y - s, obj.z - s], [obj.x + s, obj.y - s, obj.z - s],
        [obj.x + s, obj.y + s, obj.z - s], [obj.x - s, obj.y + s, obj.z - s],
        [obj.x - s, obj.y - s, obj.z + s], [obj.x + s, obj.y - s, obj.z + s],
        [obj.x + s, obj.y + s, obj.z + s], [obj.x - s, obj.y + s, obj.z + s]
    ];

    // Apply rotation around pivot
    const vertices = baseVertices.map(v =>
        rotateAroundPivot(v[0], v[1], v[2], pivot.x, pivot.y, pivot.z, objectRotation)
    );

    const projected = vertices.map(v => project(...v));
    if (projected.some(p => p === null)) return;

    const faces = [
        { verts: [0, 1, 2, 3], shade: 0.8, hue: 45 },
        { verts: [4, 5, 6, 7], shade: 0.8, hue: 45 },
        { verts: [0, 4, 7, 3], shade: 0.6, hue: 200 },
        { verts: [1, 5, 6, 2], shade: 1.0, hue: 200 },
        { verts: [3, 2, 6, 7], shade: 0.9, hue: 300 },
        { verts: [0, 1, 5, 4], shade: 0.5, hue: 300 }
    ];

    // Sort faces by average z
    const sortedFaces = faces.map((f, i) => ({
        ...f,
        avgZ: f.verts.reduce((s, v) => s + vertices[v][2], 0) / 4
    })).sort((a, b) => a.avgZ - b.avgZ);

    sortedFaces.forEach(face => {
        const points = face.verts.map(i => projected[i]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        const l = 35 + face.shade * 25;
        ctx.fillStyle = `hsla(${face.hue}, 60%, ${l}%, 0.9)`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${face.hue}, 70%, ${l + 15}%, 0.5)`;
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

function drawPivotIndicator() {
    // Rotate pivot position for display
    const rotatedPivot = rotateAroundPivot(pivot.x, pivot.y, pivot.z, pivot.x, pivot.y, pivot.z, 0);
    const p = project(pivot.x, pivot.y, pivot.z);
    if (!p) return;

    // Draw pivot point
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd93d';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw rotation circle
    ctx.beginPath();
    ctx.arc(p.x, p.y, 40, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 217, 61, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw rotation arrow
    const arrowAngle = objectRotation;
    const arrowX = p.x + Math.cos(arrowAngle) * 40;
    const arrowY = p.y + Math.sin(arrowAngle) * 40;
    ctx.beginPath();
    ctx.arc(arrowX, arrowY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();

    // Pivot label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('軸心', p.x, p.y - 15);
}

function drawOrbitPath() {
    // Show the path the object would trace
    if (pivotMode !== 'center') {
        ctx.strokeStyle = 'rgba(255, 217, 61, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();

        const corners = [
            [obj.x - obj.size/2, obj.y, obj.z - obj.size/2],
            [obj.x + obj.size/2, obj.y, obj.z - obj.size/2],
            [obj.x + obj.size/2, obj.y, obj.z + obj.size/2],
            [obj.x - obj.size/2, obj.y, obj.z + obj.size/2]
        ];

        corners.forEach(corner => {
            const dist = Math.hypot(corner[0] - pivot.x, corner[2] - pivot.z);
            for (let a = 0; a < Math.PI * 2; a += 0.1) {
                const rx = pivot.x + Math.cos(a) * dist;
                const rz = pivot.z + Math.sin(a) * dist;
                const p = project(rx, corner[1], rz);
                if (p) {
                    if (a === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
            }
        });
        ctx.stroke();
    }
}

function draw() {
    ctx.fillStyle = '#1a1a3e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(255, 217, 61, 0.1)';
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
        const p1 = project(i, 1.5, -5);
        const p2 = project(i, 1.5, 5);
        if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    drawOrbitPath();
    drawCube();
    drawPivotIndicator();

    // Rotation info
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`旋轉: ${(objectRotation * 180 / Math.PI).toFixed(0)}°`, 10, 20);
    ctx.fillText(`軸心: ${pivotMode}`, 10, 32);

    objectRotation += 0.02;

    requestAnimationFrame(draw);
}

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        pivotMode = btn.dataset.pivot;
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updatePivot();

        const modeNames = { center: '中心軸心', corner: '角落軸心', custom: '自訂軸心' };
        infoEl.textContent = modeNames[pivotMode];
    });
});

canvas.addEventListener('click', (e) => {
    if (pivotMode === 'custom') {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Convert screen to rough world position
        customPivot.x = ((mx - canvas.width / 2) / 50);
        customPivot.z = ((my - canvas.height / 2) / 50);
        updatePivot();
        infoEl.textContent = `自訂軸心: (${customPivot.x.toFixed(1)}, ${customPivot.z.toFixed(1)})`;
    }
});

updatePivot();
draw();
