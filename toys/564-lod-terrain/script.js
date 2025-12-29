const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const distanceSlider = document.getElementById('distanceSlider');
const lodLabel = document.getElementById('lodLabel');
const infoEl = document.getElementById('info');

let viewDistance = 5;
let rotationY = 0;
let cameraZ = 0;

function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
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

function getHeight(x, z) {
    return fbm(x * 0.02, z * 0.02, 4) * 60;
}

function getLODLevel(distFromCamera) {
    if (distFromCamera < 50) return 1;
    if (distFromCamera < 100) return 2;
    if (distFromCamera < 150) return 4;
    return 8;
}

function getTerrainColor(height, lod) {
    const h = height / 60;
    let color;
    if (h < 0.3) color = { r: 80, g: 120, b: 80 };
    else if (h < 0.5) color = { r: 100, g: 140, b: 80 };
    else if (h < 0.7) color = { r: 130, g: 110, b: 90 };
    else color = { r: 200, g: 200, b: 210 };

    // Tint based on LOD for visualization
    if (lod === 2) { color.r += 20; color.g -= 10; }
    if (lod === 4) { color.r -= 10; color.b += 20; }
    if (lod === 8) { color.g += 20; color.b -= 10; }

    return color;
}

function project(x, y, z) {
    const cosR = Math.cos(rotationY);
    const sinR = Math.sin(rotationY);

    const x1 = x * cosR - z * sinR;
    const z1 = x * sinR + z * cosR;

    const scale = 250 / (250 + z1);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 + y * scale + z1 * 0.2,
        scale,
        z: z1
    };
}

function draw() {
    rotationY += 0.005;
    cameraZ += 0.5;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#4a90d9');
    skyGrad.addColorStop(1, '#c8e6f5');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const terrainSize = 200;
    const faces = [];
    let totalLOD = 0;
    let lodCounts = { 1: 0, 2: 0, 4: 0, 8: 0 };

    // Generate terrain with LOD
    const startZ = Math.floor(cameraZ / 8) * 8 - terrainSize / 2;
    const endZ = startZ + terrainSize;

    for (let z = startZ; z < endZ; z += 8) {
        for (let x = -terrainSize / 2; x < terrainSize / 2; x += 8) {
            const distFromCamera = Math.sqrt(x * x + (z - cameraZ) * (z - cameraZ));
            const lod = getLODLevel(distFromCamera * viewDistance * 0.3);

            lodCounts[lod]++;

            // Skip if LOD step doesn't align
            if (x % lod !== 0 || (z - startZ) % lod !== 0) continue;

            const h00 = getHeight(x, z);
            const h10 = getHeight(x + lod * 8, z);
            const h01 = getHeight(x, z + lod * 8);
            const h11 = getHeight(x + lod * 8, z + lod * 8);

            const worldZ = z - cameraZ;
            const cellSize = lod * 8;

            const p00 = project(x, -h00 + 30, worldZ);
            const p10 = project(x + cellSize, -h10 + 30, worldZ);
            const p01 = project(x, -h01 + 30, worldZ + cellSize);
            const p11 = project(x + cellSize, -h11 + 30, worldZ + cellSize);

            if (p00.z > -200 && p00.z < 300) {
                faces.push({
                    points: [p00, p10, p11, p01],
                    avgZ: (p00.z + p10.z + p01.z + p11.z) / 4,
                    height: (h00 + h10 + h01 + h11) / 4,
                    lod
                });
                totalLOD++;
            }
        }
    }

    faces.sort((a, b) => b.avgZ - a.avgZ);

    faces.forEach(face => {
        const color = getTerrainColor(face.height, face.lod);
        const shade = 0.6 + (face.height / 60) * 0.4;

        ctx.beginPath();
        ctx.moveTo(face.points[0].x, face.points[0].y);
        face.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        ctx.fillStyle = `rgb(${Math.floor(color.r * shade)}, ${Math.floor(color.g * shade)}, ${Math.floor(color.b * shade)})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });

    // LOD indicator
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText(`Faces: ${totalLOD}`, 10, 15);

    lodLabel.textContent = Object.entries(lodCounts).filter(([k, v]) => v > 0).length;

    requestAnimationFrame(draw);
}

distanceSlider.addEventListener('input', (e) => {
    viewDistance = parseInt(e.target.value);
    infoEl.textContent = `視距: ${viewDistance}`;
});

draw();
