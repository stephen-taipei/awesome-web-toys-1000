const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let temperature = 35;
let heatWaves = [];
let time = 0;

function coolDown() {
    temperature = Math.max(20, temperature - 5);
}

function spawnHeatWave() {
    if (temperature > 25 && Math.random() < (temperature - 25) * 0.01) {
        heatWaves.push({
            x: Math.random() * canvas.width,
            y: canvas.height - 50,
            width: 30 + Math.random() * 50,
            alpha: 0.3
        });
    }
}

function updateHeatWaves() {
    for (let i = heatWaves.length - 1; i >= 0; i--) {
        const w = heatWaves[i];
        w.y -= 1;
        w.alpha -= 0.005;
        w.x += Math.sin(w.y * 0.1) * 2;

        if (w.alpha <= 0 || w.y < 0) {
            heatWaves.splice(i, 1);
        }
    }

    temperature = Math.min(40, temperature + 0.01);
}

function drawSky() {
    const heatFactor = (temperature - 20) / 20;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgb(${135 + heatFactor * 50}, ${206 - heatFactor * 50}, ${235 - heatFactor * 50})`);
    gradient.addColorStop(1, `rgb(${200 + heatFactor * 55}, ${220 - heatFactor * 70}, ${200 - heatFactor * 100})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSun() {
    const cx = canvas.width - 70;
    const cy = 60;
    const heatFactor = (temperature - 20) / 20;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
    gradient.addColorStop(0, `rgba(255, ${255 - heatFactor * 100}, 0, 0.8)`);
    gradient.addColorStop(0.3, `rgba(255, ${200 - heatFactor * 100}, 0, 0.3)`);
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgb(255, ${230 - heatFactor * 50}, 0)`;
    ctx.beginPath();
    ctx.arc(cx, cy, 35, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + time * 0.01;
        const length = 50 + Math.sin(time * 0.1 + i) * 10;
        ctx.strokeStyle = `rgba(255, ${200 - heatFactor * 50}, 0, 0.5)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * 40, cy + Math.sin(angle) * 40);
        ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
        ctx.stroke();
    }
}

function drawGround() {
    const heatFactor = (temperature - 20) / 20;
    ctx.fillStyle = `rgb(${194 + heatFactor * 30}, ${178 - heatFactor * 50}, ${128 - heatFactor * 50})`;
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
}

function drawHeatWaves() {
    heatWaves.forEach(w => {
        ctx.strokeStyle = `rgba(255, 200, 150, ${w.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < w.width; x += 5) {
            const y = w.y + Math.sin((x + w.x) * 0.2 + time * 0.1) * 5;
            if (x === 0) ctx.moveTo(w.x + x, y);
            else ctx.lineTo(w.x + x, y);
        }
        ctx.stroke();
    });
}

function drawCactus() {
    ctx.fillStyle = '#228B22';

    ctx.beginPath();
    ctx.roundRect(80, canvas.height - 120, 20, 70, 10);
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(65, canvas.height - 100, 15, 30, 7);
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(100, canvas.height - 90, 15, 25, 7);
    ctx.fill();

    ctx.fillStyle = '#006400';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(82, canvas.height - 115 + i * 15, 16, 2);
    }
}

function drawThermometer() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(20, 80, 20, 120);
    ctx.beginPath();
    ctx.arc(30, 210, 15, 0, Math.PI * 2);
    ctx.fill();

    const tempHeight = ((temperature - 20) / 20) * 100;
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(25, 200 - tempHeight, 10, tempHeight);
    ctx.beginPath();
    ctx.arc(30, 210, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`${Math.round(temperature)}°C`, 15, 70);
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(canvas.width - 110, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(temperature > 35 ? '酷熱！' : temperature > 30 ? '炎熱' : '溫暖', canvas.width - 100, 28);
}

function animate() {
    time++;
    drawSky();
    drawSun();
    drawGround();
    spawnHeatWave();
    updateHeatWaves();
    drawHeatWaves();
    drawCactus();
    drawThermometer();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('coolBtn').addEventListener('click', coolDown);

animate();
