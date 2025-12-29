const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pSlider = document.getElementById('pVal');
const qSlider = document.getElementById('qVal');
const infoEl = document.getElementById('info');

let rotX = 0.5, rotY = 0;
let isDragging = false;
let lastX, lastY;

function torusKnot(t, p, q) {
    const r = 0.5;
    const R = 1;

    const phi = p * t;
    const theta = q * t;

    const x = (R + r * Math.cos(theta)) * Math.cos(phi);
    const y = (R + r * Math.cos(theta)) * Math.sin(phi);
    const z = r * Math.sin(theta);

    return { x, y, z };
}

function rotate(point) {
    let { x, y, z } = point;

    let cos = Math.cos(rotX), sin = Math.sin(rotX);
    [y, z] = [y * cos - z * sin, y * sin + z * cos];

    cos = Math.cos(rotY); sin = Math.sin(rotY);
    [x, z] = [x * cos + z * sin, -x * sin + z * cos];

    return { x, y, z };
}

function project(point) {
    const scale = 80;
    const dist = 4;
    const factor = dist / (dist + point.z);
    return {
        x: canvas.width / 2 + point.x * scale * factor,
        y: canvas.height / 2 + point.y * scale * factor,
        z: point.z
    };
}

function draw() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const p = parseInt(pSlider.value);
    const q = parseInt(qSlider.value);
    const segments = 500;
    const tubeSegments = 16;
    const tubeRadius = 0.08;

    // Generate tube mesh
    const tubes = [];

    for (let i = 0; i < segments; i++) {
        const t1 = (i / segments) * Math.PI * 2;
        const t2 = ((i + 1) / segments) * Math.PI * 2;

        const center1 = torusKnot(t1, p, q);
        const center2 = torusKnot(t2, p, q);

        // Calculate tangent
        const tangent = {
            x: center2.x - center1.x,
            y: center2.y - center1.y,
            z: center2.z - center1.z
        };
        const len = Math.sqrt(tangent.x ** 2 + tangent.y ** 2 + tangent.z ** 2);
        tangent.x /= len; tangent.y /= len; tangent.z /= len;

        for (let j = 0; j < tubeSegments; j++) {
            const angle = (j / tubeSegments) * Math.PI * 2;
            const nextAngle = ((j + 1) / tubeSegments) * Math.PI * 2;

            // Simple perpendicular (approximate)
            const perpX = Math.cos(angle) * tubeRadius;
            const perpY = Math.sin(angle) * tubeRadius;
            const nextPerpX = Math.cos(nextAngle) * tubeRadius;
            const nextPerpY = Math.sin(nextAngle) * tubeRadius;

            const p1 = rotate({ x: center1.x + perpX, y: center1.y + perpY, z: center1.z });
            const p2 = rotate({ x: center2.x + perpX, y: center2.y + perpY, z: center2.z });
            const p3 = rotate({ x: center2.x + nextPerpX, y: center2.y + nextPerpY, z: center2.z });
            const p4 = rotate({ x: center1.x + nextPerpX, y: center1.y + nextPerpY, z: center1.z });

            const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;

            tubes.push({
                points: [project(p1), project(p2), project(p3), project(p4)],
                avgZ,
                t: i / segments,
                angle: j / tubeSegments
            });
        }
    }

    // Sort and draw
    tubes.sort((a, b) => a.avgZ - b.avgZ);

    tubes.forEach(tube => {
        const { points, avgZ, t } = tube;
        const hue = (t * 360 * 2) % 360;
        const brightness = 30 + (avgZ + 1.5) * 20;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(pt => ctx.lineTo(pt.x, pt.y));
        ctx.closePath();

        ctx.fillStyle = `hsla(${hue}, 80%, ${brightness}%, 0.9)`;
        ctx.fill();
    });

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`T(${p},${q}) 環面紐結`, canvas.width / 2, 20);

    if (!isDragging) rotY += 0.015;
    requestAnimationFrame(draw);
}

function updateInfo() {
    const p = pSlider.value;
    const q = qSlider.value;
    const names = {
        '2,3': '三葉結',
        '2,5': '五葉結',
        '2,7': '七葉結',
        '3,4': '(3,4)環面紐結',
        '3,5': '(3,5)環面紐結'
    };
    const key = `${p},${q}`;
    infoEl.textContent = `T(${p},${q}) ${names[key] || '環面紐結'}`;
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

pSlider.addEventListener('input', updateInfo);
qSlider.addEventListener('input', updateInfo);

updateInfo();
draw();
