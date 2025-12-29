const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const reflectivitySlider = document.getElementById('reflectivitySlider');
const envSelect = document.getElementById('envSelect');
const infoEl = document.getElementById('info');

let reflectivity = 0.7;
let envType = 'sunset';
let rotationY = 0;

// Procedural environment maps
function sunsetEnv(dir) {
    const y = dir[1];
    const angle = Math.atan2(dir[2], dir[0]);

    // Sky gradient
    const skyTop = { r: 30, g: 30, b: 80 };
    const skyHorizon = { r: 255, g: 150, b: 80 };
    const t = Math.max(0, Math.min(1, (y + 0.3) * 1.5));

    let r = skyHorizon.r + (skyTop.r - skyHorizon.r) * t;
    let g = skyHorizon.g + (skyTop.g - skyHorizon.g) * t;
    let b = skyHorizon.b + (skyTop.b - skyHorizon.b) * t;

    // Sun
    const sunAngle = 0.5;
    const sunDist = Math.sqrt((angle - sunAngle) ** 2 + (y + 0.1) ** 2);
    if (sunDist < 0.3) {
        const sunIntensity = 1 - sunDist / 0.3;
        r = Math.min(255, r + 200 * sunIntensity);
        g = Math.min(255, g + 150 * sunIntensity);
        b = Math.min(255, b + 50 * sunIntensity);
    }

    // Ground
    if (y < -0.1) {
        r = 40; g = 35; b = 30;
    }

    return { r, g, b };
}

function skyEnv(dir) {
    const y = dir[1];

    const skyTop = { r: 50, g: 100, b: 200 };
    const skyHorizon = { r: 180, g: 220, b: 255 };
    const t = Math.max(0, Math.min(1, y + 0.5));

    let r = skyHorizon.r + (skyTop.r - skyHorizon.r) * t;
    let g = skyHorizon.g + (skyTop.g - skyHorizon.g) * t;
    let b = skyHorizon.b + (skyTop.b - skyHorizon.b) * t;

    // Clouds
    const cloudNoise = Math.sin(dir[0] * 10) * Math.sin(dir[2] * 8) * 0.5 + 0.5;
    if (y > 0.1 && y < 0.6 && cloudNoise > 0.6) {
        const cloudIntensity = (cloudNoise - 0.6) * 2.5;
        r = Math.min(255, r + 70 * cloudIntensity);
        g = Math.min(255, g + 70 * cloudIntensity);
        b = Math.min(255, b + 70 * cloudIntensity);
    }

    // Ground
    if (y < -0.05) {
        r = 60 + y * 30; g = 100 + y * 30; b = 60 + y * 30;
    }

    return { r, g, b };
}

function nightEnv(dir) {
    const y = dir[1];
    const angle = Math.atan2(dir[2], dir[0]);

    let r = 10, g = 15, b = 30;

    // Stars
    const starNoise = Math.sin(angle * 50 + y * 50) * Math.sin(angle * 30 - y * 40);
    if (y > 0 && starNoise > 0.95) {
        r = 255; g = 255; b = 255;
    }

    // Moon
    const moonAngle = -0.8;
    const moonDist = Math.sqrt((angle - moonAngle) ** 2 + (y - 0.5) ** 2);
    if (moonDist < 0.15) {
        const moonIntensity = 1 - moonDist / 0.15;
        r = Math.min(255, r + 200 * moonIntensity);
        g = Math.min(255, g + 200 * moonIntensity);
        b = Math.min(255, b + 220 * moonIntensity);
    }

    // Ground
    if (y < -0.05) {
        r = 15; g = 15; b = 20;
    }

    return { r, g, b };
}

function getEnvColor(dir) {
    switch (envType) {
        case 'sunset': return sunsetEnv(dir);
        case 'sky': return skyEnv(dir);
        case 'night': return nightEnv(dir);
        default: return sunsetEnv(dir);
    }
}

function normalize(v) {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len, v[1] / len, v[2] / len];
}

function reflect(I, N) {
    const dot = I[0] * N[0] + I[1] * N[1] + I[2] * N[2];
    return [
        I[0] - 2 * dot * N[0],
        I[1] - 2 * dot * N[1],
        I[2] - 2 * dot * N[2]
    ];
}

function draw() {
    rotationY += 0.01;

    // Draw environment background
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const dx = (x - canvas.width / 2) / canvas.width;
            const dy = (canvas.height / 2 - y) / canvas.height;
            const dir = normalize([dx, dy, 0.5]);
            const color = getEnvColor(dir);
            ctx.fillStyle = `rgb(${Math.floor(color.r)}, ${Math.floor(color.g)}, ${Math.floor(color.b)})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    const cosR = Math.cos(rotationY);
    const sinR = Math.sin(rotationY);

    // Draw reflective sphere
    for (let y = centerY - radius; y < centerY + radius; y++) {
        for (let x = centerX - radius; x < centerX + radius; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distSq = dx * dx + dy * dy;

            if (distSq < radius * radius) {
                const z = Math.sqrt(radius * radius - distSq);
                let nx = dx / radius;
                let ny = dy / radius;
                let nz = z / radius;

                // Rotate normal
                const nx2 = nx * cosR - nz * sinR;
                const nz2 = nx * sinR + nz * cosR;
                const normal = [nx2, ny, nz2];

                // View direction
                const viewDir = [0, 0, -1];

                // Reflect view direction
                const reflectDir = reflect(viewDir, normal);

                // Fresnel effect
                const NdotV = Math.abs(normal[2]);
                const fresnel = reflectivity + (1 - reflectivity) * Math.pow(1 - NdotV, 5);

                // Get environment color
                const envColor = getEnvColor(reflectDir);

                // Base color (dark metallic)
                const baseColor = { r: 30, g: 30, b: 40 };

                // Mix base and reflection
                const r = baseColor.r * (1 - fresnel) + envColor.r * fresnel;
                const g = baseColor.g * (1 - fresnel) + envColor.g * fresnel;
                const b = baseColor.b * (1 - fresnel) + envColor.b * fresnel;

                ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    requestAnimationFrame(draw);
}

reflectivitySlider.addEventListener('input', (e) => {
    reflectivity = parseInt(e.target.value) / 100;
    infoEl.textContent = `反射率: ${(reflectivity * 100).toFixed(0)}%`;
});

envSelect.addEventListener('change', (e) => {
    envType = e.target.value;
    const names = { sunset: '日落', sky: '藍天', night: '夜空' };
    infoEl.textContent = `環境: ${names[envType]}`;
});

draw();
