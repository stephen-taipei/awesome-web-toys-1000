const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let bubbles = [];
let targetBubbles = [];
let hoveredBubble = -1;

const colors = ['#26C6DA', '#EF5350', '#66BB6A', '#FFA726', '#AB47BC'];

function randomize() {
    targetBubbles = Array(15).fill(0).map(() => ({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        z: Math.random() * 40 + 10,
        color: colors[Math.floor(Math.random() * colors.length)]
    }));
}

function init() {
    bubbles = Array(15).fill(0).map(() => ({
        x: 50, y: 50, z: 20, color: colors[0]
    }));
    randomize();
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function update() {
    bubbles = bubbles.map((b, i) => ({
        x: lerp(b.x, targetBubbles[i].x, 0.1),
        y: lerp(b.y, targetBubbles[i].y, 0.1),
        z: lerp(b.z, targetBubbles[i].z, 0.1),
        color: targetBubbles[i].color
    }));
}

function draw() {
    ctx.fillStyle = '#0a1515';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = { left: 45, right: 20, top: 30, bottom: 40 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    ctx.strokeStyle = 'rgba(38, 198, 218, 0.2)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(canvas.width - padding.right, y);
        ctx.stroke();

        const x = padding.left + (chartWidth / 5) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + chartHeight);
        ctx.stroke();
    }

    const sorted = [...bubbles].map((b, i) => ({ ...b, index: i }))
        .sort((a, b) => a.z - b.z);

    sorted.forEach((b) => {
        const x = padding.left + (b.x / 100) * chartWidth;
        const y = padding.top + chartHeight - (b.y / 100) * chartHeight;
        const radius = b.z;
        const isHovered = hoveredBubble === b.index;

        const gradient = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        );
        gradient.addColorStop(0, b.color + 'ff');
        gradient.addColorStop(1, b.color + '80');

        ctx.globalAlpha = isHovered ? 1 : 0.7;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, isHovered ? radius + 5 : radius, 0, Math.PI * 2);
        ctx.fill();

        if (isHovered) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`(${Math.round(b.x)}, ${Math.round(b.y)}, ${Math.round(b.z)})`, x, y - radius - 10);
        }

        ctx.globalAlpha = 1;
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    const padding = { left: 45, right: 20, top: 30, bottom: 40 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    hoveredBubble = -1;
    bubbles.forEach((b, i) => {
        const x = padding.left + (b.x / 100) * chartWidth;
        const y = padding.top + chartHeight - (b.y / 100) * chartHeight;
        const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);

        if (dist < b.z + 5) {
            hoveredBubble = i;
        }
    });
});

document.getElementById('randomBtn').addEventListener('click', randomize);

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

init();
animate();
