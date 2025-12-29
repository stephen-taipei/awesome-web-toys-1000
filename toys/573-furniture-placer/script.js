const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sofaBtn = document.getElementById('sofaBtn');
const tableBtn = document.getElementById('tableBtn');
const chairBtn = document.getElementById('chairBtn');
const plantBtn = document.getElementById('plantBtn');
const clearBtn = document.getElementById('clearBtn');
const infoEl = document.getElementById('info');

let selectedFurniture = 'sofa';
let placedFurniture = [];
let rotationY = 0.5;

const furnitureTypes = {
    sofa: { w: 2, h: 0.8, d: 0.8, color: { r: 100, g: 130, b: 180 }, name: '沙發' },
    table: { w: 1.2, h: 0.5, d: 0.8, color: { r: 139, g: 90, b: 43 }, name: '桌子' },
    chair: { w: 0.5, h: 0.9, d: 0.5, color: { r: 80, g: 60, b: 40 }, name: '椅子' },
    plant: { w: 0.4, h: 1.2, d: 0.4, color: { r: 50, g: 120, b: 50 }, name: '植物' }
};

const roomSize = 5;

function project(x, y, z) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(0.35);
    const sinX = Math.sin(0.35);

    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;
    let y1 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    const scale = 60 / (8 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 - y1 * scale + 20,
        scale,
        z: z2
    };
}

function screenToWorld(sx, sy) {
    // Approximate inverse - find point on floor
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);

    // Search floor grid for closest match
    let bestDist = Infinity;
    let bestX = 0, bestZ = 0;

    for (let z = -roomSize + 0.5; z < roomSize; z += 0.5) {
        for (let x = -roomSize + 0.5; x < roomSize; x += 0.5) {
            const p = project(x, 0, z);
            const dist = (p.x - sx) ** 2 + (p.y - sy) ** 2;
            if (dist < bestDist) {
                bestDist = dist;
                bestX = x;
                bestZ = z;
            }
        }
    }

    return { x: bestX, z: bestZ };
}

function drawBox(x, y, z, w, h, d, color) {
    const hw = w / 2, hd = d / 2;

    const vertices = [
        project(x - hw, y, z - hd),
        project(x + hw, y, z - hd),
        project(x + hw, y, z + hd),
        project(x - hw, y, z + hd),
        project(x - hw, y + h, z - hd),
        project(x + hw, y + h, z - hd),
        project(x + hw, y + h, z + hd),
        project(x - hw, y + h, z + hd)
    ];

    const faces = [
        { verts: [0, 1, 5, 4], shade: 0.7 },
        { verts: [2, 3, 7, 6], shade: 0.7 },
        { verts: [1, 2, 6, 5], shade: 0.85 },
        { verts: [3, 0, 4, 7], shade: 0.85 },
        { verts: [4, 5, 6, 7], shade: 1.0 },
        { verts: [0, 3, 2, 1], shade: 0.6 }
    ];

    faces.forEach(face => {
        const points = face.verts.map(i => vertices[i]);
        const avgZ = points.reduce((s, p) => s + p.z, 0) / 4;

        if (avgZ > -5) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.fillStyle = `rgb(${Math.floor(color.r * face.shade)}, ${Math.floor(color.g * face.shade)}, ${Math.floor(color.b * face.shade)})`;
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    });

    return (vertices[0].z + vertices[2].z + vertices[4].z + vertices[6].z) / 4;
}

function draw() {
    rotationY += 0.003;

    // Background
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw floor
    const floorColor = { r: 200, g: 180, b: 150 };
    const gridStep = 1;

    for (let z = -roomSize; z < roomSize; z += gridStep) {
        for (let x = -roomSize; x < roomSize; x += gridStep) {
            const points = [
                project(x, 0, z),
                project(x + gridStep, 0, z),
                project(x + gridStep, 0, z + gridStep),
                project(x, 0, z + gridStep)
            ];

            const shade = ((x + z) % 2 === 0) ? 0.95 : 1.0;

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.fillStyle = `rgb(${Math.floor(floorColor.r * shade)}, ${Math.floor(floorColor.g * shade)}, ${Math.floor(floorColor.b * shade)})`;
            ctx.fill();
        }
    }

    // Draw walls
    const wallColor = { r: 230, g: 225, b: 215 };
    const wallHeight = 3;

    // Back wall
    const backWall = [
        project(-roomSize, 0, roomSize),
        project(roomSize, 0, roomSize),
        project(roomSize, wallHeight, roomSize),
        project(-roomSize, wallHeight, roomSize)
    ];
    ctx.beginPath();
    ctx.moveTo(backWall[0].x, backWall[0].y);
    backWall.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = `rgb(${wallColor.r}, ${wallColor.g}, ${wallColor.b})`;
    ctx.fill();

    // Left wall
    const leftWall = [
        project(-roomSize, 0, -roomSize),
        project(-roomSize, 0, roomSize),
        project(-roomSize, wallHeight, roomSize),
        project(-roomSize, wallHeight, -roomSize)
    ];
    ctx.beginPath();
    ctx.moveTo(leftWall[0].x, leftWall[0].y);
    leftWall.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = `rgb(${Math.floor(wallColor.r * 0.85)}, ${Math.floor(wallColor.g * 0.85)}, ${Math.floor(wallColor.b * 0.85)})`;
    ctx.fill();

    // Sort and draw furniture
    const sortedFurniture = placedFurniture.map(f => {
        const type = furnitureTypes[f.type];
        const centerP = project(f.x, type.h / 2, f.z);
        return { ...f, depth: centerP.z };
    }).sort((a, b) => b.depth - a.depth);

    sortedFurniture.forEach(f => {
        const type = furnitureTypes[f.type];
        drawBox(f.x, 0, f.z, type.w, type.h, type.d, type.color);
    });

    requestAnimationFrame(draw);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const worldPos = screenToWorld(sx, sy);

    // Check bounds
    const type = furnitureTypes[selectedFurniture];
    if (Math.abs(worldPos.x) < roomSize - type.w / 2 &&
        Math.abs(worldPos.z) < roomSize - type.d / 2) {
        placedFurniture.push({
            type: selectedFurniture,
            x: worldPos.x,
            z: worldPos.z
        });
        infoEl.textContent = `已放置 ${type.name} (共 ${placedFurniture.length} 件)`;
    }
});

function selectFurniture(type, btn) {
    selectedFurniture = type;
    [sofaBtn, tableBtn, chairBtn, plantBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    infoEl.textContent = `已選擇: ${furnitureTypes[type].name}`;
}

sofaBtn.addEventListener('click', () => selectFurniture('sofa', sofaBtn));
tableBtn.addEventListener('click', () => selectFurniture('table', tableBtn));
chairBtn.addEventListener('click', () => selectFurniture('chair', chairBtn));
plantBtn.addEventListener('click', () => selectFurniture('plant', plantBtn));

clearBtn.addEventListener('click', () => {
    placedFurniture = [];
    infoEl.textContent = '已清除所有傢俱';
});

draw();
