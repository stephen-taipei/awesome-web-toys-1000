const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const buttons = document.querySelectorAll('.mode-btn');
const infoEl = document.getElementById('info');

let mode = 'translate';
let rotY = 0.3;

// Object state
let obj = {
    x: 0, y: 0, z: 0,
    rotX: 0, rotY: 0, rotZ: 0,
    scaleX: 1, scaleY: 1, scaleZ: 1
};

let isDragging = false;
let dragAxis = null;
let lastX, lastY;

function rotate(v, rx, ry, rz) {
    let [x, y, z] = v;

    // Rotate around Z
    let cos = Math.cos(rz), sin = Math.sin(rz);
    [x, y] = [x * cos - y * sin, x * sin + y * cos];

    // Rotate around Y
    cos = Math.cos(ry); sin = Math.sin(ry);
    [x, z] = [x * cos + z * sin, -x * sin + z * cos];

    // Rotate around X
    cos = Math.cos(rx); sin = Math.sin(rx);
    [y, z] = [y * cos - z * sin, y * sin + z * cos];

    return [x, y, z];
}

function project(x, y, z) {
    // Camera rotation
    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);
    const rx = x * cos + z * sin;
    const rz = -x * sin + z * cos;

    const dist = 8;
    const adjustedZ = rz + dist;
    if (adjustedZ <= 0.1) return null;

    const fov = 180;
    return {
        x: canvas.width / 2 + (rx / adjustedZ) * fov,
        y: canvas.height / 2 + (y / adjustedZ) * fov,
        z: adjustedZ
    };
}

function drawCube() {
    const s = 0.8;
    const vertices = [
        [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
        [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]
    ];

    // Apply object transforms
    const transformed = vertices.map(v => {
        let [x, y, z] = v;
        // Scale
        x *= obj.scaleX;
        y *= obj.scaleY;
        z *= obj.scaleZ;
        // Rotate
        [x, y, z] = rotate([x, y, z], obj.rotX, obj.rotY, obj.rotZ);
        // Translate
        return [x + obj.x, y + obj.y, z + obj.z];
    });

    const projected = transformed.map(v => project(...v));

    const faces = [
        { verts: [0, 1, 2, 3], shade: 0.8 },
        { verts: [4, 5, 6, 7], shade: 0.8 },
        { verts: [0, 4, 7, 3], shade: 0.6 },
        { verts: [1, 5, 6, 2], shade: 1.0 },
        { verts: [3, 2, 6, 7], shade: 0.9 },
        { verts: [0, 1, 5, 4], shade: 0.5 }
    ];

    // Sort faces by average z
    const sortedFaces = faces.map(f => ({
        ...f,
        avgZ: f.verts.reduce((s, i) => s + transformed[i][2], 0) / 4
    })).sort((a, b) => a.avgZ - b.avgZ);

    sortedFaces.forEach(face => {
        const points = face.verts.map(i => projected[i]).filter(p => p !== null);
        if (points.length < 3) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        const l = 30 + face.shade * 30;
        ctx.fillStyle = `hsla(200, 60%, ${l}%, 0.9)`;
        ctx.fill();
        ctx.strokeStyle = `hsla(200, 70%, ${l + 15}%, 0.5)`;
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

function drawGizmo() {
    const origin = project(obj.x, obj.y, obj.z);
    if (!origin) return;

    const axisLength = mode === 'translate' ? 2 : (mode === 'rotate' ? 1.5 : 1.2);
    const axes = [
        { dir: [axisLength, 0, 0], color: '#ff4444', axis: 'x' },
        { dir: [0, -axisLength, 0], color: '#44ff44', axis: 'y' },
        { dir: [0, 0, axisLength], color: '#4444ff', axis: 'z' }
    ];

    axes.forEach(ax => {
        const endPoint = project(
            obj.x + ax.dir[0],
            obj.y + ax.dir[1],
            obj.z + ax.dir[2]
        );

        if (!endPoint) return;

        // Draw axis line
        ctx.strokeStyle = dragAxis === ax.axis ? '#ffffff' : ax.color;
        ctx.lineWidth = dragAxis === ax.axis ? 4 : 3;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();

        // Draw arrow/handle
        if (mode === 'translate') {
            // Arrow head
            const dx = endPoint.x - origin.x;
            const dy = endPoint.y - origin.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / len;
            const ny = dy / len;

            ctx.beginPath();
            ctx.moveTo(endPoint.x, endPoint.y);
            ctx.lineTo(endPoint.x - nx * 10 - ny * 5, endPoint.y - ny * 10 + nx * 5);
            ctx.lineTo(endPoint.x - nx * 10 + ny * 5, endPoint.y - ny * 10 - nx * 5);
            ctx.closePath();
            ctx.fillStyle = ax.color;
            ctx.fill();
        } else if (mode === 'rotate') {
            // Circle arc
            ctx.beginPath();
            ctx.arc(origin.x, origin.y, 40, 0, Math.PI * 2);
            ctx.strokeStyle = `${ax.color}40`;
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Scale cube
            ctx.fillStyle = ax.color;
            ctx.fillRect(endPoint.x - 5, endPoint.y - 5, 10, 10);
        }
    });

    // Center sphere
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffff00';
    ctx.fill();
}

function getHoveredAxis(mx, my) {
    const origin = project(obj.x, obj.y, obj.z);
    if (!origin) return null;

    const axes = [
        { dir: [2, 0, 0], axis: 'x' },
        { dir: [0, -2, 0], axis: 'y' },
        { dir: [0, 0, 2], axis: 'z' }
    ];

    for (const ax of axes) {
        const end = project(obj.x + ax.dir[0], obj.y + ax.dir[1], obj.z + ax.dir[2]);
        if (!end) continue;

        // Check distance to line
        const dx = end.x - origin.x;
        const dy = end.y - origin.y;
        const t = Math.max(0, Math.min(1,
            ((mx - origin.x) * dx + (my - origin.y) * dy) / (dx * dx + dy * dy)
        ));
        const closestX = origin.x + t * dx;
        const closestY = origin.y + t * dy;
        const dist = Math.hypot(mx - closestX, my - closestY);

        if (dist < 15) return ax.axis;
    }

    return null;
}

function draw() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
        const p1 = project(i, 2, -5);
        const p2 = project(i, 2, 5);
        const p3 = project(-5, 2, i);
        const p4 = project(5, 2, i);
        if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
        if (p3 && p4) {
            ctx.beginPath();
            ctx.moveTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.stroke();
        }
    }

    drawCube();
    drawGizmo();

    // Info display
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    if (mode === 'translate') {
        ctx.fillText(`位置: (${obj.x.toFixed(2)}, ${obj.y.toFixed(2)}, ${obj.z.toFixed(2)})`, 10, 20);
    } else if (mode === 'rotate') {
        ctx.fillText(`旋轉: (${(obj.rotX * 180 / Math.PI).toFixed(0)}°, ${(obj.rotY * 180 / Math.PI).toFixed(0)}°, ${(obj.rotZ * 180 / Math.PI).toFixed(0)}°)`, 10, 20);
    } else {
        ctx.fillText(`縮放: (${obj.scaleX.toFixed(2)}, ${obj.scaleY.toFixed(2)}, ${obj.scaleZ.toFixed(2)})`, 10, 20);
    }

    if (!isDragging) rotY += 0.002;

    requestAnimationFrame(draw);
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    dragAxis = getHoveredAxis(mx, my);
    if (dragAxis) {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (!isDragging) {
        const hovered = getHoveredAxis(mx, my);
        canvas.style.cursor = hovered ? 'grab' : 'default';
        return;
    }

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const delta = (dx + dy) * 0.01;

    if (mode === 'translate') {
        if (dragAxis === 'x') obj.x += delta;
        else if (dragAxis === 'y') obj.y -= delta;
        else if (dragAxis === 'z') obj.z += delta;
    } else if (mode === 'rotate') {
        if (dragAxis === 'x') obj.rotX += delta;
        else if (dragAxis === 'y') obj.rotY += delta;
        else if (dragAxis === 'z') obj.rotZ += delta;
    } else {
        if (dragAxis === 'x') obj.scaleX = Math.max(0.1, obj.scaleX + delta);
        else if (dragAxis === 'y') obj.scaleY = Math.max(0.1, obj.scaleY + delta);
        else if (dragAxis === 'z') obj.scaleZ = Math.max(0.1, obj.scaleZ + delta);
    }

    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    dragAxis = null;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    dragAxis = null;
});

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        mode = btn.dataset.mode;
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const modeNames = { translate: '移動模式', rotate: '旋轉模式', scale: '縮放模式' };
        infoEl.textContent = modeNames[mode];
    });
});

draw();
