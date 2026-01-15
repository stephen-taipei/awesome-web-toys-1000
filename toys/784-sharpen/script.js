const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sharpenInput = document.getElementById('sharpen');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    // Slightly blurred colorful scene
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.5, '#4ecdc4');
    gradient.addColorStop(1, '#45b7d1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add soft shapes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(100, 100, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(180, 60, 100, 130);

    ctx.fillStyle = 'rgba(255, 200, 100, 0.6)';
    ctx.beginPath();
    ctx.arc(300, 150, 50, 0, Math.PI * 2);
    ctx.fill();

    // Apply slight blur to original
    ctx.filter = 'blur(1px)';
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applySharpen();
}

function applySharpen() {
    if (!originalData) return;

    const amount = parseInt(sharpenInput.value) / 5;
    const data = originalData.data;
    const output = ctx.createImageData(canvas.width, canvas.height);

    for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
            const idx = (y * canvas.width + x) * 4;

            for (let c = 0; c < 3; c++) {
                const top = ((y - 1) * canvas.width + x) * 4 + c;
                const bottom = ((y + 1) * canvas.width + x) * 4 + c;
                const left = (y * canvas.width + (x - 1)) * 4 + c;
                const right = (y * canvas.width + (x + 1)) * 4 + c;
                const center = idx + c;

                const blur = (data[top] + data[bottom] + data[left] + data[right]) / 4;
                const sharp = data[center] + (data[center] - blur) * amount;

                output.data[idx + c] = Math.min(255, Math.max(0, sharp));
            }
            output.data[idx + 3] = 255;
        }
    }

    ctx.putImageData(output, 0, 0);
}

sharpenInput.addEventListener('input', applySharpen);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
