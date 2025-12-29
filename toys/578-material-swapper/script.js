const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

let rotationY = 0.5;
let wallMaterial = 'brick';
let roofMaterial = 'tile';

const materials = {
    brick: {
        base: { r: 180, g: 100, b: 80 },
        pattern: 'brick',
        name: '磚塊'
    },
    wood: {
        base: { r: 160, g: 120, b: 80 },
        pattern: 'wood',
        name: '木板'
    },
    stone: {
        base: { r: 150, g: 150, b: 145 },
        pattern: 'stone',
        name: '石材'
    },
    tile: {
        base: { r: 139, g: 90, b: 43 },
        pattern: 'tile',
        name: '瓦片'
    },
    metal: {
        base: { r: 100, g: 110, b: 130 },
        pattern: 'metal',
        name: '金屬'
    },
    green: {
        base: { r: 80, g: 140, b: 80 },
        pattern: 'grass',
        name: '綠化'
    }
};

function getPatternVariation(pattern, x, y) {
    const px = Math.floor(x * 10);
    const py = Math.floor(y * 10);

    switch (pattern) {
        case 'brick':
            const brickY = py % 3;
            const brickX = (px + (Math.floor(py / 3) % 2) * 2) % 5;
            return (brickX === 0 || brickY === 0) ? -0.15 : 0.05;
        case 'wood':
            return Math.sin(py * 0.5) * 0.1 + Math.sin(px * 2 + py) * 0.05;
        case 'stone':
            const n = Math.sin(px * 12.9898 + py * 78.233) * 43758.5453;
            return (n - Math.floor(n) - 0.5) * 0.2;
        case 'tile':
            const tileX = px % 4;
            const tileY = py % 2;
            return (tileX === 0 || tileY === 0) ? -0.1 : 0;
        case 'metal':
            return Math.sin(px * 0.5) * 0.05;
        case 'grass':
            const grassN = Math.sin(px * 45.123 + py * 89.456) * 12345.678;
            return (grassN - Math.floor(grassN) - 0.5) * 0.15;
        default:
            return 0;
    }
}

function project(x, y, z) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(0.3);
    const sinX = Math.sin(0.3);

    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;
    let y1 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    const scale = 55 / (6 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 + 30 - y1 * scale,
        scale,
        z: z2
    };
}

function drawFace(points, material, shade, faceX, faceY) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();

    const mat = materials[material];
    const patternVar = getPatternVariation(mat.pattern, faceX, faceY);
    const finalShade = Math.max(0.3, Math.min(1.2, shade + patternVar));

    ctx.fillStyle = `rgb(${Math.floor(mat.base.r * finalShade)}, ${Math.floor(mat.base.g * finalShade)}, ${Math.floor(mat.base.b * finalShade)})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
}

function drawBox(x, y, z, w, h, d, material, isRoof = false) {
    const hw = w / 2, hd = d / 2;

    const vertices = [
        project(x - hw, y, z - hd),
        project(x + hw, y, z - hd),
        project(x + hw, y, z + hd),
        project(x - hw, y, z + hd),
        project(x - hw, y + h, z - hd),
        project(x + hw, y + h, z - hd),
        project(x + hw, y + h, z + hd),
        project(x - hw, y + h, z + hd)
    ];

    const faces = [
        { verts: [0, 1, 5, 4], shade: 0.85, fx: 0, fy: y },
        { verts: [1, 2, 6, 5], shade: 0.7, fx: 1, fy: y },
        { verts: [2, 3, 7, 6], shade: 0.8, fx: 2, fy: y },
        { verts: [3, 0, 4, 7], shade: 0.75, fx: 3, fy: y },
        { verts: [4, 5, 6, 7], shade: 1.0, fx: 0, fy: y + h }
    ];

    faces.sort((a, b) => {
        const aZ = a.verts.reduce((s, v) => s + vertices[v].z, 0) / 4;
        const bZ = b.verts.reduce((s, v) => s + vertices[v].z, 0) / 4;
        return bZ - aZ;
    });

    faces.forEach(face => {
        const points = face.verts.map(i => vertices[i]);
        const mat = isRoof ? roofMaterial : material;
        drawFace(points, mat, face.shade, face.fx, face.fy);
    });
}

function draw() {
    rotationY += 0.004;

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#4a90d9');
    skyGrad.addColorStop(1, '#87ceeb');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#5a8a5a';
    ctx.fillRect(0, canvas.height - 35, canvas.width, 35);

    // Building walls
    drawBox(0, 0, 0, 3, 2, 2, wallMaterial);

    // Roof
    drawBox(0, 2, 0, 3.3, 0.4, 2.3, roofMaterial, true);

    // Door
    const doorPoints = [
        project(-0.3, 0, -1.01),
        project(0.3, 0, -1.01),
        project(0.3, 1, -1.01),
        project(-0.3, 1, -1.01)
    ];
    ctx.beginPath();
    ctx.moveTo(doorPoints[0].x, doorPoints[0].y);
    doorPoints.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = '#4a3020';
    ctx.fill();

    // Windows
    const windowColor = 'rgba(150, 200, 255, 0.7)';
    const windows = [
        [-0.9, 1.2], [0.9, 1.2]
    ];

    windows.forEach(([wx, wy]) => {
        const wp = [
            project(wx - 0.25, wy - 0.3, -1.01),
            project(wx + 0.25, wy - 0.3, -1.01),
            project(wx + 0.25, wy + 0.3, -1.01),
            project(wx - 0.25, wy + 0.3, -1.01)
        ];
        ctx.beginPath();
        ctx.moveTo(wp[0].x, wp[0].y);
        wp.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = windowColor;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    requestAnimationFrame(draw);
}

// Wall material buttons
document.querySelectorAll('.wall-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.wall-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        wallMaterial = btn.dataset.mat;
        infoEl.textContent = `牆面: ${materials[wallMaterial].name} | 屋頂: ${materials[roofMaterial].name}`;
    });
});

// Roof material buttons
document.querySelectorAll('.roof-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.roof-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        roofMaterial = btn.dataset.mat;
        infoEl.textContent = `牆面: ${materials[wallMaterial].name} | 屋頂: ${materials[roofMaterial].name}`;
    });
});

draw();
