const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let timeOfDay = 0;
let targetTime = 0;
let stars = [];

const timeNames = ['日出', '正午', '日落', '午夜'];

function init() {
    stars = [];
    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height * 0.6),
            size: Math.random() * 1.5
        });
    }
}

function toggleTime() {
    targetTime = (Math.round(timeOfDay) + 1) % 4;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpColor(c1, c2, t) {
    return [
        Math.round(lerp(c1[0], c2[0], t)),
        Math.round(lerp(c1[1], c2[1], t)),
        Math.round(lerp(c1[2], c2[2], t))
    ];
}

function getSkyColors(time) {
    const colors = [
        { top: [255, 127, 80], bottom: [255, 218, 185] },
        { top: [135, 206, 235], bottom: [176, 224, 230] },
        { top: [255, 99, 71], bottom: [255, 165, 0] },
        { top: [10, 10, 30], bottom: [25, 25, 60] }
    ];

    const index = Math.floor(time) % 4;
    const nextIndex = (index + 1) % 4;
    const t = time - Math.floor(time);

    return {
        top: lerpColor(colors[index].top, colors[nextIndex].top, t),
        bottom: lerpColor(colors[index].bottom, colors[nextIndex].bottom, t)
    };
}

function drawSky() {
    const colors = getSkyColors(timeOfDay);
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgb(${colors.top.join(',')})`);
    gradient.addColorStop(1, `rgb(${colors.bottom.join(',')})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStars() {
    const nightness = Math.max(0, (timeOfDay > 2.5 || timeOfDay < 0.5) ?
        (timeOfDay > 2.5 ? (timeOfDay - 2.5) * 2 : (0.5 - timeOfDay) * 2) : 0);

    if (nightness > 0) {
        stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${nightness * star.size / 1.5})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

function drawSunMoon() {
    const angle = (timeOfDay / 4) * Math.PI * 2 - Math.PI / 2;
    const centerX = canvas.width / 2;
    const radiusX = canvas.width * 0.4;
    const radiusY = canvas.height * 0.35;

    const sunX = centerX + Math.cos(angle) * radiusX;
    const sunY = canvas.height * 0.5 - Math.sin(angle) * radiusY;

    if (timeOfDay < 2.5) {
        const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 40);
        sunGradient.addColorStop(0, '#FFFACD');
        sunGradient.addColorStop(0.5, '#FFD700');
        sunGradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    const moonAngle = angle + Math.PI;
    const moonX = centerX + Math.cos(moonAngle) * radiusX;
    const moonY = canvas.height * 0.5 - Math.sin(moonAngle) * radiusY;

    if (timeOfDay > 2.5 || timeOfDay < 0.5) {
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(200, 200, 180, 0.3)';
        ctx.beginPath();
        ctx.arc(moonX - 5, moonY - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(moonX + 7, moonY + 3, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawLandscape() {
    const darkness = (timeOfDay > 2.5 || timeOfDay < 0.5) ? 0.5 : 0;

    ctx.fillStyle = `rgb(${Math.floor(34 * (1 - darkness * 0.5))}, ${Math.floor(139 * (1 - darkness * 0.5))}, ${Math.floor(34 * (1 - darkness * 0.5))})`;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height - 60);
    for (let x = 0; x <= canvas.width; x += 30) {
        ctx.lineTo(x, canvas.height - 60 - Math.sin(x * 0.02) * 20);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    ctx.fillStyle = `rgb(${Math.floor(85 * (1 - darkness * 0.5))}, ${Math.floor(107 * (1 - darkness * 0.5))}, ${Math.floor(47 * (1 - darkness * 0.5))})`;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height - 30);
    for (let x = 0; x <= canvas.width; x += 20) {
        ctx.lineTo(x, canvas.height - 30 - Math.sin(x * 0.03 + 1) * 10);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();
}

function drawClouds() {
    const alpha = timeOfDay > 2.5 || timeOfDay < 0.5 ? 0.3 : 0.8;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;

    [[50, 80], [200, 60], [300, 90]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.arc(x + 20, y - 5, 18, 0, Math.PI * 2);
        ctx.arc(x + 40, y, 15, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 80, 30);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(timeNames[Math.round(timeOfDay) % 4], 20, 30);
}

function animate() {
    if (Math.abs(timeOfDay - targetTime) > 0.01) {
        let diff = targetTime - timeOfDay;
        if (diff > 2) diff -= 4;
        if (diff < -2) diff += 4;
        timeOfDay += diff * 0.02;
        if (timeOfDay < 0) timeOfDay += 4;
        if (timeOfDay >= 4) timeOfDay -= 4;
    }

    drawSky();
    drawStars();
    drawClouds();
    drawSunMoon();
    drawLandscape();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('toggleBtn').addEventListener('click', toggleTime);

init();
animate();
