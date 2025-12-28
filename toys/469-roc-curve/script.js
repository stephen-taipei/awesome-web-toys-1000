const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

// Simulated ROC curves for different models
const models = [
    { name: '模型 A', auc: 0.92, color: '#e74c3c' },
    { name: '模型 B', auc: 0.85, color: '#3498db' },
    { name: '模型 C', auc: 0.75, color: '#2ecc71' }
];

function generateROC(auc) {
    const points = [];
    // Use power function to create realistic ROC shape
    const power = Math.log(1 - auc + 0.5) / Math.log(0.5);
    for (let fpr = 0; fpr <= 1; fpr += 0.02) {
        const tpr = 1 - Math.pow(1 - fpr, 1 / power);
        points.push({ fpr, tpr: Math.min(1, tpr) });
    }
    points.push({ fpr: 1, tpr: 1 });
    return points;
}

models.forEach(m => {
    m.points = generateROC(m.auc);
});

const chartLeft = 60;
const chartRight = canvas.width - 30;
const chartTop = 50;
const chartBottom = canvas.height - 50;
const chartWidth = chartRight - chartLeft;
const chartHeight = chartBottom - chartTop;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ROC 曲線比較', canvas.width / 2, 25);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const x = chartLeft + chartWidth * i / 4;
        const y = chartTop + chartHeight * i / 4;

        ctx.beginPath();
        ctx.moveTo(x, chartTop);
        ctx.lineTo(x, chartBottom);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();
    }

    // Diagonal (random classifier)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartBottom);
    ctx.lineTo(chartRight, chartTop);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw ROC curves
    models.forEach(model => {
        ctx.beginPath();
        model.points.forEach((p, i) => {
            const x = chartLeft + p.fpr * chartWidth;
            const y = chartBottom - p.tpr * chartHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = model.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Fill area under curve
        ctx.beginPath();
        ctx.moveTo(chartLeft, chartBottom);
        model.points.forEach(p => {
            const x = chartLeft + p.fpr * chartWidth;
            const y = chartBottom - p.tpr * chartHeight;
            ctx.lineTo(x, y);
        });
        ctx.lineTo(chartRight, chartBottom);
        ctx.closePath();
        ctx.fillStyle = `${model.color}22`;
        ctx.fill();
    });

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    [0, 0.5, 1].forEach(v => {
        const x = chartLeft + v * chartWidth;
        ctx.fillText(v.toFixed(1), x, chartBottom + 15);
    });

    ctx.textAlign = 'right';
    [0, 0.5, 1].forEach(v => {
        const y = chartBottom - v * chartHeight;
        ctx.fillText(v.toFixed(1), chartLeft - 8, y + 4);
    });

    // Axis titles
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('假陽性率 (FPR)', canvas.width / 2, chartBottom + 35);

    ctx.save();
    ctx.translate(18, (chartTop + chartBottom) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('真陽性率 (TPR)', 0, 0);
    ctx.restore();

    // Legend
    ctx.textAlign = 'left';
    models.forEach((model, i) => {
        const x = chartLeft + 10 + i * 95;
        const y = chartTop + 15;
        ctx.fillStyle = model.color;
        ctx.fillRect(x, y - 8, 15, 10);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '9px Arial';
        ctx.fillText(`${model.name} (${model.auc.toFixed(2)})`, x + 20, y);
    });
}

draw();

canvas.addEventListener('click', () => {
    const best = models.reduce((a, b) => a.auc > b.auc ? a : b);
    infoEl.textContent = `最佳模型: ${best.name}, AUC = ${best.auc.toFixed(3)}`;
});
