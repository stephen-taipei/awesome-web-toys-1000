const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const phases = [
    { name: '新月', angle: 0 },
    { name: '眉月', angle: 0.25 },
    { name: '上弦月', angle: 0.5 },
    { name: '盈凸月', angle: 0.75 },
    { name: '滿月', angle: 1 },
    { name: '虧凸月', angle: 1.25 },
    { name: '下弦月', angle: 1.5 },
    { name: '殘月', angle: 1.75 }
];

let currentPhase = 0;
let targetPhase = 0;
let animProgress = 1;
let stars = [];

function init() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            twinkle: Math.random() * Math.PI * 2
        });
    }
}

function nextPhase() {
    targetPhase = (currentPhase + 1) % phases.length;
    animProgress = 0;
}

function drawStars(time) {
    stars.forEach(star => {
        const brightness = 0.5 + Math.sin(time * 0.002 + star.twinkle) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawMoon(phase) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 60;

    ctx.fillStyle = '#F5F5DC';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 8; i++) {
        ctx.fillStyle = 'rgba(200, 200, 180, 0.3)';
        ctx.beginPath();
        ctx.arc(
            centerX - 30 + Math.random() * 60,
            centerY - 30 + Math.random() * 60,
            5 + Math.random() * 10,
            0, Math.PI * 2
        );
        ctx.fill();
    }

    const phaseAngle = phase * Math.PI;

    ctx.fillStyle = '#0a0a1a';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 1, 0, Math.PI * 2);
    ctx.clip();

    if (phase < 1) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius * Math.abs(Math.cos(phaseAngle)), radius, 0, -Math.PI / 2, Math.PI / 2);
        ctx.arc(centerX, centerY, radius, Math.PI / 2, -Math.PI / 2, true);
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius * Math.abs(Math.cos(phaseAngle)), radius, 0, Math.PI / 2, -Math.PI / 2);
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI / 2, true);
        ctx.fill();
    }
}

function drawInfo(phaseName) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(phaseName, 20, 30);
}

let time = 0;
function animate() {
    time++;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars(time);

    if (animProgress < 1) {
        animProgress += 0.02;
        if (animProgress >= 1) {
            animProgress = 1;
            currentPhase = targetPhase;
        }
    }

    ctx.save();
    const currentAngle = phases[currentPhase].angle;
    const targetAngle = phases[targetPhase].angle;
    let displayAngle = currentAngle + (targetAngle - currentAngle) * animProgress;

    if (targetPhase === 0 && currentPhase === 7) {
        displayAngle = currentAngle + (2 - currentAngle) * animProgress;
        if (displayAngle >= 2) displayAngle = 0;
    }

    drawMoon(displayAngle);
    ctx.restore();

    const displayName = animProgress >= 1 ? phases[currentPhase].name : phases[targetPhase].name;
    drawInfo(displayName);

    requestAnimationFrame(animate);
}

document.getElementById('nextBtn').addEventListener('click', nextPhase);

init();
animate();
