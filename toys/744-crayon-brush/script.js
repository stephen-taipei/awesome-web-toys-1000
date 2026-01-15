const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('color');
const sizeInput = document.getElementById('size');

canvas.width = 370;
canvas.height = 280;

ctx.fillStyle = '#fffef0';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
let lastPos = null;

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function drawCrayon(x, y, lastX, lastY) {
    const rgb = hexToRgb(colorInput.value);
    const size = parseInt(sizeInput.value);

    const dist = lastX ? Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2) : 0;
    const steps = Math.max(1, Math.floor(dist / 2));

    for (let s = 0; s < steps; s++) {
        const t = steps === 1 ? 1 : s / steps;
        const px = lastX ? lastX + (x - lastX) * t : x;
        const py = lastY ? lastY + (y - lastY) * t : y;

        // Crayon texture - irregular dots
        for (let i = 0; i < 15; i++) {
            const offsetX = (Math.random() - 0.5) * size;
            const offsetY = (Math.random() - 0.5) * size * 0.5;
            const variation = Math.floor(Math.random() * 40 - 20);

            ctx.fillStyle = `rgba(${rgb.r + variation}, ${rgb.g + variation}, ${rgb.b + variation}, ${0.4 + Math.random() * 0.4})`;
            ctx.beginPath();
            ctx.arc(px + offsetX, py + offsetY, Math.random() * 2 + 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
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

canvas.addEventListener('mousedown', (e) => { drawing = true; lastPos = getPos(e); drawCrayon(lastPos.x, lastPos.y, null, null); });
canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        const pos = getPos(e);
        drawCrayon(pos.x, pos.y, lastPos.x, lastPos.y);
        lastPos = pos;
    }
});
canvas.addEventListener('mouseup', () => { drawing = false; lastPos = null; });
canvas.addEventListener('mouseleave', () => { drawing = false; lastPos = null; });

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; lastPos = getPos(e); drawCrayon(lastPos.x, lastPos.y, null, null); });
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (drawing) {
        const pos = getPos(e);
        drawCrayon(pos.x, pos.y, lastPos.x, lastPos.y);
        lastPos = pos;
    }
});
canvas.addEventListener('touchend', () => { drawing = false; lastPos = null; });

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#fffef0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
