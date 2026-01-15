const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const targetEl = document.getElementById('target');

canvas.width = 370;
canvas.height = 240;

const targets = ['貓', '狗', '房子', '樹', '太陽', '魚', '鳥', '花', '汽車', '船', '飛機', '蘋果', '香蕉', '人', '心形', '星星'];

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
let lastPos = null;
let isHidden = false;

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

document.getElementById('hideBtn').addEventListener('click', () => {
    isHidden = !isHidden;
    canvas.classList.toggle('hidden', isHidden);
});

document.getElementById('newBtn').addEventListener('click', () => {
    targetEl.textContent = targets[Math.floor(Math.random() * targets.length)];
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    isHidden = false;
    canvas.classList.remove('hidden');
});
