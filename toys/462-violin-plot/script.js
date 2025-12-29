const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const groups = [
    { name: '男性', data: generateData(60, 15, 100), color: '#3498db' },
    { name: '女性', data: generateData(55, 12, 100), color: '#e74c3c' },
    { name: '總體', data: generateData(58, 14, 100), color: '#2ecc71' }
];

function generateData(mean, std, n) {
    const data = [];
    for (let i = 0; i < n; i++) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        data.push(mean + z * std);
    }
    return data;
}

const chartLeft = 60;
const chartRight = canvas.width - 30;
const chartTop = 50;
const chartBottom = canvas.height - 50;
const maxWidth = 40;

let hoverViolin = null;

function kernelDensity(data, bandwidth = 5) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const points = [];

    for (let x = min - 10; x <= max + 10; x += 1) {
        let density = 0;
        data.forEach(d => {
            const u = (x - d) / bandwidth;
            density += Math.exp(-0.5 * u * u) / (bandwidth * Math.sqrt(2 * Math.PI));
        });
        density /= data.length;
        points.push({ x, density });
    }

    const maxDensity = Math.max(...points.map(p => p.density));
    points.forEach(p => p.density /= maxDensity);

    return points;
}

function valueToY(value) {
    return chartBottom - ((value - 10) / 100) * (chartBottom - chartTop);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('身高分布比較', canvas.width / 2, 25);

    // Y-axis
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    for (let v = 20; v <= 100; v += 20) {
        const y = valueToY(v);
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(v, chartLeft - 8, y + 4);
    }

    const spacing = (chartRight - chartLeft) / groups.length;

    groups.forEach((group, i) => {
        const density = kernelDensity(group.data);
        const x = chartLeft + spacing * i + spacing / 2;
        const isHover = hoverViolin === i;

        // Draw violin shape
        ctx.beginPath();
        density.forEach((p, j) => {
            const y = valueToY(p.x);
            const width = p.density * maxWidth;
            if (j === 0) ctx.moveTo(x - width, y);
            else ctx.lineTo(x - width, y);
        });
        [...density].reverse().forEach(p => {
            const y = valueToY(p.x);
            const width = p.density * maxWidth;
            ctx.lineTo(x + width, y);
        });
        ctx.closePath();

        ctx.fillStyle = isHover ? group.color : `${group.color}88`;
        ctx.fill();
        ctx.strokeStyle = group.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner box plot
        const sorted = [...group.data].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x - 5, valueToY(q3), 10, valueToY(q1) - valueToY(q3));

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, valueToY(median), 4, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(group.name, x, chartBottom + 20);
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const spacing = (chartRight - chartLeft) / groups.length;
    hoverViolin = null;

    groups.forEach((group, i) => {
        const violinX = chartLeft + spacing * i + spacing / 2;
        if (Math.abs(x - violinX) < maxWidth + 10) {
            hoverViolin = i;
        }
    });

    canvas.style.cursor = hoverViolin !== null ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverViolin !== null) {
        const group = groups[hoverViolin];
        const mean = (group.data.reduce((a, b) => a + b, 0) / group.data.length).toFixed(1);
        const sorted = [...group.data].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)].toFixed(1);
        infoEl.textContent = `${group.name}: 平均=${mean}, 中位數=${median}`;
    }
});

draw();
