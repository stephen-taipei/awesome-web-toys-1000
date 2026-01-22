const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let rotation = 0;
let isRotating = false;
let stars = [];

const constellations = [
    {
        name: '北斗七星',
        stars: [
            { x: 100, y: 80 }, { x: 130, y: 85 }, { x: 155, y: 95 }, { x: 180, y: 90 },
            { x: 200, y: 110 }, { x: 230, y: 130 }, { x: 250, y: 115 }
        ],
        lines: [[0,1], [1,2], [2,3], [3,4], [4,5], [4,6]]
    },
    {
        name: '獵戶座',
        stars: [
            { x: 280, y: 180 }, { x: 300, y: 200 }, { x: 320, y: 220 },
            { x: 260, y: 210 }, { x: 340, y: 210 },
            { x: 270, y: 250 }, { x: 330, y: 250 }
        ],
        lines: [[0,1], [1,2], [3,1], [1,4], [3,5], [4,6]]
    },
    {
        name: '仙后座',
        stars: [
            { x: 50, y: 200 }, { x: 80, y: 180 }, { x: 110, y: 200 },
            { x: 140, y: 180 }, { x: 170, y: 200 }
        ],
        lines: [[0,1], [1,2], [2,3], [3,4]]
    }
];

function init() {
    stars = [];
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.2,
            brightness: 0.3 + Math.random() * 0.7
        });
    }
}

function toggleRotation() {
    isRotating = !isRotating;
}

function rotatePoint(x, y, cx, cy, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = x - cx;
    const dy = y - cy;
    return {
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos
    };
}

function drawStars() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    stars.forEach(star => {
        const rotated = rotatePoint(star.x, star.y, cx, cy, rotation);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(rotated.x, rotated.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawConstellations() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    constellations.forEach(constellation => {
        const rotatedStars = constellation.stars.map(s =>
            rotatePoint(s.x, s.y, cx, cy, rotation)
        );

        ctx.strokeStyle = 'rgba(100, 149, 237, 0.5)';
        ctx.lineWidth = 1;
        constellation.lines.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(rotatedStars[line[0]].x, rotatedStars[line[0]].y);
            ctx.lineTo(rotatedStars[line[1]].x, rotatedStars[line[1]].y);
            ctx.stroke();
        });

        rotatedStars.forEach(star => {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(star.x, star.y, 6, 0, Math.PI * 2);
            ctx.fill();
        });
    });
}

function drawPolarStar() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px Arial';
    ctx.fillText('北極星', cx + 15, cy + 3);
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(isRotating ? '旋轉中...' : '點擊旋轉', 20, 28);
}

function animate() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawConstellations();
    drawPolarStar();
    drawInfo();

    if (isRotating) {
        rotation += 0.002;
    }

    requestAnimationFrame(animate);
}

document.getElementById('rotateBtn').addEventListener('click', toggleRotation);

init();
animate();
