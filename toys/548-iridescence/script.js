const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const effectSelect = document.getElementById('effectSelect');
const thicknessSlider = document.getElementById('thicknessSlider');
const infoEl = document.getElementById('info');

let effectType = 'bubble';
let filmThickness = 0.5;
let time = 0;

function normalize(v) {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len, v[1] / len, v[2] / len];
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

// Thin-film interference color calculation
function thinFilmColor(cosTheta, thickness) {
    // Wavelengths for RGB (in nm, normalized)
    const wavelengths = { r: 650, g: 510, b: 475 };
    const filmIOR = 1.33; // Soap film

    // Path difference in film
    const d = thickness * 400; // Scale thickness
    const pathDiff = 2 * d * Math.sqrt(filmIOR * filmIOR - (1 - cosTheta * cosTheta));

    // Interference for each wavelength
    const interference = {};
    for (const [channel, wavelength] of Object.entries(wavelengths)) {
        const phase = (2 * Math.PI * pathDiff) / wavelength;
        // Constructive/destructive interference
        interference[channel] = Math.cos(phase) * 0.5 + 0.5;
    }

    return interference;
}

// Convert angle to rainbow color
function angleToRainbow(angle, intensity) {
    const hue = ((angle + time * 0.5) % (2 * Math.PI)) / (2 * Math.PI) * 360;
    return hslToRgb(hue, 0.8, 0.3 + intensity * 0.4);
}

function hslToRgb(h, s, l) {
    h /= 360;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { r: r * 255, g: g * 255, b: b * 255 };
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    time += 0.02;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 90;

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

                // View angle
                const cosTheta = Math.abs(dot(normal, viewDir));

                // Local thickness variation
                let localThickness = filmThickness;
                if (effectType === 'bubble') {
                    // Thickness varies with gravity (thinner at top)
                    localThickness *= 0.5 + (1 - dy / radius) * 0.5;
                    // Add some swirl
                    localThickness += Math.sin(Math.atan2(dy, dx) * 3 + time) * 0.1;
                } else if (effectType === 'oil') {
                    // Random thickness pattern
                    localThickness += Math.sin(x * 0.1 + time) * Math.cos(y * 0.1) * 0.3;
                } else if (effectType === 'beetle') {
                    // Structured pattern
                    const angle = Math.atan2(dy, dx);
                    localThickness += Math.sin(angle * 8 + time * 0.5) * 0.2;
                } else if (effectType === 'pearl') {
                    // Layered nacre effect
                    localThickness += Math.sin(dx * 0.2 + time * 0.3) * Math.sin(dy * 0.15) * 0.15;
                }

                // Calculate interference color
                const interference = thinFilmColor(cosTheta, localThickness);

                // Fresnel reflection
                const fresnel = 0.04 + 0.96 * Math.pow(1 - cosTheta, 5);

                // Base color based on effect type
                let baseColor = { r: 0.1, g: 0.1, b: 0.15 };
                if (effectType === 'beetle') {
                    baseColor = { r: 0.1, g: 0.15, b: 0.1 };
                } else if (effectType === 'pearl') {
                    baseColor = { r: 0.9, g: 0.88, b: 0.85 };
                }

                // Combine base color with interference
                const iridescenceStrength = effectType === 'pearl' ? 0.3 : 0.7;
                let r = baseColor.r + interference.r * iridescenceStrength * fresnel;
                let g = baseColor.g + interference.g * iridescenceStrength * fresnel;
                let b = baseColor.b + interference.b * iridescenceStrength * fresnel;

                // Add specular
                const lightDir = normalize([1, -0.5, 1]);
                const halfVec = normalize([lightDir[0] + viewDir[0], lightDir[1] + viewDir[1], lightDir[2] + viewDir[2]]);
                const spec = Math.pow(Math.max(0, dot(normal, halfVec)), 64);
                r += spec * 0.5;
                g += spec * 0.5;
                b += spec * 0.5;

                const idx = (y * canvas.width + x) * 4;
                data[idx] = Math.min(255, Math.floor(r * 255));
                data[idx + 1] = Math.min(255, Math.floor(g * 255));
                data[idx + 2] = Math.min(255, Math.floor(b * 255));
                data[idx + 3] = 255;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    requestAnimationFrame(draw);
}

effectSelect.addEventListener('change', (e) => {
    effectType = e.target.value;
    const names = { bubble: '肥皂泡', oil: '油膜', beetle: '甲蟲殼', pearl: '珍珠' };
    infoEl.textContent = `效果: ${names[effectType]}`;
});

thicknessSlider.addEventListener('input', (e) => {
    filmThickness = parseInt(e.target.value) / 100;
    infoEl.textContent = `薄膜厚度: ${(filmThickness * 100).toFixed(0)}%`;
});

draw();
