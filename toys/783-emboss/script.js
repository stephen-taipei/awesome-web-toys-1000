const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const strengthInput = document.getElementById('strength');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw various shapes
    ctx.fillStyle = '#404040';
    ctx.beginPath();
    ctx.arc(100, 125, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#606060';
    ctx.fillRect(180, 75, 80, 100);

    ctx.fillStyle = '#505050';
    ctx.beginPath();
    ctx.moveTo(320, 175);
    ctx.lineTo(280, 75);
    ctx.lineTo(360, 75);
    ctx.fill();

    // Text
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#707070';
    ctx.fillText('浮雕', 140, 220);

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyEmboss();
}

function applyEmboss() {
    if (!originalData) return;

    const strength = parseInt(strengthInput.value);
    const data = originalData.data;
    const output = ctx.createImageData(canvas.width, canvas.height);

    const kernel = [
        [-strength, -strength, 0],
        [-strength, 1, strength],
        [0, strength, strength]
    ];

    for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
            let r = 0, g = 0, b = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * canvas.width + (x + kx)) * 4;
                    const weight = kernel[ky + 1][kx + 1];
                    r += data[idx] * weight;
                    g += data[idx + 1] * weight;
                    b += data[idx + 2] * weight;
                }
            }

            const idx = (y * canvas.width + x) * 4;
            output.data[idx] = Math.min(255, Math.max(0, r + 128));
            output.data[idx + 1] = Math.min(255, Math.max(0, g + 128));
            output.data[idx + 2] = Math.min(255, Math.max(0, b + 128));
            output.data[idx + 3] = 255;
        }
    }

    ctx.putImageData(output, 0, 0);
}

strengthInput.addEventListener('input', applyEmboss);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
