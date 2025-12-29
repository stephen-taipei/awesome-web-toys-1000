const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const buttons = document.querySelectorAll('.controls button');
const infoEl = document.getElementById('info');

let rotY = 0.3;

const objects = [];
for (let i = 0; i < 5; i++) {
    objects.push({
        x: (Math.random() - 0.5) * 5,
        y: 0,
        z: (Math.random() - 0.5) * 3,
        size: 0.5,
        hue: (i / 5) * 360,
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
        ctx.strokeStyle = obj.selected ? '#ffff00' : `hsla(${obj.hue}, 70%, ${l + 15}%, 0.5)`;
        ctx.lineWidth = obj.selected ? 3 : 1;
        ctx.stroke();
    });

    // Position label
    const labelPos = project(obj.x, obj.y - 0.6, obj.z);
    if (labelPos && labelPos.z < 10) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`(${obj.x.toFixed(1)})`, labelPos.x, labelPos.y);
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
        if (dist < 25) return item.obj;
    }
    return null;
}

function alignObjects(type) {
    const selected = objects.filter(o => o.selected);
    if (selected.length < 2) {
        infoEl.textContent = '請選取至少 2 個物件';
        return;
    }

    const xValues = selected.map(o => o.x);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const centerX = (minX + maxX) / 2;

    switch (type) {
        case 'left':
            selected.forEach(o => o.x = minX);
            infoEl.textContent = '已左對齊';
            break;
        case 'center':
            selected.forEach(o => o.x = centerX);
            infoEl.textContent = '已居中對齊';
            break;
        case 'right':
            selected.forEach(o => o.x = maxX);
            infoEl.textContent = '已右對齊';
            break;
        case 'distribute':
            if (selected.length < 3) {
                infoEl.textContent = '均分需要至少 3 個物件';
                return;
            }
            selected.sort((a, b) => a.x - b.x);
            const step = (maxX - minX) / (selected.length - 1);
            selected.forEach((o, i) => o.x = minX + step * i);
            infoEl.textContent = '已均分';
            break;
    }
}

function draw() {
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(168, 230, 207, 0.15)';
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

    // Alignment guide lines for selected objects
    const selected = objects.filter(o => o.selected);
    if (selected.length > 1) {
        ctx.strokeStyle = 'rgba(168, 230, 207, 0.3)';
        ctx.setLineDash([5, 5]);

        const avgX = selected.reduce((s, o) => s + o.x, 0) / selected.length;
        const p1 = project(avgX, -2, -5);
        const p2 = project(avgX, -2, 5);
        if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
        ctx.setLineDash([]);
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
    ctx.fillText(`選取: ${selectedCount}`, 10, 20);

    rotY += 0.003;

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
        clicked.selected = !clicked.selected;
    }

    const selected = objects.filter(o => o.selected);
    if (selected.length === 0) {
        infoEl.textContent = '選取多個物件後對齊';
    } else {
        infoEl.textContent = `已選取 ${selected.length} 個物件`;
    }
});

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        alignObjects(btn.dataset.align);
    });
});

draw();
