const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('color');
const sizeInput = document.getElementById('size');

canvas.width = 370;
canvas.height = 280;

ctx.fillStyle = '#f5f0e6';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
let lastPos = null;

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function drawOilStroke(x, y) {
    const rgb = hexToRgb(colorInput.value);
    const size = parseInt(sizeInput.value);

    // Draw multiple bristle marks
    for (let i = 0; i < 8; i++) {
        const offsetX = (Math.random() - 0.5) * size * 0.8;
        const offsetY = (Math.random() - 0.5) * size * 0.3;
        const bristleW = size * 0.15 + Math.random() * 3;
        const bristleH = size * 0.6 + Math.random() * size * 0.3;

        const variation = Math.floor(Math.random() * 30 - 15);
        ctx.fillStyle = `rgb(${rgb.r + variation}, ${rgb.g + variation}, ${rgb.b + variation})`;

        ctx.save();
        ctx.translate(x + offsetX, y + offsetY);
        ctx.rotate(Math.random() * 0.3 - 0.15);

        ctx.beginPath();
        ctx.ellipse(0, 0, bristleW, bristleH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

canvas.addEventListener('mousedown', (e) => { drawing = true; lastPos = getPos(e); drawOilStroke(lastPos.x, lastPos.y); });
canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        const pos = getPos(e);
        drawOilStroke(pos.x, pos.y);
        lastPos = pos;
    }
});
canvas.addEventListener('mouseup', () => { drawing = false; lastPos = null; });
canvas.addEventListener('mouseleave', () => { drawing = false; lastPos = null; });

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; lastPos = getPos(e); drawOilStroke(lastPos.x, lastPos.y); });
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (drawing) {
        const pos = getPos(e);
        drawOilStroke(pos.x, pos.y);
        lastPos = pos;
    }
});
canvas.addEventListener('touchend', () => { drawing = false; lastPos = null; });

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
