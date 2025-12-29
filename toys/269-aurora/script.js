const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 450;
let time = 0;
let colorScheme = 0;
let intensity = 1;

const schemes = [
    [{ h: 120, s: 80 }, { h: 180, s: 70 }],
    [{ h: 280, s: 70 }, { h: 320, s: 80 }],
    [{ h: 200, s: 80 }, { h: 160, s: 70 }],
    [{ h: 40, s: 80 }, { h: 60, s: 70 }]
];

function init() {
    setupCanvas();

    document.getElementById('colorBtn').addEventListener('click', changeColor);
    document.getElementById('intensityBtn').addEventListener('click', changeIntensity);

    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.25;
    canvas.width = width;
    canvas.height = height;
}

function changeColor() {
    colorScheme = (colorScheme + 1) % schemes.length;
}

function changeIntensity() {
    intensity = intensity === 1 ? 1.5 : intensity === 1.5 ? 0.5 : 1;
}

function gameLoop() {
    time += 0.01;
    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    const colors = schemes[colorScheme];
    const bands = 8;

    for (let i = 0; i < bands; i++) {
        drawAuroraBand(i, bands, colors);
    }

    drawStars();
    drawGround();
}

function drawAuroraBand(index, total, colors) {
    const baseY = height * 0.2 + (index / total) * height * 0.3;
    const amplitude = 30 + Math.sin(time * 0.5 + index) * 20;

    ctx.beginPath();

    for (let x = 0; x <= width; x += 2) {
        const wave1 = Math.sin(x * 0.02 + time + index * 0.5) * amplitude;
        const wave2 = Math.sin(x * 0.01 + time * 0.7 + index) * amplitude * 0.5;
        const y = baseY + wave1 + wave2;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, baseY - amplitude, 0, height);
    const color = colors[index % colors.length];
    const alpha = (0.1 + (1 - index / total) * 0.15) * intensity;

    gradient.addColorStop(0, 'hsla(' + color.h + ', ' + color.s + '%, 60%, ' + alpha + ')');
    gradient.addColorStop(0.3, 'hsla(' + color.h + ', ' + color.s + '%, 50%, ' + (alpha * 0.6) + ')');
    gradient.addColorStop(1, 'hsla(' + color.h + ', ' + color.s + '%, 40%, 0)');

    ctx.fillStyle = gradient;
    ctx.fill();
}

function drawStars() {
    for (let i = 0; i < 50; i++) {
        const x = (i * 73) % width;
        const y = (i * 47) % (height * 0.4);
        const twinkle = Math.sin(time * 3 + i) * 0.3 + 0.7;

        ctx.fillStyle = 'rgba(255, 255, 255, ' + twinkle + ')';
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGround() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, height * 0.85, width, height * 0.15);

    for (let i = 0; i < 5; i++) {
        const x = (i + 0.5) * (width / 5);
        const h = 20 + Math.random() * 30;

        ctx.fillStyle = '#050510';
        ctx.beginPath();
        ctx.moveTo(x - 15, height * 0.85);
        ctx.lineTo(x, height * 0.85 - h);
        ctx.lineTo(x + 15, height * 0.85);
        ctx.closePath();
        ctx.fill();
    }
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
