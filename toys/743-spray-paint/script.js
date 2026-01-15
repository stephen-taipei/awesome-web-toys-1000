const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('color');
const radiusInput = document.getElementById('radius');

canvas.width = 370;
canvas.height = 280;

ctx.fillStyle = '#333';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let spraying = false;
let sprayInterval = null;
let currentPos = { x: 0, y: 0 };

function spray() {
    const radius = parseInt(radiusInput.value);
    const density = 50;

    ctx.fillStyle = colorInput.value;

    for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        const x = currentPos.x + Math.cos(angle) * r;
        const y = currentPos.y + Math.sin(angle) * r;

        ctx.globalAlpha = Math.random() * 0.3 + 0.1;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
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

function startSpray(e) {
    spraying = true;
    currentPos = getPos(e);
    spray();
    sprayInterval = setInterval(spray, 30);
}

function stopSpray() {
    spraying = false;
    clearInterval(sprayInterval);
}

canvas.addEventListener('mousedown', startSpray);
canvas.addEventListener('mousemove', (e) => { if (spraying) currentPos = getPos(e); });
canvas.addEventListener('mouseup', stopSpray);
canvas.addEventListener('mouseleave', stopSpray);

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startSpray(e); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (spraying) currentPos = getPos(e); });
canvas.addEventListener('touchend', stopSpray);

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
