const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');
const legendEl = document.getElementById('legend');

const regions = [
    { name: '北區', path: [[50, 30], [150, 30], [150, 100], [50, 100]], value: 0 },
    { name: '東區', path: [[170, 30], [310, 30], [310, 100], [170, 100]], value: 0 },
    { name: '中區', path: [[50, 120], [150, 120], [150, 180], [50, 180]], value: 0 },
    { name: '西區', path: [[170, 120], [310, 120], [310, 180], [170, 180]], value: 0 },
    { name: '南區', path: [[110, 200], [250, 200], [250, 260], [110, 260]], value: 0 }
];

const colorScale = ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'];

function generateData() {
    regions.forEach(r => {
        r.value = Math.floor(Math.random() * 100);
    });
}

function getColor(value) {
    const index = Math.min(4, Math.floor(value / 20));
    return colorScale[index];
}

function createLegend() {
    legendEl.innerHTML = '';
    colorScale.forEach((color, i) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.style.background = color;
        item.title = `${i * 20}-${(i + 1) * 20}`;
        legendEl.appendChild(item);
    });
}

function isPointInPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

function draw(hoveredRegion = null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    regions.forEach(region => {
        ctx.beginPath();
        region.path.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point[0], point[1]);
            else ctx.lineTo(point[0], point[1]);
        });
        ctx.closePath();

        ctx.fillStyle = getColor(region.value);
        ctx.fill();

        ctx.strokeStyle = region === hoveredRegion ? '#fff' : 'rgba(255,255,255,0.5)';
        ctx.lineWidth = region === hoveredRegion ? 3 : 1;
        ctx.stroke();

        // Label
        const cx = region.path.reduce((s, p) => s + p[0], 0) / region.path.length;
        const cy = region.path.reduce((s, p) => s + p[1], 0) / region.path.length;
        ctx.fillStyle = region.value > 60 ? '#fff' : '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(region.name, cx, cy - 8);
        ctx.font = '12px Arial';
        ctx.fillText(region.value, cx, cy + 10);
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let hovered = null;
    regions.forEach(region => {
        if (isPointInPolygon(x, y, region.path)) {
            hovered = region;
        }
    });

    if (hovered) {
        infoEl.textContent = `${hovered.name}: ${hovered.value} (人口密度指數)`;
    } else {
        infoEl.textContent = '懸停查看數值';
    }

    draw(hovered);
});

document.getElementById('randomize').addEventListener('click', () => {
    generateData();
    draw();
});

createLegend();
generateData();
draw();
