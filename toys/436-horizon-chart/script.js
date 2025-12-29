const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const bands = 3;
const metrics = ['CPU 使用率', '記憶體', '網路 I/O', '磁碟', '請求數'];
const colors = {
    positive: ['#3498db44', '#3498db88', '#3498dbcc'],
    negative: ['#e74c3c44', '#e74c3c88', '#e74c3ccc']
};

let data = [];
const pointCount = 60;
const chartLeft = 80;
const chartTop = 40;
const rowHeight = 40;

function generateData() {
    data = metrics.map(() => {
        const points = [];
        let value = 0;
        for (let i = 0; i < pointCount; i++) {
            value += (Math.random() - 0.5) * 30;
            value = Math.max(-100, Math.min(100, value));
            points.push(value);
        }
        return points;
    });
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('系統監控指標', canvas.width / 2, 25);

    const chartWidth = canvas.width - chartLeft - 20;

    metrics.forEach((metric, row) => {
        const y = chartTop + row * rowHeight;
        const points = data[row];

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(metric, chartLeft - 10, y + rowHeight / 2 + 4);

        // Background
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(chartLeft, y + 2, chartWidth, rowHeight - 4);

        // Draw horizon bands
        const bandHeight = (rowHeight - 4) / 2;
        const segmentWidth = chartWidth / pointCount;

        points.forEach((value, i) => {
            const x = chartLeft + i * segmentWidth;
            const normalizedValue = value / 100;

            // For each band
            for (let b = 0; b < bands; b++) {
                const bandThreshold = (b + 1) / bands;
                const prevThreshold = b / bands;

                if (normalizedValue > 0) {
                    // Positive values
                    if (normalizedValue > prevThreshold) {
                        const height = Math.min(normalizedValue, bandThreshold) - prevThreshold;
                        ctx.fillStyle = colors.positive[b];
                        ctx.fillRect(x, y + 2 + bandHeight - height * bandHeight * bands, segmentWidth + 0.5, height * bandHeight * bands);
                    }
                } else {
                    // Negative values
                    const absValue = Math.abs(normalizedValue);
                    if (absValue > prevThreshold) {
                        const height = Math.min(absValue, bandThreshold) - prevThreshold;
                        ctx.fillStyle = colors.negative[b];
                        ctx.fillRect(x, y + 2 + bandHeight, segmentWidth + 0.5, height * bandHeight * bands);
                    }
                }
            }
        });

        // Center line
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y + 2 + bandHeight);
        ctx.lineTo(chartLeft + chartWidth, y + 2 + bandHeight);
        ctx.stroke();
    });

    // Legend
    ctx.font = '9px Arial';
    ctx.textAlign = 'left';

    ctx.fillStyle = colors.positive[2];
    ctx.fillRect(chartLeft, canvas.height - 22, 30, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('正值', chartLeft + 35, canvas.height - 13);

    ctx.fillStyle = colors.negative[2];
    ctx.fillRect(chartLeft + 80, canvas.height - 22, 30, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('負值', chartLeft + 115, canvas.height - 13);

    ctx.fillText('顏色越深=偏離越大', chartLeft + 160, canvas.height - 13);
}

document.getElementById('regenerate').addEventListener('click', () => {
    generateData();
    draw();
    infoEl.textContent = '已重新生成數據';
});

generateData();
draw();
