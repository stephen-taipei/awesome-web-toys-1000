const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let moonY = 250;
let targetMoonY = 80;
let stars = [];
let clouds = [];
let time = 0;

function init() {
    stars = [];
    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height * 0.6),
            size: Math.random() * 1.5,
            twinkle: Math.random() * Math.PI * 2
        });
    }

    clouds = [];
    for (let i = 0; i < 3; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: 50 + Math.random() * 100,
            speed: 0.2 + Math.random() * 0.3
        });
    }
}

function raiseMoon() {
    targetMoonY = targetMoonY === 80 ? 180 : 80;
}

function drawSky() {
    const moonBrightness = 1 - (moonY - 80) / 170;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgb(${10 + moonBrightness * 30}, ${10 + moonBrightness * 30}, ${30 + moonBrightness * 30})`);
    gradient.addColorStop(0.6, `rgb(${30 + moonBrightness * 40}, ${30 + moonBrightness * 30}, ${60 + moonBrightness * 30})`);
    gradient.addColorStop(1, '#2d2d1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStars() {
    const visibility = Math.max(0, 1 - (moonY - 80) / 100);
    stars.forEach(star => {
        const twinkle = 0.5 + Math.sin(time * 0.05 + star.twinkle) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * visibility})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawMoon() {
    const cx = canvas.width / 2;

    const glowGradient = ctx.createRadialGradient(cx, moonY, 30, cx, moonY, 120);
    glowGradient.addColorStop(0, 'rgba(255, 220, 150, 0.4)');
    glowGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.1)');
    glowGradient.addColorStop(1, 'rgba(255, 180, 50, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(cx, moonY, 120, 0, Math.PI * 2);
    ctx.fill();

    const moonGradient = ctx.createRadialGradient(cx - 10, moonY - 10, 0, cx, moonY, 40);
    moonGradient.addColorStop(0, '#FFFACD');
    moonGradient.addColorStop(0.5, '#FFD700');
    moonGradient.addColorStop(1, '#DAA520');
    ctx.fillStyle = moonGradient;
    ctx.beginPath();
    ctx.arc(cx, moonY, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(200, 180, 100, 0.3)';
    ctx.beginPath();
    ctx.arc(cx - 15, moonY - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 10, moonY + 5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 5, moonY - 15, 5, 0, Math.PI * 2);
    ctx.fill();
}

function drawClouds() {
    clouds.forEach(cloud => {
        cloud.x += cloud.speed;
        if (cloud.x > canvas.width + 100) cloud.x = -100;

        ctx.fillStyle = 'rgba(50, 50, 70, 0.6)';
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 25, 0, Math.PI * 2);
        ctx.arc(cloud.x + 30, cloud.y - 10, 30, 0, Math.PI * 2);
        ctx.arc(cloud.x + 60, cloud.y, 25, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawLandscape() {
    ctx.fillStyle = '#1a1a0a';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height - 60);
    for (let x = 0; x <= canvas.width; x += 30) {
        ctx.lineTo(x, canvas.height - 60 - Math.sin(x * 0.02) * 20);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    ctx.fillStyle = '#2d2d1a';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
}

function drawGrass() {
    for (let i = 0; i < 50; i++) {
        const x = (i * 8) % canvas.width;
        const height = 15 + Math.sin(i + time * 0.03) * 5;
        ctx.strokeStyle = '#4a4a2a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 40);
        ctx.quadraticCurveTo(x + Math.sin(time * 0.02) * 3, canvas.height - 40 - height / 2, x, canvas.height - 40 - height);
        ctx.stroke();
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText('中秋快樂', 30, 28);
}

function animate() {
    time++;

    moonY += (targetMoonY - moonY) * 0.02;

    drawSky();
    drawStars();
    drawMoon();
    drawClouds();
    drawLandscape();
    drawGrass();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('phaseBtn').addEventListener('click', raiseMoon);

init();
animate();
