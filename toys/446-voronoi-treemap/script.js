const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

// Simplified Voronoi-like polygons for demo
const regions = [
    { name: '電商', value: 35, color: '#e74c3c', points: [
        [30, 50], [150, 40], [180, 120], [140, 180], [40, 160]
    ]},
    { name: '金融', value: 25, color: '#3498db', points: [
        [150, 40], [280, 50], [300, 130], [250, 180], [180, 120]
    ]},
    { name: '遊戲', value: 20, color: '#2ecc71', points: [
        [40, 160], [140, 180], [160, 240], [60, 250]
    ]},
    { name: '社群', value: 15, color: '#f39c12', points: [
        [140, 180], [250, 180], [280, 230], [160, 240]
    ]},
    { name: '教育', value: 5, color: '#9b59b6', points: [
        [300, 130], [330, 140], [330, 220], [280, 230], [250, 180]
    ]}
];

let hoverRegion = null;

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

function getCentroid(polygon) {
    let x = 0, y = 0;
    polygon.forEach(p => { x += p[0]; y += p[1]; });
    return [x / polygon.length, y / polygon.length];
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('產業投資分布 (泰森多邊形)', canvas.width / 2, 25);

    regions.forEach(region => {
        const isHover = hoverRegion === region;

        // Draw polygon
        ctx.beginPath();
        ctx.moveTo(region.points[0][0], region.points[0][1]);
        region.points.forEach(p => ctx.lineTo(p[0], p[1]));
        ctx.closePath();

        ctx.fillStyle = isHover ? region.color : `${region.color}cc`;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = isHover ? 3 : 2;
        ctx.stroke();

        // Label
        const [cx, cy] = getCentroid(region.points);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(region.name, cx, cy - 5);
        ctx.font = '11px Arial';
        ctx.fillText(`${region.value}%`, cx, cy + 12);
    });

    // Legend at bottom
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('區域大小代表投資比例', canvas.width / 2, canvas.height - 10);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoverRegion = null;
    for (const region of regions) {
        if (isPointInPolygon(x, y, region.points)) {
            hoverRegion = region;
            break;
        }
    }

    canvas.style.cursor = hoverRegion ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverRegion) {
        infoEl.textContent = `${hoverRegion.name}產業: 佔比 ${hoverRegion.value}%`;
    }
});

draw();
