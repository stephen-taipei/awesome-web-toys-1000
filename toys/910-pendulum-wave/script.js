const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const numPendulums = 15;
let pendulums = [];
let time = 0;
let startTime = 0;

function init() {
    pendulums = [];
    startTime = 0;
    time = 0;

    for (let i = 0; i < numPendulums; i++) {
        const baseFreq = 0.5;
        const freqIncrement = 0.03;

        pendulums.push({
            x: 25 + i * ((canvas.width - 50) / (numPendulums - 1)),
            frequency: baseFreq + i * freqIncrement,
            length: 80 + i * 8,
            angle: Math.PI / 4,
            hue: (i / numPendulums) * 360
        });
    }
}

function reset() {
    init();
}

function updatePendulums() {
    pendulums.forEach(p => {
        p.angle = Math.PI / 4 * Math.sin(time * p.frequency);
    });
}

function drawBackground() {
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(0, 20, canvas.width, 10);
}

function drawPendulums() {
    const pivotY = 25;

    pendulums.forEach((p, i) => {
        const bobX = p.x + Math.sin(p.angle) * p.length;
        const bobY = pivotY + Math.cos(p.angle) * p.length;

        ctx.strokeStyle = `hsla(${p.hue}, 70%, 50%, 0.5)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        const gradient = ctx.createRadialGradient(
            bobX - 3, bobY - 3, 0,
            bobX, bobY, 12
        );
        gradient.addColorStop(0, `hsla(${p.hue}, 70%, 70%, 1)`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 70%, 50%, 1)`);
        gradient.addColorStop(1, `hsla(${p.hue}, 70%, 30%, 1)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bobX, bobY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = `hsl(${p.hue}, 70%, 50%)`;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#1a1a2a';
        ctx.beginPath();
        ctx.arc(p.x, pivotY, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawTrail() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    pendulums.forEach((p, i) => {
        const pivotY = 25;
        const bobX = p.x + Math.sin(p.angle) * p.length;
        const bobY = pivotY + Math.cos(p.angle) * p.length;

        if (i === 0) {
            ctx.moveTo(bobX, bobY);
        } else {
            ctx.lineTo(bobX, bobY);
        }
    });

    ctx.stroke();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`時間: ${(time / 60).toFixed(1)}s`, 20, 28);
}

function animate() {
    time++;
    updatePendulums();
    drawBackground();
    drawTrail();
    drawPendulums();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('resetBtn').addEventListener('click', reset);

init();
animate();
