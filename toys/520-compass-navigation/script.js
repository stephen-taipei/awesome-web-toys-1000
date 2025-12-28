const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

let playerX = 0, playerZ = 0;
let yaw = 0;
const moveSpeed = 0.1;
const keys = {};

// Landmarks at cardinal directions
const landmarks = [
    { x: 0, z: 15, name: '北塔', color: '#e74c3c' },
    { x: 15, z: 0, name: '東塔', color: '#3498db' },
    { x: 0, z: -15, name: '南塔', color: '#f39c12' },
    { x: -15, z: 0, name: '西塔', color: '#9b59b6' }
];

// Random trees
const trees = [];
for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 5 + Math.random() * 10;
    trees.push({
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        height: 1 + Math.random() * 1.5
    });
}

function project(x, y, z) {
    const dx = x - playerX;
    const dz = z - playerZ;

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

function drawLandmark(landmark) {
    const w = 1;
    const h = 4;
    const baseY = 1;

    const p1 = project(landmark.x - w/2, baseY, landmark.z - w/2);
    const p2 = project(landmark.x + w/2, baseY, landmark.z - w/2);
    const p3 = project(landmark.x + w/2, baseY - h, landmark.z - w/2);
    const p4 = project(landmark.x - w/2, baseY - h, landmark.z - w/2);

    if (p1 && p2 && p3 && p4) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fillStyle = landmark.color;
        ctx.fill();

        // Tower top
        const top = project(landmark.x, baseY - h - 1, landmark.z);
        if (top) {
            ctx.beginPath();
            ctx.moveTo(p3.x, p3.y);
            ctx.lineTo(top.x, top.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.closePath();
            ctx.fillStyle = landmark.color;
            ctx.fill();
        }

        // Label
        const label = project(landmark.x, baseY - h - 1.5, landmark.z);
        if (label && label.z < 20) {
            ctx.fillStyle = '#fff';
            ctx.font = `${Math.max(8, 14 - label.z * 0.5)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(landmark.name, label.x, label.y);
        }

        return p1.z;
    }
    return 100;
}

function drawTree(tree) {
    const p = project(tree.x, 1 - tree.height * 0.4, tree.z);
    if (!p || p.z > 15) return;

    const size = 15 / p.z;

    // Trunk
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(p.x - size * 0.1, p.y, size * 0.2, size * 0.4);

    // Canopy
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - size * tree.height);
    ctx.lineTo(p.x - size * 0.4, p.y);
    ctx.lineTo(p.x + size * 0.4, p.y);
    ctx.closePath();
    ctx.fillStyle = '#2e7d32';
    ctx.fill();
}

function drawCompass() {
    const compassX = canvas.width - 55;
    const compassY = 55;
    const radius = 40;

    // Compass background
    ctx.beginPath();
    ctx.arc(compassX, compassY, radius + 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30, 20, 10, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(compassX, compassY, radius - 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Cardinal direction marks
    const directions = [
        { angle: 0, label: 'N', color: '#e74c3c' },
        { angle: Math.PI / 2, label: 'E', color: '#3498db' },
        { angle: Math.PI, label: 'S', color: '#f39c12' },
        { angle: -Math.PI / 2, label: 'W', color: '#9b59b6' }
    ];

    ctx.save();
    ctx.translate(compassX, compassY);
    ctx.rotate(-yaw);

    // Tick marks
    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const len = i % 4 === 0 ? 8 : (i % 2 === 0 ? 5 : 3);
        ctx.strokeStyle = i % 4 === 0 ? '#d4af37' : 'rgba(212, 175, 55, 0.5)';
        ctx.lineWidth = i % 4 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(Math.sin(angle) * (radius - len), -Math.cos(angle) * (radius - len));
        ctx.lineTo(Math.sin(angle) * radius, -Math.cos(angle) * radius);
        ctx.stroke();
    }

    // Direction labels
    directions.forEach(dir => {
        const x = Math.sin(dir.angle) * (radius - 18);
        const y = -Math.cos(dir.angle) * (radius - 18);
        ctx.fillStyle = dir.color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dir.label, x, y);
    });

    ctx.restore();

    // Fixed needle pointing up (player direction)
    ctx.beginPath();
    ctx.moveTo(compassX, compassY - 25);
    ctx.lineTo(compassX - 6, compassY + 5);
    ctx.lineTo(compassX, compassY - 5);
    ctx.lineTo(compassX + 6, compassY + 5);
    ctx.closePath();
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center jewel
    ctx.beginPath();
    ctx.arc(compassX, compassY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#d4af37';
    ctx.fill();
}

function drawHeadingDisplay() {
    let heading = ((yaw * 180 / Math.PI) % 360 + 360) % 360;
    let direction = '';

    if (heading >= 337.5 || heading < 22.5) direction = 'N';
    else if (heading < 67.5) direction = 'NE';
    else if (heading < 112.5) direction = 'E';
    else if (heading < 157.5) direction = 'SE';
    else if (heading < 202.5) direction = 'S';
    else if (heading < 247.5) direction = 'SW';
    else if (heading < 292.5) direction = 'W';
    else direction = 'NW';

    ctx.fillStyle = 'rgba(212, 175, 55, 0.9)';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${heading.toFixed(0)}° ${direction}`, canvas.width / 2, 25);
}

function drawDistanceToLandmarks() {
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';

    landmarks.forEach((lm, i) => {
        const dist = Math.hypot(lm.x - playerX, lm.z - playerZ);
        ctx.fillStyle = lm.color;
        ctx.fillText(`${lm.name}: ${dist.toFixed(1)}m`, 10, 20 + i * 14);
    });
}

function update() {
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);

    if (keys['w']) { playerX += sin * moveSpeed; playerZ += cos * moveSpeed; }
    if (keys['s']) { playerX -= sin * moveSpeed; playerZ -= cos * moveSpeed; }
    if (keys['a']) { playerX -= cos * moveSpeed; playerZ += sin * moveSpeed; }
    if (keys['d']) { playerX += cos * moveSpeed; playerZ -= sin * moveSpeed; }
    if (keys['arrowleft']) yaw -= 0.04;
    if (keys['arrowright']) yaw += 0.04;
}

function draw() {
    update();

    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
    gradient.addColorStop(0, '#1a1510');
    gradient.addColorStop(1, '#2d2416');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#2d3a1a';
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    // Collect all objects
    const objects = [];

    trees.forEach(t => {
        const dist = Math.hypot(t.x - playerX, t.z - playerZ);
        objects.push({ type: 'tree', obj: t, dist });
    });

    landmarks.forEach(lm => {
        const dist = Math.hypot(lm.x - playerX, lm.z - playerZ);
        objects.push({ type: 'landmark', obj: lm, dist });
    });

    // Sort by distance
    objects.sort((a, b) => b.dist - a.dist);

    objects.forEach(item => {
        if (item.type === 'tree') drawTree(item.obj);
        else drawLandmark(item.obj);
    });

    drawCompass();
    drawHeadingDisplay();
    drawDistanceToLandmarks();

    requestAnimationFrame(draw);
}

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

draw();
