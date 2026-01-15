const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const linesInput = document.getElementById('lines');
const variationInput = document.getElementById('variation');

canvas.width = 370;
canvas.height = 280;

function generateLineArt() {
    const numLines = parseInt(linesInput.value);
    const variation = parseInt(variationInput.value);

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const baseHue = Math.random() * 360;
    const frequency = 0.02 + Math.random() * 0.03;
    const phase = Math.random() * Math.PI * 2;

    for (let i = 0; i < numLines; i++) {
        const y = (i / numLines) * canvas.height;
        const hue = (baseHue + (i / numLines) * 60) % 360;

        ctx.strokeStyle = `hsla(${hue}, 70%, 50%, 0.6)`;
        ctx.lineWidth = 1 + Math.random();

        ctx.beginPath();

        for (let x = 0; x <= canvas.width; x += 2) {
            const noise = Math.sin(x * frequency + phase + i * 0.1) * variation;
            const noise2 = Math.sin(x * frequency * 2 + i * 0.2) * (variation / 2);
            const py = y + noise + noise2;

            if (x === 0) {
                ctx.moveTo(x, py);
            } else {
                ctx.lineTo(x, py);
            }
        }

        ctx.stroke();
    }

    ctx.globalCompositeOperation = 'multiply';

    for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `hsla(${(baseHue + 120 * i) % 360}, 50%, 60%, 0.2)`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        const startY = Math.random() * canvas.height;
        for (let x = 0; x <= canvas.width; x += 5) {
            const y = startY + Math.sin(x * 0.01 + i) * 100;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
}

linesInput.addEventListener('input', generateLineArt);
variationInput.addEventListener('input', generateLineArt);
document.getElementById('generateBtn').addEventListener('click', generateLineArt);

generateLineArt();
