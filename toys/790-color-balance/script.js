const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cyanRedInput = document.getElementById('cyan-red');
const magentaGreenInput = document.getElementById('magenta-green');
const yellowBlueInput = document.getElementById('yellow-blue');

canvas.width = 370;
canvas.height = 200;

let originalData = null;

function generateImage() {
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const r = Math.floor(180 + Math.sin(x * 0.03) * 50);
            const g = Math.floor(150 + Math.cos(y * 0.04) * 50);
            const b = Math.floor(120 + Math.sin((x + y) * 0.02) * 50);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(50, 100, 80, 100);
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(90, 70, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.arc(200, 50, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(300, 100, 40, 0, Math.PI * 2);
    ctx.fill();

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function applyColorBalance() {
    if (!originalData) return;

    const imageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
    );
    const data = imageData.data;

    const cyanRed = cyanRedInput.value / 100;
    const magentaGreen = magentaGreenInput.value / 100;
    const yellowBlue = yellowBlueInput.value / 100;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        r = Math.min(255, Math.max(0, r + cyanRed * 50));
        g = Math.min(255, Math.max(0, g - cyanRed * 25));
        b = Math.min(255, Math.max(0, b - cyanRed * 25));

        r = Math.min(255, Math.max(0, r - magentaGreen * 25));
        g = Math.min(255, Math.max(0, g + magentaGreen * 50));
        b = Math.min(255, Math.max(0, b - magentaGreen * 25));

        r = Math.min(255, Math.max(0, r - yellowBlue * 25));
        g = Math.min(255, Math.max(0, g - yellowBlue * 25));
        b = Math.min(255, Math.max(0, b + yellowBlue * 50));

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }

    ctx.putImageData(imageData, 0, 0);
}

cyanRedInput.addEventListener('input', applyColorBalance);
magentaGreenInput.addEventListener('input', applyColorBalance);
yellowBlueInput.addEventListener('input', applyColorBalance);

document.getElementById('resetBtn').addEventListener('click', () => {
    cyanRedInput.value = 0;
    magentaGreenInput.value = 0;
    yellowBlueInput.value = 0;
    if (originalData) {
        ctx.putImageData(originalData, 0, 0);
    }
});

generateImage();
