const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');
const buttons = document.querySelectorAll('.op-btn');

let rotX = 0.4, rotY = 0;
let isDragging = false;
let lastX, lastY;
let operation = 'intersection';

function rotate(x, y, z) {
    let cos = Math.cos(rotX), sin = Math.sin(rotX);
    [y, z] = [y * cos - z * sin, y * sin + z * cos];
    cos = Math.cos(rotY); sin = Math.sin(rotY);
    [x, z] = [x * cos + z * sin, -x * sin + z * cos];
    return { x, y, z };
}

function project(p) {
    const scale = 70;
    const dist = 4;
    const factor = dist / (dist + p.z);
    return {
        x: canvas.width / 2 + p.x * scale * factor,
        y: canvas.height / 2 + p.y * scale * factor,
        z: p.z
    };
}

// Check if point is inside sphere
function inSphere(x, y, z, cx, cy, cz, r) {
    return (x - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2 <= r * r;
}

// Check if point is inside cube
function inCube(x, y, z, size) {
    return Math.abs(x) <= size && Math.abs(y) <= size && Math.abs(z) <= size;
}

function draw() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const resolution = 30;
    const cubeSize = 1;
    const sphereRadius = 1.3;
    const sphereOffset = 0.5;

    const voxels = [];

    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            for (let k = 0; k < resolution; k++) {
                const x = (i / resolution - 0.5) * 3;
                const y = (j / resolution - 0.5) * 3;
                const z = (k / resolution - 0.5) * 3;

                const inA = inCube(x, y, z, cubeSize);
                const inB = inSphere(x, y, z, sphereOffset, 0, 0, sphereRadius);

                let include = false;
                switch (operation) {
                    case 'union': include = inA || inB; break;
                    case 'intersection': include = inA && inB; break;
                    case 'difference': include = inA && !inB; break;
                }

                if (include) {
                    // Check if on surface
                    const dx = 3 / resolution;
                    const neighbors = [
                        [x + dx, y, z], [x - dx, y, z],
                        [x, y + dx, z], [x, y - dx, z],
                        [x, y, z + dx], [x, y, z - dx]
                    ];

                    let isOnSurface = false;
                    for (const [nx, ny, nz] of neighbors) {
                        const nInA = inCube(nx, ny, nz, cubeSize);
                        const nInB = inSphere(nx, ny, nz, sphereOffset, 0, 0, sphereRadius);
                        let nInclude = false;
                        switch (operation) {
                            case 'union': nInclude = nInA || nInB; break;
                            case 'intersection': nInclude = nInA && nInB; break;
                            case 'difference': nInclude = nInA && !nInB; break;
                        }
                        if (!nInclude) {
                            isOnSurface = true;
                            break;
                        }
                    }

                    if (isOnSurface) {
                        const rotated = rotate(x, y, z);
                        const projected = project(rotated);
                        voxels.push({
                            ...projected,
                            fromCube: inA,
                            fromSphere: inB
                        });
                    }
                }
            }
        }
    }

    // Sort by depth
    voxels.sort((a, b) => a.z - b.z);

    // Draw voxels
    voxels.forEach(v => {
        const size = 4 + (v.z + 1.5) * 1.5;
        const alpha = 0.5 + (v.z + 1.5) * 0.2;

        let hue;
        if (v.fromCube && v.fromSphere) hue = 120; // Green for intersection
        else if (v.fromCube) hue = 220; // Blue for cube
        else hue = 0; // Red for sphere

        ctx.beginPath();
        ctx.arc(v.x, v.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
        ctx.fill();
    });

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Cube ◇ Sphere', canvas.width / 2, 20);

    // Legend
    ctx.font = '10px Arial';
    ctx.fillStyle = 'hsla(220, 70%, 50%, 1)';
    ctx.fillRect(20, canvas.height - 30, 10, 10);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText('Cube', 35, canvas.height - 21);

    ctx.fillStyle = 'hsla(0, 70%, 50%, 1)';
    ctx.fillRect(80, canvas.height - 30, 10, 10);
    ctx.fillStyle = '#fff';
    ctx.fillText('Sphere', 95, canvas.height - 21);

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
        operation = btn.dataset.op;
        const names = { union: '聯集', intersection: '交集', difference: '差集' };
        infoEl.textContent = `${names[operation]}運算: Cube ${btn.textContent.split(' ')[1]} Sphere`;
    });
});

draw();
