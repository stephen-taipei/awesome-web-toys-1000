const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let size = 360;
let pattern = 0;
let hue = 0;
let isAnimating = true;
let time = 0;

const patterns = ['cardioid', 'star', 'rose', 'spiral'];

function init() {
    setupCanvas();

    document.getElementById('patternBtn').addEventListener('click', changePattern);
    document.getElementById('colorBtn').addEventListener('click', changeColor);
    document.getElementById('animateBtn').addEventListener('click', toggleAnimation);

    document.getElementById('animateBtn').classList.add('active');
    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    size = Math.min(360, wrapper.clientWidth - 20);
    canvas.width = size;
    canvas.height = size;
}

function changePattern() {
    pattern = (pattern + 1) % patterns.length;
}

function changeColor() {
    hue = (hue + 60) % 360;
}

function toggleAnimation() {
    isAnimating = !isAnimating;
    document.getElementById('animateBtn').classList.toggle('active', isAnimating);
}

function gameLoop() {
    if (isAnimating) {
        time += 0.01;
    }
    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;

    ctx.save();
    ctx.translate(centerX, centerY);

    switch (patterns[pattern]) {
        case 'cardioid':
            drawCardioid(radius);
            break;
        case 'star':
            drawStar(radius);
            break;
        case 'rose':
            drawRose(radius);
            break;
        case 'spiral':
            drawSpiral(radius);
            break;
    }

    ctx.restore();
}

function drawCardioid(radius) {
    const points = 100;
    const multiplier = 2 + Math.sin(time) * 0.5;

    ctx.lineWidth = 1;

    for (let i = 0; i < points; i++) {
        const angle1 = (Math.PI * 2 / points) * i;
        const j = Math.floor(i * multiplier) % points;
        const angle2 = (Math.PI * 2 / points) * j;

        const x1 = Math.cos(angle1) * radius;
        const y1 = Math.sin(angle1) * radius;
        const x2 = Math.cos(angle2) * radius;
        const y2 = Math.sin(angle2) * radius;

        const lineHue = (hue + i * 3) % 360;
        ctx.strokeStyle = 'hsla(' + lineHue + ', 80%, 60%, 0.6)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
}

function drawStar(radius) {
    const points = 50;
    const innerRadius = radius * 0.3;
    const skip = 7 + Math.floor(Math.sin(time) * 2);

    ctx.lineWidth = 1;

    for (let i = 0; i < points; i++) {
        const angle1 = (Math.PI * 2 / points) * i;
        const angle2 = (Math.PI * 2 / points) * ((i + skip) % points);

        const x1 = Math.cos(angle1) * radius;
        const y1 = Math.sin(angle1) * radius;
        const x2 = Math.cos(angle2) * innerRadius;
        const y2 = Math.sin(angle2) * innerRadius;

        const lineHue = (hue + i * 7) % 360;
        ctx.strokeStyle = 'hsla(' + lineHue + ', 80%, 60%, 0.7)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

function drawRose(radius) {
    const lines = 80;
    const k = 3 + Math.sin(time * 0.5);

    ctx.lineWidth = 1;

    for (let i = 0; i < lines; i++) {
        const t = (i / lines) * Math.PI * 2 * 6;
        const r = radius * Math.cos(k * t);

        const x = r * Math.cos(t + time);
        const y = r * Math.sin(t + time);

        const lineHue = (hue + i * 4) % 360;
        ctx.strokeStyle = 'hsla(' + lineHue + ', 80%, 60%, 0.5)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

function drawSpiral(radius) {
    const lines = 60;
    const turns = 3;

    ctx.lineWidth = 1.5;

    for (let i = 0; i < lines; i++) {
        const t1 = (i / lines) * Math.PI * 2 * turns + time;
        const t2 = ((i + 1) / lines) * Math.PI * 2 * turns + time;

        const r1 = (i / lines) * radius;
        const r2 = ((i + 1) / lines) * radius;

        const x1 = r1 * Math.cos(t1);
        const y1 = r1 * Math.sin(t1);
        const x2 = r2 * Math.cos(t2);
        const y2 = r2 * Math.sin(t2);

        const lineHue = (hue + i * 5) % 360;
        ctx.strokeStyle = 'hsla(' + lineHue + ', 80%, 60%, 0.8)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.strokeStyle = 'hsla(' + ((lineHue + 180) % 360) + ', 80%, 60%, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
    }
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
