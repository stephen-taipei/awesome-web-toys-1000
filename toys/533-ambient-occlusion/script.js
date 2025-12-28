const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const aoStrengthSlider = document.getElementById('aoStrength');
const toggleBtn = document.getElementById('toggleBtn');

let aoEnabled = true;
let aoStrength = 0.7;
let rotY = 0.3;

// Cornell box-like scene
const walls = {
    back: { color: '#ddd' },
    left: { color: '#c0392b' },
    right: { color: '#27ae60' },
    floor: { color: '#bdc3c7' },
    ceiling: { color: '#ecf0f1' }
};

const boxes = [
    { x: -0.8, y: 0, z: 0.5, w: 0.8, h: 1.2, d: 0.8, rot: 0.3 },
    { x: 0.7, y: 0.3, z: -0.3, w: 0.6, h: 0.6, d: 0.6, rot: -0.2 }
];

function project(x, y, z) {
    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);
    const rx = x * cos + z * sin;
    const rz = -x * sin + z * cos;

    const dist = 6;
    const adjustedZ = rz + dist;
    if (adjustedZ <= 0.1) return null;

    const fov = 120;
    return {
        x: canvas.width / 2 + (rx / adjustedZ) * fov,
        y: canvas.height / 2 + (y / adjustedZ) * fov,
        z: adjustedZ
    };
}

function calculateAO(x, y, z, nx, ny, nz) {
    if (!aoEnabled) return 0;

    let occlusion = 0;
    const roomSize = 2;

    // Check proximity to walls and other objects
    // Floor
    if (ny < 0) {
        const distToFloor = y - (-roomSize);
        occlusion += Math.max(0, 1 - distToFloor) * 0.3;
    }

    // Walls
    const distToLeftWall = x - (-roomSize);
    const distToRightWall = roomSize - x;
    const distToBackWall = roomSize - z;

    if (distToLeftWall < 0.5) occlusion += (0.5 - distToLeftWall) * 0.4;
    if (distToRightWall < 0.5) occlusion += (0.5 - distToRightWall) * 0.4;
    if (distToBackWall < 0.5) occlusion += (0.5 - distToBackWall) * 0.4;

    // Corners get extra occlusion
    const cornerDist = Math.min(distToLeftWall, distToRightWall, distToBackWall, y + roomSize);
    if (cornerDist < 0.3) occlusion += (0.3 - cornerDist) * 0.5;

    return Math.min(1, occlusion * aoStrength);
}

function drawQuad(corners, baseColor) {
    const projected = corners.map(c => project(...c)).filter(p => p !== null);
    if (projected.length < 3) return;

    ctx.beginPath();
    ctx.moveTo(projected[0].x, projected[0].y);
    projected.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();

    // Calculate center for AO
    const cx = corners.reduce((s, c) => s + c[0], 0) / 4;
    const cy = corners.reduce((s, c) => s + c[1], 0) / 4;
    const cz = corners.reduce((s, c) => s + c[2], 0) / 4;

    const ao = calculateAO(cx, cy, cz, 0, 0, -1);
    const darken = 1 - ao;

    // Parse base color and darken
    ctx.fillStyle = baseColor;
    ctx.fill();

    // Apply AO darkening
    if (ao > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${ao * 0.6})`;
        ctx.fill();
    }

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawBox(box) {
    const { x, y, z, w, h, d, rot } = box;

    // Rotate box vertices
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);

    const rotatePoint = (px, pz) => {
        const dx = px - x;
        const dz = pz - z;
        return [x + dx * cos - dz * sin, z + dx * sin + dz * cos];
    };

    const hw = w / 2, hd = d / 2;
    const baseCorners = [
        [-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]
    ].map(([px, pz]) => rotatePoint(x + px, z + pz));

    const topY = y - h;

    // Draw visible faces
    const faces = [
        // Front
        { corners: [[baseCorners[0][0], y, baseCorners[0][1]], [baseCorners[1][0], y, baseCorners[1][1]],
                    [baseCorners[1][0], topY, baseCorners[1][1]], [baseCorners[0][0], topY, baseCorners[0][1]]], shade: 0.8 },
        // Right
        { corners: [[baseCorners[1][0], y, baseCorners[1][1]], [baseCorners[2][0], y, baseCorners[2][1]],
                    [baseCorners[2][0], topY, baseCorners[2][1]], [baseCorners[1][0], topY, baseCorners[1][1]]], shade: 0.6 },
        // Top
        { corners: [[baseCorners[0][0], topY, baseCorners[0][1]], [baseCorners[1][0], topY, baseCorners[1][1]],
                    [baseCorners[2][0], topY, baseCorners[2][1]], [baseCorners[3][0], topY, baseCorners[3][1]]], shade: 1.0 }
    ];

    faces.forEach(face => {
        const l = Math.floor(180 * face.shade);
        drawQuad(face.corners, `rgb(${l}, ${l}, ${l})`);
    });
}

function drawRoom() {
    const s = 2;

    // Back wall
    drawQuad([[-s, s, s], [s, s, s], [s, -s, s], [-s, -s, s]], walls.back.color);

    // Left wall
    drawQuad([[-s, s, -s], [-s, s, s], [-s, -s, s], [-s, -s, -s]], walls.left.color);

    // Right wall
    drawQuad([[s, s, s], [s, s, -s], [s, -s, -s], [s, -s, s]], walls.right.color);

    // Floor
    drawQuad([[-s, s, -s], [s, s, -s], [s, s, s], [-s, s, s]], walls.floor.color);
}

function draw() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawRoom();
    boxes.forEach(box => drawBox(box));

    // Info
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`AO: ${aoEnabled ? '開啟' : '關閉'} | 強度: ${(aoStrength * 100).toFixed(0)}%`, 10, 20);

    rotY += 0.002;

    requestAnimationFrame(draw);
}

aoStrengthSlider.addEventListener('input', (e) => {
    aoStrength = parseFloat(e.target.value);
});

toggleBtn.addEventListener('click', () => {
    aoEnabled = !aoEnabled;
    toggleBtn.textContent = aoEnabled ? '開啟 AO' : '關閉 AO';
    toggleBtn.style.background = aoEnabled ? '#27ae60' : '#e74c3c';
});

draw();
