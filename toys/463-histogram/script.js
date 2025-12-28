const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

// Generate normal distribution data
const data = [];
for (let i = 0; i < 500; i++) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    data.push(50 + z * 15);
}

let numBins = 10;
let hoverBin = null;

const chartLeft = 50;
const chartRight = canvas.width - 30;
const chartTop = 50;
const chartBottom = canvas.height - 50;

function calculateHistogram() {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / numBins;
    const bins = [];

    for (let i = 0; i < numBins; i++) {
        const binStart = min + i * binWidth;
        const binEnd = binStart + binWidth;
        const count = data.filter(d => d >= binStart && d < binEnd).length;
        bins.push({ start: binStart, end: binEnd, count });
    }

    return { bins, min, max, binWidth };
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('數據分布直方圖', canvas.width / 2, 25);

    const { bins, min, max } = calculateHistogram();
    const maxCount = Math.max(...bins.map(b => b.count));
    const barWidth = (chartRight - chartLeft) / numBins;

    // Y-axis grid
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = chartTop + (chartBottom - chartTop) * i / 4;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxCount * (4 - i) / 4), chartLeft - 8, y + 4);
    }

    // Draw bars
    bins.forEach((bin, i) => {
        const x = chartLeft + i * barWidth;
        const barHeight = (bin.count / maxCount) * (chartBottom - chartTop);
        const y = chartBottom - barHeight;
        const isHover = hoverBin === i;

        ctx.fillStyle = isHover ? '#fff' : 'rgba(255,255,255,0.7)';
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);

        if (isHover) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y, barWidth - 2, barHeight);
        }
    });

    // X-axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    [0, numBins / 2, numBins].forEach(i => {
        const x = chartLeft + i * barWidth;
        const value = min + (max - min) * i / numBins;
        ctx.fillText(value.toFixed(0), x, chartBottom + 15);
    });

    // Stats
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const meanX = chartLeft + ((mean - min) / (max - min)) * (chartRight - chartLeft);
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(meanX, chartTop);
    ctx.lineTo(meanX, chartBottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#e74c3c';
    ctx.font = '10px Arial';
    ctx.fillText(`平均=${mean.toFixed(1)}`, meanX, chartTop - 5);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const barWidth = (chartRight - chartLeft) / numBins;
    const binIndex = Math.floor((x - chartLeft) / barWidth);

    if (binIndex >= 0 && binIndex < numBins) {
        hoverBin = binIndex;
    } else {
        hoverBin = null;
    }

    canvas.style.cursor = hoverBin !== null ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverBin !== null) {
        const { bins } = calculateHistogram();
        const bin = bins[hoverBin];
        infoEl.textContent = `範圍 ${bin.start.toFixed(1)} - ${bin.end.toFixed(1)}: ${bin.count} 筆`;
    }
});

document.querySelectorAll('.bin-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.bin-btn.active').classList.remove('active');
        btn.classList.add('active');
        numBins = parseInt(btn.dataset.bins);
        draw();
    });
});

draw();
