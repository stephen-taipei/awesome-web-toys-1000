const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const metrics = {
    cpu: { value: 45, history: [], color: '#00ff88', label: 'CPU' },
    memory: { value: 62, history: [], color: '#00d4ff', label: 'Memory' },
    disk: { value: 35, history: [], color: '#ff8800', label: 'Disk I/O' }
};

const maxHistory = 50;

// Initialize history
Object.values(metrics).forEach(m => {
    for (let i = 0; i < maxHistory; i++) {
        m.history.push(m.value + (Math.random() - 0.5) * 20);
    }
});

function updateMetrics() {
    Object.values(metrics).forEach(m => {
        m.value += (Math.random() - 0.5) * 15;
        m.value = Math.max(5, Math.min(95, m.value));
        m.history.push(m.value);
        if (m.history.length > maxHistory) m.history.shift();
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const chartLeft = 50;
    const chartRight = canvas.width - 20;
    const chartTop = 40;
    const chartBottom = canvas.height - 80;

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('系統效能監控', canvas.width / 2, 25);

    // Grid
    ctx.strokeStyle = 'rgba(0,255,136,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = chartTop + (chartBottom - chartTop) * i / 4;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '9px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${100 - i * 25}%`, chartLeft - 5, y + 3);
    }

    // Draw lines and fills
    Object.values(metrics).forEach(m => {
        // Fill
        ctx.beginPath();
        ctx.moveTo(chartLeft, chartBottom);
        m.history.forEach((v, i) => {
            const x = chartLeft + (i / (maxHistory - 1)) * (chartRight - chartLeft);
            const y = chartBottom - (v / 100) * (chartBottom - chartTop);
            ctx.lineTo(x, y);
        });
        ctx.lineTo(chartRight, chartBottom);
        ctx.closePath();
        ctx.fillStyle = m.color + '22';
        ctx.fill();

        // Line
        ctx.beginPath();
        m.history.forEach((v, i) => {
            const x = chartLeft + (i / (maxHistory - 1)) * (chartRight - chartLeft);
            const y = chartBottom - (v / 100) * (chartBottom - chartTop);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Current values (gauges)
    const gaugeY = canvas.height - 40;
    const gaugeWidth = 80;
    let gaugeX = 60;

    Object.values(metrics).forEach(m => {
        // Background
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(gaugeX - 35, gaugeY - 15, gaugeWidth, 25);

        // Fill
        ctx.fillStyle = m.color + '88';
        ctx.fillRect(gaugeX - 35, gaugeY - 15, gaugeWidth * (m.value / 100), 25);

        // Border
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(gaugeX - 35, gaugeY - 15, gaugeWidth, 25);

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${m.label}: ${m.value.toFixed(0)}%`, gaugeX + 5, gaugeY);

        gaugeX += 110;
    });
}

function update() {
    updateMetrics();
    draw();

    const avg = Object.values(metrics).reduce((s, m) => s + m.value, 0) / 3;
    const status = avg > 80 ? '高負載' : avg > 50 ? '正常' : '低負載';
    infoEl.textContent = `系統狀態: ${status} (平均 ${avg.toFixed(1)}%)`;
}

draw();
setInterval(update, 1000);
