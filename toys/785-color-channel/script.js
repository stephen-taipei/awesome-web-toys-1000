const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 250;

let originalData = null;
let channel = 'all';

function generateImage() {
    // Colorful image
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const r = Math.floor(Math.sin(x * 0.05) * 127 + 128);
            const g = Math.floor(Math.sin(y * 0.05) * 127 + 128);
            const b = Math.floor(Math.sin((x + y) * 0.03) * 127 + 128);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    // Add some shapes
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(80, 125, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00ff00';
    ctx.fillRect(150, 85, 70, 80);

    ctx.fillStyle = '#0000ff';
    ctx.beginPath();
    ctx.arc(290, 125, 40, 0, Math.PI * 2);
    ctx.fill();

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyChannel();
}

function applyChannel() {
    if (!originalData) return;

    const imageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
    );

    for (let i = 0; i < imageData.data.length; i += 4) {
        if (channel === 'red') {
            imageData.data[i + 1] = 0;
            imageData.data[i + 2] = 0;
        } else if (channel === 'green') {
            imageData.data[i] = 0;
            imageData.data[i + 2] = 0;
        } else if (channel === 'blue') {
            imageData.data[i] = 0;
            imageData.data[i + 1] = 0;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

document.querySelectorAll('.controls button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.controls button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        channel = btn.id;
        applyChannel();
    });
});

document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
