const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const patterns = {
    weekly: {
        labels: ['一', '二', '三', '四', '五', '六', '日'],
        data: [65, 70, 68, 72, 85, 95, 60],
        title: '每週流量模式',
        color: '#e74c3c'
    },
    monthly: {
        labels: ['1W', '2W', '3W', '4W'],
        data: [80, 65, 55, 90],
        title: '每月消費模式',
        color: '#3498db'
    },
    yearly: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        data: [60, 75, 90, 100],
        title: '年度銷售模式',
        color: '#2ecc71'
    }
};

let currentPattern = 'weekly';
let animProgress = 0;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pattern = patterns[currentPattern];
    const data = pattern.data;
    const labels = pattern.labels;
    const count = data.length;

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(pattern.title, canvas.width / 2, 25);

    const chartLeft = 50;
    const chartRight = canvas.width - 30;
    const chartTop = 50;
    const chartBottom = canvas.height - 50;
    const chartWidth = chartRight - chartLeft;
    const chartHeight = chartBottom - chartTop;
    const barWidth = chartWidth / count * 0.7;
    const gap = chartWidth / count * 0.3;

    // Y-axis grid
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
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
    for (let i = 0; i <= 4; i++) {
        ctx.fillText(100 - i * 25, chartLeft - 8, chartTop + (chartHeight / 4) * i + 4);
    }

    // Bars
    data.forEach((value, i) => {
        const x = chartLeft + (chartWidth / count) * i + gap / 2;
        const animValue = value * Math.min(animProgress, 1);
        const barHeight = (animValue / 100) * chartHeight;
        const y = chartBottom - barHeight;

        // Bar
        const gradient = ctx.createLinearGradient(x, y, x, chartBottom);
        gradient.addColorStop(0, pattern.color);
        gradient.addColorStop(1, `${pattern.color}44`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
        ctx.fill();

        // Value label
        if (animProgress >= 1) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value, x + barWidth / 2, y - 8);
        }

        // X-axis label
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '11px Arial';
        ctx.fillText(labels[i], x + barWidth / 2, chartBottom + 20);
    });

    // Average line
    if (animProgress >= 1) {
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const avgY = chartBottom - (avg / 100) * chartHeight;

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(chartLeft, avgY);
        ctx.lineTo(chartRight, avgY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`平均: ${avg.toFixed(0)}`, chartRight - 50, avgY - 5);
    }
}

function animate() {
    if (animProgress < 1) {
        animProgress += 0.05;
        draw();
        requestAnimationFrame(animate);
    } else {
        draw();
    }
}

document.querySelectorAll('.pattern-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.pattern-btn.active').classList.remove('active');
        btn.classList.add('active');
        currentPattern = btn.dataset.pattern;
        animProgress = 0;
        infoEl.textContent = patterns[currentPattern].title;
        animate();
    });
});

animate();
