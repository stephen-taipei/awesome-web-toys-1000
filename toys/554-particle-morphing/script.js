const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const particleCount = 1000;
let particles = [];
let targetShape = 'cube';
let morphProgress = 1;
let rotationY = 0;
let rotationX = 0.3;

// Shape generators
function getCubePosition(i, total) {
    const perSide = Math.cbrt(total);
    const idx = i % (perSide * perSide * perSide);
    const x = (idx % perSide) / perSide - 0.5;
    const y = (Math.floor(idx / perSide) % perSide) / perSide - 0.5;
    const z = Math.floor(idx / (perSide * perSide)) / perSide - 0.5;
    return { x: x * 120, y: y * 120, z: z * 120 };
}

function getSpherePosition(i, total) {
    const phi = Math.acos(-1 + (2 * i) / total);
    const theta = Math.sqrt(total * Math.PI) * phi;
    const r = 70;
    return {
        x: r * Math.cos(theta) * Math.sin(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(phi)
    };
}

function getTorusPosition(i, total) {
    const R = 50; // Major radius
    const r = 25; // Minor radius
    const u = (i / total) * Math.PI * 2 * 3;
    const v = ((i * 7) % total / total) * Math.PI * 2;
    return {
        x: (R + r * Math.cos(v)) * Math.cos(u),
        y: (R + r * Math.cos(v)) * Math.sin(u),
        z: r * Math.sin(v)
    };
}

function getSpiralPosition(i, total) {
    const t = i / total;
    const angle = t * Math.PI * 8;
    const r = 20 + t * 60;
    const height = (t - 0.5) * 150;
    return {
        x: Math.cos(angle) * r,
        y: height,
        z: Math.sin(angle) * r
    };
}

function getTargetPosition(i) {
    switch (targetShape) {
        case 'cube': return getCubePosition(i, particleCount);
        case 'sphere': return getSpherePosition(i, particleCount);
        case 'torus': return getTorusPosition(i, particleCount);
        case 'spiral': return getSpiralPosition(i, particleCount);
        default: return getCubePosition(i, particleCount);
    }
}

function init() {
    for (let i = 0; i < particleCount; i++) {
        const pos = getCubePosition(i, particleCount);
        particles.push({
            x: pos.x,
            y: pos.y,
            z: pos.z,
            targetX: pos.x,
            targetY: pos.y,
            targetZ: pos.z,
            hue: (i / particleCount) * 60 + 300 // Pink to purple
        });
    }
}

function morphTo(shape) {
    targetShape = shape;
    morphProgress = 0;

    particles.forEach((p, i) => {
        const target = getTargetPosition(i);
        p.targetX = target.x;
        p.targetY = target.y;
        p.targetZ = target.z;
    });

    const names = { cube: '立方體', sphere: '球體', torus: '環面', spiral: '螺旋' };
    infoEl.textContent = `變形至: ${names[shape]}`;
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function project(x, y, z) {
    // Rotate around X
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;

    // Rotate around Y
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

    // Update morph
    if (morphProgress < 1) {
        morphProgress += 0.02;
        const ease = easeInOutCubic(Math.min(1, morphProgress));

        particles.forEach(p => {
            p.x += (p.targetX - p.x) * ease * 0.1;
            p.y += (p.targetY - p.y) * ease * 0.1;
            p.z += (p.targetZ - p.z) * ease * 0.1;
        });
    }

    // Clear
    ctx.fillStyle = 'rgba(10, 10, 21, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Project and sort
    const projected = particles.map(p => ({
        ...p,
        ...project(p.x, p.y, p.z)
    }));
    projected.sort((a, b) => b.z - a.z);

    // Draw
    projected.forEach(p => {
        const size = 2 * p.scale;
        const alpha = 0.3 + p.scale * 0.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${alpha})`;
        ctx.fill();
    });

    requestAnimationFrame(draw);
}

document.getElementById('cubeBtn').addEventListener('click', () => morphTo('cube'));
document.getElementById('sphereBtn').addEventListener('click', () => morphTo('sphere'));
document.getElementById('torusBtn').addEventListener('click', () => morphTo('torus'));
document.getElementById('spiralBtn').addEventListener('click', () => morphTo('spiral'));

init();
draw();
