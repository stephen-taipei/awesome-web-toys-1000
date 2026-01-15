const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('startBtn');

canvas.width = 370;
canvas.height = 250;

let phase = 'ready'; // ready, memorize, draw
let targetImage = null;

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function generatePattern() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;

    const shapes = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < shapes; i++) {
        const type = Math.floor(Math.random() * 4);
        const x = 50 + Math.random() * 270;
        const y = 50 + Math.random() * 150;
        const size = 30 + Math.random() * 40;

        ctx.beginPath();

        if (type === 0) {
            ctx.arc(x, y, size, 0, Math.PI * 2);
        } else if (type === 1) {
            ctx.rect(x - size/2, y - size/2, size, size);
        } else if (type === 2) {
            ctx.moveTo(x, y - size);
            ctx.lineTo(x - size, y + size * 0.6);
            ctx.lineTo(x + size, y + size * 0.6);
            ctx.closePath();
        } else {
            ctx.moveTo(x - size, y);
            ctx.lineTo(x + size, y);
            ctx.moveTo(x, y - size);
            ctx.lineTo(x, y + size);
        }
        ctx.stroke();
    }

    targetImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function startChallenge() {
    if (phase === 'ready') {
        generatePattern();
        phase = 'memorize';
        statusEl.textContent = '記住這個圖案 (3秒)';
        startBtn.textContent = '記住了';

        setTimeout(() => {
            if (phase === 'memorize') {
                startDrawing();
            }
        }, 3000);
    } else if (phase === 'memorize') {
        startDrawing();
    } else if (phase === 'draw') {
        // Show comparison
        ctx.globalAlpha = 0.3;
        ctx.putImageData(targetImage, 0, 0);
        ctx.globalAlpha = 1;

        phase = 'ready';
        statusEl.textContent = '對比結果 (淡色為原圖)';
        startBtn.textContent = '再來一次';
    }
}

function startDrawing() {
    phase = 'draw';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    statusEl.textContent = '現在憑記憶畫出來';
    startBtn.textContent = '對比結果';
}

let drawing = false;
let lastPos = null;

function draw(x, y) {
    if (phase !== 'draw') return;

    if (lastPos) {
        ctx.strokeStyle = '#e74c3c';
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

startBtn.addEventListener('click', startChallenge);
