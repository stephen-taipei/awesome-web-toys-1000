const original = document.getElementById('original');
const traced = document.getElementById('traced');
const origCtx = original.getContext('2d');
const tracedCtx = traced.getContext('2d');
const thresholdInput = document.getElementById('threshold');

const size = 150;
original.width = size;
original.height = size;
traced.width = size;
traced.height = size;

function generateShape() {
    origCtx.fillStyle = '#fff';
    origCtx.fillRect(0, 0, size, size);

    // Draw random shapes
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];

    for (let i = 0; i < 3; i++) {
        origCtx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        const shapeType = Math.floor(Math.random() * 2);

        if (shapeType === 0) {
            const x = 20 + Math.random() * (size - 60);
            const y = 20 + Math.random() * (size - 60);
            origCtx.fillRect(x, y, 30 + Math.random() * 30, 30 + Math.random() * 30);
        } else {
            origCtx.beginPath();
            origCtx.arc(30 + Math.random() * (size - 60), 30 + Math.random() * (size - 60), 15 + Math.random() * 25, 0, Math.PI * 2);
            origCtx.fill();
        }
    }

    trace();
}

function trace() {
    const threshold = parseInt(thresholdInput.value);
    const imageData = origCtx.getImageData(0, 0, size, size);
    const data = imageData.data;

    tracedCtx.fillStyle = '#fff';
    tracedCtx.fillRect(0, 0, size, size);

    const output = tracedCtx.createImageData(size, size);

    // Sobel edge detection
    const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

    for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
            let gx = 0, gy = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * size + (x + kx)) * 4;
                    const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    gx += gray * sobelX[ky + 1][kx + 1];
                    gy += gray * sobelY[ky + 1][kx + 1];
                }
            }

            const magnitude = Math.sqrt(gx * gx + gy * gy);
            const idx = (y * size + x) * 4;
            const edge = magnitude > threshold ? 0 : 255;

            output.data[idx] = edge;
            output.data[idx + 1] = edge;
            output.data[idx + 2] = edge;
            output.data[idx + 3] = 255;
        }
    }

    tracedCtx.putImageData(output, 0, 0);
}

thresholdInput.addEventListener('input', trace);
document.getElementById('generateBtn').addEventListener('click', generateShape);

generateShape();
