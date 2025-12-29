const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

let data = [];

function generateData() {
    data = [];
    for (let i = 0; i < 7; i++) {
        data.push({
            label: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'][i],
            value: Math.floor(Math.random() * 80) + 20
        });
    }
}

function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const chartLeft = 50;
    const chartRight = canvas.width - 30;
    const chartTop = 50;
    const chartBottom = canvas.height - 40;

    // Title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('每週銷售報告', canvas.width / 2, 30);

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = (chartRight - chartLeft) / data.length - 10;

    // Grid
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = chartTop + (chartBottom - chartTop) * i / 4;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();

        ctx.fillStyle = '#999';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        const val = Math.round(maxValue - (maxValue * i / 4));
        ctx.fillText(val, chartLeft - 8, y + 4);
    }

    // Bars
    const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c'];
    data.forEach((d, i) => {
        const x = chartLeft + i * (barWidth + 10) + 5;
        const barHeight = (d.value / maxValue) * (chartBottom - chartTop);
        const y = chartBottom - barHeight;

        // Bar with gradient
        const gradient = ctx.createLinearGradient(x, y, x, chartBottom);
        gradient.addColorStop(0, colors[i]);
        gradient.addColorStop(1, colors[i] + '88');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Value on top
        ctx.fillStyle = '#333';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(d.value, x + barWidth / 2, y - 5);

        // Label
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.fillText(d.label, x + barWidth / 2, chartBottom + 15);
    });

    // Watermark
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Web Toy #488', canvas.width - 10, canvas.height - 10);
}

function exportChart(format) {
    const link = document.createElement('a');
    link.download = `chart.${format}`;

    if (format === 'png') {
        link.href = canvas.toDataURL('image/png');
    } else {
        link.href = canvas.toDataURL('image/jpeg', 0.9);
    }

    link.click();
    infoEl.textContent = `已匯出 ${format.toUpperCase()} 圖片`;
}

document.getElementById('exportPng').addEventListener('click', () => exportChart('png'));
document.getElementById('exportJpg').addEventListener('click', () => exportChart('jpg'));
document.getElementById('regenerate').addEventListener('click', () => {
    generateData();
    draw();
    infoEl.textContent = '已重新生成圖表';
});

generateData();
draw();
