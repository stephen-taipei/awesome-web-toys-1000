const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const brightnessInput = document.getElementById('brightness');
const brightVal = document.getElementById('brightVal');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    // Night scene
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * 150, 1 + Math.random(), 0, Math.PI * 2);
        ctx.fill();
    }

    // Moon
    ctx.fillStyle = '#f5f5dc';
    ctx.beginPath();
    ctx.arc(300, 60, 35, 0, Math.PI * 2);
    ctx.fill();

    // Buildings
    for (let i = 0; i < 8; i++) {
        const h = 80 + Math.random() * 100;
        ctx.fillStyle = `rgb(${30 + i * 5}, ${40 + i * 5}, ${50 + i * 5})`;
        ctx.fillRect(i * 50 - 10, canvas.height - h, 45, h);

        // Windows
        ctx.fillStyle = 'rgba(255, 220, 100, 0.7)';
        for (let y = canvas.height - h + 10; y < canvas.height - 10; y += 20) {
            for (let x = i * 50; x < i * 50 + 30; x += 15) {
                if (Math.random() > 0.3) {
                    ctx.fillRect(x, y, 8, 10);
                }
            }
        }
    }

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyBrightness();
}

function applyBrightness() {
    if (!originalData) return;

    const brightness = parseInt(brightnessInput.value);
    brightVal.textContent = brightness;

    const imageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
    );

    const adjustment = brightness * 2.55;

    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + adjustment));
        imageData.data[i + 1] = Math.min(255, Math.max(0, imageData.data[i + 1] + adjustment));
        imageData.data[i + 2] = Math.min(255, Math.max(0, imageData.data[i + 2] + adjustment));
    }

    ctx.putImageData(imageData, 0, 0);
}

brightnessInput.addEventListener('input', applyBrightness);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
