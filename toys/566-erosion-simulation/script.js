const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const infoEl = document.getElementById('info');

let heightmap = [];
let watermap = [];
let sedimentmap = [];
let isEroding = true;
let rotationY = 0.5;
let erosionCycles = 0;
const gridSize = 50;

function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

function fbm(x, y) {
    let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
    for (let i = 0; i < 4; i++) {
        value += amplitude * noise(x * frequency, y * frequency);
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }
    return value / maxValue;
}

function initTerrain() {
    heightmap = [];
    watermap = [];
    sedimentmap = [];
    erosionCycles = 0;

    for (let z = 0; z < gridSize; z++) {
        heightmap[z] = [];
        watermap[z] = [];
        sedimentmap[z] = [];
        for (let x = 0; x < gridSize; x++) {
            heightmap[z][x] = fbm(x * 0.08, z * 0.08) * 50 + 10;
            watermap[z][x] = 0;
            sedimentmap[z][x] = 0;
        }
    }
}

function simulateErosion() {
    if (!isEroding) return;

    // Add rain at random points
    for (let i = 0; i < 5; i++) {
        const x = Math.floor(Math.random() * gridSize);
        const z = Math.floor(Math.random() * gridSize);
        watermap[z][x] += 0.5;
    }

    const newWater = [];
    const newSediment = [];

    for (let z = 0; z < gridSize; z++) {
        newWater[z] = [];
        newSediment[z] = [];
        for (let x = 0; x < gridSize; x++) {
            newWater[z][x] = watermap[z][x] * 0.9; // Evaporation
            newSediment[z][x] = sedimentmap[z][x];
        }
    }

    // Water flow and erosion
    for (let z = 1; z < gridSize - 1; z++) {
        for (let x = 1; x < gridSize - 1; x++) {
            if (watermap[z][x] < 0.01) continue;

            const currentHeight = heightmap[z][x] + watermap[z][x];
            let lowestNeighbor = { x, z, height: currentHeight };

            // Find lowest neighbor
            const neighbors = [
                { dx: -1, dz: 0 }, { dx: 1, dz: 0 },
                { dx: 0, dz: -1 }, { dx: 0, dz: 1 }
            ];

            for (const n of neighbors) {
                const nx = x + n.dx;
                const nz = z + n.dz;
                const nh = heightmap[nz][nx] + watermap[nz][nx];
                if (nh < lowestNeighbor.height) {
                    lowestNeighbor = { x: nx, z: nz, height: nh };
                }
            }

            if (lowestNeighbor.height < currentHeight) {
                const diff = currentHeight - lowestNeighbor.height;
                const flow = Math.min(watermap[z][x], diff * 0.3);

                // Move water
                newWater[z][x] -= flow;
                newWater[lowestNeighbor.z][lowestNeighbor.x] += flow;

                // Erode terrain
                const erosion = flow * 0.02;
                heightmap[z][x] = Math.max(0, heightmap[z][x] - erosion);
                newSediment[lowestNeighbor.z][lowestNeighbor.x] += erosion;

                // Deposit sediment
                if (diff < 0.5) {
                    const deposit = newSediment[z][x] * 0.1;
                    heightmap[z][x] += deposit;
                    newSediment[z][x] -= deposit;
                }
            }
        }
    }

    watermap = newWater;
    sedimentmap = newSediment;
    erosionCycles++;
    infoEl.textContent = `侵蝕週期: ${erosionCycles}`;
}

function getTerrainColor(height, water) {
    if (water > 0.3) return { r: 60, g: 130, b: 200 }; // Water
    const h = height / 60;
    if (h < 0.3) return { r: 60, g: 120, b: 60 };    // Lowland
    if (h < 0.5) return { r: 100, g: 140, b: 80 };   // Grass
    if (h < 0.7) return { r: 130, g: 110, b: 90 };   // Rock
    return { r: 200, g: 200, b: 210 };                // Snow
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
        y: canvas.height / 2 - y * scale * 0.8 + z1 * 2,
        scale,
        z: z1
    };
}

function draw() {
    rotationY += 0.004;

    simulateErosion();

    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#4a90d9');
    skyGrad.addColorStop(1, '#c8e6f5');
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

            const w00 = watermap[z][x];
            const w10 = watermap[z][x + step];
            const w01 = watermap[z + step][x];
            const w11 = watermap[z + step][x + step];

            const p00 = project(x, h00, z);
            const p10 = project(x + step, h10, z);
            const p01 = project(x, h01, z + step);
            const p11 = project(x + step, h11, z + step);

            const avgHeight = (h00 + h10 + h01 + h11) / 4;
            const avgWater = (w00 + w10 + w01 + w11) / 4;
            const avgZ = (p00.z + p10.z + p01.z + p11.z) / 4;

            faces.push({
                points: [p00, p10, p11, p01],
                avgZ,
                height: avgHeight,
                water: avgWater
            });
        }
    }

    faces.sort((a, b) => b.avgZ - a.avgZ);

    faces.forEach(face => {
        const color = getTerrainColor(face.height, face.water);
        const shade = 0.6 + (face.height / 60) * 0.4;

        ctx.beginPath();
        ctx.moveTo(face.points[0].x, face.points[0].y);
        face.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        ctx.fillStyle = `rgb(${Math.floor(color.r * shade)}, ${Math.floor(color.g * shade)}, ${Math.floor(color.b * shade)})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });

    requestAnimationFrame(draw);
}

startBtn.addEventListener('click', () => {
    isEroding = true;
    startBtn.classList.add('active');
    stopBtn.classList.remove('active');
});

stopBtn.addEventListener('click', () => {
    isEroding = false;
    stopBtn.classList.add('active');
    startBtn.classList.remove('active');
});

resetBtn.addEventListener('click', () => {
    initTerrain();
    infoEl.textContent = '地形已重置';
});

initTerrain();
draw();
