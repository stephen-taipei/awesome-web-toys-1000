const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let lightsOn = true;
let snowflakes = [];
let smokeParticles = [];
let time = 0;

function init() {
    for (let i = 0; i < 100; i++) {
        snowflakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 1 + Math.random() * 3,
            speed: 0.5 + Math.random() * 1,
            wobble: Math.random() * Math.PI * 2
        });
    }
}

function toggleLights() {
    lightsOn = !lightsOn;
}

function spawnSmoke() {
    if (Math.random() < 0.1) {
        smokeParticles.push({
            x: 240,
            y: 80,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -0.5 - Math.random() * 0.5,
            size: 5 + Math.random() * 5,
            alpha: 0.5
        });
    }
}

function updateSnow() {
    snowflakes.forEach(s => {
        s.wobble += 0.02;
        s.x += Math.sin(s.wobble) * 0.5;
        s.y += s.speed;

        if (s.y > canvas.height) {
            s.y = -10;
            s.x = Math.random() * canvas.width;
        }
    });
}

function updateSmoke() {
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        p.x += p.vx + Math.sin(time * 0.02) * 0.2;
        p.y += p.vy;
        p.size += 0.2;
        p.alpha -= 0.005;

        if (p.alpha <= 0) smokeParticles.splice(i, 1);
    }

    if (smokeParticles.length > 30) smokeParticles = smokeParticles.slice(-20);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a2a3a');
    gradient.addColorStop(0.6, '#3a4a5a');
    gradient.addColorStop(1, '#fff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMountains() {
    ctx.fillStyle = '#5a6a7a';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 80);
    ctx.lineTo(80, canvas.height - 150);
    ctx.lineTo(150, canvas.height - 100);
    ctx.lineTo(220, canvas.height - 170);
    ctx.lineTo(300, canvas.height - 120);
    ctx.lineTo(canvas.width, canvas.height - 140);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(80, canvas.height - 150);
    ctx.lineTo(60, canvas.height - 130);
    ctx.lineTo(100, canvas.height - 130);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(220, canvas.height - 170);
    ctx.lineTo(200, canvas.height - 145);
    ctx.lineTo(240, canvas.height - 145);
    ctx.fill();
}

function drawSnowGround() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 60);
    for (let x = 0; x <= canvas.width; x += 20) {
        ctx.lineTo(x, canvas.height - 60 + Math.sin(x * 0.05) * 5);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();
}

function drawCabin() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(150, canvas.height - 140, 100, 80);

    ctx.fillStyle = '#654321';
    for (let y = canvas.height - 135; y < canvas.height - 65; y += 12) {
        ctx.fillRect(150, y, 100, 2);
    }

    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.moveTo(140, canvas.height - 140);
    ctx.lineTo(200, canvas.height - 190);
    ctx.lineTo(260, canvas.height - 140);
    ctx.fill();

    ctx.fillStyle = '#8B0000';
    ctx.fillRect(235, canvas.height - 175, 15, 95);

    ctx.fillStyle = lightsOn ? '#FFD700' : '#4a4a4a';
    ctx.fillRect(165, canvas.height - 120, 30, 30);
    ctx.fillRect(205, canvas.height - 120, 30, 30);

    if (lightsOn) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(165, canvas.height - 90);
        ctx.lineTo(140, canvas.height - 60);
        ctx.lineTo(220, canvas.height - 60);
        ctx.lineTo(195, canvas.height - 90);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(205, canvas.height - 90);
        ctx.lineTo(180, canvas.height - 60);
        ctx.lineTo(260, canvas.height - 60);
        ctx.lineTo(235, canvas.height - 90);
        ctx.fill();
    }

    ctx.strokeStyle = '#4a3020';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(180, canvas.height - 120);
    ctx.lineTo(180, canvas.height - 90);
    ctx.moveTo(165, canvas.height - 105);
    ctx.lineTo(195, canvas.height - 105);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(220, canvas.height - 120);
    ctx.lineTo(220, canvas.height - 90);
    ctx.moveTo(205, canvas.height - 105);
    ctx.lineTo(235, canvas.height - 105);
    ctx.stroke();

    ctx.fillStyle = '#654321';
    ctx.fillRect(190, canvas.height - 100, 20, 40);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(205, canvas.height - 80, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawSmoke() {
    smokeParticles.forEach(p => {
        ctx.fillStyle = `rgba(150, 150, 150, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawSnow() {
    ctx.fillStyle = '#fff';
    snowflakes.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawTrees() {
    [[50, canvas.height - 100], [320, canvas.height - 90]].forEach(([x, y]) => {
        ctx.fillStyle = '#2F4F2F';
        ctx.beginPath();
        ctx.moveTo(x, y - 60);
        ctx.lineTo(x - 20, y);
        ctx.lineTo(x + 20, y);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y - 40);
        ctx.lineTo(x - 15, y + 10);
        ctx.lineTo(x + 15, y + 10);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(x, y - 60);
        ctx.lineTo(x - 8, y - 45);
        ctx.lineTo(x + 8, y - 45);
        ctx.fill();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(lightsOn ? '燈光開啟' : '燈光關閉', 25, 28);
}

function animate() {
    time++;
    drawBackground();
    drawMountains();
    drawSnowGround();
    drawTrees();
    drawCabin();
    spawnSmoke();
    updateSmoke();
    drawSmoke();
    updateSnow();
    drawSnow();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('lightBtn').addEventListener('click', toggleLights);

init();
animate();
