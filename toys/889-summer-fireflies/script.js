const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let fireflies = [];
let stars = [];
let time = 0;

function init() {
    for (let i = 0; i < 15; i++) {
        addFirefly();
    }

    stars = [];
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height * 0.5),
            size: Math.random() * 1.2
        });
    }
}

function addFirefly() {
    fireflies.push({
        x: Math.random() * canvas.width,
        y: 50 + Math.random() * (canvas.height - 100),
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        phase: Math.random() * Math.PI * 2,
        glowSpeed: 0.05 + Math.random() * 0.05,
        size: 3 + Math.random() * 2
    });
}

function updateFireflies() {
    fireflies.forEach(f => {
        f.vx += (Math.random() - 0.5) * 0.1;
        f.vy += (Math.random() - 0.5) * 0.1;
        f.vx *= 0.98;
        f.vy *= 0.98;

        f.x += f.vx;
        f.y += f.vy;

        if (f.x < 20) f.vx += 0.1;
        if (f.x > canvas.width - 20) f.vx -= 0.1;
        if (f.y < 30) f.vy += 0.1;
        if (f.y > canvas.height - 50) f.vy -= 0.1;

        f.phase += f.glowSpeed;
    });
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0a2a');
    gradient.addColorStop(0.6, '#1a2a3a');
    gradient.addColorStop(1, '#0a1a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStars() {
    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawMoon() {
    ctx.fillStyle = '#F5F5DC';
    ctx.beginPath();
    ctx.arc(canvas.width - 50, 40, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0a0a2a';
    ctx.beginPath();
    ctx.arc(canvas.width - 42, 38, 18, 0, Math.PI * 2);
    ctx.fill();
}

function drawTrees() {
    ctx.fillStyle = '#0a1a0a';

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height - 120);
    ctx.lineTo(40, canvas.height - 180);
    ctx.lineTo(80, canvas.height - 100);
    ctx.lineTo(80, canvas.height);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(canvas.width - 100, canvas.height);
    ctx.lineTo(canvas.width - 100, canvas.height - 150);
    ctx.lineTo(canvas.width - 50, canvas.height - 200);
    ctx.lineTo(canvas.width, canvas.height - 130);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
}

function drawGrass() {
    for (let i = 0; i < 80; i++) {
        const x = (i * 5) % canvas.width;
        const height = 10 + Math.sin(i + time * 0.02) * 5;
        ctx.strokeStyle = '#2a3a2a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 40);
        ctx.lineTo(x + Math.sin(time * 0.01 + i) * 2, canvas.height - 40 - height);
        ctx.stroke();
    }
}

function drawFireflies() {
    fireflies.forEach(f => {
        const glow = (Math.sin(f.phase) + 1) / 2;

        if (glow > 0.3) {
            const glowGradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 20 * glow);
            glowGradient.addColorStop(0, `rgba(173, 255, 47, ${glow * 0.5})`);
            glowGradient.addColorStop(0.5, `rgba(173, 255, 47, ${glow * 0.2})`);
            glowGradient.addColorStop(1, 'rgba(173, 255, 47, 0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(f.x, f.y, 20 * glow, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = `rgba(173, 255, 47, ${0.5 + glow * 0.5})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * (0.5 + glow * 0.5), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(50, 50, 30, 0.8)';
        ctx.beginPath();
        ctx.ellipse(f.x + 3, f.y, 2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`螢火蟲: ${fireflies.length}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawStars();
    drawMoon();
    drawTrees();
    drawGrass();
    updateFireflies();
    drawFireflies();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('addBtn').addEventListener('click', addFirefly);

init();
animate();
