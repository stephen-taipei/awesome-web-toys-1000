const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('color');
const glowInput = document.getElementById('glow');

canvas.width = 370;
canvas.height = 280;

ctx.fillStyle = '#0a0a0a';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
let lastPos = null;

function drawNeon(x, y, lastX, lastY) {
    const color = colorInput.value;
    const glow = parseInt(glowInput.value);

    if (lastX !== null) {
        // Glow layers
        for (let i = 3; i >= 0; i--) {
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2 + i * 2;
            ctx.lineCap = 'round';
            ctx.shadowColor = color;
            ctx.shadowBlur = glow * (4 - i) / 2;
            ctx.globalAlpha = 0.3;
            ctx.stroke();
        }

        // Core line
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
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

canvas.addEventListener('mousedown', (e) => { drawing = true; lastPos = getPos(e); });
canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        const pos = getPos(e);
        drawNeon(pos.x, pos.y, lastPos.x, lastPos.y);
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
        drawNeon(pos.x, pos.y, lastPos.x, lastPos.y);
        lastPos = pos;
    }
});
canvas.addEventListener('touchend', () => { drawing = false; lastPos = null; });

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
