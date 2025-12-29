const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 450;
let isDrawing = false;
let lastX = 0, lastY = 0;
let hue = 300;
let brushSize = 3;

const colors = [
    { h: 300, name: 'pink' },
    { h: 180, name: 'cyan' },
    { h: 120, name: 'green' },
    { h: 60, name: 'yellow' },
    { h: 0, name: 'red' },
    { h: 270, name: 'purple' }
];
let colorIndex = 0;

const sizes = [3, 6, 10, 15];
let sizeIndex = 0;

function init() {
    setupCanvas();
    clearCanvas();

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDraw);

    document.getElementById('colorBtn').addEventListener('click', changeColor);
    document.getElementById('sizeBtn').addEventListener('click', changeSize);
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);

    pulseEffect();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.25;
    canvas.width = width;
    canvas.height = height;
}

function clearCanvas() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
}

function changeColor() {
    colorIndex = (colorIndex + 1) % colors.length;
    hue = colors[colorIndex].h;
}

function changeSize() {
    sizeIndex = (sizeIndex + 1) % sizes.length;
    brushSize = sizes[sizeIndex];
}

function startDraw(e) {
    isDrawing = true;
    const pos = getPos(e);
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
    drawNeon(x, y);
    lastX = x;
    lastY = y;
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function draw(e) {
    if (!isDrawing) return;
    const pos = getPos(e);
    drawNeon(pos.x, pos.y);
    lastX = pos.x;
    lastY = pos.y;
}

function drawNeon(x, y) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 4; i >= 0; i--) {
        const size = brushSize + i * 3;
        const alpha = i === 0 ? 1 : 0.1;
        const lightness = i === 0 ? 60 : 50;

        ctx.strokeStyle = 'hsla(' + hue + ', 100%, ' + lightness + '%, ' + alpha + ')';
        ctx.lineWidth = size;
        ctx.shadowColor = 'hsl(' + hue + ', 100%, 50%)';
        ctx.shadowBlur = i === 0 ? 15 : 25;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    ctx.shadowBlur = 0;
}

function pulseEffect() {
    const originalTitle = document.querySelector('h1');
    let pulseHue = 0;

    setInterval(() => {
        pulseHue = (pulseHue + 2) % 360;
        originalTitle.style.textShadow =
            '0 0 10px hsl(' + pulseHue + ', 100%, 50%), ' +
            '0 0 20px hsl(' + pulseHue + ', 100%, 50%), ' +
            '0 0 30px hsl(' + pulseHue + ', 100%, 50%)';
        originalTitle.style.color = 'hsl(' + pulseHue + ', 100%, 70%)';
    }, 50);
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
