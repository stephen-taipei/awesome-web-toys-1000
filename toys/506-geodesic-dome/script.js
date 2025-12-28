const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const subSlider = document.getElementById('subdivision');
const subValue = document.getElementById('subValue');
const infoEl = document.getElementById('info');

let rotX = -0.3, rotY = 0;
let isDragging = false;
let lastX, lastY;

function normalize(v) {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len, v[1] / len, v[2] / len];
}

function midpoint(v1, v2) {
    return normalize([
        (v1[0] + v2[0]) / 2,
        (v1[1] + v2[1]) / 2,
        (v1[2] + v2[2]) / 2
    ]);
}

function createIcosahedron() {
    const phi = (1 + Math.sqrt(5)) / 2;
    const vertices = [
        normalize([0, 1, phi]), normalize([0, -1, phi]), normalize([0, 1, -phi]), normalize([0, -1, -phi]),
        normalize([1, phi, 0]), normalize([-1, phi, 0]), normalize([1, -phi, 0]), normalize([-1, -phi, 0]),
        normalize([phi, 0, 1]), normalize([-phi, 0, 1]), normalize([phi, 0, -1]), normalize([-phi, 0, -1])
    ];

    const faces = [
        [0, 1, 8], [0, 8, 4], [0, 4, 5], [0, 5, 9], [0, 9, 1],
        [1, 6, 8], [8, 6, 10], [8, 10, 4], [4, 10, 2], [4, 2, 5],
        [5, 2, 11], [5, 11, 9], [9, 11, 7], [9, 7, 1], [1, 7, 6],
        [2, 3, 11], [3, 7, 11], [3, 6, 7], [3, 10, 6], [2, 10, 3]
    ];

    return { vertices, faces };
}

function subdivide(geo) {
    const newVertices = [...geo.vertices];
    const newFaces = [];
    const midpointCache = {};

    function getMidpoint(i1, i2) {
        const key = i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`;
        if (midpointCache[key] !== undefined) return midpointCache[key];

        const mid = midpoint(geo.vertices[i1], geo.vertices[i2]);
        const index = newVertices.length;
        newVertices.push(mid);
        midpointCache[key] = index;
        return index;
    }

    geo.faces.forEach(face => {
        const [a, b, c] = face;
        const ab = getMidpoint(a, b);
        const bc = getMidpoint(b, c);
        const ca = getMidpoint(c, a);

        newFaces.push([a, ab, ca]);
        newFaces.push([b, bc, ab]);
        newFaces.push([c, ca, bc]);
        newFaces.push([ab, bc, ca]);
    });

    return { vertices: newVertices, faces: newFaces };
}

function rotate(v) {
    let [x, y, z] = v;
    let cos = Math.cos(rotX), sin = Math.sin(rotX);
    [y, z] = [y * cos - z * sin, y * sin + z * cos];
    cos = Math.cos(rotY); sin = Math.sin(rotY);
    [x, z] = [x * cos + z * sin, -x * sin + z * cos];
    return [x, y, z];
}

function project(v) {
    const scale = 100;
    const dist = 3;
    const factor = dist / (dist + v[2]);
    return {
        x: canvas.width / 2 + v[0] * scale * factor,
        y: canvas.height / 2 + v[1] * scale * factor,
        z: v[2]
    };
}

function draw() {
    ctx.fillStyle = '#0a1520';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let geo = createIcosahedron();
    const subdivisions = parseInt(subSlider.value);

    for (let i = 0; i < subdivisions; i++) {
        geo = subdivide(geo);
    }

    // Only show upper hemisphere (dome)
    const domeFaces = geo.faces.filter(face => {
        const avgY = (geo.vertices[face[0]][1] + geo.vertices[face[1]][1] + geo.vertices[face[2]][1]) / 3;
        return avgY > -0.3;
    });

    const rotatedVerts = geo.vertices.map(rotate);
    const projectedVerts = rotatedVerts.map(project);

    // Sort faces by depth
    const sortedFaces = domeFaces.map(face => {
        const avgZ = (rotatedVerts[face[0]][2] + rotatedVerts[face[1]][2] + rotatedVerts[face[2]][2]) / 3;
        return { face, avgZ };
    }).sort((a, b) => a.avgZ - b.avgZ);

    // Draw faces
    sortedFaces.forEach(({ face, avgZ }) => {
        const [a, b, c] = face;
        const pa = projectedVerts[a];
        const pb = projectedVerts[b];
        const pc = projectedVerts[c];

        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.lineTo(pc.x, pc.y);
        ctx.closePath();

        const brightness = 20 + (avgZ + 1) * 25;
        ctx.fillStyle = `hsla(180, 50%, ${brightness}%, 0.7)`;
        ctx.fill();
        ctx.strokeStyle = `hsla(180, 70%, 60%, 0.8)`;
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    // Ground
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height / 2 + 80, 120, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Geodesic Dome', canvas.width / 2, 20);

    if (!isDragging) rotY += 0.008;
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
    rotX = Math.max(-1, Math.min(0.5, rotX));
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

subSlider.addEventListener('input', () => {
    subValue.textContent = subSlider.value;
    let geo = createIcosahedron();
    for (let i = 0; i < subSlider.value; i++) geo = subdivide(geo);
    infoEl.textContent = `${geo.vertices.length} 頂點, ${geo.faces.length} 三角面`;
});

subValue.textContent = '1';
let geo = createIcosahedron();
geo = subdivide(geo);
infoEl.textContent = `${geo.vertices.length} 頂點, ${geo.faces.length} 三角面`;
draw();
