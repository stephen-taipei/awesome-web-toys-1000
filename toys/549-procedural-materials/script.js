const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const materialSelect = document.getElementById('materialSelect');
const scaleSlider = document.getElementById('scaleSlider');
const infoEl = document.getElementById('info');

let materialType = 'noise';
let scale = 5;
let time = 0;

// Pseudo-random hash function
function hash(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
}

// Smooth noise
function noise(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;

    // Smooth interpolation
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);

    const a = hash(ix, iy);
    const b = hash(ix + 1, iy);
    const c = hash(ix, iy + 1);
    const d = hash(ix + 1, iy + 1);

    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

// Fractal Brownian Motion
function fbm(x, y, octaves) {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;

    for (let i = 0; i < octaves; i++) {
        value += amplitude * noise(x * frequency, y * frequency);
        amplitude *= 0.5;
        frequency *= 2;
    }

    return value;
}

// Voronoi distance
function voronoi(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    let minDist = 10;
    let minDist2 = 10;

    for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
            const cellX = ix + i;
            const cellY = iy + j;
            const px = cellX + hash(cellX, cellY);
            const py = cellY + hash(cellY, cellX);
            const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

            if (dist < minDist) {
                minDist2 = minDist;
                minDist = dist;
            } else if (dist < minDist2) {
                minDist2 = dist;
            }
        }
    }

    return { dist: minDist, edge: minDist2 - minDist };
}

function normalize(v) {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len, v[1] / len, v[2] / len];
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function getProceduralColor(u, v, t) {
    const su = u * scale;
    const sv = v * scale;

    switch (materialType) {
        case 'noise': {
            const n = fbm(su + t * 0.3, sv, 4);
            const r = n * 0.8 + 0.2;
            const g = n * 0.6 + 0.1;
            const b = n * 0.4;
            return { r, g, b, bump: (n - 0.5) * 2 };
        }
        case 'voronoi': {
            const vor = voronoi(su + t * 0.2, sv);
            const edge = vor.edge < 0.1 ? 0.2 : 1;
            const cell = hash(Math.floor(su), Math.floor(sv));
            const r = (0.3 + cell * 0.5) * edge;
            const g = (0.4 + (1 - cell) * 0.4) * edge;
            const b = (0.5 + cell * 0.3) * edge;
            return { r, g, b, bump: vor.dist };
        }
        case 'fractal': {
            const n = fbm(su, sv + t * 0.1, 6);
            const n2 = fbm(su + n * 2, sv + n * 2, 4);
            const r = Math.abs(Math.sin(n2 * 10)) * 0.7 + 0.2;
            const g = Math.abs(Math.cos(n * 8)) * 0.5 + 0.2;
            const b = n2 * 0.6 + 0.3;
            return { r, g, b, bump: n2 };
        }
        case 'gradient': {
            const angle = Math.atan2(v - 0.5, u - 0.5) + t * 0.5;
            const dist = Math.sqrt((u - 0.5) ** 2 + (v - 0.5) ** 2) * 2;
            const wave = Math.sin(angle * scale + dist * 5) * 0.5 + 0.5;
            const r = wave;
            const g = Math.sin(angle * 2 + t) * 0.5 + 0.5;
            const b = 1 - wave;
            return { r, g, b, bump: wave - 0.5 };
        }
        default:
            return { r: 0.5, g: 0.5, b: 0.5, bump: 0 };
    }
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    time += 0.016;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 90;

    const lightDir = normalize([1, -0.5, 1]);
    const viewDir = [0, 0, 1];

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distSq = dx * dx + dy * dy;

            if (distSq < radius * radius) {
                const z = Math.sqrt(radius * radius - distSq);
                let normal = normalize([dx, dy, z]);

                // UV coordinates
                const u = 0.5 + Math.atan2(normal[2], normal[0]) / (2 * Math.PI);
                const v = 0.5 - Math.asin(normal[1]) / Math.PI;

                // Get procedural color and bump
                const proc = getProceduralColor(u, v, time);

                // Perturb normal based on bump
                const bumpStrength = 0.3;
                const delta = 0.01;
                const bumpL = getProceduralColor(u - delta, v, time).bump;
                const bumpR = getProceduralColor(u + delta, v, time).bump;
                const bumpU = getProceduralColor(u, v - delta, time).bump;
                const bumpD = getProceduralColor(u, v + delta, time).bump;

                normal = normalize([
                    normal[0] + (bumpL - bumpR) * bumpStrength,
                    normal[1] + (bumpU - bumpD) * bumpStrength,
                    normal[2]
                ]);

                // Lighting
                const NdotL = Math.max(0, dot(normal, lightDir));
                const ambient = 0.15;

                // Specular
                const halfVec = normalize([lightDir[0] + viewDir[0], lightDir[1] + viewDir[1], lightDir[2] + viewDir[2]]);
                const spec = Math.pow(Math.max(0, dot(normal, halfVec)), 32) * 0.3;

                const shade = ambient + NdotL * 0.7;
                const r = Math.min(1, proc.r * shade + spec);
                const g = Math.min(1, proc.g * shade + spec);
                const b = Math.min(1, proc.b * shade + spec);

                const idx = (y * canvas.width + x) * 4;
                data[idx] = Math.floor(r * 255);
                data[idx + 1] = Math.floor(g * 255);
                data[idx + 2] = Math.floor(b * 255);
                data[idx + 3] = 255;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    requestAnimationFrame(draw);
}

materialSelect.addEventListener('change', (e) => {
    materialType = e.target.value;
    const names = { noise: '噪聲', voronoi: '泰森多邊形', fractal: '碎形', gradient: '漸層' };
    infoEl.textContent = `材質: ${names[materialType]}`;
});

scaleSlider.addEventListener('input', (e) => {
    scale = parseInt(e.target.value);
    infoEl.textContent = `縮放: ${scale}x`;
});

draw();
