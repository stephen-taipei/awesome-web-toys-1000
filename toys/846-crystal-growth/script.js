const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let crystals = [];
let particles = [];
let isGrowing = false;

function initCrystals() {
    crystals = [];
    particles = [];

    for (let i = 0; i < 3; i++) {
        crystals.push({
            x: 80 + i * 100,
            y: canvas.height - 50,
            branches: [{
                angle: -Math.PI / 2,
                length: 20,
                width: 8,
                children: []
            }],
            hue: 240 + i * 40,
            maxDepth: 4
        });
    }
}

function growCrystal(crystal) {
    function growBranch(branch, depth) {
        if (depth >= crystal.maxDepth) return;

        branch.length += 0.5;
        branch.width = Math.max(2, branch.width - 0.02);

        if (branch.length > 15 + Math.random() * 10 && branch.children.length < 2 && Math.random() < 0.05) {
            const angleOffset = (Math.random() - 0.5) * 0.8 + (branch.children.length === 0 ? -0.4 : 0.4);
            branch.children.push({
                angle: branch.angle + angleOffset,
                length: 5,
                width: branch.width * 0.7,
                children: []
            });
        }

        branch.children.forEach(child => growBranch(child, depth + 1));
    }

    crystal.branches.forEach(branch => growBranch(branch, 0));
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#2d2d44');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#3d3d5c';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
}

function drawCrystalBranch(x, y, branch, hue, depth = 0) {
    const endX = x + Math.cos(branch.angle) * branch.length;
    const endY = y + Math.sin(branch.angle) * branch.length;

    const gradient = ctx.createLinearGradient(x, y, endX, endY);
    gradient.addColorStop(0, `hsla(${hue}, 60%, ${50 + depth * 5}%, 0.9)`);
    gradient.addColorStop(1, `hsla(${hue}, 70%, ${60 + depth * 5}%, 0.8)`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = branch.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.fillStyle = `hsla(${hue}, 80%, 80%, 0.5)`;
    ctx.beginPath();
    ctx.arc(endX, endY, branch.width / 2 + 1, 0, Math.PI * 2);
    ctx.fill();

    branch.children.forEach(child => {
        drawCrystalBranch(endX, endY, child, hue, depth + 1);
    });
}

function drawCrystals() {
    crystals.forEach(crystal => {
        ctx.save();
        ctx.shadowColor = `hsl(${crystal.hue}, 70%, 60%)`;
        ctx.shadowBlur = 15;

        crystal.branches.forEach(branch => {
            drawCrystalBranch(crystal.x, crystal.y, branch, crystal.hue);
        });

        ctx.restore();
    });
}

function updateParticles() {
    if (isGrowing && Math.random() < 0.3) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height - 80),
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 2,
            size: 2 + Math.random() * 2,
            alpha: 1,
            hue: 240 + Math.random() * 80
        });
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;

        crystals.forEach(crystal => {
            const dx = crystal.x - p.x;
            const dy = crystal.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                p.vx += dx / dist * 0.1;
                p.vy += dy / dist * 0.1;
            }
        });

        if (p.alpha <= 0 || p.y > canvas.height - 50) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function animate() {
    drawBackground();
    drawParticles();
    drawCrystals();

    if (isGrowing) {
        crystals.forEach(crystal => growCrystal(crystal));
    }

    updateParticles();
    requestAnimationFrame(animate);
}

document.getElementById('growBtn').addEventListener('click', () => {
    isGrowing = !isGrowing;
    document.getElementById('growBtn').textContent = isGrowing ? '停止生長' : '生長晶體';
});

initCrystals();
animate();
