const chartContent = document.getElementById('chartContent');
const chart1Btn = document.getElementById('chart1');
const chart2Btn = document.getElementById('chart2');
const chart3Btn = document.getElementById('chart3');
const chart4Btn = document.getElementById('chart4');
const replayBtn = document.getElementById('replayBtn');

const buttons = [chart1Btn, chart2Btn, chart3Btn, chart4Btn];
let currentChart = 'bar';
let animationId = null;

const data = [60, 85, 45, 70, 55, 90, 40];
const colors = ['#667eea', '#764ba2', '#48dbfb', '#1dd1a1', '#feca57', '#ff6b6b', '#a78bfa'];

function clearChart() {
    chartContent.innerHTML = '';
    if (animationId) cancelAnimationFrame(animationId);
}

function drawBarChart() {
    clearChart();
    const barWidth = 18;
    const gap = 22;
    const startX = 40;

    data.forEach((value, i) => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', startX + i * gap);
        rect.setAttribute('y', 150);
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', 0);
        rect.setAttribute('fill', colors[i]);
        rect.setAttribute('rx', 3);
        chartContent.appendChild(rect);
    });

    let progress = 0;
    function animate() {
        progress += 2;
        const rects = chartContent.querySelectorAll('rect');
        rects.forEach((rect, i) => {
            const targetH = data[i];
            const delay = i * 5;
            const h = Math.min(targetH, Math.max(0, progress - delay));
            rect.setAttribute('height', h);
            rect.setAttribute('y', 150 - h);
        });
        if (progress < 150) {
            animationId = requestAnimationFrame(animate);
        }
    }
    animate();
}

function drawLineChart() {
    clearChart();
    const startX = 40;
    const gap = 22;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.classList.add('line-path');
    chartContent.appendChild(path);

    const dots = data.map((value, i) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', startX + i * gap + 9);
        circle.setAttribute('cy', 150 - value);
        circle.setAttribute('r', 0);
        circle.classList.add('chart-dot');
        chartContent.appendChild(circle);
        return circle;
    });

    let progress = 0;
    function animate() {
        progress += 3;
        let d = '';
        data.forEach((value, i) => {
            const x = startX + i * gap + 9;
            const targetY = 150 - value;
            const currentY = 150 - Math.min(value, Math.max(0, progress - i * 10));

            if (i === 0) d += `M${x},${currentY}`;
            else d += ` L${x},${currentY}`;

            if (progress > i * 10 + value) {
                dots[i].setAttribute('r', 4);
            }
        });
        path.setAttribute('d', d);

        if (progress < 200) {
            animationId = requestAnimationFrame(animate);
        }
    }
    animate();
}

function drawPieChart() {
    clearChart();
    const cx = 100, cy = 90, r = 60;
    const total = data.reduce((a, b) => a + b, 0);

    let currentAngle = -90;
    const slices = [];

    data.forEach((value, i) => {
        const angle = (value / total) * 360;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', colors[i]);
        path.classList.add('pie-slice');
        chartContent.appendChild(path);
        slices.push({ path, startAngle: currentAngle, angle });
        currentAngle += angle;
    });

    let progress = 0;
    function animate() {
        progress += 3;
        slices.forEach((slice, i) => {
            const delay = i * 15;
            const currentAngle = Math.min(slice.angle, Math.max(0, progress - delay));
            const startRad = (slice.startAngle * Math.PI) / 180;
            const endRad = ((slice.startAngle + currentAngle) * Math.PI) / 180;

            const x1 = cx + r * Math.cos(startRad);
            const y1 = cy + r * Math.sin(startRad);
            const x2 = cx + r * Math.cos(endRad);
            const y2 = cy + r * Math.sin(endRad);
            const largeArc = currentAngle > 180 ? 1 : 0;

            if (currentAngle > 0) {
                slice.path.setAttribute('d', `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`);
            }
        });

        if (progress < 500) {
            animationId = requestAnimationFrame(animate);
        }
    }
    animate();
}

function drawAreaChart() {
    clearChart();
    const startX = 40;
    const gap = 22;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.classList.add('area-path');
    chartContent.appendChild(path);

    let progress = 0;
    function animate() {
        progress += 3;
        let d = `M${startX},150`;
        data.forEach((value, i) => {
            const x = startX + i * gap + 9;
            const targetY = 150 - value;
            const currentY = 150 - Math.min(value, Math.max(0, progress - i * 10));
            d += ` L${x},${currentY}`;
        });
        d += ` L${startX + (data.length - 1) * gap + 9},150 Z`;
        path.setAttribute('d', d);

        if (progress < 200) {
            animationId = requestAnimationFrame(animate);
        }
    }
    animate();
}

function setChart(chartType, btn) {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentChart = chartType;

    switch(chartType) {
        case 'bar': drawBarChart(); break;
        case 'line': drawLineChart(); break;
        case 'pie': drawPieChart(); break;
        case 'area': drawAreaChart(); break;
    }
}

function replay() {
    const activeBtn = buttons.find(b => b.classList.contains('active'));
    setChart(currentChart, activeBtn);
}

chart1Btn.addEventListener('click', () => setChart('bar', chart1Btn));
chart2Btn.addEventListener('click', () => setChart('line', chart2Btn));
chart3Btn.addEventListener('click', () => setChart('pie', chart3Btn));
chart4Btn.addEventListener('click', () => setChart('area', chart4Btn));
replayBtn.addEventListener('click', replay);

// Initialize
setChart('bar', chart1Btn);
