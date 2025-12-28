const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const bouncesSelect = document.getElementById('bounces');
const infoEl = document.getElementById('info');

let bounces = 1;
let rotY = 0.2;

// Simple Cornell box scene
const roomSize = 2;
const lightColor = [255, 250, 240];
const leftWallColor = [200, 50, 50];
const rightWallColor = [50, 200, 50];
const whiteColor = [220, 220, 220];

function project(x, y, z) {
    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);
    const rx = x * cos + z * sin;
    const rz = -x * sin + z * cos;

    const dist = 6;
    const adjustedZ = rz + dist;
    if (adjustedZ <= 0.1) return null;

    const fov = 100;
    return {
        x: canvas.width / 2 + (rx / adjustedZ) * fov,
        y: canvas.height / 2 + (y / adjustedZ) * fov,
        z: adjustedZ
    };
}

function blendColors(base, influence, amount) {
    return [
        Math.min(255, base[0] + influence[0] * amount),
        Math.min(255, base[1] + influence[1] * amount),
        Math.min(255, base[2] + influence[2] * amount)
    ];
}

function calculateGI(x, y, z, wallType) {
    let color = [...whiteColor];

    if (wallType === 'left') color = [...leftWallColor];
    else if (wallType === 'right') color = [...rightWallColor];

    // Direct lighting
    const lightY = -roomSize + 0.1;
    const distToLight = Math.sqrt(x * x + (y - lightY) ** 2 + z * z);
    const directLight = Math.max(0.2, 1 - distToLight * 0.2);
    color = color.map(c => c * directLight);

    // Indirect lighting (color bleeding from walls)
    if (bounces >= 1) {
        const distToLeft = x + roomSize;
        const distToRight = roomSize - x;

        // Red bleeding from left wall
        if (distToLeft < 2) {
            const influence = (2 - distToLeft) / 2 * 0.3;
            color = blendColors(color, leftWallColor, influence);
        }

        // Green bleeding from right wall
        if (distToRight < 2) {
            const influence = (2 - distToRight) / 2 * 0.3;
            color = blendColors(color, rightWallColor, influence);
        }
    }

    // Second bounce
    if (bounces >= 2) {
        // Floor receives mixed light
        if (y > roomSize * 0.8) {
            color = blendColors(color, [150, 100, 100], 0.1);
        }
    }

    // Third bounce
    if (bounces >= 3) {
        color = blendColors(color, [180, 170, 160], 0.1);
    }

    return color.map(c => Math.floor(Math.max(0, Math.min(255, c))));
}

function drawQuad(corners, wallType) {
    const projected = corners.map(c => project(...c)).filter(p => p !== null);
    if (projected.length < 3) return;

    const cx = corners.reduce((s, c) => s + c[0], 0) / 4;
    const cy = corners.reduce((s, c) => s + c[1], 0) / 4;
    const cz = corners.reduce((s, c) => s + c[2], 0) / 4;

    const color = calculateGI(cx, cy, cz, wallType);

    ctx.beginPath();
    ctx.moveTo(projected[0].x, projected[0].y);
    projected.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.fill();
}

function drawBox(x, y, z, w, h, d) {
    const hw = w / 2, hd = d / 2;

    const faces = [
        // Front
        [[x - hw, y, z - hd], [x + hw, y, z - hd], [x + hw, y - h, z - hd], [x - hw, y - h, z - hd]],
        // Right
        [[x + hw, y, z - hd], [x + hw, y, z + hd], [x + hw, y - h, z + hd], [x + hw, y - h, z - hd]],
        // Top
        [[x - hw, y - h, z - hd], [x + hw, y - h, z - hd], [x + hw, y - h, z + hd], [x - hw, y - h, z + hd]]
    ];

    faces.forEach(corners => drawQuad(corners, 'box'));
}

function drawRoom() {
    const s = roomSize;

    // Back wall
    drawQuad([[-s, s, s], [s, s, s], [s, -s, s], [-s, -s, s]], 'back');

    // Left wall (red)
    drawQuad([[-s, s, -s], [-s, s, s], [-s, -s, s], [-s, -s, -s]], 'left');

    // Right wall (green)
    drawQuad([[s, s, s], [s, s, -s], [s, -s, -s], [s, -s, s]], 'right');

    // Floor
    drawQuad([[-s, s, -s], [s, s, -s], [s, s, s], [-s, s, s]], 'floor');

    // Ceiling with light
    drawQuad([[-s, -s, -s], [s, -s, -s], [s, -s, s], [-s, -s, s]], 'ceiling');

    // Light panel
    const lp = project(0, -s + 0.01, 0.5);
    if (lp) {
        ctx.beginPath();
        ctx.arc(lp.x, lp.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 250, 240, 0.9)';
        ctx.fill();
    }
}

function draw() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawRoom();
    drawBox(-0.7, roomSize, 0.5, 0.8, 1.4, 0.8);
    drawBox(0.6, roomSize, -0.2, 0.6, 0.7, 0.6);

    // Info
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`光線反彈: ${bounces}`, 10, 20);

    rotY += 0.002;

    requestAnimationFrame(draw);
}

bouncesSelect.addEventListener('change', (e) => {
    bounces = parseInt(e.target.value);
    const descriptions = {
        0: '僅直接光照',
        1: '一次反彈 - 基本色溢',
        2: '二次反彈 - 更柔和',
        3: '三次反彈 - 完全擴散'
    };
    infoEl.textContent = descriptions[bounces];
});

draw();
