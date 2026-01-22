const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let steamParticles = [];
let bubbles = [];
let isBoiling = false;
let heatLevel = 0;
let time = 0;

function toggleBoil() {
    isBoiling = !isBoiling;
}

function spawnSteam() {
    const rate = heatLevel * 0.05;
    if (Math.random() < rate) {
        steamParticles.push({
            x: 130 + Math.random() * 110,
            y: 140,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -1 - Math.random() * 1,
            size: 5 + Math.random() * 15,
            alpha: 0.4 + Math.random() * 0.3,
            life: 1
        });
    }
}

function spawnBubbles() {
    if (heatLevel > 50 && Math.random() < (heatLevel - 50) * 0.01) {
        bubbles.push({
            x: 130 + Math.random() * 110,
            y: 230,
            vy: -1 - Math.random() * 2,
            size: 2 + Math.random() * 4,
            wobble: Math.random() * Math.PI * 2
        });
    }
}

function updateParticles() {
    for (let i = steamParticles.length - 1; i >= 0; i--) {
        const p = steamParticles[i];
        p.x += p.vx + Math.sin(time * 0.05 + i) * 0.3;
        p.y += p.vy;
        p.size += 0.2;
        p.life -= 0.008;
        p.alpha = p.life * 0.5;

        if (p.life <= 0 || p.y < 0) {
            steamParticles.splice(i, 1);
        }
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.x += Math.sin(time * 0.1 + b.wobble) * 0.5;
        b.y += b.vy;

        if (b.y < 145) {
            bubbles.splice(i, 1);
        }
    }

    if (steamParticles.length > 100) {
        steamParticles = steamParticles.slice(-80);
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#2F4F4F');
    gradient.addColorStop(1, '#1a3030');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPot() {
    ctx.fillStyle = '#404040';
    ctx.beginPath();
    ctx.moveTo(120, 140);
    ctx.lineTo(110, 240);
    ctx.lineTo(260, 240);
    ctx.lineTo(250, 140);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#505050';
    ctx.beginPath();
    ctx.ellipse(185, 140, 65, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#353535';
    ctx.fillRect(95, 135, 25, 15);
    ctx.fillRect(250, 135, 25, 15);
}

function drawWater() {
    const waterGradient = ctx.createLinearGradient(0, 145, 0, 235);
    const heat = heatLevel / 100;
    waterGradient.addColorStop(0, `rgba(${100 + heat * 50}, ${150 - heat * 30}, ${200 - heat * 50}, 0.8)`);
    waterGradient.addColorStop(1, `rgba(${80 + heat * 70}, ${120 - heat * 40}, ${180 - heat * 60}, 0.9)`);
    ctx.fillStyle = waterGradient;

    ctx.beginPath();
    ctx.moveTo(122, 235);
    for (let x = 122; x <= 248; x += 5) {
        const wave = heatLevel > 30 ? Math.sin(x * 0.1 + time * 0.1) * (heatLevel / 30) : 0;
        ctx.lineTo(x, 150 + wave);
    }
    ctx.lineTo(248, 235);
    ctx.closePath();
    ctx.fill();
}

function drawBubbles() {
    bubbles.forEach(b => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function drawSteam() {
    steamParticles.forEach(p => {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawFlame() {
    if (heatLevel > 0) {
        const flameIntensity = heatLevel / 100;

        for (let i = 0; i < 5; i++) {
            const x = 140 + i * 25;
            const flicker = Math.sin(time * 0.2 + i) * 5;
            const height = 20 + flameIntensity * 20 + flicker;

            const flameGradient = ctx.createLinearGradient(x, 260, x, 260 - height);
            flameGradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
            flameGradient.addColorStop(0.5, 'rgba(255, 200, 50, 0.6)');
            flameGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');

            ctx.fillStyle = flameGradient;
            ctx.beginPath();
            ctx.moveTo(x - 8, 260);
            ctx.quadraticCurveTo(x + flicker * 0.3, 260 - height * 0.7, x, 260 - height);
            ctx.quadraticCurveTo(x - flicker * 0.3, 260 - height * 0.7, x + 8, 260);
            ctx.fill();
        }
    }
}

function drawStove() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(80, 255, 210, 30);

    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.ellipse(185, 255, 75, 10, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`溫度: ${Math.round(heatLevel)}°C`, 20, 28);
}

function update() {
    if (isBoiling) {
        heatLevel = Math.min(100, heatLevel + 0.5);
    } else {
        heatLevel = Math.max(0, heatLevel - 0.3);
    }
}

function animate() {
    time++;
    update();
    drawBackground();
    drawStove();
    drawFlame();
    drawPot();
    drawWater();
    spawnBubbles();
    drawBubbles();
    spawnSteam();
    updateParticles();
    drawSteam();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('boilBtn').addEventListener('click', toggleBoil);

animate();
