const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let size = 300;
let style = 0;
let colorScheme = 0;

const schemes = [
    { face: '#1a1a2e', border: '#ffd700', hands: '#ffd700', marks: '#ffd700' },
    { face: '#fff', border: '#333', hands: '#333', marks: '#333' },
    { face: '#2d3436', border: '#00cec9', hands: '#00cec9', marks: '#00cec9' },
    { face: '#0a0a15', border: '#ff6b6b', hands: '#ff6b6b', marks: '#ff6b6b' }
];

function init() {
    setupCanvas();

    document.getElementById('styleBtn').addEventListener('click', changeStyle);
    document.getElementById('colorBtn').addEventListener('click', changeColor);

    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    size = Math.min(300, wrapper.clientWidth - 20);
    canvas.width = size;
    canvas.height = size;
}

function changeStyle() {
    style = (style + 1) % 3;
}

function changeColor() {
    colorScheme = (colorScheme + 1) % schemes.length;
}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const millis = now.getMilliseconds();

    document.getElementById('digitalTime').textContent =
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');

    const scheme = schemes[colorScheme];
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.45;

    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = scheme.face;
    ctx.strokeStyle = scheme.border;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const isHour = i % 5 === 0;
        const innerR = isHour ? radius * 0.85 : radius * 0.9;
        const outerR = radius * 0.95;

        ctx.strokeStyle = scheme.marks;
        ctx.lineWidth = isHour ? 3 : 1;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
        ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR);
        ctx.stroke();
    }

    if (style >= 1) {
        ctx.fillStyle = scheme.marks;
        ctx.font = 'bold ' + (size * 0.08) + 'px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 1; i <= 12; i++) {
            const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius * 0.75;
            const y = centerY + Math.sin(angle) * radius * 0.75;
            ctx.fillText(i.toString(), x, y);
        }
    }

    const hourAngle = ((hours % 12) / 12 + minutes / 720) * Math.PI * 2 - Math.PI / 2;
    drawHand(centerX, centerY, hourAngle, radius * 0.5, 6, scheme.hands);

    const minuteAngle = (minutes / 60 + seconds / 3600) * Math.PI * 2 - Math.PI / 2;
    drawHand(centerX, centerY, minuteAngle, radius * 0.7, 4, scheme.hands);

    const secondAngle = ((seconds + millis / 1000) / 60) * Math.PI * 2 - Math.PI / 2;
    if (style === 2) {
        ctx.strokeStyle = '#ff0000';
    } else {
        ctx.strokeStyle = scheme.hands;
    }
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - Math.cos(secondAngle) * radius * 0.1, centerY - Math.sin(secondAngle) * radius * 0.1);
    ctx.lineTo(centerX + Math.cos(secondAngle) * radius * 0.8, centerY + Math.sin(secondAngle) * radius * 0.8);
    ctx.stroke();

    ctx.fillStyle = scheme.hands;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
}

function drawHand(cx, cy, angle, length, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
    ctx.stroke();
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
