const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');
const buttons = document.querySelectorAll('.solid-btn');

let rotX = 0.5, rotY = 0.5;
let isDragging = false;
let lastX, lastY;
let currentSolid = 'tetrahedron';

const phi = (1 + Math.sqrt(5)) / 2;

const solids = {
    tetrahedron: {
        name: '正四面體',
        faces: 4, edges: 6, vertices: 4,
        verts: [[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]],
        faces_idx: [[0,1,2],[0,3,1],[0,2,3],[1,3,2]]
    },
    cube: {
        name: '正六面體',
        faces: 6, edges: 12, vertices: 8,
        verts: [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],
        faces_idx: [[0,1,2,3],[4,7,6,5],[0,4,5,1],[2,6,7,3],[0,3,7,4],[1,5,6,2]]
    },
    octahedron: {
        name: '正八面體',
        faces: 8, edges: 12, vertices: 6,
        verts: [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],
        faces_idx: [[0,2,4],[0,4,3],[0,3,5],[0,5,2],[1,4,2],[1,3,4],[1,5,3],[1,2,5]]
    },
    dodecahedron: {
        name: '正十二面體',
        faces: 12, edges: 30, vertices: 20,
        verts: (function() {
            const v = [];
            const p = phi, q = 1/phi;
            [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].forEach(c => v.push(c));
            [[0,-q,-p],[0,q,-p],[0,q,p],[0,-q,p]].forEach(c => v.push(c));
            [[-q,-p,0],[q,-p,0],[q,p,0],[-q,p,0]].forEach(c => v.push(c));
            [[-p,0,-q],[-p,0,q],[p,0,q],[p,0,-q]].forEach(c => v.push(c));
            return v;
        })(),
        faces_idx: [[0,8,9,1,13],[0,12,17,4,8],[0,13,19,16,12],[1,9,10,14,19],[1,19,14,6,13],[2,10,9,8,11],[2,11,4,17,15],[2,15,6,14,10],[3,11,8,4,17],[3,15,17,12,16],[3,16,19,14,15],[5,11,2,10,14]]
    },
    icosahedron: {
        name: '正二十面體',
        faces: 20, edges: 30, vertices: 12,
        verts: [[0,1,phi],[0,-1,phi],[0,1,-phi],[0,-1,-phi],[1,phi,0],[-1,phi,0],[1,-phi,0],[-1,-phi,0],[phi,0,1],[-phi,0,1],[phi,0,-1],[-phi,0,-1]],
        faces_idx: [[0,1,8],[0,8,4],[0,4,5],[0,5,9],[0,9,1],[1,6,8],[8,6,10],[8,10,4],[4,10,2],[4,2,5],[5,2,11],[5,11,9],[9,11,7],[9,7,1],[1,7,6],[2,3,11],[3,7,11],[3,6,7],[3,10,6],[2,10,3]]
    }
};

function project(x, y, z) {
    const scale = 80;
    const distance = 5;
    const factor = distance / (distance + z);
    return {
        x: canvas.width / 2 + x * scale * factor,
        y: canvas.height / 2 + y * scale * factor,
        z: z
    };
}

function rotateX(v, angle) {
    const cos = Math.cos(angle), sin = Math.sin(angle);
    return [v[0], v[1] * cos - v[2] * sin, v[1] * sin + v[2] * cos];
}

function rotateY(v, angle) {
    const cos = Math.cos(angle), sin = Math.sin(angle);
    return [v[0] * cos + v[2] * sin, v[1], -v[0] * sin + v[2] * cos];
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const solid = solids[currentSolid];
    const rotatedVerts = solid.verts.map(v => {
        let rv = rotateX(v, rotX);
        rv = rotateY(rv, rotY);
        return rv;
    });

    const projectedVerts = rotatedVerts.map(v => project(v[0], v[1], v[2]));

    // Calculate face depths and sort
    const facesWithDepth = solid.faces_idx.map((face, i) => {
        const avgZ = face.reduce((sum, vi) => sum + rotatedVerts[vi][2], 0) / face.length;
        return { face, depth: avgZ, index: i };
    }).sort((a, b) => a.depth - b.depth);

    // Draw faces
    facesWithDepth.forEach(({ face, depth }) => {
        ctx.beginPath();
        face.forEach((vi, i) => {
            const p = projectedVerts[vi];
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();

        const brightness = 0.3 + (depth + 2) * 0.15;
        const hue = (rotY * 30 + depth * 20) % 360;
        ctx.fillStyle = `hsla(${hue}, 70%, ${brightness * 50}%, 0.8)`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${hue}, 80%, 70%, 0.9)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    });

    // Draw vertices
    projectedVerts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    });

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(solid.name, canvas.width / 2, 25);
}

function animate() {
    if (!isDragging) {
        rotY += 0.01;
    }
    draw();
    requestAnimationFrame(animate);
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

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSolid = btn.dataset.solid;
        const s = solids[currentSolid];
        infoEl.textContent = `${s.name}: ${s.faces}面 ${s.edges}邊 ${s.vertices}頂點`;
    });
});

infoEl.textContent = `${solids[currentSolid].name}: 4面 6邊 4頂點`;
animate();
