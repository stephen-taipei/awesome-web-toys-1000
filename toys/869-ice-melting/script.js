const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let iceSize = 100;
let waterLevel = 0;
let droplets = [];
let isHeating = false;
let temperature = 0;

function startHeating() {
    isHeating = true;
    setTimeout(() => { isHeating = false; }, 2000);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    const temp = Math.min(temperature / 100, 1);
    gradient.addColorStop(0, `rgb(${224 + temp * 30}, ${232 - temp * 50}, ${240 - temp * 80})`);
    gradient.addColorStop(1, `rgb(${200 + temp * 55}, ${210 - temp * 60}, ${220 - temp * 100})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGlass() {
    ctx.strokeStyle = 'rgba(150, 180, 200, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(110, 80);
    ctx.lineTo(100, 250);
    ctx.lineTo(270, 250);
    ctx.lineTo(260, 80);
    ctx.stroke();

    ctx.fillStyle = 'rgba(200, 220, 240, 0.3)';
    ctx.beginPath();
    ctx.moveTo(113, 80);
    ctx.lineTo(103, 247);
    ctx.lineTo(267, 247);
    ctx.lineTo(257, 80);
    ctx.fill();
}

function drawWater() {
    if (waterLevel > 0) {
        const waterY = 247 - waterLevel;
        const gradient = ctx.createLinearGradient(0, waterY, 0, 247);
        gradient.addColorStop(0, 'rgba(100, 180, 230, 0.6)');
        gradient.addColorStop(1, 'rgba(70, 150, 200, 0.8)');
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(105, 247);
        for (let x = 105; x <= 265; x += 5) {
            const wave = Math.sin(x * 0.1 + Date.now() * 0.003) * 2;
            ctx.lineTo(x, waterY + wave);
        }
        ctx.lineTo(265, 247);
        ctx.closePath();
        ctx.fill();
    }
}

function drawIce() {
    if (iceSize <= 0) return;

    const cx = 185;
    const cy = 180 - waterLevel * 0.3;
    const size = iceSize * 0.5;

    ctx.save();
    ctx.translate(cx, cy);

    const gradient = ctx.createLinearGradient(-size, -size, size, size);
    gradient.addColorStop(0, 'rgba(220, 240, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(180, 220, 250, 0.8)');
    gradient.addColorStop(1, 'rgba(150, 200, 240, 0.7)');
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(-size * 0.8, -size * 0.6);
    ctx.lineTo(size * 0.7, -size * 0.7);
    ctx.lineTo(size * 0.9, size * 0.5);
    ctx.lineTo(-size * 0.6, size * 0.7);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, -size * 0.3);
    ctx.lineTo(size * 0.3, -size * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, size * 0.2);
    ctx.lineTo(size * 0.5, size * 0.1);
    ctx.stroke();

    ctx.restore();
}

function updateDroplets() {
    if (iceSize > 0 && temperature > 20) {
        if (Math.random() < 0.1) {
            const cx = 185;
            const cy = 180 - waterLevel * 0.3;
            const size = iceSize * 0.5;

            droplets.push({
                x: cx + (Math.random() - 0.5) * size,
                y: cy + size * 0.5,
                vy: 1,
                size: 2 + Math.random() * 2
            });
        }
    }

    for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.vy += 0.2;
        d.y += d.vy;

        if (d.y > 247 - waterLevel) {
            droplets.splice(i, 1);
        }
    }
}

function drawDroplets() {
    ctx.fillStyle = 'rgba(150, 200, 240, 0.8)';
    droplets.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawHeatWaves() {
    if (isHeating) {
        ctx.strokeStyle = 'rgba(255, 100, 50, 0.3)';
        ctx.lineWidth = 3;

        for (let i = 0; i < 5; i++) {
            const x = 120 + i * 35;
            const offset = Math.sin(Date.now() * 0.01 + i) * 5;

            ctx.beginPath();
            ctx.moveTo(x, 270);
            ctx.quadraticCurveTo(x + offset, 260, x, 250);
            ctx.quadraticCurveTo(x - offset, 240, x, 230);
            ctx.stroke();
        }
    }
}

function drawThermometer() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(20, 100, 20, 120);
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.arc(30, 230, 15, 0, Math.PI * 2);
    ctx.fill();

    const tempHeight = (temperature / 100) * 100;
    ctx.fillStyle = '#FF6347';
    ctx.fillRect(25, 220 - tempHeight, 10, tempHeight);
    ctx.beginPath();
    ctx.arc(30, 230, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    ctx.fillText(`${Math.round(temperature)}°C`, 15, 90);
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`冰塊: ${Math.round(iceSize)}%`, 20, 28);
}

function update() {
    if (isHeating) {
        temperature = Math.min(100, temperature + 2);
    } else {
        temperature = Math.max(0, temperature - 0.5);
    }

    if (temperature > 30 && iceSize > 0) {
        const meltRate = (temperature - 30) * 0.02;
        iceSize = Math.max(0, iceSize - meltRate);
        waterLevel = Math.min(80, (100 - iceSize) * 0.8);
    }
}

function animate() {
    update();
    drawBackground();
    drawGlass();
    drawWater();
    drawIce();
    updateDroplets();
    drawDroplets();
    drawHeatWaves();
    drawThermometer();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('heatBtn').addEventListener('click', startHeating);

animate();
