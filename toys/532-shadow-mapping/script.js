const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const lightHeightSlider = document.getElementById('lightHeight');
const heightLabel = document.getElementById('heightLabel');

let time = 0;
let rotY = 0.3;
let lightHeight = 3;

const objects = [
    { x: 0, y: 0, z: 0, width: 1, height: 1.5, depth: 1, hue: 200 },
    { x: -2, y: 0.3, z: 1, width: 0.6, height: 0.8, depth: 0.6, hue: 120 },
    { x: 2, y: 0.2, z: -0.5, width: 0.8, height: 1, depth: 0.8, hue: 340 }
];

const groundY = 1;

function project(x, y, z) {
    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);
    const rx = x * cos + z * sin;
    const rz = -x * sin + z * cos;

    const dist = 8;
    const adjustedZ = rz + dist;
    if (adjustedZ <= 0.1) return null;

    const fov = 150;
    return {
        x: canvas.width / 2 + (rx / adjustedZ) * fov,
        y: canvas.height / 2 + (y / adjustedZ) * fov,
        z: adjustedZ
    };
}

function drawShadow(obj, lightX, lightY, lightZ) {
    // Project corners to ground plane
    const corners = [
        [obj.x - obj.width/2, obj.y - obj.height, obj.z - obj.depth/2],
        [obj.x + obj.width/2, obj.y - obj.height, obj.z - obj.depth/2],
        [obj.x + obj.width/2, obj.y - obj.height, obj.z + obj.depth/2],
        [obj.x - obj.width/2, obj.y - obj.height, obj.z + obj.depth/2]
    ];

    const shadowCorners = corners.map(([cx, cy, cz]) => {
        // Ray from light through corner to ground
        const t = (groundY - lightY) / (cy - lightY);
        const sx = lightX + t * (cx - lightX);
        const sz = lightZ + t * (cz - lightZ);
        return project(sx, groundY, sz);
    }).filter(p => p !== null);

    if (shadowCorners.length < 3) return;

    ctx.beginPath();
    ctx.moveTo(shadowCorners[0].x, shadowCorners[0].y);
    shadowCorners.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();
}

function drawBox(obj) {
    const w = obj.width / 2;
    const h = obj.height;
    const d = obj.depth / 2;

    const vertices = [
        [obj.x - w, obj.y, obj.z - d], [obj.x + w, obj.y, obj.z - d],
        [obj.x + w, obj.y - h, obj.z - d], [obj.x - w, obj.y - h, obj.z - d],
        [obj.x - w, obj.y, obj.z + d], [obj.x + w, obj.y, obj.z + d],
        [obj.x + w, obj.y - h, obj.z + d], [obj.x - w, obj.y - h, obj.z + d]
    ];

    const projected = vertices.map(v => project(...v));
    if (projected.some(p => p === null)) return null;

    const faces = [
        { verts: [0, 1, 2, 3], shade: 0.7 },
        { verts: [4, 5, 6, 7], shade: 0.7 },
        { verts: [0, 4, 7, 3], shade: 0.5 },
        { verts: [1, 5, 6, 2], shade: 1.0 },
        { verts: [3, 2, 6, 7], shade: 0.9 },
        { verts: [0, 1, 5, 4], shade: 0.4 }
    ];

    const avgZ = vertices.reduce((s, v) => s + v[2], 0) / 8;

    return {
        z: avgZ,
        draw: () => {
            const sortedFaces = faces.map(f => ({
                ...f,
                faceZ: f.verts.reduce((s, i) => s + vertices[i][2], 0) / 4
            })).sort((a, b) => a.faceZ - b.faceZ);

            sortedFaces.forEach(face => {
                const points = face.verts.map(i => projected[i]);
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();

                const l = 30 + face.shade * 35;
                ctx.fillStyle = `hsla(${obj.hue}, 50%, ${l}%, 1)`;
                ctx.fill();
                ctx.strokeStyle = `hsla(${obj.hue}, 60%, ${l + 10}%, 0.5)`;
                ctx.lineWidth = 1;
                ctx.stroke();
            });
        }
    };
}

function drawGround() {
    // Checkerboard ground
    const size = 8;
    const step = 1;

    for (let x = -size; x < size; x += step) {
        for (let z = -size; z < size; z += step) {
            const isLight = (Math.floor(x) + Math.floor(z)) % 2 === 0;
            const corners = [
                project(x, groundY, z),
                project(x + step, groundY, z),
                project(x + step, groundY, z + step),
                project(x, groundY, z + step)
            ].filter(p => p !== null);

            if (corners.length < 3) continue;

            ctx.beginPath();
            ctx.moveTo(corners[0].x, corners[0].y);
            corners.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.fillStyle = isLight ? '#3d3d3d' : '#2a2a2a';
            ctx.fill();
        }
    }
}

function drawLight(lx, ly, lz) {
    const p = project(lx, ly, lz);
    if (!p) return;

    // Glow
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 25);
    gradient.addColorStop(0, 'rgba(253, 203, 110, 0.8)');
    gradient.addColorStop(1, 'rgba(253, 203, 110, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fdcb6e';
    ctx.fill();
}

function draw() {
    time += 0.016;

    const lightX = Math.cos(time * 0.5) * 3;
    const lightY = -lightHeight;
    const lightZ = Math.sin(time * 0.5) * 3;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGround();

    // Draw shadows first
    objects.forEach(obj => drawShadow(obj, lightX, lightY, lightZ));

    // Draw objects
    const drawables = objects
        .map(obj => drawBox(obj))
        .filter(d => d !== null)
        .sort((a, b) => a.z - b.z);

    drawables.forEach(d => d.draw());

    drawLight(lightX, lightY, lightZ);

    // Info
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`光源高度: ${lightHeight.toFixed(1)}`, 10, 20);

    rotY += 0.002;

    requestAnimationFrame(draw);
}

lightHeightSlider.addEventListener('input', (e) => {
    lightHeight = parseFloat(e.target.value);
    heightLabel.textContent = lightHeight.toFixed(1);
});

draw();
