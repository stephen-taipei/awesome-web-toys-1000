const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');
const speedSlider = document.getElementById('speed');
const speedLabel = document.getElementById('speedLabel');

// Historical data: 12 months of multiple metrics
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const data = {
    sales: [120, 150, 180, 220, 200, 250, 280, 260, 300, 350, 380, 420],
    users: [50, 65, 80, 95, 110, 130, 145, 160, 180, 200, 220, 250],
    revenue: [80, 100, 130, 160, 150, 190, 220, 200, 240, 280, 310, 350]
};

let currentMonth = 0;
let playing = false;
let speed = 5;

function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const chartLeft = 50;
    const chartRight = canvas.width - 30;
    const chartTop = 50;
    const chartBottom = canvas.height - 50;
    const chartWidth = chartRight - chartLeft;
    const chartHeight = chartBottom - chartTop;

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`2024年 業績回顧 - ${months[currentMonth]}`, canvas.width / 2, 25);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = chartTop + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();
    }

    // Y-axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    const maxVal = 450;
    for (let i = 0; i <= 4; i++) {
        ctx.fillText(Math.round(maxVal - i * (maxVal / 4)), chartLeft - 8, chartTop + (chartHeight / 4) * i + 4);
    }

    // Draw lines up to current month
    const metrics = [
        { key: 'sales', name: '銷售額', color: '#e74c3c' },
        { key: 'users', name: '用戶數', color: '#3498db' },
        { key: 'revenue', name: '收入', color: '#2ecc71' }
    ];

    metrics.forEach(metric => {
        ctx.beginPath();
        for (let i = 0; i <= currentMonth; i++) {
            const x = chartLeft + (i / 11) * chartWidth;
            const y = chartBottom - (data[metric.key][i] / maxVal) * chartHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = metric.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Current point
        const cx = chartLeft + (currentMonth / 11) * chartWidth;
        const cy = chartBottom - (data[metric.key][currentMonth] / maxVal) * chartHeight;
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = metric.color;
        ctx.fill();

        // Value label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(data[metric.key][currentMonth], cx + 8, cy + 4);
    });

    // X-axis labels (only shown months)
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i <= currentMonth; i++) {
        const x = chartLeft + (i / 11) * chartWidth;
        ctx.fillText(months[i], x, chartBottom + 15);
    }

    // Legend
    ctx.textAlign = 'left';
    metrics.forEach((metric, i) => {
        ctx.fillStyle = metric.color;
        ctx.fillRect(chartLeft + i * 100, canvas.height - 25, 12, 12);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '10px Arial';
        ctx.fillText(metric.name, chartLeft + i * 100 + 16, canvas.height - 15);
    });

    // Progress bar
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(chartLeft, chartTop - 15, chartWidth, 6);
    ctx.fillStyle = '#fff';
    ctx.fillRect(chartLeft, chartTop - 15, chartWidth * ((currentMonth + 1) / 12), 6);
}

function update() {
    if (playing) {
        currentMonth++;
        if (currentMonth >= 12) {
            currentMonth = 11;
            playing = false;
            infoEl.textContent = '播放完成';
            document.getElementById('play').textContent = '▶️ 重播';
        } else {
            infoEl.textContent = `正在播放: ${months[currentMonth]}`;
        }
    }
    draw();
}

let intervalId = null;

function startPlayback() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(update, 1000 / speed);
}

document.getElementById('play').addEventListener('click', function() {
    if (currentMonth >= 11) currentMonth = 0;
    playing = !playing;
    this.textContent = playing ? '⏸️ 暫停' : '▶️ 播放';
    if (playing) startPlayback();
    else if (intervalId) clearInterval(intervalId);
});

speedSlider.addEventListener('input', () => {
    speed = parseInt(speedSlider.value);
    speedLabel.textContent = `速度: ${speed}x`;
    if (playing) startPlayback();
});

draw();
