const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 450;
let pendulums = [];
let time = 0;
let isPaused = false;
let animationId = null;

const numPendulums = 15;
const basePeriod = 60;

function init() {
    setupCanvas();
    createPendulums();
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.25;
    canvas.width = width;
    canvas.height = height;
}

function createPendulums() {
    pendulums = [];
    const startLength = height * 0.2;
    const lengthDiff = height * 0.4 / numPendulums;

    for (let i = 0; i < numPendulums; i++) {
        const oscillations = 51 + i;
        const period = basePeriod / oscillations * numPendulums;
        const length = startLength + i * lengthDiff;

        pendulums.push({
            length: length,
            period: period,
            angle: Math.PI / 4,
            x: 0,
            y: 0,
            color: 'hsl(' + (i * 360 / numPendulums) + ', 70%, 55%)'
        });
    }
}

function reset() {
    time = 0;
    isPaused = false;
    document.getElementById('pauseBtn').textContent = '暫停';
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? '繼續' : '暫停';
}

function gameLoop() {
    if (!isPaused) {
        update();
    }
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function update() {
    time += 1/60;
    document.getElementById('time').textContent = time.toFixed(1);

    const pivotX = width / 2;
    const pivotY = 30;

    pendulums.forEach(p => {
        const omega = 2 * Math.PI / p.period;
        p.angle = (Math.PI / 4) * Math.cos(omega * time);
        p.x = pivotX + p.length * Math.sin(p.angle);
        p.y = pivotY + p.length * Math.cos(p.angle);
    });
}

function draw() {
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, width, height);

    const pivotX = width / 2;
    const pivotY = 30;

    ctx.fillStyle = '#444';
    ctx.fillRect(width * 0.1, 20, width * 0.8, 10);

    pendulums.forEach((p, i) => {
        const stringX = pivotX + (i - numPendulums/2 + 0.5) * (width * 0.6 / numPendulums);

        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(stringX, pivotY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        const gradient = ctx.createRadialGradient(
            p.x - 3, p.y - 3, 0,
            p.x, p.y, 12
        );
        gradient.addColorStop(0, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(0.5, p.color);
        gradient.addColorStop(1, p.color);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    pendulums.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
    setupCanvas();
    createPendulums();
});
