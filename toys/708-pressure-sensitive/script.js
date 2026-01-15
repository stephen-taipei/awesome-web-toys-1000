const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pressureValue = document.getElementById('pressureValue');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let drawing = false;
let color = '#a29bfe';
let lastX, lastY;

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    let x, y, pressure;

    if (e.pointerType === 'pen' || e.pointerType === 'touch') {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
        pressure = e.pressure || 0.5;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
        // Simulate pressure with speed
        pressure = 0.5;
    }

    return {
        x: x * canvas.width / rect.width,
        y: y * canvas.height / rect.height,
        pressure
    };
}

function drawLine(x1, y1, x2, y2, pressure) {
    const lineWidth = 1 + pressure * 20;
    const alpha = 0.3 + pressure * 0.7;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.stroke();
    ctx.globalAlpha = 1;

    pressureValue.textContent = pressure.toFixed(2);
}

canvas.addEventListener('pointerdown', (e) => {
    drawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
});

canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    drawLine(lastX, lastY, pos.x, pos.y, pos.pressure);
    lastX = pos.x;
    lastY = pos.y;
});

canvas.addEventListener('pointerup', () => { drawing = false; });
canvas.addEventListener('pointerleave', () => { drawing = false; });

document.getElementById('colorPicker').addEventListener('input', (e) => color = e.target.value);
document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
