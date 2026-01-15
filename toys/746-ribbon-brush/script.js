const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('color');
const widthInput = document.getElementById('width');

canvas.width = 370;
canvas.height = 280;

ctx.fillStyle = '#fef9fa';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
let points = [];

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function drawRibbon() {
    if (points.length < 2) return;

    const width = parseInt(widthInput.value);
    const rgb = hexToRgb(colorInput.value);

    for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];

        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const angle = Math.atan2(dy, dx);
        const perpAngle = angle + Math.PI / 2;

        const wave = Math.sin(i * 0.3) * width * 0.3;
        const currentWidth = width * 0.5 + wave;

        const alpha = Math.min(1, i / 10);

        ctx.beginPath();
        ctx.moveTo(p0.x + Math.cos(perpAngle) * currentWidth, p0.y + Math.sin(perpAngle) * currentWidth);
        ctx.lineTo(p0.x - Math.cos(perpAngle) * currentWidth, p0.y - Math.sin(perpAngle) * currentWidth);
        ctx.lineTo(p1.x - Math.cos(perpAngle) * currentWidth, p1.y - Math.sin(perpAngle) * currentWidth);
        ctx.lineTo(p1.x + Math.cos(perpAngle) * currentWidth, p1.y + Math.sin(perpAngle) * currentWidth);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(
            p0.x + Math.cos(perpAngle) * currentWidth, p0.y + Math.sin(perpAngle) * currentWidth,
            p0.x - Math.cos(perpAngle) * currentWidth, p0.y - Math.sin(perpAngle) * currentWidth
        );
        gradient.addColorStop(0, `rgba(${rgb.r + 40}, ${rgb.g + 40}, ${rgb.b + 40}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${rgb.r - 40}, ${rgb.g - 40}, ${rgb.b - 40}, ${alpha})`);

        ctx.fillStyle = gradient;
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

canvas.addEventListener('mousedown', (e) => { drawing = true; points = [getPos(e)]; });
canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        points.push(getPos(e));
        if (points.length > 50) points.shift();
        drawRibbon();
    }
});
canvas.addEventListener('mouseup', () => { drawing = false; points = []; });
canvas.addEventListener('mouseleave', () => { drawing = false; points = []; });

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; points = [getPos(e)]; });
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (drawing) {
        points.push(getPos(e));
        if (points.length > 50) points.shift();
        drawRibbon();
    }
});
canvas.addEventListener('touchend', () => { drawing = false; points = []; });

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#fef9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
