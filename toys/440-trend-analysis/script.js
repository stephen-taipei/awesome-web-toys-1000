const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

// Historical data with some noise
const rawData = [];
for (let i = 0; i < 12; i++) {
    rawData.push(100 + i * 15 + (Math.random() - 0.5) * 40);
}

let mode = 'linear';
const chartLeft = 50;
const chartRight = canvas.width - 30;
const chartTop = 50;
const chartBottom = canvas.height - 50;
const chartWidth = chartRight - chartLeft;
const chartHeight = chartBottom - chartTop;
const maxVal = 350;

function linearRegression(data) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += data[i];
        sumXY += i * data[i];
        sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}

function movingAverage(data, window = 3) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        let sum = 0, count = 0;
        for (let j = Math.max(0, i - window + 1); j <= i; j++) {
            sum += data[j];
            count++;
        }
        result.push(sum / count);
    }
    return result;
}

function exponentialSmoothing(data, alpha = 0.3) {
    const result = [data[0]];
    for (let i = 1; i < data.length; i++) {
        result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
    }
    return result;
}

function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    const modeNames = { linear: '線性趨勢', exponential: '指數平滑', moving: '移動平均' };
    ctx.fillText(`銷售趨勢分析 - ${modeNames[mode]}`, canvas.width / 2, 25);

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
    for (let i = 0; i <= 4; i++) {
        ctx.fillText(Math.round(maxVal - i * (maxVal / 4)), chartLeft - 8, chartTop + (chartHeight / 4) * i + 4);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    for (let i = 0; i < 12; i++) {
        const x = chartLeft + (i / 11) * chartWidth;
        ctx.fillText(months[i], x, chartBottom + 15);
    }

    // Raw data points
    ctx.fillStyle = '#3498db';
    rawData.forEach((val, i) => {
        const x = chartLeft + (i / 11) * chartWidth;
        const y = chartBottom - (val / maxVal) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Trend line
    if (mode === 'linear') {
        const { slope, intercept } = linearRegression(rawData);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();

        for (let i = 0; i <= 14; i++) {
            const val = intercept + slope * i;
            const x = chartLeft + (i / 11) * chartWidth;
            const y = chartBottom - (val / maxVal) * chartHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Prediction area
        ctx.fillStyle = 'rgba(231, 76, 60, 0.2)';
        ctx.fillRect(chartLeft + chartWidth, chartTop, chartWidth * (2 / 11), chartHeight);

        infoEl.textContent = `斜率: ${slope.toFixed(2)} / 月`;
    } else if (mode === 'moving') {
        const smoothed = movingAverage(rawData, 3);
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 2;
        ctx.beginPath();
        smoothed.forEach((val, i) => {
            const x = chartLeft + (i / 11) * chartWidth;
            const y = chartBottom - (val / maxVal) * chartHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        infoEl.textContent = '3期移動平均線';
    } else {
        const smoothed = exponentialSmoothing(rawData, 0.3);
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 2;
        ctx.beginPath();
        smoothed.forEach((val, i) => {
            const x = chartLeft + (i / 11) * chartWidth;
            const y = chartBottom - (val / maxVal) * chartHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        infoEl.textContent = '指數平滑 (α=0.3)';
    }

    // Legend
    ctx.fillStyle = '#3498db';
    ctx.fillRect(chartLeft, canvas.height - 25, 12, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('實際數據', chartLeft + 16, canvas.height - 15);

    const trendColor = mode === 'linear' ? '#e74c3c' : (mode === 'moving' ? '#2ecc71' : '#f39c12');
    ctx.fillStyle = trendColor;
    ctx.fillRect(chartLeft + 100, canvas.height - 25, 12, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('趨勢線', chartLeft + 116, canvas.height - 15);
}

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.mode-btn.active').classList.remove('active');
        btn.classList.add('active');
        mode = btn.dataset.mode;
        draw();
    });
});

draw();
