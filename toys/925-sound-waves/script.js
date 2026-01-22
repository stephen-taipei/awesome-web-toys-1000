const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let waveType = 0;
let time = 0;

const waveTypes = ['sine', 'square', 'sawtooth', 'triangle'];

function changeWave() {
    waveType = (waveType + 1) % waveTypes.length;
}

function getWaveValue(x, type) {
    const frequency = 0.02;
    const t = x * frequency + time * 0.05;

    switch (type) {
        case 'sine':
            return Math.sin(t);
        case 'square':
            return Math.sin(t) > 0 ? 1 : -1;
        case 'sawtooth':
            return 2 * (t / (Math.PI * 2) - Math.floor(t / (Math.PI * 2) + 0.5));
        case 'triangle':
            return 2 * Math.abs(2 * (t / (Math.PI * 2) - Math.floor(t / (Math.PI * 2) + 0.5))) - 1;
        default:
            return Math.sin(t);
    }
}

function drawBackground() {
    ctx.fillStyle = '#0a1a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(0, 206, 209, 0.1)';
    ctx.lineWidth = 1;

    for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(0, 206, 209, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function drawWave() {
    const midY = canvas.height / 2;
    const amplitude = 80;
    const type = waveTypes[waveType];

    for (let layer = 2; layer >= 0; layer--) {
        const offset = layer * 0.5;
        const alpha = 1 - layer * 0.3;
        const hue = (time * 2 + layer * 30) % 360;

        ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
        ctx.lineWidth = 3 - layer;
        ctx.beginPath();

        for (let x = 0; x <= canvas.width; x += 2) {
            const value = getWaveValue(x + offset * 50, type);
            const y = midY + value * amplitude * (1 - layer * 0.2);

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0, 206, 209, 0.1)';
    ctx.beginPath();
    ctx.moveTo(0, midY);

    for (let x = 0; x <= canvas.width; x += 2) {
        const value = getWaveValue(x, type);
        const y = midY + value * amplitude;
        ctx.lineTo(x, y);
    }

    ctx.lineTo(canvas.width, midY);
    ctx.closePath();
    ctx.fill();
}

function drawOscilloscope() {
    const cx = 60;
    const cy = 60;
    const radius = 40;

    ctx.strokeStyle = 'rgba(0, 206, 209, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#00CED1';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
        const type = waveTypes[waveType];
        const value = getWaveValue(angle * 20, type);
        const r = radius * (0.5 + value * 0.4);
        const x = cx + Math.cos(angle - Math.PI / 2) * r;
        const y = cy + Math.sin(angle - Math.PI / 2) * r;

        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.stroke();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(canvas.width - 110, 10, 100, 30);

    ctx.fillStyle = '#00CED1';
    ctx.font = '11px Arial';
    ctx.fillText(`波形: ${waveTypes[waveType]}`, canvas.width - 100, 28);
}

function animate() {
    time++;
    drawBackground();
    drawWave();
    drawOscilloscope();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('waveBtn').addEventListener('click', changeWave);

animate();
