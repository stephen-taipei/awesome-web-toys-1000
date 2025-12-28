const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let angleXY = 0, angleZW = 0;
let rotX = 0.5, rotY = 0;
let isDragging = false;
let lastX, lastY;

// 4D hypercube vertices
const vertices4D = [];
for (let i = 0; i < 16; i++) {
    vertices4D.push([
        (i & 1) ? 1 : -1,
        (i & 2) ? 1 : -1,
        (i & 4) ? 1 : -1,
        (i & 8) ? 1 : -1
    ]);
}

// Edges: connect vertices that differ by exactly one coordinate
const edges = [];
for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
        let diff = 0;
        for (let k = 0; k < 4; k++) {
            if (vertices4D[i][k] !== vertices4D[j][k]) diff++;
        }
        if (diff === 1) edges.push([i, j]);
    }
}

function rotate4D(v, angleXY, angleZW) {
    let [x, y, z, w] = v;

    // Rotate in XY plane
    let cos = Math.cos(angleXY), sin = Math.sin(angleXY);
    [x, y] = [x * cos - y * sin, x * sin + y * cos];

    // Rotate in ZW plane
    cos = Math.cos(angleZW); sin = Math.sin(angleZW);
    [z, w] = [z * cos - w * sin, z * sin + w * cos];

    return [x, y, z, w];
}

function project4Dto3D(v) {
    const [x, y, z, w] = v;
    const distance = 3;
    const factor = distance / (distance - w);
    return [x * factor, y * factor, z * factor];
}

function rotate3D(v) {
    let [x, y, z] = v;
    let cos = Math.cos(rotX), sin = Math.sin(rotX);
    [y, z] = [y * cos - z * sin, y * sin + z * cos];
    cos = Math.cos(rotY); sin = Math.sin(rotY);
    [x, z] = [x * cos + z * sin, -x * sin + z * cos];
    return [x, y, z];
}

function project3Dto2D(v) {
    const [x, y, z] = v;
    const scale = 60;
    const dist = 4;
    const factor = dist / (dist + z);
    return {
        x: canvas.width / 2 + x * scale * factor,
        y: canvas.height / 2 + y * scale * factor,
        z: z
    };
}

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Transform vertices
    const transformed = vertices4D.map(v => {
        const rot4D = rotate4D(v, angleXY, angleZW);
        const proj3D = project4Dto3D(rot4D);
        const rot3D = rotate3D(proj3D);
        return project3Dto2D(rot3D);
    });

    // Sort edges by average depth
    const sortedEdges = edges.map(([i, j]) => ({
        i, j,
        avgZ: (transformed[i].z + transformed[j].z) / 2
    })).sort((a, b) => a.avgZ - b.avgZ);

    // Draw edges
    sortedEdges.forEach(({ i, j, avgZ }) => {
        const p1 = transformed[i];
        const p2 = transformed[j];

        const alpha = 0.3 + (avgZ + 2) * 0.2;
        const hue = (angleZW * 30 + avgZ * 20) % 360;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    });

    // Draw vertices
    transformed.forEach((p, i) => {
        const w = vertices4D[i][3];
        const size = 3 + (w + 1) * 2;
        const alpha = 0.5 + (p.z + 2) * 0.2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = w > 0 ? `rgba(255, 100, 100, ${alpha})` : `rgba(100, 100, 255, ${alpha})`;
        ctx.fill();
    });

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('4D Tesseract', canvas.width / 2, 20);

    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('16頂點 32邊 24面 8胞', canvas.width / 2, canvas.height - 15);

    angleXY += 0.01;
    angleZW += 0.007;
    if (!isDragging) rotY += 0.005;

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
