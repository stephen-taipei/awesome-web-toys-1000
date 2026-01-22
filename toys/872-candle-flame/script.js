const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let isLit = true;
let flameIntensity = 1;
let smokeParticles = [];
let time = 0;

function blowCandle() {
    if (isLit) {
        isLit = false;
        flameIntensity = 0;
        for (let i = 0; i < 20; i++) {
            smokeParticles.push({
                x: canvas.width / 2,
                y: canvas.height - 150,
                vx: (Math.random() - 0.5) * 2,
                vy: -1 - Math.random() * 2,
                size: 5 + Math.random() * 10,
                alpha: 0.6
            });
        }
    } else {
        isLit = true;
        flameIntensity = 1;
    }
}

function updateSmoke() {
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        p.x += p.vx + Math.sin(time * 0.05 + i) * 0.3;
        p.y += p.vy;
        p.size += 0.3;
        p.alpha -= 0.01;

        if (p.alpha <= 0) smokeParticles.splice(i, 1);
    }
}

function drawBackground() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isLit) {
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height - 140, 0,
            canvas.width / 2, canvas.height - 140, 200
        );
        gradient.addColorStop(0, 'rgba(255, 200, 100, 0.15)');
        gradient.addColorStop(0.5, 'rgba(255, 150, 50, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawTable() {
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 5);
}

function drawCandle() {
    const cx = canvas.width / 2;
    const candleTop = canvas.height - 150;

    ctx.fillStyle = '#f5f5dc';
    ctx.beginPath();
    ctx.moveTo(cx - 25, canvas.height - 50);
    ctx.lineTo(cx - 20, candleTop);
    ctx.lineTo(cx + 20, candleTop);
    ctx.lineTo(cx + 25, canvas.height - 50);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cx - 5, candleTop + 30, 5, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.fillRect(cx - 1, candleTop - 10, 2, 15);

    const gradient = ctx.createLinearGradient(cx - 5, candleTop, cx + 5, canvas.height - 50);
    gradient.addColorStop(0, 'rgba(200, 180, 150, 0.3)');
    gradient.addColorStop(1, 'rgba(200, 180, 150, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(cx - 10, candleTop, 20, 100);
}

function drawFlame() {
    if (!isLit) return;

    const cx = canvas.width / 2;
    const cy = canvas.height - 165;
    const flicker = Math.sin(time * 0.3) * 3 + Math.sin(time * 0.5) * 2;

    const outerGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
    outerGradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
    outerGradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.8)');
    outerGradient.addColorStop(0.6, 'rgba(255, 100, 50, 0.5)');
    outerGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 25 + flicker);
    ctx.quadraticCurveTo(cx + 15, cy - 10, cx + 8, cy + 10);
    ctx.quadraticCurveTo(cx, cy + 15, cx - 8, cy + 10);
    ctx.quadraticCurveTo(cx - 15, cy - 10, cx, cy - 25 + flicker);
    ctx.fill();

    ctx.fillStyle = 'rgba(100, 150, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 3, 8, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawSmoke() {
    smokeParticles.forEach(p => {
        ctx.fillStyle = `rgba(100, 100, 100, ${p.alpha})`;
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
    ctx.fillText(isLit ? '蠟燭燃燒中' : '已熄滅', 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawTable();
    drawCandle();
    drawFlame();
    updateSmoke();
    drawSmoke();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('blowBtn').addEventListener('click', blowCandle);

animate();
