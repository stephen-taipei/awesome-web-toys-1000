const reference = document.getElementById('reference');
const canvas = document.getElementById('canvas');
const refCtx = reference.getContext('2d');
const ctx = canvas.getContext('2d');

reference.width = 170;
reference.height = 180;
canvas.width = 170;
canvas.height = 180;

function generateShape() {
    refCtx.fillStyle = '#fff';
    refCtx.fillRect(0, 0, reference.width, reference.height);

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    refCtx.strokeStyle = '#333';
    refCtx.lineWidth = 3;
    refCtx.lineCap = 'round';

    const shapes = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < shapes; i++) {
        const type = Math.floor(Math.random() * 3);

        if (type === 0) {
            // Circle
            refCtx.beginPath();
            refCtx.arc(
                40 + Math.random() * 90,
                40 + Math.random() * 100,
                20 + Math.random() * 30,
                0, Math.PI * 2
            );
            refCtx.stroke();
        } else if (type === 1) {
            // Rectangle
            refCtx.strokeRect(
                20 + Math.random() * 80,
                20 + Math.random() * 80,
                40 + Math.random() * 50,
                40 + Math.random() * 50
            );
        } else {
            // Triangle
            const cx = 50 + Math.random() * 70;
            const cy = 60 + Math.random() * 60;
            const size = 30 + Math.random() * 30;

            refCtx.beginPath();
            refCtx.moveTo(cx, cy - size);
            refCtx.lineTo(cx - size, cy + size * 0.6);
            refCtx.lineTo(cx + size, cy + size * 0.6);
            refCtx.closePath();
            refCtx.stroke();
        }
    }
}

let drawing = false;
let lastPos = null;

function draw(x, y) {
    if (lastPos) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    lastPos = { x, y };
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
canvas.addEventListener('mousemove', (e) => { if (drawing) { const pos = getPos(e); draw(pos.x, pos.y); } });
canvas.addEventListener('mouseup', () => { drawing = false; lastPos = null; });
canvas.addEventListener('mouseleave', () => { drawing = false; lastPos = null; });

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; lastPos = getPos(e); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (drawing) { const pos = getPos(e); draw(pos.x, pos.y); } });
canvas.addEventListener('touchend', () => { drawing = false; lastPos = null; });

document.getElementById('newBtn').addEventListener('click', generateShape);

generateShape();
