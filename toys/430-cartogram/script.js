const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const regions = [
    { name: '北區', baseX: 120, baseY: 80, population: 80, gdp: 90, area: 30, color: '#3498db' },
    { name: '東區', baseX: 240, baseY: 80, population: 40, gdp: 60, area: 50, color: '#e74c3c' },
    { name: '中區', baseX: 120, baseY: 160, population: 60, gdp: 70, area: 40, color: '#2ecc71' },
    { name: '西區', baseX: 240, baseY: 160, population: 50, gdp: 80, area: 35, color: '#f39c12' },
    { name: '南區', baseX: 180, baseY: 240, population: 70, gdp: 50, area: 60, color: '#9b59b6' }
];

let currentData = 'population';
let currentSizes = regions.map(() => 40);
let targetSizes = regions.map(r => r[currentData] * 0.8);

const dataLabels = {
    population: '人口',
    gdp: 'GDP',
    area: '面積'
};

function animate() {
    let moving = false;
    regions.forEach((r, i) => {
        const diff = targetSizes[i] - currentSizes[i];
        if (Math.abs(diff) > 0.5) {
            currentSizes[i] += diff * 0.1;
            moving = true;
        }
    });

    draw();
    if (moving) requestAnimationFrame(animate);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw regions as circles with size based on data
    regions.forEach((region, i) => {
        const size = currentSizes[i];

        // Circle
        ctx.beginPath();
        ctx.arc(region.baseX, region.baseY, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = region.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(region.name, region.baseX, region.baseY - 5);
        ctx.font = '10px Arial';
        ctx.fillText(region[currentData], region.baseX, region.baseY + 10);
    });

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`顯示: ${dataLabels[currentData]}`, 20, canvas.height - 15);
}

document.querySelectorAll('.data-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.data-btn.active').classList.remove('active');
        btn.classList.add('active');
        currentData = btn.dataset.type;
        targetSizes = regions.map(r => r[currentData] * 0.8);
        infoEl.textContent = `區域大小依${dataLabels[currentData]}比例變形`;
        animate();
    });
});

draw();
