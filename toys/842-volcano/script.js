const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let particles = [];
let lavaFlows = [];
let smoke = [];
let isErupting = false;
let eruptionIntensity = 0;

function erupt() {
    isErupting = true;
    eruptionIntensity = 100;
}

function updateParticles() {
    if (isErupting && eruptionIntensity > 0) {
        for (let i = 0; i < 5; i++) {
            particles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 20,
                y: 120,
                vx: (Math.random() - 0.5) * 8,
                vy: -8 - Math.random() * 6,
                size: 3 + Math.random() * 5,
                life: 100,
                type: Math.random() > 0.3 ? 'rock' : 'lava'
            });
        }

        for (let i = 0; i < 3; i++) {
            smoke.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 30,
                y: 100,
                vx: (Math.random() - 0.5) * 2,
                vy: -2 - Math.random() * 2,
                size: 10 + Math.random() * 20,
                alpha: 0.8
            });
        }

        eruptionIntensity -= 0.5;
        if (eruptionIntensity <= 0) {
            isErupting = false;
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.2;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.y > canvas.height - 50) {
            if (p.type === 'lava') {
                lavaFlows.push({
                    x: p.x,
                    y: canvas.height - 50,
                    vx: p.vx * 0.3,
                    size: p.size
                });
            }
            particles.splice(i, 1);
        } else if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    for (let i = smoke.length - 1; i >= 0; i--) {
        const s = smoke[i];
        s.x += s.vx;
        s.y += s.vy;
        s.size += 0.5;
        s.alpha -= 0.01;

        if (s.alpha <= 0) {
            smoke.splice(i, 1);
        }
    }

    for (let i = lavaFlows.length - 1; i >= 0; i--) {
        const l = lavaFlows[i];
        l.x += l.vx;
        l.size -= 0.02;

        if (l.size <= 0) {
            lavaFlows.splice(i, 1);
        }
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#2d2d44');
    gradient.addColorStop(1, '#3d3d1f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVolcano() {
    ctx.fillStyle = '#4a3728';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 120, canvas.height - 50);
    ctx.lineTo(canvas.width / 2 - 30, 120);
    ctx.lineTo(canvas.width / 2 + 30, 120);
    ctx.lineTo(canvas.width / 2 + 120, canvas.height - 50);
    ctx.fill();

    ctx.fillStyle = '#3d2d20';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 30, 120);
    ctx.lineTo(canvas.width / 2 - 20, 140);
    ctx.lineTo(canvas.width / 2 + 20, 140);
    ctx.lineTo(canvas.width / 2 + 30, 120);
    ctx.fill();

    if (isErupting) {
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, 130, 0,
            canvas.width / 2, 130, 30
        );
        gradient.addColorStop(0, '#FF4500');
        gradient.addColorStop(0.5, '#FF6600');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 130, 30 + Math.random() * 10, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#2F4F2F';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
}

function drawSmoke() {
    smoke.forEach(s => {
        ctx.fillStyle = `rgba(100, 100, 100, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawParticles() {
    particles.forEach(p => {
        if (p.type === 'lava') {
            ctx.fillStyle = `hsl(${20 + Math.random() * 20}, 100%, ${50 + Math.random() * 20}%)`;
        } else {
            ctx.fillStyle = '#4a3728';
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawLavaFlows() {
    lavaFlows.forEach(l => {
        ctx.fillStyle = `hsl(${15 + Math.random() * 15}, 100%, ${40 + l.size * 3}%)`;
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.size + 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function animate() {
    drawBackground();
    drawLavaFlows();
    drawVolcano();
    drawSmoke();
    drawParticles();
    updateParticles();
    requestAnimationFrame(animate);
}

document.getElementById('eruptBtn').addEventListener('click', erupt);

animate();
