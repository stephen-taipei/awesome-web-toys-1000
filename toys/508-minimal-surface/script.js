const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');
const buttons = document.querySelectorAll('.surface-btn');

let rotX = 0.5, rotY = 0;
let isDragging = false;
let lastX, lastY;
let currentSurface = 'enneper';

const surfaces = {
    enneper: {
        name: 'Enneper 曲面',
        generate: (u, v) => {
            const x = u - u * u * u / 3 + u * v * v;
            const y = v - v * v * v / 3 + v * u * u;
            const z = u * u - v * v;
            return [x * 0.3, y * 0.3, z * 0.3];
        },
        uRange: [-1.5, 1.5],
        vRange: [-1.5, 1.5]
    },
    catenoid: {
        name: '懸鏈面',
        generate: (u, v) => {
            const x = Math.cosh(v) * Math.cos(u);
            const y = Math.cosh(v) * Math.sin(u);
            const z = v;
            return [x * 0.5, y * 0.5, z * 0.5];
        },
        uRange: [0, Math.PI * 2],
        vRange: [-1, 1]
    },
    helicoid: {
        name: '螺旋面',
        generate: (u, v) => {
            const x = v * Math.cos(u);
            const y = v * Math.sin(u);
            const z = u * 0.3;
            return [x * 0.5, y * 0.5, z * 0.5];
        },
        uRange: [-Math.PI * 2, Math.PI * 2],
        vRange: [-1, 1]
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
    const scale = 80;
    const dist = 4;
    const factor = dist / (dist + z);
    return {
        x: canvas.width / 2 + x * scale * factor,
        y: canvas.height / 2 + y * scale * factor,
        z: z
    };
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const surface = surfaces[currentSurface];
    const uSteps = 40;
    const vSteps = 40;
    const quads = [];

    const uMin = surface.uRange[0], uMax = surface.uRange[1];
    const vMin = surface.vRange[0], vMax = surface.vRange[1];

    for (let i = 0; i < uSteps; i++) {
        for (let j = 0; j < vSteps; j++) {
            const u1 = uMin + (i / uSteps) * (uMax - uMin);
            const u2 = uMin + ((i + 1) / uSteps) * (uMax - uMin);
            const v1 = vMin + (j / vSteps) * (vMax - vMin);
            const v2 = vMin + ((j + 1) / vSteps) * (vMax - vMin);

            const p1 = rotate(surface.generate(u1, v1));
            const p2 = rotate(surface.generate(u2, v1));
            const p3 = rotate(surface.generate(u2, v2));
            const p4 = rotate(surface.generate(u1, v2));

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

        const hue = (u * 60 + v * 60 + 200) % 360;
        const brightness = 30 + (avgZ + 1.5) * 20;
        ctx.fillStyle = `hsla(${hue}, 50%, ${brightness}%, 0.85)`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${hue}, 60%, ${brightness + 15}%, 0.4)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(surface.name, canvas.width / 2, 20);

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

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSurface = btn.dataset.surface;
        infoEl.textContent = surfaces[currentSurface].name;
    });
});

draw();
