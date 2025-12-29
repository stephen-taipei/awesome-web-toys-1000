const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let rotX = 0.3, rotY = 0, rotZ = 0;
let isDragging = false;
let lastX, lastY;

function kleinBottle(u, v) {
    // Figure-8 immersion of Klein bottle
    const a = 2;
    const n = 2;
    const m = 1;

    const r = a + Math.cos(n * u / 2) * Math.sin(v) - Math.sin(n * u / 2) * Math.sin(2 * v);
    const x = r * Math.cos(u);
    const y = r * Math.sin(u);
    const z = Math.sin(n * u / 2) * Math.sin(v) + Math.cos(n * u / 2) * Math.sin(2 * v);

    return { x: x * 0.4, y: y * 0.4, z: z * 0.4 };
}

function rotate(p) {
    let { x, y, z } = p;

    // Rotate X
    let cos = Math.cos(rotX), sin = Math.sin(rotX);
    [y, z] = [y * cos - z * sin, y * sin + z * cos];

    // Rotate Y
    cos = Math.cos(rotY); sin = Math.sin(rotY);
    [x, z] = [x * cos + z * sin, -x * sin + z * cos];

    // Rotate Z
    cos = Math.cos(rotZ); sin = Math.sin(rotZ);
    [x, y] = [x * cos - y * sin, x * sin + y * cos];

    return { x, y, z };
}

function project(p) {
    const scale = 70;
    const dist = 5;
    const factor = dist / (dist + p.z);
    return {
        x: canvas.width / 2 + p.x * scale * factor,
        y: canvas.height / 2 + p.y * scale * factor,
        z: p.z
    };
}

function draw() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const uSteps = 50;
    const vSteps = 30;
    const quads = [];

    for (let i = 0; i < uSteps; i++) {
        for (let j = 0; j < vSteps; j++) {
            const u1 = (i / uSteps) * Math.PI * 2;
            const u2 = ((i + 1) / uSteps) * Math.PI * 2;
            const v1 = (j / vSteps) * Math.PI * 2;
            const v2 = ((j + 1) / vSteps) * Math.PI * 2;

            const p1 = rotate(kleinBottle(u1, v1));
            const p2 = rotate(kleinBottle(u2, v1));
            const p3 = rotate(kleinBottle(u2, v2));
            const p4 = rotate(kleinBottle(u1, v2));

            const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;

            quads.push({
                points: [project(p1), project(p2), project(p3), project(p4)],
                avgZ,
                u: i / uSteps,
                v: j / vSteps
            });
        }
    }

    // Sort by depth
    quads.sort((a, b) => a.avgZ - b.avgZ);

    // Draw quads
    quads.forEach(quad => {
        const { points, avgZ, u, v } = quad;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        const hue = (u * 360 + v * 60) % 360;
        const brightness = 30 + (avgZ + 1) * 20;
        ctx.fillStyle = `hsla(${hue}, 60%, ${brightness}%, 0.85)`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${hue}, 70%, ${brightness + 20}%, 0.5)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Klein Bottle', canvas.width / 2, 25);

    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('4D → 3D 投影', canvas.width / 2, canvas.height - 15);

    if (!isDragging) {
        rotY += 0.01;
        rotZ += 0.005;
    }
    requestAnimationFrame(draw);
}

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    rotY += (e.clientX - lastX) * 0.01;
    rotX += (e.clientY - lastY) * 0.01;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

draw();
