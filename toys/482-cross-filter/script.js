const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

// Sample data
const data = [];
const categories = ['A', 'B', 'C', 'D'];
const regions = ['北部', '中部', '南部'];

for (let i = 0; i < 100; i++) {
    data.push({
        category: categories[Math.floor(Math.random() * categories.length)],
        region: regions[Math.floor(Math.random() * regions.length)],
        value: Math.random() * 100
    });
}

let selectedCategory = null;
let selectedRegion = null;

function getFilteredData() {
    return data.filter(d => {
        if (selectedCategory && d.category !== selectedCategory) return false;
        if (selectedRegion && d.region !== selectedRegion) return false;
        return true;
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const filtered = getFilteredData();

    // Category bar chart (top left)
    drawBarChart(20, 30, 150, 120, 'category', categories, '類別分布');

    // Region pie chart (top right)
    drawPieChart(280, 90, 50, 'region', regions, '區域分布');

    // Value histogram (bottom)
    drawHistogram(20, 180, 320, 110, '數值分布');

    // Stats
    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`已選擇: ${filtered.length} / ${data.length} 筆資料`, canvas.width / 2, canvas.height - 10);
}

function drawBarChart(x, y, w, h, field, cats, title) {
    const filtered = getFilteredData();
    const counts = {};
    cats.forEach(c => counts[c] = 0);
    filtered.forEach(d => counts[d[field]]++);
    const maxCount = Math.max(...Object.values(counts), 1);

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(title, x, y - 10);

    const barWidth = w / cats.length - 10;
    cats.forEach((cat, i) => {
        const barX = x + i * (barWidth + 10);
        const barH = (counts[cat] / maxCount) * (h - 20);
        const isSelected = selectedCategory === cat;

        ctx.fillStyle = isSelected ? '#00ff88' : 'rgba(52,152,219,0.8)';
        ctx.fillRect(barX, y + h - 20 - barH, barWidth, barH);

        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(cat, barX + barWidth / 2, y + h - 5);
        ctx.fillText(counts[cat], barX + barWidth / 2, y + h - 25 - barH);
    });
}

function drawPieChart(cx, cy, r, field, cats, title) {
    const filtered = getFilteredData();
    const counts = {};
    cats.forEach(c => counts[c] = 0);
    filtered.forEach(d => counts[d[field]]++);
    const total = filtered.length || 1;

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, cx, cy - r - 15);

    const colors = ['#e74c3c', '#3498db', '#2ecc71'];
    let startAngle = -Math.PI / 2;

    cats.forEach((cat, i) => {
        const pct = counts[cat] / total;
        const endAngle = startAngle + pct * Math.PI * 2;
        const isSelected = selectedRegion === cat;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, isSelected ? r + 5 : r, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();

        // Label
        const midAngle = (startAngle + endAngle) / 2;
        const labelR = r + 20;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '9px Arial';
        ctx.fillText(cat, cx + Math.cos(midAngle) * labelR, cy + Math.sin(midAngle) * labelR);

        startAngle = endAngle;
    });
}

function drawHistogram(x, y, w, h, title) {
    const filtered = getFilteredData();
    const bins = new Array(10).fill(0);
    filtered.forEach(d => {
        const bin = Math.min(9, Math.floor(d.value / 10));
        bins[bin]++;
    });
    const maxBin = Math.max(...bins, 1);

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(title, x, y - 5);

    const barWidth = w / bins.length - 4;
    bins.forEach((count, i) => {
        const barX = x + i * (barWidth + 4);
        const barH = (count / maxBin) * (h - 25);

        ctx.fillStyle = 'rgba(155,89,182,0.8)';
        ctx.fillRect(barX, y + h - 20 - barH, barWidth, barH);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('0', x, y + h - 5);
    ctx.fillText('100', x + w, y + h - 5);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check bar chart clicks
    if (x >= 20 && x <= 170 && y >= 30 && y <= 150) {
        const barIndex = Math.floor((x - 20) / 37.5);
        if (barIndex >= 0 && barIndex < categories.length) {
            selectedCategory = selectedCategory === categories[barIndex] ? null : categories[barIndex];
        }
    }

    // Check pie chart clicks
    const dx = x - 280;
    const dy = y - 90;
    if (Math.sqrt(dx * dx + dy * dy) <= 55) {
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;
        const regionIndex = Math.floor(normalizedAngle / (Math.PI * 2 / 3));
        if (regionIndex >= 0 && regionIndex < regions.length) {
            selectedRegion = selectedRegion === regions[regionIndex] ? null : regions[regionIndex];
        }
    }

    draw();
    const filtered = getFilteredData();
    infoEl.textContent = `篩選結果: ${filtered.length} 筆資料`;
});

draw();
