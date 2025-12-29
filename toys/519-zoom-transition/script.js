const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('resetBtn');
const infoEl = document.getElementById('info');

// Camera state
let camZ = -10;
let targetCamZ = -10;
let focusX = 0, focusY = 0, focusZ = 0;
let targetFocusX = 0, targetFocusY = 0, targetFocusZ = 0;
let rotY = 0;
let isTransitioning = false;
let selectedObject = null;

// Objects to click on
const objects = [
    { x: 0, y: 0, z: 0, size: 1.2, hue: 180, name: '中央立方體', detail: '這是場景中心的主要物體' },
    { x: -3, y: 0, z: 2, size: 0.8, hue: 45, name: '金色方塊', detail: '金黃色的裝飾方塊' },
    { x: 3, y: 0, z: 2, size: 0.8, hue: 280, name: '紫色方塊', detail: '神秘的紫色物體' },
    { x: -2, y: 1.5, z: -1, size: 0.6, hue: 0, name: '紅色小方塊', detail: '漂浮在上方的紅色立方體' },
    { x: 2, y: -1, z: -1, size: 0.7, hue: 120, name: '綠色方塊', detail: '底部的綠色裝飾' }
];

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function project(x, y, z) {
    const dx = x - focusX;
    const dy = y - focusY;
    const dz = z - focusZ - camZ;

    // Apply rotation around focus
    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);
    const rx = dx * cos + dz * sin;
    const rz = -dx * sin + dz * cos;

    if (rz <= 0.1) return null;

    const fov = 200;
    return {
        x: canvas.width / 2 + (rx / rz) * fov,
        y: canvas.height / 2 + (dy / rz) * fov,
        z: rz,
        screenSize: (1 / rz) * fov
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

    const faces = [
        { verts: [0, 1, 2, 3], shade: 0.8 },
        { verts: [4, 5, 6, 7], shade: 0.8 },
        { verts: [0, 4, 7, 3], shade: 0.6 },
        { verts: [1, 5, 6, 2], shade: 1.0 },
        { verts: [3, 2, 6, 7], shade: 0.9 },
        { verts: [0, 1, 5, 4], shade: 0.5 }
    ];

    const projected = vertices.map(v => project(...v));
    if (projected.some(p => p === null)) return null;

    const center = project(obj.x, obj.y, obj.z);
    if (!center) return null;

    const avgZ = projected.reduce((s, p) => s + p.z, 0) / 8;
    const isSelected = selectedObject === obj;

    return {
        obj,
        avgZ,
        center,
        screenRadius: center.screenSize * obj.size,
        draw: () => {
            faces.forEach(face => {
                const points = face.verts.map(i => projected[i]);
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();

                const l = 35 + face.shade * 25;
                ctx.fillStyle = `hsla(${obj.hue}, 70%, ${l}%, 0.95)`;
                ctx.fill();

                if (isSelected) {
                    ctx.strokeStyle = `hsla(${obj.hue}, 100%, 80%, 1)`;
                    ctx.lineWidth = 2;
                } else {
                    ctx.strokeStyle = `hsla(${obj.hue}, 80%, ${l + 20}%, 0.5)`;
                    ctx.lineWidth = 1;
                }
                ctx.stroke();
            });

            // Label when zoomed in
            if (isSelected && center.z < 5) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(obj.name, center.x, center.y - 50);

                ctx.font = '11px Arial';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillText(obj.detail, center.x, center.y - 35);
            }
        }
    };
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let x = -10; x <= 10; x += 2) {
        const p1 = project(x, 3, -10);
        const p2 = project(x, 3, 10);
        if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    for (let z = -10; z <= 10; z += 2) {
        const p1 = project(-10, 3, z);
        const p2 = project(10, 3, z);
        if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }
}

function update() {
    // Smooth camera transition
    const transitionSpeed = 0.08;
    camZ = lerp(camZ, targetCamZ, transitionSpeed);
    focusX = lerp(focusX, targetFocusX, transitionSpeed);
    focusY = lerp(focusY, targetFocusY, transitionSpeed);
    focusZ = lerp(focusZ, targetFocusZ, transitionSpeed);

    // Check if transition is complete
    if (Math.abs(camZ - targetCamZ) < 0.01 &&
        Math.abs(focusX - targetFocusX) < 0.01) {
        isTransitioning = false;
    }

    if (!isTransitioning && selectedObject === null) {
        rotY += 0.005;
    }
}

function draw() {
    update();

    ctx.fillStyle = '#0a1420';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    // Draw objects sorted by depth
    const drawables = objects
        .map(o => drawObject(o))
        .filter(d => d !== null)
        .sort((a, b) => b.avgZ - a.avgZ);

    drawables.forEach(d => d.draw());

    // Zoom indicator
    const zoomLevel = Math.abs(-10 / camZ) * 100;
    ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Zoom: ${zoomLevel.toFixed(0)}%`, 10, 20);

    if (isTransitioning) {
        ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('過渡中...', canvas.width / 2, canvas.height - 15);
    }

    requestAnimationFrame(draw);
}

canvas.addEventListener('click', (e) => {
    if (isTransitioning) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked on any object
    const drawables = objects
        .map(o => drawObject(o))
        .filter(d => d !== null);

    let clicked = null;
    drawables.forEach(d => {
        const dist = Math.hypot(clickX - d.center.x, clickY - d.center.y);
        if (dist < d.screenRadius * 1.5) {
            clicked = d.obj;
        }
    });

    if (clicked) {
        // Zoom to object
        selectedObject = clicked;
        targetFocusX = clicked.x;
        targetFocusY = clicked.y;
        targetFocusZ = clicked.z;
        targetCamZ = -3;
        isTransitioning = true;
        infoEl.textContent = `正在查看: ${clicked.name}`;
    }
});

resetBtn.addEventListener('click', () => {
    selectedObject = null;
    targetFocusX = 0;
    targetFocusY = 0;
    targetFocusZ = 0;
    targetCamZ = -10;
    isTransitioning = true;
    infoEl.textContent = '點擊物體放大查看';
});

draw();
