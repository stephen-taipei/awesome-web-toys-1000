const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const mode1Btn = document.getElementById('mode1');
const mode2Btn = document.getElementById('mode2');
const mode3Btn = document.getElementById('mode3');
const infoEl = document.getElementById('info');

let mode = 'cube';
let rotationX = 0.3;
let rotationY = 0;
let isDragging = false;
let lastX = 0, lastY = 0;
let time = 0;

const eyeOffset = 0.08;
const halfWidth = canvas.width / 2;
const halfHeight = canvas.height;

function project(v, eyeX, cx, cy) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);

    let x1 = v.x - eyeX;
    let y1 = v.y;
    let z1 = v.z;

    let x2 = x1 * cosY - z1 * sinY;
    let z2 = x1 * sinY + z1 * cosY;
    let y2 = y1 * cosX - z2 * sinX;
    let z3 = y1 * sinX + z2 * cosX;

    const scale = 60 / (4 + z3);
    return {
        x: cx + x2 * scale,
        y: cy - y2 * scale,
        z: z3
    };
}

function drawLine(p1, p2, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function drawCube(cx, cy, eyeX) {
    const size = 1;
    const vertices = [
        { x: -size, y: -size, z: -size },
        { x: size, y: -size, z: -size },
        { x: size, y: size, z: -size },
        { x: -size, y: size, z: -size },
        { x: -size, y: -size, z: size },
        { x: size, y: -size, z: size },
        { x: size, y: size, z: size },
        { x: -size, y: size, z: size }
    ];

    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    const projected = vertices.map(v => project(v, eyeX, cx, cy));
    const hue = (time * 30) % 360;

    edges.forEach(([i, j], idx) => {
        const color = `hsl(${(hue + idx * 30) % 360}, 70%, 60%)`;
        drawLine(projected[i], projected[j], color);
    });
}

function drawSphere(cx, cy, eyeX) {
    const hue = (time * 20) % 360;

    for (let lat = 0; lat < 12; lat++) {
        const theta1 = (lat / 12) * Math.PI;
        const theta2 = ((lat + 1) / 12) * Math.PI;

        for (let lon = 0; lon < 16; lon++) {
            const phi1 = (lon / 16) * Math.PI * 2;
            const phi2 = ((lon + 1) / 16) * Math.PI * 2;

            const p1 = {
                x: Math.sin(theta1) * Math.cos(phi1),
                y: Math.cos(theta1),
                z: Math.sin(theta1) * Math.sin(phi1)
            };
            const p2 = {
                x: Math.sin(theta1) * Math.cos(phi2),
                y: Math.cos(theta1),
                z: Math.sin(theta1) * Math.sin(phi2)
            };
            const p3 = {
                x: Math.sin(theta2) * Math.cos(phi1),
                y: Math.cos(theta2),
                z: Math.sin(theta2) * Math.sin(phi1)
            };

            const proj1 = project(p1, eyeX, cx, cy);
            const proj2 = project(p2, eyeX, cx, cy);
            const proj3 = project(p3, eyeX, cx, cy);

            const color = `hsl(${(hue + lat * 15 + lon * 10) % 360}, 60%, 55%)`;
            drawLine(proj1, proj2, color);
            drawLine(proj1, proj3, color);
        }
    }
}

function drawSpace(cx, cy, eyeX) {
    const hue = (time * 15) % 360;

    // Draw grid floor
    for (let i = -3; i <= 3; i++) {
        const p1 = project({ x: i, y: -1, z: -3 }, eyeX, cx, cy);
        const p2 = project({ x: i, y: -1, z: 3 }, eyeX, cx, cy);
        drawLine(p1, p2, `hsla(${hue}, 50%, 40%, 0.5)`);

        const p3 = project({ x: -3, y: -1, z: i }, eyeX, cx, cy);
        const p4 = project({ x: 3, y: -1, z: i }, eyeX, cx, cy);
        drawLine(p3, p4, `hsla(${hue}, 50%, 40%, 0.5)`);
    }

    // Draw floating shapes
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + time * 0.5;
        const radius = 1.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(time * 2 + i) * 0.3;

        const size = 0.2;
        const verts = [
            { x: x - size, y: y - size, z },
            { x: x + size, y: y - size, z },
            { x: x + size, y: y + size, z },
            { x: x - size, y: y + size, z }
        ];

        const projs = verts.map(v => project(v, eyeX, cx, cy));
        const color = `hsl(${(hue + i * 60) % 360}, 70%, 60%)`;

        for (let j = 0; j < 4; j++) {
            drawLine(projs[j], projs[(j + 1) % 4], color);
        }
    }
}

function drawEye(offsetX, eyeX) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(offsetX, 0, halfWidth, halfHeight);
    ctx.clip();

    const cx = offsetX + halfWidth / 2;
    const cy = halfHeight / 2;

    // Background gradient
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, halfWidth);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(offsetX, 0, halfWidth, halfHeight);

    // Barrel distortion vignette
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, halfWidth * 0.9, halfHeight * 0.9, 0, 0, Math.PI * 2);
    ctx.rect(offsetX + halfWidth, 0, -halfWidth, halfHeight);
    ctx.fill();

    switch (mode) {
        case 'cube':
            drawCube(cx, cy, eyeX);
            break;
        case 'sphere':
            drawSphere(cx, cy, eyeX);
            break;
        case 'space':
            drawSpace(cx, cy, eyeX);
            break;
    }

    // Lens border
    ctx.strokeStyle = 'rgba(100, 181, 246, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, halfWidth * 0.85, halfHeight * 0.85, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

function draw() {
    time += 0.016;
    rotationY += 0.003;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw left eye
    drawEye(0, -eyeOffset);

    // Draw right eye
    drawEye(halfWidth, eyeOffset);

    // Center divider
    ctx.fillStyle = '#000';
    ctx.fillRect(halfWidth - 1, 0, 2, halfHeight);

    requestAnimationFrame(draw);
}

function setMode(newMode, btn) {
    mode = newMode;
    [mode1Btn, mode2Btn, mode3Btn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

mode1Btn.addEventListener('click', () => setMode('cube', mode1Btn));
mode2Btn.addEventListener('click', () => setMode('sphere', mode2Btn));
mode3Btn.addEventListener('click', () => setMode('space', mode3Btn));

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    rotationY += dx * 0.01;
    rotationX += dy * 0.01;
    rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX));
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - lastX;
    const dy = e.touches[0].clientY - lastY;
    rotationY += dx * 0.01;
    rotationX += dy * 0.01;
    rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX));
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    e.preventDefault();
});

canvas.addEventListener('touchend', () => isDragging = false);

draw();
