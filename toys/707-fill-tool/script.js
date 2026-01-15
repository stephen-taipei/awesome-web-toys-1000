const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let drawing = false;
let tool = 'pencil';
let color = '#fdcb6e';

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    return {
        x: Math.floor(x * canvas.width / rect.width),
        y: Math.floor(y * canvas.height / rect.height)
    };
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function floodFill(x, y, fillColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const targetColor = getPixel(data, x, y);
    const fill = hexToRgb(fillColor);

    if (targetColor.r === fill.r && targetColor.g === fill.g && targetColor.b === fill.b) return;

    const stack = [[x, y]];
    const tolerance = 30;

    while (stack.length > 0) {
        const [cx, cy] = stack.pop();
        if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue;

        const current = getPixel(data, cx, cy);
        if (colorMatch(current, targetColor, tolerance)) {
            setPixel(data, cx, cy, fill);
            stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function getPixel(data, x, y) {
    const i = (y * canvas.width + x) * 4;
    return { r: data[i], g: data[i + 1], b: data[i + 2] };
}

function setPixel(data, x, y, color) {
    const i = (y * canvas.width + x) * 4;
    data[i] = color.r;
    data[i + 1] = color.g;
    data[i + 2] = color.b;
    data[i + 3] = 255;
}

function colorMatch(c1, c2, tolerance) {
    return Math.abs(c1.r - c2.r) < tolerance &&
           Math.abs(c1.g - c2.g) < tolerance &&
           Math.abs(c1.b - c2.b) < tolerance;
}

canvas.addEventListener('mousedown', (e) => {
    const pos = getPos(e);
    if (tool === 'fill') {
        floodFill(pos.x, pos.y, color);
    } else {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing || tool !== 'pencil') return;
    const pos = getPos(e);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#333';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
});

canvas.addEventListener('mouseup', () => { drawing = false; ctx.beginPath(); });
canvas.addEventListener('mouseleave', () => { drawing = false; ctx.beginPath(); });

document.querySelectorAll('.tool').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tool').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tool = btn.dataset.tool;
        canvas.style.cursor = tool === 'fill' ? 'cell' : 'crosshair';
    });
});

document.getElementById('colorPicker').addEventListener('input', (e) => color = e.target.value);
document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
