const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let colorDrops = [];
let time = 0;

const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

function init() {
    drawBackground();
}

function addColorDrop(x, y) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    colorDrops.push({
        x, y,
        color,
        radius: 5,
        maxRadius: 50 + Math.random() * 30,
        alpha: 0.8
    });
}

function updateDrops() {
    colorDrops.forEach(drop => {
        if (drop.radius < drop.maxRadius) {
            drop.radius += 2;
            drop.alpha = Math.max(0.1, 0.8 - (drop.radius / drop.maxRadius) * 0.7);
        }
    });

    if (colorDrops.length > 30) {
        colorDrops = colorDrops.slice(-25);
    }
}

function drawBackground() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawDrops() {
    ctx.globalCompositeOperation = 'screen';

    colorDrops.forEach(drop => {
        const gradient = ctx.createRadialGradient(
            drop.x, drop.y, 0,
            drop.x, drop.y, drop.radius
        );
        gradient.addColorStop(0, drop.color);
        gradient.addColorStop(0.5, drop.color + '80');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = drop.alpha;
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`顏色: ${colorDrops.length}`, 20, 28);
}

function resetColors() {
    colorDrops = [];
}

function animate() {
    time++;
    drawBackground();
    updateDrops();
    drawDrops();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    addColorDrop(x, y);
});

canvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
        if (Math.random() < 0.3) addColorDrop(x, y);
    }
});

document.getElementById('resetBtn').addEventListener('click', resetColors);

init();
animate();
