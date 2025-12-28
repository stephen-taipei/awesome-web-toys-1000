const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');
const meanSlider = document.getElementById('mean');
const stdSlider = document.getElementById('std');

const chartLeft = 40;
const chartRight = canvas.width - 20;
const chartTop = 40;
const chartBottom = canvas.height - 40;

function normalPDF(x, mean, std) {
    const exp = -((x - mean) ** 2) / (2 * std ** 2);
    return Math.exp(exp) / (std * Math.sqrt(2 * Math.PI));
}

function draw() {
    const mean = parseFloat(meanSlider.value);
    const std = parseFloat(stdSlider.value);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`常態分布 N(${mean}, ${std}²)`, canvas.width / 2, 25);

    // Calculate curve
    const points = [];
    const minX = 0;
    const maxX = 100;
    let maxY = 0;

    for (let x = minX; x <= maxX; x += 0.5) {
        const y = normalPDF(x, mean, std);
        points.push({ x, y });
        if (y > maxY) maxY = y;
    }

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const x = chartLeft + (chartRight - chartLeft) * i / 4;
        ctx.beginPath();
        ctx.moveTo(x, chartTop);
        ctx.lineTo(x, chartBottom);
        ctx.stroke();
    }

    // X-axis
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartBottom);
    ctx.lineTo(chartRight, chartBottom);
    ctx.stroke();

    // Fill area under curve
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartBottom);
    points.forEach(p => {
        const x = chartLeft + (p.x / 100) * (chartRight - chartLeft);
        const y = chartBottom - (p.y / maxY) * (chartBottom - chartTop) * 0.9;
        ctx.lineTo(x, y);
    });
    ctx.lineTo(chartRight, chartBottom);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, chartTop, 0, chartBottom);
    gradient.addColorStop(0, 'rgba(52, 152, 219, 0.6)');
    gradient.addColorStop(1, 'rgba(52, 152, 219, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw curve
    ctx.beginPath();
    points.forEach((p, i) => {
        const x = chartLeft + (p.x / 100) * (chartRight - chartLeft);
        const y = chartBottom - (p.y / maxY) * (chartBottom - chartTop) * 0.9;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Mean line
    const meanX = chartLeft + (mean / 100) * (chartRight - chartLeft);
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(meanX, chartTop);
    ctx.lineTo(meanX, chartBottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Standard deviation markers
    [-1, 1].forEach(n => {
        const sdX = chartLeft + ((mean + n * std) / 100) * (chartRight - chartLeft);
        if (sdX > chartLeft && sdX < chartRight) {
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(sdX, chartTop + 30);
            ctx.lineTo(sdX, chartBottom);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '9px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`μ${n > 0 ? '+' : ''}${n}σ`, sdX, chartTop + 20);
        }
    });

    // X-axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    [0, 25, 50, 75, 100].forEach(v => {
        const x = chartLeft + (v / 100) * (chartRight - chartLeft);
        ctx.fillText(v, x, chartBottom + 15);
    });

    // Info
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`μ = ${mean}`, chartLeft + 5, chartTop + 15);
    ctx.fillText(`σ = ${std}`, chartLeft + 5, chartTop + 30);

    infoEl.textContent = `68%的數據落在 ${(mean - std).toFixed(0)} - ${(mean + std).toFixed(0)} 之間`;
}

meanSlider.addEventListener('input', draw);
stdSlider.addEventListener('input', draw);

draw();
