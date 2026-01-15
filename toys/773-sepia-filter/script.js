const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sepiaInput = document.getElementById('sepia');
const sepiaVal = document.getElementById('sepiaVal');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    // Draw landscape-like scene
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#98D8AA');
    gradient.addColorStop(1, '#4A7C59');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(300, 50, 30, 0, Math.PI * 2);
    ctx.fill();

    // Trees
    for (let i = 0; i < 5; i++) {
        const x = 50 + i * 80;
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.moveTo(x, 180);
        ctx.lineTo(x + 25, 100);
        ctx.lineTo(x + 50, 180);
        ctx.fill();
    }

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applySepia();
}

function applySepia() {
    if (!originalData) return;

    const sepia = parseInt(sepiaInput.value) / 100;
    sepiaVal.textContent = Math.round(sepia * 100) + '%';

    const imageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
    );

    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        const sr = r * 0.393 + g * 0.769 + b * 0.189;
        const sg = r * 0.349 + g * 0.686 + b * 0.168;
        const sb = r * 0.272 + g * 0.534 + b * 0.131;

        imageData.data[i] = r + (sr - r) * sepia;
        imageData.data[i + 1] = g + (sg - g) * sepia;
        imageData.data[i + 2] = b + (sb - b) * sepia;
    }

    ctx.putImageData(imageData, 0, 0);
}

sepiaInput.addEventListener('input', applySepia);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
