const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const intensityInput = document.getElementById('intensity');
const sizeInput = document.getElementById('size');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const r = Math.floor(100 + Math.sin(x * 0.05) * 80 + Math.random() * 30);
            const g = Math.floor(150 + Math.cos(y * 0.04) * 60 + Math.random() * 30);
            const b = Math.floor(200 + Math.sin((x + y) * 0.03) * 55 + Math.random() * 30);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('風景照片', canvas.width / 2, canvas.height / 2 + 15);

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyVignette();
}

function applyVignette() {
    if (!originalData) return;

    const imageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
    );
    const data = imageData.data;

    const intensity = intensityInput.value / 100;
    const size = sizeInput.value / 100;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const normalized = dist / maxDist;

            let vignette = 1;
            if (normalized > size) {
                vignette = 1 - ((normalized - size) / (1 - size)) * intensity;
                vignette = Math.max(0, vignette);
            }

            const idx = (y * canvas.width + x) * 4;
            data[idx] = data[idx] * vignette;
            data[idx + 1] = data[idx + 1] * vignette;
            data[idx + 2] = data[idx + 2] * vignette;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

intensityInput.addEventListener('input', applyVignette);
sizeInput.addEventListener('input', applyVignette);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
