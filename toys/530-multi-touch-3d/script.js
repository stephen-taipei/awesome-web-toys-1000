const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

let rotX = 0.3, rotY = 0;
let scale = 1;
let touchPoints = [];
let lastTouchDist = 0;
let lastTouchCenter = null;

// Object to manipulate
const obj = { size: 1.2 };

function project(x, y, z) {
    // Apply rotation
    let cos = Math.cos(rotX), sin = Math.sin(rotX);
    [y, z] = [y * cos - z * sin, y * sin + z * cos];
    cos = Math.cos(rotY); sin = Math.sin(rotY);
    [x, z] = [x * cos + z * sin, -x * sin + z * cos];

    const dist = 5;
    const adjustedZ = z + dist;
    if (adjustedZ <= 0.1) return null;

    const fov = 150 * scale;
    return {
        x: canvas.width / 2 + (x / adjustedZ) * fov,
        y: canvas.height / 2 + (y / adjustedZ) * fov,
        z: adjustedZ
    };
}

function drawCube() {
    const s = obj.size / 2;
    const vertices = [
        [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
        [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]
    ];

    const projected = vertices.map(v => project(...v));
    if (projected.some(p => p === null)) return;

    const faces = [
        { verts: [0, 1, 2, 3], hue: 345, shade: 0.8 },
        { verts: [4, 5, 6, 7], hue: 345, shade: 0.8 },
        { verts: [0, 4, 7, 3], hue: 200, shade: 0.6 },
        { verts: [1, 5, 6, 2], hue: 200, shade: 1.0 },
        { verts: [3, 2, 6, 7], hue: 45, shade: 0.9 },
        { verts: [0, 1, 5, 4], hue: 45, shade: 0.5 }
    ];

    // Sort faces by average z
    const sortedFaces = faces.map(f => ({
        ...f,
        avgZ: f.verts.reduce((s, i) => s + projected[i].z, 0) / 4
    })).sort((a, b) => b.avgZ - a.avgZ);

    sortedFaces.forEach(face => {
        const points = face.verts.map(i => projected[i]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        const l = 35 + face.shade * 30;
        ctx.fillStyle = `hsla(${face.hue}, 70%, ${l}%, 0.9)`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${face.hue}, 80%, ${l + 15}%, 0.7)`;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function drawTouchIndicators() {
    touchPoints.forEach((point, i) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(233, 69, 96, 0.3)`;
        ctx.fill();
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i + 1, point.x, point.y);
    });

    // Draw line between two touch points
    if (touchPoints.length === 2) {
        ctx.strokeStyle = 'rgba(233, 69, 96, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(touchPoints[0].x, touchPoints[0].y);
        ctx.lineTo(touchPoints[1].x, touchPoints[1].y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function draw() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid effect
    ctx.strokeStyle = 'rgba(233, 69, 96, 0.1)';
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

    drawCube();
    drawTouchIndicators();

    // Status
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`觸控點: ${touchPoints.length}`, 10, 10);
    ctx.fillText(`縮放: ${(scale * 100).toFixed(0)}%`, 10, 22);
    ctx.fillText(`旋轉: (${(rotX * 180/Math.PI).toFixed(0)}°, ${(rotY * 180/Math.PI).toFixed(0)}°)`, 10, 34);

    if (touchPoints.length === 0) {
        rotY += 0.005;
    }

    requestAnimationFrame(draw);
}

function getTouchPos(touch) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        id: touch.identifier
    };
}

function getDistance(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function getCenter(p1, p2) {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
    };
}

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchPoints = Array.from(e.touches).map(getTouchPos);

    if (touchPoints.length === 2) {
        lastTouchDist = getDistance(touchPoints[0], touchPoints[1]);
        lastTouchCenter = getCenter(touchPoints[0], touchPoints[1]);
        infoEl.textContent = '雙指縮放中...';
    } else if (touchPoints.length === 1) {
        infoEl.textContent = '單指旋轉中...';
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const newPoints = Array.from(e.touches).map(getTouchPos);

    if (newPoints.length === 1 && touchPoints.length === 1) {
        // Single finger rotate
        const dx = newPoints[0].x - touchPoints[0].x;
        const dy = newPoints[0].y - touchPoints[0].y;
        rotY += dx * 0.01;
        rotX += dy * 0.01;
        rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX));
    } else if (newPoints.length === 2) {
        // Pinch zoom
        const newDist = getDistance(newPoints[0], newPoints[1]);
        const newCenter = getCenter(newPoints[0], newPoints[1]);

        if (lastTouchDist > 0) {
            const scaleChange = newDist / lastTouchDist;
            scale *= scaleChange;
            scale = Math.max(0.3, Math.min(3, scale));
        }

        // Pan with two fingers
        if (lastTouchCenter) {
            const dx = newCenter.x - lastTouchCenter.x;
            const dy = newCenter.y - lastTouchCenter.y;
            rotY += dx * 0.005;
            rotX += dy * 0.005;
        }

        lastTouchDist = newDist;
        lastTouchCenter = newCenter;
    }

    touchPoints = newPoints;
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchPoints = Array.from(e.touches).map(getTouchPos);

    if (touchPoints.length === 0) {
        lastTouchDist = 0;
        lastTouchCenter = null;
        infoEl.textContent = '使用觸控手勢操控3D物件';
    } else if (touchPoints.length === 1) {
        infoEl.textContent = '單指旋轉中...';
    }
}, { passive: false });

// Mouse fallback
let isMouseDown = false;
let lastMouseX, lastMouseY;

canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    rotY += dx * 0.01;
    rotX += dy * 0.01;
    rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX));
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener('mouseup', () => isMouseDown = false);
canvas.addEventListener('mouseleave', () => isMouseDown = false);

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    scale *= e.deltaY > 0 ? 0.95 : 1.05;
    scale = Math.max(0.3, Math.min(3, scale));
}, { passive: false });

draw();
