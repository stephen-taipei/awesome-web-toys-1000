const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const grayInput = document.getElementById('gray');
const grayVal = document.getElementById('grayVal');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    for (let y = 0; y < canvas.height; y += 30) {
        for (let x = 0; x < canvas.width; x += 30) {
            ctx.fillStyle = `hsl(${Math.random() * 360}, 80%, 50%)`;
            ctx.beginPath();
            ctx.arc(x + 15, y + 15, 12, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyGrayscale();
}

function applyGrayscale() {
    if (!originalData) return;

    const gray = parseInt(grayInput.value) / 100;
    grayVal.textContent = Math.round(gray * 100) + '%';

    const imageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
    );

    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const grayValue = r * 0.299 + g * 0.587 + b * 0.114;

        imageData.data[i] = r + (grayValue - r) * gray;
        imageData.data[i + 1] = g + (grayValue - g) * gray;
        imageData.data[i + 2] = b + (grayValue - b) * gray;
    }

    ctx.putImageData(imageData, 0, 0);
}

grayInput.addEventListener('input', applyGrayscale);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
