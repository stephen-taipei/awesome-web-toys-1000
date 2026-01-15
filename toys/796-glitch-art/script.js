const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const intensityInput = document.getElementById('intensity');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(0.5, '#34495e');
    gradient.addColorStop(1, '#2c3e50');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(100, 125, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3498db';
    ctx.fillRect(170, 75, 100, 100);

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(320, 50);
    ctx.lineTo(370, 200);
    ctx.lineTo(270, 200);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GLITCH', canvas.width/2, canvas.height/2 + 10);

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function applyGlitch() {
    if (!originalData) return;

    ctx.putImageData(originalData, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const intensity = parseInt(intensityInput.value);

    for (let i = 0; i < intensity * 3; i++) {
        const y = Math.floor(Math.random() * canvas.height);
        const sliceHeight = Math.floor(Math.random() * 20) + 5;
        const offset = (Math.random() - 0.5) * 50 * intensity;

        const slice = ctx.getImageData(0, y, canvas.width, sliceHeight);
        ctx.putImageData(slice, offset, y);
    }

    const newData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let i = 0; i < newData.length; i += 4) {
        if (Math.random() < 0.01 * intensity) {
            const shift = Math.floor(Math.random() * 30) * 4;
            if (i + shift < newData.length) {
                newData[i] = newData[i + shift];
            }
        }
    }

    for (let i = 0; i < intensity * 5; i++) {
        const x = Math.floor(Math.random() * canvas.width);
        const y = Math.floor(Math.random() * canvas.height);
        const w = Math.floor(Math.random() * 50) + 10;
        const h = Math.floor(Math.random() * 5) + 1;

        ctx.fillStyle = Math.random() > 0.5 ?
            `rgba(255,0,0,${Math.random() * 0.5})` :
            `rgba(0,255,255,${Math.random() * 0.5})`;
        ctx.fillRect(x, y, w, h);
    }

    for (let i = 0; i < intensity * 2; i++) {
        const y = Math.floor(Math.random() * canvas.height);
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`;
        ctx.fillRect(0, y, canvas.width, 1);
    }
}

document.getElementById('glitchBtn').addEventListener('click', applyGlitch);
document.getElementById('resetBtn').addEventListener('click', () => {
    if (originalData) ctx.putImageData(originalData, 0, 0);
});

generateImage();
