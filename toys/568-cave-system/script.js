const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const regenerateBtn = document.getElementById('regenerateBtn');
const densitySlider = document.getElementById('densitySlider');
const layerLabel = document.getElementById('layerLabel');
const infoEl = document.getElementById('info');

let caveData = [];
let rotationY = 0;
let rotationX = 0.3;
let seed = Math.random() * 1000;
let density = 50;
const gridSize = 20;
const layers = 10;

function noise3D(x, y, z) {
    const n1 = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164 + seed) * 43758.5453;
    const n2 = Math.sin(x * 45.164 + y * 12.9898 + z * 78.233 + seed * 2) * 43758.5453;
    return ((n1 - Math.floor(n1)) + (n2 - Math.floor(n2))) / 2;
}

function smoothNoise3D(x, y, z) {
    let sum = 0, count = 0;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dz = -1; dz <= 1; dz++) {
                sum += noise3D(x + dx, y + dy, z + dz);
                count++;
            }
        }
    }
    return sum / count;
}

function generateCave() {
    caveData = [];
    let tunnelCount = 0;

    const threshold = density / 100;

    for (let y = 0; y < layers; y++) {
        caveData[y] = [];
        for (let z = 0; z < gridSize; z++) {
            caveData[y][z] = [];
            for (let x = 0; x < gridSize; x++) {
                // Use noise to determine if this is cave or rock
                const noiseVal = smoothNoise3D(x * 0.2, y * 0.3, z * 0.2);

                // Edge cells are always rock
                const isEdge = x === 0 || x === gridSize - 1 || z === 0 || z === gridSize - 1 || y === 0 || y === layers - 1;

                if (isEdge) {
                    caveData[y][z][x] = 1; // Rock
                } else {
                    caveData[y][z][x] = noiseVal > threshold ? 0 : 1; // 0 = cave, 1 = rock
                    if (caveData[y][z][x] === 0) tunnelCount++;
                }
            }
        }
    }

    layerLabel.textContent = layers;
    infoEl.textContent = `洞穴空間: ${tunnelCount} 格`;
}

function project(x, y, z) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);

    // Center the cave
    const cx = x - gridSize / 2;
    const cy = y - layers / 2;
    const cz = z - gridSize / 2;

    // Rotate around Y axis
    let x1 = cx * cosY - cz * sinY;
    let z1 = cx * sinY + cz * cosY;

    // Rotate around X axis
    let y1 = cy * cosX - z1 * sinX;
    let z2 = cy * sinX + z1 * cosX;

    const scale = 400 / (400 + z2 * 10);
    return {
        x: canvas.width / 2 + x1 * 12 * scale,
        y: canvas.height / 2 + y1 * 12 * scale,
        scale,
        z: z2
    };
}

function getCaveColor(y, isSurface, faceType) {
    const depth = y / layers;

    // Different colors for different depths
    const baseColors = [
        { r: 139, g: 119, b: 101 }, // Brown surface
        { r: 128, g: 128, b: 128 }, // Gray
        { r: 100, g: 90, b: 110 },  // Purple tint
        { r: 80, g: 70, b: 90 }     // Deep purple
    ];

    const colorIndex = Math.min(3, Math.floor(depth * 4));
    const color = baseColors[colorIndex];

    // Face shading
    let shade = 1.0;
    if (faceType === 'top') shade = 1.1;
    else if (faceType === 'front') shade = 0.9;
    else if (faceType === 'side') shade = 0.7;

    return {
        r: Math.min(255, Math.floor(color.r * shade)),
        g: Math.min(255, Math.floor(color.g * shade)),
        b: Math.min(255, Math.floor(color.b * shade))
    };
}

function draw() {
    rotationY += 0.008;

    // Dark background
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const faces = [];

    // Collect visible faces
    for (let y = 0; y < layers; y++) {
        for (let z = 0; z < gridSize; z++) {
            for (let x = 0; x < gridSize; x++) {
                if (caveData[y][z][x] !== 1) continue; // Skip empty space

                // Check each face for visibility
                const neighbors = [
                    { dx: 0, dy: 1, dz: 0, type: 'top' },
                    { dx: 0, dy: -1, dz: 0, type: 'bottom' },
                    { dx: 1, dy: 0, dz: 0, type: 'side' },
                    { dx: -1, dy: 0, dz: 0, type: 'side' },
                    { dx: 0, dy: 0, dz: 1, type: 'front' },
                    { dx: 0, dy: 0, dz: -1, type: 'front' }
                ];

                for (const n of neighbors) {
                    const nx = x + n.dx;
                    const ny = y + n.dy;
                    const nz = z + n.dz;

                    // Check if neighbor is empty (cave space or outside)
                    const isExposed = nx < 0 || nx >= gridSize ||
                        ny < 0 || ny >= layers ||
                        nz < 0 || nz >= gridSize ||
                        caveData[ny]?.[nz]?.[nx] === 0;

                    if (isExposed) {
                        // Calculate face vertices
                        const size = 0.5;
                        let vertices;

                        if (n.dy !== 0) {
                            // Top/bottom face
                            const fy = y + (n.dy > 0 ? 1 : 0);
                            vertices = [
                                project(x - size, fy, z - size),
                                project(x + size, fy, z - size),
                                project(x + size, fy, z + size),
                                project(x - size, fy, z + size)
                            ];
                        } else if (n.dx !== 0) {
                            // Side faces
                            const fx = x + (n.dx > 0 ? 1 : 0);
                            vertices = [
                                project(fx, y, z - size),
                                project(fx, y, z + size),
                                project(fx, y + 1, z + size),
                                project(fx, y + 1, z - size)
                            ];
                        } else {
                            // Front/back faces
                            const fz = z + (n.dz > 0 ? 1 : 0);
                            vertices = [
                                project(x - size, y, fz),
                                project(x + size, y, fz),
                                project(x + size, y + 1, fz),
                                project(x - size, y + 1, fz)
                            ];
                        }

                        const avgZ = vertices.reduce((s, v) => s + v.z, 0) / 4;
                        faces.push({
                            vertices,
                            avgZ,
                            y,
                            type: n.type
                        });
                    }
                }
            }
        }
    }

    // Sort by depth
    faces.sort((a, b) => b.avgZ - a.avgZ);

    // Draw faces
    faces.forEach(face => {
        const color = getCaveColor(face.y, true, face.type);

        ctx.beginPath();
        ctx.moveTo(face.vertices[0].x, face.vertices[0].y);
        face.vertices.forEach(v => ctx.lineTo(v.x, v.y));
        ctx.closePath();

        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });

    // Ambient glow from caves
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 100
    );
    gradient.addColorStop(0, 'rgba(171, 71, 188, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(draw);
}

regenerateBtn.addEventListener('click', () => {
    seed = Math.random() * 1000;
    generateCave();
});

densitySlider.addEventListener('input', (e) => {
    density = parseInt(e.target.value);
    generateCave();
});

generateCave();
draw();
