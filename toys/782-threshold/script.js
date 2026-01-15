const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const thresholdInput = document.getElementById('threshold');
const threshVal = document.getElementById('threshVal');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    // Create gradient with smooth transitions
    for (let x = 0; x < canvas.width; x++) {
        const gray = Math.floor((x / canvas.width) * 255);
        ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
        ctx.fillRect(x, 0, 1, canvas.height);
    }

    // Add some shapes with gradients
    const gradient = ctx.createRadialGradient(185, 125, 0, 185, 125, 100);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#000');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(185, 125, 80, 0, Math.PI * 2);
    ctx.fill();

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyThreshold();
}

function applyThreshold() {
    if (!originalData) return;

    const threshold = parseInt(thresholdInput.value);
    threshVal.textContent = threshold;

    const imageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
    );

    for (let i = 0; i < imageData.data.length; i += 4) {
        const gray = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        const value = gray > threshold ? 255 : 0;

        imageData.data[i] = value;
        imageData.data[i + 1] = value;
        imageData.data[i + 2] = value;
    }

    ctx.putImageData(imageData, 0, 0);
}

thresholdInput.addEventListener('input', applyThreshold);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
