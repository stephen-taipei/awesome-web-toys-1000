const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const toggleDimBtn = document.getElementById('toggleDimBtn');
const meterBtn = document.getElementById('meterBtn');
const feetBtn = document.getElementById('feetBtn');
const infoEl = document.getElementById('info');

let rotationY = 0.6;
let showDimensions = true;
let useMeters = true;

// Building dimensions in meters
const building = {
    width: 4,
    height: 3,
    depth: 3
};

function formatDimension(meters) {
    if (useMeters) {
        return `${meters.toFixed(1)}m`;
    } else {
        const feet = meters * 3.28084;
        return `${feet.toFixed(1)}ft`;
    }
}

function project(x, y, z) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(0.3);
    const sinX = Math.sin(0.3);

    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;
    let y1 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    const scale = 45 / (6 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 + 20 - y1 * scale,
        scale,
        z: z2
    };
}

function drawDimensionLine(p1, p2, dimension, offset, vertical = false) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < 10) return;

    // Perpendicular offset
    const nx = -dy / length * offset;
    const ny = dx / length * offset;

    const start = { x: p1.x + nx, y: p1.y + ny };
    const end = { x: p2.x + nx, y: p2.y + ny };

    // Extension lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(start.x, start.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.setLineDash([]);

    // Dimension line
    ctx.strokeStyle = '#0066cc';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Arrows
    const arrowSize = 6;
    const angle = Math.atan2(dy, dx);

    // Start arrow
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(start.x + arrowSize * Math.cos(angle - 0.4), start.y + arrowSize * Math.sin(angle - 0.4));
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(start.x + arrowSize * Math.cos(angle + 0.4), start.y + arrowSize * Math.sin(angle + 0.4));
    ctx.stroke();

    // End arrow
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - arrowSize * Math.cos(angle - 0.4), end.y - arrowSize * Math.sin(angle - 0.4));
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - arrowSize * Math.cos(angle + 0.4), end.y - arrowSize * Math.sin(angle + 0.4));
    ctx.stroke();

    // Label
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    const text = formatDimension(dimension);
    const textWidth = ctx.measureText(text).width;

    ctx.fillRect(midX - textWidth / 2 - 4, midY - 8, textWidth + 8, 16);

    ctx.fillStyle = '#0066cc';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, midX, midY);
}

function drawBox(x, y, z, w, h, d, color) {
    const hw = w / 2, hd = d / 2;

    const vertices = [
        project(x - hw, y, z - hd),
        project(x + hw, y, z - hd),
        project(x + hw, y, z + hd),
        project(x - hw, y, z + hd),
        project(x - hw, y + h, z - hd),
        project(x + hw, y + h, z - hd),
        project(x + hw, y + h, z + hd),
        project(x - hw, y + h, z + hd)
    ];

    const faces = [
        { verts: [0, 1, 5, 4], shade: 0.85 },
        { verts: [1, 2, 6, 5], shade: 0.7 },
        { verts: [2, 3, 7, 6], shade: 0.8 },
        { verts: [3, 0, 4, 7], shade: 0.75 },
        { verts: [4, 5, 6, 7], shade: 1.0 }
    ];

    faces.sort((a, b) => {
        const aZ = a.verts.reduce((s, v) => s + vertices[v].z, 0) / 4;
        const bZ = b.verts.reduce((s, v) => s + vertices[v].z, 0) / 4;
        return bZ - aZ;
    });

    faces.forEach(face => {
        const points = face.verts.map(i => vertices[i]);

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        ctx.fillStyle = `rgb(${Math.floor(color.r * face.shade)}, ${Math.floor(color.g * face.shade)}, ${Math.floor(color.b * face.shade)})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    return vertices;
}

function draw() {
    rotationY += 0.003;

    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid on floor
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    for (let i = -5; i <= 5; i++) {
        const p1 = project(i, 0, -5);
        const p2 = project(i, 0, 5);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const p3 = project(-5, 0, i);
        const p4 = project(5, 0, i);
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
    }

    // Building
    const hw = building.width / 2;
    const hd = building.depth / 2;
    const vertices = drawBox(0, 0, 0, building.width, building.height, building.depth, { r: 200, g: 180, b: 160 });

    // Dimensions
    if (showDimensions) {
        // Width dimension (front bottom edge)
        drawDimensionLine(vertices[0], vertices[1], building.width, 25);

        // Height dimension (front left edge)
        drawDimensionLine(vertices[0], vertices[4], building.height, -25, true);

        // Depth dimension (bottom left edge)
        drawDimensionLine(vertices[0], vertices[3], building.depth, 20);
    }

    requestAnimationFrame(draw);
}

toggleDimBtn.addEventListener('click', () => {
    showDimensions = !showDimensions;
    toggleDimBtn.classList.toggle('active', showDimensions);
    toggleDimBtn.textContent = showDimensions ? '顯示尺寸' : '隱藏尺寸';
});

meterBtn.addEventListener('click', () => {
    useMeters = true;
    meterBtn.classList.add('active');
    feetBtn.classList.remove('active');
    infoEl.textContent = '單位: 公尺';
});

feetBtn.addEventListener('click', () => {
    useMeters = false;
    feetBtn.classList.add('active');
    meterBtn.classList.remove('active');
    infoEl.textContent = '單位: 英尺';
});

draw();
