const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const contrastInput = document.getElementById('contrast');
const contrastVal = document.getElementById('contrastVal');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    // Gradient background
    for (let i = 0; i < canvas.width; i++) {
        const gray = Math.floor((i / canvas.width) * 255);
        ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
        ctx.fillRect(i, 0, 1, canvas.height);
    }

    // Colored bands
    const colors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6'];
    colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(20, 30 + i * 40, canvas.width - 40, 30);
    });

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyContrast();
}

function applyContrast() {
    if (!originalData) return;

    const contrast = parseInt(contrastInput.value);
    contrastVal.textContent = contrast;

    const imageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
    );

    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = Math.min(255, Math.max(0, factor * (imageData.data[i] - 128) + 128));
        imageData.data[i + 1] = Math.min(255, Math.max(0, factor * (imageData.data[i + 1] - 128) + 128));
        imageData.data[i + 2] = Math.min(255, Math.max(0, factor * (imageData.data[i + 2] - 128) + 128));
    }

    ctx.putImageData(imageData, 0, 0);
}

contrastInput.addEventListener('input', applyContrast);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
