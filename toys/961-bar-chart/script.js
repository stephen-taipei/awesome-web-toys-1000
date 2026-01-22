const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const labels = ['一月', '二月', '三月', '四月', '五月', '六月'];
let data = [];
let targetData = [];
let hoveredBar = -1;
let time = 0;

function randomize() {
    targetData = labels.map(() => Math.random() * 80 + 20);
}

function init() {
    data = labels.map(() => 0);
    randomize();
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function update() {
    data = data.map((v, i) => lerp(v, targetData[i], 0.1));
}

function draw() {
    ctx.fillStyle = '#0a1520';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = { left: 50, right: 20, top: 40, bottom: 50 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    const barWidth = chartWidth / labels.length - 10;

    ctx.strokeStyle = 'rgba(66, 165, 245, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(canvas.width - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(100 - i * 20), padding.left - 10, y + 4);
    }

    labels.forEach((label, i) => {
        const x = padding.left + i * (barWidth + 10) + 5;
        const height = (data[i] / 100) * chartHeight;
        const y = padding.top + chartHeight - height;

        const isHovered = hoveredBar === i;
        const hue = 200 + i * 20;

        const gradient = ctx.createLinearGradient(x, y, x, padding.top + chartHeight);
        gradient.addColorStop(0, `hsla(${hue}, 80%, ${isHovered ? 70 : 60}%, 1)`);
        gradient.addColorStop(1, `hsla(${hue}, 80%, ${isHovered ? 50 : 40}%, 1)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, height);

        if (isHovered) {
            ctx.shadowColor = `hsl(${hue}, 80%, 60%)`;
            ctx.shadowBlur = 15;
            ctx.fillRect(x, y, barWidth, height);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(Math.round(data[i]), x + barWidth / 2, y - 10);
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + barWidth / 2, canvas.height - padding.bottom + 20);
    });

    ctx.fillStyle = '#42A5F5';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('月度數據', canvas.width / 2, 25);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    const padding = { left: 50, right: 20, top: 40, bottom: 50 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const barWidth = chartWidth / labels.length - 10;

    hoveredBar = -1;
    labels.forEach((_, i) => {
        const x = padding.left + i * (barWidth + 10) + 5;
        if (mx >= x && mx <= x + barWidth && my >= padding.top && my <= canvas.height - padding.bottom) {
            hoveredBar = i;
        }
    });
});

canvas.addEventListener('mouseleave', () => {
    hoveredBar = -1;
});

document.getElementById('randomBtn').addEventListener('click', randomize);

function animate() {
    time++;
    update();
    draw();
    requestAnimationFrame(animate);
}

init();
animate();
