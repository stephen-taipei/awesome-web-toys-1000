const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const groupBtn = document.getElementById('groupBtn');
const ungroupBtn = document.getElementById('ungroupBtn');
const moveBtn = document.getElementById('moveBtn');
const infoEl = document.getElementById('info');

let rotY = 0.3;
let isMovingGroup = false;
let lastX, lastY;

const objects = [];
const groups = [];
let nextGroupId = 1;

// Create initial objects
for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    objects.push({
        id: i,
        x: Math.cos(angle) * 2,
        y: 0,
        z: Math.sin(angle) * 2,
        size: 0.5,
        hue: (i / 6) * 360,
        selected: false,
        groupId: null
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

        let strokeColor, strokeWidth;
        if (obj.selected) {
            strokeColor = '#ffff00';
            strokeWidth = 3;
        } else if (obj.groupId !== null) {
            strokeColor = '#81ecec';
            strokeWidth = 2;
        } else {
            strokeColor = `hsla(${obj.hue}, 70%, ${l + 15}%, 0.5)`;
            strokeWidth = 1;
        }
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    });

    // Group indicator
    if (obj.groupId !== null) {
        const labelPos = project(obj.x, obj.y - 0.6, obj.z);
        if (labelPos && labelPos.z < 10) {
            ctx.fillStyle = '#81ecec';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`G${obj.groupId}`, labelPos.x, labelPos.y);
        }
    }
}

function drawGroupBounds() {
    groups.forEach(group => {
        const groupObjects = objects.filter(o => o.groupId === group.id);
        if (groupObjects.length < 2) return;

        // Draw lines connecting grouped objects
        ctx.strokeStyle = 'rgba(129, 236, 236, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        for (let i = 0; i < groupObjects.length; i++) {
            for (let j = i + 1; j < groupObjects.length; j++) {
                const p1 = project(groupObjects[i].x, groupObjects[i].y, groupObjects[i].z);
                const p2 = project(groupObjects[j].x, groupObjects[j].y, groupObjects[j].z);
                if (p1 && p2) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        ctx.setLineDash([]);
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

function getSelectedObjects() {
    return objects.filter(o => o.selected);
}

function updateInfo() {
    const selected = getSelectedObjects();
    const grouped = objects.filter(o => o.groupId !== null);

    if (selected.length === 0) {
        infoEl.textContent = 'Shift+點擊多選，群組後一起移動';
    } else if (selected.length === 1) {
        const obj = selected[0];
        infoEl.textContent = obj.groupId ? `選取群組 G${obj.groupId}` : '已選取 1 個物件';
    } else {
        infoEl.textContent = `已選取 ${selected.length} 個物件`;
    }
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(129, 236, 236, 0.1)';
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

    drawGroupBounds();

    // Sort and draw objects
    const sorted = [...objects].sort((a, b) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const zA = -a.x * sinY + a.z * cosY;
        const zB = -b.x * sinY + b.z * cosY;
        return zB - zA;
    });

    sorted.forEach(obj => drawObject(obj));

    // Stats
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`群組: ${groups.length}`, 10, 20);

    if (!isMovingGroup) rotY += 0.003;

    requestAnimationFrame(draw);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const clicked = getObjectAtPoint(mx, my);

    if (!e.shiftKey) {
        objects.forEach(o => o.selected = false);
    }

    if (clicked) {
        // If clicking grouped object, select entire group
        if (clicked.groupId !== null) {
            objects.forEach(o => {
                if (o.groupId === clicked.groupId) {
                    o.selected = !o.selected;
                }
            });
        } else {
            clicked.selected = !clicked.selected;
        }
    }

    updateInfo();
});

canvas.addEventListener('mousedown', (e) => {
    if (isMovingGroup) {
        lastX = e.clientX;
        lastY = e.clientY;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isMovingGroup) return;

    const dx = (e.clientX - lastX) * 0.02;
    const selected = getSelectedObjects();

    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);

    selected.forEach(obj => {
        obj.x += dx * cos;
        obj.z += dx * sin;
    });

    lastX = e.clientX;
    lastY = e.clientY;
});

groupBtn.addEventListener('click', () => {
    const selected = getSelectedObjects();
    if (selected.length < 2) {
        infoEl.textContent = '請選取至少 2 個物件';
        return;
    }

    const groupId = nextGroupId++;
    selected.forEach(o => o.groupId = groupId);
    groups.push({ id: groupId });

    objects.forEach(o => o.selected = false);
    infoEl.textContent = `已建立群組 G${groupId}`;
});

ungroupBtn.addEventListener('click', () => {
    const selected = getSelectedObjects();
    if (selected.length === 0) {
        infoEl.textContent = '請先選取群組物件';
        return;
    }

    const groupIds = new Set(selected.filter(o => o.groupId !== null).map(o => o.groupId));
    groupIds.forEach(gid => {
        objects.filter(o => o.groupId === gid).forEach(o => o.groupId = null);
        const idx = groups.findIndex(g => g.id === gid);
        if (idx !== -1) groups.splice(idx, 1);
    });

    objects.forEach(o => o.selected = false);
    infoEl.textContent = '群組已解散';
});

moveBtn.addEventListener('click', () => {
    isMovingGroup = !isMovingGroup;
    moveBtn.textContent = isMovingGroup ? '停止移動' : '移動群組';
    moveBtn.style.background = isMovingGroup ? 'rgba(255, 107, 107, 0.5)' : '';
});

draw();
