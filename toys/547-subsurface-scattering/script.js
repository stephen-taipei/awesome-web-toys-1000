const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const materialSelect = document.getElementById('materialSelect');
const scatterSlider = document.getElementById('scatterSlider');
const infoEl = document.getElementById('info');

let materialType = 'skin';
let scatterAmount = 0.5;
let lightAngle = 0;

// Material properties
const materials = {
    skin: {
        albedo: { r: 0.9, g: 0.7, b: 0.6 },
        scatterColor: { r: 1.0, g: 0.4, b: 0.3 },
        scatterRadius: 0.3,
        translucency: 0.4
    },
    wax: {
        albedo: { r: 0.95, g: 0.9, b: 0.8 },
        scatterColor: { r: 1.0, g: 0.8, b: 0.5 },
        scatterRadius: 0.5,
        translucency: 0.6
    },
    jade: {
        albedo: { r: 0.4, g: 0.7, b: 0.5 },
        scatterColor: { r: 0.3, g: 0.9, b: 0.5 },
        scatterRadius: 0.4,
        translucency: 0.5
    },
    milk: {
        albedo: { r: 0.95, g: 0.95, b: 0.9 },
        scatterColor: { r: 1.0, g: 1.0, b: 0.95 },
        scatterRadius: 0.6,
        translucency: 0.7
    }
};

function normalize(v) {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len, v[1] / len, v[2] / len];
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

// Subsurface scattering approximation
function calculateSSS(normal, lightDir, viewDir, material) {
    // Standard diffuse
    const NdotL = Math.max(0, dot(normal, lightDir));

    // Wrap lighting for softer falloff
    const wrapFactor = 0.5;
    const wrappedNdotL = (dot(normal, lightDir) + wrapFactor) / (1 + wrapFactor);
    const wrapDiffuse = Math.max(0, wrappedNdotL);

    // Translucency (light passing through)
    const NdotLBack = Math.max(0, dot(normal, [-lightDir[0], -lightDir[1], -lightDir[2]]));
    const translucency = NdotLBack * material.translucency * scatterAmount;

    // View-dependent scattering
    const VdotL = Math.max(0, -dot(viewDir, lightDir));
    const scatter = VdotL * material.scatterRadius * scatterAmount;

    return {
        diffuse: wrapDiffuse,
        translucency: translucency,
        scatter: scatter
    };
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    lightAngle += 0.02;

    const material = materials[materialType];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 90;

    // Light position (orbiting)
    const lightDir = normalize([
        Math.cos(lightAngle),
        -0.3,
        Math.sin(lightAngle)
    ]);

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
                const normal = normalize([dx, dy, z]);

                // Calculate SSS lighting
                const sss = calculateSSS(normal, lightDir, viewDir, material);

                // Ambient
                const ambient = 0.1;

                // Direct diffuse
                const diffuseIntensity = sss.diffuse * 0.6;

                // Subsurface contribution
                const sssIntensity = (sss.translucency + sss.scatter) * 0.8;

                // Specular
                const halfVec = normalize([
                    lightDir[0] + viewDir[0],
                    lightDir[1] + viewDir[1],
                    lightDir[2] + viewDir[2]
                ]);
                const spec = Math.pow(Math.max(0, dot(normal, halfVec)), 32) * 0.3;

                // Combine colors
                const totalLight = ambient + diffuseIntensity;
                let r = material.albedo.r * totalLight + material.scatterColor.r * sssIntensity + spec;
                let g = material.albedo.g * totalLight + material.scatterColor.g * sssIntensity + spec;
                let b = material.albedo.b * totalLight + material.scatterColor.b * sssIntensity + spec;

                // Edge darkening (curvature)
                const edgeFactor = Math.pow(Math.abs(normal[2]), 0.5);
                r *= 0.7 + edgeFactor * 0.3;
                g *= 0.7 + edgeFactor * 0.3;
                b *= 0.7 + edgeFactor * 0.3;

                // Gamma correction
                r = Math.pow(Math.min(1, r), 1/2.2);
                g = Math.pow(Math.min(1, g), 1/2.2);
                b = Math.pow(Math.min(1, b), 1/2.2);

                const idx = (y * canvas.width + x) * 4;
                data[idx] = Math.floor(r * 255);
                data[idx + 1] = Math.floor(g * 255);
                data[idx + 2] = Math.floor(b * 255);
                data[idx + 3] = 255;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Light indicator
    const lx = centerX + Math.cos(lightAngle) * 130;
    const ly = centerY - 30;
    ctx.beginPath();
    ctx.arc(lx, ly, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    requestAnimationFrame(draw);
}

materialSelect.addEventListener('change', (e) => {
    materialType = e.target.value;
    const names = { skin: '皮膚', wax: '蠟燭', jade: '玉石', milk: '牛奶' };
    infoEl.textContent = `材質: ${names[materialType]}`;
});

scatterSlider.addEventListener('input', (e) => {
    scatterAmount = parseInt(e.target.value) / 100;
    infoEl.textContent = `散射量: ${(scatterAmount * 100).toFixed(0)}%`;
});

draw();
