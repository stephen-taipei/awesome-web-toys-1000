const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let algae = [];
let microbes = [];
let tadpoles = [];
let dragonflies = [];

function init() {
    algae = [];
    microbes = [];
    tadpoles = [];
    dragonflies = [];

    for (let i = 0; i < 50; i++) {
        algae.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 2 + Math.random() * 3
        });
    }

    for (let i = 0; i < 30; i++) {
        microbes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: 3 + Math.random() * 2,
            type: Math.floor(Math.random() * 3)
        });
    }

    for (let i = 0; i < 5; i++) {
        tadpoles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            tailPhase: Math.random() * Math.PI * 2
        });
    }

    for (let i = 0; i < 3; i++) {
        dragonflies.push({
            x: Math.random() * canvas.width,
            y: 30 + Math.random() * 50,
            vx: (Math.random() - 0.5) * 3,
            wingPhase: Math.random() * Math.PI * 2
        });
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#3a7a7a');
    gradient.addColorStop(1, '#1e4f4f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 10; i++) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 + Math.random() * 0.02})`;
        ctx.lineWidth = 20 + Math.random() * 30;
        ctx.beginPath();
        ctx.moveTo(0, Math.random() * canvas.height);
        ctx.bezierCurveTo(
            canvas.width * 0.3, Math.random() * canvas.height,
            canvas.width * 0.7, Math.random() * canvas.height,
            canvas.width, Math.random() * canvas.height
        );
        ctx.stroke();
    }
}

function drawAlgae() {
    algae.forEach(a => {
        ctx.fillStyle = `rgba(0, ${150 + Math.random() * 50}, 0, 0.6)`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateMicrobes() {
    microbes.forEach(m => {
        m.vx += (Math.random() - 0.5) * 0.3;
        m.vy += (Math.random() - 0.5) * 0.3;

        m.vx = Math.max(-2, Math.min(2, m.vx));
        m.vy = Math.max(-2, Math.min(2, m.vy));

        m.x += m.vx;
        m.y += m.vy;

        if (m.x < 0) m.x = canvas.width;
        if (m.x > canvas.width) m.x = 0;
        if (m.y < 0) m.y = canvas.height;
        if (m.y > canvas.height) m.y = 0;
    });
}

function drawMicrobes() {
    microbes.forEach(m => {
        if (m.type === 0) {
            ctx.fillStyle = 'rgba(144, 238, 144, 0.8)';
            ctx.beginPath();
            ctx.ellipse(m.x, m.y, m.size, m.size * 0.6, Math.atan2(m.vy, m.vx), 0, Math.PI * 2);
            ctx.fill();
        } else if (m.type === 1) {
            ctx.fillStyle = 'rgba(255, 182, 193, 0.8)';
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 182, 193, 0.5)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(m.x, m.y);
                ctx.lineTo(m.x + Math.cos(angle) * m.size * 2, m.y + Math.sin(angle) * m.size * 2);
                ctx.stroke();
            }
        } else {
            ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function updateTadpoles() {
    tadpoles.forEach(t => {
        t.tailPhase += 0.3;
        t.vx += (Math.random() - 0.5) * 0.1;
        t.vy += (Math.random() - 0.5) * 0.1;

        t.vx = Math.max(-1.5, Math.min(1.5, t.vx));
        t.vy = Math.max(-1.5, Math.min(1.5, t.vy));

        t.x += t.vx;
        t.y += t.vy;

        if (t.x < 20) t.vx += 0.2;
        if (t.x > canvas.width - 20) t.vx -= 0.2;
        if (t.y < 60) t.vy += 0.2;
        if (t.y > canvas.height - 20) t.vy -= 0.2;
    });
}

function drawTadpoles() {
    tadpoles.forEach(t => {
        const angle = Math.atan2(t.vy, t.vx);

        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(angle);

        ctx.fillStyle = '#2F2F2F';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        const tailWag = Math.sin(t.tailPhase) * 0.5;
        ctx.strokeStyle = '#2F2F2F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.quadraticCurveTo(-15, tailWag * 10, -22, tailWag * 15);
        ctx.stroke();

        ctx.restore();
    });
}

function updateDragonflies() {
    dragonflies.forEach(d => {
        d.wingPhase += 0.4;
        d.x += d.vx;

        if (d.x < 20 || d.x > canvas.width - 20) {
            d.vx *= -1;
        }
    });
}

function drawDragonflies() {
    dragonflies.forEach(d => {
        const dir = d.vx > 0 ? 1 : -1;

        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, 12, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        const wingY = Math.sin(d.wingPhase) * 3;
        ctx.fillStyle = 'rgba(200, 200, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(d.x, d.y - 5 + wingY, 15, 4, 0.2 * dir, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(d.x, d.y + 5 - wingY, 15, 4, -0.2 * dir, 0, Math.PI * 2);
        ctx.fill();
    });
}

function dropFood() {
    for (let i = 0; i < 10; i++) {
        algae.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 100,
            y: 50 + Math.random() * 30,
            size: 2 + Math.random() * 3
        });
    }
}

function animate() {
    drawBackground();
    drawAlgae();
    updateMicrobes();
    drawMicrobes();
    updateTadpoles();
    drawTadpoles();
    updateDragonflies();
    drawDragonflies();

    if (Math.random() < 0.01 && algae.length < 100) {
        algae.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 2 + Math.random() * 3
        });
    }

    requestAnimationFrame(animate);
}

document.getElementById('dropBtn').addEventListener('click', dropFood);

init();
animate();
