const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let asteroids = [];
let speedMultiplier = 1;
let time = 0;

function init() {
    asteroids = [];
    for (let i = 0; i < 200; i++) {
        const distance = 80 + Math.random() * 50;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.001 + Math.random() * 0.002;

        asteroids.push({
            distance,
            angle,
            speed,
            size: 1 + Math.random() * 3,
            brightness: 0.4 + Math.random() * 0.6,
            yOffset: (Math.random() - 0.5) * 20
        });
    }
}

function changeSpeed() {
    speedMultiplier = speedMultiplier === 1 ? 3 : speedMultiplier === 3 ? 0.3 : 1;
}

function drawSun() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.5, '#FFA500');
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
}

function drawOrbits() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.ellipse(cx, cy, 50, 25, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, cy, 150, 75, 0, 0, Math.PI * 2);
    ctx.stroke();
}

function drawPlanets() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const marsAngle = time * 0.003;
    const marsX = cx + Math.cos(marsAngle) * 50;
    const marsY = cy + Math.sin(marsAngle) * 25;
    ctx.fillStyle = '#CD5C5C';
    ctx.beginPath();
    ctx.arc(marsX, marsY, 5, 0, Math.PI * 2);
    ctx.fill();

    const jupiterAngle = time * 0.001;
    const jupiterX = cx + Math.cos(jupiterAngle) * 150;
    const jupiterY = cy + Math.sin(jupiterAngle) * 75;

    const jupiterGradient = ctx.createRadialGradient(jupiterX - 3, jupiterY - 3, 0, jupiterX, jupiterY, 15);
    jupiterGradient.addColorStop(0, '#DEB887');
    jupiterGradient.addColorStop(1, '#D2691E');
    ctx.fillStyle = jupiterGradient;
    ctx.beginPath();
    ctx.arc(jupiterX, jupiterY, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(139, 69, 19, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(jupiterX - 15, jupiterY - 3);
    ctx.lineTo(jupiterX + 15, jupiterY - 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(jupiterX - 15, jupiterY + 5);
    ctx.lineTo(jupiterX + 15, jupiterY + 5);
    ctx.stroke();
}

function drawAsteroids() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    asteroids.forEach(asteroid => {
        const x = cx + Math.cos(asteroid.angle) * asteroid.distance;
        const y = cy + Math.sin(asteroid.angle) * (asteroid.distance * 0.5) + asteroid.yOffset;

        ctx.fillStyle = `rgba(160, 82, 45, ${asteroid.brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, asteroid.size, 0, Math.PI * 2);
        ctx.fill();

        asteroid.angle += asteroid.speed * speedMultiplier;
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`速度: ${speedMultiplier}x`, 20, 28);
}

function drawStars() {
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(
            (i * 73) % canvas.width,
            (i * 47) % canvas.height,
            0.5,
            0, Math.PI * 2
        );
        ctx.fill();
    }
}

function animate() {
    time++;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawOrbits();
    drawSun();
    drawAsteroids();
    drawPlanets();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('speedBtn').addEventListener('click', changeSpeed);

init();
animate();
