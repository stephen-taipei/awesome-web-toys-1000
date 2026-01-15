const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const mirrorsInput = document.getElementById('mirrors');
const mirrorVal = document.getElementById('mirrorVal');

canvas.width = 300;
canvas.height = 300;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

let drawing = false;
let mirrors = 6;
let hue = 0;

function drawPoint(x, y) {
    const dx = x - centerX;
    const dy = y - centerY;
    const angle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angleStep = (Math.PI * 2) / mirrors;

    ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
    hue = (hue + 2) % 360;

    for (let i = 0; i < mirrors; i++) {
        const newAngle = angleStep * i + angle;
        const nx = centerX + Math.cos(newAngle) * dist;
        const ny = centerY + Math.sin(newAngle) * dist;

        ctx.beginPath();
        ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fill();

        // Mirror reflection
        const mirrorAngle = angleStep * i - angle;
        const mx = centerX + Math.cos(mirrorAngle) * dist;
        const my = centerY + Math.sin(mirrorAngle) * dist;

        ctx.beginPath();
        ctx.arc(mx, my, 3, 0, Math.PI * 2);
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

canvas.addEventListener('mousedown', (e) => { drawing = true; drawPoint(getPos(e).x, getPos(e).y); });
canvas.addEventListener('mousemove', (e) => { if (drawing) drawPoint(getPos(e).x, getPos(e).y); });
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; drawPoint(getPos(e).x, getPos(e).y); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (drawing) drawPoint(getPos(e).x, getPos(e).y); });
canvas.addEventListener('touchend', () => drawing = false);

mirrorsInput.addEventListener('input', () => {
    mirrors = parseInt(mirrorsInput.value);
    mirrorVal.textContent = mirrors;
});

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
