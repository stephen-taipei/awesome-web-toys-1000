const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let hailstones = [];
let impacts = [];
let intensity = 1;
let time = 0;

function init() {
    for (let i = 0; i < 20; i++) {
        addHailstone();
    }
}

function addHailstone() {
    hailstones.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 50,
        size: 3 + Math.random() * 8,
        speedY: 8 + Math.random() * 6,
        speedX: -2 + Math.random() * 1,
        rotation: Math.random() * Math.PI * 2
    });
}

function increaseStorm() {
    intensity = Math.min(3, intensity + 0.5);
    for (let i = 0; i < 15; i++) addHailstone();
}

function updateHail() {
    for (let i = hailstones.length - 1; i >= 0; i--) {
        const h = hailstones[i];
        h.y += h.speedY * intensity;
        h.x += h.speedX * intensity;
        h.rotation += 0.1;

        if (h.y > canvas.height - 40) {
            impacts.push({
                x: h.x,
                y: canvas.height - 40,
                size: h.size,
                alpha: 1
            });
            hailstones.splice(i, 1);
        }
    }

    for (let i = impacts.length - 1; i >= 0; i--) {
        impacts[i].alpha -= 0.05;
        impacts[i].size += 0.5;
        if (impacts[i].alpha <= 0) impacts.splice(i, 1);
    }

    if (Math.random() < 0.3 * intensity) addHailstone();

    intensity = Math.max(1, intensity - 0.005);

    if (hailstones.length > 100) hailstones = hailstones.slice(-80);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(0.5, '#34495e');
    gradient.addColorStop(1, '#1a252f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawClouds() {
    ctx.fillStyle = '#1a252f';
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(50 + i * 100, 30, 40, 0, Math.PI * 2);
        ctx.arc(80 + i * 100, 25, 45, 0, Math.PI * 2);
        ctx.arc(110 + i * 100, 35, 35, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawHailstones() {
    hailstones.forEach(h => {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rotation);

        const gradient = ctx.createRadialGradient(-h.size * 0.3, -h.size * 0.3, 0, 0, 0, h.size);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#e0e8f0');
        gradient.addColorStop(1, '#a0b0c0');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, h.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    });
}

function drawImpacts() {
    impacts.forEach(imp => {
        ctx.strokeStyle = `rgba(200, 220, 240, ${imp.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(imp.x, imp.y, imp.size, 0, Math.PI * 2);
        ctx.stroke();

        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI + Math.PI;
            ctx.beginPath();
            ctx.moveTo(imp.x, imp.y);
            ctx.lineTo(
                imp.x + Math.cos(angle) * imp.size * 1.5,
                imp.y + Math.sin(angle) * imp.size * 0.5
            );
            ctx.stroke();
        }
    });
}

function drawGround() {
    ctx.fillStyle = '#1a252f';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    ctx.fillStyle = '#2c3e50';
    for (let i = 0; i < 30; i++) {
        const x = (i * 15 + time * 0.1) % canvas.width;
        ctx.beginPath();
        ctx.arc(x, canvas.height - 35, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`強度: ${intensity.toFixed(1)}x`, 20, 28);
}

function animate() {
    time++;
    updateHail();
    drawBackground();
    drawClouds();
    drawHailstones();
    drawImpacts();
    drawGround();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('stormBtn').addEventListener('click', increaseStorm);

init();
animate();
