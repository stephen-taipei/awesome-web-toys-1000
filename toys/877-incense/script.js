const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let isLit = false;
let burnLength = 0;
let smokeParticles = [];
let time = 0;

function toggleLight() {
    if (!isLit) {
        isLit = true;
        burnLength = 0;
    } else {
        isLit = false;
    }
}

function spawnSmoke() {
    if (!isLit) return;

    const tipY = 80 + burnLength;

    smokeParticles.push({
        x: canvas.width / 2,
        y: tipY,
        vx: 0,
        vy: -0.5 - Math.random() * 0.3,
        size: 2 + Math.random() * 3,
        alpha: 0.6,
        wobbleOffset: Math.random() * Math.PI * 2
    });
}

function updateSmoke() {
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];

        p.vx = Math.sin(time * 0.02 + p.y * 0.02 + p.wobbleOffset) * 0.5;
        p.x += p.vx;
        p.y += p.vy;
        p.size += 0.08;
        p.alpha -= 0.004;

        if (p.alpha <= 0 || p.y < -20) {
            smokeParticles.splice(i, 1);
        }
    }

    if (smokeParticles.length > 100) {
        smokeParticles = smokeParticles.slice(-80);
    }

    if (isLit && burnLength < 140) {
        burnLength += 0.02;
    }
}

function drawBackground() {
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawHolder() {
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 30, 40, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#654321';
    ctx.fillRect(canvas.width / 2 - 40, canvas.height - 30, 80, 30);

    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height, 40, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 30, 5, 0, Math.PI * 2);
    ctx.fill();
}

function drawIncense() {
    const startY = 80;
    const endY = canvas.height - 30;

    if (isLit) {
        ctx.fillStyle = '#808080';
        ctx.fillRect(canvas.width / 2 - 1, startY, 2, burnLength);
    }

    ctx.fillStyle = '#8B0000';
    ctx.fillRect(canvas.width / 2 - 1.5, startY + burnLength, 3, endY - startY - burnLength);

    if (isLit && burnLength < 140) {
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, startY + burnLength, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, startY + burnLength, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSmoke() {
    smokeParticles.forEach(p => {
        ctx.fillStyle = `rgba(200, 180, 220, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawAmbience() {
    if (isLit) {
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, 80 + burnLength, 0,
            canvas.width / 2, 80 + burnLength, 100
        );
        gradient.addColorStop(0, 'rgba(255, 100, 50, 0.05)');
        gradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(isLit ? '線香燃燒中' : '點擊點燃', 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawAmbience();
    drawHolder();
    drawIncense();
    spawnSmoke();
    updateSmoke();
    drawSmoke();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('lightBtn').addEventListener('click', toggleLight);

animate();
