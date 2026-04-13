const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let satellites = [];
let stars = [];
let time = 0;

function init() {
    stars = [];
    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1
        });
    }

    satellites = [
        { distance: 80, angle: 0, speed: 0.02, size: 4, color: '#FF6347', name: 'LEO' },
        { distance: 100, angle: Math.PI / 2, speed: 0.015, size: 5, color: '#4169E1', name: 'MEO' },
        { distance: 120, angle: Math.PI, speed: 0.008, size: 6, color: '#FFD700', name: 'GEO' }
    ];
}

function addSatellite() {
    if (satellites.length >= 8) {
        satellites.shift();
    }

    const colors = ['#FF6347', '#4169E1', '#FFD700', '#00CED1', '#FF69B4', '#32CD32'];
    const names = ['SAT-A', 'SAT-B', 'SAT-C', 'SAT-D', 'SAT-E', 'SAT-F'];

    satellites.push({
        distance: 70 + Math.random() * 60,
        angle: Math.random() * Math.PI * 2,
        speed: 0.005 + Math.random() * 0.02,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        name: names[Math.floor(Math.random() * names.length)]
    });
}

function drawStars() {
    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEarth() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 45;

    const gradient = ctx.createRadialGradient(centerX - 10, centerY - 10, 0, centerX, centerY, radius);
    gradient.addColorStop(0, '#6495ED');
    gradient.addColorStop(0.5, '#4169E1');
    gradient.addColorStop(1, '#191970');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(34, 139, 34, 0.6)';
    ctx.beginPath();
    ctx.ellipse(centerX - 15, centerY - 10, 15, 20, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 10, centerY + 5, 12, 15, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 20, centerY - 15, 8, 10, 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX - 20, centerY - 25, 10, 6, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 15, centerY + 20, 12, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();

    const atmosphereGradient = ctx.createRadialGradient(centerX, centerY, radius - 5, centerX, centerY, radius + 10);
    atmosphereGradient.addColorStop(0, 'rgba(135, 206, 250, 0)');
    atmosphereGradient.addColorStop(0.5, 'rgba(135, 206, 250, 0.2)');
    atmosphereGradient.addColorStop(1, 'rgba(135, 206, 250, 0)');
    ctx.fillStyle = atmosphereGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
    ctx.fill();
}

function drawOrbits() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    satellites.forEach(sat => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, sat.distance, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    });
}

function drawSatellites() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    satellites.forEach(sat => {
        sat.angle += sat.speed;

        const x = centerX + Math.cos(sat.angle) * sat.distance;
        const y = centerY + Math.sin(sat.angle) * sat.distance;

        ctx.fillStyle = sat.color;
        ctx.fillRect(x - sat.size / 2, y - sat.size / 2, sat.size, sat.size);

        ctx.fillStyle = '#4169E1';
        ctx.fillRect(x - sat.size * 1.5, y - 1, sat.size * 0.8, 2);
        ctx.fillRect(x + sat.size / 2 + 2, y - 1, sat.size * 0.8, 2);

        const signalAlpha = 0.5 + Math.sin(time * 0.1) * 0.3;
        ctx.strokeStyle = `rgba(255, 255, 255, ${signalAlpha * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, sat.size + 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '9px Arial';
        ctx.fillText(sat.name, x + sat.size + 3, y + 3);
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`衛星數: ${satellites.length}`, 20, 28);
}

function animate() {
    time++;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawOrbits();
    drawEarth();
    drawSatellites();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('addBtn').addEventListener('click', addSatellite);

init();
animate();
