const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const view2dBtn = document.getElementById('view2dBtn');
const view3dBtn = document.getElementById('view3dBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const infoEl = document.getElementById('info');

let is3D = true;
let rotationY = 0.6;
let rotationX = 0.4;
let floorPlan = [];
let seed = Math.random() * 1000;

const roomColors = {
    living: { r: 200, g: 220, b: 180 },
    bedroom: { r: 180, g: 200, b: 220 },
    kitchen: { r: 220, g: 200, b: 180 },
    bathroom: { r: 180, g: 220, b: 220 },
    hallway: { r: 210, g: 210, b: 210 }
};

function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
}

function generateFloorPlan() {
    floorPlan = [];
    const gridSize = 8;
    const grid = [];

    for (let y = 0; y < gridSize; y++) {
        grid[y] = [];
        for (let x = 0; x < gridSize; x++) {
            grid[y][x] = null;
        }
    }

    // Generate rooms
    const rooms = [
        { type: 'living', minSize: 2, maxSize: 3 },
        { type: 'bedroom', minSize: 2, maxSize: 2 },
        { type: 'bedroom', minSize: 2, maxSize: 2 },
        { type: 'kitchen', minSize: 2, maxSize: 2 },
        { type: 'bathroom', minSize: 1, maxSize: 2 }
    ];

    rooms.forEach(room => {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 50) {
            const w = room.minSize + Math.floor(random() * (room.maxSize - room.minSize + 1));
            const h = room.minSize + Math.floor(random() * (room.maxSize - room.minSize + 1));
            const x = Math.floor(random() * (gridSize - w));
            const y = Math.floor(random() * (gridSize - h));

            let canPlace = true;
            for (let dy = 0; dy < h && canPlace; dy++) {
                for (let dx = 0; dx < w && canPlace; dx++) {
                    if (grid[y + dy][x + dx] !== null) {
                        canPlace = false;
                    }
                }
            }

            if (canPlace) {
                for (let dy = 0; dy < h; dy++) {
                    for (let dx = 0; dx < w; dx++) {
                        grid[y + dy][x + dx] = room.type;
                    }
                }
                floorPlan.push({
                    type: room.type,
                    x, y, w, h,
                    color: roomColors[room.type]
                });
                placed = true;
            }
            attempts++;
        }
    });

    // Fill remaining with hallway
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (grid[y][x] === null) {
                // Check if adjacent to a room
                const hasNeighbor = (x > 0 && grid[y][x - 1]) ||
                    (x < gridSize - 1 && grid[y][x + 1]) ||
                    (y > 0 && grid[y - 1][x]) ||
                    (y < gridSize - 1 && grid[y + 1][x]);

                if (hasNeighbor) {
                    grid[y][x] = 'hallway';
                    floorPlan.push({
                        type: 'hallway',
                        x, y, w: 1, h: 1,
                        color: roomColors.hallway
                    });
                }
            }
        }
    }

    infoEl.textContent = `房間數: ${floorPlan.length}`;
}

function project(x, y, z) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);

    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;
    let y1 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    const scale = 40 / (6 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 - y1 * scale,
        scale,
        z: z2
    };
}

function draw2D() {
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = 35;
    const offsetX = canvas.width / 2 - 4 * scale;
    const offsetY = canvas.height / 2 - 4 * scale;

    // Draw grid
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(offsetX + i * scale, offsetY);
        ctx.lineTo(offsetX + i * scale, offsetY + 8 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + i * scale);
        ctx.lineTo(offsetX + 8 * scale, offsetY + i * scale);
        ctx.stroke();
    }

    // Draw rooms
    floorPlan.forEach(room => {
        const rx = offsetX + room.x * scale;
        const ry = offsetY + room.y * scale;

        ctx.fillStyle = `rgb(${room.color.r}, ${room.color.g}, ${room.color.b})`;
        ctx.fillRect(rx + 2, ry + 2, room.w * scale - 4, room.h * scale - 4);

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(rx + 2, ry + 2, room.w * scale - 4, room.h * scale - 4);

        // Room label
        if (room.w > 1 || room.h > 1) {
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            const label = room.type === 'living' ? '客廳' :
                room.type === 'bedroom' ? '臥室' :
                    room.type === 'kitchen' ? '廚房' :
                        room.type === 'bathroom' ? '浴室' : '';
            ctx.fillText(label, rx + room.w * scale / 2, ry + room.h * scale / 2 + 4);
        }
    });
}

function draw3D() {
    rotationY += 0.005;

    ctx.fillStyle = '#e8f0f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const wallHeight = 2;
    const elements = [];

    floorPlan.forEach(room => {
        const cx = room.x + room.w / 2 - 4;
        const cz = room.y + room.h / 2 - 4;
        const hw = room.w / 2;
        const hd = room.h / 2;

        // Floor
        const floorZ = (project(cx, 0, cz).z);
        elements.push({
            z: floorZ - 10,
            draw: () => {
                const points = [
                    project(cx - hw, 0, cz - hd),
                    project(cx + hw, 0, cz - hd),
                    project(cx + hw, 0, cz + hd),
                    project(cx - hw, 0, cz + hd)
                ];
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.closePath();
                ctx.fillStyle = `rgb(${room.color.r}, ${room.color.g}, ${room.color.b})`;
                ctx.fill();
                ctx.strokeStyle = '#666';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });

        // Walls
        const walls = [
            { points: [[cx - hw, 0, cz - hd], [cx + hw, 0, cz - hd], [cx + hw, wallHeight, cz - hd], [cx - hw, wallHeight, cz - hd]], shade: 0.85 },
            { points: [[cx + hw, 0, cz - hd], [cx + hw, 0, cz + hd], [cx + hw, wallHeight, cz + hd], [cx + hw, wallHeight, cz - hd]], shade: 0.7 },
            { points: [[cx + hw, 0, cz + hd], [cx - hw, 0, cz + hd], [cx - hw, wallHeight, cz + hd], [cx + hw, wallHeight, cz + hd]], shade: 0.8 },
            { points: [[cx - hw, 0, cz + hd], [cx - hw, 0, cz - hd], [cx - hw, wallHeight, cz - hd], [cx - hw, wallHeight, cz + hd]], shade: 0.75 }
        ];

        walls.forEach(wall => {
            const projected = wall.points.map(p => project(p[0], p[1], p[2]));
            const avgZ = projected.reduce((s, p) => s + p.z, 0) / 4;

            elements.push({
                z: avgZ,
                draw: () => {
                    ctx.beginPath();
                    ctx.moveTo(projected[0].x, projected[0].y);
                    projected.forEach(p => ctx.lineTo(p.x, p.y));
                    ctx.closePath();
                    const c = room.color;
                    ctx.fillStyle = `rgb(${Math.floor(c.r * wall.shade)}, ${Math.floor(c.g * wall.shade)}, ${Math.floor(c.b * wall.shade)})`;
                    ctx.fill();
                    ctx.strokeStyle = '#555';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });
    });

    elements.sort((a, b) => b.z - a.z);
    elements.forEach(el => el.draw());
}

function draw() {
    if (is3D) {
        draw3D();
    } else {
        draw2D();
    }
    requestAnimationFrame(draw);
}

view2dBtn.addEventListener('click', () => {
    is3D = false;
    view2dBtn.classList.add('active');
    view3dBtn.classList.remove('active');
    infoEl.textContent = '2D平面視圖';
});

view3dBtn.addEventListener('click', () => {
    is3D = true;
    view3dBtn.classList.add('active');
    view2dBtn.classList.remove('active');
    infoEl.textContent = '3D立體視圖';
});

regenerateBtn.addEventListener('click', () => {
    seed = Math.random() * 1000;
    generateFloorPlan();
});

generateFloorPlan();
draw();
