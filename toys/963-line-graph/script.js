const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const points = 12;
let data1 = [];
let data2 = [];
let target1 = [];
let target2 = [];
let hoveredPoint = -1;
let time = 0;

function randomize() {
    target1 = Array(points).fill(0).map(() => Math.random() * 60 + 20);
    target2 = Array(points).fill(0).map(() => Math.random() * 60 + 20);
}

function init() {
    data1 = Array(points).fill(50);
    data2 = Array(points).fill(50);
    randomize();
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function update() {
    data1 = data1.map((v, i) => lerp(v, target1[i], 0.1));
    data2 = data2.map((v, i) => lerp(v, target2[i], 0.1));
}

function draw() {
    ctx.fillStyle = '#0a150a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = { left: 45, right: 20, top: 40, bottom: 40 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    ctx.strokeStyle = 'rgba(102, 187, 106, 0.2)';
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
        ctx.fillText(Math.round(100 - i * 20), padding.left - 8, y + 4);
    }

    const drawLine = (data, color, label) => {
        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top + chartHeight);

        data.forEach((v, i) => {
            const x = padding.left + (i / (points - 1)) * chartWidth;
            const y = padding.top + chartHeight - (v / 100) * chartHeight;
            ctx.lineTo(x, y);
        });

        ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((v, i) => {
            const x = padding.left + (i / (points - 1)) * chartWidth;
            const y = padding.top + chartHeight - (v / 100) * chartHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();

        data.forEach((v, i) => {
            const x = padding.left + (i / (points - 1)) * chartWidth;
            const y = padding.top + chartHeight - (v / 100) * chartHeight;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, hoveredPoint === i ? 6 : 4, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    drawLine(data1, '#66BB6A', '系列A');
    drawLine(data2, '#29B6F6', '系列B');

    ctx.fillStyle = '#66BB6A';
    ctx.fillRect(canvas.width - 100, 15, 10, 10);
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('系列A', canvas.width - 85, 24);

    ctx.fillStyle = '#29B6F6';
    ctx.fillRect(canvas.width - 100, 30, 10, 10);
    ctx.fillText('系列B', canvas.width - 85, 39);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);

    const padding = { left: 45, right: 20 };
    const chartWidth = canvas.width - padding.left - padding.right;

    hoveredPoint = -1;
    for (let i = 0; i < points; i++) {
        const x = padding.left + (i / (points - 1)) * chartWidth;
        if (Math.abs(mx - x) < 15) {
            hoveredPoint = i;
            break;
        }
    }
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
