const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const modelSelect = document.getElementById('modelSelect');
const sizeSlider = document.getElementById('sizeSlider');
const infoEl = document.getElementById('info');

let pointSize = 2;
let currentModel = 'bunny';
let points = [];
let rotationY = 0;
let rotationX = 0.2;

// Generate procedural point cloud models
function generateBunny() {
    const pts = [];
    const count = 3000;

    for (let i = 0; i < count; i++) {
        // Body (ellipsoid)
        if (i < count * 0.5) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 40;
            pts.push({
                x: r * 0.8 * Math.sin(phi) * Math.cos(theta),
                y: r * Math.sin(phi) * Math.sin(theta) + 10,
                z: r * 0.7 * Math.cos(phi)
            });
        }
        // Head
        else if (i < count * 0.7) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 25;
            pts.push({
                x: r * Math.sin(phi) * Math.cos(theta),
                y: r * Math.sin(phi) * Math.sin(theta) - 35,
                z: r * Math.cos(phi) + 15
            });
        }
        // Ears
        else {
            const ear = i % 2;
            const t = Math.random();
            const earX = (ear === 0 ? -12 : 12);
            pts.push({
                x: earX + (Math.random() - 0.5) * 6,
                y: -50 - t * 35,
                z: 20 + (Math.random() - 0.5) * 4
            });
        }
    }
    return pts;
}

function generateTeapot() {
    const pts = [];
    const count = 3000;

    for (let i = 0; i < count; i++) {
        // Body
        if (i < count * 0.6) {
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 50;
            const r = 35 * Math.cos(y / 50 * Math.PI * 0.4);
            pts.push({
                x: r * Math.cos(theta),
                y: y,
                z: r * Math.sin(theta)
            });
        }
        // Spout
        else if (i < count * 0.75) {
            const t = Math.random();
            const angle = -0.5 + t * 0.8;
            pts.push({
                x: 35 + t * 30,
                y: -10 + t * 20 + (Math.random() - 0.5) * 5,
                z: (Math.random() - 0.5) * 8
            });
        }
        // Handle
        else if (i < count * 0.9) {
            const t = Math.random() * Math.PI;
            pts.push({
                x: -35 - Math.sin(t) * 20,
                y: -15 + Math.cos(t) * 25,
                z: (Math.random() - 0.5) * 6
            });
        }
        // Lid
        else {
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * 20;
            pts.push({
                x: r * Math.cos(theta),
                y: -30 - Math.random() * 5,
                z: r * Math.sin(theta)
            });
        }
    }
    return pts;
}

function generateHead() {
    const pts = [];
    const count = 4000;

    for (let i = 0; i < count; i++) {
        // Head shape
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        let r = 45;
        // Modify for face shape
        const faceDir = Math.cos(theta) * Math.sin(phi);
        if (faceDir > 0.5) {
            r *= 0.95; // Flatten face slightly
        }

        let x = r * Math.sin(phi) * Math.cos(theta);
        let y = r * 1.1 * Math.sin(phi) * Math.sin(theta);
        let z = r * Math.cos(phi);

        // Nose
        if (faceDir > 0.8 && y > -10 && y < 10) {
            x += 10;
        }

        pts.push({ x, y, z });
    }
    return pts;
}

function generateDragon() {
    const pts = [];
    const count = 4000;

    for (let i = 0; i < count; i++) {
        // Serpentine body
        if (i < count * 0.7) {
            const t = (i / (count * 0.7)) * Math.PI * 3;
            const bodyRadius = 15 - t * 1.5;
            const theta = Math.random() * Math.PI * 2;

            const baseX = Math.sin(t) * 50;
            const baseY = Math.cos(t * 0.5) * 30;
            const baseZ = t * 15 - 70;

            pts.push({
                x: baseX + Math.cos(theta) * bodyRadius,
                y: baseY + Math.sin(theta) * bodyRadius,
                z: baseZ
            });
        }
        // Wings
        else if (i < count * 0.9) {
            const wing = i % 2;
            const t = Math.random();
            const spread = Math.random() * 40;
            pts.push({
                x: (wing === 0 ? -1 : 1) * (20 + spread),
                y: -20 + t * 30 + Math.random() * 10,
                z: -30 + (Math.random() - 0.5) * 20
            });
        }
        // Head spikes
        else {
            const angle = Math.random() * Math.PI * 2;
            const t = Math.random();
            pts.push({
                x: Math.sin(Math.PI * 3) * 50 + Math.cos(angle) * 10,
                y: Math.cos(Math.PI * 1.5) * 30 - 10 - t * 15,
                z: -70 + 45 + Math.random() * 10
            });
        }
    }
    return pts;
}

function loadModel(model) {
    currentModel = model;
    switch (model) {
        case 'bunny': points = generateBunny(); break;
        case 'teapot': points = generateTeapot(); break;
        case 'head': points = generateHead(); break;
        case 'dragon': points = generateDragon(); break;
    }

    // Add color based on height
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    points.forEach(p => {
        const t = (p.y - minY) / (maxY - minY);
        p.hue = 120 + t * 60; // Green to cyan
    });

    infoEl.textContent = `點數: ${points.length}`;
}

function project(x, y, z) {
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;

    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const x1 = x * cosY - z1 * sinY;
    const z2 = x * sinY + z1 * cosY;

    const scale = 300 / (300 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 + y1 * scale,
        scale,
        z: z2
    };
}

function draw() {
    rotationY += 0.01;

    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Project and sort
    const projected = points.map(p => ({
        ...p,
        ...project(p.x, p.y, p.z)
    }));
    projected.sort((a, b) => b.z - a.z);

    // Draw points
    projected.forEach(p => {
        const size = pointSize * p.scale;
        const alpha = 0.5 + p.scale * 0.4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 55%, ${alpha})`;
        ctx.fill();
    });

    requestAnimationFrame(draw);
}

modelSelect.addEventListener('change', (e) => {
    loadModel(e.target.value);
    const names = { bunny: '兔子', teapot: '茶壺', head: '人頭', dragon: '龍' };
    infoEl.textContent = `模型: ${names[e.target.value]}`;
});

sizeSlider.addEventListener('input', (e) => {
    pointSize = parseInt(e.target.value);
});

loadModel('bunny');
draw();
