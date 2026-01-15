const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const thresholdInput = document.getElementById('threshold');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw shapes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(100, 125, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#666';
    ctx.fillRect(180, 75, 80, 100);

    ctx.fillStyle = '#999';
    ctx.beginPath();
    ctx.moveTo(320, 175);
    ctx.lineTo(280, 75);
    ctx.lineTo(360, 75);
    ctx.fill();

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyEdgeDetect();
}

function applyEdgeDetect() {
    if (!originalData) return;

    const threshold = parseInt(thresholdInput.value);
    const data = originalData.data;
    const output = ctx.createImageData(canvas.width, canvas.height);

    const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

    for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
            let gx = 0, gy = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * canvas.width + (x + kx)) * 4;
                    const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    gx += gray * sobelX[ky + 1][kx + 1];
                    gy += gray * sobelY[ky + 1][kx + 1];
                }
            }

            const magnitude = Math.sqrt(gx * gx + gy * gy);
            const idx = (y * canvas.width + x) * 4;
            const edge = magnitude > threshold ? 255 : 0;

            output.data[idx] = edge;
            output.data[idx + 1] = edge;
            output.data[idx + 2] = edge;
            output.data[idx + 3] = 255;
        }
    }

    ctx.putImageData(output, 0, 0);
}

thresholdInput.addEventListener('input', applyEdgeDetect);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
