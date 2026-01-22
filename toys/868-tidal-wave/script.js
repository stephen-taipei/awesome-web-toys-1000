const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let tideLevel = 0;
let targetTide = 0;
let time = 0;

function toggleTide() {
    targetTide = targetTide === 0 ? 1 : targetTide === 1 ? -1 : 0;
}

function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.5);
    gradient.addColorStop(0, '#0a0a2a');
    gradient.addColorStop(1, '#1a1a4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.5);

    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc((i * 47) % canvas.width, (i * 23) % (canvas.height * 0.4), 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawMoon() {
    const moonX = canvas.width - 60;
    const moonY = 50;

    ctx.fillStyle = '#F5F5DC';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(200, 200, 180, 0.3)';
    ctx.beginPath();
    ctx.arc(moonX - 8, moonY - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX + 10, moonY + 8, 4, 0, Math.PI * 2);
    ctx.fill();

    const glowGradient = ctx.createRadialGradient(moonX, moonY, 25, moonX, moonY, 60);
    glowGradient.addColorStop(0, 'rgba(245, 245, 220, 0.3)');
    glowGradient.addColorStop(1, 'rgba(245, 245, 220, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 60, 0, Math.PI * 2);
    ctx.fill();

    if (targetTide !== 0) {
        ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(moonX, moonY + 30);
        ctx.lineTo(canvas.width / 2, canvas.height * 0.5 + tideLevel * 30);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawBeach() {
    ctx.fillStyle = '#DEB887';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.6);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, canvas.height * 0.5);
    ctx.quadraticCurveTo(canvas.width * 0.5, canvas.height * 0.55, 0, canvas.height * 0.6);
    ctx.fill();

    ctx.fillStyle = 'rgba(160, 140, 100, 0.5)';
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(
            Math.random() * canvas.width,
            canvas.height * 0.65 + Math.random() * (canvas.height * 0.35),
            2 + Math.random() * 3,
            0, Math.PI * 2
        );
        ctx.fill();
    }
}

function drawWater() {
    const baseY = canvas.height * 0.5 + tideLevel * 30;

    for (let layer = 0; layer < 3; layer++) {
        const yOffset = layer * 15;
        const alpha = 0.6 - layer * 0.15;

        ctx.fillStyle = `rgba(70, 130, 180, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 5) {
            const waveHeight = Math.sin(x * 0.03 + time * 0.03 + layer) * 8 +
                              Math.sin(x * 0.01 + time * 0.02) * 5;
            ctx.lineTo(x, baseY + yOffset + waveHeight);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let x = 0; x < canvas.width; x += 30) {
        const waveY = baseY + Math.sin(x * 0.03 + time * 0.03) * 8;
        ctx.beginPath();
        ctx.ellipse(x + Math.sin(time * 0.02) * 5, waveY - 3, 15, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawTideMarkers() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;

    const highY = canvas.height * 0.5 - 30;
    ctx.beginPath();
    ctx.moveTo(0, highY);
    ctx.lineTo(50, highY);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px Arial';
    ctx.fillText('高潮', 5, highY - 5);

    const lowY = canvas.height * 0.5 + 30;
    ctx.beginPath();
    ctx.moveTo(0, lowY);
    ctx.lineTo(50, lowY);
    ctx.stroke();
    ctx.fillText('低潮', 5, lowY - 5);

    ctx.setLineDash([]);
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    const labels = { '-1': '退潮', '0': '平潮', '1': '漲潮' };
    ctx.fillText(`狀態: ${labels[targetTide]}`, 20, 28);
}

function animate() {
    time++;

    if (Math.abs(tideLevel - targetTide) > 0.01) {
        tideLevel += (targetTide - tideLevel) * 0.02;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSky();
    drawMoon();
    drawBeach();
    drawWater();
    drawTideMarkers();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('tideBtn').addEventListener('click', toggleTide);

animate();
