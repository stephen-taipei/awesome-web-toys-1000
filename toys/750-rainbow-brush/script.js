const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sizeInput = document.getElementById('size');
const speedInput = document.getElementById('speed');

canvas.width = 370;
canvas.height = 280;

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
let lastPos = null;
let hue = 0;

function drawRainbow(x, y, lastX, lastY) {
    if (lastX === null) return;

    const size = parseInt(sizeInput.value);
    const speed = parseInt(speedInput.value);

    ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    hue = (hue + speed) % 360;
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
        drawRainbow(pos.x, pos.y, lastPos.x, lastPos.y);
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
        drawRainbow(pos.x, pos.y, lastPos.x, lastPos.y);
        lastPos = pos;
    }
});
canvas.addEventListener('touchend', () => { drawing = false; lastPos = null; });

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
