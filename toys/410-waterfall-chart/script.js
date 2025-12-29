const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const PADDING = 50;

const labels = ['起始', '銷售', '成本', '行銷', '稅金', '結餘'];

let values = [100, 50, -30, -15, -10, 0]; // Last one will be calculated

function generateData() {
    const start = Math.floor(Math.random() * 50 + 80);
    const sales = Math.floor(Math.random() * 40 + 30);
    const cost = -Math.floor(Math.random() * 30 + 10);
    const marketing = -Math.floor(Math.random() * 20 + 5);
    const tax = -Math.floor(Math.random() * 15 + 5);
    const total = start + sales + cost + marketing + tax;
    values = [start, sales, cost, marketing, tax, total];
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const chartWidth = canvas.width - PADDING * 2;
    const chartHeight = canvas.height - PADDING * 2;
    const barWidth = chartWidth / labels.length - 15;

    // Calculate running totals
    let runningTotal = 0;
    const bars = values.map((val, i) => {
        if (i === 0 || i === labels.length - 1) {
            // Start or total
            const bar = { start: 0, end: val, value: val, isTotal: true };
            runningTotal = val;
            return bar;
        } else {
            const bar = { start: runningTotal, end: runningTotal + val, value: val, isTotal: false };
            runningTotal += val;
            return bar;
        }
    });

    // Find max and min for scaling
    let maxVal = 0;
    let minVal = 0;
    bars.forEach(bar => {
        maxVal = Math.max(maxVal, bar.start, bar.end);
        minVal = Math.min(minVal, bar.start, bar.end);
    });

    const range = maxVal - minVal;
    const scale = chartHeight / (range * 1.2);
    const baseline = canvas.height - PADDING + minVal * scale;

    // Draw baseline
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING, baseline);
    ctx.lineTo(canvas.width - PADDING, baseline);
    ctx.stroke();

    // Draw bars
    bars.forEach((bar, i) => {
        const x = PADDING + (chartWidth / labels.length) * i + 7;
        const startY = baseline - bar.start * scale;
        const endY = baseline - bar.end * scale;
        const height = Math.abs(endY - startY);
        const y = Math.min(startY, endY);

        // Color based on type
        if (bar.isTotal) {
            ctx.fillStyle = '#3498db';
        } else if (bar.value >= 0) {
            ctx.fillStyle = '#2ecc71';
        } else {
            ctx.fillStyle = '#e74c3c';
        }

        ctx.fillRect(x, y, barWidth, height);

        // Connector line
        if (i < bars.length - 1 && !bars[i + 1].isTotal) {
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x + barWidth, endY);
            ctx.lineTo(x + barWidth + 15, endY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + barWidth / 2, canvas.height - 20);

        // Value
        ctx.font = 'bold 11px Arial';
        const valY = bar.value >= 0 ? y - 5 : y + height + 12;
        const sign = bar.value > 0 && !bar.isTotal ? '+' : '';
        ctx.fillText(sign + bar.value, x + barWidth / 2, valY);
    });
}

document.getElementById('randomize').addEventListener('click', () => {
    generateData();
    draw();
});

generateData();
draw();
