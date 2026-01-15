const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const segmentsInput = document.getElementById('segments');
const segVal = document.getElementById('segVal');

canvas.width = 370;
canvas.height = 280;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

let drawing = false;
let segments = 6;

function drawPoint(x, y) {
    const dx = x - centerX;
    const dy = y - centerY;
    const angle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angleStep = (Math.PI * 2) / segments;

    ctx.fillStyle = '#e91e63';

    for (let i = 0; i < segments; i++) {
        const newAngle = angle + angleStep * i;
        const nx = centerX + Math.cos(newAngle) * dist;
        const ny = centerY + Math.sin(newAngle) * dist;

        ctx.beginPath();
        ctx.arc(nx, ny, 2, 0, Math.PI * 2);
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

canvas.addEventListener('mousedown', (e) => { drawing = true; const pos = getPos(e); drawPoint(pos.x, pos.y); });
canvas.addEventListener('mousemove', (e) => { if (drawing) { const pos = getPos(e); drawPoint(pos.x, pos.y); } });
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; const pos = getPos(e); drawPoint(pos.x, pos.y); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (drawing) { const pos = getPos(e); drawPoint(pos.x, pos.y); } });
canvas.addEventListener('touchend', () => drawing = false);

segmentsInput.addEventListener('input', () => {
    segments = parseInt(segmentsInput.value);
    segVal.textContent = segments;
});

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
