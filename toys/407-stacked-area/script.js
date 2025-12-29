const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const legendEl = document.getElementById('legend');

const PADDING = 40;
const POINTS = 8;

const categories = [
    { name: '行動裝置', color: '#3498db' },
    { name: '桌面電腦', color: '#2ecc71' },
    { name: '平板電腦', color: '#f39c12' },
    { name: '其他', color: '#9b59b6' }
];

let data = categories.map(() => []);

function generateData() {
    data = categories.map(() => {
        const arr = [];
        for (let i = 0; i < POINTS; i++) {
            arr.push(Math.random() * 30 + 10);
        }
        return arr;
    });
}

function createLegend() {
    legendEl.innerHTML = '';
    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<div class="legend-color" style="background:${cat.color}"></div><span>${cat.name}</span>`;
        legendEl.appendChild(item);
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const chartWidth = canvas.width - PADDING * 2;
    const chartHeight = canvas.height - PADDING * 2;

    // Calculate stacked values
    const stacked = [];
    for (let i = 0; i < POINTS; i++) {
        let sum = 0;
        stacked[i] = data.map(series => {
            sum += series[i];
            return sum;
        });
    }

    const maxValue = Math.max(...stacked.map(s => s[s.length - 1]));

    // Draw areas (from top to bottom)
    for (let c = categories.length - 1; c >= 0; c--) {
        ctx.beginPath();
        ctx.moveTo(PADDING, canvas.height - PADDING);

        for (let i = 0; i < POINTS; i++) {
            const x = PADDING + (chartWidth / (POINTS - 1)) * i;
            const y = canvas.height - PADDING - (stacked[i][c] / maxValue) * chartHeight;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width - PADDING, canvas.height - PADDING);
        ctx.closePath();
        ctx.fillStyle = categories[c].color;
        ctx.fill();
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = PADDING + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(PADDING, y);
        ctx.lineTo(canvas.width - PADDING, y);
        ctx.stroke();
    }

    // Draw x-axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'];
    for (let i = 0; i < POINTS; i++) {
        const x = PADDING + (chartWidth / (POINTS - 1)) * i;
        ctx.fillText(months[i], x, canvas.height - 15);
    }
}

document.getElementById('randomize').addEventListener('click', () => {
    generateData();
    draw();
});

createLegend();
generateData();
draw();
