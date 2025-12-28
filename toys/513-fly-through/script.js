const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

// Camera state
let camX = 0, camY = 0, camZ = 0;
let yaw = 0, pitch = 0, roll = 0;
const speed = 0.15;

// Input
const keys = {};

// Starfield
const stars = [];
for (let i = 0; i < 300; i++) {
    stars.push({
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        z: (Math.random() - 0.5) * 100,
        size: Math.random() * 2 + 0.5
    });
}

// Structures to fly through
const structures = [];
for (let i = 0; i < 30; i++) {
    structures.push({
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 40,
        z: (Math.random() - 0.5) * 60,
        type: Math.floor(Math.random() * 3),
        size: 1 + Math.random() * 2,
        hue: Math.random() * 360
    });
}

function rotatePoint(x, y, z) {
    // Translate to camera
    let dx = x - camX;
    let dy = y - camY;
    let dz = z - camZ;

    // Yaw (Y-axis)
    let cos = Math.cos(-yaw), sin = Math.sin(-yaw);
    [dx, dz] = [dx * cos + dz * sin, -dx * sin + dz * cos];

    // Pitch (X-axis)
    cos = Math.cos(-pitch); sin = Math.sin(-pitch);
    [dy, dz] = [dy * cos - dz * sin, dy * sin + dz * cos];

    // Roll (Z-axis)
    cos = Math.cos(-roll); sin = Math.sin(-roll);
    [dx, dy] = [dx * cos - dy * sin, dx * sin + dy * cos];

    return [dx, dy, dz];
}

function project(x, y, z) {
    if (z <= 0.1) return null;
    const fov = 300;
    return {
        x: canvas.width / 2 + (x / z) * fov,
        y: canvas.height / 2 + (y / z) * fov,
        z: z
    };
}

function drawRing(cx, cy, cz, size, hue) {
    const segments = 16;
    const points = [];

    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = cx + Math.cos(angle) * size;
        const y = cy + Math.sin(angle) * size;
        const rotated = rotatePoint(x, y, cz);
        const projected = project(...rotated);
        if (projected) points.push(projected);
    }

    if (points.length < 3) return null;

    return {
        avgZ: points.reduce((s, p) => s + p.z, 0) / points.length,
        draw: () => {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    };
}

function update() {
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);

    // Forward/backward
    if (keys['w']) {
        camX += sin * cosPitch * speed;
        camY -= sinPitch * speed;
        camZ += cos * cosPitch * speed;
    }
    if (keys['s']) {
        camX -= sin * cosPitch * speed;
        camY += sinPitch * speed;
        camZ -= cos * cosPitch * speed;
    }

    // Strafe
    if (keys['a']) {
        camX -= cos * speed;
        camZ += sin * speed;
    }
    if (keys['d']) {
        camX += cos * speed;
        camZ -= sin * speed;
    }

    // Up/down
    if (keys['q']) camY -= speed;
    if (keys['e']) camY += speed;

    // Turn with arrows
    if (keys['arrowleft']) yaw -= 0.03;
    if (keys['arrowright']) yaw += 0.03;
    if (keys['arrowup']) pitch = Math.max(-Math.PI / 2.5, pitch - 0.03);
    if (keys['arrowdown']) pitch = Math.min(Math.PI / 2.5, pitch + 0.03);
}

function draw() {
    update();

    // Space gradient background
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
    );
    gradient.addColorStop(0, '#001122');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    stars.forEach(star => {
        const rotated = rotatePoint(star.x, star.y, star.z);
        const projected = project(...rotated);
        if (projected && projected.z > 0) {
            const alpha = Math.min(1, 10 / projected.z);
            const size = star.size * (5 / projected.z);
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, Math.max(0.5, size), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        }
    });

    // Draw structures
    const drawables = [];
    structures.forEach(struct => {
        for (let i = 0; i < 5; i++) {
            const offset = i * 0.8;
            const ring = drawRing(
                struct.x, struct.y, struct.z + offset,
                struct.size * (1 - i * 0.15),
                (struct.hue + i * 20) % 360
            );
            if (ring) drawables.push(ring);
        }
    });

    drawables.sort((a, b) => b.avgZ - a.avgZ);
    drawables.forEach(d => d.draw());

    // Speed lines effect
    if (keys['w']) {
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (x - canvas.width / 2) * 0.1, y + (y - canvas.height / 2) * 0.1);
            ctx.stroke();
        }
    }

    // HUD
    ctx.fillStyle = 'rgba(0, 180, 216, 0.7)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`POS: ${camX.toFixed(1)}, ${camY.toFixed(1)}, ${camZ.toFixed(1)}`, 10, 20);
    ctx.fillText(`YAW: ${(yaw * 180 / Math.PI).toFixed(0)}°`, 10, 32);

    // Crosshair
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.5)';
    ctx.lineWidth = 1;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy);
    ctx.lineTo(cx - 10, cy);
    ctx.moveTo(cx + 10, cy);
    ctx.lineTo(cx + 20, cy);
    ctx.moveTo(cx, cy - 20);
    ctx.lineTo(cx, cy - 10);
    ctx.moveTo(cx, cy + 10);
    ctx.lineTo(cx, cy + 20);
    ctx.stroke();

    requestAnimationFrame(draw);
}

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width - 0.5;
    const y = (e.clientY - rect.top) / canvas.height - 0.5;
    yaw += x * 0.02;
    pitch += y * 0.02;
    pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch));
});

draw();
