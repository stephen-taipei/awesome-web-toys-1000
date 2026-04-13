const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let stalactites = [];
let stalagmites = [];
let waterDrops = [];
let speed = 1;
let time = 0;

function init() {
    stalactites = [];
    stalagmites = [];

    for (let i = 0; i < 8; i++) {
        const x = 40 + i * 45;
        stalactites.push({
            x: x,
            length: 10 + Math.random() * 20,
            width: 8 + Math.random() * 6,
            growthRate: 0.01 + Math.random() * 0.01
        });
        stalagmites.push({
            x: x,
            length: 5 + Math.random() * 10,
            width: 10 + Math.random() * 8,
            growthRate: 0.008 + Math.random() * 0.008
        });
    }
}

function updateFormations() {
    stalactites.forEach((s, i) => {
        s.length += s.growthRate * speed;
        s.width += s.growthRate * 0.1 * speed;
        stalagmites[i].length += stalagmites[i].growthRate * speed;
        stalagmites[i].width += stalagmites[i].growthRate * 0.15 * speed;

        if (Math.random() < 0.02 * speed) {
            waterDrops.push({
                x: s.x,
                y: s.length + 20,
                vy: 0
            });
        }
    });

    for (let i = waterDrops.length - 1; i >= 0; i--) {
        waterDrops[i].vy += 0.2;
        waterDrops[i].y += waterDrops[i].vy;

        if (waterDrops[i].y > canvas.height - 30) {
            waterDrops.splice(i, 1);
        }
    }
}

function drawBackground() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, canvas.width, 20);
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(60, 60, 60, ${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 2 + Math.random() * 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawStalactite(s) {
    const gradient = ctx.createLinearGradient(s.x, 20, s.x, 20 + s.length);
    gradient.addColorStop(0, '#8B7355');
    gradient.addColorStop(0.5, '#DEB887');
    gradient.addColorStop(1, '#F5DEB3');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(s.x - s.width / 2, 20);
    ctx.lineTo(s.x + s.width / 2, 20);
    ctx.lineTo(s.x + s.width / 4, 20 + s.length * 0.7);
    ctx.lineTo(s.x, 20 + s.length);
    ctx.lineTo(s.x - s.width / 4, 20 + s.length * 0.7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(s.x - s.width / 4, 20);
    ctx.lineTo(s.x - s.width / 6, 20 + s.length * 0.5);
    ctx.lineTo(s.x - s.width / 3, 20);
    ctx.fill();
}

function drawStalagmite(s) {
    const gradient = ctx.createLinearGradient(s.x, canvas.height - 30, s.x, canvas.height - 30 - s.length);
    gradient.addColorStop(0, '#8B7355');
    gradient.addColorStop(0.5, '#DEB887');
    gradient.addColorStop(1, '#F5DEB3');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(s.x - s.width / 2, canvas.height - 30);
    ctx.lineTo(s.x + s.width / 2, canvas.height - 30);
    ctx.lineTo(s.x + s.width / 4, canvas.height - 30 - s.length * 0.7);
    ctx.lineTo(s.x, canvas.height - 30 - s.length);
    ctx.lineTo(s.x - s.width / 4, canvas.height - 30 - s.length * 0.7);
    ctx.closePath();
    ctx.fill();
}

function drawWaterDrops() {
    ctx.fillStyle = 'rgba(135, 206, 250, 0.8)';
    waterDrops.forEach(drop => {
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawStats() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(5, 5, 100, 40);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`時間: ${Math.floor(time / 60)}年`, 10, 20);
    ctx.fillText(`速度: ${speed}x`, 10, 35);
}

function animate() {
    time += speed;
    drawBackground();
    stalactites.forEach(s => drawStalactite(s));
    stalagmites.forEach(s => drawStalagmite(s));
    drawWaterDrops();
    drawStats();
    updateFormations();
    requestAnimationFrame(animate);
}

document.getElementById('speedBtn').addEventListener('click', () => {
    speed = speed === 1 ? 5 : 1;
    document.getElementById('speedBtn').textContent = speed === 1 ? '加速時間' : '正常速度';
});

init();
animate();
