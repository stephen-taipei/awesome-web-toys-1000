const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let waterParticles = [];
let steamParticles = [];
let pressure = 0;
let isErupting = false;
let eruptionTimer = 0;
let bubbles = [];

function erupt() {
    if (!isErupting) {
        pressure = 100;
        isErupting = true;
        eruptionTimer = 150;
    }
}

function updatePressure() {
    if (!isErupting) {
        pressure += 0.2;
        if (pressure >= 100) {
            erupt();
        }

        if (pressure > 50 && Math.random() < pressure / 200) {
            bubbles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 20,
                y: canvas.height - 60,
                size: 2 + Math.random() * 3,
                vy: -1 - Math.random()
            });
        }
    } else {
        eruptionTimer--;

        for (let i = 0; i < 5; i++) {
            waterParticles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 15,
                y: canvas.height - 70,
                vx: (Math.random() - 0.5) * 4,
                vy: -10 - Math.random() * 8,
                size: 3 + Math.random() * 4,
                alpha: 1
            });
        }

        for (let i = 0; i < 3; i++) {
            steamParticles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 30,
                y: canvas.height - 100 - Math.random() * 50,
                vx: (Math.random() - 0.5) * 2,
                vy: -2 - Math.random() * 2,
                size: 10 + Math.random() * 15,
                alpha: 0.6
            });
        }

        if (eruptionTimer <= 0) {
            isErupting = false;
            pressure = 0;
        }
    }
}

function updateParticles() {
    for (let i = waterParticles.length - 1; i >= 0; i--) {
        const p = waterParticles[i];
        p.vy += 0.3;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.01;

        if (p.y > canvas.height - 50 || p.alpha <= 0) {
            waterParticles.splice(i, 1);
        }
    }

    for (let i = steamParticles.length - 1; i >= 0; i--) {
        const p = steamParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.size += 0.5;
        p.alpha -= 0.01;

        if (p.alpha <= 0) {
            steamParticles.splice(i, 1);
        }
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
        bubbles[i].y += bubbles[i].vy;
        if (bubbles[i].y < canvas.height - 70) {
            bubbles.splice(i, 1);
        }
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#B0C4DE');
    gradient.addColorStop(1, '#2F4F4F');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGround() {
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 50, 60, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4682B4';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 55, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5F9EA0';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 55, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawBubbles() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    bubbles.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawWater() {
    waterParticles.forEach(p => {
        ctx.fillStyle = `rgba(135, 206, 250, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawSteam() {
    steamParticles.forEach(p => {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawPressureGauge() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 60);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText('壓力', 15, 25);

    ctx.fillStyle = '#333';
    ctx.fillRect(15, 35, 80, 15);

    const pressureColor = pressure > 80 ? '#FF4500' : pressure > 50 ? '#FFD700' : '#4CAF50';
    ctx.fillStyle = pressureColor;
    ctx.fillRect(15, 35, pressure * 0.8, 15);

    ctx.fillStyle = '#fff';
    ctx.fillText(`${Math.round(pressure)}%`, 15, 62);

    if (isErupting) {
        ctx.fillStyle = '#FF4500';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('噴發中!', 55, 62);
    }
}

function animate() {
    drawBackground();
    drawGround();
    drawBubbles();
    drawWater();
    drawSteam();
    drawPressureGauge();
    updatePressure();
    updateParticles();
    requestAnimationFrame(animate);
}

document.getElementById('eruptBtn').addEventListener('click', erupt);

animate();
