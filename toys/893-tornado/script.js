const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let debris = [];
let power = 1;
let time = 0;

function init() {
    for (let i = 0; i < 50; i++) {
        addDebris();
    }
}

function addDebris() {
    debris.push({
        angle: Math.random() * Math.PI * 2,
        radius: 20 + Math.random() * 80,
        y: canvas.height - 50 - Math.random() * 200,
        speed: 0.02 + Math.random() * 0.03,
        size: 2 + Math.random() * 4,
        color: Math.random() < 0.5 ? '#8B4513' : '#2F4F4F'
    });
}

function increasePower() {
    power = Math.min(3, power + 0.5);
    for (let i = 0; i < 10; i++) addDebris();
}

function updateDebris() {
    debris.forEach(d => {
        d.angle += d.speed * power;
        d.y -= 0.5 * power;
        d.radius += Math.sin(time * 0.05) * 0.5;

        if (d.y < -20) {
            d.y = canvas.height - 50;
            d.radius = 20 + Math.random() * 80;
        }
    });

    power = Math.max(1, power - 0.002);

    if (debris.length > 100) debris = debris.slice(-80);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4a5568');
    gradient.addColorStop(0.6, '#718096');
    gradient.addColorStop(1, '#2d3748');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawTornado() {
    const centerX = canvas.width / 2;
    const baseY = canvas.height - 30;

    for (let y = baseY; y > 20; y -= 5) {
        const progress = (baseY - y) / (baseY - 20);
        const width = 10 + progress * 60 * power;
        const wobble = Math.sin(y * 0.05 + time * 0.1) * 10 * power;

        ctx.fillStyle = `rgba(100, 100, 120, ${0.3 - progress * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(centerX + wobble, y, width, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = 'rgba(80, 80, 100, 0.5)';
    ctx.beginPath();
    ctx.moveTo(centerX - 10, baseY);
    ctx.quadraticCurveTo(centerX - 80 * power, baseY - 150, centerX - 60 * power, 20);
    ctx.lineTo(centerX + 60 * power, 20);
    ctx.quadraticCurveTo(centerX + 80 * power, baseY - 150, centerX + 10, baseY);
    ctx.fill();
}

function drawDebris() {
    const centerX = canvas.width / 2;

    debris.forEach(d => {
        const x = centerX + Math.cos(d.angle) * d.radius;
        const wobble = Math.sin(d.y * 0.02 + time * 0.05) * 5;

        ctx.fillStyle = d.color;
        ctx.fillRect(x + wobble - d.size / 2, d.y - d.size / 2, d.size, d.size);
    });
}

function drawGround() {
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    ctx.fillStyle = '#4a5568';
    for (let i = 0; i < 20; i++) {
        ctx.fillRect(i * 20, canvas.height - 35 + Math.sin(i + time * 0.1) * 3, 15, 5);
    }
}

function drawClouds() {
    ctx.fillStyle = '#4a5568';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 30, 100, 0, Math.PI * 2);
    ctx.arc(canvas.width / 2 - 70, 40, 60, 0, Math.PI * 2);
    ctx.arc(canvas.width / 2 + 70, 40, 60, 0, Math.PI * 2);
    ctx.fill();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`風力: ${power.toFixed(1)}x`, 20, 28);
}

function animate() {
    time++;
    updateDebris();
    drawBackground();
    drawClouds();
    drawTornado();
    drawDebris();
    drawGround();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('powerBtn').addEventListener('click', increasePower);

init();
animate();
