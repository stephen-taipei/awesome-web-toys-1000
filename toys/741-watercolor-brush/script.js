const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('color');
const opacityInput = document.getElementById('opacity');

canvas.width = 370;
canvas.height = 280;

ctx.fillStyle = '#fafafa';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function drawWatercolor(x, y) {
    const rgb = hexToRgb(colorInput.value);
    const opacity = parseInt(opacityInput.value) / 100;
    const baseSize = 20;

    for (let i = 0; i < 5; i++) {
        const offsetX = (Math.random() - 0.5) * 15;
        const offsetY = (Math.random() - 0.5) * 15;
        const size = baseSize + Math.random() * 15;
        const alpha = opacity * (0.3 + Math.random() * 0.4);

        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
        ctx.fill();
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

canvas.addEventListener('mousedown', (e) => { drawing = true; drawWatercolor(getPos(e).x, getPos(e).y); });
canvas.addEventListener('mousemove', (e) => { if (drawing) drawWatercolor(getPos(e).x, getPos(e).y); });
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; drawWatercolor(getPos(e).x, getPos(e).y); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (drawing) drawWatercolor(getPos(e).x, getPos(e).y); });
canvas.addEventListener('touchend', () => drawing = false);

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
