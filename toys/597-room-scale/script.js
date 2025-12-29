const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('resetBtn');
const heightSlider = document.getElementById('heightSlider');
const infoEl = document.getElementById('info');

let playerX = 0;
let playerZ = 0;
let playerHeight = 1.6;
let yaw = 0;
let pitch = 0;
let time = 0;

const keys = {};
const roomSize = 4;

// Room objects
const roomObjects = [
    { type: 'table', x: 1.5, z: 0, y: 0, width: 1.2, height: 0.75, depth: 0.8 },
    { type: 'chair', x: 1.5, z: -1, y: 0, size: 0.4 },
    { type: 'lamp', x: -1.5, z: 1.5, y: 0, height: 1.5 },
    { type: 'plant', x: -1.5, z: -1.5, y: 0, height: 0.8 },
    { type: 'shelf', x: 0, z: 1.8, y: 1, width: 2, height: 0.3, depth: 0.3 }
];

function project(x, y, z) {
    // Translate relative to player
    const dx = x - playerX;
    const dy = y - playerHeight;
    const dz = z - playerZ;

    // Rotate by yaw
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const rx = dx * cosY - dz * sinY;
    const rz = dx * sinY + dz * cosY;

    // Rotate by pitch
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const ry = dy * cosP - rz * sinP;
    const rz2 = dy * sinP + rz * cosP;

    if (rz2 < 0.1) return null;

    const fov = 200;
    const scale = fov / rz2;

    return {
        x: canvas.width / 2 + rx * scale,
        y: canvas.height / 2 - ry * scale,
        z: rz2,
        scale: scale
    };
}

function drawLine3D(x1, y1, z1, x2, y2, z2, color) {
    const p1 = project(x1, y1, z1);
    const p2 = project(x2, y2, z2);

    if (!p1 || !p2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, 3 / ((p1.z + p2.z) / 2));
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function drawRoom() {
    const s = roomSize;
    const h = 2.5;

    // Floor grid
    ctx.strokeStyle = 'rgba(100, 150, 100, 0.5)';
    for (let x = -s; x <= s; x += 0.5) {
        drawLine3D(x, 0, -s, x, 0, s, 'rgba(100, 150, 100, 0.3)');
    }
    for (let z = -s; z <= s; z += 0.5) {
        drawLine3D(-s, 0, z, s, 0, z, 'rgba(100, 150, 100, 0.3)');
    }

    // Walls
    const wallColor = 'rgba(150, 130, 100, 0.6)';

    // Back wall
    drawLine3D(-s, 0, s, s, 0, s, wallColor);
    drawLine3D(-s, h, s, s, h, s, wallColor);
    drawLine3D(-s, 0, s, -s, h, s, wallColor);
    drawLine3D(s, 0, s, s, h, s, wallColor);

    // Left wall
    drawLine3D(-s, 0, -s, -s, 0, s, wallColor);
    drawLine3D(-s, h, -s, -s, h, s, wallColor);
    drawLine3D(-s, 0, -s, -s, h, -s, wallColor);

    // Right wall
    drawLine3D(s, 0, -s, s, 0, s, wallColor);
    drawLine3D(s, h, -s, s, h, s, wallColor);
    drawLine3D(s, 0, -s, s, h, -s, wallColor);

    // Front wall
    drawLine3D(-s, 0, -s, s, 0, -s, wallColor);
    drawLine3D(-s, h, -s, s, h, -s, wallColor);
    drawLine3D(s, 0, -s, s, h, -s, wallColor);

    // Ceiling outline
    drawLine3D(-s, h, -s, s, h, -s, 'rgba(100, 100, 120, 0.4)');
    drawLine3D(-s, h, s, s, h, s, 'rgba(100, 100, 120, 0.4)');
    drawLine3D(-s, h, -s, -s, h, s, 'rgba(100, 100, 120, 0.4)');
    drawLine3D(s, h, -s, s, h, s, 'rgba(100, 100, 120, 0.4)');
}

function drawObjects() {
    roomObjects.forEach(obj => {
        switch (obj.type) {
            case 'table':
                drawTable(obj);
                break;
            case 'chair':
                drawChair(obj);
                break;
            case 'lamp':
                drawLamp(obj);
                break;
            case 'plant':
                drawPlant(obj);
                break;
            case 'shelf':
                drawShelf(obj);
                break;
        }
    });
}

function drawTable(obj) {
    const { x, z, width, height, depth } = obj;
    const hw = width / 2;
    const hd = depth / 2;
    const color = 'rgba(139, 90, 43, 0.8)';

    // Table top
    drawLine3D(x - hw, height, z - hd, x + hw, height, z - hd, color);
    drawLine3D(x - hw, height, z + hd, x + hw, height, z + hd, color);
    drawLine3D(x - hw, height, z - hd, x - hw, height, z + hd, color);
    drawLine3D(x + hw, height, z - hd, x + hw, height, z + hd, color);

    // Legs
    drawLine3D(x - hw + 0.1, 0, z - hd + 0.1, x - hw + 0.1, height, z - hd + 0.1, color);
    drawLine3D(x + hw - 0.1, 0, z - hd + 0.1, x + hw - 0.1, height, z - hd + 0.1, color);
    drawLine3D(x - hw + 0.1, 0, z + hd - 0.1, x - hw + 0.1, height, z + hd - 0.1, color);
    drawLine3D(x + hw - 0.1, 0, z + hd - 0.1, x + hw - 0.1, height, z + hd - 0.1, color);
}

function drawChair(obj) {
    const { x, z, size } = obj;
    const seatHeight = 0.45;
    const backHeight = 0.9;
    const color = 'rgba(100, 80, 60, 0.8)';

    // Seat
    drawLine3D(x - size, seatHeight, z - size, x + size, seatHeight, z - size, color);
    drawLine3D(x - size, seatHeight, z + size, x + size, seatHeight, z + size, color);
    drawLine3D(x - size, seatHeight, z - size, x - size, seatHeight, z + size, color);
    drawLine3D(x + size, seatHeight, z - size, x + size, seatHeight, z + size, color);

    // Legs
    drawLine3D(x - size, 0, z - size, x - size, seatHeight, z - size, color);
    drawLine3D(x + size, 0, z - size, x + size, seatHeight, z - size, color);
    drawLine3D(x - size, 0, z + size, x - size, seatHeight, z + size, color);
    drawLine3D(x + size, 0, z + size, x + size, seatHeight, z + size, color);

    // Back
    drawLine3D(x - size, seatHeight, z + size, x - size, backHeight, z + size, color);
    drawLine3D(x + size, seatHeight, z + size, x + size, backHeight, z + size, color);
    drawLine3D(x - size, backHeight, z + size, x + size, backHeight, z + size, color);
}

function drawLamp(obj) {
    const { x, z, height } = obj;
    const color = 'rgba(180, 180, 100, 0.8)';

    // Stand
    drawLine3D(x, 0, z, x, height, z, 'rgba(60, 60, 60, 0.8)');

    // Shade
    const shadeSize = 0.2;
    drawLine3D(x - shadeSize, height, z - shadeSize, x + shadeSize, height, z - shadeSize, color);
    drawLine3D(x - shadeSize, height, z + shadeSize, x + shadeSize, height, z + shadeSize, color);
    drawLine3D(x - shadeSize, height, z - shadeSize, x - shadeSize, height, z + shadeSize, color);
    drawLine3D(x + shadeSize, height, z - shadeSize, x + shadeSize, height, z + shadeSize, color);

    // Light glow
    const glowP = project(x, height - 0.1, z);
    if (glowP) {
        const gradient = ctx.createRadialGradient(glowP.x, glowP.y, 0, glowP.x, glowP.y, 30 / glowP.z);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.5)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(glowP.x, glowP.y, 30 / glowP.z, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPlant(obj) {
    const { x, z, height } = obj;
    const potColor = 'rgba(139, 69, 19, 0.8)';
    const leafColor = 'rgba(34, 139, 34, 0.8)';

    // Pot
    drawLine3D(x - 0.15, 0, z - 0.15, x + 0.15, 0, z - 0.15, potColor);
    drawLine3D(x - 0.15, 0, z + 0.15, x + 0.15, 0, z + 0.15, potColor);
    drawLine3D(x - 0.15, 0, z - 0.15, x - 0.15, 0, z + 0.15, potColor);
    drawLine3D(x + 0.15, 0, z - 0.15, x + 0.15, 0, z + 0.15, potColor);
    drawLine3D(x - 0.15, 0.3, z - 0.15, x + 0.15, 0.3, z - 0.15, potColor);

    // Leaves
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + time * 0.2;
        const lx = x + Math.cos(angle) * 0.3;
        const lz = z + Math.sin(angle) * 0.3;
        drawLine3D(x, 0.3, z, lx, height, lz, leafColor);
    }
}

function drawShelf(obj) {
    const { x, z, y, width, height, depth } = obj;
    const hw = width / 2;
    const hd = depth / 2;
    const color = 'rgba(120, 100, 80, 0.8)';

    drawLine3D(x - hw, y, z - hd, x + hw, y, z - hd, color);
    drawLine3D(x - hw, y, z + hd, x + hw, y, z + hd, color);
    drawLine3D(x - hw, y, z - hd, x - hw, y, z + hd, color);
    drawLine3D(x + hw, y, z - hd, x + hw, y, z + hd, color);

    // Brackets
    drawLine3D(x - hw + 0.1, y, z, x - hw + 0.1, y + 0.3, z, color);
    drawLine3D(x + hw - 0.1, y, z, x + hw - 0.1, y + 0.3, z, color);
}

function drawPlayArea() {
    // Play area boundary indicator
    const boundary = 2;
    const color = 'rgba(0, 200, 255, 0.3)';

    drawLine3D(-boundary, 0.01, -boundary, boundary, 0.01, -boundary, color);
    drawLine3D(-boundary, 0.01, boundary, boundary, 0.01, boundary, color);
    drawLine3D(-boundary, 0.01, -boundary, -boundary, 0.01, boundary, color);
    drawLine3D(boundary, 0.01, -boundary, boundary, 0.01, boundary, color);
}

function drawHUD() {
    // Crosshair
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();

    // Position info
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '11px monospace';
    ctx.fillText(`位置: (${playerX.toFixed(1)}, ${playerZ.toFixed(1)})`, 10, 20);
    ctx.fillText(`高度: ${(playerHeight * 100).toFixed(0)}cm`, 10, 35);
}

function update() {
    const speed = 0.05;

    if (keys['w'] || keys['W']) {
        playerX += Math.sin(yaw) * speed;
        playerZ += Math.cos(yaw) * speed;
    }
    if (keys['s'] || keys['S']) {
        playerX -= Math.sin(yaw) * speed;
        playerZ -= Math.cos(yaw) * speed;
    }
    if (keys['a'] || keys['A']) {
        playerX -= Math.cos(yaw) * speed;
        playerZ += Math.sin(yaw) * speed;
    }
    if (keys['d'] || keys['D']) {
        playerX += Math.cos(yaw) * speed;
        playerZ -= Math.sin(yaw) * speed;
    }

    // Boundary check
    const boundary = roomSize - 0.3;
    playerX = Math.max(-boundary, Math.min(boundary, playerX));
    playerZ = Math.max(-boundary, Math.min(boundary, playerZ));
}

function draw() {
    time += 0.016;
    update();

    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawRoom();
    drawPlayArea();
    drawObjects();
    drawHUD();

    requestAnimationFrame(draw);
}

resetBtn.addEventListener('click', () => {
    playerX = 0;
    playerZ = 0;
    yaw = 0;
    pitch = 0;
});

heightSlider.addEventListener('input', (e) => {
    playerHeight = parseInt(e.target.value) / 100;
});

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

let isPointerLocked = false;

canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === canvas;
});

document.addEventListener('mousemove', (e) => {
    if (isPointerLocked) {
        yaw += e.movementX * 0.003;
        pitch -= e.movementY * 0.003;
        pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch));
    }
});

draw();
