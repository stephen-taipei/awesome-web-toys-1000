const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const regenerateBtn = document.getElementById('regenerateBtn');
const tempSlider = document.getElementById('tempSlider');
const moistSlider = document.getElementById('moistSlider');
const infoEl = document.getElementById('info');

let heightmap = [];
let tempmap = [];
let moisturemap = [];
let rotationY = 0.5;
let seed = Math.random() * 1000;
let globalTemp = 0.5;
let globalMoist = 0.5;
const gridSize = 40;

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

function getBiome(height, temp, moisture) {
    // Ocean
    if (height < 0.3) return { name: '海洋', color: { r: 30, g: 100, b: 180 } };

    // Beach
    if (height < 0.35) return { name: '沙灘', color: { r: 210, g: 190, b: 140 } };

    // Based on temperature and moisture
    if (temp < 0.3) {
        // Cold
        if (height > 0.7) return { name: '雪山', color: { r: 240, g: 245, b: 250 } };
        if (moisture > 0.5) return { name: '針葉林', color: { r: 40, g: 80, b: 60 } };
        return { name: '凍原', color: { r: 180, g: 200, b: 200 } };
    } else if (temp < 0.6) {
        // Temperate
        if (height > 0.7) return { name: '高山', color: { r: 140, g: 130, b: 120 } };
        if (moisture > 0.6) return { name: '溫帶森林', color: { r: 50, g: 120, b: 50 } };
        if (moisture > 0.3) return { name: '草原', color: { r: 120, g: 160, b: 80 } };
        return { name: '灌木', color: { r: 150, g: 140, b: 90 } };
    } else {
        // Hot
        if (height > 0.7) return { name: '火山', color: { r: 80, g: 60, b: 60 } };
        if (moisture > 0.6) return { name: '雨林', color: { r: 30, g: 90, b: 40 } };
        if (moisture > 0.3) return { name: '稀樹草原', color: { r: 170, g: 160, b: 80 } };
        return { name: '沙漠', color: { r: 220, g: 190, b: 120 } };
    }
}

function generateTerrain() {
    heightmap = [];
    tempmap = [];
    moisturemap = [];

    for (let z = 0; z < gridSize; z++) {
        heightmap[z] = [];
        tempmap[z] = [];
        moisturemap[z] = [];
        for (let x = 0; x < gridSize; x++) {
            heightmap[z][x] = fbm(x * 0.06, z * 0.06, 4);

            // Temperature decreases with latitude and altitude
            const latTemp = 1 - Math.abs(z - gridSize / 2) / (gridSize / 2);
            tempmap[z][x] = (latTemp * 0.7 + fbm(x * 0.04 + 100, z * 0.04, 2) * 0.3) * globalTemp * 2;

            // Moisture varies with noise
            moisturemap[z][x] = fbm(x * 0.05 + 200, z * 0.05, 3) * globalMoist * 2;
        }
    }
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
        x: canvas.width / 2 + x1 * 5 * scale,
        y: canvas.height / 2 - y * 40 * scale + z1 * 2,
        scale,
        z: z1
    };
}

function draw() {
    rotationY += 0.004;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#4a90d9');
    skyGrad.addColorStop(1, '#c8e6f5');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const faces = [];

    for (let z = 0; z < gridSize - 1; z++) {
        for (let x = 0; x < gridSize - 1; x++) {
            const h00 = heightmap[z][x];
            const h10 = heightmap[z][x + 1];
            const h01 = heightmap[z + 1][x];
            const h11 = heightmap[z + 1][x + 1];

            const p00 = project(x, h00, z);
            const p10 = project(x + 1, h10, z);
            const p01 = project(x, h01, z + 1);
            const p11 = project(x + 1, h11, z + 1);

            const avgHeight = (h00 + h10 + h01 + h11) / 4;
            const avgTemp = (tempmap[z][x] + tempmap[z][x + 1] + tempmap[z + 1][x] + tempmap[z + 1][x + 1]) / 4;
            const avgMoist = (moisturemap[z][x] + moisturemap[z][x + 1] + moisturemap[z + 1][x] + moisturemap[z + 1][x + 1]) / 4;
            const avgZ = (p00.z + p10.z + p01.z + p11.z) / 4;

            const biome = getBiome(avgHeight, avgTemp, avgMoist);

            faces.push({
                points: [p00, p10, p11, p01],
                avgZ,
                height: avgHeight,
                biome
            });
        }
    }

    faces.sort((a, b) => b.avgZ - a.avgZ);

    faces.forEach(face => {
        const color = face.biome.color;
        const shade = 0.6 + face.height * 0.4;

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

    // Draw legend
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(5, 5, 80, 60);
    ctx.font = '9px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('溫度: ' + Math.round(globalTemp * 100) + '%', 10, 18);
    ctx.fillText('濕度: ' + Math.round(globalMoist * 100) + '%', 10, 32);

    requestAnimationFrame(draw);
}

regenerateBtn.addEventListener('click', () => {
    seed = Math.random() * 1000;
    generateTerrain();
    infoEl.textContent = '地形已重新生成';
});

tempSlider.addEventListener('input', (e) => {
    globalTemp = parseInt(e.target.value) / 100;
    generateTerrain();
});

moistSlider.addEventListener('input', (e) => {
    globalMoist = parseInt(e.target.value) / 100;
    generateTerrain();
});

generateTerrain();
draw();
