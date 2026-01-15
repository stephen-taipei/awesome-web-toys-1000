const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorsInput = document.getElementById('colors');
const colorCountSpan = document.getElementById('colorCount');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const r = Math.floor(Math.sin(x * 0.02) * 127 + 128);
            const g = Math.floor(Math.cos(y * 0.03) * 127 + 128);
            const b = Math.floor(Math.sin((x + y) * 0.015) * 127 + 128);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    const gradient = ctx.createRadialGradient(185, 125, 0, 185, 125, 120);
    gradient.addColorStop(0, 'rgba(255,255,0,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,0,128,0.6)');
    gradient.addColorStop(1, 'rgba(0,128,255,0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    quantize();
}

function quantize() {
    if (!originalData) return;

    const numColors = parseInt(colorsInput.value);
    const imageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
    );
    const data = imageData.data;

    const levels = Math.ceil(Math.pow(numColors, 1/3));
    const step = 255 / (levels - 1);

    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.round(data[i] / step) * step;
        data[i + 1] = Math.round(data[i + 1] / step) * step;
        data[i + 2] = Math.round(data[i + 2] / step) * step;
    }

    ctx.putImageData(imageData, 0, 0);
}

colorsInput.addEventListener('input', () => {
    colorCountSpan.textContent = colorsInput.value;
    quantize();
});

document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
