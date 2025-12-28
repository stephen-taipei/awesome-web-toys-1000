const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const axes = ['價格', '品質', '設計', '耐用', '服務'];
const products = [
    { name: '產品A', values: [80, 90, 70, 85, 75], color: '#e74c3c' },
    { name: '產品B', values: [60, 75, 95, 70, 85], color: '#3498db' },
    { name: '產品C', values: [90, 65, 80, 90, 60], color: '#2ecc71' },
    { name: '產品D', values: [70, 85, 75, 75, 90], color: '#f39c12' },
    { name: '產品E', values: [85, 70, 85, 65, 80], color: '#9b59b6' }
];

const chartLeft = 40;
const chartRight = canvas.width - 40;
const chartTop = 60;
const chartBottom = canvas.height - 50;
const axisSpacing = (chartRight - chartLeft) / (axes.length - 1);

let hoverProduct = null;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('產品多維度比較', canvas.width / 2, 25);

    // Draw axes
    axes.forEach((axis, i) => {
        const x = chartLeft + i * axisSpacing;

        // Axis line
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, chartTop);
        ctx.lineTo(x, chartBottom);
        ctx.stroke();

        // Axis label
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(axis, x, chartTop - 10);

        // Scale labels
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '9px Arial';
        ctx.fillText('100', x, chartTop + 10);
        ctx.fillText('0', x, chartBottom - 5);
    });

    // Draw product lines
    products.forEach((product, pi) => {
        const isHover = hoverProduct === pi;

        ctx.beginPath();
        product.values.forEach((value, i) => {
            const x = chartLeft + i * axisSpacing;
            const y = chartBottom - (value / 100) * (chartBottom - chartTop);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.strokeStyle = isHover ? product.color : `${product.color}88`;
        ctx.lineWidth = isHover ? 4 : 2;
        ctx.stroke();

        // Draw points
        product.values.forEach((value, i) => {
            const x = chartLeft + i * axisSpacing;
            const y = chartBottom - (value / 100) * (chartBottom - chartTop);

            ctx.beginPath();
            ctx.arc(x, y, isHover ? 6 : 4, 0, Math.PI * 2);
            ctx.fillStyle = product.color;
            ctx.fill();

            if (isHover) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
    });

    // Legend
    ctx.textAlign = 'left';
    products.forEach((product, i) => {
        const x = 30 + (i % 3) * 110;
        const y = canvas.height - (i < 3 ? 30 : 15);

        ctx.fillStyle = product.color;
        ctx.fillRect(x, y - 8, 12, 12);
        ctx.fillStyle = hoverProduct === i ? '#fff' : 'rgba(255,255,255,0.7)';
        ctx.font = '10px Arial';
        ctx.fillText(product.name, x + 16, y + 2);
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoverProduct = null;

    // Check proximity to each product line
    products.forEach((product, pi) => {
        for (let i = 0; i < product.values.length; i++) {
            const px = chartLeft + i * axisSpacing;
            const py = chartBottom - (product.values[i] / 100) * (chartBottom - chartTop);

            if (Math.abs(x - px) < 15 && Math.abs(y - py) < 15) {
                hoverProduct = pi;
                break;
            }
        }
    });

    canvas.style.cursor = hoverProduct !== null ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverProduct !== null) {
        const product = products[hoverProduct];
        const avg = (product.values.reduce((a, b) => a + b, 0) / product.values.length).toFixed(1);
        infoEl.textContent = `${product.name}: 平均分數 ${avg}`;
    }
});

draw();
