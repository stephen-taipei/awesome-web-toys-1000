const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const levelsInput = document.getElementById('levels');
const levelVal = document.getElementById('levelVal');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    // Smooth gradient background
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const r = Math.floor((x / canvas.width) * 255);
            const g = Math.floor((y / canvas.height) * 255);
            const b = Math.floor(((x + y) / (canvas.width + canvas.height)) * 255);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    // Add circles
    for (let i = 0; i < 8; i++) {
        const gradient = ctx.createRadialGradient(
            50 + i * 45, 125, 0,
            50 + i * 45, 125, 35
        );
        gradient.addColorStop(0, `hsl(${i * 45}, 100%, 70%)`);
        gradient.addColorStop(1, `hsl(${i * 45}, 100%, 30%)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(50 + i * 45, 125, 35, 0, Math.PI * 2);
        ctx.fill();
    }

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyPosterize();
}

function applyPosterize() {
    if (!originalData) return;

    const levels = parseInt(levelsInput.value);
    levelVal.textContent = levels;

    const imageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
    );

    const step = 255 / (levels - 1);

    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = Math.round(imageData.data[i] / step) * step;
        imageData.data[i + 1] = Math.round(imageData.data[i + 1] / step) * step;
        imageData.data[i + 2] = Math.round(imageData.data[i + 2] / step) * step;
    }

    ctx.putImageData(imageData, 0, 0);
}

levelsInput.addEventListener('input', applyPosterize);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
