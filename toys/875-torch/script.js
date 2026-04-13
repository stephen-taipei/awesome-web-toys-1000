const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let particles = [];
let embers = [];
let swingAngle = 0;
let swingVelocity = 0;
let time = 0;

function swing() {
    swingVelocity = 0.3;
}

function spawnParticles() {
    const torchX = canvas.width / 2 + Math.sin(swingAngle) * 30;
    const torchY = 100;

    for (let i = 0; i < 3; i++) {
        particles.push({
            x: torchX + (Math.random() - 0.5) * 15,
            y: torchY,
            vx: (Math.random() - 0.5) * 2 + swingVelocity * 10,
            vy: -3 - Math.random() * 2,
            size: 8 + Math.random() * 15,
            life: 1,
            hue: 20 + Math.random() * 30
        });
    }

    if (Math.random() < 0.3) {
        embers.push({
            x: torchX + (Math.random() - 0.5) * 10,
            y: torchY,
            vx: (Math.random() - 0.5) * 4 + swingVelocity * 15,
            vy: -2 - Math.random() * 3,
            size: 1 + Math.random() * 2,
            life: 1
        });
    }
}

function updateParticles() {
    swingAngle += swingVelocity;
    swingVelocity *= 0.95;
    swingAngle *= 0.98;

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 0.97;
        p.life -= 0.03;

        if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.vy += 0.02;
        e.x += e.vx;
        e.y += e.vy;
        e.life -= 0.015;

        if (e.life <= 0) embers.splice(i, 1);
    }

    if (particles.length > 80) particles = particles.slice(-60);
    if (embers.length > 30) embers = embers.slice(-20);
}

function drawBackground() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const torchX = canvas.width / 2 + Math.sin(swingAngle) * 30;
    const gradient = ctx.createRadialGradient(torchX, 100, 0, torchX, 100, 200);
    gradient.addColorStop(0, 'rgba(255, 100, 0, 0.2)');
    gradient.addColorStop(0.5, 'rgba(255, 50, 0, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawTorch() {
    const baseX = canvas.width / 2;
    const torchX = baseX + Math.sin(swingAngle) * 30;

    ctx.save();
    ctx.translate(baseX, canvas.height);
    ctx.rotate(swingAngle * 0.3);

    ctx.fillStyle = '#4a3020';
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(-6, -180);
    ctx.lineTo(6, -180);
    ctx.lineTo(8, 0);
    ctx.fill();

    ctx.fillStyle = '#3a2010';
    ctx.fillRect(-10, -185, 20, 15);
    ctx.fillRect(-12, -190, 24, 10);

    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.ellipse(0, -190, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawFlame() {
    particles.forEach(p => {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.life})`);
        gradient.addColorStop(0.5, `hsla(${p.hue - 10}, 100%, 50%, ${p.life * 0.6})`);
        gradient.addColorStop(1, `hsla(${p.hue - 20}, 100%, 30%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEmbers() {
    embers.forEach(e => {
        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 50, ${e.life})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawWall() {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, 50, canvas.height);
    ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);

    ctx.fillStyle = '#1a1a1a';
    for (let y = 0; y < canvas.height; y += 30) {
        ctx.fillRect(0, y, 50, 2);
        ctx.fillRect(canvas.width - 50, y, 50, 2);
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText('點擊揮動火炬', 15, 28);
}

function animate() {
    time++;
    drawBackground();
    drawWall();
    spawnParticles();
    updateParticles();
    drawFlame();
    drawEmbers();
    drawTorch();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('swingBtn').addEventListener('click', swing);

animate();
