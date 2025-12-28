const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const mapSelect = document.getElementById('mapSelect');
const heightSlider = document.getElementById('heightSlider');
const infoEl = document.getElementById('info');

let mapType = 'mountains';
let heightScale = 5;
let heightmap = [];
let rotationY = 0;
const gridSize = 40;

function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

function smoothNoise(x, y) {
    const corners = (noise(x-1, y-1) + noise(x+1, y-1) + noise(x-1, y+1) + noise(x+1, y+1)) / 16;
    const sides = (noise(x-1, y) + noise(x+1, y) + noise(x, y-1) + noise(x, y+1)) / 8;
    const center = noise(x, y) / 4;
    return corners + sides + center;
}

function interpolatedNoise(x, y) {
    const intX = Math.floor(x);
    const fracX = x - intX;
    const intY = Math.floor(y);
    const fracY = y - intY;

    const v1 = smoothNoise(intX, intY);
    const v2 = smoothNoise(intX + 1, intY);
    const v3 = smoothNoise(intX, intY + 1);
    const v4 = smoothNoise(intX + 1, intY + 1);

    const i1 = v1 * (1 - fracX) + v2 * fracX;
    const i2 = v3 * (1 - fracX) + v4 * fracX;

    return i1 * (1 - fracY) + i2 * fracY;
}

function generateHeightmap() {
    heightmap = [];

    for (let z = 0; z < gridSize; z++) {
        heightmap[z] = [];
        for (let x = 0; x < gridSize; x++) {
            let h = 0;
            const nx = x / gridSize;
            const nz = z / gridSize;

            switch (mapType) {
                case 'mountains':
                    h = interpolatedNoise(x * 0.1, z * 0.1) * 0.5;
                    h += interpolatedNoise(x * 0.05, z * 0.05) * 1;
                    h = Math.pow(h, 1.5);
                    break;
                case 'hills':
                    h = interpolatedNoise(x * 0.08, z * 0.08) * 0.7;
                    h += interpolatedNoise(x * 0.15, z * 0.15) * 0.3;
                    break;
                case 'canyon':
                    h = 1 - Math.abs(Math.sin(nx * Math.PI * 2) * Math.sin(nz * Math.PI * 2));
                    h += interpolatedNoise(x * 0.1, z * 0.1) * 0.3;
                    break;
                case 'volcanic':
                    const dist = Math.sqrt((nx - 0.5) ** 2 + (nz - 0.5) ** 2);
                    h = Math.max(0, 1 - dist * 3);
                    h = Math.pow(h, 0.5);
                    if (dist < 0.1) h *= 0.7; // Crater
                    h += interpolatedNoise(x * 0.15, z * 0.15) * 0.2;
                    break;
            }
            heightmap[z][x] = h;
        }
    }
}

function getTerrainColor(height, nx, nz) {
    if (height < 0.2) return { r: 80, g: 120, b: 80 };   // Grass
    if (height < 0.4) return { r: 100, g: 140, b: 80 };  // Light grass
    if (height < 0.6) return { r: 140, g: 120, b: 90 };  // Dirt
    if (height < 0.8) return { r: 120, g: 110, b: 100 }; // Rock
    return { r: 240, g: 240, b: 250 };                    // Snow
}

function project(x, y, z) {
    const cosR = Math.cos(rotationY);
    const sinR = Math.sin(rotationY);

    const x1 = x * cosR - z * sinR;
    const z1 = x * sinR + z * cosR;

    // Isometric-like projection
    const scale = 200 / (200 + z1);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 + (y - 30) * scale + z1 * 0.3,
        scale,
        z: z1
    };
}

function draw() {
    rotationY += 0.005;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#4a90d9');
    skyGrad.addColorStop(0.6, '#87ceeb');
    skyGrad.addColorStop(1, '#e0f0ff');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellSize = 4;
    const faces = [];

    // Create faces
    for (let z = 0; z < gridSize - 1; z++) {
        for (let x = 0; x < gridSize - 1; x++) {
            const h00 = heightmap[z][x] * heightScale * 15;
            const h10 = heightmap[z][x + 1] * heightScale * 15;
            const h01 = heightmap[z + 1][x] * heightScale * 15;
            const h11 = heightmap[z + 1][x + 1] * heightScale * 15;

            const worldX = (x - gridSize / 2) * cellSize;
            const worldZ = (z - gridSize / 2) * cellSize;

            const p00 = project(worldX, -h00, worldZ);
            const p10 = project(worldX + cellSize, -h10, worldZ);
            const p01 = project(worldX, -h01, worldZ + cellSize);
            const p11 = project(worldX + cellSize, -h11, worldZ + cellSize);

            const avgHeight = (heightmap[z][x] + heightmap[z][x+1] + heightmap[z+1][x] + heightmap[z+1][x+1]) / 4;
            const avgZ = (p00.z + p10.z + p01.z + p11.z) / 4;

            faces.push({
                points: [p00, p10, p11, p01],
                avgZ,
                height: avgHeight,
                nx: x / gridSize,
                nz: z / gridSize
            });
        }
    }

    // Sort by depth
    faces.sort((a, b) => b.avgZ - a.avgZ);

    // Draw faces
    faces.forEach(face => {
        const color = getTerrainColor(face.height, face.nx, face.nz);

        // Simple shading based on height difference
        const shade = 0.7 + face.height * 0.3;

        ctx.beginPath();
        ctx.moveTo(face.points[0].x, face.points[0].y);
        face.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        ctx.fillStyle = `rgb(${Math.floor(color.r * shade)}, ${Math.floor(color.g * shade)}, ${Math.floor(color.b * shade)})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(0, 0, 0, 0.1)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });

    requestAnimationFrame(draw);
}

mapSelect.addEventListener('change', (e) => {
    mapType = e.target.value;
    generateHeightmap();
    const names = { mountains: '山脈', hills: '丘陵', canyon: '峽谷', volcanic: '火山' };
    infoEl.textContent = `地形: ${names[mapType]}`;
});

heightSlider.addEventListener('input', (e) => {
    heightScale = parseInt(e.target.value);
    infoEl.textContent = `高度倍率: ${heightScale}x`;
});

generateHeightmap();
draw();
