const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const traffic = {
    incoming: { data: [], color: '#00ff88', label: '下載' },
    outgoing: { data: [], color: '#ff6b6b', label: '上傳' }
};

const maxPoints = 60;
let totalIn = 0;
let totalOut = 0;

// Initialize with random data
for (let i = 0; i < maxPoints; i++) {
    traffic.incoming.data.push(Math.random() * 50 + 10);
    traffic.outgoing.data.push(Math.random() * 30 + 5);
}

function updateTraffic() {
    const inRate = Math.random() * 80 + 20;
    const outRate = Math.random() * 40 + 10;

    traffic.incoming.data.push(inRate);
    traffic.outgoing.data.push(outRate);

    if (traffic.incoming.data.length > maxPoints) traffic.incoming.data.shift();
    if (traffic.outgoing.data.length > maxPoints) traffic.outgoing.data.shift();

    totalIn += inRate / 10;
    totalOut += outRate / 10;
}

function formatBytes(mb) {
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const chartLeft = 50;
    const chartRight = canvas.width - 20;
    const chartTop = 50;
    const chartBottom = canvas.height - 50;

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('網路流量監控', canvas.width / 2, 25);

    // Find max
    const allData = [...traffic.incoming.data, ...traffic.outgoing.data];
    const maxValue = Math.max(...allData) * 1.2;

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
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
        const val = maxValue - (maxValue * i / 4);
        ctx.fillText(`${val.toFixed(0)} Mbps`, chartLeft - 5, y + 3);
    }

    // Draw areas and lines
    Object.values(traffic).forEach(t => {
        // Area
        ctx.beginPath();
        ctx.moveTo(chartLeft, chartBottom);
        t.data.forEach((v, i) => {
            const x = chartLeft + (i / (maxPoints - 1)) * (chartRight - chartLeft);
            const y = chartBottom - (v / maxValue) * (chartBottom - chartTop);
            ctx.lineTo(x, y);
        });
        ctx.lineTo(chartRight, chartBottom);
        ctx.closePath();
        ctx.fillStyle = t.color + '33';
        ctx.fill();

        // Line
        ctx.beginPath();
        t.data.forEach((v, i) => {
            const x = chartLeft + (i / (maxPoints - 1)) * (chartRight - chartLeft);
            const y = chartBottom - (v / maxValue) * (chartBottom - chartTop);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Legend and current values
    ctx.textAlign = 'left';
    const inCurrent = traffic.incoming.data[traffic.incoming.data.length - 1];
    const outCurrent = traffic.outgoing.data[traffic.outgoing.data.length - 1];

    ctx.fillStyle = traffic.incoming.color;
    ctx.fillRect(chartLeft, canvas.height - 35, 12, 12);
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText(`下載: ${inCurrent.toFixed(1)} Mbps`, chartLeft + 18, canvas.height - 25);

    ctx.fillStyle = traffic.outgoing.color;
    ctx.fillRect(chartLeft + 130, canvas.height - 35, 12, 12);
    ctx.fillStyle = '#fff';
    ctx.fillText(`上傳: ${outCurrent.toFixed(1)} Mbps`, chartLeft + 148, canvas.height - 25);
}

function update() {
    updateTraffic();
    draw();
    infoEl.textContent = `總計 - 下載: ${formatBytes(totalIn)} / 上傳: ${formatBytes(totalOut)}`;
}

draw();
setInterval(update, 500);
