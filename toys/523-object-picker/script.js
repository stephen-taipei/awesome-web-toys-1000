const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const selectAllBtn = document.getElementById('selectAllBtn');
const deselectBtn = document.getElementById('deselectBtn');
const deleteBtn = document.getElementById('deleteBtn');
const infoEl = document.getElementById('info');

let rotY = 0.3;

const objects = [];
for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 2 + (i % 2);
    objects.push({
        id: i + 1,
        x: Math.cos(angle) * radius,
        y: -Math.random() * 1.5,
        z: Math.sin(angle) * radius,
        size: 0.5 + Math.random() * 0.3,
        hue: (i / 8) * 360,
        selected: false
    });
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
        ctx.fillStyle = `hsla(${obj.hue}, 60%, ${l}%, 0.9)`;
        ctx.fill();

        if (obj.selected) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = `hsla(${obj.hue}, 70%, ${l + 15}%, 0.5)`;
            ctx.lineWidth = 1;
        }
        ctx.stroke();
    });

    // Selection highlight glow
    if (obj.selected) {
        const center = project(obj.x, obj.y, obj.z);
        if (center) {
            ctx.beginPath();
            ctx.arc(center.x, center.y, obj.size * 50 / center.z, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    // ID label
    const labelPos = project(obj.x, obj.y - obj.size - 0.3, obj.z);
    if (labelPos && labelPos.z < 10) {
        ctx.fillStyle = obj.selected ? '#ffff00' : 'rgba(255, 255, 255, 0.7)';
        ctx.font = `bold ${Math.max(8, 12 - labelPos.z)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`#${obj.id}`, labelPos.x, labelPos.y);
    }
}

function getObjectAtPoint(mx, my) {
    const sorted = [...objects].map(obj => {
        const center = project(obj.x, obj.y, obj.z);
        return { obj, center };
    }).filter(o => o.center !== null)
      .sort((a, b) => a.center.z - b.center.z);

    for (const item of sorted) {
        const screenSize = item.obj.size * 60 / item.center.z;
        const dist = Math.hypot(mx - item.center.x, my - item.center.y);
        if (dist < screenSize) return item.obj;
    }
    return null;
}

function updateInfo() {
    const selected = objects.filter(o => o.selected);
    if (selected.length === 0) {
        infoEl.textContent = '點擊選取物件，Shift+點擊多選';
    } else if (selected.length === 1) {
        infoEl.textContent = `已選取 #${selected[0].id}`;
    } else {
        infoEl.textContent = `已選取 ${selected.length} 個物件`;
    }
}

function draw() {
    ctx.fillStyle = '#1a252f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(116, 185, 255, 0.1)';
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
        const p3 = project(-5, 1.5, i);
        const p4 = project(5, 1.5, i);
        if (p3 && p4) {
            ctx.beginPath();
            ctx.moveTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
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

    // Selection count
    const selectedCount = objects.filter(o => o.selected).length;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`選取: ${selectedCount}/${objects.length}`, 10, 20);

    rotY += 0.003;

    requestAnimationFrame(draw);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const clicked = getObjectAtPoint(mx, my);

    if (!e.shiftKey) {
        // Single select - deselect all first
        objects.forEach(o => o.selected = false);
    }

    if (clicked) {
        clicked.selected = !clicked.selected;
    }

    updateInfo();
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hovered = getObjectAtPoint(mx, my);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
});

selectAllBtn.addEventListener('click', () => {
    objects.forEach(o => o.selected = true);
    updateInfo();
});

deselectBtn.addEventListener('click', () => {
    objects.forEach(o => o.selected = false);
    updateInfo();
});

deleteBtn.addEventListener('click', () => {
    const toDelete = objects.filter(o => o.selected);
    if (toDelete.length === 0) return;

    toDelete.forEach(obj => {
        const idx = objects.indexOf(obj);
        if (idx !== -1) objects.splice(idx, 1);
    });

    infoEl.textContent = `已刪除 ${toDelete.length} 個物件`;
});

draw();
