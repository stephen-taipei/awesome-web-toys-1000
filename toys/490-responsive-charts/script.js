const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const chartWrapper = document.getElementById('chartWrapper');
const infoEl = document.getElementById('info');
const sizeButtons = document.querySelectorAll('.size-controls button');

const data = [
    { label: 'A', value: 85 },
    { label: 'B', value: 65 },
    { label: 'C', value: 92 },
    { label: 'D', value: 78 },
    { label: 'E', value: 88 },
    { label: 'F', value: 55 }
];

function resize() {
    const rect = chartWrapper.getBoundingClientRect();
    const width = rect.width - 30;
    const height = Math.min(width * 0.6, 200);

    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(2, 2);

    draw(width, height);
}

function draw(width, height) {
    ctx.clearRect(0, 0, width, height);

    const chartLeft = width < 200 ? 30 : 50;
    const chartRight = width - 15;
    const chartTop = 25;
    const chartBottom = height - 25;

    // Adaptive title size
    const titleSize = width < 200 ? 10 : width < 280 ? 12 : 14;
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${titleSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('銷售數據', width / 2, 15);

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = (chartRight - chartLeft) / data.length - (width < 200 ? 4 : 8);
    const gap = width < 200 ? 4 : 8;

    // Adaptive elements based on size
    const showLabels = width >= 150;
    const showValues = width >= 120;
    const fontSize = width < 200 ? 8 : 10;

    // Draw bars
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    data.forEach((d, i) => {
        const x = chartLeft + i * (barWidth + gap);
        const barHeight = (d.value / maxValue) * (chartBottom - chartTop);
        const y = chartBottom - barHeight;

        // Bar
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x, y, barWidth, barHeight);

        // Value on top
        if (showValues) {
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(d.value, x + barWidth / 2, y - 3);
        }

        // Label
        if (showLabels) {
            ctx.font = `${fontSize}px Arial`;
            ctx.fillText(d.label, x + barWidth / 2, chartBottom + 12);
        }
    });

    infoEl.textContent = `圖表尺寸: ${Math.round(width)} x ${Math.round(height)}`;
}

sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        sizeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        chartWrapper.className = 'chart-wrapper ' + btn.dataset.size;
        setTimeout(resize, 50);
    });
});

window.addEventListener('resize', resize);
resize();
