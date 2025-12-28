const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('resetBtn');
const objectSelect = document.getElementById('objectSelect');
const infoEl = document.getElementById('info');

let rotX = 0.5, rotY = 0;
let zoom = 1;
let isDragging = false;
let lastX, lastY;
let autoRotate = true;

const objects = {
    cube: {
        vertices: [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ],
        faces: [
            { verts: [0, 1, 2, 3], color: [220, 60, 50] },
            { verts: [4, 5, 6, 7], color: [60, 60, 50] },
            { verts: [0, 4, 7, 3], color: [120, 60, 50] },
            { verts: [1, 5, 6, 2], color: [300, 60, 50] },
            { verts: [3, 2, 6, 7], color: [180, 60, 50] },
            { verts: [0, 1, 5, 4], color: [30, 60, 50] }
        ]
    },
    pyramid: {
        vertices: [
            [0, -1.2, 0],
            [-1, 0.8, -1], [1, 0.8, -1], [1, 0.8, 1], [-1, 0.8, 1]
        ],
        faces: [
            { verts: [0, 1, 2], color: [0, 70, 55] },
            { verts: [0, 2, 3], color: [60, 70, 55] },
            { verts: [0, 3, 4], color: [120, 70, 55] },
            { verts: [0, 4, 1], color: [180, 70, 55] },
            { verts: [1, 2, 3, 4], color: [240, 70, 40] }
        ]
    },
    diamond: {
        vertices: [
            [0, -1.5, 0],
            [-1, 0, -1], [1, 0, -1], [1, 0, 1], [-1, 0, 1],
            [0, 1.5, 0]
        ],
        faces: [
            { verts: [0, 1, 2], color: [180, 80, 60] },
            { verts: [0, 2, 3], color: [200, 80, 60] },
            { verts: [0, 3, 4], color: [220, 80, 60] },
            { verts: [0, 4, 1], color: [160, 80, 60] },
            { verts: [5, 2, 1], color: [180, 80, 70] },
            { verts: [5, 3, 2], color: [200, 80, 70] },
            { verts: [5, 4, 3], color: [220, 80, 70] },
            { verts: [5, 1, 4], color: [160, 80, 70] }
        ]
    }
};

function rotate(v) {
    let [x, y, z] = v;
    let cos = Math.cos(rotX), sin = Math.sin(rotX);
    [y, z] = [y * cos - z * sin, y * sin + z * cos];
    cos = Math.cos(rotY); sin = Math.sin(rotY);
    [x, z] = [x * cos + z * sin, -x * sin + z * cos];
    return [x, y, z];
}

function project(v) {
    const [x, y, z] = v;
    const scale = 60 * zoom;
    const dist = 5;
    const factor = dist / (dist + z);
    return {
        x: canvas.width / 2 + x * scale * factor,
        y: canvas.height / 2 + y * scale * factor,
        z: z
    };
}

function draw() {
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        const y = (i / 10) * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    const obj = objects[objectSelect.value];
    const rotatedVerts = obj.vertices.map(v => rotate(v));
    const projectedVerts = rotatedVerts.map(v => project(v));

    // Calculate face depths and sort
    const facesToDraw = obj.faces.map((face, idx) => {
        const avgZ = face.verts.reduce((sum, i) => sum + rotatedVerts[i][2], 0) / face.verts.length;
        return { ...face, avgZ, idx };
    }).sort((a, b) => a.avgZ - b.avgZ);

    // Draw faces
    facesToDraw.forEach(face => {
        const points = face.verts.map(i => projectedVerts[i]);

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        const [h, s, l] = face.color;
        const brightness = l + (face.avgZ + 1) * 10;
        ctx.fillStyle = `hsla(${h}, ${s}%, ${brightness}%, 0.9)`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${h}, ${s + 10}%, ${brightness + 15}%, 0.7)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    });

    // Draw axes indicator
    const axisLen = 30;
    const origin = { x: 50, y: canvas.height - 40 };
    const axes = [
        { dir: [1, 0, 0], color: '#ff4444', label: 'X' },
        { dir: [0, 1, 0], color: '#44ff44', label: 'Y' },
        { dir: [0, 0, 1], color: '#4444ff', label: 'Z' }
    ];

    axes.forEach(axis => {
        const rotated = rotate(axis.dir);
        ctx.strokeStyle = axis.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(origin.x + rotated[0] * axisLen, origin.y - rotated[1] * axisLen);
        ctx.stroke();
        ctx.fillStyle = axis.color;
        ctx.font = 'bold 10px Arial';
        ctx.fillText(axis.label, origin.x + rotated[0] * axisLen + 5, origin.y - rotated[1] * axisLen);
    });

    // Zoom indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Zoom: ${(zoom * 100).toFixed(0)}%`, canvas.width - 10, 20);

    if (autoRotate && !isDragging) rotY += 0.01;
    requestAnimationFrame(draw);
}

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    autoRotate = false;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    rotY += (e.clientX - lastX) * 0.01;
    rotX += (e.clientY - lastY) * 0.01;
    rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX));
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoom *= e.deltaY > 0 ? 0.9 : 1.1;
    zoom = Math.max(0.3, Math.min(3, zoom));
});

resetBtn.addEventListener('click', () => {
    rotX = 0.5;
    rotY = 0;
    zoom = 1;
    autoRotate = true;
    infoEl.textContent = '視角已重置';
    setTimeout(() => infoEl.textContent = '拖曳旋轉 | 滾輪縮放', 1500);
});

objectSelect.addEventListener('change', () => {
    infoEl.textContent = objectSelect.options[objectSelect.selectedIndex].text;
});

draw();
