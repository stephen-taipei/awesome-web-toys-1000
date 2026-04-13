const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let mode = 0;
let time = 0;
let spectrum = [];
let history = [];

const numBands = 64;
const modes = ['spectrum', '3d', 'waveform', 'circular'];

function init() {
    for (let i = 0; i < numBands; i++) {
        spectrum[i] = 0;
    }
    for (let i = 0; i < 20; i++) {
        history[i] = new Array(numBands).fill(0);
    }
}

function changeMode() {
    mode = (mode + 1) % modes.length;
}

function updateSpectrum() {
    for (let i = 0; i < numBands; i++) {
        const freq = i / numBands;
        let target;

        if (freq < 0.15) {
            target = 0.6 + Math.sin(time * 0.06) * 0.3;
        } else if (freq < 0.4) {
            target = 0.5 + Math.sin(time * 0.08 + i * 0.1) * 0.25;
        } else if (freq < 0.7) {
            target = 0.35 + Math.sin(time * 0.1 + i * 0.15) * 0.2;
        } else {
            target = 0.2 + Math.sin(time * 0.12 + i * 0.2) * 0.15;
        }

        target += Math.random() * 0.08;
        spectrum[i] += (target - spectrum[i]) * 0.15;
    }

    history.pop();
    history.unshift([...spectrum]);
}

function drawBackground() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSpectrum() {
    const barWidth = canvas.width / numBands;

    spectrum.forEach((value, i) => {
        const height = value * (canvas.height - 40);
        const x = i * barWidth;
        const y = canvas.height - 20 - height;

        const hue = 120 + (i / numBands) * 60;
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height - 20);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 1)`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 30%, 0.5)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 1, height);

        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = 10;
        ctx.fillRect(x, y, barWidth - 1, 3);
        ctx.shadowBlur = 0;
    });
}

function draw3D() {
    const barWidth = canvas.width / numBands;
    const depth = 15;

    for (let z = history.length - 1; z >= 0; z--) {
        const row = history[z];
        const offsetY = z * 10;
        const alpha = 1 - z / history.length;

        row.forEach((value, i) => {
            const height = value * 100;
            const x = i * barWidth + z * 2;
            const y = canvas.height - 50 - height - offsetY;

            const hue = 120 + (i / numBands) * 60;
            ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha * 0.8})`;
            ctx.fillRect(x, y, barWidth - 1, height);
        });
    }
}

function drawWaveform() {
    const midY = canvas.height / 2;

    ctx.strokeStyle = '#00FF7F';
    ctx.lineWidth = 2;
    ctx.beginPath();

    spectrum.forEach((value, i) => {
        const x = (i / numBands) * canvas.width;
        const y = midY + (value - 0.5) * 200 * Math.sin(i * 0.2 + time * 0.05);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 255, 127, 0.3)';
    ctx.beginPath();

    spectrum.forEach((value, i) => {
        const x = (i / numBands) * canvas.width;
        const y = midY - (value - 0.5) * 200 * Math.sin(i * 0.2 + time * 0.05);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();
}

function drawCircular() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const innerRadius = 40;
    const maxRadius = 100;

    spectrum.forEach((value, i) => {
        const angle = (i / numBands) * Math.PI * 2 - Math.PI / 2;
        const nextAngle = ((i + 1) / numBands) * Math.PI * 2 - Math.PI / 2;
        const outerRadius = innerRadius + value * maxRadius;

        const hue = 120 + (i / numBands) * 60;
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;

        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius, angle, nextAngle);
        ctx.arc(cx, cy, outerRadius, nextAngle, angle, true);
        ctx.closePath();
        ctx.fill();
    });

    ctx.fillStyle = '#0a0a1a';
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius - 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#00FF7F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    ctx.stroke();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#00FF7F';
    ctx.font = '11px Arial';
    ctx.fillText(`模式: ${modes[mode]}`, 20, 28);
}

function animate() {
    time++;
    updateSpectrum();
    drawBackground();

    switch (modes[mode]) {
        case 'spectrum': drawSpectrum(); break;
        case '3d': draw3D(); break;
        case 'waveform': drawWaveform(); break;
        case 'circular': drawCircular(); break;
    }

    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('modeBtn').addEventListener('click', changeMode);

init();
animate();
