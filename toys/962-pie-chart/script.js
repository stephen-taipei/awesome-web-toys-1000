const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const categories = [
    { name: '產品A', color: '#EC407A' },
    { name: '產品B', color: '#AB47BC' },
    { name: '產品C', color: '#7E57C2' },
    { name: '產品D', color: '#5C6BC0' },
    { name: '產品E', color: '#42A5F5' }
];

let data = [];
let targetData = [];
let hoveredSlice = -1;
let animProgress = 0;

function randomize() {
    targetData = categories.map(() => Math.random() * 50 + 10);
    animProgress = 0;
}

function init() {
    data = categories.map(() => 20);
    randomize();
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function update() {
    data = data.map((v, i) => lerp(v, targetData[i], 0.1));
    animProgress = Math.min(1, animProgress + 0.02);
}

function draw() {
    ctx.fillStyle = '#150a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = 150;
    const cy = canvas.height / 2;
    const radius = 90;
    const total = data.reduce((a, b) => a + b, 0);

    let startAngle = -Math.PI / 2;

    data.forEach((value, i) => {
        const sliceAngle = (value / total) * Math.PI * 2 * animProgress;
        const endAngle = startAngle + sliceAngle;
        const midAngle = startAngle + sliceAngle / 2;

        const isHovered = hoveredSlice === i;
        const offset = isHovered ? 10 : 0;
        const ox = Math.cos(midAngle) * offset;
        const oy = Math.sin(midAngle) * offset;

        ctx.fillStyle = categories[i].color;
        ctx.beginPath();
        ctx.moveTo(cx + ox, cy + oy);
        ctx.arc(cx + ox, cy + oy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();

        if (isHovered) {
            ctx.shadowColor = categories[i].color;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        if (sliceAngle > 0.2) {
            const labelRadius = radius * 0.65;
            const lx = cx + ox + Math.cos(midAngle) * labelRadius;
            const ly = cy + oy + Math.sin(midAngle) * labelRadius;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(Math.round(value / total * 100) + '%', lx, ly);
        }

        startAngle = endAngle;
    });

    const legendX = 280;
    const legendY = 50;

    categories.forEach((cat, i) => {
        const y = legendY + i * 25;
        const isHovered = hoveredSlice === i;

        ctx.fillStyle = cat.color;
        ctx.fillRect(legendX, y, 15, 15);

        ctx.fillStyle = isHovered ? '#fff' : 'rgba(255, 255, 255, 0.7)';
        ctx.font = isHovered ? 'bold 11px Arial' : '11px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(cat.name, legendX + 22, y + 8);
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    const cx = 150;
    const cy = canvas.height / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    hoveredSlice = -1;

    if (dist <= 90) {
        let angle = Math.atan2(dy, dx);
        if (angle < -Math.PI / 2) angle += Math.PI * 2;

        const total = data.reduce((a, b) => a + b, 0);
        let startAngle = -Math.PI / 2;

        data.forEach((value, i) => {
            const sliceAngle = (value / total) * Math.PI * 2;
            const endAngle = startAngle + sliceAngle;

            if (angle >= startAngle && angle < endAngle) {
                hoveredSlice = i;
            }
            startAngle = endAngle;
        });
    }
});

document.getElementById('randomBtn').addEventListener('click', randomize);

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

init();
animate();
