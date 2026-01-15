const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const saturateInput = document.getElementById('saturate');
const satVal = document.getElementById('satVal');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    // Colorful flowers
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 200, canvas.width, 50);

    const flowerColors = ['#e91e63', '#ff5722', '#ffeb3b', '#9c27b0', '#3f51b5'];

    for (let i = 0; i < 12; i++) {
        const cx = 30 + Math.random() * (canvas.width - 60);
        const cy = 60 + Math.random() * 120;
        const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];

        // Petals
        for (let j = 0; j < 6; j++) {
            const angle = (j / 6) * Math.PI * 2;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(
                cx + Math.cos(angle) * 15,
                cy + Math.sin(angle) * 15,
                12, 8, angle, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Center
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applySaturate();
}

function applySaturate() {
    if (!originalData) return;

    const saturate = parseInt(saturateInput.value) / 100;
    satVal.textContent = Math.round(saturate * 100) + '%';

    const imageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
    );

    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const gray = r * 0.299 + g * 0.587 + b * 0.114;

        imageData.data[i] = gray + (r - gray) * saturate;
        imageData.data[i + 1] = gray + (g - gray) * saturate;
        imageData.data[i + 2] = gray + (b - gray) * saturate;
    }

    ctx.putImageData(imageData, 0, 0);
}

saturateInput.addEventListener('input', applySaturate);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
