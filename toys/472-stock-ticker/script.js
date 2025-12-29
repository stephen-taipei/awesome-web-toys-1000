const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const stocksEl = document.getElementById('stocks');
const infoEl = document.getElementById('info');

const stocks = [
    { symbol: 'TECH', price: 150.00, history: [] },
    { symbol: 'BANK', price: 85.50, history: [] },
    { symbol: 'AUTO', price: 220.00, history: [] }
];

const maxHistory = 60;

function initHistory() {
    stocks.forEach(stock => {
        let price = stock.price;
        for (let i = 0; i < maxHistory; i++) {
            price += (Math.random() - 0.5) * 2;
            stock.history.push(price);
        }
        stock.price = price;
    });
}

function updatePrices() {
    stocks.forEach(stock => {
        const change = (Math.random() - 0.48) * 3;
        stock.price = Math.max(1, stock.price + change);
        stock.history.push(stock.price);
        if (stock.history.length > maxHistory) {
            stock.history.shift();
        }
    });
}

function renderStocks() {
    stocksEl.innerHTML = '';
    stocks.forEach(stock => {
        const prev = stock.history[stock.history.length - 2] || stock.price;
        const change = stock.price - prev;
        const pct = (change / prev * 100).toFixed(2);
        const isUp = change >= 0;

        const div = document.createElement('div');
        div.className = 'stock';
        div.innerHTML = `
            <div class="stock-symbol">${stock.symbol}</div>
            <div class="stock-price ${isUp ? 'up' : 'down'}">$${stock.price.toFixed(2)}</div>
            <div class="stock-change ${isUp ? 'up' : 'down'}">${isUp ? '+' : ''}${pct}%</div>
        `;
        stocksEl.appendChild(div);
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('股價走勢', canvas.width / 2, 20);

    const colors = ['#00ff88', '#00d4ff', '#ff88ff'];
    const chartLeft = 40;
    const chartRight = canvas.width - 20;
    const chartTop = 35;
    const chartBottom = canvas.height - 30;

    // Find min/max across all stocks
    let allPrices = [];
    stocks.forEach(s => allPrices.push(...s.history));
    const minPrice = Math.min(...allPrices) * 0.95;
    const maxPrice = Math.max(...allPrices) * 1.05;

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = chartTop + (chartBottom - chartTop) * i / 4;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();

        const price = maxPrice - (maxPrice - minPrice) * i / 4;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '9px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(price.toFixed(0), chartLeft - 5, y + 3);
    }

    // Draw lines
    stocks.forEach((stock, idx) => {
        ctx.beginPath();
        stock.history.forEach((price, i) => {
            const x = chartLeft + (i / (maxHistory - 1)) * (chartRight - chartLeft);
            const y = chartTop + ((maxPrice - price) / (maxPrice - minPrice)) * (chartBottom - chartTop);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = colors[idx];
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Legend
    ctx.textAlign = 'left';
    stocks.forEach((stock, idx) => {
        const x = chartLeft + idx * 80;
        ctx.fillStyle = colors[idx];
        ctx.fillRect(x, canvas.height - 18, 12, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '10px Arial';
        ctx.fillText(stock.symbol, x + 16, canvas.height - 10);
    });
}

function update() {
    updatePrices();
    renderStocks();
    draw();

    const totalValue = stocks.reduce((sum, s) => sum + s.price, 0);
    infoEl.textContent = `市場總值: $${totalValue.toFixed(2)}`;
}

initHistory();
renderStocks();
draw();
setInterval(update, 1000);
