const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const textureSelect = document.getElementById('textureSelect');
const mappingSelect = document.getElementById('mappingSelect');
const infoEl = document.getElementById('info');

let textureType = 'checker';
let mappingType = 'sphere';
let rotationY = 0;

// Procedural textures
function checkerTexture(u, v) {
    const scale = 8;
    const cu = Math.floor(u * scale) % 2;
    const cv = Math.floor(v * scale) % 2;
    return (cu + cv) % 2 === 0 ? { r: 230, g: 230, b: 230 } : { r: 50, g: 50, b: 50 };
}

function brickTexture(u, v) {
    const brickW = 0.2;
    const brickH = 0.1;
    const mortarW = 0.02;

    const row = Math.floor(v / brickH);
    const offsetU = (row % 2) * 0.5 * brickW;
    const bu = (u + offsetU) % brickW;
    const bv = v % brickH;

    if (bu < mortarW || bv < mortarW) {
        return { r: 150, g: 150, b: 140 }; // Mortar
    }
    // Brick color with variation
    const noise = Math.sin(u * 50) * 10 + Math.cos(v * 50) * 10;
    return { r: 180 + noise, g: 80 + noise * 0.5, b: 60 };
}

function woodTexture(u, v) {
    const grain = Math.sin(v * 30 + Math.sin(u * 5) * 3) * 0.5 + 0.5;
    const ring = Math.sin(Math.sqrt((u - 0.5) ** 2 + (v - 0.5) ** 2) * 40) * 0.3 + 0.7;
    const intensity = grain * ring;
    return {
        r: Math.floor(139 * intensity + 50),
        g: Math.floor(90 * intensity + 30),
        b: Math.floor(43 * intensity + 15)
    };
}

function marbleTexture(u, v) {
    const noise1 = Math.sin(u * 10 + Math.sin(v * 15) * 2);
    const noise2 = Math.sin(v * 8 + Math.cos(u * 12) * 1.5);
    const vein = Math.abs(Math.sin((u + v) * 15 + noise1 * 3 + noise2 * 2));
    const base = 230;
    const veinColor = vein > 0.9 ? 80 : base;
    return { r: veinColor, g: veinColor, b: veinColor + 10 };
}

function getTexture(u, v) {
    switch (textureType) {
        case 'checker': return checkerTexture(u, v);
        case 'brick': return brickTexture(u, v);
        case 'wood': return woodTexture(u, v);
        case 'marble': return marbleTexture(u, v);
        default: return checkerTexture(u, v);
    }
}

function sphereMapping(nx, ny, nz) {
    const u = 0.5 + Math.atan2(nz, nx) / (2 * Math.PI);
    const v = 0.5 - Math.asin(ny) / Math.PI;
    return { u, v };
}

function cylinderMapping(nx, ny, nz) {
    const u = 0.5 + Math.atan2(nz, nx) / (2 * Math.PI);
    const v = (ny + 1) / 2;
    return { u, v };
}

function planarMapping(nx, ny, nz) {
    return { u: (nx + 1) / 2, v: (ny + 1) / 2 };
}

function getUV(nx, ny, nz) {
    switch (mappingType) {
        case 'sphere': return sphereMapping(nx, ny, nz);
        case 'cylinder': return cylinderMapping(nx, ny, nz);
        case 'planar': return planarMapping(nx, ny, nz);
        default: return sphereMapping(nx, ny, nz);
    }
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    rotationY += 0.01;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;

    const cosR = Math.cos(rotationY);
    const sinR = Math.sin(rotationY);

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distSq = dx * dx + dy * dy;

            if (distSq < radius * radius) {
                const z = Math.sqrt(radius * radius - distSq);
                let nx = dx / radius;
                let ny = dy / radius;
                let nz = z / radius;

                // Rotate
                const nx2 = nx * cosR - nz * sinR;
                const nz2 = nx * sinR + nz * cosR;

                // Get UV and texture
                const uv = getUV(nx2, ny, nz2);
                const color = getTexture(uv.u, uv.v);

                // Simple lighting
                const lightDir = [0.5, -0.5, 0.7];
                const len = Math.sqrt(lightDir[0] ** 2 + lightDir[1] ** 2 + lightDir[2] ** 2);
                const NdotL = Math.max(0, (nx2 * lightDir[0] + ny * lightDir[1] + nz2 * lightDir[2]) / len);
                const shade = 0.3 + NdotL * 0.7;

                const idx = (y * canvas.width + x) * 4;
                data[idx] = Math.floor(color.r * shade);
                data[idx + 1] = Math.floor(color.g * shade);
                data[idx + 2] = Math.floor(color.b * shade);
                data[idx + 3] = 255;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    requestAnimationFrame(draw);
}

textureSelect.addEventListener('change', (e) => {
    textureType = e.target.value;
    const names = { checker: '棋盤格', brick: '磚塊', wood: '木紋', marble: '大理石' };
    infoEl.textContent = `貼圖: ${names[textureType]}`;
});

mappingSelect.addEventListener('change', (e) => {
    mappingType = e.target.value;
    const names = { sphere: '球形', cylinder: '圓柱', planar: '平面' };
    infoEl.textContent = `映射: ${names[mappingType]}`;
});

draw();
