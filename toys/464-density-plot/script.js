const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

function generateNormalData(mean, std, n) {
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

const datasets = [
    { name: '樣本 A', data: generateNormalData(40, 10, 200), color: '#e74c3c' },
    { name: '樣本 B', data: generateNormalData(60, 8, 200), color: '#3498db' },
    { name: '樣本 C', data: generateNormalData(50, 15, 200), color: '#2ecc71' }
];

const chartLeft = 50;
const chartRight = canvas.width - 30;
const chartTop = 50;
const chartBottom = canvas.height - 50;

function kernelDensity(data, bandwidth = 3) {
    const min = 0;
    const max = 100;
    const points = [];

    for (let x = min; x <= max; x += 0.5) {
        let density = 0;
        data.forEach(d => {
            const u = (x - d) / bandwidth;
            density += Math.exp(-0.5 * u * u) / (bandwidth * Math.sqrt(2 * Math.PI));
        });
        density /= data.length;
        points.push({ x, density });
    }

    return points;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('核密度估計比較', canvas.width / 2, 25);

    // Calculate all densities
    const allDensities = datasets.map(ds => kernelDensity(ds.data));
    const maxDensity = Math.max(...allDensities.flat().map(p => p.density));

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = chartTop + (chartBottom - chartTop) * i / 4;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();
    }

    // X-axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    [0, 25, 50, 75, 100].forEach(v => {
        const x = chartLeft + (v / 100) * (chartRight - chartLeft);
        ctx.fillText(v, x, chartBottom + 15);
    });

    // Draw density curves
    datasets.forEach((dataset, di) => {
        const density = allDensities[di];

        // Area fill
        ctx.beginPath();
        ctx.moveTo(chartLeft, chartBottom);
        density.forEach(p => {
            const x = chartLeft + (p.x / 100) * (chartRight - chartLeft);
            const y = chartBottom - (p.density / maxDensity) * (chartBottom - chartTop);
            ctx.lineTo(x, y);
        });
        ctx.lineTo(chartRight, chartBottom);
        ctx.closePath();
        ctx.fillStyle = `${dataset.color}33`;
        ctx.fill();

        // Line
        ctx.beginPath();
        density.forEach((p, i) => {
            const x = chartLeft + (p.x / 100) * (chartRight - chartLeft);
            const y = chartBottom - (p.density / maxDensity) * (chartBottom - chartTop);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = dataset.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Legend
    ctx.textAlign = 'left';
    datasets.forEach((dataset, i) => {
        const x = 60 + i * 100;
        ctx.fillStyle = dataset.color;
        ctx.fillRect(x, canvas.height - 25, 15, 10);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '10px Arial';
        ctx.fillText(dataset.name, x + 20, canvas.height - 16);
    });
}

draw();

canvas.addEventListener('click', () => {
    datasets.forEach(ds => {
        const mean = ds.data.reduce((a, b) => a + b, 0) / ds.data.length;
        const variance = ds.data.reduce((a, b) => a + (b - mean) ** 2, 0) / ds.data.length;
        const std = Math.sqrt(variance);
        console.log(`${ds.name}: 平均=${mean.toFixed(1)}, 標準差=${std.toFixed(1)}`);
    });
    infoEl.textContent = '三組樣本的密度分布比較';
});
