const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let lightnings = [];
let flashOpacity = 0;
let raindrops = [];
let time = 0;

function init() {
    for (let i = 0; i < 80; i++) {
        raindrops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 8 + Math.random() * 6,
            length: 15 + Math.random() * 10
        });
    }
}

function createLightning(startX, startY) {
    const bolt = [];
    let x = startX;
    let y = startY;

    while (y < canvas.height - 40) {
        bolt.push({ x, y });
        x += (Math.random() - 0.5) * 40;
        y += 10 + Math.random() * 20;

        if (Math.random() < 0.2 && bolt.length > 3) {
            const branch = [];
            let bx = x;
            let by = y;
            for (let i = 0; i < 5; i++) {
                branch.push({ x: bx, y: by });
                bx += (Math.random() - 0.5) * 30 + (Math.random() < 0.5 ? -10 : 10);
                by += 10 + Math.random() * 15;
            }
            bolt.branch = branch;
        }
    }
    bolt.push({ x, y });
    bolt.alpha = 1;
    bolt.width = 3;
    return bolt;
}

function triggerLightning() {
    const startX = 50 + Math.random() * (canvas.width - 100);
    lightnings.push(createLightning(startX, 0));
    flashOpacity = 0.8;
}

function updateRain() {
    raindrops.forEach(drop => {
        drop.y += drop.speed;
        drop.x -= 2;
        if (drop.y > canvas.height) {
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;
        }
        if (drop.x < 0) drop.x = canvas.width;
    });
}

function updateLightning() {
    flashOpacity *= 0.9;
    for (let i = lightnings.length - 1; i >= 0; i--) {
        lightnings[i].alpha -= 0.05;
        if (lightnings[i].alpha <= 0) {
            lightnings.splice(i, 1);
        }
    }

    if (Math.random() < 0.005) {
        triggerLightning();
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a3a');
    gradient.addColorStop(0.5, '#2a2a4a');
    gradient.addColorStop(1, '#1a2a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (flashOpacity > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawClouds() {
    ctx.fillStyle = '#3a3a5a';
    for (let i = 0; i < 5; i++) {
        const x = i * 80;
        ctx.beginPath();
        ctx.arc(x + 20, 30, 30, 0, Math.PI * 2);
        ctx.arc(x + 50, 20, 35, 0, Math.PI * 2);
        ctx.arc(x + 80, 30, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawLightning() {
    lightnings.forEach(bolt => {
        ctx.strokeStyle = `rgba(255, 255, 200, ${bolt.alpha})`;
        ctx.lineWidth = bolt.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        bolt.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (bolt.branch) {
            ctx.strokeStyle = `rgba(255, 255, 200, ${bolt.alpha * 0.7})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            bolt.branch.forEach((point, i) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        }
    });
}

function drawRain() {
    ctx.strokeStyle = 'rgba(150, 150, 200, 0.5)';
    ctx.lineWidth = 1;
    raindrops.forEach(drop => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 3, drop.y + drop.length);
        ctx.stroke();
    });
}

function drawGround() {
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`閃電: ${lightnings.length}`, 20, 28);
}

function animate() {
    time++;
    updateRain();
    updateLightning();
    drawBackground();
    drawClouds();
    drawRain();
    drawLightning();
    drawGround();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('strikeBtn').addEventListener('click', triggerLightning);

init();
animate();
