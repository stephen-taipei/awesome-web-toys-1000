const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let moonX = -80;
let eclipsePhase = 0;
let isAnimating = false;
let stars = [];

function init() {
    stars = [];
    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5
        });
    }
}

function startEclipse() {
    if (!isAnimating) {
        isAnimating = true;
        moonX = -80;
        eclipsePhase = 0;
    }
}

function drawBackground() {
    const darkness = Math.max(0, 1 - Math.abs(moonX - canvas.width / 2) / 100);
    const skyBrightness = 1 - darkness * 0.9;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgb(${Math.floor(135 * skyBrightness)}, ${Math.floor(206 * skyBrightness)}, ${Math.floor(235 * skyBrightness)})`);
    gradient.addColorStop(1, `rgb(${Math.floor(100 * skyBrightness)}, ${Math.floor(149 * skyBrightness)}, ${Math.floor(237 * skyBrightness)})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (darkness > 0.5) {
        stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${(darkness - 0.5) * 2})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

function drawSun() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 50;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 3);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    const innerGradient = ctx.createRadialGradient(centerX - 15, centerY - 15, 0, centerX, centerY, radius);
    innerGradient.addColorStop(0, '#FFFACD');
    innerGradient.addColorStop(1, '#FFD700');
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCorona() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const darkness = Math.max(0, 1 - Math.abs(moonX - canvas.width / 2) / 30);

    if (darkness > 0.8) {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const length = 80 + Math.random() * 40;

            ctx.strokeStyle = `rgba(255, 255, 255, ${(darkness - 0.8) * 5 * 0.5})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX + Math.cos(angle) * 52, centerY + Math.sin(angle) * 52);
            ctx.lineTo(centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length);
            ctx.stroke();
        }

        const coronaGradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 120);
        coronaGradient.addColorStop(0, `rgba(255, 255, 255, ${(darkness - 0.8) * 5 * 0.3})`);
        coronaGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = coronaGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawMoon() {
    const centerY = canvas.height / 2;
    const radius = 52;

    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(moonX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 30);

    let phase = '部分日食';
    const dist = Math.abs(moonX - canvas.width / 2);
    if (dist < 5) phase = '日全食';
    else if (dist > 100) phase = '無日食';

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(phase, 20, 30);
}

function animate() {
    drawBackground();
    drawSun();
    drawCorona();
    drawMoon();
    drawInfo();

    if (isAnimating) {
        moonX += 1;
        if (moonX > canvas.width + 80) {
            isAnimating = false;
            moonX = -80;
        }
    }

    requestAnimationFrame(animate);
}

document.getElementById('startBtn').addEventListener('click', startEclipse);

init();
animate();
