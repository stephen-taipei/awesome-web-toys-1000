const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let freqIndex = 0;
let time = 0;

const frequencies = [
    { name: 'C4', hz: 261.63 },
    { name: 'D4', hz: 293.66 },
    { name: 'E4', hz: 329.63 },
    { name: 'F4', hz: 349.23 },
    { name: 'G4', hz: 392.00 },
    { name: 'A4', hz: 440.00 },
    { name: 'B4', hz: 493.88 },
    { name: 'C5', hz: 523.25 }
];

function changeFrequency() {
    freqIndex = (freqIndex + 1) % frequencies.length;
}

function drawBackground() {
    ctx.fillStyle = '#0a0a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(155, 89, 182, 0.1)';
    ctx.lineWidth = 1;

    for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(155, 89, 182, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function drawWaveform() {
    const freq = frequencies[freqIndex];
    const midY = canvas.height / 2;
    const amplitude = 80;
    const wavelength = canvas.width / (freq.hz / 50);

    ctx.strokeStyle = '#9B59B6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let x = 0; x <= canvas.width; x += 2) {
        const phase = (x / wavelength) * Math.PI * 2 + time * 0.1;
        const y = midY + Math.sin(phase) * amplitude;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.stroke();

    ctx.strokeStyle = 'rgba(155, 89, 182, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x <= canvas.width; x += 2) {
        const phase = (x / wavelength) * Math.PI * 2 + time * 0.1;
        const y = midY + Math.sin(phase * 2) * amplitude * 0.3;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.stroke();
}

function drawFrequencyDisplay() {
    const freq = frequencies[freqIndex];
    const cx = canvas.width / 2;
    const cy = 60;

    ctx.fillStyle = 'rgba(155, 89, 182, 0.2)';
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#9B59B6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(freq.name, cx, cy - 5);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#9B59B6';
    ctx.fillText(`${freq.hz} Hz`, cx, cy + 20);
}

function drawOscilloscope() {
    const freq = frequencies[freqIndex];
    const cx = 60;
    const cy = canvas.height - 60;
    const radius = 40;

    ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#9B59B6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
        const r = radius * (0.5 + Math.sin(angle * (freq.hz / 100) + time * 0.1) * 0.4);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.stroke();
}

function drawKeyboard() {
    const startX = 120;
    const y = canvas.height - 80;
    const keyWidth = 30;
    const keyHeight = 50;

    frequencies.forEach((freq, i) => {
        const x = startX + i * keyWidth;
        const isActive = i === freqIndex;

        ctx.fillStyle = isActive ? '#9B59B6' : '#fff';
        ctx.fillRect(x, y, keyWidth - 2, keyHeight);

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, keyWidth - 2, keyHeight);

        ctx.fillStyle = isActive ? '#fff' : '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(freq.name, x + keyWidth / 2 - 1, y + keyHeight - 10);
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#9B59B6';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('音調生成器', 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawWaveform();
    drawFrequencyDisplay();
    drawOscilloscope();
    drawKeyboard();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('freqBtn').addEventListener('click', changeFrequency);

animate();
