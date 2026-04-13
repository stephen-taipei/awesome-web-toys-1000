const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let particles = [];
let colorIndex = 0;
let time = 0;

const colorSchemes = [
    { r: 80, g: 80, b: 80 },
    { r: 50, g: 50, b: 60 },
    { r: 100, g: 80, b: 60 },
    { r: 60, g: 80, b: 100 }
];

function changeColor() {
    colorIndex = (colorIndex + 1) % colorSchemes.length;
}

function spawnParticles() {
    const color = colorSchemes[colorIndex];
    for (let i = 0; i < 2; i++) {
        particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 10,
            y: canvas.height - 60,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -1 - Math.random() * 0.5,
            size: 8 + Math.random() * 10,
            alpha: 0.6 + Math.random() * 0.2,
            r: color.r + Math.random() * 30,
            g: color.g + Math.random() * 30,
            b: color.b + Math.random() * 30
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.vx += Math.sin(time * 0.02 + p.y * 0.01) * 0.02;
        p.x += p.vx;
        p.y += p.vy;
        p.size += 0.3;
        p.alpha -= 0.005;

        if (p.alpha <= 0 || p.y < -50) {
            particles.splice(i, 1);
        }
    }

    if (particles.length > 150) {
        particles = particles.slice(-100);
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#B0C4DE');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawChimney() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(canvas.width / 2 - 20, canvas.height - 80, 40, 80);

    ctx.fillStyle = '#A0522D';
    ctx.fillRect(canvas.width / 2 - 25, canvas.height - 80, 50, 10);

    ctx.fillStyle = '#654321';
    for (let y = canvas.height - 70; y < canvas.height; y += 15) {
        ctx.fillRect(canvas.width / 2 - 20, y, 40, 2);
    }

    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 75, 15, 5, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawSmoke() {
    particles.forEach(p => {
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawRoof() {
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 100, canvas.height - 20);
    ctx.lineTo(canvas.width / 2, canvas.height - 80);
    ctx.lineTo(canvas.width / 2 + 100, canvas.height - 20);
    ctx.fill();

    ctx.fillStyle = '#8B4513';
    for (let i = 0; i < 5; i++) {
        const y = canvas.height - 30 - i * 12;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 80 + i * 8, y);
        ctx.lineTo(canvas.width / 2 + 80 - i * 8, y);
        ctx.lineTo(canvas.width / 2 + 75 - i * 8, y + 8);
        ctx.lineTo(canvas.width / 2 - 75 + i * 8, y + 8);
        ctx.fill();
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    const names = ['灰色', '深藍', '棕色', '藍灰'];
    ctx.fillText(`顏色: ${names[colorIndex]}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();
    spawnParticles();
    updateParticles();
    drawSmoke();
    drawRoof();
    drawChimney();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('colorBtn').addEventListener('click', changeColor);

animate();
