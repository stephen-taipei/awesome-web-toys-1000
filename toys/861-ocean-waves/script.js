const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let waveHeight = 20;
let time = 0;

function changeWaveHeight() {
    waveHeight = waveHeight === 20 ? 40 : waveHeight === 40 ? 10 : 20;
}

function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.4);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(canvas.width - 50, 50, 25, 0, Math.PI * 2);
    ctx.fill();
}

function drawWave(yBase, amplitude, speed, color, alpha) {
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    for (let x = 0; x <= canvas.width; x++) {
        const y = yBase +
            Math.sin(x * 0.02 + time * speed) * amplitude +
            Math.sin(x * 0.01 + time * speed * 0.7) * (amplitude * 0.5);
        ctx.lineTo(x, y);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
}

function drawFoam() {
    const foamY = canvas.height * 0.45;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

    for (let x = 0; x < canvas.width; x += 20) {
        const offsetY = Math.sin(x * 0.02 + time * 0.03) * waveHeight;
        const size = 3 + Math.random() * 5;

        if (Math.random() > 0.5) {
            ctx.beginPath();
            ctx.arc(x + Math.random() * 10, foamY + offsetY, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawBubbles() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';

    for (let i = 0; i < 15; i++) {
        const x = (i * 37 + time) % canvas.width;
        const y = canvas.height * 0.5 + Math.sin(time * 0.02 + i) * 30 + i * 5;
        const size = 2 + Math.sin(time * 0.05 + i) * 1;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    const labels = { 10: '平靜', 20: '普通', 40: '洶湧' };
    ctx.fillText(`浪高: ${labels[waveHeight]}`, 20, 28);
}

function animate() {
    time++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSky();
    drawWave(canvas.height * 0.55, waveHeight * 0.6, 0.02, '#4682B4', 0.6);
    drawWave(canvas.height * 0.5, waveHeight * 0.8, 0.025, '#1E90FF', 0.7);
    drawWave(canvas.height * 0.45, waveHeight, 0.03, '#00BFFF', 0.8);
    drawFoam();
    drawBubbles();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('waveBtn').addEventListener('click', changeWaveHeight);

animate();
