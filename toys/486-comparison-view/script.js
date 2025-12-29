const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');
const modeBtns = document.querySelectorAll('.mode-btn');

const metrics = ['品質', '價格', '服務', '速度', '設計'];
const dataA = { name: '產品 A', color: '#e74c3c', values: [85, 70, 90, 75, 80] };
const dataB = { name: '產品 B', color: '#3498db', values: [75, 85, 70, 90, 85] };

let mode = 'bar';

function drawBar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const chartLeft = 80;
    const chartRight = canvas.width - 20;
    const chartTop = 50;
    const chartBottom = canvas.height - 60;
    const barHeight = 25;
    const gap = 15;

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('產品比較 (長條圖)', canvas.width / 2, 25);

    metrics.forEach((metric, i) => {
        const y = chartTop + i * (barHeight * 2 + gap);

        // Metric label
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(metric, chartLeft - 10, y + barHeight);

        // Product A bar
        const widthA = (dataA.values[i] / 100) * (chartRight - chartLeft);
        ctx.fillStyle = dataA.color;
        ctx.fillRect(chartLeft, y, widthA, barHeight);
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(dataA.values[i], chartLeft + widthA + 5, y + 17);

        // Product B bar
        const widthB = (dataB.values[i] / 100) * (chartRight - chartLeft);
        ctx.fillStyle = dataB.color;
        ctx.fillRect(chartLeft, y + barHeight + 2, widthB, barHeight);
        ctx.fillText(dataB.values[i], chartLeft + widthB + 5, y + barHeight + 19);
    });

    // Legend
    ctx.textAlign = 'left';
    ctx.fillStyle = dataA.color;
    ctx.fillRect(100, canvas.height - 35, 15, 15);
    ctx.fillStyle = '#fff';
    ctx.fillText(dataA.name, 120, canvas.height - 23);

    ctx.fillStyle = dataB.color;
    ctx.fillRect(200, canvas.height - 35, 15, 15);
    ctx.fillStyle = '#fff';
    ctx.fillText(dataB.name, 220, canvas.height - 23);
}

function drawRadar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 100;

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('產品比較 (雷達圖)', cx, 25);

    // Draw grid
    for (let r = 0.2; r <= 1; r += 0.2) {
        ctx.beginPath();
        for (let i = 0; i <= metrics.length; i++) {
            const angle = (i / metrics.length) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius * r;
            const y = cy + Math.sin(angle) * radius * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.stroke();
    }

    // Draw axes and labels
    metrics.forEach((metric, i) => {
        const angle = (i / metrics.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(metric, cx + Math.cos(angle) * (radius + 20), cy + Math.sin(angle) * (radius + 20));
    });

    // Draw data
    [dataA, dataB].forEach(data => {
        ctx.beginPath();
        data.values.forEach((v, i) => {
            const angle = (i / metrics.length) * Math.PI * 2 - Math.PI / 2;
            const r = (v / 100) * radius;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = data.color + '44';
        ctx.fill();
        ctx.strokeStyle = data.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Legend
    ctx.textAlign = 'left';
    ctx.fillStyle = dataA.color;
    ctx.fillRect(100, canvas.height - 35, 15, 15);
    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(dataA.name, 120, canvas.height - 23);

    ctx.fillStyle = dataB.color;
    ctx.fillRect(200, canvas.height - 35, 15, 15);
    ctx.fillStyle = '#fff';
    ctx.fillText(dataB.name, 220, canvas.height - 23);
}

function draw() {
    if (mode === 'bar') drawBar();
    else drawRadar();

    const avgA = dataA.values.reduce((s, v) => s + v, 0) / dataA.values.length;
    const avgB = dataB.values.reduce((s, v) => s + v, 0) / dataB.values.length;
    infoEl.textContent = `平均分: ${dataA.name} ${avgA.toFixed(1)} | ${dataB.name} ${avgB.toFixed(1)}`;
}

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mode = btn.dataset.mode;
        draw();
    });
});

draw();
