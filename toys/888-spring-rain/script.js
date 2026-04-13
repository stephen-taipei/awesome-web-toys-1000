const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let raindrops = [];
let splashes = [];
let hasUmbrella = false;
let umbrellaX = canvas.width / 2;
let time = 0;

function toggleUmbrella() {
    hasUmbrella = !hasUmbrella;
}

function spawnRain() {
    for (let i = 0; i < 5; i++) {
        raindrops.push({
            x: Math.random() * canvas.width,
            y: -10,
            length: 10 + Math.random() * 10,
            speed: 6 + Math.random() * 4
        });
    }
}

function updateRain() {
    for (let i = raindrops.length - 1; i >= 0; i--) {
        const r = raindrops[i];
        r.y += r.speed;

        if (hasUmbrella && r.x > umbrellaX - 50 && r.x < umbrellaX + 50 && r.y > 100 && r.y < 130) {
            splashes.push({ x: r.x, y: 120, radius: 2, alpha: 0.8 });
            raindrops.splice(i, 1);
            continue;
        }

        if (r.y > canvas.height - 30) {
            splashes.push({ x: r.x, y: canvas.height - 30, radius: 2, alpha: 0.8 });
            raindrops.splice(i, 1);
        }
    }

    for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.radius += 0.5;
        s.alpha -= 0.03;
        if (s.alpha <= 0) splashes.splice(i, 1);
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#708090');
    gradient.addColorStop(0.6, '#90A090');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawClouds() {
    ctx.fillStyle = 'rgba(80, 80, 90, 0.8)';
    [[50, 30], [180, 20], [300, 35]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.arc(x + 35, y - 5, 35, 0, Math.PI * 2);
        ctx.arc(x + 70, y, 30, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawRain() {
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.6)';
    ctx.lineWidth = 1;
    raindrops.forEach(r => {
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x, r.y + r.length);
        ctx.stroke();
    });
}

function drawSplashes() {
    splashes.forEach(s => {
        ctx.strokeStyle = `rgba(200, 220, 255, ${s.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, Math.PI, 0);
        ctx.stroke();
    });
}

function drawGround() {
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    ctx.fillStyle = 'rgba(100, 180, 200, 0.3)';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(50 + i * 80, canvas.height - 15, 30, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawFlowers() {
    const flowers = [[50, canvas.height - 50], [150, canvas.height - 45], [280, canvas.height - 55]];
    flowers.forEach(([x, y]) => {
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + 20);
        ctx.quadraticCurveTo(x + Math.sin(time * 0.05) * 3, y + 10, x, y);
        ctx.stroke();

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FF69B4';
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            ctx.beginPath();
            ctx.ellipse(x + Math.cos(angle) * 6, y + Math.sin(angle) * 6, 4, 3, angle, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawUmbrella() {
    if (!hasUmbrella) return;

    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.arc(umbrellaX, 120, 50, Math.PI, 0);
    ctx.fill();

    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2;
    for (let i = 1; i < 6; i++) {
        const angle = Math.PI + (i / 6) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(umbrellaX, 120);
        ctx.lineTo(umbrellaX + Math.cos(angle) * 50, 120 + Math.sin(angle) * 50);
        ctx.stroke();
    }

    ctx.strokeStyle = '#4a3020';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(umbrellaX, 120);
    ctx.lineTo(umbrellaX, 200);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(umbrellaX, 205, 5, 0, Math.PI);
    ctx.stroke();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(hasUmbrella ? '撐傘中' : '淋雨中', 30, 28);
}

canvas.addEventListener('mousemove', (e) => {
    if (hasUmbrella) {
        const rect = canvas.getBoundingClientRect();
        umbrellaX = (e.clientX - rect.left) * (canvas.width / rect.width);
    }
});

function animate() {
    time++;
    drawBackground();
    drawClouds();
    drawGround();
    drawFlowers();
    spawnRain();
    updateRain();
    drawRain();
    drawSplashes();
    drawUmbrella();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('umbrellaBtn').addEventListener('click', toggleUmbrella);

animate();
