const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const regenerateBtn = document.getElementById('regenerateBtn');
const singleBtn = document.getElementById('singleBtn');
const archipelagoBtn = document.getElementById('archipelagoBtn');
const infoEl = document.getElementById('info');

let heightmap = [];
let rotationY = 0.5;
let seed = Math.random() * 1000;
let islandMode = 'single';
const gridSize = 50;

function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
}

function fbm(x, y, octaves) {
    let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
    for (let i = 0; i < octaves; i++) {
        value += amplitude * noise(x * frequency, y * frequency);
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }
    return value / maxValue;
}

function generateIsland() {
    heightmap = [];
    let landArea = 0;

    const centerX = gridSize / 2;
    const centerZ = gridSize / 2;

    // Generate island centers for archipelago mode
    const islandCenters = [];
    if (islandMode === 'archipelago') {
        const numIslands = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numIslands; i++) {
            islandCenters.push({
                x: 8 + Math.random() * (gridSize - 16),
                z: 8 + Math.random() * (gridSize - 16),
                size: 0.3 + Math.random() * 0.5
            });
        }
    } else {
        islandCenters.push({ x: centerX, z: centerZ, size: 1.0 });
    }

    for (let z = 0; z < gridSize; z++) {
        heightmap[z] = [];
        for (let x = 0; x < gridSize; x++) {
            // Base noise
            let baseHeight = fbm(x * 0.08, z * 0.08, 4);

            // Add detail noise
            baseHeight += fbm(x * 0.2, z * 0.2, 2) * 0.3;

            // Apply island mask - combine all island influences
            let islandInfluence = 0;
            for (const island of islandCenters) {
                const dx = (x - island.x) / (gridSize * 0.4 * island.size);
                const dz = (z - island.z) / (gridSize * 0.4 * island.size);
                const dist = Math.sqrt(dx * dx + dz * dz);

                // Smooth falloff
                const falloff = Math.max(0, 1 - dist);
                islandInfluence = Math.max(islandInfluence, falloff * falloff * island.size);
            }

            // Combine height and island mask
            let height = baseHeight * islandInfluence;

            // Add some beach and underwater terrain
            if (height < 0.1) {
                height = height * 0.5 - 0.05; // Underwater
            }

            heightmap[z][x] = height;

            if (height > 0.1) landArea++;
        }
    }

    infoEl.textContent = `陸地面積: ${Math.round(landArea / (gridSize * gridSize) * 100)}%`;
}

function getTerrainColor(height) {
    if (height < 0) return { r: 30, g: 80, b: 160 };        // Deep water
    if (height < 0.05) return { r: 40, g: 100, b: 180 };    // Shallow water
    if (height < 0.12) return { r: 220, g: 200, b: 150 };   // Beach
    if (height < 0.3) return { r: 80, g: 140, b: 60 };      // Lowland
    if (height < 0.5) return { r: 60, g: 120, b: 50 };      // Forest
    if (height < 0.7) return { r: 100, g: 90, b: 80 };      // Mountain
    return { r: 220, g: 225, b: 235 };                       // Peak/snow
}

function project(x, y, z) {
    const cosR = Math.cos(rotationY);
    const sinR = Math.sin(rotationY);

    const cx = x - gridSize / 2;
    const cz = z - gridSize / 2;

    const x1 = cx * cosR - cz * sinR;
    const z1 = cx * sinR + cz * cosR;

    const scale = 250 / (250 + z1 * 5);
    return {
        x: canvas.width / 2 + x1 * 4 * scale,
        y: canvas.height / 2 - y * 80 * scale + z1 * 2,
        scale,
        z: z1
    };
}

function draw() {
    rotationY += 0.004;

    // Ocean gradient background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#4a90d9');
    skyGrad.addColorStop(0.5, '#87ceeb');
    skyGrad.addColorStop(1, '#1e88e5');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const faces = [];
    const step = 2;

    for (let z = 0; z < gridSize - step; z += step) {
        for (let x = 0; x < gridSize - step; x += step) {
            const h00 = heightmap[z][x];
            const h10 = heightmap[z][x + step];
            const h01 = heightmap[z + step][x];
            const h11 = heightmap[z + step][x + step];

            const p00 = project(x, Math.max(0, h00), z);
            const p10 = project(x + step, Math.max(0, h10), z);
            const p01 = project(x, Math.max(0, h01), z + step);
            const p11 = project(x + step, Math.max(0, h11), z + step);

            const avgHeight = (h00 + h10 + h01 + h11) / 4;
            const avgZ = (p00.z + p10.z + p01.z + p11.z) / 4;

            faces.push({
                points: [p00, p10, p11, p01],
                avgZ,
                height: avgHeight
            });
        }
    }

    faces.sort((a, b) => b.avgZ - a.avgZ);

    faces.forEach(face => {
        const color = getTerrainColor(face.height);
        const shade = face.height < 0 ? 1.0 : 0.7 + Math.max(0, face.height) * 0.5;

        ctx.beginPath();
        ctx.moveTo(face.points[0].x, face.points[0].y);
        face.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        ctx.fillStyle = `rgb(${Math.floor(color.r * shade)}, ${Math.floor(color.g * shade)}, ${Math.floor(color.b * shade)})`;
        ctx.fill();

        if (face.height > 0.05) {
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    });

    // Draw waves on water
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    const time = Date.now() / 1000;
    for (let i = 0; i < 5; i++) {
        const waveY = canvas.height * 0.7 + Math.sin(time + i) * 5 + i * 8;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 10) {
            const y = waveY + Math.sin(x * 0.05 + time * 2 + i) * 3;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    requestAnimationFrame(draw);
}

function setMode(mode, btn) {
    islandMode = mode;
    [singleBtn, archipelagoBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    seed = Math.random() * 1000;
    generateIsland();
}

regenerateBtn.addEventListener('click', () => {
    seed = Math.random() * 1000;
    generateIsland();
});

singleBtn.addEventListener('click', () => setMode('single', singleBtn));
archipelagoBtn.addEventListener('click', () => setMode('archipelago', archipelagoBtn));

generateIsland();
draw();
