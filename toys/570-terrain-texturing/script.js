const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const regenerateBtn = document.getElementById('regenerateBtn');
const blendSlider = document.getElementById('blendSlider');
const infoEl = document.getElementById('info');

let heightmap = [];
let slopemap = [];
let rotationY = 0.5;
let seed = Math.random() * 1000;
let blendStrength = 0.5;
const gridSize = 45;

// Texture definitions
const textures = {
    water: { base: { r: 40, g: 100, b: 180 }, pattern: 'wave' },
    sand: { base: { r: 210, g: 190, b: 140 }, pattern: 'dots' },
    grass: { base: { r: 80, g: 140, b: 60 }, pattern: 'noise' },
    dirt: { base: { r: 130, g: 100, b: 70 }, pattern: 'rough' },
    rock: { base: { r: 120, g: 115, b: 110 }, pattern: 'cracks' },
    snow: { base: { r: 240, g: 245, b: 255 }, pattern: 'sparkle' }
};

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

function generateTerrain() {
    heightmap = [];
    slopemap = [];

    for (let z = 0; z < gridSize; z++) {
        heightmap[z] = [];
        slopemap[z] = [];
        for (let x = 0; x < gridSize; x++) {
            heightmap[z][x] = fbm(x * 0.06, z * 0.06, 4);
        }
    }

    // Calculate slopes
    for (let z = 1; z < gridSize - 1; z++) {
        for (let x = 1; x < gridSize - 1; x++) {
            const dx = heightmap[z][x + 1] - heightmap[z][x - 1];
            const dz = heightmap[z + 1][x] - heightmap[z - 1][x];
            slopemap[z][x] = Math.sqrt(dx * dx + dz * dz);
        }
    }
    // Fill edges
    for (let i = 0; i < gridSize; i++) {
        slopemap[0] = slopemap[1] || [];
        slopemap[gridSize - 1] = slopemap[gridSize - 2] || [];
        if (slopemap[i]) {
            slopemap[i][0] = slopemap[i][1] || 0;
            slopemap[i][gridSize - 1] = slopemap[i][gridSize - 2] || 0;
        }
    }
}

function getTexturePattern(pattern, x, z, time) {
    switch (pattern) {
        case 'wave':
            return Math.sin(x * 0.5 + time * 2) * 0.1 + Math.sin(z * 0.3 + time) * 0.1;
        case 'dots':
            return ((x * 3 + z * 2) % 5 === 0) ? 0.1 : 0;
        case 'noise':
            return (noise(x * 0.5, z * 0.5) - 0.5) * 0.2;
        case 'rough':
            return (noise(x * 0.8, z * 0.8) - 0.5) * 0.3;
        case 'cracks':
            return Math.abs(noise(x * 0.3, z * 0.3) - 0.5) * 0.4;
        case 'sparkle':
            return noise(x * 2 + time, z * 2) > 0.9 ? 0.3 : 0;
        default:
            return 0;
    }
}

function blendColors(color1, color2, factor) {
    return {
        r: Math.floor(color1.r * (1 - factor) + color2.r * factor),
        g: Math.floor(color1.g * (1 - factor) + color2.g * factor),
        b: Math.floor(color1.b * (1 - factor) + color2.b * factor)
    };
}

function getTerrainTexture(height, slope, x, z, time) {
    // Determine primary textures based on height
    let tex1, tex2, blend;

    if (height < 0.25) {
        tex1 = textures.water;
        tex2 = textures.sand;
        blend = height / 0.25;
    } else if (height < 0.35) {
        tex1 = textures.sand;
        tex2 = textures.grass;
        blend = (height - 0.25) / 0.1;
    } else if (height < 0.55) {
        tex1 = textures.grass;
        tex2 = textures.dirt;
        blend = (height - 0.35) / 0.2;
    } else if (height < 0.75) {
        tex1 = textures.dirt;
        tex2 = textures.rock;
        blend = (height - 0.55) / 0.2;
    } else {
        tex1 = textures.rock;
        tex2 = textures.snow;
        blend = (height - 0.75) / 0.25;
    }

    // Slope affects texture - steep slopes show rock
    if (slope > 0.15 && height > 0.3) {
        const rockBlend = Math.min(1, (slope - 0.15) / 0.1);
        tex1 = blendColors(tex1.base, textures.rock.base, rockBlend);
        tex1 = { base: tex1, pattern: 'cracks' };
    }

    // Apply blend strength
    blend = blend * blendStrength;

    // Get base blended color
    const baseColor = blendColors(tex1.base, tex2.base, blend);

    // Add texture patterns
    const pattern1 = getTexturePattern(tex1.pattern, x, z, time);
    const pattern2 = getTexturePattern(tex2.pattern, x, z, time);
    const patternMix = pattern1 * (1 - blend) + pattern2 * blend;

    return {
        r: Math.max(0, Math.min(255, baseColor.r + patternMix * 50)),
        g: Math.max(0, Math.min(255, baseColor.g + patternMix * 50)),
        b: Math.max(0, Math.min(255, baseColor.b + patternMix * 50))
    };
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
        x: canvas.width / 2 + x1 * 4.5 * scale,
        y: canvas.height / 2 - y * 50 * scale + z1 * 2,
        scale,
        z: z1
    };
}

function draw() {
    rotationY += 0.004;
    const time = Date.now() / 1000;

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
            const avgSlope = (
                (slopemap[z]?.[x] || 0) +
                (slopemap[z]?.[x + 1] || 0) +
                (slopemap[z + 1]?.[x] || 0) +
                (slopemap[z + 1]?.[x + 1] || 0)
            ) / 4;
            const avgZ = (p00.z + p10.z + p01.z + p11.z) / 4;

            faces.push({
                points: [p00, p10, p11, p01],
                avgZ,
                height: avgHeight,
                slope: avgSlope,
                x,
                z
            });
        }
    }

    faces.sort((a, b) => b.avgZ - a.avgZ);

    faces.forEach(face => {
        const color = getTerrainTexture(face.height, face.slope, face.x, face.z, time);

        // Lighting based on height
        const shade = 0.6 + face.height * 0.4;

        ctx.beginPath();
        ctx.moveTo(face.points[0].x, face.points[0].y);
        face.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        ctx.fillStyle = `rgb(${Math.floor(color.r * shade)}, ${Math.floor(color.g * shade)}, ${Math.floor(color.b * shade)})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });

    requestAnimationFrame(draw);
}

regenerateBtn.addEventListener('click', () => {
    seed = Math.random() * 1000;
    generateTerrain();
    infoEl.textContent = '地形已重新生成';
});

blendSlider.addEventListener('input', (e) => {
    blendStrength = parseInt(e.target.value) / 100;
    infoEl.textContent = `混合強度: ${Math.round(blendStrength * 100)}%`;
});

generateTerrain();
draw();
