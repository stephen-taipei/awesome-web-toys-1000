const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cloneBtn = document.getElementById('cloneBtn');
const clearBtn = document.getElementById('clearBtn');
const infoEl = document.getElementById('info');

let rotY = 0.3;
let selectedObject = null;

const objects = [
    { x: 0, y: 0, z: 0, size: 0.7, hue: 45, shape: 'cube' },
    { x: -2, y: 0, z: 1, size: 0.6, hue: 180, shape: 'pyramid' },
    { x: 2, y: 0, z: -1, size: 0.5, hue: 300, shape: 'cube' }
];

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
        ctx.strokeStyle = selectedObject === obj ? '#f8b500' : `hsla(${obj.hue}, 70%, ${l + 15}%, 0.5)`;
        ctx.lineWidth = selectedObject === obj ? 3 : 1;
        ctx.stroke();
    });
}

function drawPyramid(obj) {
    const s = obj.size;
    const h = obj.size * 1.2;
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
        { verts: [0, 4, 1], shade: 0.7 }
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
        ctx.strokeStyle = selectedObject === obj ? '#f8b500' : `hsla(${obj.hue}, 70%, ${l + 15}%, 0.5)`;
        ctx.lineWidth = selectedObject === obj ? 3 : 1;
        ctx.stroke();
    });
}

function drawObject(obj) {
    if (obj.shape === 'pyramid') drawPyramid(obj);
    else drawCube(obj);

    // Selection glow
    if (selectedObject === obj) {
        const center = project(obj.x, obj.y - obj.size / 2, obj.z);
        if (center) {
            ctx.beginPath();
            ctx.arc(center.x, center.y, 25, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(248, 181, 0, 0.5)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
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

function cloneObject(obj) {
    const clone = {
        ...obj,
        x: obj.x + 0.8,
        z: obj.z + 0.8,
        hue: (obj.hue + 30) % 360
    };
    objects.push(clone);
    return clone;
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(248, 181, 0, 0.1)';
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

    // Sort and draw objects
    const sorted = [...objects].sort((a, b) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const zA = -a.x * sinY + a.z * cosY;
        const zB = -b.x * sinY + b.z * cosY;
        return zB - zA;
    });

    sorted.forEach(obj => drawObject(obj));

    // Object count
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`物件數: ${objects.length}`, 10, 20);

    rotY += 0.003;

    requestAnimationFrame(draw);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const clicked = getObjectAtPoint(mx, my);
    selectedObject = clicked;

    if (clicked) {
        infoEl.textContent = `已選取 ${clicked.shape === 'pyramid' ? '金字塔' : '立方體'}`;
    } else {
        infoEl.textContent = '點擊選取物件，按複製鍵複製';
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hovered = getObjectAtPoint(mx, my);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
});

cloneBtn.addEventListener('click', () => {
    if (!selectedObject) {
        infoEl.textContent = '請先選取一個物件';
        return;
    }

    const clone = cloneObject(selectedObject);
    selectedObject = clone;
    infoEl.textContent = `已複製！現有 ${objects.length} 個物件`;
});

clearBtn.addEventListener('click', () => {
    objects.length = 0;
    objects.push(
        { x: 0, y: 0, z: 0, size: 0.7, hue: 45, shape: 'cube' }
    );
    selectedObject = null;
    infoEl.textContent = '已重置場景';
});

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        cloneBtn.click();
    }
});

draw();
