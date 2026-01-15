const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 250;

let drawing = false;
let mode = 'horizontal';

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function drawPoint(x, y) {
    ctx.fillStyle = '#e91e63';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    if (mode === 'horizontal' || mode === 'both') {
        ctx.beginPath();
        ctx.arc(canvas.width - x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    if (mode === 'vertical' || mode === 'both') {
        ctx.beginPath();
        ctx.arc(x, canvas.height - y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    if (mode === 'both') {
        ctx.beginPath();
        ctx.arc(canvas.width - x, canvas.height - y, 3, 0, Math.PI * 2);
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

document.querySelectorAll('.controls button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.controls button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mode = btn.id;
    });
});

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
