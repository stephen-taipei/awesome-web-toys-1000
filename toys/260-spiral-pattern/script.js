const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let size = 360;
let centerX, centerY;
let time = 0;
let style = 0;
let hueOffset = 0;
let speed = 1;

const styles = ['fibonacci', 'rose', 'shell', 'galaxy'];
const speeds = [0.5, 1, 2, 3];

function init() {
    setupCanvas();

    document.getElementById('styleBtn').addEventListener('click', changeStyle);
    document.getElementById('colorBtn').addEventListener('click', changeColor);
    document.getElementById('speedBtn').addEventListener('click', changeSpeed);

    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    size = Math.min(360, wrapper.clientWidth - 20);
    canvas.width = size;
    canvas.height = size;
    centerX = size / 2;
    centerY = size / 2;
}

function changeStyle() {
    style = (style + 1) % styles.length;
}

function changeColor() {
    hueOffset = (hueOffset + 60) % 360;
}

function changeSpeed() {
    const idx = speeds.indexOf(speed);
    speed = speeds[(idx + 1) % speeds.length];
}

function gameLoop() {
    time += 0.02 * speed;
    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(centerX, centerY);

    switch (styles[style]) {
        case 'fibonacci':
            drawFibonacci();
            break;
        case 'rose':
            drawRose();
            break;
        case 'shell':
            drawShell();
            break;
        case 'galaxy':
            drawGalaxy();
            break;
    }

    ctx.restore();
}

function drawFibonacci() {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const numPoints = 300;

    for (let i = 0; i < numPoints; i++) {
        const angle = i * goldenAngle + time;
        const radius = Math.sqrt(i) * 8;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const hue = (hueOffset + i * 0.5 + time * 20) % 360;
        ctx.fillStyle = 'hsl(' + hue + ', 80%, 60%)';
        ctx.beginPath();
        ctx.arc(x, y, 3 + Math.sin(time + i * 0.1) * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawRose() {
    const petals = 5 + Math.floor(time % 4);

    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 2 * 12; angle += 0.01) {
        const k = petals + Math.sin(time) * 0.5;
        const r = Math.cos(k * angle) * (size * 0.4);
        const x = r * Math.cos(angle + time * 0.5);
        const y = r * Math.sin(angle + time * 0.5);

        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    const hue = (hueOffset + time * 30) % 360;
    ctx.strokeStyle = 'hsl(' + hue + ', 80%, 60%)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawShell() {
    const a = 0.1;
    const b = 0.3;

    ctx.beginPath();
    for (let t = 0; t < 30; t += 0.02) {
        const r = a * Math.exp(b * t);
        const x = r * Math.cos(t + time);
        const y = r * Math.sin(t + time);

        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    const hue = (hueOffset + time * 20) % 360;
    ctx.strokeStyle = 'hsl(' + hue + ', 80%, 60%)';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let t = 0; t < 30; t += 2) {
        const r = a * Math.exp(b * t);
        const x = r * Math.cos(t + time);
        const y = r * Math.sin(t + time);
        const pointHue = (hue + t * 10) % 360;

        ctx.fillStyle = 'hsl(' + pointHue + ', 80%, 60%)';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGalaxy() {
    const arms = 4;
    const pointsPerArm = 100;

    for (let arm = 0; arm < arms; arm++) {
        const armAngle = (Math.PI * 2 / arms) * arm + time * 0.2;

        for (let i = 0; i < pointsPerArm; i++) {
            const distance = i * 1.5;
            const spiral = 0.1;
            const angle = armAngle + i * spiral + Math.sin(time + i * 0.05) * 0.1;

            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            const hue = (hueOffset + arm * 30 + i) % 360;
            const alpha = 1 - i / pointsPerArm;

            ctx.fillStyle = 'hsla(' + hue + ', 80%, 60%, ' + alpha + ')';
            ctx.beginPath();
            ctx.arc(x, y, 2 + Math.random(), 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
