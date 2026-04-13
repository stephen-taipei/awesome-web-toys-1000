const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let raindrops = [];
let splashes = [];
let rainIntensity = 10;

function changeRain() {
    rainIntensity = rainIntensity === 10 ? 25 : rainIntensity === 25 ? 5 : 10;
}

function spawnRaindrops() {
    for (let i = 0; i < rainIntensity / 3; i++) {
        raindrops.push({
            x: Math.random() * canvas.width,
            y: -10,
            length: 10 + Math.random() * 15,
            speed: 8 + Math.random() * 8,
            alpha: 0.3 + Math.random() * 0.4
        });
    }
}

function updateRaindrops() {
    for (let i = raindrops.length - 1; i >= 0; i--) {
        const drop = raindrops[i];
        drop.y += drop.speed;

        if (drop.y > canvas.height - 20) {
            splashes.push({
                x: drop.x,
                y: canvas.height - 20,
                radius: 2,
                alpha: 0.8
            });
            raindrops.splice(i, 1);
        }
    }

    for (let i = splashes.length - 1; i >= 0; i--) {
        const splash = splashes[i];
        splash.radius += 1;
        splash.alpha -= 0.05;

        if (splash.alpha <= 0) {
            splashes.splice(i, 1);
        }
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4a5568');
    gradient.addColorStop(0.7, '#718096');
    gradient.addColorStop(1, '#2d3748');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawClouds() {
    ctx.fillStyle = 'rgba(100, 100, 120, 0.8)';

    [[50, 30], [150, 20], [280, 35]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.arc(x + 30, y - 10, 35, 0, Math.PI * 2);
        ctx.arc(x + 60, y, 30, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawRaindrops() {
    raindrops.forEach(drop => {
        ctx.strokeStyle = `rgba(200, 220, 255, ${drop.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();
    });
}

function drawSplashes() {
    splashes.forEach(splash => {
        ctx.strokeStyle = `rgba(200, 220, 255, ${splash.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(splash.x, splash.y, splash.radius, 0, Math.PI, true);
        ctx.stroke();
    });
}

function drawGround() {
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    ctx.fillStyle = 'rgba(100, 150, 200, 0.3)';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 5);
}

function drawPuddles() {
    ctx.fillStyle = 'rgba(100, 150, 200, 0.4)';

    [[80, canvas.height - 15, 40, 8],
     [200, canvas.height - 12, 50, 6],
     [320, canvas.height - 14, 35, 7]].forEach(([x, y, rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    const labels = { 5: '毛毛雨', 10: '中雨', 25: '大雨' };
    ctx.fillText(`雨量: ${labels[rainIntensity]}`, 20, 28);
}

function animate() {
    drawBackground();
    drawClouds();
    drawGround();
    drawPuddles();
    spawnRaindrops();
    updateRaindrops();
    drawRaindrops();
    drawSplashes();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('rainBtn').addEventListener('click', changeRain);

animate();
