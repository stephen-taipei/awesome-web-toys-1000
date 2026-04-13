const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let waterLevel = 50;
let raindrops = [];
let debris = [];
let time = 0;

function init() {
    for (let i = 0; i < 50; i++) {
        raindrops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 6 + Math.random() * 4,
            length: 10 + Math.random() * 10
        });
    }

    for (let i = 0; i < 5; i++) {
        addDebris();
    }
}

function addDebris() {
    debris.push({
        x: -20 + Math.random() * (canvas.width + 40),
        y: canvas.height - waterLevel + Math.random() * 20,
        size: 5 + Math.random() * 10,
        speed: 1 + Math.random() * 2,
        type: Math.random() < 0.5 ? 'wood' : 'leaf'
    });
}

function addRain() {
    waterLevel = Math.min(200, waterLevel + 15);
    for (let i = 0; i < 30; i++) {
        raindrops.push({
            x: Math.random() * canvas.width,
            y: -Math.random() * 50,
            speed: 8 + Math.random() * 4,
            length: 15 + Math.random() * 10
        });
    }
    addDebris();
}

function updateRain() {
    raindrops.forEach(drop => {
        drop.y += drop.speed;
        drop.x -= 1;
        if (drop.y > canvas.height - waterLevel) {
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;
        }
    });

    waterLevel = Math.max(30, waterLevel - 0.05);
}

function updateDebris() {
    debris.forEach(d => {
        d.x += d.speed;
        d.y = canvas.height - waterLevel + Math.sin(time * 0.1 + d.x * 0.05) * 5;

        if (d.x > canvas.width + 20) {
            d.x = -20;
        }
    });

    if (debris.length > 15) debris = debris.slice(-12);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4a5568');
    gradient.addColorStop(0.4, '#5a6578');
    gradient.addColorStop(1, '#3a4558');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawClouds() {
    ctx.fillStyle = '#3a4558';
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(30 + i * 100, 30, 35, 0, Math.PI * 2);
        ctx.arc(60 + i * 100, 25, 40, 0, Math.PI * 2);
        ctx.arc(90 + i * 100, 35, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawHouse() {
    const houseBottom = canvas.height - 50;
    const submerged = Math.max(0, waterLevel - 50);

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(150, houseBottom - 60, 70, 60 - submerged);

    if (submerged < 40) {
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.moveTo(145, houseBottom - 60);
        ctx.lineTo(185, houseBottom - 90);
        ctx.lineTo(225, houseBottom - 60);
        ctx.fill();
    }

    if (submerged < 30) {
        ctx.fillStyle = '#654321';
        ctx.fillRect(175, houseBottom - 40, 20, 40 - submerged);

        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(155, houseBottom - 50, 15, 15);
        ctx.fillRect(200, houseBottom - 50, 15, 15);
    }
}

function drawTree() {
    const treeBottom = canvas.height - 40;
    const submerged = Math.max(0, waterLevel - 40);

    if (submerged < 50) {
        ctx.fillStyle = '#654321';
        ctx.fillRect(280, treeBottom - 60, 10, 60 - submerged);
    }

    if (submerged < 60) {
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(285, treeBottom - 80, 25, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawWater() {
    const waterY = canvas.height - waterLevel;

    const gradient = ctx.createLinearGradient(0, waterY, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(70, 130, 180, 0.7)');
    gradient.addColorStop(0.5, 'rgba(60, 110, 160, 0.8)');
    gradient.addColorStop(1, 'rgba(50, 90, 140, 0.9)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, waterY);

    for (let x = 0; x <= canvas.width; x += 10) {
        const waveY = waterY + Math.sin(x * 0.05 + time * 0.1) * 5;
        ctx.lineTo(x, waveY);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 10) {
            const waveY = waterY + 10 + i * 15 + Math.sin(x * 0.03 + time * 0.08 + i) * 3;
            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
    }
}

function drawDebris() {
    debris.forEach(d => {
        if (d.type === 'wood') {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(d.x - d.size / 2, d.y - 3, d.size, 6);
        } else {
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawRain() {
    ctx.strokeStyle = 'rgba(150, 180, 220, 0.5)';
    ctx.lineWidth = 1;
    raindrops.forEach(drop => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.length);
        ctx.stroke();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`水位: ${waterLevel.toFixed(0)}cm`, 20, 28);
}

function animate() {
    time++;
    updateRain();
    updateDebris();
    drawBackground();
    drawClouds();
    drawHouse();
    drawTree();
    drawWater();
    drawDebris();
    drawRain();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('rainBtn').addEventListener('click', addRain);

init();
animate();
