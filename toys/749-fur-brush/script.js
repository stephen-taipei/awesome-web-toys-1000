const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('color');
const lengthInput = document.getElementById('length');

canvas.width = 370;
canvas.height = 280;

ctx.fillStyle = '#f5f5dc';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
let lastPos = null;

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function drawFur(x, y, lastX, lastY) {
    const rgb = hexToRgb(colorInput.value);
    const hairLength = parseInt(lengthInput.value);
    const moveAngle = lastX ? Math.atan2(y - lastY, x - lastX) : Math.random() * Math.PI * 2;

    for (let i = 0; i < 20; i++) {
        const offsetX = (Math.random() - 0.5) * 15;
        const offsetY = (Math.random() - 0.5) * 15;

        const hairAngle = moveAngle + (Math.random() - 0.5) * 1.5;
        const length = hairLength * (0.5 + Math.random() * 0.8);

        const endX = x + offsetX + Math.cos(hairAngle) * length;
        const endY = y + offsetY + Math.sin(hairAngle) * length;

        const variation = Math.floor(Math.random() * 60 - 30);
        ctx.strokeStyle = `rgba(${rgb.r + variation}, ${rgb.g + variation}, ${rgb.b + variation}, ${0.4 + Math.random() * 0.4})`;
        ctx.lineWidth = 0.5 + Math.random() * 0.5;

        ctx.beginPath();
        ctx.moveTo(x + offsetX, y + offsetY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
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

canvas.addEventListener('mousedown', (e) => { drawing = true; lastPos = getPos(e); drawFur(lastPos.x, lastPos.y, null, null); });
canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        const pos = getPos(e);
        drawFur(pos.x, pos.y, lastPos.x, lastPos.y);
        lastPos = pos;
    }
});
canvas.addEventListener('mouseup', () => { drawing = false; lastPos = null; });
canvas.addEventListener('mouseleave', () => { drawing = false; lastPos = null; });

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; lastPos = getPos(e); drawFur(lastPos.x, lastPos.y, null, null); });
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (drawing) {
        const pos = getPos(e);
        drawFur(pos.x, pos.y, lastPos.x, lastPos.y);
        lastPos = pos;
    }
});
canvas.addEventListener('touchend', () => { drawing = false; lastPos = null; });

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
