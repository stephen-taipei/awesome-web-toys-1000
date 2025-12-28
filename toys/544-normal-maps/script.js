const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const patternSelect = document.getElementById('patternSelect');
const strengthSlider = document.getElementById('strengthSlider');
const infoEl = document.getElementById('info');

let pattern = 'bumps';
let strength = 0.5;
let lightAngle = 0;

// Normal map patterns - returns perturbation to surface normal
function bumpsNormal(u, v) {
    const scale = 15;
    const height = Math.sin(u * scale) * Math.sin(v * scale);
    const dhdx = Math.cos(u * scale) * Math.sin(v * scale) * scale;
    const dhdy = Math.sin(u * scale) * Math.cos(v * scale) * scale;
    return { dx: -dhdx * strength, dy: -dhdy * strength };
}

function tilesNormal(u, v) {
    const tileSize = 0.15;
    const bevel = 0.02;
    const tu = u % tileSize;
    const tv = v % tileSize;

    let dx = 0, dy = 0;

    // Bevel at edges
    if (tu < bevel) dx = -1;
    else if (tu > tileSize - bevel) dx = 1;
    if (tv < bevel) dy = -1;
    else if (tv > tileSize - bevel) dy = 1;

    return { dx: dx * strength * 2, dy: dy * strength * 2 };
}

function wavesNormal(u, v) {
    const freq = 20;
    const dhdx = Math.cos(u * freq + v * freq * 0.5) * freq;
    const dhdy = Math.cos(v * freq + u * freq * 0.3) * freq * 0.5;
    return { dx: -dhdx * strength * 0.1, dy: -dhdy * strength * 0.1 };
}

function cracksNormal(u, v) {
    // Voronoi-like cracks
    const scale = 5;
    const pu = u * scale;
    const pv = v * scale;

    let minDist = 10;
    let closestX = 0, closestY = 0;

    // Check nearby cells
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const cellX = Math.floor(pu) + i;
            const cellY = Math.floor(pv) + j;
            // Pseudo-random point in cell
            const px = cellX + 0.5 + Math.sin(cellX * 127.1 + cellY * 311.7) * 0.4;
            const py = cellY + 0.5 + Math.sin(cellX * 269.5 + cellY * 183.3) * 0.4;
            const dist = Math.sqrt((pu - px) ** 2 + (pv - py) ** 2);
            if (dist < minDist) {
                minDist = dist;
                closestX = px;
                closestY = py;
            }
        }
    }

    const dx = (pu - closestX) / (minDist + 0.01);
    const dy = (pv - closestY) / (minDist + 0.01);

    return { dx: dx * strength * 0.5, dy: dy * strength * 0.5 };
}

function getNormalPerturbation(u, v) {
    switch (pattern) {
        case 'bumps': return bumpsNormal(u, v);
        case 'tiles': return tilesNormal(u, v);
        case 'waves': return wavesNormal(u, v);
        case 'cracks': return cracksNormal(u, v);
        default: return bumpsNormal(u, v);
    }
}

function normalize(v) {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len, v[1] / len, v[2] / len];
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    lightAngle += 0.02;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;

    // Moving light
    const lightDir = normalize([
        Math.cos(lightAngle),
        Math.sin(lightAngle) * 0.5 - 0.5,
        0.7
    ]);

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distSq = dx * dx + dy * dy;

            if (distSq < radius * radius) {
                const z = Math.sqrt(radius * radius - distSq);
                const nx = dx / radius;
                const ny = dy / radius;
                const nz = z / radius;

                // UV coordinates
                const u = 0.5 + Math.atan2(nz, nx) / (2 * Math.PI);
                const v = 0.5 - Math.asin(ny) / Math.PI;

                // Get normal perturbation
                const perturb = getNormalPerturbation(u, v);

                // Apply perturbation to normal (tangent space to world space simplified)
                const perturbedNormal = normalize([
                    nx + perturb.dx * (1 - nx * nx),
                    ny + perturb.dy * (1 - ny * ny),
                    nz
                ]);

                // Lighting
                const NdotL = Math.max(0, dot(perturbedNormal, lightDir));

                // Specular
                const viewDir = [0, 0, 1];
                const halfVec = normalize([
                    lightDir[0] + viewDir[0],
                    lightDir[1] + viewDir[1],
                    lightDir[2] + viewDir[2]
                ]);
                const NdotH = Math.max(0, dot(perturbedNormal, halfVec));
                const spec = Math.pow(NdotH, 32);

                // Color
                const baseColor = { r: 140, g: 140, b: 180 };
                const ambient = 0.15;
                const r = Math.min(255, baseColor.r * (ambient + NdotL * 0.7) + 255 * spec * 0.3);
                const g = Math.min(255, baseColor.g * (ambient + NdotL * 0.7) + 255 * spec * 0.3);
                const b = Math.min(255, baseColor.b * (ambient + NdotL * 0.7) + 255 * spec * 0.3);

                const idx = (y * canvas.width + x) * 4;
                data[idx] = Math.floor(r);
                data[idx + 1] = Math.floor(g);
                data[idx + 2] = Math.floor(b);
                data[idx + 3] = 255;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Light indicator
    const lx = centerX + Math.cos(lightAngle) * 130;
    const ly = centerY + Math.sin(lightAngle) * 0.5 * 100;
    ctx.beginPath();
    ctx.arc(lx, ly, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();

    requestAnimationFrame(draw);
}

patternSelect.addEventListener('change', (e) => {
    pattern = e.target.value;
    const names = { bumps: '凹凸', tiles: '磁磚', waves: '波浪', cracks: '裂紋' };
    infoEl.textContent = `圖案: ${names[pattern]}`;
});

strengthSlider.addEventListener('input', (e) => {
    strength = parseInt(e.target.value) / 100;
    infoEl.textContent = `強度: ${(strength * 100).toFixed(0)}%`;
});

draw();
