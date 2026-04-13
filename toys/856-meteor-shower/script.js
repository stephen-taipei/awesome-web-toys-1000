const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let meteors = [];
let stars = [];
let intensity = 1;

function init() {
    stars = [];
    for (let i = 0; i < 120; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            twinkle: Math.random() * Math.PI * 2
        });
    }
}

function changeIntensity() {
    intensity = intensity === 1 ? 3 : intensity === 3 ? 5 : 1;
}

function spawnMeteor() {
    if (Math.random() < 0.02 * intensity) {
        meteors.push({
            x: Math.random() * canvas.width,
            y: -10,
            vx: -3 - Math.random() * 3,
            vy: 5 + Math.random() * 5,
            length: 30 + Math.random() * 50,
            brightness: 0.5 + Math.random() * 0.5,
            life: 1
        });
    }
}

function drawStars(time) {
    stars.forEach(star => {
        const brightness = 0.4 + Math.sin(time * 0.002 + star.twinkle) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawMoon() {
    const moonX = canvas.width - 60;
    const moonY = 60;
    const moonRadius = 25;

    ctx.fillStyle = '#F5F5DC';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(200, 200, 180, 0.3)';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(
            moonX - 10 + Math.random() * 20,
            moonY - 10 + Math.random() * 20,
            3 + Math.random() * 5,
            0, Math.PI * 2
        );
        ctx.fill();
    }

    const gradient = ctx.createRadialGradient(moonX, moonY, moonRadius, moonX, moonY, moonRadius * 2);
    gradient.addColorStop(0, 'rgba(245, 245, 220, 0.2)');
    gradient.addColorStop(1, 'rgba(245, 245, 220, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 2, 0, Math.PI * 2);
    ctx.fill();
}

function updateMeteors() {
    for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.02;

        if (m.y > canvas.height + 50 || m.life <= 0) {
            meteors.splice(i, 1);
        }
    }
}

function drawMeteors() {
    meteors.forEach(m => {
        const angle = Math.atan2(m.vy, m.vx);
        const tailX = m.x - Math.cos(angle) * m.length;
        const tailY = m.y - Math.sin(angle) * m.length;

        const gradient = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        gradient.addColorStop(0, 'rgba(255, 165, 0, 0)');
        gradient.addColorStop(0.5, `rgba(255, 200, 100, ${m.brightness * m.life * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${m.brightness * m.life})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${m.brightness * m.life})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawHorizon() {
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 20) {
        ctx.lineTo(x, canvas.height - 20 - Math.sin(x * 0.02) * 10);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    const labels = ['普通', '密集', '暴雨'];
    ctx.fillText(`強度: ${labels[intensity === 1 ? 0 : intensity === 3 ? 1 : 2]}`, 20, 28);
}

let time = 0;
function animate() {
    time++;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars(time);
    drawMoon();
    spawnMeteor();
    updateMeteors();
    drawMeteors();
    drawHorizon();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('intensityBtn').addEventListener('click', changeIntensity);

init();
animate();
