const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let points = [];
let targetPoints = [];
let hoveredPoint = -1;

function randomize() {
    targetPoints = Array(30).fill(0).map(() => ({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        size: Math.random() * 10 + 5,
        category: Math.floor(Math.random() * 3)
    }));
}

function init() {
    points = Array(30).fill(0).map(() => ({
        x: 50, y: 50, size: 8, category: 0
    }));
    randomize();
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function update() {
    points = points.map((p, i) => ({
        x: lerp(p.x, targetPoints[i].x, 0.1),
        y: lerp(p.y, targetPoints[i].y, 0.1),
        size: lerp(p.size, targetPoints[i].size, 0.1),
        category: targetPoints[i].category
    }));
}

function draw() {
    ctx.fillStyle = '#15150a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = { left: 45, right: 20, top: 30, bottom: 40 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    ctx.strokeStyle = 'rgba(255, 167, 38, 0.2)';
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

    const colors = ['#FFA726', '#66BB6A', '#42A5F5'];

    points.forEach((p, i) => {
        const x = padding.left + (p.x / 100) * chartWidth;
        const y = padding.top + chartHeight - (p.y / 100) * chartHeight;
        const isHovered = hoveredPoint === i;

        ctx.fillStyle = colors[p.category];
        ctx.globalAlpha = isHovered ? 1 : 0.7;
        ctx.beginPath();
        ctx.arc(x, y, isHovered ? p.size + 3 : p.size, 0, Math.PI * 2);
        ctx.fill();

        if (isHovered) {
            ctx.shadowColor = colors[p.category];
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`(${Math.round(p.x)}, ${Math.round(p.y)})`, x, y - p.size - 8);
        }

        ctx.globalAlpha = 1;
    });

    colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(canvas.width - 60 + i * 25, 20, 6, 0, Math.PI * 2);
        ctx.fill();
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    const padding = { left: 45, right: 20, top: 30, bottom: 40 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    hoveredPoint = -1;
    points.forEach((p, i) => {
        const x = padding.left + (p.x / 100) * chartWidth;
        const y = padding.top + chartHeight - (p.y / 100) * chartHeight;
        const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);

        if (dist < p.size + 5) {
            hoveredPoint = i;
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
