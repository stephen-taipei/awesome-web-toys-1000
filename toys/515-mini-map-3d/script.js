const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let playerX = 0, playerZ = 0;
let yaw = 0;
const moveSpeed = 0.12;
const keys = {};

// World objects
const trees = [];
const rocks = [];
const buildings = [];

for (let i = 0; i < 20; i++) {
    trees.push({
        x: (Math.random() - 0.5) * 40,
        z: (Math.random() - 0.5) * 40,
        height: 1.5 + Math.random() * 1
    });
}

for (let i = 0; i < 15; i++) {
    rocks.push({
        x: (Math.random() - 0.5) * 40,
        z: (Math.random() - 0.5) * 40,
        size: 0.3 + Math.random() * 0.4
    });
}

for (let i = 0; i < 5; i++) {
    buildings.push({
        x: (Math.random() - 0.5) * 30,
        z: (Math.random() - 0.5) * 30,
        width: 2 + Math.random() * 2,
        height: 2 + Math.random() * 3
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
    const viewWidth = canvas.width - 100; // Leave space for minimap
    return {
        x: viewWidth / 2 + (rx / rz) * fov,
        y: canvas.height / 2 + (y / rz) * fov,
        z: rz
    };
}

function drawTree(tree) {
    const baseY = 1;
    const trunkHeight = tree.height * 0.4;
    const canopyHeight = tree.height * 0.6;

    // Trunk
    const p1 = project(tree.x - 0.1, baseY, tree.z);
    const p2 = project(tree.x + 0.1, baseY, tree.z);
    const p3 = project(tree.x + 0.1, baseY - trunkHeight, tree.z);
    const p4 = project(tree.x - 0.1, baseY - trunkHeight, tree.z);

    if (p1 && p2 && p3 && p4) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fillStyle = '#5d4037';
        ctx.fill();
    }

    // Canopy (triangle)
    const c1 = project(tree.x, baseY - trunkHeight - canopyHeight, tree.z);
    const c2 = project(tree.x - 0.5, baseY - trunkHeight + 0.1, tree.z);
    const c3 = project(tree.x + 0.5, baseY - trunkHeight + 0.1, tree.z);

    if (c1 && c2 && c3) {
        ctx.beginPath();
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.closePath();
        ctx.fillStyle = '#2e7d32';
        ctx.fill();

        return c1.z;
    }
    return 1000;
}

function drawRock(rock) {
    const baseY = 1;
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const r = rock.size * (0.8 + Math.random() * 0.4);
        const p = project(
            rock.x + Math.cos(angle) * r,
            baseY - rock.size * 0.5,
            rock.z + Math.sin(angle) * r * 0.5
        );
        if (p) points.push(p);
    }

    if (points.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = '#757575';
        ctx.fill();
        return points[0].z;
    }
    return 1000;
}

function drawBuilding(building) {
    const baseY = 1;
    const w = building.width / 2;
    const h = building.height;

    // Front face
    const f1 = project(building.x - w, baseY, building.z - w);
    const f2 = project(building.x + w, baseY, building.z - w);
    const f3 = project(building.x + w, baseY - h, building.z - w);
    const f4 = project(building.x - w, baseY - h, building.z - w);

    // Side face
    const s1 = project(building.x + w, baseY, building.z - w);
    const s2 = project(building.x + w, baseY, building.z + w);
    const s3 = project(building.x + w, baseY - h, building.z + w);
    const s4 = project(building.x + w, baseY - h, building.z - w);

    // Top face
    const t1 = project(building.x - w, baseY - h, building.z - w);
    const t2 = project(building.x + w, baseY - h, building.z - w);
    const t3 = project(building.x + w, baseY - h, building.z + w);
    const t4 = project(building.x - w, baseY - h, building.z + w);

    if (f1 && f2 && f3 && f4) {
        ctx.beginPath();
        ctx.moveTo(f1.x, f1.y);
        ctx.lineTo(f2.x, f2.y);
        ctx.lineTo(f3.x, f3.y);
        ctx.lineTo(f4.x, f4.y);
        ctx.closePath();
        ctx.fillStyle = '#8d6e63';
        ctx.fill();
    }

    if (s1 && s2 && s3 && s4) {
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.lineTo(s3.x, s3.y);
        ctx.lineTo(s4.x, s4.y);
        ctx.closePath();
        ctx.fillStyle = '#6d4c41';
        ctx.fill();
    }

    if (t1 && t2 && t3 && t4) {
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t4.x, t4.y);
        ctx.closePath();
        ctx.fillStyle = '#a1887f';
        ctx.fill();
    }

    return f1 ? f1.z : 1000;
}

function drawMiniMap() {
    const mapSize = 80;
    const mapX = canvas.width - mapSize - 10;
    const mapY = 10;
    const scale = 2;

    // Background
    ctx.fillStyle = 'rgba(0, 50, 0, 0.8)';
    ctx.fillRect(mapX, mapY, mapSize, mapSize);
    ctx.strokeStyle = '#90ee90';
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX, mapY, mapSize, mapSize);

    const centerX = mapX + mapSize / 2;
    const centerY = mapY + mapSize / 2;

    // Draw objects on minimap
    ctx.fillStyle = '#2e7d32';
    trees.forEach(tree => {
        const dx = (tree.x - playerX) * scale;
        const dz = (tree.z - playerZ) * scale;
        if (Math.abs(dx) < mapSize / 2 && Math.abs(dz) < mapSize / 2) {
            ctx.beginPath();
            ctx.arc(centerX + dx, centerY + dz, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    ctx.fillStyle = '#757575';
    rocks.forEach(rock => {
        const dx = (rock.x - playerX) * scale;
        const dz = (rock.z - playerZ) * scale;
        if (Math.abs(dx) < mapSize / 2 && Math.abs(dz) < mapSize / 2) {
            ctx.fillRect(centerX + dx - 1, centerY + dz - 1, 3, 3);
        }
    });

    ctx.fillStyle = '#8d6e63';
    buildings.forEach(b => {
        const dx = (b.x - playerX) * scale;
        const dz = (b.z - playerZ) * scale;
        if (Math.abs(dx) < mapSize / 2 && Math.abs(dz) < mapSize / 2) {
            ctx.fillRect(centerX + dx - 3, centerY + dz - 3, 6, 6);
        }
    });

    // Player indicator with direction
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(yaw);
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, 4);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fillStyle = '#ff5722';
    ctx.fill();
    ctx.restore();

    // North indicator
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('N', centerX, mapY + 12);
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
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f7fa');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width - 100, canvas.height / 2);

    // Ground
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(0, canvas.height / 2, canvas.width - 100, canvas.height / 2);

    // Collect all objects with depth
    const objects = [];
    trees.forEach(t => objects.push({ type: 'tree', obj: t, dist: Math.hypot(t.x - playerX, t.z - playerZ) }));
    rocks.forEach(r => objects.push({ type: 'rock', obj: r, dist: Math.hypot(r.x - playerX, r.z - playerZ) }));
    buildings.forEach(b => objects.push({ type: 'building', obj: b, dist: Math.hypot(b.x - playerX, b.z - playerZ) }));

    // Sort by distance (far to near)
    objects.sort((a, b) => b.dist - a.dist);

    objects.forEach(item => {
        if (item.type === 'tree') drawTree(item.obj);
        else if (item.type === 'rock') drawRock(item.obj);
        else if (item.type === 'building') drawBuilding(item.obj);
    });

    // Minimap panel background
    ctx.fillStyle = '#1a2a0a';
    ctx.fillRect(canvas.width - 100, 0, 100, canvas.height);

    drawMiniMap();

    // Compass below minimap
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${(yaw * 180 / Math.PI % 360).toFixed(0)}°`, canvas.width - 50, 110);

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
