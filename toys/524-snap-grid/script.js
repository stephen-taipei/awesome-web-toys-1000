const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gridSizeSelect = document.getElementById('gridSize');
const snapToggle = document.getElementById('snapToggle');
const infoEl = document.getElementById('info');

let rotY = 0.3;
let gridSize = 1;
let snapEnabled = true;
let isDragging = false;
let draggedObject = null;
let lastX, lastY;

const objects = [
    { x: 0, y: 0, z: 0, size: 0.6, hue: 160 },
    { x: 2, y: 0, z: 1, size: 0.6, hue: 280 },
    { x: -1, y: 0, z: -2, size: 0.6, hue: 45 }
];

function snap(value) {
    if (!snapEnabled) return value;
    return Math.round(value / gridSize) * gridSize;
}

function project(x, y, z) {
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

function drawGrid() {
    const range = 5;

    // Draw grid lines
    for (let i = -range; i <= range; i += gridSize) {
        // X lines
        const p1 = project(i, 1, -range);
        const p2 = project(i, 1, range);
        if (p1 && p2) {
            ctx.strokeStyle = Math.abs(i) < 0.01 ? 'rgba(0, 255, 136, 0.4)' : 'rgba(0, 255, 136, 0.15)';
            ctx.lineWidth = Math.abs(i) < 0.01 ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }

        // Z lines
        const p3 = project(-range, 1, i);
        const p4 = project(range, 1, i);
        if (p3 && p4) {
            ctx.strokeStyle = Math.abs(i) < 0.01 ? 'rgba(0, 255, 136, 0.4)' : 'rgba(0, 255, 136, 0.15)';
            ctx.lineWidth = Math.abs(i) < 0.01 ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.stroke();
        }
    }

    // Grid intersection points
    if (snapEnabled) {
        for (let x = -range; x <= range; x += gridSize) {
            for (let z = -range; z <= range; z += gridSize) {
                const p = project(x, 1, z);
                if (p && p.z < 12) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
                    ctx.fill();
                }
            }
        }
    }
}

function drawObject(obj) {
    const s = obj.size / 2;
    const baseY = obj.y;

    const vertices = [
        [obj.x - s, baseY - s, obj.z - s], [obj.x + s, baseY - s, obj.z - s],
        [obj.x + s, baseY + s, obj.z - s], [obj.x - s, baseY + s, obj.z - s],
        [obj.x - s, baseY - s, obj.z + s], [obj.x + s, baseY - s, obj.z + s],
        [obj.x + s, baseY + s, obj.z + s], [obj.x - s, baseY + s, obj.z + s]
    ];

    const projected = vertices.map(v => project(...v));
    if (projected.some(p => p === null)) return;

    const faces = [
        { verts: [0, 1, 2, 3], shade: 0.8 },
        { verts: [4, 5, 6, 7], shade: 0.8 },
        { verts: [0, 4, 7, 3], shade: 0.6 },
        { verts: [1, 5, 6, 2], shade: 1.0 },
        { verts: [3, 2, 6, 7], shade: 0.9 },
        { verts: [0, 1, 5, 4], shade: 0.5 }
    ];

    faces.forEach(face => {
        const points = face.verts.map(i => projected[i]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        const l = 35 + face.shade * 25;
        const highlight = draggedObject === obj ? 20 : 0;
        ctx.fillStyle = `hsla(${obj.hue}, 60%, ${l + highlight}%, 0.9)`;
        ctx.fill();
        ctx.strokeStyle = draggedObject === obj ? '#00ff88' : `hsla(${obj.hue}, 70%, ${l + 15}%, 0.5)`;
        ctx.lineWidth = draggedObject === obj ? 2 : 1;
        ctx.stroke();
    });

    // Position label
    const labelPos = project(obj.x, obj.y - 0.8, obj.z);
    if (labelPos && labelPos.z < 10) {
        ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`(${obj.x.toFixed(1)}, ${obj.z.toFixed(1)})`, labelPos.x, labelPos.y);
    }
}

function getObjectAtPoint(mx, my) {
    const sorted = [...objects].map(obj => {
        const center = project(obj.x, obj.y, obj.z);
        return { obj, center };
    }).filter(o => o.center !== null)
      .sort((a, b) => a.center.z - b.center.z);

    for (const item of sorted) {
        const dist = Math.hypot(mx - item.center.x, my - item.center.y);
        if (dist < 30) return item.obj;
    }
    return null;
}

function draw() {
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    // Sort and draw objects
    const sorted = [...objects].sort((a, b) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const zA = -a.x * sinY + a.z * cosY;
        const zB = -b.x * sinY + b.z * cosY;
        return zB - zA;
    });

    sorted.forEach(obj => drawObject(obj));

    // Snap indicator
    ctx.fillStyle = snapEnabled ? 'rgba(0, 255, 136, 0.8)' : 'rgba(255, 100, 100, 0.8)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Snap: ${snapEnabled ? 'ON' : 'OFF'} | Grid: ${gridSize}`, 10, 20);

    if (!isDragging) rotY += 0.003;

    requestAnimationFrame(draw);
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    draggedObject = getObjectAtPoint(mx, my);
    if (draggedObject) {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (!isDragging) {
        const hovered = getObjectAtPoint(mx, my);
        canvas.style.cursor = hovered ? 'grab' : 'default';
        return;
    }

    const dx = (e.clientX - lastX) * 0.02;
    const dy = (e.clientY - lastY) * 0.02;

    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);

    draggedObject.x += dx * cos;
    draggedObject.z += dx * sin;

    // Apply snap
    draggedObject.x = snap(draggedObject.x);
    draggedObject.z = snap(draggedObject.z);

    lastX = e.clientX;
    lastY = e.clientY;

    infoEl.textContent = `位置: (${draggedObject.x.toFixed(1)}, ${draggedObject.z.toFixed(1)})`;
});

canvas.addEventListener('mouseup', () => {
    if (isDragging && draggedObject) {
        // Final snap
        draggedObject.x = snap(draggedObject.x);
        draggedObject.z = snap(draggedObject.z);
        infoEl.textContent = '拖曳物件自動對齊格點';
    }
    isDragging = false;
    draggedObject = null;
    canvas.style.cursor = 'default';
});

gridSizeSelect.addEventListener('change', (e) => {
    gridSize = parseFloat(e.target.value);
});

snapToggle.addEventListener('click', () => {
    snapEnabled = !snapEnabled;
    snapToggle.textContent = snapEnabled ? '吸附開' : '吸附關';
    snapToggle.classList.toggle('active', snapEnabled);
});

draw();
