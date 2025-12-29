const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const livingBtn = document.getElementById('livingBtn');
const bedroomBtn = document.getElementById('bedroomBtn');
const kitchenBtn = document.getElementById('kitchenBtn');
const infoEl = document.getElementById('info');

let rotationY = 0.3;
let rotationX = 0.2;
let isDragging = false;
let lastX = 0, lastY = 0;
let currentRoom = 'living';

const rooms = {
    living: {
        walls: { r: 240, g: 235, b: 220 },
        floor: { r: 139, g: 90, b: 43 },
        furniture: [
            { type: 'sofa', x: 0, y: 0, z: -3, w: 3, h: 1.2, d: 1, color: { r: 100, g: 130, b: 160 } },
            { type: 'table', x: 0, y: 0, z: 0, w: 1.5, h: 0.5, d: 1, color: { r: 80, g: 50, b: 30 } },
            { type: 'tv', x: 0, y: 1, z: 3.5, w: 2, h: 1.2, d: 0.1, color: { r: 30, g: 30, b: 30 } },
            { type: 'plant', x: -3, y: 0, z: 2, w: 0.5, h: 1.5, d: 0.5, color: { r: 50, g: 120, b: 50 } }
        ]
    },
    bedroom: {
        walls: { r: 220, g: 230, b: 240 },
        floor: { r: 180, g: 160, b: 140 },
        furniture: [
            { type: 'bed', x: 0, y: 0, z: -2, w: 2, h: 0.6, d: 2.5, color: { r: 200, g: 200, b: 220 } },
            { type: 'nightstand', x: -2, y: 0, z: -2, w: 0.6, h: 0.6, d: 0.5, color: { r: 100, g: 70, b: 50 } },
            { type: 'wardrobe', x: 3, y: 0, z: 0, w: 0.8, h: 2.2, d: 2, color: { r: 160, g: 130, b: 100 } },
            { type: 'lamp', x: -2, y: 0.6, z: -2, w: 0.3, h: 0.5, d: 0.3, color: { r: 255, g: 230, b: 180 } }
        ]
    },
    kitchen: {
        walls: { r: 250, g: 250, b: 245 },
        floor: { r: 200, g: 200, b: 200 },
        furniture: [
            { type: 'counter', x: -2.5, y: 0, z: 0, w: 0.6, h: 0.9, d: 4, color: { r: 80, g: 80, b: 80 } },
            { type: 'counter', x: 0, y: 0, z: 3, w: 3, h: 0.9, d: 0.6, color: { r: 80, g: 80, b: 80 } },
            { type: 'fridge', x: 2.5, y: 0, z: 3, w: 0.8, h: 2, d: 0.7, color: { r: 220, g: 220, b: 230 } },
            { type: 'table', x: 1, y: 0, z: -1, w: 1.2, h: 0.8, d: 1.2, color: { r: 200, g: 180, b: 150 } },
            { type: 'stool', x: 0, y: 0, z: -1, w: 0.4, h: 0.7, d: 0.4, color: { r: 60, g: 60, b: 60 } },
            { type: 'stool', x: 2, y: 0, z: -1, w: 0.4, h: 0.7, d: 0.4, color: { r: 60, g: 60, b: 60 } }
        ]
    }
};

function project(x, y, z) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);

    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;
    let y1 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    const scale = 80 / (8 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 - y1 * scale,
        scale,
        z: z2
    };
}

function drawFace(points, color, shade) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = `rgb(${Math.floor(color.r * shade)}, ${Math.floor(color.g * shade)}, ${Math.floor(color.b * shade)})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
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
        { verts: [0, 1, 5, 4], shade: 0.7, avgZ: (vertices[0].z + vertices[1].z) / 2 },
        { verts: [2, 3, 7, 6], shade: 0.7, avgZ: (vertices[2].z + vertices[3].z) / 2 },
        { verts: [1, 2, 6, 5], shade: 0.85, avgZ: (vertices[1].z + vertices[2].z) / 2 },
        { verts: [3, 0, 4, 7], shade: 0.85, avgZ: (vertices[3].z + vertices[0].z) / 2 },
        { verts: [4, 5, 6, 7], shade: 1.0, avgZ: (vertices[4].z + vertices[5].z + vertices[6].z + vertices[7].z) / 4 },
        { verts: [0, 3, 2, 1], shade: 0.6, avgZ: (vertices[0].z + vertices[3].z) / 2 }
    ];

    faces.sort((a, b) => b.avgZ - a.avgZ);

    faces.forEach(face => {
        const points = face.verts.map(i => vertices[i]);
        drawFace(points, color, face.shade);
    });

    return (vertices[0].z + vertices[2].z + vertices[4].z + vertices[6].z) / 4;
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const room = rooms[currentRoom];
    const roomSize = 4;

    // Collect all elements for depth sorting
    const elements = [];

    // Floor
    elements.push({
        type: 'floor',
        z: 0,
        draw: () => {
            const floorPoints = [
                project(-roomSize, 0, -roomSize),
                project(roomSize, 0, -roomSize),
                project(roomSize, 0, roomSize),
                project(-roomSize, 0, roomSize)
            ];
            drawFace(floorPoints, room.floor, 0.9);
        }
    });

    // Walls
    const wallHeight = 3;

    // Back wall
    elements.push({
        type: 'wall',
        z: roomSize,
        draw: () => {
            const wallPoints = [
                project(-roomSize, 0, roomSize),
                project(roomSize, 0, roomSize),
                project(roomSize, wallHeight, roomSize),
                project(-roomSize, wallHeight, roomSize)
            ];
            drawFace(wallPoints, room.walls, 0.85);
        }
    });

    // Left wall
    elements.push({
        type: 'wall',
        z: 0,
        draw: () => {
            const wallPoints = [
                project(-roomSize, 0, -roomSize),
                project(-roomSize, 0, roomSize),
                project(-roomSize, wallHeight, roomSize),
                project(-roomSize, wallHeight, -roomSize)
            ];
            drawFace(wallPoints, room.walls, 0.7);
        }
    });

    // Right wall
    elements.push({
        type: 'wall',
        z: 0,
        draw: () => {
            const wallPoints = [
                project(roomSize, 0, roomSize),
                project(roomSize, 0, -roomSize),
                project(roomSize, wallHeight, -roomSize),
                project(roomSize, wallHeight, roomSize)
            ];
            drawFace(wallPoints, room.walls, 0.75);
        }
    });

    // Furniture
    room.furniture.forEach(f => {
        const centerZ = project(f.x, f.y + f.h / 2, f.z).z;
        elements.push({
            type: 'furniture',
            z: centerZ,
            draw: () => drawBox(f.x, f.y, f.z, f.w, f.h, f.d, f.color)
        });
    });

    // Sort by z (back to front for walls, adjust for viewing angle)
    elements.sort((a, b) => {
        if (a.type === 'floor') return -1;
        if (b.type === 'floor') return 1;
        return b.z - a.z;
    });

    elements.forEach(el => el.draw());

    requestAnimationFrame(draw);
}

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    rotationY += dx * 0.01;
    rotationX += dy * 0.01;
    rotationX = Math.max(-0.5, Math.min(0.8, rotationX));
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

function setRoom(roomName, btn) {
    currentRoom = roomName;
    [livingBtn, bedroomBtn, kitchenBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    infoEl.textContent = `正在瀏覽: ${roomName === 'living' ? '客廳' : roomName === 'bedroom' ? '臥室' : '廚房'}`;
}

livingBtn.addEventListener('click', () => setRoom('living', livingBtn));
bedroomBtn.addEventListener('click', () => setRoom('bedroom', bedroomBtn));
kitchenBtn.addEventListener('click', () => setRoom('kitchen', kitchenBtn));

draw();
