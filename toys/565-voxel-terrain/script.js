const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const flatBtn = document.getElementById('flatBtn');
const hillBtn = document.getElementById('hillBtn');
const mountainBtn = document.getElementById('mountainBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const infoEl = document.getElementById('info');

let terrainType = 'hill';
let voxels = [];
let rotationY = 0.5;
let seed = Math.random() * 1000;
const gridSize = 16;
const maxHeight = 12;

function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
}

function smoothNoise(x, y) {
    const corners = (noise(x - 1, y - 1) + noise(x + 1, y - 1) + noise(x - 1, y + 1) + noise(x + 1, y + 1)) / 16;
    const sides = (noise(x - 1, y) + noise(x + 1, y) + noise(x, y - 1) + noise(x, y + 1)) / 8;
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

function generateHeight(x, z) {
    let height = 0;
    const scale = terrainType === 'flat' ? 0.3 : terrainType === 'hill' ? 0.6 : 1.0;
    const baseHeight = terrainType === 'flat' ? 2 : terrainType === 'hill' ? 4 : 6;

    height += interpolatedNoise(x * 0.1, z * 0.1) * maxHeight * scale;
    height += interpolatedNoise(x * 0.2, z * 0.2) * maxHeight * 0.5 * scale;

    return Math.floor(height) + baseHeight;
}

function getBlockColor(y, maxY) {
    const ratio = y / maxY;
    if (y === maxY - 1) {
        if (maxY > 8) return { top: '#9e9e9e', side: '#757575', front: '#616161' }; // Stone
        return { top: '#4caf50', side: '#388e3c', front: '#2e7d32' }; // Grass
    }
    if (ratio > 0.7) return { top: '#795548', side: '#5d4037', front: '#4e342e' }; // Dirt
    if (ratio > 0.3) return { top: '#9e9e9e', side: '#757575', front: '#616161' }; // Stone
    return { top: '#607d8b', side: '#455a64', front: '#37474f' }; // Deep stone
}

function generateTerrain() {
    voxels = [];

    for (let z = 0; z < gridSize; z++) {
        for (let x = 0; x < gridSize; x++) {
            const height = generateHeight(x, z);
            for (let y = 0; y < height; y++) {
                voxels.push({ x, y, z, height });
            }
        }
    }

    infoEl.textContent = `方塊數: ${voxels.length}`;
}

function project(x, y, z) {
    const cosR = Math.cos(rotationY);
    const sinR = Math.sin(rotationY);

    const cx = x - gridSize / 2;
    const cz = z - gridSize / 2;

    const x1 = cx * cosR - cz * sinR;
    const z1 = cx * sinR + cz * cosR;

    const scale = 300 / (300 + z1 * 10);
    return {
        x: canvas.width / 2 + x1 * 15 * scale,
        y: canvas.height / 2 - y * 12 * scale + z1 * 3,
        scale,
        z: z1
    };
}

function draw() {
    rotationY += 0.008;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#64b5f6');
    skyGrad.addColorStop(1, '#bbdefb');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sort voxels by depth
    const sortedVoxels = voxels.map(v => {
        const p = project(v.x, v.y, v.z);
        return { ...v, projected: p, depth: p.z };
    }).sort((a, b) => b.depth - a.depth);

    const blockSize = 14;

    sortedVoxels.forEach(voxel => {
        const { x, y, z, height, projected } = voxel;
        const colors = getBlockColor(y, height);
        const size = blockSize * projected.scale;

        const px = projected.x;
        const py = projected.y;

        // Check visibility - only draw exposed faces
        const isTopExposed = y === height - 1;
        const cosR = Math.cos(rotationY);
        const sinR = Math.sin(rotationY);

        // Top face (isometric)
        if (isTopExposed) {
            ctx.beginPath();
            ctx.moveTo(px, py - size * 0.5);
            ctx.lineTo(px + size * 0.7, py);
            ctx.lineTo(px, py + size * 0.5);
            ctx.lineTo(px - size * 0.7, py);
            ctx.closePath();
            ctx.fillStyle = colors.top;
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // Right face
        if (sinR > 0) {
            ctx.beginPath();
            ctx.moveTo(px, py + size * 0.5);
            ctx.lineTo(px + size * 0.7, py);
            ctx.lineTo(px + size * 0.7, py + size * 0.8);
            ctx.lineTo(px, py + size * 1.3);
            ctx.closePath();
            ctx.fillStyle = colors.side;
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.stroke();
        }

        // Left face
        if (cosR > 0) {
            ctx.beginPath();
            ctx.moveTo(px, py + size * 0.5);
            ctx.lineTo(px - size * 0.7, py);
            ctx.lineTo(px - size * 0.7, py + size * 0.8);
            ctx.lineTo(px, py + size * 1.3);
            ctx.closePath();
            ctx.fillStyle = colors.front;
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.stroke();
        }
    });

    requestAnimationFrame(draw);
}

function setTerrainType(type, btn) {
    terrainType = type;
    [flatBtn, hillBtn, mountainBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    seed = Math.random() * 1000;
    generateTerrain();
}

flatBtn.addEventListener('click', () => setTerrainType('flat', flatBtn));
hillBtn.addEventListener('click', () => setTerrainType('hill', hillBtn));
mountainBtn.addEventListener('click', () => setTerrainType('mountain', mountainBtn));
regenerateBtn.addEventListener('click', () => {
    seed = Math.random() * 1000;
    generateTerrain();
});

generateTerrain();
draw();
