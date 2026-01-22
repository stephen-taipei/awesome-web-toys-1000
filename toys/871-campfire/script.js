const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let particles = [];
let embers = [];
let windStrength = 0;
let time = 0;

function blowWind() {
    windStrength = 3;
}

function spawnParticles() {
    for (let i = 0; i < 3; i++) {
        particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 30,
            y: canvas.height - 80,
            vx: (Math.random() - 0.5) * 2 + windStrength * 0.5,
            vy: -3 - Math.random() * 3,
            size: 10 + Math.random() * 20,
            life: 1,
            hue: 30 + Math.random() * 30
        });
    }

    if (Math.random() < 0.2) {
        embers.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 20,
            y: canvas.height - 90,
            vx: (Math.random() - 0.5) * 3 + windStrength,
            vy: -2 - Math.random() * 4,
            size: 1 + Math.random() * 2,
            life: 1
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx += windStrength * 0.05;
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 0.98;
        p.life -= 0.025;

        if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.vx += windStrength * 0.02;
        e.vy += 0.02;
        e.x += e.vx;
        e.y += e.vy;
        e.life -= 0.01;

        if (e.life <= 0 || e.y < 0) embers.splice(i, 1);
    }

    windStrength *= 0.98;

    if (particles.length > 100) particles = particles.slice(-80);
    if (embers.length > 50) embers = embers.slice(-30);
}

function drawBackground() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc((i * 47) % canvas.width, (i * 23) % (canvas.height * 0.5), 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGround() {
    ctx.fillStyle = '#2d2d1a';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
}

function drawLogs() {
    ctx.fillStyle = '#4a3728';
    ctx.save();
    ctx.translate(canvas.width / 2 - 40, canvas.height - 55);
    ctx.rotate(-0.3);
    ctx.fillRect(0, 0, 80, 15);
    ctx.restore();

    ctx.save();
    ctx.translate(canvas.width / 2 - 30, canvas.height - 50);
    ctx.rotate(0.3);
    ctx.fillRect(0, 0, 70, 12);
    ctx.restore();

    ctx.fillStyle = '#3a2718';
    ctx.save();
    ctx.translate(canvas.width / 2 - 20, canvas.height - 60);
    ctx.rotate(0.1);
    ctx.fillRect(0, 0, 50, 10);
    ctx.restore();
}

function drawFire() {
    particles.forEach(p => {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.life})`);
        gradient.addColorStop(0.4, `hsla(${p.hue - 10}, 100%, 50%, ${p.life * 0.7})`);
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

function drawGlow() {
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height - 80, 0,
        canvas.width / 2, canvas.height - 80, 150
    );
    gradient.addColorStop(0, 'rgba(255, 100, 0, 0.2)');
    gradient.addColorStop(0.5, 'rgba(255, 50, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(windStrength > 0.5 ? '風吹中...' : '營火燃燒', 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawGlow();
    drawGround();
    drawLogs();
    spawnParticles();
    updateParticles();
    drawFire();
    drawEmbers();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('windBtn').addEventListener('click', blowWind);

animate();
