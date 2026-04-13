const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let sandParticles = [];
let windStrength = 5;
let time = 0;

function init() {
    for (let i = 0; i < 200; i++) {
        addSandParticle();
    }
}

function addSandParticle() {
    sandParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 2,
        speed: 2 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.5,
        wobble: Math.random() * Math.PI * 2
    });
}

function increaseWind() {
    windStrength = Math.min(15, windStrength + 2);
    for (let i = 0; i < 30; i++) addSandParticle();
}

function updateSand() {
    sandParticles.forEach(p => {
        p.wobble += 0.1;
        p.x += p.speed * (windStrength / 5);
        p.y += Math.sin(p.wobble) * 2;

        if (p.x > canvas.width + 10) {
            p.x = -10;
            p.y = Math.random() * canvas.height;
        }
    });

    windStrength = Math.max(3, windStrength - 0.02);

    if (sandParticles.length > 300) sandParticles = sandParticles.slice(-250);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    const visibility = Math.max(0.3, 1 - windStrength / 20);
    gradient.addColorStop(0, `rgba(180, 140, 100, ${visibility})`);
    gradient.addColorStop(0.5, `rgba(200, 160, 120, ${visibility})`);
    gradient.addColorStop(1, '#D2B48C');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSun() {
    const visibility = Math.max(0.2, 1 - windStrength / 15);
    ctx.fillStyle = `rgba(255, 200, 100, ${visibility})`;
    ctx.beginPath();
    ctx.arc(canvas.width - 60, 50, 25, 0, Math.PI * 2);
    ctx.fill();
}

function drawDunes() {
    ctx.fillStyle = '#C4A77D';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.quadraticCurveTo(100, canvas.height - 80, 200, canvas.height - 40);
    ctx.quadraticCurveTo(300, canvas.height - 70, canvas.width, canvas.height - 30);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    ctx.fillStyle = '#D2B48C';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 20);
    ctx.quadraticCurveTo(150, canvas.height - 60, 250, canvas.height - 30);
    ctx.quadraticCurveTo(320, canvas.height - 50, canvas.width, canvas.height - 20);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();
}

function drawSandParticles() {
    sandParticles.forEach(p => {
        ctx.fillStyle = `rgba(194, 154, 107, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawSandStreaks() {
    ctx.strokeStyle = 'rgba(194, 154, 107, 0.3)';
    ctx.lineWidth = 1;

    for (let i = 0; i < 10; i++) {
        const y = 50 + i * 25;
        const startX = (time * windStrength + i * 50) % (canvas.width + 100) - 50;

        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + 30 + windStrength * 5, y + Math.sin(i) * 5);
        ctx.stroke();
    }
}

function drawCactus() {
    const visibility = Math.max(0.3, 1 - windStrength / 20);
    ctx.fillStyle = `rgba(34, 139, 34, ${visibility})`;

    ctx.fillRect(50, canvas.height - 80, 8, 40);
    ctx.fillRect(42, canvas.height - 70, 8, 20);
    ctx.fillRect(58, canvas.height - 65, 8, 15);
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`風力: ${windStrength.toFixed(1)}`, 20, 28);
}

function animate() {
    time++;
    updateSand();
    drawBackground();
    drawSun();
    drawDunes();
    drawCactus();
    drawSandStreaks();
    drawSandParticles();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('windBtn').addEventListener('click', increaseWind);

init();
animate();
