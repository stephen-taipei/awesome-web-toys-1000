const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let rockets = [];
let particles = [];
let stars = [];

function init() {
    stars = [];
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.7,
            size: Math.random() * 1.2
        });
    }
}

function launchFirework() {
    const colors = ['#FF1493', '#00FFFF', '#FFD700', '#00FF00', '#FF6600', '#FF00FF'];
    rockets.push({
        x: 50 + Math.random() * (canvas.width - 100),
        y: canvas.height,
        vy: -8 - Math.random() * 3,
        targetY: 50 + Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)]
    });
}

function explode(x, y, color) {
    const count = 50 + Math.floor(Math.random() * 30);
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: color,
            size: 2 + Math.random() * 2,
            life: 1,
            trail: []
        });
    }
}

function updateRockets() {
    for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy += 0.05;

        if (r.y <= r.targetY || r.vy >= 0) {
            explode(r.x, r.y, r.color);
            rockets.splice(i, 1);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.trail.push({ x: p.x, y: p.y, life: p.life });
        if (p.trail.length > 5) p.trail.shift();

        p.vy += 0.08;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.life -= 0.015;

        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawBackground() {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.3)';
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

function drawCityline() {
    ctx.fillStyle = '#1a1a2e';
    for (let i = 0; i < 15; i++) {
        const x = i * 30 - 10;
        const height = 20 + Math.random() * 40;
        ctx.fillRect(x, canvas.height - height, 25, height);

        ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
        for (let j = 0; j < 3; j++) {
            ctx.fillRect(x + 5 + j * 7, canvas.height - height + 5, 4, 4);
        }
        ctx.fillStyle = '#1a1a2e';
    }
}

function drawRockets() {
    rockets.forEach(r => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 200, 100, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x, r.y + 20);
        ctx.stroke();
    });
}

function drawParticles() {
    particles.forEach(p => {
        p.trail.forEach((t, idx) => {
            const alpha = (idx / p.trail.length) * t.life * 0.5;
            ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', '');

            const hex = p.color;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

            ctx.beginPath();
            ctx.arc(t.x, t.y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        });

        const hex = p.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function animate() {
    drawBackground();
    drawStars();
    drawCityline();
    updateRockets();
    updateParticles();
    drawRockets();
    drawParticles();

    requestAnimationFrame(animate);
}

document.getElementById('launchBtn').addEventListener('click', launchFirework);

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    launchFirework();
});

init();
animate();
