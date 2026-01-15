const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const dotSizeInput = document.getElementById('dotSize');
const spacingInput = document.getElementById('spacing');

canvas.width = 370;
canvas.height = 280;

const tempCanvas = document.createElement('canvas');
tempCanvas.width = canvas.width;
tempCanvas.height = canvas.height;
const tempCtx = tempCanvas.getContext('2d');

function generateSource() {
    const gradient = tempCtx.createRadialGradient(185, 140, 0, 185, 140, 180);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(0.3, '#f39c12');
    gradient.addColorStop(0.6, '#e74c3c');
    gradient.addColorStop(1, '#000');
    tempCtx.fillStyle = gradient;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    tempCtx.fillStyle = '#fff';
    tempCtx.beginPath();
    tempCtx.arc(100, 100, 40, 0, Math.PI * 2);
    tempCtx.fill();

    tempCtx.fillStyle = '#3498db';
    tempCtx.fillRect(200, 100, 80, 80);
}

function generateDotMatrix() {
    generateSource();

    const dotSize = parseInt(dotSizeInput.value);
    const spacing = parseInt(spacingInput.value);
    const gridSize = dotSize + spacing;

    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sourceData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;

    for (let y = 0; y < canvas.height; y += gridSize) {
        for (let x = 0; x < canvas.width; x += gridSize) {
            let totalR = 0, totalG = 0, totalB = 0, count = 0;

            for (let dy = 0; dy < gridSize && y + dy < canvas.height; dy++) {
                for (let dx = 0; dx < gridSize && x + dx < canvas.width; dx++) {
                    const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
                    totalR += sourceData[idx];
                    totalG += sourceData[idx + 1];
                    totalB += sourceData[idx + 2];
                    count++;
                }
            }

            const avgR = totalR / count;
            const avgG = totalG / count;
            const avgB = totalB / count;
            const brightness = (avgR + avgG + avgB) / 3;

            const radius = (dotSize / 2) * (1 - brightness / 255);

            if (radius > 0.5) {
                ctx.fillStyle = `rgb(${Math.floor(avgR * 0.3)}, ${Math.floor(avgG * 0.3)}, ${Math.floor(avgB * 0.3)})`;
                ctx.beginPath();
                ctx.arc(x + gridSize / 2, y + gridSize / 2, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

dotSizeInput.addEventListener('input', generateDotMatrix);
spacingInput.addEventListener('input', generateDotMatrix);
document.getElementById('generateBtn').addEventListener('click', generateDotMatrix);

generateDotMatrix();
