const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const raiseBtn = document.getElementById('raiseBtn');
const lowerBtn = document.getElementById('lowerBtn');
const smoothBtn = document.getElementById('smoothBtn');
const resetBtn = document.getElementById('resetBtn');
const infoEl = document.getElementById('info');

let mode = 'raise';
let heightmap = [];
let isDrawing = false;
let rotationY = 0;
const gridSize = 40;
const brushRadius = 3;

function initHeightmap() {
    heightmap = [];
    for (let z = 0; z < gridSize; z++) {
        heightmap[z] = [];
        for (let x = 0; x < gridSize; x++) {
            heightmap[z][x] = 0.2;
        }
    }
}

function modifyTerrain(cx, cz, strength) {
    for (let z = Math.max(0, cz - brushRadius); z < Math.min(gridSize, cz + brushRadius); z++) {
        for (let x = Math.max(0, cx - brushRadius); x < Math.min(gridSize, cx + brushRadius); x++) {
            const dist = Math.sqrt((x - cx) ** 2 + (z - cz) ** 2);
            if (dist < brushRadius) {
                const falloff = 1 - dist / brushRadius;
                const amount = strength * falloff * 0.05;

                if (mode === 'raise') {
                    heightmap[z][x] = Math.min(1, heightmap[z][x] + amount);
                } else if (mode === 'lower') {
                    heightmap[z][x] = Math.max(0, heightmap[z][x] - amount);
                } else if (mode === 'smooth') {
                    let avg = 0, count = 0;
                    for (let dz = -1; dz <= 1; dz++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nz = z + dz, nx = x + dx;
                            if (nz >= 0 && nz < gridSize && nx >= 0 && nx < gridSize) {
                                avg += heightmap[nz][nx];
                                count++;
                            }
                        }
                    }
                    heightmap[z][x] += (avg / count - heightmap[z][x]) * falloff * 0.3;
                }
            }
        }
    }
}

function screenToGrid(sx, sy) {
    // Approximate inverse projection
    const cosR = Math.cos(rotationY);
    const sinR = Math.sin(rotationY);

    // Simple approximation - find grid cell closest to screen position
    let bestDist = Infinity;
    let bestX = 0, bestZ = 0;

    for (let z = 0; z < gridSize; z++) {
        for (let x = 0; x < gridSize; x++) {
            const worldX = (x - gridSize / 2) * 4;
            const worldZ = (z - gridSize / 2) * 4;
            const h = heightmap[z][x] * 50;

            const x1 = worldX * cosR - worldZ * sinR;
            const z1 = worldX * sinR + worldZ * cosR;

            const scale = 200 / (200 + z1);
            const screenX = canvas.width / 2 + x1 * scale;
            const screenY = canvas.height / 2 + (-h + 20) * scale + z1 * 0.3;

            const dist = (screenX - sx) ** 2 + (screenY - sy) ** 2;
            if (dist < bestDist) {
                bestDist = dist;
                bestX = x;
                bestZ = z;
            }
        }
    }

    return { x: bestX, z: bestZ };
}

function getTerrainColor(height) {
    if (height < 0.25) return { r: 60, g: 100, b: 140 };  // Water
    if (height < 0.35) return { r: 194, g: 178, b: 128 }; // Sand
    if (height < 0.6) return { r: 80, g: 130, b: 60 };    // Grass
    if (height < 0.8) return { r: 110, g: 100, b: 80 };   // Rock
    return { r: 230, g: 235, b: 245 };                     // Snow
}

function project(x, y, z) {
    const cosR = Math.cos(rotationY);
    const sinR = Math.sin(rotationY);

    const x1 = x * cosR - z * sinR;
    const z1 = x * sinR + z * cosR;

    const scale = 200 / (200 + z1);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 + y * scale + z1 * 0.3,
        scale,
        z: z1
    };
}

function draw() {
    rotationY += 0.003;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#4a90d9');
    skyGrad.addColorStop(1, '#a8d8ea');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellSize = 4;
    const faces = [];

    for (let z = 0; z < gridSize - 1; z++) {
        for (let x = 0; x < gridSize - 1; x++) {
            const h00 = heightmap[z][x] * 50;
            const h10 = heightmap[z][x + 1] * 50;
            const h01 = heightmap[z + 1][x] * 50;
            const h11 = heightmap[z + 1][x + 1] * 50;

            const worldX = (x - gridSize / 2) * cellSize;
            const worldZ = (z - gridSize / 2) * cellSize;

            const p00 = project(worldX, -h00 + 20, worldZ);
            const p10 = project(worldX + cellSize, -h10 + 20, worldZ);
            const p01 = project(worldX, -h01 + 20, worldZ + cellSize);
            const p11 = project(worldX + cellSize, -h11 + 20, worldZ + cellSize);

            const avgHeight = (heightmap[z][x] + heightmap[z][x+1] + heightmap[z+1][x] + heightmap[z+1][x+1]) / 4;
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
        const shade = 0.6 + face.height * 0.4;

        ctx.beginPath();
        ctx.moveTo(face.points[0].x, face.points[0].y);
        face.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        ctx.fillStyle = `rgb(${Math.floor(color.r * shade)}, ${Math.floor(color.g * shade)}, ${Math.floor(color.b * shade)})`;
        ctx.fill();
    });

    requestAnimationFrame(draw);
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const grid = screenToGrid(e.clientX - rect.left, e.clientY - rect.top);
    modifyTerrain(grid.x, grid.z, 1);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const grid = screenToGrid(e.clientX - rect.left, e.clientY - rect.top);
    modifyTerrain(grid.x, grid.z, 1);
});

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

function setMode(newMode, btn) {
    mode = newMode;
    [raiseBtn, lowerBtn, smoothBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    infoEl.textContent = `模式: ${newMode === 'raise' ? '升高' : newMode === 'lower' ? '降低' : '平滑'}`;
}

raiseBtn.addEventListener('click', () => setMode('raise', raiseBtn));
lowerBtn.addEventListener('click', () => setMode('lower', lowerBtn));
smoothBtn.addEventListener('click', () => setMode('smooth', smoothBtn));
resetBtn.addEventListener('click', () => {
    initHeightmap();
    infoEl.textContent = '地形已重置';
});

initHeightmap();
draw();
