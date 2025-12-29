const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const data = [
    { label: '對照組', mean: 45, error: 5 },
    { label: '低劑量', mean: 52, error: 6 },
    { label: '中劑量', mean: 68, error: 4 },
    { label: '高劑量', mean: 75, error: 8 }
];

const chartLeft = 70;
const chartRight = canvas.width - 30;
const chartTop = 50;
const chartBottom = canvas.height - 50;

let hoverPoint = null;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('實驗結果 (95% CI)', canvas.width / 2, 25);

    // Y-axis grid
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let v = 0; v <= 100; v += 20) {
        const y = chartBottom - (v / 100) * (chartBottom - chartTop);
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(v, chartLeft - 8, y + 4);
    }

    const spacing = (chartRight - chartLeft) / data.length;

    // Draw points with error bars
    data.forEach((d, i) => {
        const x = chartLeft + spacing * i + spacing / 2;
        const y = chartBottom - (d.mean / 100) * (chartBottom - chartTop);
        const errorHeight = (d.error / 100) * (chartBottom - chartTop);
        const isHover = hoverPoint === i;

        // Error bar
        ctx.strokeStyle = isHover ? '#fff' : 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;

        // Vertical line
        ctx.beginPath();
        ctx.moveTo(x, y - errorHeight);
        ctx.lineTo(x, y + errorHeight);
        ctx.stroke();

        // Top cap
        ctx.beginPath();
        ctx.moveTo(x - 8, y - errorHeight);
        ctx.lineTo(x + 8, y - errorHeight);
        ctx.stroke();

        // Bottom cap
        ctx.beginPath();
        ctx.moveTo(x - 8, y + errorHeight);
        ctx.lineTo(x + 8, y + errorHeight);
        ctx.stroke();

        // Point
        ctx.beginPath();
        ctx.arc(x, y, isHover ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = isHover ? '#e74c3c' : '#3498db';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(d.label, x, chartBottom + 15);

        // Value on hover
        if (isHover) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Arial';
            ctx.fillText(`${d.mean} ± ${d.error}`, x, y - errorHeight - 10);
        }
    });

    // Connect points
    ctx.beginPath();
    data.forEach((d, i) => {
        const x = chartLeft + spacing * i + spacing / 2;
        const y = chartBottom - (d.mean / 100) * (chartBottom - chartTop);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const spacing = (chartRight - chartLeft) / data.length;
    hoverPoint = null;

    data.forEach((d, i) => {
        const pointX = chartLeft + spacing * i + spacing / 2;
        if (Math.abs(x - pointX) < 25) {
            hoverPoint = i;
        }
    });

    canvas.style.cursor = hoverPoint !== null ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverPoint !== null) {
        const d = data[hoverPoint];
        infoEl.textContent = `${d.label}: 平均 ${d.mean}, 誤差 ±${d.error} (95% CI: ${d.mean - d.error * 1.96} - ${(d.mean + d.error * 1.96).toFixed(1)})`;
    }
});

draw();
