const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let petals = [];
let shakeIntensity = 0;
let time = 0;

const petalColors = ['#FFB7C5', '#FFC0CB', '#FFE4E1', '#FFF0F5', '#FFDAB9'];

function shake() {
    shakeIntensity = 5;
    for (let i = 0; i < 30; i++) {
        petals.push(createPetal());
    }
}

function createPetal() {
    return {
        x: 50 + Math.random() * 200,
        y: 50 + Math.random() * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: 0.5 + Math.random() * 1.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        size: 4 + Math.random() * 6,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        wobble: Math.random() * Math.PI * 2
    };
}

function spawnPetal() {
    if (Math.random() < 0.1 + shakeIntensity * 0.1) {
        petals.push(createPetal());
    }
}

function updatePetals() {
    shakeIntensity *= 0.95;

    for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.wobble += 0.05;
        p.vx += Math.sin(p.wobble) * 0.05 + shakeIntensity * (Math.random() - 0.5) * 0.2;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vx *= 0.99;

        if (p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20) {
            petals.splice(i, 1);
        }
    }

    if (petals.length > 150) petals = petals.slice(-120);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#FFE4E1');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawTree() {
    const shake = shakeIntensity * Math.sin(time * 0.5);

    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(100, canvas.height);
    ctx.quadraticCurveTo(90, canvas.height - 100, 120 + shake, canvas.height - 150);
    ctx.quadraticCurveTo(130, canvas.height - 100, 140, canvas.height);
    ctx.fill();

    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(120 + shake, canvas.height - 150);
    ctx.quadraticCurveTo(80 + shake, canvas.height - 180, 50 + shake, canvas.height - 160);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(120 + shake, canvas.height - 150);
    ctx.quadraticCurveTo(160 + shake, canvas.height - 200, 200 + shake, canvas.height - 180);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(120 + shake, canvas.height - 150);
    ctx.quadraticCurveTo(100 + shake, canvas.height - 220, 80 + shake, canvas.height - 230);
    ctx.stroke();

    const blossomPositions = [
        [50 + shake, canvas.height - 160, 40],
        [200 + shake, canvas.height - 180, 50],
        [80 + shake, canvas.height - 230, 35],
        [130 + shake, canvas.height - 190, 45],
        [160 + shake, canvas.height - 210, 40]
    ];

    blossomPositions.forEach(([x, y, r]) => {
        ctx.fillStyle = '#FFB7C5';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFC0CB';
        ctx.beginPath();
        ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.ellipse(-p.size * 0.2, -p.size * 0.1, p.size * 0.3, p.size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawGround() {
    ctx.fillStyle = '#98FB98';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    ctx.fillStyle = 'rgba(255, 183, 197, 0.5)';
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.ellipse(
            (i * 23 + time * 0.1) % canvas.width,
            canvas.height - 20 + Math.sin(i) * 5,
            8, 4, Math.random(), 0, Math.PI * 2
        );
        ctx.fill();
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`花瓣: ${petals.length}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawGround();
    drawTree();
    spawnPetal();
    updatePetals();
    petals.forEach(p => drawPetal(p));
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('shakeBtn').addEventListener('click', shake);

animate();
