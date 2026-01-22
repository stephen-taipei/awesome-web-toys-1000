const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let fogParticles = [];
let density = 0.5;
let time = 0;

function init() {
    for (let i = 0; i < 30; i++) {
        addFogParticle();
    }
}

function addFogParticle() {
    fogParticles.push({
        x: Math.random() * canvas.width * 1.5 - canvas.width * 0.25,
        y: Math.random() * canvas.height,
        size: 80 + Math.random() * 120,
        speed: 0.2 + Math.random() * 0.3,
        opacity: 0.1 + Math.random() * 0.2
    });
}

function increaseDensity() {
    density = Math.min(1, density + 0.15);
    for (let i = 0; i < 5; i++) addFogParticle();
}

function updateFog() {
    fogParticles.forEach(p => {
        p.x += p.speed;
        p.y += Math.sin(time * 0.01 + p.x * 0.01) * 0.3;

        if (p.x > canvas.width + p.size) {
            p.x = -p.size;
            p.y = Math.random() * canvas.height;
        }
    });

    density = Math.max(0.3, density - 0.001);

    if (fogParticles.length > 50) fogParticles = fogParticles.slice(-40);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#8899aa');
    gradient.addColorStop(0.5, '#99aabb');
    gradient.addColorStop(1, '#556677');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawDistantTrees() {
    const visibility = 1 - density;
    ctx.fillStyle = `rgba(60, 80, 60, ${visibility * 0.5})`;

    for (let i = 0; i < 8; i++) {
        const x = 30 + i * 50;
        const height = 40 + Math.sin(i) * 20;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 60);
        ctx.lineTo(x - 15, canvas.height - 60);
        ctx.lineTo(x - 7, canvas.height - 60 - height);
        ctx.lineTo(x + 7, canvas.height - 60 - height);
        ctx.lineTo(x + 15, canvas.height - 60);
        ctx.fill();
    }
}

function drawLake() {
    const visibility = 1 - density * 0.5;
    ctx.fillStyle = `rgba(100, 130, 150, ${visibility * 0.6})`;
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 30, 150, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(150, 180, 200, ${visibility * 0.3})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(50 + i * 60 + Math.sin(time * 0.02) * 5, canvas.height - 30);
        ctx.lineTo(80 + i * 60 + Math.sin(time * 0.02) * 5, canvas.height - 35);
        ctx.stroke();
    }
}

function drawFog() {
    fogParticles.forEach(p => {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(200, 210, 220, ${p.opacity * density})`);
        gradient.addColorStop(0.5, `rgba(180, 190, 200, ${p.opacity * density * 0.5})`);
        gradient.addColorStop(1, 'rgba(180, 190, 200, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawGround() {
    const visibility = 1 - density * 0.3;
    ctx.fillStyle = `rgba(70, 90, 70, ${visibility})`;
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`濃度: ${(density * 100).toFixed(0)}%`, 20, 28);
}

function animate() {
    time++;
    updateFog();
    drawBackground();
    drawDistantTrees();
    drawLake();
    drawGround();
    drawFog();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('densityBtn').addEventListener('click', increaseDensity);

init();
animate();
