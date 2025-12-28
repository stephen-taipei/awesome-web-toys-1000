const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const tooltipEl = document.getElementById('tooltip');
const infoEl = document.getElementById('info');

const dataPoints = [];
const months = ['一月', '二月', '三月', '四月', '五月', '六月'];

months.forEach((month, i) => {
    dataPoints.push({
        month,
        sales: Math.floor(Math.random() * 500) + 200,
        orders: Math.floor(Math.random() * 100) + 30,
        customers: Math.floor(Math.random() * 50) + 20,
        growth: (Math.random() * 40 - 10).toFixed(1)
    });
});

const chartLeft = 50;
const chartRight = canvas.width - 30;
const chartTop = 50;
const chartBottom = canvas.height - 40;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('銷售趨勢', canvas.width / 2, 25);

    const maxSales = Math.max(...dataPoints.map(d => d.sales));

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = chartTop + (chartBottom - chartTop) * i / 4;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();
    }

    // Area
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartBottom);
    dataPoints.forEach((d, i) => {
        const x = chartLeft + (i / (dataPoints.length - 1)) * (chartRight - chartLeft);
        const y = chartBottom - (d.sales / maxSales) * (chartBottom - chartTop) * 0.9;
        ctx.lineTo(x, y);
        d.screenX = x;
        d.screenY = y;
    });
    ctx.lineTo(chartRight, chartBottom);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();

    // Line
    ctx.beginPath();
    dataPoints.forEach((d, i) => {
        if (i === 0) ctx.moveTo(d.screenX, d.screenY);
        else ctx.lineTo(d.screenX, d.screenY);
    });
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Points
    dataPoints.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.screenX, d.screenY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(d.screenX, d.screenY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#4568dc';
        ctx.fill();
    });

    // X-axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    dataPoints.forEach(d => {
        ctx.fillText(d.month, d.screenX, chartBottom + 15);
    });
}

function showTooltip(data, x, y) {
    const growth = parseFloat(data.growth);
    const growthColor = growth >= 0 ? '#2ecc71' : '#e74c3c';

    tooltipEl.innerHTML = `
        <div class="tooltip-title">${data.month} 報告</div>
        <div class="tooltip-row">
            <span class="tooltip-label">銷售額</span>
            <span class="tooltip-value">$${data.sales}</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">訂單數</span>
            <span class="tooltip-value">${data.orders}</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">客戶數</span>
            <span class="tooltip-value">${data.customers}</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">成長率</span>
            <span class="tooltip-value" style="color:${growthColor}">${growth >= 0 ? '+' : ''}${data.growth}%</span>
        </div>
        <div class="tooltip-bar">
            <div class="tooltip-bar-fill" style="width:${data.sales / 7}%;background:${growthColor}"></div>
        </div>
    `;

    const rect = canvas.getBoundingClientRect();
    tooltipEl.style.left = (rect.left + x + 15) + 'px';
    tooltipEl.style.top = (rect.top + y - 80) + 'px';
    tooltipEl.style.opacity = 1;
}

function hideTooltip() {
    tooltipEl.style.opacity = 0;
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found = false;
    for (const d of dataPoints) {
        const dist = Math.sqrt((x - d.screenX) ** 2 + (y - d.screenY) ** 2);
        if (dist < 15) {
            showTooltip(d, d.screenX, d.screenY);
            found = true;
            break;
        }
    }

    if (!found) hideTooltip();
});

canvas.addEventListener('mouseleave', hideTooltip);

draw();
