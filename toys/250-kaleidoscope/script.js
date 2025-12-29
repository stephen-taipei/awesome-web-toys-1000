const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let size = 360;
let centerX, centerY;
let segments = 8;
let hue = 0;
let isDrawing = false;
let lastX = 0, lastY = 0;

function init() {
    setupCanvas();
    document.getElementById('segmentsBtn').addEventListener('click', changeSegments);
    document.getElementById('colorBtn').addEventListener('click', changeColor);
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDraw);

    clearCanvas();
    autoAnimate();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    size = Math.min(360, wrapper.clientWidth - 20);
    canvas.width = size;
    canvas.height = size;
    centerX = size / 2;
    centerY = size / 2;
}

function clearCanvas() {
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size/2);
    gradient.addColorStop(0, '#2d1b4e');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
}

function changeSegments() {
    const options = [6, 8, 10, 12, 16];
    const current = options.indexOf(segments);
    segments = options[(current + 1) % options.length];
}

function changeColor() {
    hue = (hue + 45) % 360;
}

function startDraw(e) {
    isDrawing = true;
    const pos = getPosition(e);
    lastX = pos.x;
    lastY = pos.y;
}

function stopDraw() {
    isDrawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    lastX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    lastY = (touch.clientY - rect.top) * (canvas.height / rect.height);
    isDrawing = true;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    drawKaleidoscope(x, y);
    lastX = x;
    lastY = y;
}

function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function draw(e) {
    if (!isDrawing) return;
    const pos = getPosition(e);
    drawKaleidoscope(pos.x, pos.y);
    lastX = pos.x;
    lastY = pos.y;
}

function drawKaleidoscope(x, y) {
    const dx = x - centerX;
    const dy = y - centerY;
    const angle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx * dx + dy * dy);

    const lastDx = lastX - centerX;
    const lastDy = lastY - centerY;
    const lastAngle = Math.atan2(lastDy, lastDx);
    const lastDist = Math.sqrt(lastDx * lastDx + lastDy * lastDy);

    ctx.lineCap = 'round';
    ctx.lineWidth = 3 + Math.random() * 2;

    const currentHue = (hue + dist * 0.5) % 360;
    ctx.strokeStyle = 'hsl(' + currentHue + ', 80%, 60%)';

    for (let i = 0; i < segments; i++) {
        const segAngle = (Math.PI * 2 / segments) * i;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(segAngle);

        ctx.beginPath();
        ctx.moveTo(
            Math.cos(lastAngle) * lastDist,
            Math.sin(lastAngle) * lastDist
        );
        ctx.lineTo(
            Math.cos(angle) * dist,
            Math.sin(angle) * dist
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(
            Math.cos(-lastAngle) * lastDist,
            Math.sin(-lastAngle) * lastDist
        );
        ctx.lineTo(
            Math.cos(-angle) * dist,
            Math.sin(-angle) * dist
        );
        ctx.stroke();

        ctx.restore();
    }
}

let autoTime = 0;
function autoAnimate() {
    autoTime += 0.02;

    if (!isDrawing) {
        const r = 80 + Math.sin(autoTime * 0.7) * 50;
        const a = autoTime;

        const x = centerX + Math.cos(a) * r;
        const y = centerY + Math.sin(a * 1.3) * r;

        if (autoTime > 0.1) {
            drawKaleidoscope(x, y);
        }

        lastX = x;
        lastY = y;
        hue = (hue + 0.5) % 360;
    }

    requestAnimationFrame(autoAnimate);
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
