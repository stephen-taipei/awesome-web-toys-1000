const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let stars = [];
let galaxyStars = [];
let rotationSpeed = 1;
let time = 0;

function init() {
    stars = [];
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 0.8
        });
    }

    galaxyStars = [];
    const arms = 4;
    const starsPerArm = 150;

    for (let arm = 0; arm < arms; arm++) {
        const armAngle = (arm / arms) * Math.PI * 2;

        for (let i = 0; i < starsPerArm; i++) {
            const distance = 10 + (i / starsPerArm) * 120;
            const spread = (distance / 120) * 0.8;
            const angle = armAngle + (distance / 30) + (Math.random() - 0.5) * spread;

            galaxyStars.push({
                distance,
                baseAngle: angle,
                size: 0.5 + Math.random() * 2,
                brightness: 0.3 + Math.random() * 0.7,
                color: Math.random() > 0.8 ?
                    (Math.random() > 0.5 ? '#FFB6C1' : '#87CEEB') : '#ffffff'
            });
        }
    }

    for (let i = 0; i < 100; i++) {
        const distance = Math.random() * 130;
        const angle = Math.random() * Math.PI * 2;

        galaxyStars.push({
            distance,
            baseAngle: angle,
            size: 0.3 + Math.random() * 1,
            brightness: 0.2 + Math.random() * 0.4,
            color: '#ffffff'
        });
    }
}

function changeSpeed() {
    rotationSpeed = rotationSpeed === 1 ? 2 : rotationSpeed === 2 ? 0.5 : 1;
}

function drawBackground() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawGalaxy() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const rotation = time * 0.001 * rotationSpeed;

    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
    coreGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    coreGradient.addColorStop(0.5, 'rgba(255, 200, 150, 0.3)');
    coreGradient.addColorStop(1, 'rgba(147, 112, 219, 0)');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fill();

    galaxyStars.forEach(star => {
        const speedFactor = 1 - (star.distance / 150) * 0.5;
        const angle = star.baseAngle + rotation * speedFactor;

        const x = centerX + Math.cos(angle) * star.distance;
        const y = centerY + Math.sin(angle) * star.distance * 0.4;

        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.brightness;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 1;

    const nebulaGradient = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, 100);
    nebulaGradient.addColorStop(0, 'rgba(147, 112, 219, 0)');
    nebulaGradient.addColorStop(0.5, 'rgba(147, 112, 219, 0.05)');
    nebulaGradient.addColorStop(1, 'rgba(147, 112, 219, 0)');
    ctx.fillStyle = nebulaGradient;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 100, 40, rotation * 0.1, 0, Math.PI * 2);
    ctx.fill();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`速度: ${rotationSpeed}x`, 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawGalaxy();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('speedBtn').addEventListener('click', changeSpeed);

init();
animate();
