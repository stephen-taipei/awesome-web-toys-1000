const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let snowflakes = [];
let snowDepth = 30;
let intensity = 1;
let time = 0;

function changeIntensity() {
    intensity = intensity === 1 ? 2 : intensity === 2 ? 0.5 : 1;
}

function spawnSnowflake() {
    const count = Math.floor(intensity * 2);
    for (let i = 0; i < count; i++) {
        if (Math.random() < 0.3) {
            snowflakes.push({
                x: Math.random() * canvas.width,
                y: -10,
                size: 2 + Math.random() * 4,
                speed: 1 + Math.random() * 2,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.02 + Math.random() * 0.02
            });
        }
    }
}

function updateSnowflakes() {
    for (let i = snowflakes.length - 1; i >= 0; i--) {
        const s = snowflakes[i];
        s.wobble += s.wobbleSpeed;
        s.x += Math.sin(s.wobble) * 0.5;
        s.y += s.speed;

        if (s.y > canvas.height - snowDepth) {
            snowDepth = Math.min(80, snowDepth + 0.01 * intensity);
            snowflakes.splice(i, 1);
        }
    }

    if (snowflakes.length > 200) {
        snowflakes = snowflakes.slice(-150);
    }
}

function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#708090');
    gradient.addColorStop(0.5, '#B0C4DE');
    gradient.addColorStop(1, '#DCDCDC');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMountains() {
    ctx.fillStyle = '#A9A9A9';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 100);
    ctx.lineTo(80, canvas.height - 180);
    ctx.lineTo(160, canvas.height - 120);
    ctx.lineTo(220, canvas.height - 200);
    ctx.lineTo(300, canvas.height - 140);
    ctx.lineTo(canvas.width, canvas.height - 160);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(80, canvas.height - 180);
    ctx.lineTo(60, canvas.height - 160);
    ctx.lineTo(100, canvas.height - 160);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(220, canvas.height - 200);
    ctx.lineTo(195, canvas.height - 175);
    ctx.lineTo(245, canvas.height - 175);
    ctx.fill();
}

function drawSnowGround() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 20) {
        const y = canvas.height - snowDepth + Math.sin(x * 0.05 + time * 0.01) * 3;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    ctx.fillStyle = 'rgba(200, 220, 240, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - snowDepth + 5);
    for (let x = 0; x <= canvas.width; x += 15) {
        const y = canvas.height - snowDepth + 5 + Math.sin(x * 0.08 + 1) * 2;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();
}

function drawTree() {
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(55, canvas.height - snowDepth - 60, 10, 60);

    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(60, canvas.height - snowDepth - 120);
    ctx.lineTo(30, canvas.height - snowDepth - 60);
    ctx.lineTo(90, canvas.height - snowDepth - 60);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(60, canvas.height - snowDepth - 100);
    ctx.lineTo(35, canvas.height - snowDepth - 50);
    ctx.lineTo(85, canvas.height - snowDepth - 50);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(60, canvas.height - snowDepth - 120);
    ctx.lineTo(45, canvas.height - snowDepth - 100);
    ctx.lineTo(75, canvas.height - snowDepth - 100);
    ctx.fill();
}

function drawSnowflakes() {
    ctx.fillStyle = '#fff';
    snowflakes.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawSnowman() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(300, canvas.height - snowDepth - 20, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(300, canvas.height - snowDepth - 55, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(300, canvas.height - snowDepth - 80, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(295, canvas.height - snowDepth - 82, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(305, canvas.height - snowDepth - 82, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(300, canvas.height - snowDepth - 78);
    ctx.lineTo(310, canvas.height - snowDepth - 76);
    ctx.lineTo(300, canvas.height - snowDepth - 74);
    ctx.fill();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    const labels = { 0.5: '小雪', 1: '中雪', 2: '大雪' };
    ctx.fillText(`雪量: ${labels[intensity]}`, 20, 28);
}

function animate() {
    time++;
    drawSky();
    drawMountains();
    drawSnowGround();
    drawTree();
    drawSnowman();
    spawnSnowflake();
    updateSnowflakes();
    drawSnowflakes();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('intensityBtn').addEventListener('click', changeIntensity);

animate();
