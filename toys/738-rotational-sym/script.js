const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const foldsInput = document.getElementById('folds');
const foldVal = document.getElementById('foldVal');

canvas.width = 370;
canvas.height = 280;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

let drawing = false;
let folds = 4;
let lastPos = null;

function drawLine(x1, y1, x2, y2) {
    const angleStep = (Math.PI * 2) / folds;

    ctx.strokeStyle = '#e91e63';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    for (let i = 0; i < folds; i++) {
        const angle = angleStep * i;

        const dx1 = x1 - centerX, dy1 = y1 - centerY;
        const dx2 = x2 - centerX, dy2 = y2 - centerY;

        const nx1 = centerX + dx1 * Math.cos(angle) - dy1 * Math.sin(angle);
        const ny1 = centerY + dx1 * Math.sin(angle) + dy1 * Math.cos(angle);
        const nx2 = centerX + dx2 * Math.cos(angle) - dy2 * Math.sin(angle);
        const ny2 = centerY + dx2 * Math.sin(angle) + dy2 * Math.cos(angle);

        ctx.beginPath();
        ctx.moveTo(nx1, ny1);
        ctx.lineTo(nx2, ny2);
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
    if (drawing && lastPos) {
        const pos = getPos(e);
        drawLine(lastPos.x, lastPos.y, pos.x, pos.y);
        lastPos = pos;
    }
});
canvas.addEventListener('mouseup', () => { drawing = false; lastPos = null; });
canvas.addEventListener('mouseleave', () => { drawing = false; lastPos = null; });

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; lastPos = getPos(e); });
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (drawing && lastPos) {
        const pos = getPos(e);
        drawLine(lastPos.x, lastPos.y, pos.x, pos.y);
        lastPos = pos;
    }
});
canvas.addEventListener('touchend', () => { drawing = false; lastPos = null; });

foldsInput.addEventListener('input', () => {
    folds = parseInt(foldsInput.value);
    foldVal.textContent = folds;
});

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
