const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

// Generate sample data (approximately normal)
const sampleData = [];
for (let i = 0; i < 100; i++) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    sampleData.push(z);
}
sampleData.sort((a, b) => a - b);

// Theoretical quantiles (standard normal)
function normalQuantile(p) {
    // Approximation of inverse normal CDF
    const a1 = -3.969683028665376e1;
    const a2 = 2.209460984245205e2;
    const a3 = -2.759285104469687e2;
    const a4 = 1.383577518672690e2;
    const a5 = -3.066479806614716e1;
    const a6 = 2.506628277459239e0;

    const b1 = -5.447609879822406e1;
    const b2 = 1.615858368580409e2;
    const b3 = -1.556989798598866e2;
    const b4 = 6.680131188771972e1;
    const b5 = -1.328068155288572e1;

    const c1 = -7.784894002430293e-3;
    const c2 = -3.223964580411365e-1;
    const c3 = -2.400758277161838e0;
    const c4 = -2.549732539343734e0;
    const c5 = 4.374664141464968e0;
    const c6 = 2.938163982698783e0;

    const d1 = 7.784695709041462e-3;
    const d2 = 3.224671290700398e-1;
    const d3 = 2.445134137142996e0;
    const d4 = 3.754408661907416e0;

    const pLow = 0.02425;
    const pHigh = 1 - pLow;

    let q;
    if (p < pLow) {
        q = Math.sqrt(-2 * Math.log(p));
        return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
               ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else if (p <= pHigh) {
        q = p - 0.5;
        const r = q * q;
        return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
               (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    } else {
        q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
                ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
}

const theoreticalQuantiles = sampleData.map((_, i) => {
    const p = (i + 0.5) / sampleData.length;
    return normalQuantile(p);
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
    ctx.fillText('常態 Q-Q 圖', canvas.width / 2, 25);

    // Axes
    const minT = Math.min(...theoreticalQuantiles);
    const maxT = Math.max(...theoreticalQuantiles);
    const minS = Math.min(...sampleData);
    const maxS = Math.max(...sampleData);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = chartTop + (chartBottom - chartTop) * i / 4;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();

        const x = chartLeft + (chartRight - chartLeft) * i / 4;
        ctx.beginPath();
        ctx.moveTo(x, chartTop);
        ctx.lineTo(x, chartBottom);
        ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    [-3, 0, 3].forEach(v => {
        const y = chartBottom - ((v - minS) / (maxS - minS)) * (chartBottom - chartTop);
        ctx.fillText(v.toFixed(0), chartLeft - 8, y + 4);
    });

    ctx.textAlign = 'center';
    [-3, 0, 3].forEach(v => {
        const x = chartLeft + ((v - minT) / (maxT - minT)) * (chartRight - chartLeft);
        ctx.fillText(v.toFixed(0), x, chartBottom + 15);
    });

    // Reference line (y = x)
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const lineMin = Math.max(minT, minS);
    const lineMax = Math.min(maxT, maxS);
    ctx.moveTo(
        chartLeft + ((lineMin - minT) / (maxT - minT)) * (chartRight - chartLeft),
        chartBottom - ((lineMin - minS) / (maxS - minS)) * (chartBottom - chartTop)
    );
    ctx.lineTo(
        chartLeft + ((lineMax - minT) / (maxT - minT)) * (chartRight - chartLeft),
        chartBottom - ((lineMax - minS) / (maxS - minS)) * (chartBottom - chartTop)
    );
    ctx.stroke();
    ctx.setLineDash([]);

    // Points
    sampleData.forEach((s, i) => {
        const t = theoreticalQuantiles[i];
        const x = chartLeft + ((t - minT) / (maxT - minT)) * (chartRight - chartLeft);
        const y = chartBottom - ((s - minS) / (maxS - minS)) * (chartBottom - chartTop);

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#3498db';
        ctx.fill();
    });

    // Axis titles
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('理論分位數', canvas.width / 2, chartBottom + 35);

    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('樣本分位數', 0, 0);
    ctx.restore();
}

draw();
infoEl.textContent = '點接近對角線表示數據近似常態分布';
