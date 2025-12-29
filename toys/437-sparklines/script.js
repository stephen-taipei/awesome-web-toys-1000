const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const stocks = [
    { name: '台積電', code: '2330', color: '#3498db' },
    { name: '鴻海', code: '2317', color: '#2ecc71' },
    { name: '聯發科', code: '2454', color: '#e74c3c' },
    { name: '台達電', code: '2308', color: '#f39c12' },
    { name: '中華電', code: '2412', color: '#9b59b6' }
];

let data = [];

function generateData() {
    data = stocks.map(() => {
        const points = [];
        let value = 100 + Math.random() * 50;
        for (let i = 0; i < 20; i++) {
            value += (Math.random() - 0.5) * 10;
            value = Math.max(50, Math.min(200, value));
            points.push(value);
        }
        return {
            points,
            current: value,
            change: ((value - points[0]) / points[0] * 100).toFixed(2)
        };
    });
}

function drawSparkline(x, y, width, height, points, color) {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    // Area fill
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    points.forEach((p, i) => {
        const px = x + (i / (points.length - 1)) * width;
        const py = y + height - ((p - min) / range) * height;
        ctx.lineTo(px, py);
    });
    ctx.lineTo(x + width, y + height);
    ctx.closePath();
    ctx.fillStyle = `${color}33`;
    ctx.fill();

    // Line
    ctx.beginPath();
    points.forEach((p, i) => {
        const px = x + (i / (points.length - 1)) * width;
        const py = y + height - ((p - min) / range) * height;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // End point
    const lastY = y + height - ((points[points.length - 1] - min) / range) * height;
    ctx.beginPath();
    ctx.arc(x + width, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('股票走勢一覽', canvas.width / 2, 25);

    const rowHeight = 50;
    const startY = 45;

    stocks.forEach((stock, i) => {
        const y = startY + i * rowHeight;
        const stockData = data[i];
        const isPositive = parseFloat(stockData.change) >= 0;

        // Stock name and code
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(stock.name, 20, y + 18);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '10px Arial';
        ctx.fillText(stock.code, 20, y + 33);

        // Sparkline
        drawSparkline(90, y + 5, 120, 35, stockData.points, stock.color);

        // Current price
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(stockData.current.toFixed(1), 280, y + 18);

        // Change
        ctx.fillStyle = isPositive ? '#2ecc71' : '#e74c3c';
        ctx.font = '11px Arial';
        ctx.fillText(`${isPositive ? '+' : ''}${stockData.change}%`, 280, y + 33);

        // Arrow
        ctx.font = '14px Arial';
        ctx.fillText(isPositive ? '▲' : '▼', 300, y + 25);

        // Divider
        if (i < stocks.length - 1) {
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(20, y + rowHeight);
            ctx.lineTo(canvas.width - 20, y + rowHeight);
            ctx.stroke();
        }
    });

    // Footer note
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('* 模擬數據，僅供展示', canvas.width / 2, canvas.height - 10);
}

document.getElementById('refresh').addEventListener('click', () => {
    generateData();
    draw();
    infoEl.textContent = '數據已刷新';
});

generateData();
draw();
