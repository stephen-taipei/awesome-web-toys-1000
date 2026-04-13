const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let moisture = 0;
let raindrops = [];
let cracks = [];
let heatWaves = [];
let time = 0;

function init() {
    for (let i = 0; i < 15; i++) {
        cracks.push({
            x: Math.random() * canvas.width,
            y: canvas.height - 80 + Math.random() * 60,
            length: 20 + Math.random() * 40,
            angle: -Math.PI / 2 + (Math.random() - 0.5) * 0.5
        });
    }

    for (let i = 0; i < 5; i++) {
        heatWaves.push({
            y: 50 + i * 40,
            offset: Math.random() * Math.PI * 2
        });
    }
}

function makeRain() {
    moisture = Math.min(100, moisture + 30);
    for (let i = 0; i < 50; i++) {
        raindrops.push({
            x: Math.random() * canvas.width,
            y: -Math.random() * 100,
            speed: 5 + Math.random() * 3,
            length: 10 + Math.random() * 10
        });
    }
}

function updateRain() {
    for (let i = raindrops.length - 1; i >= 0; i--) {
        raindrops[i].y += raindrops[i].speed;
        if (raindrops[i].y > canvas.height) {
            raindrops.splice(i, 1);
        }
    }

    moisture = Math.max(0, moisture - 0.1);
}

function drawBackground() {
    const dryness = 1 - moisture / 100;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

    if (moisture > 50) {
        gradient.addColorStop(0, '#6B8E9B');
        gradient.addColorStop(0.5, '#87CEEB');
    } else {
        gradient.addColorStop(0, `rgb(${200 + dryness * 55}, ${150 + dryness * 50}, ${100})`);
        gradient.addColorStop(0.5, `rgb(${220 + dryness * 35}, ${180 + dryness * 30}, ${120})`);
    }
    gradient.addColorStop(1, '#C4A77D');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSun() {
    const intensity = 1 - moisture / 100;
    ctx.fillStyle = `rgba(255, ${200 - intensity * 50}, 0, ${0.5 + intensity * 0.5})`;
    ctx.beginPath();
    ctx.arc(canvas.width - 50, 50, 30 + intensity * 10, 0, Math.PI * 2);
    ctx.fill();

    if (intensity > 0.5) {
        ctx.strokeStyle = `rgba(255, 200, 0, ${intensity * 0.3})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 0.01;
            ctx.beginPath();
            ctx.moveTo(canvas.width - 50 + Math.cos(angle) * 45, 50 + Math.sin(angle) * 45);
            ctx.lineTo(canvas.width - 50 + Math.cos(angle) * 65, 50 + Math.sin(angle) * 65);
            ctx.stroke();
        }
    }
}

function drawHeatWaves() {
    if (moisture < 30) {
        ctx.strokeStyle = `rgba(255, 200, 100, ${0.2 * (1 - moisture / 30)})`;
        ctx.lineWidth = 2;

        heatWaves.forEach(wave => {
            wave.offset += 0.05;
            ctx.beginPath();
            for (let x = 0; x <= canvas.width; x += 5) {
                const y = wave.y + Math.sin(x * 0.05 + wave.offset) * 5;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });
    }
}

function drawGround() {
    const dryness = 1 - moisture / 100;
    ctx.fillStyle = `rgb(${180 - dryness * 40}, ${140 - dryness * 40}, ${80 - dryness * 20})`;
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
}

function drawCracks() {
    const visibility = 1 - moisture / 100;
    if (visibility > 0.3) {
        ctx.strokeStyle = `rgba(100, 70, 40, ${visibility})`;
        ctx.lineWidth = 2;

        cracks.forEach(crack => {
            ctx.beginPath();
            ctx.moveTo(crack.x, crack.y);

            let x = crack.x;
            let y = crack.y;
            let angle = crack.angle;

            for (let i = 0; i < 5; i++) {
                x += Math.cos(angle) * (crack.length / 5);
                y += Math.sin(angle) * (crack.length / 5);
                ctx.lineTo(x, y);
                angle += (Math.random() - 0.5) * 0.5;
            }
            ctx.stroke();

            if (Math.random() < 0.3) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(angle + 0.5) * 10, y + Math.sin(angle + 0.5) * 10);
                ctx.stroke();
            }
        });
    }
}

function drawDeadTree() {
    const life = moisture / 100;
    ctx.fillStyle = life > 0.5 ? '#228B22' : '#8B4513';
    ctx.fillRect(60, canvas.height - 120, 8, 50);

    if (life > 0.5) {
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(64, canvas.height - 130, 20, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(64, canvas.height - 120);
        ctx.lineTo(45, canvas.height - 140);
        ctx.moveTo(64, canvas.height - 115);
        ctx.lineTo(80, canvas.height - 135);
        ctx.stroke();
    }
}

function drawRain() {
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
    ctx.lineWidth = 1;
    raindrops.forEach(drop => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`濕度: ${moisture.toFixed(0)}%`, 20, 28);
}

function animate() {
    time++;
    updateRain();
    drawBackground();
    drawSun();
    drawHeatWaves();
    drawGround();
    drawCracks();
    drawDeadTree();
    drawRain();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('rainBtn').addEventListener('click', makeRain);

init();
animate();
