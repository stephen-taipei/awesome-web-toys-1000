const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const addBtn = document.getElementById('addBtn');
const infoEl = document.getElementById('info');

let rotY = 0.3;
let isDragging = false;
let draggedObject = null;
let lastX, lastY;
let dragStartPos = null;

// State management
let objects = [
    { id: 1, x: 0, y: 0, z: 0, size: 0.6, hue: 180 },
    { id: 2, x: -1.5, y: 0, z: 1, size: 0.5, hue: 45 },
    { id: 3, x: 1.5, y: 0, z: -1, size: 0.5, hue: 300 }
];

const history = [];
const future = [];
let nextId = 4;

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function saveState() {
    history.push(deepClone(objects));
    future.length = 0; // Clear redo stack
    updateButtons();
}

function undo() {
    if (history.length === 0) return;
    future.push(deepClone(objects));
    objects = history.pop();
    updateButtons();
    infoEl.textContent = `復原 (剩餘 ${history.length} 步)`;
}

function redo() {
    if (future.length === 0) return;
    history.push(deepClone(objects));
    objects = future.pop();
    updateButtons();
    infoEl.textContent = `重做 (剩餘 ${future.length} 步)`;
}

function updateButtons() {
    undoBtn.disabled = history.length === 0;
    redoBtn.disabled = future.length === 0;
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

function drawObject(obj) {
    const s = obj.size / 2;
    const vertices = [
        [obj.x - s, obj.y - s, obj.z - s], [obj.x + s, obj.y - s, obj.z - s],
        [obj.x + s, obj.y + s, obj.z - s], [obj.x - s, obj.y + s, obj.z - s],
        [obj.x - s, obj.y - s, obj.z + s], [obj.x + s, obj.y - s, obj.z + s],
        [obj.x + s, obj.y + s, obj.z + s], [obj.x - s, obj.y + s, obj.z + s]
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
        const highlight = draggedObject === obj ? 15 : 0;
        ctx.fillStyle = `hsla(${obj.hue}, 60%, ${l + highlight}%, 0.9)`;
        ctx.fill();
        ctx.strokeStyle = draggedObject === obj ? '#1abc9c' : `hsla(${obj.hue}, 70%, ${l + 15}%, 0.5)`;
        ctx.lineWidth = draggedObject === obj ? 2 : 1;
        ctx.stroke();
    });
}

function getObjectAtPoint(mx, my) {
    const sorted = [...objects].map(obj => {
        const center = project(obj.x, obj.y, obj.z);
        return { obj, center };
    }).filter(o => o.center !== null)
      .sort((a, b) => a.center.z - b.center.z);

    for (const item of sorted) {
        const dist = Math.hypot(mx - item.center.x, my - item.center.y);
        if (dist < 25) return item.obj;
    }
    return null;
}

function draw() {
    ctx.fillStyle = '#1a2530';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(26, 188, 156, 0.1)';
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
        const p1 = project(i, 1, -5);
        const p2 = project(i, 1, 5);
        if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    // Sort and draw objects
    const sorted = [...objects].sort((a, b) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const zA = -a.x * sinY + a.z * cosY;
        const zB = -b.x * sinY + b.z * cosY;
        return zB - zA;
    });

    sorted.forEach(obj => drawObject(obj));

    // History indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`歷史: ${history.length} | 重做: ${future.length}`, 10, 20);

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
        dragStartPos = { x: draggedObject.x, z: draggedObject.z };
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
    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);

    draggedObject.x += dx * cos;
    draggedObject.z += dx * sin;

    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    if (isDragging && draggedObject && dragStartPos) {
        // Only save state if position actually changed
        const moved = Math.abs(draggedObject.x - dragStartPos.x) > 0.1 ||
                     Math.abs(draggedObject.z - dragStartPos.z) > 0.1;
        if (moved) {
            // Restore original position first, then save state
            const newX = draggedObject.x;
            const newZ = draggedObject.z;
            draggedObject.x = dragStartPos.x;
            draggedObject.z = dragStartPos.z;
            saveState();
            draggedObject.x = newX;
            draggedObject.z = newZ;
            infoEl.textContent = '已移動物件';
        }
    }
    isDragging = false;
    draggedObject = null;
    dragStartPos = null;
    canvas.style.cursor = 'default';
});

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

addBtn.addEventListener('click', () => {
    saveState();
    objects.push({
        id: nextId++,
        x: (Math.random() - 0.5) * 3,
        y: 0,
        z: (Math.random() - 0.5) * 3,
        size: 0.4 + Math.random() * 0.3,
        hue: Math.random() * 360
    });
    infoEl.textContent = `新增物件 (共 ${objects.length} 個)`;
});

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
    }
});

updateButtons();
draw();
