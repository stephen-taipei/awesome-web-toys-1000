const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let isRaining = true;
let raindrops = [];
let rainbowOpacity = 0;
let time = 0;

const rainbowColors = [
    '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'
];

function init() {
    for (let i = 0; i < 100; i++) {
        raindrops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 5 + Math.random() * 5,
            length: 10 + Math.random() * 10
        });
    }
}

function toggleRain() {
    isRaining = !isRaining;
}

function updateRain() {
    if (isRaining) {
        rainbowOpacity = Math.max(0, rainbowOpacity - 0.01);
        raindrops.forEach(drop => {
            drop.y += drop.speed;
            if (drop.y > canvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * canvas.width;
            }
        });
    } else {
        rainbowOpacity = Math.min(1, rainbowOpacity + 0.02);
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (isRaining) {
        gradient.addColorStop(0, '#4a5568');
        gradient.addColorStop(1, '#2d3748');
    } else {
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSun() {
    if (!isRaining) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(canvas.width - 50, 50, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(canvas.width - 50 + Math.cos(angle) * 35, 50 + Math.sin(angle) * 35);
            ctx.lineTo(canvas.width - 50 + Math.cos(angle) * 50, 50 + Math.sin(angle) * 50);
            ctx.stroke();
        }
    }
}

function drawRainbow() {
    if (rainbowOpacity > 0) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height + 50;

        for (let i = 0; i < rainbowColors.length; i++) {
            ctx.strokeStyle = rainbowColors[i];
            ctx.globalAlpha = rainbowOpacity * 0.7;
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 180 - i * 12, Math.PI, 0);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
}

function drawRain() {
    if (isRaining) {
        ctx.strokeStyle = 'rgba(200, 200, 255, 0.6)';
        ctx.lineWidth = 1;
        raindrops.forEach(drop => {
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x - 1, drop.y + drop.length);
            ctx.stroke();
        });
    }
}

function drawGround() {
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    ctx.fillStyle = '#32CD32';
    for (let i = 0; i < 50; i++) {
        const x = i * 8;
        ctx.fillRect(x, canvas.height - 45 + Math.sin(i) * 3, 3, 10);
    }
}

function drawClouds() {
    const cloudColor = isRaining ? '#6B7280' : '#FFFFFF';
    ctx.fillStyle = cloudColor;

    [[50, 40], [150, 30], [280, 45]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, y - 5, 25, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(isRaining ? '下雨中...' : '彩虹出現！', 20, 28);
}

function animate() {
    time++;
    updateRain();
    drawBackground();
    drawSun();
    drawClouds();
    drawRainbow();
    drawRain();
    drawGround();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('rainBtn').addEventListener('click', toggleRain);

init();
animate();
