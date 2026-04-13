const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let particles = [];
let splashParticles = [];
let flowRate = 5;

function changeFlow() {
    flowRate = flowRate === 5 ? 10 : flowRate === 10 ? 3 : 5;
}

function spawnParticles() {
    for (let i = 0; i < flowRate; i++) {
        particles.push({
            x: 150 + Math.random() * 70,
            y: 60,
            vx: (Math.random() - 0.5) * 2,
            vy: 2 + Math.random() * 2,
            size: 2 + Math.random() * 3,
            alpha: 0.6 + Math.random() * 0.4
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.2;
        p.x += p.vx;
        p.y += p.vy;

        if (p.y > canvas.height - 60) {
            for (let j = 0; j < 3; j++) {
                splashParticles.push({
                    x: p.x,
                    y: canvas.height - 60,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -2 - Math.random() * 3,
                    size: 1 + Math.random() * 2,
                    alpha: 0.8,
                    life: 1
                });
            }
            particles.splice(i, 1);
        }
    }

    for (let i = splashParticles.length - 1; i >= 0; i--) {
        const p = splashParticles[i];
        p.vy += 0.15;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        p.alpha = p.life;

        if (p.life <= 0) {
            splashParticles.splice(i, 1);
        }
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#228B22');
    gradient.addColorStop(0.3, '#2F4F4F');
    gradient.addColorStop(1, '#1a3333');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCliffs() {
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(140, canvas.height);
    ctx.lineTo(140, 60);
    ctx.lineTo(0, 60);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(230, canvas.height);
    ctx.lineTo(230, 60);
    ctx.lineTo(canvas.width, 60);
    ctx.fill();

    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(140, 55, 90, 10);

    ctx.fillStyle = '#3a3a3a';
    for (let i = 0; i < 10; i++) {
        ctx.fillRect(145 + i * 8, 55, 4, 10);
    }
}

function drawPool() {
    ctx.fillStyle = '#006994';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 30, 150, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 150, 200, 0.5)';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 35, 120, 20, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawWaterfall() {
    ctx.fillStyle = 'rgba(150, 220, 255, 0.3)';
    ctx.fillRect(150, 60, 70, canvas.height - 120);

    ctx.fillStyle = 'rgba(200, 240, 255, 0.5)';
    for (let y = 60; y < canvas.height - 60; y += 10) {
        const offset = Math.sin(y * 0.1 + Date.now() * 0.01) * 5;
        ctx.fillRect(160 + offset, y, 50, 8);
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = `rgba(200, 240, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    splashParticles.forEach(p => {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawMist() {
    for (let i = 0; i < 20; i++) {
        const x = 100 + Math.random() * 170;
        const y = canvas.height - 80 - Math.random() * 40;
        const size = 5 + Math.random() * 15;

        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.1})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawVegetation() {
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(10 + i * 25, 60);
        ctx.lineTo(20 + i * 25, 30);
        ctx.lineTo(30 + i * 25, 60);
        ctx.fill();
    }

    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(250 + i * 25, 60);
        ctx.lineTo(260 + i * 25, 30);
        ctx.lineTo(270 + i * 25, 60);
        ctx.fill();
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    const labels = { 3: '小', 5: '中', 10: '大' };
    ctx.fillText(`水量: ${labels[flowRate]}`, 20, 28);
}

function animate() {
    drawBackground();
    drawCliffs();
    drawPool();
    drawWaterfall();
    spawnParticles();
    updateParticles();
    drawParticles();
    drawMist();
    drawVegetation();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('flowBtn').addEventListener('click', changeFlow);

animate();
