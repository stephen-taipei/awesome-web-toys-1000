const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

let currentIndex = 0;
let rotation = 0;
let targetRotation = 0;

const polyhedra = [
    { name: '正四面體', nameEn: 'Tetrahedron', sides: 3, faces: 4, color: '#e74c3c',
      verts: [[0,1,0],[-0.94,-0.33,0.33],[0.47,-0.33,0.82],[0.47,-0.33,-0.82]] },
    { name: '正六面體', nameEn: 'Cube', sides: 4, faces: 6, color: '#3498db',
      verts: [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]] },
    { name: '正八面體', nameEn: 'Octahedron', sides: 3, faces: 8, color: '#2ecc71',
      verts: [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]] },
    { name: '正十二面體', nameEn: 'Dodecahedron', sides: 5, faces: 12, color: '#9b59b6',
      verts: generateDodecahedron() },
    { name: '正二十面體', nameEn: 'Icosahedron', sides: 3, faces: 20, color: '#f39c12',
      verts: generateIcosahedron() },
    { name: '截角四面體', nameEn: 'Truncated Tetrahedron', sides: 6, faces: 8, color: '#1abc9c',
      verts: generateTruncatedTetra() },
    { name: '截角立方體', nameEn: 'Truncated Cube', sides: 8, faces: 14, color: '#e67e22',
      verts: generateTruncatedCube() }
];

function generateDodecahedron() {
    const phi = (1 + Math.sqrt(5)) / 2;
    const v = [];
    for (let i = -1; i <= 1; i += 2)
        for (let j = -1; j <= 1; j += 2)
            for (let k = -1; k <= 1; k += 2)
                v.push([i * 0.6, j * 0.6, k * 0.6]);
    return v;
}

function generateIcosahedron() {
    const phi = (1 + Math.sqrt(5)) / 2;
    return [[0,1,phi],[0,-1,phi],[0,1,-phi],[0,-1,-phi],[1,phi,0],[-1,phi,0],[1,-phi,0],[-1,-phi,0],[phi,0,1],[-phi,0,1],[phi,0,-1],[-phi,0,-1]].map(v => v.map(c => c * 0.5));
}

function generateTruncatedTetra() {
    const v = [];
    for (let i = 0; i < 12; i++) {
        const angle = i * Math.PI / 6;
        const r = i % 2 === 0 ? 0.8 : 0.5;
        v.push([Math.cos(angle) * r, Math.sin(i * 0.5) * 0.5, Math.sin(angle) * r]);
    }
    return v;
}

function generateTruncatedCube() {
    const v = [];
    const s = 0.7;
    for (let x = -1; x <= 1; x += 2)
        for (let y = -1; y <= 1; y += 2)
            for (let z = -1; z <= 1; z += 2)
                v.push([x * s, y * s, z * s]);
    return v;
}

function project(x, y, z) {
    const scale = 70;
    const dist = 4;
    const factor = dist / (dist + z);
    return {
        x: canvas.width / 2 + x * scale * factor,
        y: canvas.height / 2 + y * scale * factor
    };
}

function rotate(v, rx, ry) {
    let [x, y, z] = v;
    let cos = Math.cos(rx), sin = Math.sin(rx);
    [y, z] = [y * cos - z * sin, y * sin + z * cos];
    cos = Math.cos(ry); sin = Math.sin(ry);
    [x, z] = [x * cos + z * sin, -x * sin + z * cos];
    return [x, y, z];
}

function draw() {
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const poly = polyhedra[currentIndex];

    // Gallery frame
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 40, canvas.width - 60, 200);

    // Pedestal
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, 230, 60, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw polyhedron
    const rotatedVerts = poly.verts.map(v => rotate(v, 0.3, rotation));
    const projected = rotatedVerts.map(v => project(v[0], v[1], v[2]));

    // Draw edges
    ctx.strokeStyle = poly.color;
    ctx.lineWidth = 2;
    for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
            const d = Math.sqrt(
                (rotatedVerts[i][0] - rotatedVerts[j][0]) ** 2 +
                (rotatedVerts[i][1] - rotatedVerts[j][1]) ** 2 +
                (rotatedVerts[i][2] - rotatedVerts[j][2]) ** 2
            );
            if (d < 1.5) {
                ctx.beginPath();
                ctx.moveTo(projected[i].x, projected[i].y);
                ctx.lineTo(projected[j].x, projected[j].y);
                ctx.stroke();
            }
        }
    }

    // Draw vertices
    projected.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    });

    // Label plate
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(40, 255, canvas.width - 80, 50);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(40, 255, canvas.width - 80, 50);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(poly.name, canvas.width / 2, 275);
    ctx.font = '11px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`${poly.nameEn} | ${poly.faces} 面 | ${poly.sides} 邊形`, canvas.width / 2, 295);

    // Navigation dots
    const dotY = canvas.height - 15;
    polyhedra.forEach((_, i) => {
        ctx.beginPath();
        ctx.arc(canvas.width / 2 + (i - polyhedra.length / 2 + 0.5) * 15, dotY, 4, 0, Math.PI * 2);
        ctx.fillStyle = i === currentIndex ? '#fff' : 'rgba(255,255,255,0.3)';
        ctx.fill();
    });

    rotation += 0.015;
    requestAnimationFrame(draw);
}

canvas.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % polyhedra.length;
    infoEl.textContent = `展品 ${currentIndex + 1}/${polyhedra.length}: ${polyhedra[currentIndex].name}`;
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY > 0) {
        currentIndex = (currentIndex + 1) % polyhedra.length;
    } else {
        currentIndex = (currentIndex - 1 + polyhedra.length) % polyhedra.length;
    }
    infoEl.textContent = `展品 ${currentIndex + 1}/${polyhedra.length}: ${polyhedra[currentIndex].name}`;
});

draw();
