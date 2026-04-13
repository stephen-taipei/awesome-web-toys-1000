const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let explosions = [];

function createExplosion(x, y) {
    const explosion = {
        x: x,
        y: y,
        particles: [],
        shockwave: { radius: 0, alpha: 1 },
        flash: 1
    };

    for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8;
        explosion.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 8,
            life: 1,
            type: Math.random() > 0.7 ? 'smoke' : 'fire'
        });
    }

    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        explosion.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,
            size: 5 + Math.random() * 15,
            life: 1,
            type: 'debris'
        });
    }

    explosions.push(explosion);
}

function explode() {
    createExplosion(
        50 + Math.random() * (canvas.width - 100),
        50 + Math.random() * (canvas.height - 100)
    );
}

function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    createExplosion(x, y);
}

function update() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];

        exp.flash *= 0.9;
        exp.shockwave.radius += 8;
        exp.shockwave.alpha *= 0.95;

        for (let j = exp.particles.length - 1; j >= 0; j--) {
            const p = exp.particles[j];
            p.vy += 0.1;
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.life -= p.type === 'smoke' ? 0.01 : 0.02;

            if (p.type === 'smoke') {
                p.size += 0.5;
            }

            if (p.life <= 0) {
                exp.particles.splice(j, 1);
            }
        }

        if (exp.particles.length === 0 && exp.shockwave.alpha < 0.01) {
            explosions.splice(i, 1);
        }
    }
}

function drawBackground() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawExplosions() {
    explosions.forEach(exp => {
        if (exp.flash > 0.1) {
            ctx.fillStyle = `rgba(255, 255, 200, ${exp.flash * 0.5})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (exp.shockwave.alpha > 0.01) {
            ctx.strokeStyle = `rgba(255, 200, 100, ${exp.shockwave.alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(exp.x, exp.y, exp.shockwave.radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        exp.particles.forEach(p => {
            if (p.type === 'fire') {
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                gradient.addColorStop(0, `rgba(255, 255, 100, ${p.life})`);
                gradient.addColorStop(0.4, `rgba(255, 150, 0, ${p.life * 0.8})`);
                gradient.addColorStop(1, `rgba(255, 50, 0, 0)`);
                ctx.fillStyle = gradient;
            } else if (p.type === 'smoke') {
                ctx.fillStyle = `rgba(80, 80, 80, ${p.life * 0.5})`;
            } else {
                ctx.fillStyle = `rgba(100, 80, 60, ${p.life})`;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText('點擊任意位置引爆', 15, 28);
}

function animate() {
    drawBackground();
    update();
    drawExplosions();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('click', handleClick);
document.getElementById('explodeBtn').addEventListener('click', explode);

animate();
