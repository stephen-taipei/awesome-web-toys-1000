const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

// Generate data with linear relationship + noise
const data = [];
for (let i = 0; i < 50; i++) {
    const x = 10 + Math.random() * 80;
    const y = 20 + 0.7 * x + (Math.random() - 0.5) * 20;
    data.push({ x, y });
}

// Calculate linear regression
const n = data.length;
const sumX = data.reduce((a, d) => a + d.x, 0);
const sumY = data.reduce((a, d) => a + d.y, 0);
const sumXY = data.reduce((a, d) => a + d.x * d.y, 0);
const sumX2 = data.reduce((a, d) => a + d.x * d.x, 0);

const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
const intercept = (sumY - slope * sumX) / n;

// Calculate residuals
data.forEach(d => {
    d.predicted = intercept + slope * d.x;
    d.residual = d.y - d.predicted;
});

const chartLeft = 60;
const chartRight = canvas.width - 30;
const chartTop = 50;
const chartBottom = canvas.height - 50;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('殘差分布圖', canvas.width / 2, 25);

    const minX = 0;
    const maxX = 100;
    const maxResidual = Math.max(...data.map(d => Math.abs(d.residual)));
    const residualRange = maxResidual * 1.2;

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

    // Zero line (horizontal)
    const zeroY = (chartTop + chartBottom) / 2;
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(chartLeft, zeroY);
    ctx.lineTo(chartRight, zeroY);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    [-residualRange, 0, residualRange].forEach(v => {
        const y = zeroY - (v / residualRange) * ((chartBottom - chartTop) / 2);
        ctx.fillText(v.toFixed(0), chartLeft - 8, y + 4);
    });

    // X-axis labels
    ctx.textAlign = 'center';
    [0, 50, 100].forEach(v => {
        const x = chartLeft + (v / maxX) * (chartRight - chartLeft);
        ctx.fillText(v, x, chartBottom + 15);
    });

    // Points
    data.forEach(d => {
        const x = chartLeft + ((d.predicted - minX) / (maxX - minX)) * (chartRight - chartLeft);
        const y = zeroY - (d.residual / residualRange) * ((chartBottom - chartTop) / 2);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = d.residual > 0 ? '#3498db' : '#2ecc71';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    // Axis titles
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('預測值', canvas.width / 2, chartBottom + 35);

    ctx.save();
    ctx.translate(18, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('殘差', 0, 0);
    ctx.restore();

    // R² value
    const ssRes = data.reduce((a, d) => a + d.residual ** 2, 0);
    const meanY = sumY / n;
    const ssTot = data.reduce((a, d) => a + (d.y - meanY) ** 2, 0);
    const r2 = 1 - ssRes / ssTot;

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`R² = ${r2.toFixed(3)}`, chartLeft + 10, chartTop + 15);
}

draw();
infoEl.textContent = '殘差隨機分布表示模型適配良好';
