const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let comet = null;
let trail = [];
let stars = [];

function init() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.2,
            twinkle: Math.random() * Math.PI * 2
        });
    }
}

function launchComet() {
    comet = {
        x: -20,
        y: 50 + Math.random() * 100,
        vx: 3 + Math.random() * 2,
        vy: 0.5 + Math.random() * 1,
        size: 8
    };
    trail = [];
}

function drawStars(time) {
    stars.forEach(star => {
        const brightness = 0.4 + Math.sin(time * 0.003 + star.twinkle) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawSun() {
    const gradient = ctx.createRadialGradient(canvas.width + 50, canvas.height + 50, 0, canvas.width + 50, canvas.height + 50, 150);
    gradient.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateComet() {
    if (!comet) return;

    trail.unshift({
        x: comet.x,
        y: comet.y,
        size: comet.size,
        age: 0
    });

    if (trail.length > 80) {
        trail.pop();
    }

    trail.forEach(t => t.age++);

    comet.x += comet.vx;
    comet.y += comet.vy;

    if (comet.x > canvas.width + 50) {
        comet = null;
    }
}

function drawComet() {
    if (!comet) return;

    for (let i = trail.length - 1; i >= 0; i--) {
        const t = trail[i];
        const alpha = 1 - t.age / 80;
        const size = t.size * (1 - t.age / 80) * 0.8;

        ctx.fillStyle = `rgba(0, 206, 209, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, size + 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    const coreGradient = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, comet.size * 2);
    coreGradient.addColorStop(0, '#fff');
    coreGradient.addColorStop(0.3, '#00CED1');
    coreGradient.addColorStop(1, 'rgba(0, 206, 209, 0)');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(comet.x, comet.y, comet.size * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(comet.x, comet.y, comet.size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 3; i++) {
        const angle = Math.PI + (Math.random() - 0.5) * 0.5;
        const dist = comet.size + Math.random() * 20;
        ctx.fillStyle = `rgba(100, 200, 255, ${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(
            comet.x + Math.cos(angle) * dist,
            comet.y + Math.sin(angle) * dist,
            1 + Math.random() * 2,
            0, Math.PI * 2
        );
        ctx.fill();
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(comet ? '彗星飛行中' : '點擊發射', 20, 28);
}

let time = 0;
function animate() {
    time++;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawSun();
    drawStars(time);
    updateComet();
    drawComet();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('launchBtn').addEventListener('click', launchComet);

init();
animate();
