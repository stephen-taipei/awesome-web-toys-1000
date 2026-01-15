const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 250;

let cleanData = null;

function generateImage() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#3498db');
    gradient.addColorStop(0.5, '#9b59b6');
    gradient.addColorStop(1, '#e74c3c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(100, 125, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(180, 75, 100, 100);

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(330, 75);
    ctx.lineTo(370, 175);
    ctx.lineTo(290, 175);
    ctx.closePath();
    ctx.fill();

    cleanData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function addNoise() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < 0.1) {
            const noise = Math.random() < 0.5 ? 0 : 255;
            data[i] = noise;
            data[i + 1] = noise;
            data[i + 2] = noise;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function medianFilter(radius) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    const width = canvas.width;
    const height = canvas.height;

    for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
            const reds = [], greens = [], blues = [];

            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const idx = ((y + dy) * width + (x + dx)) * 4;
                    reds.push(data[idx]);
                    greens.push(data[idx + 1]);
                    blues.push(data[idx + 2]);
                }
            }

            reds.sort((a, b) => a - b);
            greens.sort((a, b) => a - b);
            blues.sort((a, b) => a - b);

            const mid = Math.floor(reds.length / 2);
            const idx = (y * width + x) * 4;
            output[idx] = reds[mid];
            output[idx + 1] = greens[mid];
            output[idx + 2] = blues[mid];
        }
    }

    imageData.data.set(output);
    ctx.putImageData(imageData, 0, 0);
}

document.getElementById('addNoise').addEventListener('click', addNoise);
document.getElementById('reduce').addEventListener('click', () => {
    const strength = parseInt(document.getElementById('strength').value);
    medianFilter(strength);
});
document.getElementById('reset').addEventListener('click', () => {
    if (cleanData) {
        ctx.putImageData(cleanData, 0, 0);
    }
});

generateImage();
