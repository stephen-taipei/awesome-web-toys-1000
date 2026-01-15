const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const invertInput = document.getElementById('invert');
const invertVal = document.getElementById('invertVal');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#e74c3c');
    gradient.addColorStop(0.5, '#3498db');
    gradient.addColorStop(1, '#2ecc71');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add shapes
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(100, 125, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9b59b6';
    ctx.fillRect(200, 75, 100, 100);

    ctx.fillStyle = '#1abc9c';
    ctx.beginPath();
    ctx.moveTo(320, 175);
    ctx.lineTo(280, 75);
    ctx.lineTo(360, 75);
    ctx.fill();

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyInvert();
}

function applyInvert() {
    if (!originalData) return;

    const invert = parseInt(invertInput.value) / 100;
    invertVal.textContent = Math.round(invert * 100) + '%';

    const imageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
    );

    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        imageData.data[i] = r + (255 - 2 * r) * invert;
        imageData.data[i + 1] = g + (255 - 2 * g) * invert;
        imageData.data[i + 2] = b + (255 - 2 * b) * invert;
    }

    ctx.putImageData(imageData, 0, 0);
}

invertInput.addEventListener('input', applyInvert);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
