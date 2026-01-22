const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let isLit = false;
let burnTime = 0;
let sparkParticles = [];
let flameParticles = [];
let time = 0;

function strikeMatch() {
    if (!isLit) {
        for (let i = 0; i < 30; i++) {
            sparkParticles.push({
                x: canvas.width / 2,
                y: 100,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: 1 + Math.random() * 2,
                life: 1
            });
        }
        setTimeout(() => {
            isLit = true;
            burnTime = 0;
        }, 200);
    }
}

function spawnFlame() {
    if (!isLit || burnTime > 300) return;

    flameParticles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 5,
        y: 85,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -1 - Math.random() * 1.5,
        size: 5 + Math.random() * 8,
        life: 1,
        hue: 30 + Math.random() * 20
    });
}

function updateParticles() {
    for (let i = sparkParticles.length - 1; i >= 0; i--) {
        const p = sparkParticles[i];
        p.vy += 0.2;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;

        if (p.life <= 0) sparkParticles.splice(i, 1);
    }

    for (let i = flameParticles.length - 1; i >= 0; i--) {
        const p = flameParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 0.97;
        p.life -= 0.04;

        if (p.life <= 0) flameParticles.splice(i, 1);
    }

    if (isLit) {
        burnTime++;
        if (burnTime > 350) {
            isLit = false;
        }
    }
}

function drawBackground() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isLit && burnTime < 300) {
        const intensity = Math.min(1, burnTime / 50) * (1 - Math.max(0, (burnTime - 250) / 50));
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, 90, 0,
            canvas.width / 2, 90, 150
        );
        gradient.addColorStop(0, `rgba(255, 150, 50, ${0.2 * intensity})`);
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawMatchbox() {
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(50, canvas.height - 80, 100, 60);

    ctx.fillStyle = '#A52A2A';
    ctx.fillRect(50, canvas.height - 80, 100, 10);

    ctx.fillStyle = '#222';
    ctx.fillRect(55, canvas.height - 65, 90, 40);

    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText('MATCHES', 70, canvas.height - 40);
}

function drawMatch() {
    const matchY = burnTime > 300 ? 100 + (burnTime - 300) * 0.1 : 100;

    ctx.fillStyle = '#DEB887';
    ctx.fillRect(canvas.width / 2 - 3, matchY, 6, 150);

    if (burnTime < 250) {
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, matchY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#A52A2A';
        ctx.beginPath();
        ctx.arc(canvas.width / 2 - 2, matchY - 2, 3, 0, Math.PI * 2);
        ctx.fill();
    } else if (burnTime < 350) {
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, matchY, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSparks() {
    sparkParticles.forEach(p => {
        ctx.fillStyle = `rgba(255, 200, 50, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawFlame() {
    flameParticles.forEach(p => {
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

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    let status = '點擊點燃';
    if (isLit && burnTime < 300) status = '燃燒中';
    else if (burnTime >= 300) status = '已熄滅';
    ctx.fillText(status, 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawMatchbox();
    drawMatch();
    spawnFlame();
    updateParticles();
    drawSparks();
    drawFlame();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('strikeBtn').addEventListener('click', strikeMatch);

animate();
