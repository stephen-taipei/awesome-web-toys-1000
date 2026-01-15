const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pixelInput = document.getElementById('pixel');
const pixelVal = document.getElementById('pixelVal');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    // Gradient sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 150);
    skyGradient.addColorStop(0, '#1e90ff');
    skyGradient.addColorStop(1, '#87ceeb');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, 150);

    // Sun
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(300, 50, 30, 0, Math.PI * 2);
    ctx.fill();

    // Ground
    ctx.fillStyle = '#228b22';
    ctx.fillRect(0, 150, canvas.width, 100);

    // House
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(100, 100, 120, 100);
    ctx.fillStyle = '#dc143c';
    ctx.beginPath();
    ctx.moveTo(90, 100);
    ctx.lineTo(160, 40);
    ctx.lineTo(230, 100);
    ctx.fill();

    // Door
    ctx.fillStyle = '#4a2c0a';
    ctx.fillRect(145, 150, 30, 50);

    // Window
    ctx.fillStyle = '#add8e6';
    ctx.fillRect(110, 120, 25, 25);
    ctx.fillRect(185, 120, 25, 25);

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyPixelate();
}

function applyPixelate() {
    if (!originalData) return;

    const pixelSize = parseInt(pixelInput.value);
    pixelVal.textContent = pixelSize;

    if (pixelSize === 1) {
        ctx.putImageData(originalData, 0, 0);
        return;
    }

    ctx.putImageData(originalData, 0, 0);

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = Math.ceil(canvas.width / pixelSize);
    tempCanvas.height = Math.ceil(canvas.height / pixelSize);

    tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
}

pixelInput.addEventListener('input', applyPixelate);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
