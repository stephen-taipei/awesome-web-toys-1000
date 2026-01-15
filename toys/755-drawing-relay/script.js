const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const inkLevelEl = document.getElementById('inkLevel');

canvas.width = 370;
canvas.height = 250;

let ink = 100;
let playerIndex = 0;
const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
let lastPos = null;

function draw(x, y) {
    if (ink <= 0) return;

    if (lastPos) {
        ctx.strokeStyle = colors[playerIndex % colors.length];
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.globalAlpha = Math.max(0.2, ink / 100);
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1;

        const dist = Math.sqrt((x - lastPos.x) ** 2 + (y - lastPos.y) ** 2);
        ink = Math.max(0, ink - dist * 0.1);
        inkLevelEl.textContent = Math.round(ink);

        if (ink <= 0) {
            inkLevelEl.style.color = '#e74c3c';
        }
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

document.getElementById('refillBtn').addEventListener('click', () => {
    playerIndex++;
    ink = 100;
    inkLevelEl.textContent = ink;
    inkLevelEl.style.color = '#1abc9c';
});
