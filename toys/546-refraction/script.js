const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const iorSlider = document.getElementById('iorSlider');
const materialSelect = document.getElementById('materialSelect');
const infoEl = document.getElementById('info');

let ior = 1.5; // Index of refraction
let materialType = 'glass';
let time = 0;

// Background pattern
function getBackgroundColor(x, y, time) {
    // Checkerboard with some variation
    const scale = 30;
    const cx = Math.floor((x + time * 20) / scale);
    const cy = Math.floor(y / scale);
    const checker = (cx + cy) % 2;

    // Color stripes
    const stripePhase = Math.sin((x + time * 50) * 0.05) * 0.5 + 0.5;

    if (checker === 0) {
        return {
            r: 200 + stripePhase * 40,
            g: 100 + stripePhase * 30,
            b: 100
        };
    } else {
        return {
            r: 80,
            g: 120 + stripePhase * 40,
            b: 180 + stripePhase * 30
        };
    }
}

function normalize(v) {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len, v[1] / len, v[2] / len];
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

// Snell's law refraction
function refract(I, N, eta) {
    const cosi = -dot(I, N);
    const k = 1 - eta * eta * (1 - cosi * cosi);

    if (k < 0) {
        // Total internal reflection
        return null;
    }

    const cosr = Math.sqrt(k);
    return [
        eta * I[0] + (eta * cosi - cosr) * N[0],
        eta * I[1] + (eta * cosi - cosr) * N[1],
        eta * I[2] + (eta * cosi - cosr) * N[2]
    ];
}

// Fresnel equation (Schlick approximation)
function fresnel(cosi, ior) {
    const r0 = ((1 - ior) / (1 + ior)) ** 2;
    return r0 + (1 - r0) * Math.pow(1 - cosi, 5);
}

function draw() {
    time += 0.016;

    // Draw background first
    const bgImageData = ctx.createImageData(canvas.width, canvas.height);
    const bgData = bgImageData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const color = getBackgroundColor(x, y, time);
            const idx = (y * canvas.width + x) * 4;
            bgData[idx] = color.r;
            bgData[idx + 1] = color.g;
            bgData[idx + 2] = color.b;
            bgData[idx + 3] = 255;
        }
    }

    ctx.putImageData(bgImageData, 0, 0);

    // Draw refractive sphere
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = centerY - radius; y < centerY + radius; y++) {
        for (let x = centerX - radius; x < centerX + radius; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distSq = dx * dx + dy * dy;

            if (distSq < radius * radius) {
                const z = Math.sqrt(radius * radius - distSq);
                const normal = normalize([dx, dy, z]);

                // View ray (coming from front)
                const viewDir = [0, 0, -1];

                // Refract ray entering sphere
                const eta1 = 1.0 / ior; // Air to material
                const refractedDir = refract(viewDir, normal, eta1);

                if (refractedDir) {
                    // Calculate exit point (simplified - use displaced sample)
                    const displacement = 30 * (ior - 1);
                    const sampleX = x + refractedDir[0] * displacement;
                    const sampleY = y + refractedDir[1] * displacement;

                    // Get background color at refracted position
                    const bgColor = getBackgroundColor(sampleX, sampleY, time);

                    // Fresnel reflection
                    const cosi = Math.abs(dot(viewDir, normal));
                    const fresnelFactor = fresnel(cosi, ior);

                    // Tint based on material
                    let tint = { r: 1, g: 1, b: 1 };
                    if (materialType === 'glass') {
                        tint = { r: 0.95, g: 0.98, b: 1.0 };
                    } else if (materialType === 'water') {
                        tint = { r: 0.9, g: 0.95, b: 1.0 };
                    } else if (materialType === 'diamond') {
                        tint = { r: 1.0, g: 1.0, b: 0.98 };
                    }

                    // Apply chromatic aberration for diamond
                    let chromatic = 0;
                    if (materialType === 'diamond') {
                        chromatic = 10;
                    }

                    const rColor = getBackgroundColor(sampleX - chromatic, sampleY, time);
                    const bColor = getBackgroundColor(sampleX + chromatic, sampleY, time);

                    const r = (chromatic > 0 ? rColor.r : bgColor.r) * tint.r * (1 - fresnelFactor * 0.3);
                    const g = bgColor.g * tint.g * (1 - fresnelFactor * 0.3);
                    const b = (chromatic > 0 ? bColor.b : bgColor.b) * tint.b * (1 - fresnelFactor * 0.3);

                    // Add specular highlight
                    const lightDir = normalize([1, -1, 1]);
                    const halfVec = normalize([lightDir[0], lightDir[1], lightDir[2] + 1]);
                    const spec = Math.pow(Math.max(0, dot(normal, halfVec)), 64);

                    const idx = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
                    data[idx] = Math.min(255, r + 255 * spec * 0.5);
                    data[idx + 1] = Math.min(255, g + 255 * spec * 0.5);
                    data[idx + 2] = Math.min(255, b + 255 * spec * 0.5);
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    requestAnimationFrame(draw);
}

iorSlider.addEventListener('input', (e) => {
    ior = parseInt(e.target.value) / 100;
    infoEl.textContent = `折射率 (IOR): ${ior.toFixed(2)}`;
});

materialSelect.addEventListener('change', (e) => {
    materialType = e.target.value;
    const iors = { glass: 1.5, water: 1.33, diamond: 2.42 };
    ior = iors[materialType];
    iorSlider.value = ior * 100;
    const names = { glass: '玻璃', water: '水', diamond: '鑽石' };
    infoEl.textContent = `${names[materialType]} IOR: ${ior.toFixed(2)}`;
});

draw();
