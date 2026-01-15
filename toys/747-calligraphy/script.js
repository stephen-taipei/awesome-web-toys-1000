const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('color');
const angleInput = document.getElementById('angle');
const angleVal = document.getElementById('angleVal');

canvas.width = 370;
canvas.height = 280;

ctx.fillStyle = '#f5f0e0';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
let lastPos = null;
let penAngle = 45;

function drawCalligraphy(x, y, lastX, lastY) {
    if (lastX === null) return;

    const color = colorInput.value;
    const rad = penAngle * Math.PI / 180;
    const penWidth = 15;

    const dx = x - lastX;
    const dy = y - lastY;
    const moveAngle = Math.atan2(dy, dx);

    // Width varies based on angle difference
    const angleDiff = Math.abs(Math.sin(moveAngle - rad));
    const currentWidth = penWidth * (0.2 + angleDiff * 0.8);

    const perpX = Math.cos(rad) * currentWidth;
    const perpY = Math.sin(rad) * currentWidth;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(lastX - perpX, lastY - perpY);
    ctx.lineTo(lastX + perpX, lastY + perpY);
    ctx.lineTo(x + perpX, y + perpY);
    ctx.lineTo(x - perpX, y - perpY);
    ctx.closePath();
    ctx.fill();
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

canvas.addEventListener('mousedown', (e) => { drawing = true; lastPos = getPos(e); });
canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        const pos = getPos(e);
        drawCalligraphy(pos.x, pos.y, lastPos.x, lastPos.y);
        lastPos = pos;
    }
});
canvas.addEventListener('mouseup', () => { drawing = false; lastPos = null; });
canvas.addEventListener('mouseleave', () => { drawing = false; lastPos = null; });

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; lastPos = getPos(e); });
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (drawing) {
        const pos = getPos(e);
        drawCalligraphy(pos.x, pos.y, lastPos.x, lastPos.y);
        lastPos = pos;
    }
});
canvas.addEventListener('touchend', () => { drawing = false; lastPos = null; });

angleInput.addEventListener('input', () => {
    penAngle = parseInt(angleInput.value);
    angleVal.textContent = penAngle + '°';
});

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#f5f0e0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
