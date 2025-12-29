const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const autoBtn = document.getElementById('autoBtn');
const morphSlider = document.getElementById('morphSlider');
const infoEl = document.getElementById('info');

let isAuto = true;
let morphValue = 0.5;
let rotationY = 0;
let time = 0;

// Generate vertices for shapes
function generateCube(size) {
    const s = size;
    return [
        { x: -s, y: -s, z: -s }, { x: s, y: -s, z: -s },
        { x: s, y: s, z: -s }, { x: -s, y: s, z: -s },
        { x: -s, y: -s, z: s }, { x: s, y: -s, z: s },
        { x: s, y: s, z: s }, { x: -s, y: s, z: s }
    ];
}

function generateSphere(radius, segments) {
    const vertices = [];
    for (let i = 0; i < segments; i++) {
        const phi = (i / (segments - 1)) * Math.PI;
        for (let j = 0; j < segments; j++) {
            const theta = (j / segments) * Math.PI * 2;
            vertices.push({
                x: radius * Math.sin(phi) * Math.cos(theta),
                y: radius * Math.cos(phi),
                z: radius * Math.sin(phi) * Math.sin(theta)
            });
        }
    }
    return vertices;
}

function generateTorus(r1, r2, segments) {
    const vertices = [];
    for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        for (let j = 0; j < segments; j++) {
            const phi = (j / segments) * Math.PI * 2;
            const r = r1 + r2 * Math.cos(phi);
            vertices.push({
                x: r * Math.cos(theta),
                y: r2 * Math.sin(phi),
                z: r * Math.sin(theta)
            });
        }
    }
    return vertices;
}

const shapes = [
    generateSphere(1.2, 12),
    generateTorus(0.8, 0.4, 12),
    generateSphere(1.0, 12) // Will be morphed to star
];

// Make third shape into a star-like form
shapes[2] = shapes[2].map((v, i) => {
    const angle = Math.atan2(v.z, v.x);
    const spikes = 5;
    const spikeAmount = 0.4 * (1 + Math.sin(angle * spikes));
    const len = Math.sqrt(v.x * v.x + v.z * v.z);
    const newLen = len * (1 + spikeAmount * 0.5);
    return {
        x: v.x / len * newLen || 0,
        y: v.y,
        z: v.z / len * newLen || 0
    };
});

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpVertex(v1, v2, t) {
    return {
        x: lerp(v1.x, v2.x, t),
        y: lerp(v1.y, v2.y, t),
        z: lerp(v1.z, v2.z, t)
    };
}

function project(v) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(0.3);
    const sinX = Math.sin(0.3);

    let x1 = v.x * cosY - v.z * sinY;
    let z1 = v.x * sinY + v.z * cosY;
    let y1 = v.y * cosX - z1 * sinX;
    let z2 = v.y * sinX + z1 * cosX;

    const scale = 80 / (4 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 - y1 * scale,
        z: z2
    };
}

function draw() {
    time += 0.016;
    rotationY += 0.01;

    if (isAuto) {
        morphValue = (Math.sin(time * 0.5) * 0.5 + 0.5);
        morphSlider.value = morphValue * 100;
    }

    // Background
    ctx.fillStyle = '#0a1515';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Determine which two shapes to morph between
    const totalMorph = morphValue * 2;
    let shapeA, shapeB, localT;

    if (totalMorph < 1) {
        shapeA = shapes[0];
        shapeB = shapes[1];
        localT = totalMorph;
    } else {
        shapeA = shapes[1];
        shapeB = shapes[2];
        localT = totalMorph - 1;
    }

    // Smooth easing
    const t = localT * localT * (3 - 2 * localT);

    // Create morphed vertices
    const minLen = Math.min(shapeA.length, shapeB.length);
    const morphedVertices = [];

    for (let i = 0; i < minLen; i++) {
        morphedVertices.push(lerpVertex(shapeA[i], shapeB[i], t));
    }

    // Project and draw
    const projected = morphedVertices.map(v => project(v));

    // Sort by depth
    const sorted = projected.map((p, i) => ({ ...p, i }))
        .sort((a, b) => b.z - a.z);

    // Draw points
    sorted.forEach(p => {
        const size = 3 + p.z * 0.5;
        const alpha = 0.5 + p.z * 0.1;

        const hue = (time * 30 + p.i * 2) % 360;
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${Math.max(0.2, Math.min(1, alpha))})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, size), 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw connections
    ctx.strokeStyle = 'rgba(77, 182, 172, 0.15)';
    ctx.lineWidth = 0.5;

    const segments = 12;
    for (let i = 0; i < segments - 1; i++) {
        for (let j = 0; j < segments; j++) {
            const idx1 = i * segments + j;
            const idx2 = i * segments + ((j + 1) % segments);
            const idx3 = (i + 1) * segments + j;

            if (idx1 < projected.length && idx2 < projected.length) {
                ctx.beginPath();
                ctx.moveTo(projected[idx1].x, projected[idx1].y);
                ctx.lineTo(projected[idx2].x, projected[idx2].y);
                ctx.stroke();
            }
            if (idx1 < projected.length && idx3 < projected.length) {
                ctx.beginPath();
                ctx.moveTo(projected[idx1].x, projected[idx1].y);
                ctx.lineTo(projected[idx3].x, projected[idx3].y);
                ctx.stroke();
            }
        }
    }

    infoEl.textContent = `變形: ${Math.round(morphValue * 100)}%`;

    requestAnimationFrame(draw);
}

autoBtn.addEventListener('click', () => {
    isAuto = !isAuto;
    autoBtn.classList.toggle('active', isAuto);
    autoBtn.textContent = isAuto ? '自動' : '手動';
});

morphSlider.addEventListener('input', (e) => {
    if (!isAuto) {
        morphValue = parseInt(e.target.value) / 100;
    }
});

draw();
