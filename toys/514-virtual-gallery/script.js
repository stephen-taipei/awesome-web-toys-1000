const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

// Player state
let playerX = 0, playerZ = 0;
let yaw = 0;
const moveSpeed = 0.08;
const keys = {};

// Gallery dimensions
const roomWidth = 10;
const roomLength = 16;
const wallHeight = 3;

// Artworks on walls
const artworks = [
    { wall: 'left', pos: 3, title: '星夜', color: '#1a237e' },
    { wall: 'left', pos: 8, title: '向日葵', color: '#f9a825' },
    { wall: 'left', pos: 13, title: '睡蓮', color: '#4caf50' },
    { wall: 'right', pos: 3, title: '吶喊', color: '#ff5722' },
    { wall: 'right', pos: 8, title: '記憶永恆', color: '#9c27b0' },
    { wall: 'right', pos: 13, title: '戴珍珠耳環的少女', color: '#00bcd4' },
    { wall: 'back', pos: -2, title: '蒙娜麗莎', color: '#795548' },
    { wall: 'back', pos: 2, title: '創世紀', color: '#e91e63' }
];

function project(x, y, z) {
    // Camera transformation
    const dx = x - playerX;
    const dz = z - playerZ;

    // Rotate by yaw
    const cos = Math.cos(-yaw);
    const sin = Math.sin(-yaw);
    const rx = dx * cos + dz * sin;
    const rz = -dx * sin + dz * cos;

    if (rz <= 0.1) return null;

    const fov = 200;
    return {
        x: canvas.width / 2 + (rx / rz) * fov,
        y: canvas.height / 2 + (y / rz) * fov,
        z: rz
    };
}

function drawQuad(p1, p2, p3, p4, color) {
    const points = [p1, p2, p3, p4].map(p => project(...p)).filter(p => p !== null);
    if (points.length < 3) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function drawFloorAndCeiling() {
    // Floor - checkered pattern
    const tileSize = 2;
    for (let x = -roomWidth / 2; x < roomWidth / 2; x += tileSize) {
        for (let z = 0; z < roomLength; z += tileSize) {
            const isLight = ((x / tileSize + z / tileSize) % 2 === 0);
            const color = isLight ? '#3d3d3d' : '#2a2a2a';
            drawQuad(
                [x, 1.5, z], [x + tileSize, 1.5, z],
                [x + tileSize, 1.5, z + tileSize], [x, 1.5, z + tileSize],
                color
            );
        }
    }

    // Ceiling
    drawQuad(
        [-roomWidth / 2, -wallHeight + 1.5, 0], [roomWidth / 2, -wallHeight + 1.5, 0],
        [roomWidth / 2, -wallHeight + 1.5, roomLength], [-roomWidth / 2, -wallHeight + 1.5, roomLength],
        '#1a1a1a'
    );
}

function drawWalls() {
    // Left wall
    drawQuad(
        [-roomWidth / 2, -wallHeight + 1.5, 0], [-roomWidth / 2, -wallHeight + 1.5, roomLength],
        [-roomWidth / 2, 1.5, roomLength], [-roomWidth / 2, 1.5, 0],
        '#4a4a4a'
    );

    // Right wall
    drawQuad(
        [roomWidth / 2, -wallHeight + 1.5, 0], [roomWidth / 2, 1.5, 0],
        [roomWidth / 2, 1.5, roomLength], [roomWidth / 2, -wallHeight + 1.5, roomLength],
        '#4a4a4a'
    );

    // Back wall
    drawQuad(
        [-roomWidth / 2, -wallHeight + 1.5, roomLength], [roomWidth / 2, -wallHeight + 1.5, roomLength],
        [roomWidth / 2, 1.5, roomLength], [-roomWidth / 2, 1.5, roomLength],
        '#3a3a3a'
    );

    // Front wall (with opening)
    drawQuad(
        [-roomWidth / 2, -wallHeight + 1.5, 0], [-2, -wallHeight + 1.5, 0],
        [-2, 1.5, 0], [-roomWidth / 2, 1.5, 0],
        '#4a4a4a'
    );
    drawQuad(
        [2, -wallHeight + 1.5, 0], [roomWidth / 2, -wallHeight + 1.5, 0],
        [roomWidth / 2, 1.5, 0], [2, 1.5, 0],
        '#4a4a4a'
    );
}

function drawArtwork(art) {
    let x, z, nx, nz;
    const frameWidth = 1.5;
    const frameHeight = 1.2;

    if (art.wall === 'left') {
        x = -roomWidth / 2 + 0.05;
        z = art.pos;
        nx = 1; nz = 0;
    } else if (art.wall === 'right') {
        x = roomWidth / 2 - 0.05;
        z = art.pos;
        nx = -1; nz = 0;
    } else { // back
        x = art.pos;
        z = roomLength - 0.05;
        nx = 0; nz = -1;
    }

    const y1 = -0.8;
    const y2 = -0.8 + frameHeight;

    let corners;
    if (art.wall === 'left' || art.wall === 'right') {
        corners = [
            [x, y1, z - frameWidth / 2],
            [x, y1, z + frameWidth / 2],
            [x, y2, z + frameWidth / 2],
            [x, y2, z - frameWidth / 2]
        ];
    } else {
        corners = [
            [x - frameWidth / 2, y1, z],
            [x + frameWidth / 2, y1, z],
            [x + frameWidth / 2, y2, z],
            [x - frameWidth / 2, y2, z]
        ];
    }

    // Frame
    drawQuad(...corners, '#8b7355');

    // Canvas (slightly inset)
    const inset = 0.1;
    if (art.wall === 'left' || art.wall === 'right') {
        corners = [
            [x, y1 + inset, z - frameWidth / 2 + inset],
            [x, y1 + inset, z + frameWidth / 2 - inset],
            [x, y2 - inset, z + frameWidth / 2 - inset],
            [x, y2 - inset, z - frameWidth / 2 + inset]
        ];
    } else {
        corners = [
            [x - frameWidth / 2 + inset, y1 + inset, z],
            [x + frameWidth / 2 - inset, y1 + inset, z],
            [x + frameWidth / 2 - inset, y2 - inset, z],
            [x - frameWidth / 2 + inset, y2 - inset, z]
        ];
    }
    drawQuad(...corners, art.color);

    // Label
    const labelPos = art.wall === 'left' || art.wall === 'right'
        ? project(x, 0.6, z)
        : project(x, 0.6, z);

    if (labelPos && labelPos.z < 8) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = `${Math.max(8, 12 - labelPos.z)}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText(art.title, labelPos.x, labelPos.y);
    }
}

function update() {
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);

    let dx = 0, dz = 0;
    if (keys['w'] || keys['arrowup']) { dx += sin; dz += cos; }
    if (keys['s'] || keys['arrowdown']) { dx -= sin; dz -= cos; }
    if (keys['a'] || keys['arrowleft']) { dx -= cos; dz += sin; }
    if (keys['d'] || keys['arrowright']) { dx += cos; dz -= sin; }

    const newX = playerX + dx * moveSpeed;
    const newZ = playerZ + dz * moveSpeed;

    // Collision with walls
    const margin = 0.5;
    if (newX > -roomWidth / 2 + margin && newX < roomWidth / 2 - margin) {
        playerX = newX;
    }
    if (newZ > margin && newZ < roomLength - margin) {
        playerZ = newZ;
    }
}

function draw() {
    update();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawFloorAndCeiling();
    drawWalls();

    // Sort artworks by distance
    const sortedArt = [...artworks].sort((a, b) => {
        const distA = a.wall === 'left' || a.wall === 'right'
            ? Math.abs(a.pos - playerZ)
            : Math.abs(a.pos - playerX);
        const distB = b.wall === 'left' || b.wall === 'right'
            ? Math.abs(b.pos - playerZ)
            : Math.abs(b.pos - playerX);
        return distB - distA;
    });

    sortedArt.forEach(art => drawArtwork(art));

    // Spotlight effect
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mini compass
    ctx.save();
    ctx.translate(canvas.width - 30, 30);
    ctx.rotate(-yaw);
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(5, 8);
    ctx.lineTo(-5, 8);
    ctx.closePath();
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.restore();

    requestAnimationFrame(draw);
}

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width - 0.5;
    yaw += x * 0.05;
});

draw();
