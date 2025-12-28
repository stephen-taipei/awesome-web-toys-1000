const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const regenerateBtn = document.getElementById('regenerateBtn');
const octavesSlider = document.getElementById('octavesSlider');
const persistenceSlider = document.getElementById('persistenceSlider');
const infoEl = document.getElementById('info');

let octaves = 4;
let persistence = 0.5;
let seed = Math.random() * 1000;
let offsetX = 0;
let rotationY = 0;
const gridSize = 50;

// Permutation table for Perlin noise
let perm = [];
function initPerm() {
    perm = [];
    for (let i = 0; i < 256; i++) perm[i] = i;
    for (let i = 255; i > 0; i--) {
        const j = Math.floor((seed + Math.sin(i) * 10000) % (i + 1));
        [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    for (let i = 0; i < 256; i++) perm[256 + i] = perm[i];
}

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a, b, t) { return a + t * (b - a); }

function grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
}

function perlin(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = fade(x);
    const v = fade(y);

    const A = perm[X] + Y;
    const B = perm[X + 1] + Y;

    return lerp(
        lerp(grad(perm[A], x, y), grad(perm[B], x - 1, y), u),
        lerp(grad(perm[A + 1], x, y - 1), grad(perm[B + 1], x - 1, y - 1), u),
        v
    );
}

function fbm(x, y) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
        value += amplitude * perlin(x * frequency, y * frequency);
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2;
    }

    return (value / maxValue + 1) / 2;
}

function getTerrainColor(height) {
    if (height < 0.35) return { r: 50, g: 100, b: 150 };  // Water
    if (height < 0.4) return { r: 194, g: 178, b: 128 };  // Sand
    if (height < 0.6) return { r: 80, g: 120, b: 60 };    // Grass
    if (height < 0.75) return { r: 100, g: 90, b: 70 };   // Rock
    return { r: 240, g: 245, b: 255 };                     // Snow
}

function project(x, y, z) {
    const cosR = Math.cos(rotationY);
    const sinR = Math.sin(rotationY);

    const x1 = x * cosR - z * sinR;
    const z1 = x * sinR + z * cosR;

    const scale = 200 / (200 + z1);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 + y * scale + z1 * 0.25,
        scale,
        z: z1
    };
}

function draw() {
    rotationY += 0.003;
    offsetX += 0.02;

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#3a7bd5');
    skyGrad.addColorStop(1, '#87ceeb');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellSize = 3.5;
    const faces = [];

    for (let z = 0; z < gridSize - 1; z++) {
        for (let x = 0; x < gridSize - 1; x++) {
            const nx = (x + offsetX) * 0.08;
            const nz = z * 0.08;

            const h00 = fbm(nx, nz) * 60;
            const h10 = fbm(nx + 0.08, nz) * 60;
            const h01 = fbm(nx, nz + 0.08) * 60;
            const h11 = fbm(nx + 0.08, nz + 0.08) * 60;

            const worldX = (x - gridSize / 2) * cellSize;
            const worldZ = (z - gridSize / 2) * cellSize;

            const p00 = project(worldX, -h00 + 30, worldZ);
            const p10 = project(worldX + cellSize, -h10 + 30, worldZ);
            const p01 = project(worldX, -h01 + 30, worldZ + cellSize);
            const p11 = project(worldX + cellSize, -h11 + 30, worldZ + cellSize);

            const avgHeight = (fbm(nx, nz) + fbm(nx + 0.08, nz) + fbm(nx, nz + 0.08) + fbm(nx + 0.08, nz + 0.08)) / 4;
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

regenerateBtn.addEventListener('click', () => {
    seed = Math.random() * 1000;
    initPerm();
    infoEl.textContent = '地形已重新生成';
});

octavesSlider.addEventListener('input', (e) => {
    octaves = parseInt(e.target.value);
    infoEl.textContent = `八度數: ${octaves}`;
});

persistenceSlider.addEventListener('input', (e) => {
    persistence = parseInt(e.target.value) / 10;
    infoEl.textContent = `持續性: ${persistence.toFixed(1)}`;
});

initPerm();
draw();
