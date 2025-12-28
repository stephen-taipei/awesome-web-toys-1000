const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const exposureSlider = document.getElementById('exposureSlider');
const toneMapSelect = document.getElementById('toneMap');
const infoEl = document.getElementById('info');

let exposure = 0; // EV stops
let toneMapMode = 'reinhard';
let time = 0;

// HDR scene - values can exceed 1.0
const lights = [
    { x: 180, y: 60, intensity: 50, color: { r: 1, g: 0.95, b: 0.8 } }, // Sun
    { x: 80, y: 180, intensity: 3, color: { r: 1, g: 0.3, b: 0.1 } },   // Lamp 1
    { x: 280, y: 180, intensity: 3, color: { r: 0.1, g: 0.5, b: 1 } }   // Lamp 2
];

// Objects in scene
const objects = [
    { type: 'ground', y: 200 },
    { type: 'cube', x: 120, y: 180, size: 40 },
    { type: 'sphere', x: 240, y: 170, radius: 30 },
    { type: 'wall', x: 0, y: 80, width: 360, height: 120 }
];

// Tone mapping functions
function reinhardToneMap(hdr) {
    return hdr / (1 + hdr);
}

function acesToneMap(hdr) {
    const a = 2.51;
    const b = 0.03;
    const c = 2.43;
    const d = 0.59;
    const e = 0.14;
    return Math.max(0, Math.min(1, (hdr * (a * hdr + b)) / (hdr * (c * hdr + d) + e)));
}

function linearToneMap(hdr) {
    return Math.min(1, hdr);
}

function toneMap(hdr) {
    switch (toneMapMode) {
        case 'reinhard': return reinhardToneMap(hdr);
        case 'aces': return acesToneMap(hdr);
        default: return linearToneMap(hdr);
    }
}

function applyExposure(value) {
    return value * Math.pow(2, exposure);
}

function calculateLighting(x, y) {
    let r = 0.02, g = 0.02, b = 0.03; // Ambient

    lights.forEach((light, i) => {
        const dx = x - light.x;
        const dy = y - light.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const falloff = light.intensity / (1 + dist * 0.01 + dist * dist * 0.0001);

        // Add pulsing for lamps
        let pulse = 1;
        if (i > 0) {
            pulse = 0.8 + 0.2 * Math.sin(time * 3 + i * 2);
        }

        r += light.color.r * falloff * pulse;
        g += light.color.g * falloff * pulse;
        b += light.color.b * falloff * pulse;
    });

    return { r, g, b };
}

function hdrToRgb(hdr) {
    // Apply exposure
    const exposed = {
        r: applyExposure(hdr.r),
        g: applyExposure(hdr.g),
        b: applyExposure(hdr.b)
    };

    // Tone map
    const mapped = {
        r: toneMap(exposed.r),
        g: toneMap(exposed.g),
        b: toneMap(exposed.b)
    };

    // Gamma correction
    const gamma = 2.2;
    return {
        r: Math.floor(Math.pow(mapped.r, 1/gamma) * 255),
        g: Math.floor(Math.pow(mapped.g, 1/gamma) * 255),
        b: Math.floor(Math.pow(mapped.b, 1/gamma) * 255)
    };
}

function drawScene() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    // Render HDR scene
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            let hdr = calculateLighting(x, y);

            // Ground reflection
            if (y > 200) {
                const reflectY = 200 - (y - 200);
                const reflectHdr = calculateLighting(x, reflectY);
                const reflectAmount = 0.3 * (1 - (y - 200) / 80);
                hdr.r = hdr.r * 0.3 + reflectHdr.r * reflectAmount;
                hdr.g = hdr.g * 0.3 + reflectHdr.g * reflectAmount;
                hdr.b = hdr.b * 0.3 + reflectHdr.b * reflectAmount;
            }

            const rgb = hdrToRgb(hdr);
            const idx = (y * canvas.width + x) * 4;
            data[idx] = rgb.r;
            data[idx + 1] = rgb.g;
            data[idx + 2] = rgb.b;
            data[idx + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw light sources
    lights.forEach((light, i) => {
        const rgb = hdrToRgb({ r: light.intensity * light.color.r, g: light.intensity * light.color.g, b: light.intensity * light.color.b });

        // Bloom/glow
        for (let layer = 5; layer >= 1; layer--) {
            const size = (i === 0 ? 40 : 20) + layer * 10;
            const gradient = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, size);
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.3/layer})`);
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(light.x, light.y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Core
        ctx.beginPath();
        ctx.arc(light.x, light.y, i === 0 ? 15 : 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${Math.min(255, rgb.r + 50)}, ${Math.min(255, rgb.g + 50)}, ${Math.min(255, rgb.b + 50)})`;
        ctx.fill();
    });

    // Objects silhouettes
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

    // Cube
    ctx.fillRect(100, 160, 40, 40);

    // Sphere
    ctx.beginPath();
    ctx.arc(240, 170, 30, 0, Math.PI * 2);
    ctx.fill();

    // EV indicator
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`EV: ${exposure >= 0 ? '+' : ''}${exposure.toFixed(1)}`, canvas.width - 10, 20);
}

function draw() {
    time += 0.016;
    drawScene();
    requestAnimationFrame(draw);
}

exposureSlider.addEventListener('input', (e) => {
    exposure = parseFloat(e.target.value);
    infoEl.textContent = `曝光值: ${exposure >= 0 ? '+' : ''}${exposure.toFixed(1)} EV`;
});

toneMapSelect.addEventListener('change', (e) => {
    toneMapMode = e.target.value;
    const names = { reinhard: 'Reinhard', aces: 'ACES', linear: '線性' };
    infoEl.textContent = `色調映射: ${names[toneMapMode]}`;
});

draw();
