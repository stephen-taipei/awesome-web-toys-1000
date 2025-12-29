const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const regenerateBtn = document.getElementById('regenerateBtn');
const densitySlider = document.getElementById('densitySlider');
const infoEl = document.getElementById('info');

let rotationY = 0.5;
let buildings = [];
let density = 3;
let seed = Math.random() * 1000;

function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
}

const buildingColors = [
    { r: 180, g: 190, b: 200 },
    { r: 200, g: 180, b: 160 },
    { r: 170, g: 180, b: 190 },
    { r: 190, g: 200, b: 180 },
    { r: 200, g: 200, b: 210 },
    { r: 180, g: 170, b: 160 }
];

function generateCity() {
    buildings = [];
    const gridSize = 4;
    const blockSize = 2;
    const streetWidth = 0.5;

    for (let gz = 0; gz < gridSize; gz++) {
        for (let gx = 0; gx < gridSize; gx++) {
            // Skip some plots based on density
            if (random() > density / 5) continue;

            const baseX = (gx - gridSize / 2) * (blockSize + streetWidth) + blockSize / 2;
            const baseZ = (gz - gridSize / 2) * (blockSize + streetWidth) + blockSize / 2;

            // Building parameters
            const width = 0.8 + random() * 1.0;
            const depth = 0.8 + random() * 0.8;
            const height = 1 + random() * 4 * (density / 3);
            const color = buildingColors[Math.floor(random() * buildingColors.length)];

            buildings.push({
                x: baseX + (random() - 0.5) * 0.3,
                z: baseZ + (random() - 0.5) * 0.3,
                width,
                depth,
                height,
                color,
                windows: Math.random() > 0.3
            });
        }
    }

    infoEl.textContent = `建築數: ${buildings.length}`;
}

function project(x, y, z) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(0.35);
    const sinX = Math.sin(0.35);

    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;
    let y1 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    const scale = 35 / (8 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height - 60 - y1 * scale,
        scale,
        z: z2
    };
}

function drawBuilding(bldg) {
    const { x, z, width, depth, height, color, windows } = bldg;
    const hw = width / 2;
    const hd = depth / 2;

    const vertices = [
        project(x - hw, 0, z - hd),
        project(x + hw, 0, z - hd),
        project(x + hw, 0, z + hd),
        project(x - hw, 0, z + hd),
        project(x - hw, height, z - hd),
        project(x + hw, height, z - hd),
        project(x + hw, height, z + hd),
        project(x - hw, height, z + hd)
    ];

    const faces = [
        { verts: [0, 1, 5, 4], shade: 0.85 },
        { verts: [1, 2, 6, 5], shade: 0.7 },
        { verts: [2, 3, 7, 6], shade: 0.8 },
        { verts: [3, 0, 4, 7], shade: 0.75 },
        { verts: [4, 5, 6, 7], shade: 1.0 }
    ];

    faces.forEach((face, fi) => {
        const points = face.verts.map(i => vertices[i]);

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        if (fi === 4) {
            ctx.fillStyle = `rgb(${Math.floor(color.r * 0.6)}, ${Math.floor(color.g * 0.6)}, ${Math.floor(color.b * 0.6)})`;
        } else {
            ctx.fillStyle = `rgb(${Math.floor(color.r * face.shade)}, ${Math.floor(color.g * face.shade)}, ${Math.floor(color.b * face.shade)})`;
        }
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Windows
        if (windows && fi < 4) {
            const floors = Math.floor(height / 0.6);
            const windowsPerFloor = Math.max(1, Math.floor(width / 0.4));

            for (let f = 0; f < floors; f++) {
                for (let w = 0; w < windowsPerFloor; w++) {
                    const lit = Math.random() > 0.5;
                    const wy = f * 0.6 + 0.2;
                    const wSize = 0.15;

                    let wx, wz;
                    if (fi === 0) {
                        wx = x - hw + 0.2 + w * (width - 0.4) / Math.max(1, windowsPerFloor - 1);
                        wz = z - hd - 0.01;
                    } else if (fi === 1) {
                        wx = x + hw + 0.01;
                        wz = z - hd + 0.2 + w * (depth - 0.4) / Math.max(1, windowsPerFloor - 1);
                    } else {
                        continue;
                    }

                    const wp = project(wx, wy, wz);
                    ctx.fillStyle = lit ? 'rgba(255, 220, 150, 0.9)' : 'rgba(80, 100, 120, 0.7)';
                    ctx.fillRect(wp.x - 2, wp.y - 3, 4, 5);
                }
            }
        }
    });

    return (vertices[0].z + vertices[2].z) / 2;
}

function draw() {
    rotationY += 0.003;

    // Night sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#0a1020');
    skyGrad.addColorStop(0.5, '#1a2040');
    skyGrad.addColorStop(1, '#2a3050');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 50; i++) {
        const sx = (Math.sin(i * 123.456) * 0.5 + 0.5) * canvas.width;
        const sy = (Math.cos(i * 789.012) * 0.5 + 0.5) * canvas.height * 0.5;
        ctx.fillRect(sx, sy, 1, 1);
    }

    // Ground
    const groundPoints = [
        project(-10, 0, -10),
        project(10, 0, -10),
        project(10, 0, 10),
        project(-10, 0, 10)
    ];
    ctx.beginPath();
    ctx.moveTo(groundPoints[0].x, groundPoints[0].y);
    groundPoints.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = '#2a2a3a';
    ctx.fill();

    // Streets (grid lines)
    ctx.strokeStyle = '#3a3a4a';
    ctx.lineWidth = 2;
    for (let i = -4; i <= 4; i++) {
        const p1 = project(i * 2.5, 0.01, -10);
        const p2 = project(i * 2.5, 0.01, 10);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const p3 = project(-10, 0.01, i * 2.5);
        const p4 = project(10, 0.01, i * 2.5);
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
    }

    // Sort and draw buildings
    const sorted = buildings.map(b => ({
        ...b,
        depth: project(b.x, b.height / 2, b.z).z
    })).sort((a, b) => b.depth - a.depth);

    sorted.forEach(b => drawBuilding(b));

    requestAnimationFrame(draw);
}

regenerateBtn.addEventListener('click', () => {
    seed = Math.random() * 1000;
    generateCity();
});

densitySlider.addEventListener('input', (e) => {
    density = parseInt(e.target.value);
    seed = Math.random() * 1000;
    generateCity();
});

generateCity();
draw();
