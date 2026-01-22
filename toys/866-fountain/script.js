const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let particles = [];
let fountainHeight = 10;
let time = 0;

function changeHeight() {
    fountainHeight = fountainHeight === 10 ? 15 : fountainHeight === 15 ? 7 : 10;
}

function spawnParticles() {
    for (let stream = 0; stream < 5; stream++) {
        const angle = (stream - 2) * 0.15;
        const baseX = canvas.width / 2 + (stream - 2) * 8;

        particles.push({
            x: baseX,
            y: canvas.height - 80,
            vx: Math.sin(angle) * 2 + (Math.random() - 0.5),
            vy: -fountainHeight - Math.random() * 2,
            size: 2 + Math.random() * 2,
            alpha: 0.8 + Math.random() * 0.2,
            stream: stream
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.2;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.008;

        if (p.y > canvas.height - 50 || p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    if (particles.length > 500) {
        particles = particles.slice(-300);
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#B0C4DE');
    gradient.addColorStop(1, '#2F4F4F');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPool() {
    ctx.fillStyle = '#4682B4';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 50, 120, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(135, 206, 250, 0.5)';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 55, 100, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 50, 125, 35, 0, 0, Math.PI);
    ctx.fill();
}

function drawFountainBase() {
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 30, canvas.height - 50);
    ctx.lineTo(canvas.width / 2 - 20, canvas.height - 80);
    ctx.lineTo(canvas.width / 2 + 20, canvas.height - 80);
    ctx.lineTo(canvas.width / 2 + 30, canvas.height - 50);
    ctx.fill();

    ctx.fillStyle = '#a0a0a0';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 80, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawParticles() {
    particles.forEach(p => {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
        gradient.addColorStop(1, `rgba(135, 206, 250, ${p.alpha * 0.5})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawWaterColumn() {
    const gradient = ctx.createLinearGradient(
        canvas.width / 2, canvas.height - 80,
        canvas.width / 2, canvas.height - 80 - fountainHeight * 8
    );
    gradient.addColorStop(0, 'rgba(135, 206, 250, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 8, canvas.height - 80);
    ctx.quadraticCurveTo(
        canvas.width / 2, canvas.height - 80 - fountainHeight * 8,
        canvas.width / 2 + 8, canvas.height - 80
    );
    ctx.fill();
}

function drawRipples() {
    const rippleCount = 3;
    for (let i = 0; i < rippleCount; i++) {
        const phase = (time * 0.05 + i * 0.3) % 1;
        const radius = 20 + phase * 80;
        const alpha = (1 - phase) * 0.3;

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height - 50, radius, radius * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    const labels = { 7: '低', 10: '中', 15: '高' };
    ctx.fillText(`高度: ${labels[fountainHeight]}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawPool();
    drawRipples();
    drawFountainBase();
    drawWaterColumn();
    spawnParticles();
    updateParticles();
    drawParticles();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('heightBtn').addEventListener('click', changeHeight);

animate();
