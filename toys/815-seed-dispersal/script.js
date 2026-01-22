const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let seeds = [];
let dandelion = { x: canvas.width / 2, y: canvas.height - 80, seeds: 30 };
let wind = { x: 0, y: 0 };

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#90EE90');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
}

function drawDandelion() {
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(dandelion.x, canvas.height - 40);
    ctx.lineTo(dandelion.x, dandelion.y);
    ctx.stroke();

    ctx.fillStyle = '#90EE90';
    ctx.beginPath();
    ctx.arc(dandelion.x, dandelion.y, 5, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < dandelion.seeds; i++) {
        const angle = (i / dandelion.seeds) * Math.PI * 2;
        const len = 15 + Math.random() * 5;
        const x = dandelion.x + Math.cos(angle) * len;
        const y = dandelion.y + Math.sin(angle) * len;

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(dandelion.x, dandelion.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();

        for (let j = 0; j < 5; j++) {
            const a = angle + (j - 2) * 0.3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(a) * 5, y + Math.sin(a) * 5);
            ctx.stroke();
        }
    }
}

function blowSeeds() {
    const seedCount = dandelion.seeds;
    for (let i = 0; i < seedCount; i++) {
        const angle = (i / seedCount) * Math.PI * 2;
        const len = 15;
        seeds.push({
            x: dandelion.x + Math.cos(angle) * len,
            y: dandelion.y + Math.sin(angle) * len,
            vx: (Math.random() - 0.5) * 2 + 1,
            vy: -Math.random() * 2 - 1,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.1
        });
    }
    dandelion.seeds = 0;
}

function updateSeeds() {
    wind.x = Math.sin(Date.now() * 0.001) * 0.5;

    seeds.forEach(seed => {
        seed.vx += wind.x * 0.01;
        seed.vy += 0.02;
        seed.vy *= 0.99;
        seed.vx *= 0.99;

        seed.x += seed.vx;
        seed.y += seed.vy;
        seed.rotation += seed.rotSpeed;
    });

    seeds = seeds.filter(s => s.y < canvas.height && s.x > 0 && s.x < canvas.width);
}

function drawSeeds() {
    seeds.forEach(seed => {
        ctx.save();
        ctx.translate(seed.x, seed.y);
        ctx.rotate(seed.rotation);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -8);
        ctx.stroke();

        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(0, 0, 1.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(Math.cos(a) * 6, -8 + Math.sin(a) * 6);
            ctx.stroke();
        }

        ctx.restore();
    });
}

function resetDandelion() {
    dandelion.seeds = 30;
    seeds = [];
}

function animate() {
    drawBackground();
    drawDandelion();
    updateSeeds();
    drawSeeds();
    requestAnimationFrame(animate);
}

canvas.addEventListener('click', blowSeeds);
document.getElementById('blowBtn').addEventListener('click', () => {
    resetDandelion();
    setTimeout(blowSeeds, 100);
});

animate();
