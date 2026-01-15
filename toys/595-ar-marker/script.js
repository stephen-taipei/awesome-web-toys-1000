const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const model1Btn = document.getElementById('model1');
const model2Btn = document.getElementById('model2');
const model3Btn = document.getElementById('model3');
const infoEl = document.getElementById('info');

let model = 'cube';
let markerX = canvas.width / 2;
let markerY = canvas.height / 2;
let markerAngle = 0;
let markerScale = 1;
let time = 0;
let isDragging = false;
let lastX = 0, lastY = 0;

const markerSize = 80;

function drawMarker(x, y, angle, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    // Marker border
    ctx.fillStyle = '#000';
    ctx.fillRect(-markerSize / 2, -markerSize / 2, markerSize, markerSize);

    // White inner area
    ctx.fillStyle = '#fff';
    ctx.fillRect(-markerSize / 2 + 5, -markerSize / 2 + 5, markerSize - 10, markerSize - 10);

    // Pattern
    ctx.fillStyle = '#000';
    const patternSize = (markerSize - 20) / 4;
    const startX = -markerSize / 2 + 10;
    const startY = -markerSize / 2 + 10;

    // Create unique pattern
    const pattern = [
        [1, 0, 1, 1],
        [0, 1, 0, 1],
        [1, 1, 0, 0],
        [0, 1, 1, 0]
    ];

    pattern.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell) {
                ctx.fillRect(startX + j * patternSize, startY + i * patternSize, patternSize, patternSize);
            }
        });
    });

    ctx.restore();

    return { x, y, angle, scale };
}

function project3D(x, y, z, markerInfo) {
    // Perspective projection based on marker position
    const cx = markerInfo.x;
    const cy = markerInfo.y;
    const scale = markerInfo.scale * 0.8;

    // Apply marker rotation
    const cosA = Math.cos(markerInfo.angle);
    const sinA = Math.sin(markerInfo.angle);

    const rx = x * cosA - y * sinA;
    const ry = x * sinA + y * cosA;

    // Perspective
    const perspective = 200 / (200 + z * 0.5);

    return {
        x: cx + rx * scale * perspective,
        y: cy + (ry - z) * scale * perspective * 0.8,
        z: z
    };
}

function drawCube(markerInfo) {
    const size = 40;
    const vertices = [
        { x: -size, y: -size, z: 0 },
        { x: size, y: -size, z: 0 },
        { x: size, y: size, z: 0 },
        { x: -size, y: size, z: 0 },
        { x: -size, y: -size, z: size * 2 },
        { x: size, y: -size, z: size * 2 },
        { x: size, y: size, z: size * 2 },
        { x: -size, y: size, z: size * 2 }
    ];

    // Rotate cube
    const rotY = time * 0.5;
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    const rotatedVerts = vertices.map(v => ({
        x: v.x * cosY - v.z * sinY + v.z * 0.5,
        y: v.y,
        z: v.x * sinY + v.z * cosY
    }));

    const projected = rotatedVerts.map(v => project3D(v.x, v.y, v.z, markerInfo));

    // Faces with depth sorting
    const faces = [
        { verts: [0, 1, 2, 3], color: 'rgba(255, 100, 100, 0.8)' },
        { verts: [4, 5, 6, 7], color: 'rgba(100, 255, 100, 0.8)' },
        { verts: [0, 1, 5, 4], color: 'rgba(100, 100, 255, 0.8)' },
        { verts: [2, 3, 7, 6], color: 'rgba(255, 255, 100, 0.8)' },
        { verts: [0, 3, 7, 4], color: 'rgba(255, 100, 255, 0.8)' },
        { verts: [1, 2, 6, 5], color: 'rgba(100, 255, 255, 0.8)' }
    ];

    // Sort by average z
    faces.sort((a, b) => {
        const az = a.verts.reduce((sum, i) => sum + projected[i].z, 0) / 4;
        const bz = b.verts.reduce((sum, i) => sum + projected[i].z, 0) / 4;
        return az - bz;
    });

    faces.forEach(face => {
        ctx.fillStyle = face.color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        face.verts.forEach((vi, i) => {
            if (i === 0) ctx.moveTo(projected[vi].x, projected[vi].y);
            else ctx.lineTo(projected[vi].x, projected[vi].y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });
}

function drawPyramid(markerInfo) {
    const baseSize = 50;
    const height = 80;

    const vertices = [
        { x: -baseSize, y: -baseSize, z: 0 },
        { x: baseSize, y: -baseSize, z: 0 },
        { x: baseSize, y: baseSize, z: 0 },
        { x: -baseSize, y: baseSize, z: 0 },
        { x: 0, y: 0, z: height }
    ];

    const rotY = time * 0.5;
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    const rotatedVerts = vertices.map(v => ({
        x: v.x * cosY - v.z * sinY + v.z * 0.3,
        y: v.y,
        z: v.x * sinY + v.z * cosY
    }));

    const projected = rotatedVerts.map(v => project3D(v.x, v.y, v.z, markerInfo));

    const faces = [
        { verts: [0, 1, 2, 3], color: 'rgba(255, 200, 100, 0.8)' },
        { verts: [0, 1, 4], color: 'rgba(255, 150, 50, 0.8)' },
        { verts: [1, 2, 4], color: 'rgba(255, 180, 80, 0.8)' },
        { verts: [2, 3, 4], color: 'rgba(255, 160, 60, 0.8)' },
        { verts: [3, 0, 4], color: 'rgba(255, 140, 40, 0.8)' }
    ];

    faces.sort((a, b) => {
        const az = a.verts.reduce((sum, i) => sum + projected[i].z, 0) / a.verts.length;
        const bz = b.verts.reduce((sum, i) => sum + projected[i].z, 0) / b.verts.length;
        return az - bz;
    });

    faces.forEach(face => {
        ctx.fillStyle = face.color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        face.verts.forEach((vi, i) => {
            if (i === 0) ctx.moveTo(projected[vi].x, projected[vi].y);
            else ctx.lineTo(projected[vi].x, projected[vi].y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });
}

function drawSphere(markerInfo) {
    const radius = 40;
    const segments = 12;

    for (let lat = 0; lat < segments; lat++) {
        const theta1 = (lat / segments) * Math.PI;
        const theta2 = ((lat + 1) / segments) * Math.PI;

        for (let lon = 0; lon < segments; lon++) {
            const phi1 = (lon / segments) * Math.PI * 2 + time * 0.5;
            const phi2 = ((lon + 1) / segments) * Math.PI * 2 + time * 0.5;

            const p1 = {
                x: Math.sin(theta1) * Math.cos(phi1) * radius,
                y: Math.sin(theta1) * Math.sin(phi1) * radius,
                z: Math.cos(theta1) * radius + radius
            };
            const p2 = {
                x: Math.sin(theta1) * Math.cos(phi2) * radius,
                y: Math.sin(theta1) * Math.sin(phi2) * radius,
                z: Math.cos(theta1) * radius + radius
            };
            const p3 = {
                x: Math.sin(theta2) * Math.cos(phi2) * radius,
                y: Math.sin(theta2) * Math.sin(phi2) * radius,
                z: Math.cos(theta2) * radius + radius
            };
            const p4 = {
                x: Math.sin(theta2) * Math.cos(phi1) * radius,
                y: Math.sin(theta2) * Math.sin(phi1) * radius,
                z: Math.cos(theta2) * radius + radius
            };

            const proj = [p1, p2, p3, p4].map(p => project3D(p.x, p.y, p.z, markerInfo));

            const hue = (lat * 30 + lon * 20) % 360;
            ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.8)`;
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 0.5;

            ctx.beginPath();
            ctx.moveTo(proj[0].x, proj[0].y);
            ctx.lineTo(proj[1].x, proj[1].y);
            ctx.lineTo(proj[2].x, proj[2].y);
            ctx.lineTo(proj[3].x, proj[3].y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
}

function drawBackground() {
    // Simulated camera feed with noise
    for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
            const noise = Math.random() * 20;
            const base = 40 + Math.sin(x * 0.05) * 10 + Math.cos(y * 0.05) * 10;
            ctx.fillStyle = `rgb(${base + noise}, ${base + noise + 5}, ${base + noise + 10})`;
            ctx.fillRect(x, y, 4, 4);
        }
    }

    // Camera overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    // Corner brackets
    const bracketSize = 30;
    const margin = 20;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(margin, margin + bracketSize);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + bracketSize, margin);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - margin - bracketSize, margin);
    ctx.lineTo(canvas.width - margin, margin);
    ctx.lineTo(canvas.width - margin, margin + bracketSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(margin, canvas.height - margin - bracketSize);
    ctx.lineTo(margin, canvas.height - margin);
    ctx.lineTo(margin + bracketSize, canvas.height - margin);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - margin - bracketSize, canvas.height - margin);
    ctx.lineTo(canvas.width - margin, canvas.height - margin);
    ctx.lineTo(canvas.width - margin, canvas.height - margin - bracketSize);
    ctx.stroke();

    // Recording indicator
    ctx.fillStyle = time % 1 < 0.5 ? '#f00' : '#800';
    ctx.beginPath();
    ctx.arc(canvas.width - 35, 35, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText('REC', canvas.width - 60, 38);
}

function draw() {
    time += 0.016;

    drawBackground();

    // Animate marker slightly
    const wobble = Math.sin(time * 2) * 0.02;
    const scaleWobble = 1 + Math.sin(time * 3) * 0.02;

    const markerInfo = drawMarker(markerX, markerY, markerAngle + wobble, markerScale * scaleWobble);

    // Draw 3D model on marker
    switch (model) {
        case 'cube':
            drawCube(markerInfo);
            break;
        case 'pyramid':
            drawPyramid(markerInfo);
            break;
        case 'sphere':
            drawSphere(markerInfo);
            break;
    }

    // Detection status
    ctx.fillStyle = '#0f0';
    ctx.font = '11px monospace';
    ctx.fillText('AR標記已偵測', 15, canvas.height - 15);

    requestAnimationFrame(draw);
}

function setModel(newModel, btn) {
    model = newModel;
    [model1Btn, model2Btn, model3Btn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

model1Btn.addEventListener('click', () => setModel('cube', model1Btn));
model2Btn.addEventListener('click', () => setModel('pyramid', model2Btn));
model3Btn.addEventListener('click', () => setModel('sphere', model3Btn));

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    markerX += x - lastX;
    markerY += y - lastY;

    // Keep in bounds
    markerX = Math.max(60, Math.min(canvas.width - 60, markerX));
    markerY = Math.max(60, Math.min(canvas.height - 60, markerY));

    lastX = x;
    lastY = y;
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.touches[0].clientX - rect.left;
    lastY = e.touches[0].clientY - rect.top;
});

canvas.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    markerX += x - lastX;
    markerY += y - lastY;

    markerX = Math.max(60, Math.min(canvas.width - 60, markerX));
    markerY = Math.max(60, Math.min(canvas.height - 60, markerY));

    lastX = x;
    lastY = y;
    e.preventDefault();
});

canvas.addEventListener('touchend', () => isDragging = false);

canvas.addEventListener('wheel', (e) => {
    markerScale += e.deltaY * -0.001;
    markerScale = Math.max(0.5, Math.min(1.5, markerScale));
    e.preventDefault();
});

draw();
