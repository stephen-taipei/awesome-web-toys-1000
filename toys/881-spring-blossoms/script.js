const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let flowers = [];
let petals = [];
let time = 0;

function init() {
    flowers = [];
    for (let i = 0; i < 8; i++) {
        addFlower();
    }
}

function addFlower() {
    flowers.push({
        x: 30 + Math.random() * (canvas.width - 60),
        y: canvas.height - 50 - Math.random() * 100,
        size: 0,
        targetSize: 15 + Math.random() * 15,
        color: ['#FFB7C5', '#FF69B4', '#FFC0CB', '#FFD700', '#FF6347'][Math.floor(Math.random() * 5)],
        petalCount: 5 + Math.floor(Math.random() * 3),
        rotation: Math.random() * Math.PI * 2
    });
}

function spawnPetal() {
    if (Math.random() < 0.1) {
        const flower = flowers[Math.floor(Math.random() * flowers.length)];
        if (flower && flower.size > 10) {
            petals.push({
                x: flower.x,
                y: flower.y,
                vx: (Math.random() - 0.5) * 2,
                vy: 0.5 + Math.random(),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                size: 5 + Math.random() * 5,
                color: flower.color,
                alpha: 1
            });
        }
    }
}

function updatePetals() {
    for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.vx += Math.sin(time * 0.02) * 0.02;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height) {
            p.alpha -= 0.02;
        }

        if (p.alpha <= 0 || p.y > canvas.height + 20) {
            petals.splice(i, 1);
        }
    }

    if (petals.length > 50) petals = petals.slice(-40);
}

function updateFlowers() {
    flowers.forEach(f => {
        if (f.size < f.targetSize) {
            f.size += 0.2;
        }
        f.rotation += 0.002;
    });
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#98FB98');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrass() {
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    for (let i = 0; i < 100; i++) {
        const x = (i * 4) % canvas.width;
        const height = 10 + Math.sin(i + time * 0.05) * 5;
        ctx.strokeStyle = '#32CD32';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 50);
        ctx.quadraticCurveTo(x + Math.sin(time * 0.05) * 3, canvas.height - 50 - height / 2, x, canvas.height - 50 - height);
        ctx.stroke();
    }
}

function drawFlower(f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rotation);

    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 50);
    ctx.stroke();

    for (let i = 0; i < f.petalCount; i++) {
        const angle = (i / f.petalCount) * Math.PI * 2;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.ellipse(
            Math.cos(angle) * f.size * 0.5,
            Math.sin(angle) * f.size * 0.5,
            f.size * 0.6,
            f.size * 0.3,
            angle,
            0, Math.PI * 2
        );
        ctx.fill();
    }

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, f.size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.alpha;

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
}

function drawButterfly() {
    const x = 50 + Math.sin(time * 0.03) * 100 + 100;
    const y = 80 + Math.sin(time * 0.05) * 30;
    const wingFlap = Math.sin(time * 0.3) * 0.5;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.ellipse(-8, 0, 10 * Math.abs(Math.cos(wingFlap)), 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, 0, 10 * Math.abs(Math.cos(wingFlap)), 8, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.fillRect(-1, -8, 2, 16);

    ctx.restore();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`花朵: ${flowers.length}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawGrass();

    flowers.forEach(f => drawFlower(f));
    updateFlowers();

    spawnPetal();
    updatePetals();
    petals.forEach(p => drawPetal(p));

    drawButterfly();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('bloomBtn').addEventListener('click', addFlower);

init();
animate();
