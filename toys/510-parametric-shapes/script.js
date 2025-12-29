const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const shapeSelect = document.getElementById('shapeSelect');
const infoEl = document.getElementById('info');

let rotX = 0.4, rotY = 0;
let isDragging = false;
let lastX, lastY;

const shapes = {
    sphere: {
        name: '球面',
        formula: 'x = cos(u)sin(v), y = sin(u)sin(v), z = cos(v)',
        generate: (u, v) => {
            const x = Math.cos(u) * Math.sin(v);
            const y = Math.sin(u) * Math.sin(v);
            const z = Math.cos(v);
            return [x, y, z];
        },
        uRange: [0, Math.PI * 2],
        vRange: [0, Math.PI]
    },
    torus: {
        name: '環面',
        formula: 'x = (R+r·cos(v))cos(u), y = (R+r·cos(v))sin(u), z = r·sin(v)',
        generate: (u, v) => {
            const R = 0.7, r = 0.3;
            const x = (R + r * Math.cos(v)) * Math.cos(u);
            const y = (R + r * Math.cos(v)) * Math.sin(u);
            const z = r * Math.sin(v);
            return [x, y, z];
        },
        uRange: [0, Math.PI * 2],
        vRange: [0, Math.PI * 2]
    },
    cone: {
        name: '圓錐',
        formula: 'x = v·cos(u), y = v·sin(u), z = v',
        generate: (u, v) => {
            const x = v * Math.cos(u) * 0.5;
            const y = v * Math.sin(u) * 0.5;
            const z = v - 0.5;
            return [x, y, z];
        },
        uRange: [0, Math.PI * 2],
        vRange: [0, 1]
    },
    cylinder: {
        name: '圓柱',
        formula: 'x = cos(u), y = sin(u), z = v',
        generate: (u, v) => {
            const x = Math.cos(u) * 0.5;
            const y = Math.sin(u) * 0.5;
            const z = v - 0.5;
            return [x, y, z];
        },
        uRange: [0, Math.PI * 2],
        vRange: [0, 1]
    },
    superellipsoid: {
        name: '超橢球',
        formula: 'x = cos^n(u)cos^n(v), y = cos^n(u)sin^n(v), z = sin^n(u)',
        generate: (u, v) => {
            const n = 0.5;
            const signPow = (val, exp) => Math.sign(val) * Math.pow(Math.abs(val), exp);
            const x = signPow(Math.cos(u), n) * signPow(Math.cos(v), n);
            const y = signPow(Math.cos(u), n) * signPow(Math.sin(v), n);
            const z = signPow(Math.sin(u), n);
            return [x, y, z];
        },
        uRange: [-Math.PI / 2, Math.PI / 2],
        vRange: [-Math.PI, Math.PI]
    }
};

function rotate(v) {
    let [x, y, z] = v;
    let cos = Math.cos(rotX), sin = Math.sin(rotX);
    [y, z] = [y * cos - z * sin, y * sin + z * cos];
    cos = Math.cos(rotY); sin = Math.sin(rotY);
    [x, z] = [x * cos + z * sin, -x * sin + z * cos];
    return [x, y, z];
}

function project(v) {
    const [x, y, z] = v;
    const scale = 100;
    const dist = 3;
    const factor = dist / (dist + z);
    return {
        x: canvas.width / 2 + x * scale * factor,
        y: canvas.height / 2 + y * scale * factor,
        z: z
    };
}

function draw() {
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const shape = shapes[shapeSelect.value];
    const uSteps = 40;
    const vSteps = 40;
    const quads = [];

    const [uMin, uMax] = shape.uRange;
    const [vMin, vMax] = shape.vRange;

    for (let i = 0; i < uSteps; i++) {
        for (let j = 0; j < vSteps; j++) {
            const u1 = uMin + (i / uSteps) * (uMax - uMin);
            const u2 = uMin + ((i + 1) / uSteps) * (uMax - uMin);
            const v1 = vMin + (j / vSteps) * (vMax - vMin);
            const v2 = vMin + ((j + 1) / vSteps) * (vMax - vMin);

            const p1 = rotate(shape.generate(u1, v1));
            const p2 = rotate(shape.generate(u2, v1));
            const p3 = rotate(shape.generate(u2, v2));
            const p4 = rotate(shape.generate(u1, v2));

            const avgZ = (p1[2] + p2[2] + p3[2] + p4[2]) / 4;

            quads.push({
                points: [project(p1), project(p2), project(p3), project(p4)],
                avgZ,
                u: i / uSteps,
                v: j / vSteps
            });
        }
    }

    quads.sort((a, b) => a.avgZ - b.avgZ);

    quads.forEach(quad => {
        const { points, avgZ, u, v } = quad;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        const hue = (u * 180 + 180) % 360;
        const brightness = 35 + (avgZ + 1) * 20;
        ctx.fillStyle = `hsla(${hue}, 60%, ${brightness}%, 0.9)`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${hue}, 70%, ${brightness + 10}%, 0.5)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });

    // Title and formula
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(shape.name, canvas.width / 2, 25);

    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(shape.formula.substring(0, 40), canvas.width / 2, canvas.height - 10);

    if (!isDragging) rotY += 0.01;
    requestAnimationFrame(draw);
}

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    rotY += (e.clientX - lastX) * 0.01;
    rotX += (e.clientY - lastY) * 0.01;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

shapeSelect.addEventListener('change', () => {
    infoEl.textContent = shapes[shapeSelect.value].name + ' - 參數曲面';
});

draw();
