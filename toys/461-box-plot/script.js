const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const groups = [
    { name: 'A組', data: [45, 52, 58, 62, 65, 68, 70, 72, 75, 78, 82, 85, 95], color: '#3498db' },
    { name: 'B組', data: [35, 42, 48, 55, 58, 60, 62, 65, 68, 72, 78, 88], color: '#2ecc71' },
    { name: 'C組', data: [55, 60, 65, 68, 70, 72, 74, 76, 78, 80, 82, 85], color: '#e74c3c' },
    { name: 'D組', data: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100], color: '#f39c12' }
];

const chartLeft = 60;
const chartRight = canvas.width - 30;
const chartTop = 50;
const chartBottom = canvas.height - 50;
const boxWidth = 50;

let hoverBox = null;

function calculateStats(data) {
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    const min = sorted[0];
    const max = sorted[n - 1];
    const q1 = sorted[Math.floor(n * 0.25)];
    const median = sorted[Math.floor(n * 0.5)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
    const upperWhisker = Math.min(max, q3 + 1.5 * iqr);
    const outliers = sorted.filter(v => v < lowerWhisker || v > upperWhisker);

    return { min, max, q1, median, q3, lowerWhisker, upperWhisker, outliers };
}

function valueToY(value) {
    return chartBottom - ((value - 20) / 100) * (chartBottom - chartTop);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('各組成績分布', canvas.width / 2, 25);

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

    // Draw box plots
    const spacing = (chartRight - chartLeft) / groups.length;

    groups.forEach((group, i) => {
        const stats = calculateStats(group.data);
        const x = chartLeft + spacing * i + spacing / 2;
        const isHover = hoverBox === i;

        // Whiskers
        ctx.strokeStyle = isHover ? '#fff' : group.color;
        ctx.lineWidth = 2;

        // Lower whisker
        ctx.beginPath();
        ctx.moveTo(x, valueToY(stats.lowerWhisker));
        ctx.lineTo(x, valueToY(stats.q1));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 10, valueToY(stats.lowerWhisker));
        ctx.lineTo(x + 10, valueToY(stats.lowerWhisker));
        ctx.stroke();

        // Upper whisker
        ctx.beginPath();
        ctx.moveTo(x, valueToY(stats.q3));
        ctx.lineTo(x, valueToY(stats.upperWhisker));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 10, valueToY(stats.upperWhisker));
        ctx.lineTo(x + 10, valueToY(stats.upperWhisker));
        ctx.stroke();

        // Box
        const boxTop = valueToY(stats.q3);
        const boxBottom = valueToY(stats.q1);
        ctx.fillStyle = isHover ? group.color : `${group.color}88`;
        ctx.fillRect(x - boxWidth / 2, boxTop, boxWidth, boxBottom - boxTop);
        ctx.strokeStyle = group.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - boxWidth / 2, boxTop, boxWidth, boxBottom - boxTop);

        // Median
        ctx.beginPath();
        ctx.moveTo(x - boxWidth / 2, valueToY(stats.median));
        ctx.lineTo(x + boxWidth / 2, valueToY(stats.median));
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Outliers
        stats.outliers.forEach(outlier => {
            ctx.beginPath();
            ctx.arc(x, valueToY(outlier), 4, 0, Math.PI * 2);
            ctx.fillStyle = group.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

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
    hoverBox = null;

    groups.forEach((group, i) => {
        const boxX = chartLeft + spacing * i + spacing / 2;
        if (Math.abs(x - boxX) < boxWidth / 2 + 10) {
            hoverBox = i;
        }
    });

    canvas.style.cursor = hoverBox !== null ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverBox !== null) {
        const group = groups[hoverBox];
        const stats = calculateStats(group.data);
        infoEl.textContent = `${group.name}: 中位數=${stats.median}, Q1=${stats.q1}, Q3=${stats.q3}`;
    }
});

draw();
