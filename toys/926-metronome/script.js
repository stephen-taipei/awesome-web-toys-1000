const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let tempo = 60;
let time = 0;
let angle = 0;
let direction = 1;
let beatCount = 0;
let lastBeatTime = 0;
let pulseSize = 0;

const tempos = [60, 80, 100, 120, 140];
let tempoIndex = 0;

function changeTempo() {
    tempoIndex = (tempoIndex + 1) % tempos.length;
    tempo = tempos[tempoIndex];
}

function update(timestamp) {
    const beatInterval = 60000 / tempo;
    const swingDuration = beatInterval;

    const progress = ((timestamp % swingDuration) / swingDuration);
    const swing = Math.sin(progress * Math.PI);

    angle = swing * 0.5 * direction;

    if (progress < 0.05 && timestamp - lastBeatTime > beatInterval * 0.9) {
        direction *= -1;
        beatCount++;
        lastBeatTime = timestamp;
        pulseSize = 30;
    }

    pulseSize = Math.max(0, pulseSize - 1);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1008');
    gradient.addColorStop(1, '#2a1810');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMetronome() {
    const baseX = canvas.width / 2;
    const baseY = canvas.height - 30;
    const pendulumLength = 180;

    ctx.fillStyle = '#3a2820';
    ctx.beginPath();
    ctx.moveTo(baseX - 60, baseY);
    ctx.lineTo(baseX + 60, baseY);
    ctx.lineTo(baseX + 40, baseY - 20);
    ctx.lineTo(baseX - 40, baseY - 20);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#4a3830';
    ctx.beginPath();
    ctx.moveTo(baseX - 50, baseY - 20);
    ctx.lineTo(baseX, baseY - 220);
    ctx.lineTo(baseX + 50, baseY - 20);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    for (let i = -3; i <= 3; i++) {
        const markAngle = i * 0.15;
        const x1 = baseX + Math.sin(markAngle) * 140;
        const y1 = baseY - 30 - Math.cos(markAngle) * 140;
        const x2 = baseX + Math.sin(markAngle) * 150;
        const y2 = baseY - 30 - Math.cos(markAngle) * 150;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    const pivotX = baseX;
    const pivotY = baseY - 30;
    const bobX = pivotX + Math.sin(angle) * pendulumLength;
    const bobY = pivotY - Math.cos(angle) * pendulumLength;

    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    const weightY = pivotY - Math.cos(angle) * 120;
    const weightX = pivotX + Math.sin(angle) * 120;

    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.moveTo(weightX - 15, weightY - 10);
    ctx.lineTo(weightX + 15, weightY - 10);
    ctx.lineTo(weightX + 10, weightY + 20);
    ctx.lineTo(weightX - 10, weightY + 20);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(bobX, bobY, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5a4840';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
    ctx.fill();
}

function drawPulse() {
    if (pulseSize > 0) {
        ctx.strokeStyle = `rgba(212, 175, 55, ${pulseSize / 30})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 50, 20 + (30 - pulseSize), 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawBeatIndicator() {
    const beatsPerMeasure = 4;
    const currentBeat = beatCount % beatsPerMeasure;

    for (let i = 0; i < beatsPerMeasure; i++) {
        const x = canvas.width / 2 - 45 + i * 30;
        const y = 50;

        ctx.fillStyle = i === currentBeat ? '#D4AF37' : '#4a3830';
        ctx.beginPath();
        ctx.arc(x, y, i === currentBeat ? 10 + pulseSize / 3 : 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${tempo} BPM`, 20, 30);
}

function animate(timestamp) {
    update(timestamp);
    drawBackground();
    drawMetronome();
    drawPulse();
    drawBeatIndicator();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('tempoBtn').addEventListener('click', changeTempo);

requestAnimationFrame(animate);
