const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const roughnessSlider = document.getElementById('roughnessSlider');
const metallicSlider = document.getElementById('metallicSlider');
const infoEl = document.getElementById('info');

let roughness = 0.3;
let metallic = 0.5;
let rotationY = 0;
let rotationX = 0.3;

const lightPos = { x: 100, y: -100, z: 100 };
const baseColor = { r: 0.8, g: 0.6, b: 0.4 };

function normalize(v) {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function reflect(I, N) {
    const d = 2 * dot(I, N);
    return { x: I.x - d * N.x, y: I.y - d * N.y, z: I.z - d * N.z };
}

// Fresnel Schlick approximation
function fresnelSchlick(cosTheta, F0) {
    return F0 + (1 - F0) * Math.pow(1 - cosTheta, 5);
}

// GGX Distribution
function distributionGGX(NdotH, roughness) {
    const a = roughness * roughness;
    const a2 = a * a;
    const denom = NdotH * NdotH * (a2 - 1) + 1;
    return a2 / (Math.PI * denom * denom);
}

// Geometry Smith
function geometrySmith(NdotV, NdotL, roughness) {
    const r = roughness + 1;
    const k = (r * r) / 8;
    const ggx1 = NdotV / (NdotV * (1 - k) + k);
    const ggx2 = NdotL / (NdotL * (1 - k) + k);
    return ggx1 * ggx2;
}

function calculatePBR(normal, viewDir, lightDir, albedo, metallic, roughness) {
    const H = normalize({
        x: viewDir.x + lightDir.x,
        y: viewDir.y + lightDir.y,
        z: viewDir.z + lightDir.z
    });

    const NdotL = Math.max(dot(normal, lightDir), 0);
    const NdotV = Math.max(dot(normal, viewDir), 0);
    const NdotH = Math.max(dot(normal, H), 0);
    const HdotV = Math.max(dot(H, viewDir), 0);

    // F0 for dielectrics is usually 0.04, for metals it's the albedo
    const F0 = metallic > 0.5 ? albedo : 0.04;

    // Cook-Torrance BRDF
    const D = distributionGGX(NdotH, roughness);
    const G = geometrySmith(NdotV, NdotL, roughness);
    const F = fresnelSchlick(HdotV, F0);

    const specular = (D * G * F) / Math.max(4 * NdotV * NdotL, 0.001);

    // Diffuse (Lambert)
    const kD = (1 - F) * (1 - metallic);
    const diffuse = kD * albedo / Math.PI;

    const lightIntensity = 3;
    return (diffuse + specular) * NdotL * lightIntensity;
}

function drawSphere() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distSq = dx * dx + dy * dy;

            if (distSq < radius * radius) {
                // Calculate sphere normal
                const z = Math.sqrt(radius * radius - distSq);
                let nx = dx / radius;
                let ny = dy / radius;
                let nz = z / radius;

                // Rotate normal
                const nx2 = nx * cosY - nz * sinY;
                const nz2 = nx * sinY + nz * cosY;
                const ny2 = ny * cosX - nz2 * sinX;
                const nz3 = ny * sinX + nz2 * cosX;

                const normal = { x: nx2, y: ny2, z: nz3 };
                const viewDir = { x: 0, y: 0, z: 1 };
                const lightDir = normalize(lightPos);

                // Calculate PBR lighting for each channel
                const rPBR = calculatePBR(normal, viewDir, lightDir, baseColor.r, metallic, roughness);
                const gPBR = calculatePBR(normal, viewDir, lightDir, baseColor.g, metallic, roughness);
                const bPBR = calculatePBR(normal, viewDir, lightDir, baseColor.b, metallic, roughness);

                // Add ambient
                const ambient = 0.03;
                const r = Math.min(1, rPBR + ambient * baseColor.r);
                const g = Math.min(1, gPBR + ambient * baseColor.g);
                const b = Math.min(1, bPBR + ambient * baseColor.b);

                // Gamma correction
                const gamma = 2.2;
                const idx = (y * canvas.width + x) * 4;
                data[idx] = Math.floor(Math.pow(r, 1/gamma) * 255);
                data[idx + 1] = Math.floor(Math.pow(g, 1/gamma) * 255);
                data[idx + 2] = Math.floor(Math.pow(b, 1/gamma) * 255);
                data[idx + 3] = 255;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw labels
    ctx.fillStyle = '#888';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Roughness: ${roughness.toFixed(2)}`, 10, 20);
    ctx.fillText(`Metallic: ${metallic.toFixed(2)}`, 10, 35);
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    rotationY += 0.01;
    drawSphere();

    requestAnimationFrame(draw);
}

roughnessSlider.addEventListener('input', (e) => {
    roughness = parseInt(e.target.value) / 100;
    infoEl.textContent = `粗糙度: ${roughness.toFixed(2)}`;
});

metallicSlider.addEventListener('input', (e) => {
    metallic = parseInt(e.target.value) / 100;
    infoEl.textContent = `金屬度: ${metallic.toFixed(2)}`;
});

draw();
