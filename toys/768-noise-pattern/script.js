const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scaleInput = document.getElementById('scale');

canvas.width = 370;
canvas.height = 280;

// Simple value noise
const permutation = [];
for (let i = 0; i < 256; i++) permutation[i] = Math.floor(Math.random() * 256);

function noise(x, y) {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);

    const aa = permutation[(permutation[xi] + yi) & 255];
    const ab = permutation[(permutation[xi] + yi + 1) & 255];
    const ba = permutation[(permutation[xi + 1] + yi) & 255];
    const bb = permutation[(permutation[xi + 1] + yi + 1) & 255];

    const x1 = aa + u * (ba - aa);
    const x2 = ab + u * (bb - ab);

    return (x1 + v * (x2 - x1)) / 255;
}

function generate() {
    const scale = parseInt(scaleInput.value);
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const seed = Math.random() * 1000;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const nx = (x + seed) / scale;
            const ny = (y + seed) / scale;

            const value = noise(nx, ny);
            const idx = (y * canvas.width + x) * 4;

            // Earth tones
            const r = Math.floor(100 + value * 100);
            const g = Math.floor(80 + value * 80);
            const b = Math.floor(60 + value * 60);

            imageData.data[idx] = r;
            imageData.data[idx + 1] = g;
            imageData.data[idx + 2] = b;
            imageData.data[idx + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

document.getElementById('generateBtn').addEventListener('click', generate);
scaleInput.addEventListener('input', generate);

generate();
