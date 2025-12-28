const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const comparisonSelect = document.getElementById('comparisonSelect');
const infoEl = document.getElementById('info');

let comparisonType = 'metals';
let rotationY = 0;

// Material presets
const materialSets = {
    metals: [
        { name: '金', albedo: { r: 1.0, g: 0.8, b: 0.4 }, metallic: 1, roughness: 0.1 },
        { name: '銀', albedo: { r: 0.95, g: 0.95, b: 0.95 }, metallic: 1, roughness: 0.15 },
        { name: '銅', albedo: { r: 0.95, g: 0.6, b: 0.5 }, metallic: 1, roughness: 0.2 },
        { name: '鐵', albedo: { r: 0.56, g: 0.57, b: 0.58 }, metallic: 1, roughness: 0.4 }
    ],
    dielectrics: [
        { name: '塑膠', albedo: { r: 0.8, g: 0.2, b: 0.2 }, metallic: 0, roughness: 0.3 },
        { name: '陶瓷', albedo: { r: 0.9, g: 0.9, b: 0.85 }, metallic: 0, roughness: 0.1 },
        { name: '木材', albedo: { r: 0.6, g: 0.4, b: 0.2 }, metallic: 0, roughness: 0.6 },
        { name: '布料', albedo: { r: 0.3, g: 0.4, b: 0.7 }, metallic: 0, roughness: 0.9 }
    ],
    roughness: [
        { name: '鏡面', albedo: { r: 0.7, g: 0.7, b: 0.8 }, metallic: 0.5, roughness: 0.05 },
        { name: '光滑', albedo: { r: 0.7, g: 0.7, b: 0.8 }, metallic: 0.5, roughness: 0.2 },
        { name: '半粗糙', albedo: { r: 0.7, g: 0.7, b: 0.8 }, metallic: 0.5, roughness: 0.5 },
        { name: '粗糙', albedo: { r: 0.7, g: 0.7, b: 0.8 }, metallic: 0.5, roughness: 0.9 }
    ],
    mixed: [
        { name: '玻璃', albedo: { r: 0.95, g: 0.95, b: 1.0 }, metallic: 0, roughness: 0.05 },
        { name: '大理石', albedo: { r: 0.9, g: 0.85, b: 0.8 }, metallic: 0, roughness: 0.25 },
        { name: '黃金', albedo: { r: 1.0, g: 0.8, b: 0.4 }, metallic: 1, roughness: 0.1 },
        { name: '橡膠', albedo: { r: 0.1, g: 0.1, b: 0.1 }, metallic: 0, roughness: 0.8 }
    ]
};

function normalize(v) {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len, v[1] / len, v[2] / len];
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

// Simplified PBR
function calculatePBR(normal, viewDir, lightDir, material) {
    const halfVec = normalize([
        lightDir[0] + viewDir[0],
        lightDir[1] + viewDir[1],
        lightDir[2] + viewDir[2]
    ]);

    const NdotL = Math.max(0, dot(normal, lightDir));
    const NdotV = Math.max(0.001, dot(normal, viewDir));
    const NdotH = Math.max(0, dot(normal, halfVec));
    const VdotH = Math.max(0, dot(viewDir, halfVec));

    // GGX Distribution
    const a = material.roughness * material.roughness;
    const a2 = a * a;
    const denom = NdotH * NdotH * (a2 - 1) + 1;
    const D = a2 / (Math.PI * denom * denom);

    // Fresnel (Schlick)
    const F0 = material.metallic > 0.5 ? material.albedo : 0.04;
    const F = F0 + (1 - F0) * Math.pow(1 - VdotH, 5);

    // Geometry (Smith)
    const k = (material.roughness + 1) ** 2 / 8;
    const G1 = NdotV / (NdotV * (1 - k) + k);
    const G2 = NdotL / (NdotL * (1 - k) + k);
    const G = G1 * G2;

    // Specular
    const specular = (D * G * F) / Math.max(0.001, 4 * NdotV * NdotL);

    // Diffuse
    const kD = (1 - F) * (1 - material.metallic);

    return {
        diffuse: kD * NdotL,
        specular: specular * NdotL
    };
}

function drawMaterialSphere(cx, cy, radius, material) {
    const lightDir = normalize([1, -0.5, 1]);
    const viewDir = [0, 0, 1];

    const cosR = Math.cos(rotationY);
    const sinR = Math.sin(rotationY);

    for (let y = cy - radius; y < cy + radius; y++) {
        for (let x = cx - radius; x < cx + radius; x++) {
            const dx = x - cx;
            const dy = y - cy;
            const distSq = dx * dx + dy * dy;

            if (distSq < radius * radius) {
                const z = Math.sqrt(radius * radius - distSq);
                let nx = dx / radius;
                let ny = dy / radius;
                let nz = z / radius;

                // Rotate
                const nx2 = nx * cosR - nz * sinR;
                const nz2 = nx * sinR + nz * cosR;
                const normal = [nx2, ny, nz2];

                const pbr = calculatePBR(normal, viewDir, lightDir, material);

                // Environment reflection for metals
                let envReflect = 0;
                if (material.metallic > 0.5) {
                    // Fake environment based on normal direction
                    envReflect = (normal[1] > 0 ? 0.3 : 0.1) * (1 - material.roughness);
                }

                const ambient = 0.05;
                const r = Math.min(1, material.albedo.r * (ambient + pbr.diffuse * 0.7) + pbr.specular * 0.5 + envReflect * material.albedo.r);
                const g = Math.min(1, material.albedo.g * (ambient + pbr.diffuse * 0.7) + pbr.specular * 0.5 + envReflect * material.albedo.g);
                const b = Math.min(1, material.albedo.b * (ambient + pbr.diffuse * 0.7) + pbr.specular * 0.5 + envReflect * material.albedo.b);

                // Gamma correction
                const gamma = 2.2;
                ctx.fillStyle = `rgb(${Math.floor(Math.pow(r, 1/gamma) * 255)}, ${Math.floor(Math.pow(g, 1/gamma) * 255)}, ${Math.floor(Math.pow(b, 1/gamma) * 255)})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    // Label
    ctx.fillStyle = '#aaa';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(material.name, cx, cy + radius + 15);
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    rotationY += 0.01;

    const materials = materialSets[comparisonType];
    const sphereRadius = 50;
    const spacing = 85;
    const startX = (canvas.width - (materials.length - 1) * spacing) / 2;
    const centerY = canvas.height / 2 - 10;

    materials.forEach((mat, i) => {
        const cx = startX + i * spacing;
        drawMaterialSphere(cx, centerY, sphereRadius, mat);
    });

    requestAnimationFrame(draw);
}

comparisonSelect.addEventListener('change', (e) => {
    comparisonType = e.target.value;
    const names = { metals: '金屬類', dielectrics: '非金屬', roughness: '粗糙度', mixed: '混合' };
    infoEl.textContent = `比較: ${names[comparisonType]}`;
});

draw();
