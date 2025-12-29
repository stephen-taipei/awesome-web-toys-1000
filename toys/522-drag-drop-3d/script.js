const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const infoEl = document.getElementById('info');

let rotY = 0.4;
let isDragging = false;
let draggedObject = null;
let lastX, lastY;

const objects = [];
const shapes = ['cube', 'pyramid', 'cylinder'];
const colors = [0, 30, 60, 120, 180, 240, 280, 320];

function addObject() {
    objects.push({
        x: (Math.random() - 0.5) * 4,
        y: Math.random() * -2,
        z: (Math.random() - 0.5) * 4,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        hue: colors[Math.floor(Math.random() * colors.length)],
        size: 0.4 + Math.random() * 0.3
    });
}

// Initial objects
for (let i = 0; i < 5; i++) addObject();

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

function drawCube(obj) {
    const s = obj.size / 2;
    const vertices = [
        [obj.x - s, obj.y - s, obj.z - s], [obj.x + s, obj.y - s, obj.z - s],
        [obj.x + s, obj.y + obj.size, obj.z - s], [obj.x - s, obj.y + obj.size, obj.z - s],
        [obj.x - s, obj.y - s, obj.z + s], [obj.x + s, obj.y - s, obj.z + s],
        [obj.x + s, obj.y + obj.size, obj.z + s], [obj.x - s, obj.y + obj.size, obj.z + s]
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
        ctx.strokeStyle = `hsla(${obj.hue}, 70%, ${l + 15}%, 0.6)`;
        ctx.lineWidth = draggedObject === obj ? 2 : 1;
        ctx.stroke();
    });
}

function drawPyramid(obj) {
    const s = obj.size;
    const h = obj.size * 1.5;
    const vertices = [
        [obj.x, obj.y - h, obj.z],
        [obj.x - s/2, obj.y, obj.z - s/2],
        [obj.x + s/2, obj.y, obj.z - s/2],
        [obj.x + s/2, obj.y, obj.z + s/2],
        [obj.x - s/2, obj.y, obj.z + s/2]
    ];

    const projected = vertices.map(v => project(...v));
    if (projected.some(p => p === null)) return;

    const faces = [
        { verts: [0, 1, 2], shade: 0.9 },
        { verts: [0, 2, 3], shade: 1.0 },
        { verts: [0, 3, 4], shade: 0.8 },
        { verts: [0, 4, 1], shade: 0.7 },
        { verts: [1, 2, 3, 4], shade: 0.5 }
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
        ctx.strokeStyle = `hsla(${obj.hue}, 70%, ${l + 15}%, 0.6)`;
        ctx.lineWidth = draggedObject === obj ? 2 : 1;
        ctx.stroke();
    });
}

function drawCylinder(obj) {
    const r = obj.size / 2;
    const h = obj.size;
    const segments = 8;

    // Draw side faces
    for (let i = 0; i < segments; i++) {
        const a1 = (i / segments) * Math.PI * 2;
        const a2 = ((i + 1) / segments) * Math.PI * 2;

        const v1 = project(obj.x + Math.cos(a1) * r, obj.y, obj.z + Math.sin(a1) * r);
        const v2 = project(obj.x + Math.cos(a2) * r, obj.y, obj.z + Math.sin(a2) * r);
        const v3 = project(obj.x + Math.cos(a2) * r, obj.y - h, obj.z + Math.sin(a2) * r);
        const v4 = project(obj.x + Math.cos(a1) * r, obj.y - h, obj.z + Math.sin(a1) * r);

        if (!v1 || !v2 || !v3 || !v4) continue;

        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.lineTo(v3.x, v3.y);
        ctx.lineTo(v4.x, v4.y);
        ctx.closePath();

        const shade = 0.5 + Math.cos(a1) * 0.3;
        const l = 35 + shade * 25;
        const highlight = draggedObject === obj ? 20 : 0;
        ctx.fillStyle = `hsla(${obj.hue}, 60%, ${l + highlight}%, 0.9)`;
        ctx.fill();
    }
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(162, 155, 254, 0.15)';
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
        const p3 = project(-5, 1, i);
        const p4 = project(5, 1, i);
        if (p3 && p4) {
            ctx.beginPath();
            ctx.moveTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.stroke();
        }
    }
}

function getObjectAtPoint(mx, my) {
    // Check from front to back
    const sorted = [...objects].map((obj, idx) => {
        const center = project(obj.x, obj.y - obj.size / 2, obj.z);
        return { obj, idx, center };
    }).filter(o => o.center !== null)
      .sort((a, b) => a.center.z - b.center.z);

    for (const item of sorted) {
        const dist = Math.hypot(mx - item.center.x, my - item.center.y);
        if (dist < 30) return item.obj;
    }
    return null;
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    // Sort objects by depth
    const sorted = [...objects].sort((a, b) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const zA = -a.x * sinY + a.z * cosY;
        const zB = -b.x * sinY + b.z * cosY;
        return zB - zA;
    });

    sorted.forEach(obj => {
        if (obj.shape === 'cube') drawCube(obj);
        else if (obj.shape === 'pyramid') drawPyramid(obj);
        else drawCylinder(obj);
    });

    // Drop shadow for dragged object
    if (draggedObject) {
        const shadow = project(draggedObject.x, 1, draggedObject.z);
        if (shadow) {
            ctx.beginPath();
            ctx.ellipse(shadow.x, shadow.y, 20, 10, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fill();
        }
    }

    // Object count
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`物件數: ${objects.length}`, 10, 20);

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
        infoEl.textContent = '拖曳中...';
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

    // Move in world space based on camera rotation
    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);
    draggedObject.x += dx * cos;
    draggedObject.z += dx * sin;
    draggedObject.y += dy;

    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    if (isDragging) {
        infoEl.textContent = '拖曳物件到任意位置';
    }
    isDragging = false;
    draggedObject = null;
    canvas.style.cursor = 'default';
});

addBtn.addEventListener('click', () => {
    addObject();
    infoEl.textContent = `新增物件 (共 ${objects.length} 個)`;
});

clearBtn.addEventListener('click', () => {
    objects.length = 0;
    infoEl.textContent = '已清除全部物件';
});

draw();
